import { createFileRoute } from "@tanstack/react-router";
import { MessageCircle, Instagram, ArrowUpRight } from "lucide-react";
import { Layout } from "@/components/Layout";
import { INSTAGRAM_URL, TIKTOK_URL, WHATSAPP_URL } from "@/lib/whatsapp";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Your Fragrance Shop" },
      { name: "description", content: "Contactez Your Fragrance Shop directement sur WhatsApp." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <Layout>
      <section className="container-edit py-24 text-center max-w-xl">
        <p className="text-[11px] uppercase tracking-[0.3em] text-gold mb-4">Contact</p>
        <h1 className="font-display text-5xl md:text-6xl mb-6">Restons en contact</h1>
        <p className="text-muted-foreground mb-12">Contactez-nous directement sur WhatsApp pour toute question, conseil ou commande.</p>

        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-3 bg-whatsapp text-white px-8 py-4 text-xs uppercase tracking-[0.2em] hover:opacity-90 animate-fade-in"
        >
          <MessageCircle className="h-5 w-5" /> Discuter sur WhatsApp
        </a>

        <div className="mt-16 flex justify-center gap-8 text-muted-foreground text-sm">
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 hover:text-foreground transition-colors group"
          >
            <Instagram className="h-4 w-4 shrink-0" />
            <span className="underline underline-offset-4 decoration-muted-foreground/30 group-hover:decoration-foreground transition-colors">
              Instagram
            </span>
            <ArrowUpRight className="h-3.5 w-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
          </a>
          
          <a
            href={TIKTOK_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 hover:text-foreground transition-colors group"
          >
            <svg className="h-4 w-4 fill-current shrink-0" viewBox="0 0 24 24">
              <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.02 1.59 4.23.85.95 2 1.62 3.25 1.93v3.91c-1.39-.16-2.68-.73-3.69-1.67-.18-.17-.35-.35-.51-.54v7.07c.06 1.7-.37 3.41-1.25 4.83-.87 1.28-2.2 2.25-3.69 2.69-1.63.5-3.41.44-5-.18-1.58-.59-2.92-1.78-3.69-3.32-.87-1.58-1.12-3.48-.68-5.23.4-1.62 1.39-3.07 2.76-4.04 1.48-1.09 3.39-1.57 5.23-1.37.08-1.39.04-2.79.05-4.19-.94-.03-1.89-.04-2.82.09-2.18.23-4.22 1.34-5.55 3.12-1.39 1.77-1.92 4.14-1.48 6.36.43 2.28 1.83 4.3 3.86 5.41 1.95 1.13 4.33 1.35 6.44.62 2.06-.65 3.73-2.24 4.47-4.25.43-1.07.57-2.23.57-3.37V5.27c-.82.52-1.72.91-2.67 1.14-.94.25-1.93.3-2.9.15V.02Z"/>
            </svg>
            <span className="underline underline-offset-4 decoration-muted-foreground/30 group-hover:decoration-foreground transition-colors">
              TikTok
            </span>
            <ArrowUpRight className="h-3.5 w-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
          </a>
        </div>
      </section>
    </Layout>
  );
}
