import { Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/whatsapp";
import { StockBadge } from "./StockBadge";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";

export function ProductCard({ product }: { product: Product }) {
  const { isFavorite, toggle } = useFavorites();
  const { add } = useCart();
  const fav = isFavorite(product.id);

  return (
    <article className="group relative">
      <Link to="/produit/$id" params={{ id: product.id }} className="block">
        <div className="relative overflow-hidden bg-secondary/60 aspect-[4/5]">
          {product.image_url ? (
            <img
              src={product.image_url.split(",")[0]}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground text-xs">Aucune image</div>
          )}
          <div className="absolute top-3 right-3"><StockBadge stock={product.stock} /></div>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              const wasFav = fav;
              toggle(product.id);
              toast.success(wasFav ? "Retiré des favoris" : "Ajouté aux favoris");
            }}
            className={`absolute bottom-3 left-3 grid place-items-center h-9 w-9 rounded-full bg-background/80 backdrop-blur border border-border transition-colors ${fav ? "text-destructive" : "text-foreground/70 hover:text-foreground"}`}
            aria-label="Favori"
          >
            <Heart className={`h-4 w-4 ${fav ? "fill-current" : ""}`} />
          </button>
        </div>
      </Link>
      <div className="pt-5 text-center">
        <h3 className="font-display text-lg">{product.name}</h3>
        <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground mt-1">
          Eau de parfum · {product.contenance} ml
        </p>
        <p className="mt-2 text-sm">{formatPrice(Number(product.price))}</p>
        <button
          type="button"
          disabled={product.stock <= 0}
          onClick={async () => { await add(product); toast.success("Ajouté au panier"); }}
          className="mt-3 link-underline disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {product.stock <= 0 ? "Indisponible" : "Ajouter au panier"}
        </button>
      </div>
    </article>
  );
}
