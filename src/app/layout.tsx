import { DM_Sans } from "next/font/google";
import "./globals.css";
import { ServicesProvider } from "@/contexts/ServicesContext";
import { AuthProvider } from "@/contexts/AuthContext";
import QueryProvider from "@/providers/QueryProvider";

const font = DM_Sans({ subsets: ["latin"] });

export const metadata = {
  title: "Backadmin - Lusio Cidadania",
  description: "Gestão de pedidos de cidadania",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-PT">
      <body className={`${font.className} antialiased`}>
        <QueryProvider>
          <AuthProvider>
            <ServicesProvider>
              {children}
            </ServicesProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
