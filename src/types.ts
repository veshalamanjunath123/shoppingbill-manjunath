export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  unit: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OfferSavings {
  name: string;
  description: string;
  saving: number;
}

export interface BillCalculation {
  subtotal: number;
  offers: OfferSavings[];
  totalSavings: number;
  finalTotal: number;
}
