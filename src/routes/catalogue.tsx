import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef } from "react";
import { z } from "zod";
import { Layout } from "@/components/Layout";
import { ProductCard } from "@/components/ProductCard";
import { supabase } from "@/integrations/supabase/client";
import type { Product } from "@/lib/types";
import { Search, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const searchSchema = z.object({
  q: z.string().optional(),
  category: z.enum(["homme", "femme", "unisexe"]).optional(),
  contenance: z.coerce.number().optional(),
  bestseller: z.coerce.boolean().optional(),
  sort: z.enum(["price_asc", "price_desc"]).optional(),
  type: z.enum(["bestseller", "populaire", "normal"]).optional(),
  focus: z.coerce.boolean().optional(),
});

export const Route = createFileRoute("/catalogue")({
  validateSearch: (s) => searchSchema.parse(s),
  head: () => ({
    meta: [
      { title: "Catalogue — Your Fragrance Shop" },
      { name: "description", content: "Tous nos parfums : femme, homme, unisexe. Filtrez par contenance, prix et type." },
    ],
  }),
  component: CataloguePage,
});

function CataloguePage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/catalogue" });
  const inputRef = useRef<HTMLInputElement>(null);

  // Backward compatibility: Convert bestseller query param to type="bestseller"
  useEffect(() => {
    if (search.bestseller) {
      update({ type: "bestseller", bestseller: undefined });
    }
  }, [search.bestseller]);

  useEffect(() => {
    if (search.focus) {
      inputRef.current?.focus();
      navigate({ search: (prev: any) => ({ ...prev, focus: undefined }), replace: true });
    }
  }, [search.focus, navigate]);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data } = await supabase.from("products").select("*").order("created_at", { ascending: false });
      return (data ?? []) as Product[];
    },
  });

  const filtered = useMemo(() => {
    let list = [...products];
    if (search.category) list = list.filter((p) => p.category === search.category);
    if (search.contenance) list = list.filter((p) => p.contenance === search.contenance);
    
    if (search.type) {
      if (search.type === "bestseller") {
        list = list.filter((p) => p.is_bestseller);
      } else if (search.type === "populaire") {
        list = list.filter((p) => p.is_popular);
      } else if (search.type === "normal") {
        list = list.filter((p) => !p.is_bestseller && !p.is_popular);
      }
    }

    if (search.q) {
      const q = search.q.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q) || (p.description ?? "").toLowerCase().includes(q));
    }

    if (search.sort === "price_asc") {
      list.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (search.sort === "price_desc") {
      list.sort((a, b) => Number(b.price) - Number(a.price));
    }
    
    return list;
  }, [products, search]);

  const update = (patch: Partial<typeof search>) =>
    navigate({ search: (prev: typeof search) => ({ ...prev, ...patch }) });

  return (
    <Layout>
      <section className="container-edit py-12">
        <div className="text-center mb-10">
          <p className="text-[11px] uppercase tracking-[0.3em] text-gold mb-3">Notre sélection</p>
          <h1 className="font-display text-5xl">Catalogue</h1>
        </div>

        {/* Search */}
        <div className="max-w-md mx-auto mb-8 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            ref={inputRef}
            value={search.q ?? ""}
            onChange={(e) => update({ q: e.target.value || undefined })}
            placeholder="Rechercher un parfum..."
            className="w-full bg-card border border-border pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-primary"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 justify-center items-center mb-12 text-xs uppercase tracking-[0.16em]">
          
          {/* CATEGORY FILTER */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="px-4 py-2 border border-border bg-card hover:border-foreground/30 transition-colors uppercase tracking-[0.16em] text-[10px] sm:text-xs flex items-center gap-1.5 cursor-pointer rounded-none outline-none select-none">
                {search.category ? `Catégorie : ${search.category}` : "Catégorie"}
                <ChevronDown className="h-3 w-3 opacity-60 shrink-0" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48 bg-card/95 border border-border text-card-foreground shadow-2xl backdrop-blur-md rounded-lg p-1">
              <DropdownMenuItem onClick={() => update({ category: undefined })} className="cursor-pointer text-xs uppercase tracking-wider hover:bg-accent hover:text-accent-foreground rounded transition-colors px-3 py-2">
                Tous
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => update({ category: "homme" })} className="cursor-pointer text-xs uppercase tracking-wider hover:bg-accent hover:text-accent-foreground rounded transition-colors px-3 py-2">
                Homme
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => update({ category: "femme" })} className="cursor-pointer text-xs uppercase tracking-wider hover:bg-accent hover:text-accent-foreground rounded transition-colors px-3 py-2">
                Femme
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => update({ category: "unisexe" })} className="cursor-pointer text-xs uppercase tracking-wider hover:bg-accent hover:text-accent-foreground rounded transition-colors px-3 py-2">
                Unisexe
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* CONTENANCE FILTER */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="px-4 py-2 border border-border bg-card hover:border-foreground/30 transition-colors uppercase tracking-[0.16em] text-[10px] sm:text-xs flex items-center gap-1.5 cursor-pointer rounded-none outline-none select-none">
                {search.contenance ? `Contenance : ${search.contenance} ml` : "Contenance"}
                <ChevronDown className="h-3 w-3 opacity-60 shrink-0" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48 bg-card/95 border border-border text-card-foreground shadow-2xl backdrop-blur-md rounded-lg p-1">
              <DropdownMenuItem onClick={() => update({ contenance: undefined })} className="cursor-pointer text-xs uppercase tracking-wider hover:bg-accent hover:text-accent-foreground rounded transition-colors px-3 py-2">
                Toutes
              </DropdownMenuItem>
              {[5, 25, 30, 35, 50, 75, 100].map((c) => (
                <DropdownMenuItem key={c} onClick={() => update({ contenance: c })} className="cursor-pointer text-xs uppercase tracking-wider hover:bg-accent hover:text-accent-foreground rounded transition-colors px-3 py-2">
                  {c} ml
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* PRICE SORT FILTER */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="px-4 py-2 border border-border bg-card hover:border-foreground/30 transition-colors uppercase tracking-[0.16em] text-[10px] sm:text-xs flex items-center gap-1.5 cursor-pointer rounded-none outline-none select-none">
                {search.sort === "price_asc" ? "Prix croissant" : search.sort === "price_desc" ? "Prix décroissant" : "Prix"}
                <ChevronDown className="h-3 w-3 opacity-60 shrink-0" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48 bg-card/95 border border-border text-card-foreground shadow-2xl backdrop-blur-md rounded-lg p-1">
              <DropdownMenuItem onClick={() => update({ sort: undefined })} className="cursor-pointer text-xs uppercase tracking-wider hover:bg-accent hover:text-accent-foreground rounded transition-colors px-3 py-2">
                Par défaut
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => update({ sort: "price_asc" })} className="cursor-pointer text-xs uppercase tracking-wider hover:bg-accent hover:text-accent-foreground rounded transition-colors px-3 py-2">
                Prix croissant
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => update({ sort: "price_desc" })} className="cursor-pointer text-xs uppercase tracking-wider hover:bg-accent hover:text-accent-foreground rounded transition-colors px-3 py-2">
                Prix décroissant
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* TYPE FILTER */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="px-4 py-2 border border-border bg-card hover:border-foreground/30 transition-colors uppercase tracking-[0.16em] text-[10px] sm:text-xs flex items-center gap-1.5 cursor-pointer rounded-none outline-none select-none">
                {search.type ? `Type : ${search.type}` : "Type"}
                <ChevronDown className="h-3 w-3 opacity-60 shrink-0" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48 bg-card/95 border border-border text-card-foreground shadow-2xl backdrop-blur-md rounded-lg p-1">
              <DropdownMenuItem onClick={() => update({ type: undefined })} className="cursor-pointer text-xs uppercase tracking-wider hover:bg-accent hover:text-accent-foreground rounded transition-colors px-3 py-2">
                Tous
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => update({ type: "bestseller" })} className="cursor-pointer text-xs uppercase tracking-wider hover:bg-accent hover:text-accent-foreground rounded transition-colors px-3 py-2">
                Bestseller
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => update({ type: "populaire" })} className="cursor-pointer text-xs uppercase tracking-wider hover:bg-accent hover:text-accent-foreground rounded transition-colors px-3 py-2">
                Populaire
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => update({ type: "normal" })} className="cursor-pointer text-xs uppercase tracking-wider hover:bg-accent hover:text-accent-foreground rounded transition-colors px-3 py-2">
                Normal
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

        </div>

        {isLoading ? (
          <p className="text-center text-muted-foreground">Chargement...</p>
        ) : filtered.length === 0 ? (
          <p className="text-center text-muted-foreground py-20">Aucun parfum ne correspond à votre recherche.</p>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
            {filtered.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>
    </Layout>
  );
}
