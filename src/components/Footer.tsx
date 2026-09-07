import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { INSTAGRAM_URL, TIKTOK_URL, WHATSAPP_URL } from "@/lib/whatsapp";

export function Footer() {
  return (
    <footer className="mt-0 border-t border-border bg-secondary/40">
      <div className="container-edit py-16 grid gap-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo />
          <p className="mt-4 max-w-sm text-sm text-muted-foreground leading-relaxed">
            De bonnes senteurs pour tous les budgets. Une sélection de parfums accessibles, livrés rapidement via WhatsApp.
          </p>
        </div>
        <div>
          <h4 className="font-display text-sm uppercase tracking-[0.2em] mb-4 text-foreground">Boutique</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/catalogue" className="hover:text-foreground">Tous les parfums</Link></li>
            <li><Link to="/catalogue" search={{ category: "femme" }}  className="hover:text-foreground">Femme</Link></li>
            <li><Link to="/catalogue" search={{ category: "homme" }} className="hover:text-foreground">Homme</Link></li>
            <li><Link to="/catalogue" search={{ category: "unisexe" }} className="hover:text-foreground">Unisexe</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-display text-sm uppercase tracking-[0.2em] mb-4 text-foreground">Contact</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="hover:text-foreground">WhatsApp</a></li>
            <li><a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" className="hover:text-foreground">Instagram</a></li>
            <li><a href={TIKTOK_URL} target="_blank" rel="noreferrer" className="hover:text-foreground">TikTok</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="container-edit py-6 text-xs text-muted-foreground flex justify-between">
          <span className="font-display">© {new Date().getFullYear()} Your Fragrance Shop</span>
          <span className="font-display tracking-[0.2em] uppercase">Eau de Parfum</span>
        </div>
      </div>
    </footer>
  );
}
