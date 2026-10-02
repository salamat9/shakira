import type { Metadata } from "next";
import Link from "next/link";
import { EVENT } from "@/lib/config";
import "./globals.css";

export const metadata: Metadata = {
  title: `Попутчики на ${EVENT.title}`,
  description: `Найди машину до арены «${EVENT.arena}» и обратно или возьми попутчиков из своего города.`,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ru" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <header className="border-b border-stone-200 bg-white/80 backdrop-blur">
          <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-3">
            <Link href="/" className="text-lg font-bold tracking-tight">
              🚗 <span className="text-fuchsia-600">{EVENT.artist}</span> Попутчики
            </Link>
            <Link href="/rides/new" className="btn-primary px-4 py-2 text-sm">
              Я водитель
            </Link>
          </div>
        </header>
        <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-6">{children}</main>
        <footer className="border-t border-stone-200 py-6 text-center text-sm text-stone-500">
          Сервис только помогает найти друг друга. Договаривайтесь о деталях напрямую.
        </footer>
      </body>
    </html>
  );
}
