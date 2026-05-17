import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Edit2, Plus, Trash2, Upload } from "lucide-react";
import { Layout } from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Product, ProductCategory } from "@/lib/types";
import { toast } from "sonner";
import { formatPrice } from "@/lib/whatsapp";

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
  is_bestseller: boolean;
  is_popular: boolean;
}

const empty: FormState = {
  name: "", description: "", price: "", stock: "0", category: "unisexe",
  contenance: "50", image_url: "", is_bestseller: false, is_popular: false,
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

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from("products").upload(path, file);
      if (error) throw error;
      const { data: pub } = supabase.storage.from("products").getPublicUrl(path);
      setForm((f) => ({ ...f, image_url: pub.publicUrl }));
      toast.success("Image téléchargée");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur d'upload");
    } finally { setUploading(false); }
  };

  const save = async () => {
    if (!form.name || !form.price) { toast.error("Nom et prix requis"); return; }
    const payload = {
      name: form.name,
      description: form.description || null,
      price: Number(form.price),
      stock: Number(form.stock),
      category: form.category,
      contenance: Number(form.contenance),
      image_url: form.image_url || null,
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

  const edit = (p: Product) => setForm({
    id: p.id, name: p.name, description: p.description ?? "", price: String(p.price),
    stock: String(p.stock), category: p.category, contenance: String(p.contenance),
    image_url: p.image_url ?? "", is_bestseller: p.is_bestseller, is_popular: p.is_popular,
  });

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
            <input className="w-full bg-background border border-border px-3 py-2 text-sm" placeholder="Nom" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <textarea className="w-full bg-background border border-border px-3 py-2 text-sm" placeholder="Description courte" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input type="number" className="bg-background border border-border px-3 py-2 text-sm" placeholder="Prix" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
              <input type="number" className="bg-background border border-border px-3 py-2 text-sm" placeholder="Stock" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
              <select className="bg-background border border-border px-3 py-2 text-sm" value={form.contenance} onChange={(e) => setForm({ ...form, contenance: e.target.value })}>
                <option value="30">30ml</option><option value="50">50ml</option><option value="100">100ml</option>
              </select>
            </div>
            <select className="w-full bg-background border border-border px-3 py-2 text-sm" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as ProductCategory })}>
              <option value="femme">Femme</option><option value="homme">Homme</option><option value="unisexe">Unisexe</option>
            </select>
            <div className="flex flex-col sm:flex-row gap-2">
              <input className="flex-1 bg-background border border-border px-3 py-2 text-sm" placeholder="URL image" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
              <label className="cursor-pointer inline-flex items-center justify-center gap-2 border border-border px-3 py-2 text-xs uppercase tracking-[0.16em] hover:bg-secondary shrink-0">
                <Upload className="h-4 w-4" /> {uploading ? "..." : "Upload"}
                <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
              </label>
            </div>
            {form.image_url && <img src={form.image_url} alt="" className="w-32 h-32 object-cover border border-border" />}
            <div className="flex gap-6 text-sm">
              <label className="flex items-center gap-2"><input type="checkbox" checked={form.is_bestseller} onChange={(e) => setForm({ ...form, is_bestseller: e.target.checked })} /> Bestseller</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={form.is_popular} onChange={(e) => setForm({ ...form, is_popular: e.target.checked })} /> Populaire</label>
            </div>
            <div className="flex gap-2">
              <button onClick={save} className="flex-1 bg-primary text-primary-foreground py-3 text-xs uppercase tracking-[0.2em] inline-flex justify-center items-center gap-2"><Plus className="h-4 w-4" /> {form.id ? "Mettre à jour" : "Ajouter"}</button>
              {form.id && <button onClick={() => setForm(empty)} className="px-4 border border-border text-xs uppercase tracking-[0.2em]">Annuler</button>}
            </div>
          </div>

          {/* List */}
          <div className="space-y-3">
            <h2 className="font-display text-2xl mb-2">Produits ({products.length})</h2>
            {products.map((p) => (
              <div key={p.id} className="flex gap-3 bg-card border border-border p-3">
                <div className="w-16 h-16 bg-secondary flex-shrink-0">
                  {p.image_url && <img src={p.image_url} alt={p.name} className="h-full w-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display text-lg truncate">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{formatPrice(Number(p.price))} · stock {p.stock} · {p.contenance}ml · {p.category}</p>
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
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
