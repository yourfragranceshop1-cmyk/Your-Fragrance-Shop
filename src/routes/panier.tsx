import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { MapPin, MessageCircle, Minus, Plus, Trash2 } from "lucide-react";
import { Layout } from "@/components/Layout";
import { useCart } from "@/contexts/CartContext";
import { formatPrice, whatsappLink, getCurrentLocationLink } from "@/lib/whatsapp";
import { toast } from "sonner";

export const Route = createFileRoute("/panier")({
  head: () => ({ meta: [{ title: "Panier — Your Fragrance Shop" }] }),
  component: CartPage,
});

function CartPage() {
  const { items, total, setQuantity, remove } = useCart();
  const [location, setLocation] = useState("");
  const [gpsLoading, setGpsLoading] = useState(false);

  const useGps = async () => {
    setGpsLoading(true);
    try {
      const link = await getCurrentLocationLink();
      setLocation(link);
      toast.success("Position récupérée");
    } catch {
      toast.error("Impossible de récupérer votre position");
    } finally { setGpsLoading(false); }
  };

  const wa = whatsappLink(
    items.map((l) => ({ name: l.product.name, quantity: l.quantity, price: Number(l.product.price), contenance: l.product.contenance })),
    location || null,
  );

  return (
    <Layout>
      <section className="container-edit py-12">
        <h1 className="font-display text-5xl text-center mb-12">Votre panier</h1>

        {items.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground mb-6">Votre panier est vide.</p>
            <Link to="/catalogue" className="link-underline">Découvrir nos parfums</Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-6">
              {items.map((line) => (
                <div key={line.product.id} className="flex gap-4 border-b border-border pb-6">
                  <div className="w-24 h-32 bg-secondary/60 flex-shrink-0">
                    {line.product.image_url && <img src={line.product.image_url.split(",")[0]} alt={line.product.name} loading="lazy" decoding="async" className="h-full w-full object-cover" />}
                  </div>
                  <div className="flex-1">
                    <Link to="/produit/$id" params={{ id: line.product.id }} className="font-display text-xl hover:text-gold">{line.product.name}</Link>
                    <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground mt-1">{line.product.contenance} ml</p>
                    <p className="mt-2">{formatPrice(Number(line.product.price))}</p>
                    <div className="mt-3 flex items-center gap-3">
                      <div className="flex items-center border border-border">
                        <button onClick={() => setQuantity(line.product.id, Math.max(1, line.quantity - 1))} className="p-2"><Minus className="h-3 w-3" /></button>
                        <span className="w-8 text-center text-sm">{line.quantity}</span>
                        <button onClick={() => setQuantity(line.product.id, line.quantity + 1)} className="p-2"><Plus className="h-3 w-3" /></button>
                      </div>
                      <button onClick={() => remove(line.product.id)} className="text-muted-foreground hover:text-destructive" aria-label="Retirer"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </div>
                  <div className="font-display text-lg">{formatPrice(Number(line.product.price) * line.quantity)}</div>
                </div>
              ))}
            </div>

            <div className="bg-card border border-border p-6 h-fit space-y-6">
              <div className="flex justify-between font-display text-2xl border-b border-border pb-4">
                <span>Total</span><span>{formatPrice(total)}</span>
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground mb-2 block">Localisation (optionnel)</label>
                <textarea
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Adresse ou repère..."
                  rows={2}
                  className="w-full bg-background border border-border px-3 py-2 text-sm"
                />
                <button
                  type="button"
                  onClick={useGps}
                  disabled={gpsLoading}
                  className="mt-2 inline-flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-gold hover:underline"
                >
                  <MapPin className="h-4 w-4" /> {gpsLoading ? "Recherche..." : "Utiliser ma position"}
                </button>
              </div>

              <a
                href={wa}
                target="_blank"
                rel="noreferrer"
                className="w-full inline-flex justify-center items-center gap-2 bg-whatsapp text-white px-6 py-4 text-xs uppercase tracking-[0.2em] hover:opacity-90"
              >
                <MessageCircle className="h-4 w-4" /> Commander via WhatsApp
              </a>
              <p className="text-xs text-muted-foreground text-center">Aucun paiement en ligne. La commande se finalise via WhatsApp.</p>
            </div>
          </div>
        )}
      </section>
    </Layout>
  );
}
