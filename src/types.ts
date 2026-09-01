export type ProductCategory = 
  | 'papas' 
  | 'combos' 
  | 'hamburguesas' 
  | 'chuzos' 
  | 'arepas' 
  | 'perros' 
  | 'adiciones' 
  | 'bebidas';

export interface CategoryInfo {
  id: ProductCategory;
  name: string;
  icon: string;
  description: string;
}

export interface UpsellOption {
  id: string;
  name: string;
  price: number;
  label?: string;
  variants?: string[];
}

export interface SelectedSauceItem {
  name: string;
  qty: number;
}

export interface SelectedUpsellItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  variant?: string | null;
}

export interface Product {
  id: number;
  category: ProductCategory;
  name: string;
  price: number;
  description: string;
  badge?: string;
  spicyLevel?: 0 | 1 | 2;
  prepTime?: string;
  popular?: boolean;
  imageEmoji?: string;
  image?: string;
  variants?: string[];
}

export interface CartItem {
  cartItemId: string;
  product: Product;
  qty: number;
  variant?: string | null;
  sauces: SelectedSauceItem[];
  onion?: 'Sofrita' | 'Cruda' | 'Sin cebolla' | null;
  upsells: SelectedUpsellItem[];
  specialNotes?: string;
  unitPrice: number;
}

export interface CustomerInfo {
  name: string;
  phone: string;
  address: string;
  neighborhood: string;
  referencePoint?: string;
  googleMapsUrl?: string;
  tableNumber?: string;
  orderType: 'delivery' | 'pickup' | 'table';
  paymentMethod: 'Nequi' | 'Bancolombia' | 'Efectivo';
  cashChange: string;
  notes: string;
  promoCode?: string;
}

export interface NeighborhoodDelivery {
  name: string;
  fee: number;
  estimatedMinutes: string;
}
