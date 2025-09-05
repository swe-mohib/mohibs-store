import type { Metadata } from "next";
import { Urbanist } from "next/font/google";
import "./globals.css";
import Footer from "@/components/footer";
import Navbar from "@/components/navbar";
import ModalProvider from "@/provider/modal-provider";
import ToastProvider from "@/provider/toast-provider";

const font = Urbanist({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MOHIBS STORE",
  description:
    "Your go-to shop for quality products at great value, made for everyday convenience.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${font.className}`}>
        <ModalProvider />
        <ToastProvider />
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
