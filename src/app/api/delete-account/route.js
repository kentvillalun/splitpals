import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      { cookies: { getAll: () => cookieStore.getAll() } },
    );

    const {
      data: { user },
      error: getUserError,
    } = await supabase.auth.getUser();
    if (!user) {
      console.error("Delete-account: no authenticated user found", {
        getUserError,
      });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Service-role client — never exposed to the browser. Only this key can
    // call the admin API to actually delete the auth user; the FK constraints
    // on bills/profiles/contacts/scan_limits (and the null-out on
    // persons.user_id) handle the rest of the cascade, so this route doesn't
    // do any manual cleanup itself.
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { autoRefreshToken: false, persistSession: false } },
    );

    const { data: deleteData, error } = await supabaseAdmin.auth.admin.deleteUser(
      user.id,
    );

    if (error) {
      console.error("Delete-account: admin.deleteUser() returned an error", {
        userId: user.id,
        name: error.name,
        message: error.message,
        status: error.status,
        code: error.code,
        error,
      });
      return NextResponse.json(
        { error: "Couldn't delete your account. Please try again." },
        { status: 500 },
      );
    }

    console.log("Delete-account: admin.deleteUser() succeeded", {
      userId: user.id,
      deleteData,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    // console.error("Delete-account: unexpected exception in route handler", err);
    return NextResponse.json(
      { error: "Couldn't delete your account. Please try again." },
      { status: 500 },
    );
  }
}
