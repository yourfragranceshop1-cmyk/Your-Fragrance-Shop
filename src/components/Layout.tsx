import type { ReactNode } from "react";
import { useLocation } from "@tanstack/react-router";
import { Header, Breadcrumbs } from "./Header";
import { Footer } from "./Footer";
import { WhatsappFab } from "./WhatsappFab";
import { SmoothScroll } from "./SmoothScroll";

export function Layout({ children }: { children: ReactNode }) {
  const location = useLocation();
  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden">
      <SmoothScroll />
      <Header />
      <Breadcrumbs />
      <main key={location.pathname} className="flex-1 animate-in fade-in duration-500 overflow-x-hidden">
        {children}
      </main>
      <Footer />
      <WhatsappFab />
    </div>
  );
}
