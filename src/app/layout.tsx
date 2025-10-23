import { DM_Sans } from "next/font/google";
import "./globals.css";
import { ServicesProvider } from "@/contexts/ServicesContext";

const font = DM_Sans({ subsets: ["latin"] });

export const metadata = {
  title: "Backadmin - Lusio Cidadania",
  description: "Gestão de pedidos de cidadania",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-PT">
      <body className={`${font.className} antialiased`}>
        <ServicesProvider>
          {children}
        </ServicesProvider>
      </body>
    </html>
  );
}
