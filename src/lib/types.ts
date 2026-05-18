export type ProductCategory = "homme" | "femme" | "unisexe";

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  image_url: string | null;
  category: ProductCategory;
  contenance: number;
  is_bestseller: boolean;
  is_popular: boolean;
}

export interface CartLine {
  product: Product;
  quantity: number;
}

export function stockBadge(stock: number): { label: string; tone: "success" | "warning" | "destructive" | "muted" } {
  if (stock <= 0) return { label: "Rupture", tone: "muted" };
  if (stock < 5) return { label: `Plus que ${stock}`, tone: "destructive" };
  if (stock < 15) return { label: "Stock limité", tone: "warning" };
  return { label: "En stock", tone: "success" };
}
