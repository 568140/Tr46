export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  oldPrice?: number | null;
  images: string[];
  sizes: string[];
  colors: string[];
  category: string;
  inStock: boolean;
  isNew?: boolean;
  isFeatured?: boolean;
  createdAt: any;
}

export interface CartItem {
  product: Product;
  selectedSize: string;
  selectedColor: string;
  quantity: number;
}

export interface Wallet {
  id: string;
  name: string;
  numberOrAddress: string;
  holderName?: string;
  instructions?: string;
  active: boolean;
}

export interface BannerAd {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  link?: string;
  active: boolean;
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'sale' | 'alert';
  createdAt: any;
  active: boolean;
  duration?: number; // duration in seconds
}

export interface SystemUser {
  id: string;
  username: string;
  displayName: string;
  passwordHash: string; // we will use it for simple comparison or text
  role: 'admin' | 'sales' | 'cs'; // admin: full, sales: read settings, edit orders, products, banners, notifications. cs: only view/edit orders.
  active: boolean;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerCity: string;
  customerAddress: string;
  items: {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    selectedSize: string;
    selectedColor: string;
    image: string;
  }[];
  totalAmount: number;
  paymentMethod: 'cash' | 'wallet';
  walletId?: string | null;
  walletName?: string | null;
  walletNumber?: string | null;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  createdAt: any;
  notes?: string;
}

export interface StoreSettings {
  storeName: string;
  whatsappNumber: string;
  contactPhone: string;
  logoText: string;
  logoUrl?: string;
  allowCashOnDelivery: boolean;
  primaryColor?: string;
  announcementText?: string;
  announcementActive?: boolean;
}
