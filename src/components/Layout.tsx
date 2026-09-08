import type { ReactNode } from "react";
import { useLocation } from "@tanstack/react-router";
import { Header, Breadcrumbs } from "./Header";
import { Footer } from "./Footer";
import { WhatsappFab } from "./WhatsappFab";

interface LayoutProps {
  children: ReactNode;
  /** Override the last breadcrumb label (e.g. product name on product detail pages) */
  breadcrumbLabel?: string;
}

export function Layout({ children, breadcrumbLabel }: LayoutProps) {
  const location = useLocation();
  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden">
      <Header />
      <Breadcrumbs lastLabel={breadcrumbLabel} />
      <main key={location.pathname} className="flex-1 animate-in fade-in duration-500 overflow-x-hidden">
        {children}
      </main>
      <Footer />
      <WhatsappFab />
    </div>
  );
}
