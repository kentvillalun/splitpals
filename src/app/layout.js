import { Geist, Geist_Mono, Baloo_2, Plus_Jakarta_Sans, Courier_Prime } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const baloo = Baloo_2({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-baloo',
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-jakarta',
});

const courier = Courier_Prime({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-courier',
});


export const metadata = {
  title: "SplitPals",
  description:
    "A PWA for splitting bills with friends. Track who ordered what, calculate each person's share, and share a clean receipt summary instantly.",
};

export const viewport = {
  userScalable: false,
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${baloo.variable} ${jakarta.variable} ${courier.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col overflow-hidden">
        <Toaster position="top"/>
        {children}
      </body>
    </html>
  );
}
