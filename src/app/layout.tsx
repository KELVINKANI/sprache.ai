import "@/styles/globals.css";

import { Raleway } from "next/font/google";
import { Toaster } from "sonner";

const ralway = Raleway({ subsets: ["latin"], variable: "--font-ralway" });

export const metadata = {
  title: "Sprache",
  description: "Learning German with AI",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${ralway.variable}`}>
      <body>{children}</body>
      <Toaster />
    </html>
  );
}
