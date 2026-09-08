import { Link, useLocation } from "@tanstack/react-router";
import { Heart, Menu, Moon, Search, ShoppingBag, Sun, User, X } from "lucide-react";
import { useState } from "react";
import logo from "@/assets/logo.png";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useFavorites } from "@/contexts/FavoritesContext";

const NAV = [
  { to: "/", label: "Accueil" },
  { to: "/catalogue", label: "Catalogue" },
  { to: "/about", label: "À propos" },
  { to: "/contact", label: "Contact" },
] as const;

// Shared visual style for the 3 floating modules
const islandBase =
  "bg-black/55 dark:bg-black/60 backdrop-blur-md border border-white/10 text-white shadow-[0_8px_30px_rgba(0,0,0,0.25)]";

export function Header() {
  const { count } = useCart();
  const { user, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { ids: favIds } = useFavorites();
  const favCount = favIds.size;
  const [open, setOpen] = useState(false);
  const isDark = theme === "dark";

  const iconBtn =
    "inline-flex h-9 w-9 items-center justify-center rounded-full text-white/85 hover:text-white transition-colors";
  const iconBtnMobile =
    "inline-flex h-8 w-8 items-center justify-center rounded-full text-white/85 hover:text-white transition-colors";

  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-40 pt-3 sm:pt-5">
        {/* Mobile Navigation (Logo extreme left, actions pill + burger extreme right) */}
        <div className="container-edit flex sm:hidden items-center justify-between gap-1 px-3">
          {/* Extreme Left — Logo circle */}
          <Link
            to="/"
            aria-label="Your Fragrance Shop"
            className={`${islandBase} h-11 w-11 rounded-full inline-flex items-center justify-center overflow-hidden shrink-0 p-0`}
          >
            <img src={logo} alt="Your Fragrance Shop Logo" className="h-11 w-11 object-cover rounded-full shrink-0" />
          </Link>

          {/* Extreme Right — Actions Pill followed by Burger Circle */}
          <div className="flex items-center gap-1">
            {/* Actions Pill */}
            <div className={`${islandBase} h-11 rounded-full px-1 flex items-center gap-0 shrink-0`}>
              <Link to="/catalogue" search={{ focus: true } as any} aria-label="Recherche" className={iconBtnMobile}>
                <Search className="h-[17px] w-[17px]" />
              </Link>
              <Link to={user ? "/favoris" : "/login"} aria-label="Favoris" className={`${iconBtnMobile} relative`}>
                <Heart className="h-[17px] w-[17px]" />
                {favCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-3.5 min-w-[14px] px-0.5 rounded-full bg-gold text-gold-foreground text-[8px] font-semibold flex items-center justify-center">
                    {favCount}
                  </span>
                )}
              </Link>
              <button
                onClick={toggleTheme}
                aria-label={isDark ? "Thème clair" : "Thème sombre"}
                className={iconBtnMobile}
              >
                {isDark ? <Sun className="h-[17px] w-[17px]" /> : <Moon className="h-[17px] w-[17px]" />}
              </button>
              <Link to="/panier" aria-label="Panier" className={`${iconBtnMobile} relative`}>
                <ShoppingBag className="h-[17px] w-[17px]" />
                {count > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-3.5 min-w-[14px] px-0.5 rounded-full bg-gold text-gold-foreground text-[8px] font-semibold flex items-center justify-center">
                    {count}
                  </span>
                )}
              </Link>
              <Link to="/login" aria-label="Compte" className={iconBtnMobile}>
                <User className="h-[17px] w-[17px]" />
              </Link>
            </div>

            {/* Burger Circle */}
            <button
              onClick={() => setOpen((v) => !v)}
              aria-label="Menu"
              className={`${islandBase} h-11 w-11 rounded-full inline-flex items-center justify-center shrink-0`}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Desktop & Tablet Navigation (Original layout retained) */}
        <div className="container-edit hidden sm:flex items-center justify-between gap-3">
          {/* Left — Burger circle */}
          <div className="flex-1 flex justify-start">
            <button
              onClick={() => setOpen((v) => !v)}
              aria-label="Menu"
              className={`${islandBase} h-12 w-12 rounded-full inline-flex items-center justify-center shrink-0`}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          {/* Center — Logo pill with brand text */}
          <Link
            to="/"
            aria-label="Your Fragrance Shop"
            className={`${islandBase} h-12 sm:w-auto rounded-full inline-flex items-center sm:justify-start overflow-hidden shrink-0 pl-1.5 pr-4 gap-2.5`}
          >
            <img src={logo} alt="Your Fragrance Shop Logo" className="h-9 w-9 object-cover rounded-full shrink-0" />
            <span className="text-xs font-semibold tracking-[0.2em] uppercase text-white/90 whitespace-nowrap font-display">
              Your Fragrance Shop
            </span>
          </Link>

          {/* Right — Actions pill */}
          <div className="flex-1 flex justify-end">
            <div className={`${islandBase} h-12 rounded-full px-1.5 flex items-center gap-0.5 shrink-0`}>
              <Link to="/catalogue" search={{ focus: true } as any} aria-label="Recherche" className={iconBtn}>
                <Search className="h-[18px] w-[18px]" />
              </Link>
              <Link to={user ? "/favoris" : "/login"} aria-label="Favoris" className={`${iconBtn} relative`}>
                <Heart className="h-[18px] w-[18px]" />
                {favCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 rounded-full bg-gold text-gold-foreground text-[10px] font-semibold flex items-center justify-center">
                    {favCount}
                  </span>
                )}
              </Link>
              <button
                onClick={toggleTheme}
                aria-label={isDark ? "Thème clair" : "Thème sombre"}
                className={iconBtn}
              >
                {isDark ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
              </button>
              <Link to="/panier" aria-label="Panier" className={`${iconBtn} relative`}>
                <ShoppingBag className="h-[18px] w-[18px]" />
                {count > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 rounded-full bg-gold text-gold-foreground text-[10px] font-semibold flex items-center justify-center">
                    {count}
                  </span>
                )}
              </Link>
              <Link to="/login" aria-label="Compte" className={iconBtn}>
                <User className="h-[18px] w-[18px]" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Spacer so content isn't hidden under floating bar (only on non-home pages) */}
      {!isHome && <div aria-hidden className="h-[72px] sm:h-[88px]" />}

      {/* Slide-down nav drawer */}
      {open && (
        <>
          <div
            className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <nav className="fixed top-[76px] sm:top-[92px] left-3 right-3 sm:left-6 sm:right-6 z-40 rounded-2xl bg-black/70 backdrop-blur-md border border-white/10 text-white p-4 shadow-2xl">
            <ul className="flex flex-col gap-1 text-sm tracking-[0.18em] uppercase">
              {NAV.map((n) => (
                <li key={n.to}>
                  <Link
                    to={n.to}
                    onClick={() => setOpen(false)}
                    className="block py-2 px-2 rounded hover:bg-white/10"
                    activeProps={{ className: "block py-2 px-2 rounded bg-white/10 text-gold" }}
                  >
                    {n.label}
                  </Link>
                </li>
              ))}
              {isAdmin && (
                <li>
                  <Link
                    to="/admin"
                    onClick={() => setOpen(false)}
                    className="block py-2 px-2 rounded text-gold hover:bg-white/10"
                  >
                    Admin
                  </Link>
                </li>
              )}
            </ul>
          </nav>
        </>
      )}
    </>
  );
}

const LABELS: Record<string, string> = {
  catalogue: "Catalogue",
  about: "À propos",
  contact: "Contact",
  panier: "Panier",
  favoris: "Favoris",
  login: "Connexion",
  admin: "Admin",
  produit: "Produit",
};

export function Breadcrumbs({ lastLabel }: { lastLabel?: string }) {
  const location = useLocation();
  const path = location.pathname;
  if (path === "/") return null;

  const isProductPage = path.startsWith("/produit/");
  const rawSegments = path.split("/").filter(Boolean);

  let crumbs: Array<{ to: string; label: string; isLast: boolean }> = [];

  if (isProductPage) {
    const productSlug = rawSegments[1] ?? "";
    crumbs = [
      { to: "/catalogue", label: "Catalogue", isLast: false },
      { to: path, label: lastLabel ?? decodeURIComponent(productSlug), isLast: true },
    ];
  } else {
    let acc = "";
    const segments = rawSegments.filter((s) => s !== "produit");
    crumbs = segments.map((seg, i) => {
      acc += "/" + seg;
      const isLast = i === segments.length - 1;
      const label = lastLabel && isLast ? lastLabel : (LABELS[seg] ?? decodeURIComponent(seg));
      return { to: acc, label, isLast };
    });
  }

  if (crumbs.length === 0) return null;

  return (
    <nav aria-label="Fil d'Ariane" className="container-edit pt-20 sm:pt-24 pb-4">
      <ol className="flex flex-wrap items-center gap-1.5 text-[11px] tracking-[0.18em] uppercase text-muted-foreground">
        <li>
          <Link to="/" className="hover:text-foreground transition-colors">Accueil</Link>
        </li>
        {crumbs.map((c) => (
          <li key={c.to} className="flex items-center gap-1.5">
            <span aria-hidden className="text-muted-foreground/50">/</span>
            {c.isLast ? (
              <span className="text-foreground break-all max-w-[180px] sm:max-w-none truncate sm:whitespace-normal inline-block align-bottom" title={c.label}>
                {c.label}
              </span>
            ) : (
              <Link to={c.to as any} className="hover:text-foreground transition-colors">
                {c.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
