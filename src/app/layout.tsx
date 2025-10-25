import "@/app/globals.css";
import Navbar from "@/components/shared/navbar";
import { Toaster } from "sonner";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gradient-to-b from-purple-300 to-purple-500 text-white min-h-screen">
        <Navbar />
        <main>{children}</main>
        <Toaster />
      </body>
    </html>
  );
}
