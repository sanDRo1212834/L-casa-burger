export type Extra = {
  id: string;
  name: string;
  price: number;
  type?: 'extra' | 'combo';
};

export type Category = {
  id: string;
  name: string;
  extras?: Extra[];
};

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  image: string;
  stock: number;
  sales: number; // For "mais saídos" carousel
  likes?: number;
  extras?: Extra[];
};

export type CartItemExtra = {
  extra: Extra;
  quantity: number;
};

export type CartItem = {
  id?: string;
  product: Product;
  quantity: number;
  observation?: string;
  selectedExtras?: CartItemExtra[];
};

export type Address = {
  cep: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  complement?: string;
};

export type PaymentMethod = 'pix' | 'money' | 'card_machine';
export type DeliveryType = 'delivery' | 'pickup';
export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled';

export type Order = {
  id: string;
  orderNumber?: number;
  createdAt: string;
  customerName: string;
  phone: string;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  deliveryType: DeliveryType;
  address?: Address;
  paymentMethod: PaymentMethod;
  changeFor?: number; // Troco para quanto
};

export type Customer = {
  id: string;
  name: string;
  phone: string;
  totalOrders: number;
};

export type Employee = {
  id: string;
  name: string;
  role: string;
  active: boolean;
};

export type TableReport = {
  id: string;
  tableNumber: number;
  status: 'free' | 'occupied' | 'closing';
  currentTotal: number;
};
