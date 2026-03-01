import "@/app/globals.css";
import Navbar from "@/components/shared/navbar";
import { ThemeProvider } from "@/components/shared/theme-provider";
import { SocketProvider } from "@/lib/socket/socket-provider";
import { Toaster } from "sonner";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className="flex min-h-screen flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SocketProvider>
            <Navbar />
            <main className="flex grow flex-col">{children}</main>
            <Toaster />
          </SocketProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
