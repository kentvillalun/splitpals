import prisma from "@/app/lib/prisma.js";

export const checkUsername = async (username) => {
  try {
    const isExist = await prisma.user.findUnique({
      where: { username },
    });

    if (!isExist) {
      return false;
    }
  } catch (error) {
    throw error;
  }

  return true;
};
