// Shared TypeScript types for the Medhour Pharmacy storefront & admin.
// These mirror the Supabase schema in supabase/migrations/.

export type UUID = string;

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready_for_pickup"
  | "out_for_delivery"
  | "completed"
  | "cancelled";

export type PaymentStatus =
  | "pending"
  | "paid"
  | "failed"
  | "refunded"
  | "cash_on_delivery";

export type PaymentMethod = "cash_on_delivery" | "pay_on_pickup" | "mobile_money";

export type DeliveryMethod = "delivery" | "pickup";

export type PrescriptionStatus = "pending" | "approved" | "rejected" | "clarification_requested";

export type InventoryMovementType =
  | "order_placed"
  | "order_cancelled"
  | "manual_adjustment"
  | "restock";

export interface Profile {
  id: UUID;
  full_name: string | null;
  phone: string | null;
  email: string | null;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: UUID;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  icon: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Brand {
  id: UUID;
  name: string;
  slug: string;
  created_at: string;
}

export interface Product {
  id: UUID;
  name: string;
  slug: string;
  generic_name: string | null;
  brand_id: UUID | null;
  category_id: UUID | null;
  sku: string | null;
  description: string | null;
  short_description: string | null;
  usage_info: string | null;
  warnings: string | null;
  keywords: string[] | null;
  pack_size: string | null;
  price: number;
  sale_price: number | null;
  stock_quantity: number;
  low_stock_threshold: number;
  requires_prescription: boolean;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // joined relations (optional)
  category?: Category | null;
  brand?: Brand | null;
  images?: ProductImage[];
}

export interface ProductImage {
  id: UUID;
  product_id: UUID;
  image_url: string;
  alt_text: string | null;
  sort_order: number;
  created_at: string;
}

export interface InventoryMovement {
  id: UUID;
  product_id: UUID;
  change: number;
  movement_type: InventoryMovementType;
  reason: string | null;
  order_id: UUID | null;
  admin_id: UUID | null;
  created_at: string;
}

export interface Cart {
  id: UUID;
  customer_id: UUID;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  id: UUID;
  cart_id: UUID;
  product_id: UUID;
  quantity: number;
  created_at: string;
  updated_at: string;
  product?: Product;
}

export interface Address {
  id: UUID;
  customer_id: UUID;
  label: string | null;
  full_name: string;
  phone: string;
  region: string;
  district: string;
  address_line: string;
  landmark: string | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: UUID;
  order_number: string;
  customer_id: UUID | null;
  customer_name: string;
  phone: string;
  email: string | null;
  delivery_method: DeliveryMethod;
  region: string | null;
  district: string | null;
  delivery_address: string | null;
  landmark: string | null;
  subtotal: number;
  delivery_fee: number;
  total_amount: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  order_status: OrderStatus;
  customer_notes: string | null;
  admin_notes: string | null;
  prescription_id: UUID | null;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}

export interface OrderItem {
  id: UUID;
  order_id: UUID;
  product_id: UUID | null;
  product_name: string;
  pack_size: string | null;
  unit_price: number;
  quantity: number;
  line_total: number;
  requires_prescription: boolean;
  created_at: string;
}

export interface OrderStatusHistory {
  id: UUID;
  order_id: UUID;
  status: OrderStatus;
  note: string | null;
  changed_by: UUID | null;
  created_at: string;
}

export interface Prescription {
  id: UUID;
  customer_id: UUID | null;
  customer_name: string;
  phone: string;
  file_path: string;
  notes: string | null;
  fulfilment_method: DeliveryMethod | null;
  delivery_address: string | null;
  status: PrescriptionStatus;
  admin_notes: string | null;
  order_id: UUID | null;
  created_at: string;
  updated_at: string;
}

export interface AdminNote {
  id: UUID;
  order_id: UUID | null;
  prescription_id: UUID | null;
  admin_id: UUID | null;
  note: string;
  created_at: string;
}

export interface SiteSetting {
  key: string;
  value: string;
  updated_at: string;
}

export interface ContactMessage {
  id: UUID;
  name: string;
  contact: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

// ---- Cart (client-side) ----

export interface LocalCartItem {
  productId: UUID;
  slug: string;
  name: string;
  packSize: string | null;
  unitPrice: number;
  imageUrl: string | null;
  requiresPrescription: boolean;
  maxQuantity: number;
  quantity: number;
}

// ---- Filters ----

export interface ShopFilters {
  query?: string;
  category?: string; // category slug
  requiresPrescription?: "yes" | "no";
  inStock?: boolean;
  minPrice?: number;
  maxPrice?: number;
  sort?: "newest" | "price_asc" | "price_desc" | "name_asc";
  page?: number;
}
