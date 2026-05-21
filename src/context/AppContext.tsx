import React, { createContext, useContext, useState, useEffect } from 'react';
import { Category, Product, Order, Customer, Employee, TableReport, CartItem } from '../types';
import { supabase } from '../lib/supabase';

const getSupabaseUrl = () => {
  let url = import.meta.env.VITE_SUPABASE_URL || '';
  if (typeof url === 'string') {
    if (url.startsWith('"') && url.endsWith('"')) url = url.replace(/^"|"$/g, '');
    url = url.trim();
  }
  return url;
};

const isSupabaseConfigured = () => {
  const url = getSupabaseUrl();
  return url && url !== "" && url !== "https://placeholder.supabase.co";
};

type AppState = {
  view: 'customer' | 'admin' | 'login';
  setView: (view: 'customer' | 'admin' | 'login') => void;
  
  categories: Category[];
  products: Product[];
  orders: Order[];
  customers: Customer[];
  employees: Employee[];
  tables: TableReport[];

  // Admin Actions
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  removeProduct: (id: string) => void;
  
  addCategory: (category: Category) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;

  // Cart Actions
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number, observation?: string) => void;
  removeFromCart: (productId: string, observation?: string) => void;
  updateCartQuantity: (productId: string, quantity: number, observation?: string) => void;
  clearCart: () => void;
  cartTotal: number;

  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Order Submission
  submitOrder: (order: Omit<Order, 'id' | 'createdAt'>) => Promise<Order>;

  myOrders: Order[];

  toggleLikeProduct: (productId: string) => void;
  likedProducts: string[];

  // Auth User
  user: any;
  setUser: (user: any) => void;
  isAdmin: boolean;
};

const AppContext = createContext<AppState | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [view, setView] = useState<'customer' | 'admin' | 'login'>('admin');
  const [user, setUser] = useState<any>({ email: 'sousasandro419@gmail.com' });
  
  const adminEmails = ['sousasandro419@gmail.com', 'admin@email.com'];
  const isAdmin = user ? adminEmails.includes(user.email) : false;
  
  const [likedProducts, setLikedProducts] = useState<string[]>(() => {
    try {
      const item = localStorage.getItem('likedProducts');
      return item ? JSON.parse(item) : [];
    } catch (error) {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('likedProducts', JSON.stringify(likedProducts));
  }, [likedProducts]);

  const [myOrderIds, setMyOrderIds] = useState<string[]>(() => {
    try {
      const item = localStorage.getItem('myOrderIds');
      return item ? JSON.parse(item) : [];
    } catch (error) {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('myOrderIds', JSON.stringify(myOrderIds));
  }, [myOrderIds]);

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  
  const myOrders = orders.filter(o => myOrderIds.includes(o.id));

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [tables, setTables] = useState<TableReport[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);

  // Supabase Data Fetching
  useEffect(() => {
    if (!isSupabaseConfigured()) return; // Fallback to mock data if no Supabase URL is set
    
    const fetchData = async () => {
      const [{ data: cats }, { data: prods }, { data: ords }] = await Promise.all([
        supabase.from('categories').select('*'),
        supabase.from('products').select('*'),
        supabase.from('orders').select('*').order('created_at', { ascending: false })
      ]);

      if (cats && cats.length > 0) setCategories(cats);
      if (prods && prods.length > 0) setProducts(prods);
      if (ords && ords.length > 0) {
        setOrders(ords.map((o: any, idx: number) => ({
          ...o,
          orderNumber: ords.length - idx,
          createdAt: o.created_at,
          customerName: o.customer_name,
          paymentMethod: o.payment_method
        })));
      }
    };
    
    fetchData();
  }, []);

  const cartTotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  // --- Cart Methods ---
  const addToCart = (product: Product, quantity = 1, observation = '') => {
    setCart(prev => {
      // Find exact same product with same observation
      const existing = prev.find(item => item.product.id === product.id && (item.observation || '') === observation);
      if (existing) {
        return prev.map(item => (item.product.id === product.id && (item.observation || '') === observation) ? { ...item, quantity: item.quantity + quantity } : item);
      }
      return [...prev, { product, quantity, observation }];
    });
  };

  const removeFromCart = (productId: string, observation = '') => {
    setCart(prev => prev.filter(item => !(item.product.id === productId && (item.observation || '') === observation)));
  };

  const updateCartQuantity = (productId: string, quantity: number, observation = '') => {
    if (quantity <= 0) {
      removeFromCart(productId, observation);
      return;
    }
    setCart(prev => prev.map(item => (item.product.id === productId && (item.observation || '') === observation) ? { ...item, quantity } : item));
  };

  const clearCart = () => setCart([]);

  // --- Admin Methods ---
  const addProduct = async (product: Product) => {
    setProducts(prev => [...prev, product]);
    if (isSupabaseConfigured()) {
      await supabase.from('products').insert([{ ...product, category_id: product.categoryId }]);
    }
  };

  const updateProduct = async (updatedProduct: Product) => {
    setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
    if (isSupabaseConfigured()) {
      // Don't update the ID
      const { id, categoryId, ...rest } = updatedProduct;
      await supabase.from('products').update({ ...rest, category_id: categoryId }).eq('id', updatedProduct.id);
    }
  };

  const removeProduct = async (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    if (isSupabaseConfigured()) {
      await supabase.from('products').delete().eq('id', id);
    }
  };
  
  const toggleLikeProduct = async (productId: string) => {
    const isLiked = likedProducts.includes(productId);
    
    setLikedProducts(prev => 
      isLiked ? prev.filter(id => id !== productId) : [...prev, productId]
    );

    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        const newLikes = Math.max(0, (p.likes || 0) + (isLiked ? -1 : 1));
        if (isSupabaseConfigured()) {
          supabase.from('products').update({ likes: newLikes }).eq('id', productId);
        }
        return { ...p, likes: newLikes };
      }
      return p;
    }));
  };
  
  const addCategory = async (category: Category) => {
    setCategories(prev => [...prev, category]);
    if (isSupabaseConfigured()) {
      await supabase.from('categories').insert([category]);
    }
  };
  
  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
    if (isSupabaseConfigured()) {
      await supabase.from('orders').update({ status }).eq('id', orderId);
    }
  };

  const submitOrder = async (orderData: Omit<Order, 'id' | 'createdAt'>) => {
    const isSupabaseConfiguredFlag = isSupabaseConfigured();
    const currentOrderNumber = orders.length + 1;
    let newOrder: Order;
    
    if (isSupabaseConfiguredFlag) {
      const dbOrder = {
        customer_name: orderData.customerName,
        phone: orderData.phone,
        items: orderData.items,
        total: orderData.total,
        status: orderData.status,
        payment_method: orderData.paymentMethod,
        change_for: orderData.changeFor,
        address: orderData.address
      };
      const { data, error } = await supabase.from('orders').insert([dbOrder]).select().single();
      
      newOrder = {
        ...orderData,
        orderNumber: currentOrderNumber,
        id: data?.id || Math.random().toString(36).substr(2, 9),
        createdAt: data?.created_at || new Date().toISOString()
      };

      // Realistically we also should update product stock in Supabase, but keeping it simple for the migration:
      if (!error) {
         for (const item of orderData.items) {
             const p = products.find(prod => prod.id === item.product.id);
             if (p) {
               await supabase.from('products').update({ 
                 stock: Math.max(0, p.stock - item.quantity), 
                 sales: p.sales + item.quantity 
               }).eq('id', p.id);
             }
         }
      }
    } else {
      newOrder = {
        ...orderData,
        orderNumber: currentOrderNumber,
        id: Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString()
      };
    }
    
    setOrders(prev => [newOrder, ...prev]);
    setMyOrderIds(prev => [newOrder.id, ...prev]);
    
    // Auto add customer
    setCustomers(prev => {
      const existing = prev.find(c => c.phone === newOrder.phone);
      if (existing) {
        return prev.map(c => c.phone === newOrder.phone ? { ...c, totalOrders: c.totalOrders + 1 } : c);
      }
      return [...prev, { id: Math.random().toString(36).substr(2, 9), name: newOrder.customerName, phone: newOrder.phone, totalOrders: 1 }];
    });

    // Reduce stock locally
    setProducts(prev => {
       const mapped = prev.map(p => {
         const inCart = newOrder.items.find(i => i.product.id === p.id);
         if (inCart) {
           return { ...p, stock: Math.max(0, p.stock - inCart.quantity), sales: p.sales + inCart.quantity };
         }
         return p;
       })
       return mapped;
    });

    clearCart();
    return newOrder;
  };

  return (
    <AppContext.Provider value={{
      view, setView,
      categories, products, orders, customers, employees, tables,
      searchQuery, setSearchQuery,
      addProduct, updateProduct, removeProduct, addCategory, updateOrderStatus,
      toggleLikeProduct, likedProducts,
      isCartOpen, setIsCartOpen, cart, addToCart, removeFromCart, updateCartQuantity, clearCart, cartTotal,
      submitOrder, myOrders,
      user, setUser, isAdmin
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppContext must be used within AppProvider");
  return context;
};
