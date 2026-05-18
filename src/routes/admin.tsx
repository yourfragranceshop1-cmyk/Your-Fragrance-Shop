import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Edit2, Plus, Trash2, X, ImagePlus } from "lucide-react";
import { Layout } from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Product, ProductCategory } from "@/lib/types";
import { toast } from "sonner";
import { formatPrice } from "@/lib/whatsapp";

// Client-side image compression to reduce payload size and speed up page load
const compressImage = (file: File, maxWidth = 1200, maxHeight = 1200, quality = 0.85): Promise<File> => {
  return new Promise((resolve) => {
    if (!file.type.startsWith("image/")) {
      return resolve(file);
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          return resolve(file);
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              return resolve(file);
            }
            const compressedFile = new File([blob], file.name, {
              type: "image/jpeg",
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          },
          "image/jpeg",
          quality
        );
      };
      img.onerror = () => resolve(file);
      img.src = event.target?.result as string;
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
};

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — Your Fragrance Shop" }] }),
  component: AdminPage,
});

interface FormState {
  id?: string;
  name: string;
  description: string;
  price: string;
  stock: string;
  category: ProductCategory;
  contenance: string;
  image_url: string;
  image_urls: string[];
  is_bestseller: boolean;
  is_popular: boolean;
}

const empty: FormState = {
  name: "", description: "", price: "", stock: "0", category: "unisexe",
  contenance: "50", image_url: "", image_urls: [], is_bestseller: false, is_popular: false,
};

function AdminPage() {
  const { user, isAdmin, loading } = useAuth();
  const qc = useQueryClient();
  const [form, setForm] = useState<FormState>(empty);
  const [uploading, setUploading] = useState(false);

  const { data: products = [] } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data } = await supabase.from("products").select("*").order("created_at", { ascending: false });
      return (data ?? []) as Product[];
    },
    enabled: isAdmin,
  });

  if (loading) return <Layout><div className="container-edit py-20 text-center text-muted-foreground">Chargement...</div></Layout>;
  if (!user) return <Layout><div className="container-edit py-20 text-center"><p className="mb-4">Connexion requise.</p><Link to="/login" className="link-underline">Se connecter</Link></div></Layout>;
  if (!isAdmin) return <Layout><div className="container-edit py-20 text-center"><p>Accès réservé aux administrateurs.</p></div></Layout>;

  const uploadFile = async (file: File): Promise<string> => {
    const ext = file.name.split(".").pop();
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("products").upload(path, file);
    if (error) throw error;
    const { data: pub } = supabase.storage.from("products").getPublicUrl(path);
    return pub.publicUrl;
  };

  const handleUploadMultiple = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploading(true);
    try {
      // Compress all images before uploading to optimize speeds (from 5-10MB to ~150KB per image)
      const compressedFiles = await Promise.all(files.map((file) => compressImage(file)));
      const urls = await Promise.all(compressedFiles.map(uploadFile));
      setForm((f) => {
        const merged = [...f.image_urls, ...urls];
        // First image becomes the primary image_url
        return { ...f, image_urls: merged, image_url: merged.join(",") };
      });
      toast.success(`${urls.length} photo(s) téléchargée(s)`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur d'upload");
    } finally {
      setUploading(false);
      // Reset input so same files can be re-selected
      e.target.value = "";
    }
  };

  const removeImage = (idx: number) => {
    setForm((f) => {
      const next = f.image_urls.filter((_, i) => i !== idx);
      return { ...f, image_urls: next, image_url: next.join(",") };
    });
  };

  const setPrimary = (url: string) => {
    setForm((f) => {
      const reordered = [url, ...f.image_urls.filter((u) => u !== url)];
      return { ...f, image_urls: reordered, image_url: reordered.join(",") };
    });
  };

  const save = async () => {
    if (!form.name || !form.price) { toast.error("Nom et prix requis"); return; }
    
    // Save all image URLs in the single image_url column separated by commas
    const finalImageUrl = form.image_urls.length > 0 ? form.image_urls.join(",") : (form.image_url || null);

    const payload = {
      name: form.name,
      description: form.description || null,
      price: Number(form.price),
      stock: Number(form.stock),
      category: form.category,
      contenance: Number(form.contenance) || 0,
      image_url: finalImageUrl,
      is_bestseller: form.is_bestseller,
      is_popular: form.is_popular,
    };

    const { error } = form.id
      ? await supabase.from("products").update(payload).eq("id", form.id)
      : await supabase.from("products").insert(payload);
      
    if (error) { toast.error(error.message); return; }
    toast.success(form.id ? "Mis à jour" : "Créé");
    setForm(empty);
    qc.invalidateQueries({ queryKey: ["admin-products"] });
    qc.invalidateQueries({ queryKey: ["products"] });
    qc.invalidateQueries({ queryKey: ["bestsellers"] });
    qc.invalidateQueries({ queryKey: ["popular"] });
  };

  const edit = (p: Product) => {
    // Split image_url by comma to retrieve all individual image URLs
    const urls = p.image_url ? p.image_url.split(",").filter(Boolean) : [];
    
    setForm({
      id: p.id,
      name: p.name,
      description: p.description ?? "",
      price: String(p.price),
      stock: String(p.stock),
      category: p.category,
      contenance: String(p.contenance),
      image_url: p.image_url ?? "",
      image_urls: urls,
      is_bestseller: p.is_bestseller,
      is_popular: p.is_popular,
    });
  };

  const del = async (id: string) => {
    if (!confirm("Supprimer ce produit ?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Supprimé");
    qc.invalidateQueries({ queryKey: ["admin-products"] });
  };

  return (
    <Layout>
      <section className="container-edit py-12">
        <h1 className="font-display text-5xl mb-12">Administration</h1>

        <div className="grid lg:grid-cols-2 gap-10">
          {/* Form */}
          <div className="bg-card border border-border p-6 h-fit space-y-4">
            <h2 className="font-display text-2xl">{form.id ? "Modifier" : "Nouveau parfum"}</h2>

            <input
              className="w-full bg-background border border-border px-3 py-2 text-sm"
              placeholder="Nom du parfum"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <textarea
              className="w-full bg-background border border-border px-3 py-2 text-sm"
              placeholder="Description courte"
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="number"
                className="bg-background border border-border px-3 py-2 text-sm"
                placeholder="Prix (FCFA)"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
              <input
                type="number"
                className="bg-background border border-border px-3 py-2 text-sm"
                placeholder="Stock"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
              />
              {/* Contenance — champ libre */}
              <div className="relative">
                <input
                  type="number"
                  className="w-full bg-background border border-border pl-3 pr-9 py-2 text-sm"
                  placeholder="Contenance"
                  value={form.contenance}
                  onChange={(e) => setForm({ ...form, contenance: e.target.value })}
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">ml</span>
              </div>
            </div>

            <select
              className="w-full bg-background border border-border px-3 py-2 text-sm"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value as ProductCategory })}
            >
              <option value="femme">Femme</option>
              <option value="homme">Homme</option>
              <option value="unisexe">Unisexe</option>
            </select>

            {/* Multi-photo upload zone */}
            <div>
              <label className="cursor-pointer w-full flex flex-col items-center justify-center gap-2 border border-dashed border-border px-4 py-5 text-xs uppercase tracking-[0.16em] text-muted-foreground hover:bg-secondary/40 transition-colors">
                <ImagePlus className="h-6 w-6" />
                {uploading ? "Téléchargement…" : "Ajouter des photos (plusieurs à la fois)"}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleUploadMultiple}
                  disabled={uploading}
                />
              </label>

              {form.image_urls.length > 0 && (
                <div className="mt-3 grid grid-cols-4 gap-2">
                  {form.image_urls.map((url, idx) => (
                    <div key={url} className="relative group aspect-square">
                      <img
                        src={url}
                        alt={`Photo ${idx + 1}`}
                        className={`h-full w-full object-cover border-2 transition-all cursor-pointer ${idx === 0 ? "border-gold" : "border-border hover:border-foreground/40"}`}
                        onClick={() => setPrimary(url)}
                        title={idx === 0 ? "Photo principale" : "Cliquer pour définir comme principale"}
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute -top-1.5 -right-1.5 bg-destructive text-white rounded-full h-5 w-5 flex items-center justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                        aria-label="Supprimer"
                      >
                        <X className="h-3 w-3" />
                      </button>
                      {idx === 0 && (
                        <span className="absolute bottom-0 left-0 right-0 bg-gold/90 text-[9px] text-center text-white uppercase tracking-[0.1em] py-0.5">
                          Principale
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-6 text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.is_bestseller} onChange={(e) => setForm({ ...form, is_bestseller: e.target.checked })} />
                Bestseller
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.is_popular} onChange={(e) => setForm({ ...form, is_popular: e.target.checked })} />
                Populaire
              </label>
            </div>

            <div className="flex gap-2">
              <button
                onClick={save}
                className="flex-1 bg-primary text-primary-foreground py-3 text-xs uppercase tracking-[0.2em] inline-flex justify-center items-center gap-2"
              >
                <Plus className="h-4 w-4" /> {form.id ? "Mettre à jour" : "Ajouter"}
              </button>
              {form.id && (
                <button
                  onClick={() => setForm(empty)}
                  className="px-4 border border-border text-xs uppercase tracking-[0.2em]"
                >
                  Annuler
                </button>
              )}
            </div>
          </div>

          {/* Product list */}
          <div className="space-y-3">
            <h2 className="font-display text-2xl mb-2">Produits ({products.length})</h2>
            {products.map((p) => {
              const urls = p.image_url ? p.image_url.split(",").filter(Boolean) : [];
              const mainUrl = urls[0] || "";

              return (
                <div key={p.id} className="flex gap-3 bg-card border border-border p-3">
                  {/* Thumbnail grid or single image */}
                  <div className="w-16 h-16 bg-secondary flex-shrink-0 relative overflow-hidden">
                    {mainUrl && <img src={mainUrl} alt={p.name} className="h-full w-full object-cover" />}
                    {urls.length > 1 && (
                      <span className="absolute bottom-0 right-0 bg-background/80 text-[9px] px-1">
                        +{urls.length - 1}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display text-lg truncate">{p.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatPrice(Number(p.price))} · stock {p.stock} · {p.contenance} ml · {p.category}
                    </p>
                    <div className="flex gap-1 mt-1 text-[10px] uppercase tracking-[0.16em]">
                      {p.is_bestseller && <span className="text-gold">Best</span>}
                      {p.is_popular && <span className="text-muted-foreground">Pop</span>}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button onClick={() => edit(p)} className="p-2 hover:bg-secondary"><Edit2 className="h-4 w-4" /></button>
                    <button onClick={() => del(p.id)} className="p-2 text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </Layout>
  );
}
