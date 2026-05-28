import React, { createContext, useContext, useState, useEffect } from "react";
import {
  Category,
  Product,
  Order,
  Customer,
  Employee,
  TableReport,
  CartItem,
  CartItemExtra,
} from "../types";
import { supabase } from "../lib/supabase";

import {
  mockCategories,
  mockProducts,
  mockEmployees,
  mockTables
} from '../data/mockData';

const getSupabaseUrl = () => {
  let url = import.meta.env.VITE_SUPABASE_URL || "";
  if (typeof url === "string") {
    if (url.startsWith('"') && url.endsWith('"'))
      url = url.replace(/^"|"$/g, "");
    url = url.trim();
  }
  return url;
};

const isSupabaseConfigured = () => {
  const url = getSupabaseUrl();
  return url && url !== "" && url !== "https://placeholder.supabase.co";
};

type AppState = {
  view: "customer" | "admin" | "login";
  setView: (view: "customer" | "admin" | "login") => void;

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
  updateCategory: (category: Category) => void;
  removeCategory: (id: string) => void;
  updateOrderStatus: (orderId: string, status: Order["status"], deliveryFee?: number) => void;
  removeOrder: (id: string) => void;
  clearAllOrders: () => void;
  clearMyOrders: () => void;

  // Cart Actions
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  cart: CartItem[];
  addToCart: (
    product: Product,
    quantity?: number,
    observation?: string,
    selectedExtras?: CartItemExtra[],
  ) => void;
  removeFromCart: (cartItemId: string) => void;
  updateCartQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;

  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Order Submission
  submitOrder: (order: Omit<Order, "id" | "createdAt">) => Promise<Order>;

  myOrders: Order[];

  toggleLikeProduct: (productId: string) => void;
  likedProducts: string[];

  // Auth User
  user: any;
  setUser: (user: any) => void;
  isAdmin: boolean;

  isLoadingData: boolean;
};

export const ADMIN_EMAILS = ["lucycosta308@gmail.com"];
const AppContext = createContext<AppState | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [view, setView] = useState<"customer" | "admin" | "login">(
    "customer",
  );
  const [user, setUser] = useState<any>(null);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(
    isSupabaseConfigured(),
  );

  const isAdmin = user
    ? ADMIN_EMAILS.includes(user.email.toLowerCase())
    : false;

  const [likedProducts, setLikedProducts] = useState<string[]>(() => {
    try {
      const item = localStorage.getItem("likedProducts");
      return item ? JSON.parse(item) : [];
    } catch (error) {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("likedProducts", JSON.stringify(likedProducts));
  }, [likedProducts]);

  const [myOrderIds, setMyOrderIds] = useState<string[]>(() => {
    try {
      const item = localStorage.getItem("myOrderIds");
      return item ? JSON.parse(item) : [];
    } catch (error) {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("myOrderIds", JSON.stringify(myOrderIds));
  }, [myOrderIds]);

  const [categories, setCategories] = useState<Category[]>(!isSupabaseConfigured() ? mockCategories : []);
  const [products, setProducts] = useState<Product[]>(!isSupabaseConfigured() ? mockProducts : []);
  const [orders, setOrders] = useState<Order[]>([]);

  const myOrders = orders.filter((o) => myOrderIds.includes(o.id));

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [employees, setEmployees] = useState<Employee[]>(!isSupabaseConfigured() ? mockEmployees : []);
  const [tables, setTables] = useState<TableReport[]>(!isSupabaseConfigured() ? mockTables : []);

  const [searchQuery, setSearchQuery] = useState("");

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);

  // Supabase Data Fetching
  useEffect(() => {
    if (!isSupabaseConfigured()) return; // Fallback to mock data if no Supabase URL is set

    const fetchData = async () => {
      try {
        const [catRes, prodRes, ordRes] = await Promise.all([
          supabase.from("categories").select("*"),
          supabase.from("products").select("*"),
          supabase
            .from("orders")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(50),
        ]);

        if (catRes.error) {
          // console.error("Error fetching categories:", catRes.error);
        }
        if (prodRes.error) {
          // console.error("Error fetching products:", prodRes.error);
        }
        if (ordRes.error) {
           // console.error("Error fetching orders:", ordRes.error);
        }

        const cats = catRes.data;
        const prods = prodRes.data;
        const ords = ordRes.data;

        if (cats && cats.length > 0) {
          const parsedCats = cats.map((c: any) => {
            let catExtras = c.extras || [];
            if ((!c.extras || c.extras.length === 0) && c.name) {
              const nameLower = c.name.toLowerCase();
              if (nameLower.includes("hamb") || nameLower.includes("combo")) {
                catExtras = [
                  {
                    id: Math.random().toString(36).substr(2, 9),
                    name: "Geleia de pimenta",
                    price: 2.0,
                    type: "extra",
                  },
                  {
                    id: Math.random().toString(36).substr(2, 9),
                    name: "Ovo",
                    price: 2.0,
                    type: "extra",
                  },
                  {
                    id: Math.random().toString(36).substr(2, 9),
                    name: "Bacon",
                    price: 2.0,
                    type: "extra",
                  },
                  {
                    id: Math.random().toString(36).substr(2, 9),
                    name: "Abacaxi",
                    price: 2.0,
                    type: "extra",
                  },
                  {
                    id: Math.random().toString(36).substr(2, 9),
                    name: "Queijo coalho",
                    price: 4.0,
                    type: "extra",
                  },
                  {
                    id: Math.random().toString(36).substr(2, 9),
                    name: "Anéis de cebola",
                    price: 2.0,
                    type: "extra",
                  },
                ];
              } else if (nameLower.includes("pastel")) {
                catExtras = [
                  {
                    id: Math.random().toString(36).substr(2, 9),
                    name: "Frango",
                    price: 0.0,
                    type: "extra",
                  },
                  {
                    id: Math.random().toString(36).substr(2, 9),
                    name: "Carne",
                    price: 0.0,
                    type: "extra",
                  },
                  {
                    id: Math.random().toString(36).substr(2, 9),
                    name: "Bacon",
                    price: 0.0,
                    type: "extra",
                  },
                  {
                    id: Math.random().toString(36).substr(2, 9),
                    name: "Ovo",
                    price: 0.0,
                    type: "extra",
                  },
                  {
                    id: Math.random().toString(36).substr(2, 9),
                    name: "Presunto",
                    price: 0.0,
                    type: "extra",
                  },
                  {
                    id: Math.random().toString(36).substr(2, 9),
                    name: "Queijo",
                    price: 0.0,
                    type: "extra",
                  },
                  {
                    id: Math.random().toString(36).substr(2, 9),
                    name: "Tomate",
                    price: 0.0,
                    type: "extra",
                  },
                  {
                    id: Math.random().toString(36).substr(2, 9),
                    name: "Catupiry",
                    price: 0.0,
                    type: "extra",
                  },
                  {
                    id: Math.random().toString(36).substr(2, 9),
                    name: "Orégano",
                    price: 0.0,
                    type: "extra",
                  },
                  {
                    id: Math.random().toString(36).substr(2, 9),
                    name: "Cheddar",
                    price: 0.0,
                    type: "extra",
                  },
                ];
              }
            }
            return { ...c, extras: catExtras };
          });
          setCategories(parsedCats);
        } else if (cats) {
          setCategories([]);
        }

        if (prods && prods.length > 0) {
          setProducts(
            prods.map((p: any) => ({
              ...p,
              categoryId: p.category_id || p.categoryId,
              price: Number(p.price) || 0,
              stock: Number(p.stock) || 0,
              sales: Number(p.sales) || 0,
              likes: Number(p.likes) || 0,
              name: p.name || "Produto sem nome",
              description: p.description || "",
              image:
                p.image ||
                "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&q=80&w=500",
            })),
          );
        } else if (prods) {
          setProducts([]);
        }

        if (ords && ords.length > 0) {
          setOrders(
            ords.map((o: any, idx: number) => ({
              ...o,
              orderNumber: ords.length - idx,
              createdAt: o.created_at,
              customerName: o.customer_name,
              paymentMethod: o.payment_method,
              deliveryType:
                o.delivery_type || (o.address ? "delivery" : "pickup"),
              deliveryFee: o.delivery_fee,
            })),
          );
        } else if (ords) {
          setOrders([]);
        }
      } catch (err: any) {
        // Fallback to mock data if fetch failed
        setCategories(mockCategories);
        setProducts(mockProducts);
        setTables(mockTables);
        setEmployees(mockEmployees);
        // console.warn("Failed to fetch data, falling back to mock:", err.message);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchData();
  }, []);

  const cartTotal = cart.reduce((sum, item) => {
    const extrasTotal =
      item.selectedExtras?.reduce(
        (extSum, ext) => extSum + ext.extra.price * ext.quantity,
        0,
      ) || 0;
    return sum + (item.product.price + extrasTotal) * item.quantity;
  }, 0);

  // --- Cart Methods ---
  const addToCart = (
    product: Product,
    quantity = 1,
    observation = "",
    selectedExtras: CartItemExtra[] = [],
  ) => {
    setCart((prev) => {
      // Find exact same product, observation, and extras
      const existing = prev.find((item) => {
        if (
          item.product.id !== product.id ||
          (item.observation || "") !== observation
        )
          return false;

        // Match extras
        const itemExtrasStr = JSON.stringify(item.selectedExtras || []);
        const newExtrasStr = JSON.stringify(selectedExtras || []);
        return itemExtrasStr === newExtrasStr;
      });

      if (existing) {
        return prev.map((item) =>
          item.id === existing.id
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        );
      }
      return [
        ...prev,
        {
          id: Math.random().toString(36).substr(2, 9),
          product,
          quantity,
          observation,
          selectedExtras,
        },
      ];
    });
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== cartItemId));
  };

  const updateCartQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.id === cartItemId ? { ...item, quantity } : item,
      ),
    );
  };

  const clearCart = () => setCart([]);

  // --- Admin Methods ---
  const addProduct = async (product: Product) => {
    if (isSupabaseConfigured()) {
      try {
        const { id, categoryId, ...rest } = product; // Remove client-generated ID
        const { data, error } = await supabase
          .from("products")
          .insert([{ ...rest, category_id: categoryId }])
          .select()
          .single();
        if (error) {
          console.error("addProduct error:", error);
          // Fallback to local
          setProducts((prev) => [...prev, product]);
        } else if (data) {
          const newProduct: Product = {
            ...product,
            id: data.id, // Use DB id
            categoryId: data.category_id || data.categoryId,
          };
          setProducts((prev) => [...prev, newProduct]);
        }
      } catch (err) {
        console.warn("addProduct sync failed:", err);
        setProducts((prev) => [...prev, product]);
      }
    } else {
      setProducts((prev) => [...prev, product]);
    }
  };

  const updateProduct = async (updatedProduct: Product) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p)),
    );
    if (isSupabaseConfigured()) {
      // Don't update the ID
      const { id, categoryId, ...rest } = updatedProduct;
      try {
        await supabase
          .from("products")
          .update({ ...rest, category_id: categoryId })
          .eq("id", updatedProduct.id);
      } catch (err) {
        console.warn("updateProduct sync failed:", err);
      }
    }
  };

  const removeProduct = async (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    if (isSupabaseConfigured()) {
      try {
        await supabase.from("products").delete().eq("id", id);
      } catch (err) {
        console.warn("removeProduct sync failed:", err);
      }
    }
  };

  const toggleLikeProduct = async (productId: string) => {
    const isLiked = likedProducts.includes(productId);

    setLikedProducts((prev) =>
      isLiked ? prev.filter((id) => id !== productId) : [...prev, productId],
    );

    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          const newLikes = Math.max(0, (p.likes || 0) + (isLiked ? -1 : 1));
          if (isSupabaseConfigured()) {
            try {
              supabase
                .from("products")
                .update({ likes: newLikes })
                .eq("id", productId);
            } catch (err) {}
          }
          return { ...p, likes: newLikes };
        }
        return p;
      }),
    );
  };

  const addCategory = async (category: Category) => {
    if (isSupabaseConfigured()) {
      try {
        const { id, ...rest } = category; // omit local ID
        const { data, error } = await supabase
          .from("categories")
          .insert([rest])
          .select()
          .single();
        if (error) {
          console.error("addCategory error:", error);
          setCategories((prev) => [...prev, category]);
        } else if (data) {
          setCategories((prev) => [...prev, { ...category, id: data.id }]);
        }
      } catch (err) {
        console.error("addCategory sync exception:", err);
        setCategories((prev) => [...prev, category]);
      }
    } else {
      setCategories((prev) => [...prev, category]);
    }
  };

  const updateCategory = async (updatedCategory: Category) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === updatedCategory.id ? updatedCategory : c)),
    );
    if (isSupabaseConfigured()) {
      const { id, ...rest } = updatedCategory;
      try {
        await supabase
          .from("categories")
          .update(rest)
          .eq("id", updatedCategory.id);
      } catch (err) {
        console.warn("updateCategory sync failed:", err);
      }
    }
  };

  const removeCategory = async (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    if (isSupabaseConfigured()) {
      try {
        await supabase.from("categories").delete().eq("id", id);
      } catch (err) {
        console.warn("removeCategory sync failed:", err);
      }
    }
  };

  const updateOrderStatus = async (
    orderId: string,
    status: Order["status"],
    deliveryFee?: number
  ) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status, deliveryFee: deliveryFee !== undefined ? deliveryFee : o.deliveryFee } : o)),
    );
    if (isSupabaseConfigured()) {
      try {
        const updatePayload: any = { status };
        if (deliveryFee !== undefined) {
          updatePayload.delivery_fee = deliveryFee;
        }
        await supabase.from("orders").update(updatePayload).eq("id", orderId);
      } catch (err) {}
    }
  };

  const removeOrder = async (id: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== id));
    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase.from("orders").delete().eq("id", id);
        if (error) console.error("Error removing order:", error);
      } catch (err) {
        console.warn("removeOrder sync failed:", err);
      }
    }
  };

  const clearAllOrders = async () => {
    setOrders([]);
    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase.from("orders").delete().neq('id', '00000000-0000-0000-0000-000000000000');
        if (error) console.error("Error clearing orders in Supabase:", error);
      } catch (err) {
        console.error("Error clearing orders", err);
      }
    }
  };

  const clearMyOrders = () => {
    setMyOrderIds([]);
  };

  const submitOrder = async (orderData: Omit<Order, "id" | "createdAt">) => {
    const isSupabaseConfiguredFlag = isSupabaseConfigured();

    // Calculate daily order number
    const today = new Date();
    const todayOrders = orders.filter((o) => {
      const oDate = new Date(o.createdAt);
      return (
        oDate.getDate() === today.getDate() &&
        oDate.getMonth() === today.getMonth() &&
        oDate.getFullYear() === today.getFullYear()
      );
    });
    const currentOrderNumber = todayOrders.length + 1;

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
        delivery_type: orderData.deliveryType,
        address: orderData.address,
      };
      let data = null,
        error = null;
      try {
        const result = await supabase
          .from("orders")
          .insert([dbOrder])
          .select()
          .single();
        data = result.data;
        error = result.error;
      } catch (err) {
        console.warn("submitOrder sync failed:", err);
      }

      newOrder = {
        ...orderData,
        orderNumber: currentOrderNumber,
        id: data?.id || Math.random().toString(36).substr(2, 9),
        createdAt: data?.created_at || new Date().toISOString(),
      };

      // Realistically we also should update product stock in Supabase, but keeping it simple for the migration:
      if (!error) {
        try {
          for (const item of orderData.items) {
            const p = products.find((prod) => prod.id === item.product.id);
            if (p) {
              await supabase
                .from("products")
                .update({
                  stock: Math.max(0, p.stock - item.quantity),
                  sales: p.sales + item.quantity,
                })
                .eq("id", p.id);
            }
          }
        } catch (updateErr) {
          console.warn("Product stock update failed", updateErr);
        }
      }
    } else {
      newOrder = {
        ...orderData,
        orderNumber: currentOrderNumber,
        id: Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString(),
      };
    }

    setOrders((prev) => [newOrder, ...prev]);
    setMyOrderIds((prev) => [newOrder.id, ...prev]);

    // Auto add customer
    setCustomers((prev) => {
      const existing = prev.find((c) => c.phone === newOrder.phone);
      if (existing) {
        return prev.map((c) =>
          c.phone === newOrder.phone
            ? { ...c, totalOrders: c.totalOrders + 1 }
            : c,
        );
      }
      return [
        ...prev,
        {
          id: Math.random().toString(36).substr(2, 9),
          name: newOrder.customerName,
          phone: newOrder.phone,
          totalOrders: 1,
        },
      ];
    });

    // Reduce stock locally
    setProducts((prev) => {
      const mapped = prev.map((p) => {
        const inCart = newOrder.items.find((i) => i.product.id === p.id);
        if (inCart) {
          return {
            ...p,
            stock: Math.max(0, p.stock - inCart.quantity),
            sales: p.sales + inCart.quantity,
          };
        }
        return p;
      });
      return mapped;
    });

    clearCart();
    return newOrder;
  };

  return (
    <AppContext.Provider
      value={{
        view,
        setView,
        categories,
        products,
        orders,
        customers,
        employees,
        tables,
        searchQuery,
        setSearchQuery,
        addProduct,
        updateProduct,
        removeProduct,
        addCategory,
        updateCategory,
        removeCategory,
        updateOrderStatus,
        removeOrder,
        clearAllOrders,
        clearMyOrders,
        toggleLikeProduct,
        likedProducts,
        isCartOpen,
        setIsCartOpen,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        cartTotal,
        submitOrder,
        myOrders,
        user,
        setUser,
        isAdmin,
        isLoadingData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context)
    throw new Error("useAppContext must be used within AppProvider");
  return context;
};
