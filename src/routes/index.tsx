import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Sparkles, Truck, ShieldCheck } from "lucide-react";
import { Layout } from "@/components/Layout";
import { ProductCard } from "@/components/ProductCard";
import { supabase } from "@/integrations/supabase/client";
import type { Product } from "@/lib/types";
import heroImg from "@/assets/hero-perfume.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Your Fragrance Shop — De bonnes senteurs pour tous les budgets" },
      { name: "description", content: "Découvrez notre sélection de parfums accessibles. Commande rapide via WhatsApp." },
    ],
  }),
  component: HomePage,
});

const CATEGORIES = [
  { key: "femme", label: "Femme" },
  { key: "homme", label: "Homme" },
  { key: "unisexe", label: "Unisexe" },
  { key: "bestseller", label: "Bestsellers" },
] as const;

function HomePage() {
  const { data: bestsellers = [] } = useQuery({
    queryKey: ["bestsellers"],
    queryFn: async () => {
      const { data } = await supabase.from("products").select("*").eq("is_bestseller", true).limit(3);
      return (data ?? []) as Product[];
    },
  });
  const { data: popular = [] } = useQuery({
    queryKey: ["popular"],
    queryFn: async () => {
      const { data } = await supabase.from("products").select("*").eq("is_popular", true).limit(4);
      return (data ?? []) as Product[];
    },
  });
  const { data: fallbackProducts = [] } = useQuery({
    queryKey: ["fallback-products"],
    queryFn: async () => {
      const { data } = await supabase.from("products").select("*").limit(8);
      return (data ?? []) as Product[];
    },
    enabled: bestsellers.length === 0 && popular.length === 0,
  });

  return (
    <Layout>
      <ParallaxHero />

      {/* BESTSELLERS */}
      {bestsellers.length > 0 && (
        <section className="container-edit py-12">
          <div className="text-center mb-12">
            <h2 className="font-display text-4xl md:text-5xl">Les Bestsellers</h2>
            <Link to="/catalogue" search={{ bestseller: true } as any} className="mt-4 link-underline inline-flex">
              Voir tous <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {bestsellers.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* POPULAR */}
      {popular.length > 0 && (
        <section className="container-edit py-20">
          <div className="text-center mb-12">
            <h2 className="font-display text-4xl md:text-5xl">Populaires</h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {popular.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* FALLBACK COLLECTION (If bestsellers & popular are both empty) */}
      {bestsellers.length === 0 && popular.length === 0 && fallbackProducts.length > 0 && (
        <section className="container-edit py-16">
          <div className="text-center mb-12">
            <h2 className="font-display text-4xl md:text-5xl">Notre Collection</h2>
            <p className="text-muted-foreground mt-2 max-w-sm mx-auto text-[13px] tracking-wide leading-relaxed">
              Découvrez notre sélection exclusive de parfums d'exception pour tous les budgets.
            </p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {fallbackProducts.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
          <div className="text-center mt-12">
            <Link
              to="/catalogue"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 text-xs uppercase tracking-[0.2em] hover:opacity-90 transition-opacity"
            >
              Explorer le catalogue <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      )}

      <TrustMarquee />
    </Layout>
  );
}

const TRUST_ITEMS = [
  { icon: Sparkles, title: "Qualité sélectionnée", text: "Chaque fragrance est choisie avec soin pour son authenticité." },
  { icon: Truck, title: "Commande rapide", text: "Passez commande en quelques clics directement via WhatsApp." },
  { icon: ShieldCheck, title: "Prix accessibles", text: "Le luxe à portée de tous, sans compromis sur la qualité." },
];

function TrustMarquee() {
  const trackRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);
  const setWidthRef = useRef(0);
  const draggingRef = useRef(false);
  const lastXRef = useRef(0);
  const SPEED = 0.4; // px/frame ≈ slow

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const measure = () => {
      // We render TRUST_ITEMS x3; one set = scrollWidth / 3
      setWidthRef.current = track.scrollWidth / 3;
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(track);

    let raf = 0;
    const tick = () => {
      if (!draggingRef.current) offsetRef.current -= SPEED;
      const w = setWidthRef.current;
      if (w > 0) {
        if (offsetRef.current <= -w) offsetRef.current += w;
        if (offsetRef.current > 0) offsetRef.current -= w;
      }
      track.style.transform = `translate3d(${offsetRef.current}px,0,0)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);

  const onDown = (e: React.PointerEvent<HTMLDivElement>) => {
    draggingRef.current = true;
    lastXRef.current = e.clientX;
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    const dx = e.clientX - lastXRef.current;
    lastXRef.current = e.clientX;
    offsetRef.current += dx;
  };
  const onUp = () => { draggingRef.current = false; };

  const cards = [...TRUST_ITEMS, ...TRUST_ITEMS, ...TRUST_ITEMS];

  return (
    <section className="bg-secondary/60 py-20 overflow-hidden border-y border-border">
      <div
        className="select-none cursor-grab active:cursor-grabbing touch-pan-y"
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
      >
        <div ref={trackRef} className="flex gap-5 sm:gap-6 will-change-transform" style={{ width: "max-content" }}>
          {cards.map((t, i) => (
            <article
              key={i}
              className="shrink-0 w-[78vw] sm:w-80 bg-card text-card-foreground border border-border rounded-2xl px-8 py-10 flex flex-col items-center text-center shadow-sm"
            >
              <div className="h-14 w-14 rounded-full bg-gold/15 border border-gold/30 flex items-center justify-center mb-5">
                <t.icon className="h-6 w-6 text-gold" />
              </div>
              <h3 className="font-display text-2xl mb-2">{t.title}</h3>
              <p className="text-sm text-muted-foreground">{t.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>);
}

function ParallaxHero() {
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      // Only animate while hero is in/near viewport
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;
      // Subtle parallax: bg moves slower than scroll
      setOffset(-rect.top * 0.25);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section
      ref={ref}
      className="relative overflow-hidden h-[88vh] min-h-[600px] max-h-[900px] bg-secondary"
    >
      <div
        className="absolute inset-0 will-change-transform"
        style={{
          transform: `translate3d(0, ${offset}px, 0) scale(1.12)`,
        }}
      >
        <img
          src={heroImg}
          alt="Flacon de parfum minimaliste"
          width={1920}
          height={1080}
          loading="eager"
          fetchPriority="high"
          decoding="async"
          className="h-full w-full object-cover"
        />
        {/* Tinted overlay so text stays legible in light & dark themes */}
        <div className="absolute inset-0 bg-gradient-to-r from-background/85 via-background/50 to-transparent dark:from-background/90 dark:via-background/60" />
      </div>

      <div className="relative z-10 container-edit h-full flex items-center">
        <div className="max-w-xl">
          <p className="text-[11px] uppercase tracking-[0.3em] text-gold mb-6">Nouvelle collection</p>
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl leading-[0.95] tracking-tight text-foreground">
            Luxury &<br />
            <span className="italic">Fragrance</span>
          </h1>
          <p className="mt-6 max-w-md text-muted-foreground">
            De bonnes senteurs pour tous les budgets. Une sélection de fragrances raffinées, livrées rapidement via WhatsApp.
          </p>
          <div className="mt-10 flex items-center gap-6">
            <Link to="/catalogue" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-7 py-3.5 text-xs uppercase tracking-[0.2em] hover:bg-primary/90 transition-colors">
              Voir les parfums <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/about" className="link-underline text-foreground">Notre histoire</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
