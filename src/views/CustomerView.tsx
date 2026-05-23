import React, { useState } from "react";
import { useAppContext } from "../context/AppContext";
import { motion, AnimatePresence } from "motion/react";
import {
  ShoppingBag,
  ChevronRight,
  X,
  Loader2,
  MapPin,
  Map,
  CreditCard,
  Banknote,
  Smartphone,
  Store,
  Home,
  Receipt,
  TicketPercent,
  ShoppingCart,
  Search,
  CheckCircle2,
  Contact2,
  Package,
  Settings,
  Minus,
  Plus,
  Heart,
  User,
  Camera,
} from "lucide-react";
import { fetchAddressByCep } from "../context/utils/cep";
import { Product, Address, DeliveryType, PaymentMethod } from "../types";
import { ProductModal } from "../components/ProductModal";

const formatPrice = (price: number) => {
  return price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
};

export function CustomerView() {
  const {
    categories,
    products,
    addToCart,
    isCartOpen,
    setIsCartOpen,
    searchQuery,
    toggleLikeProduct,
    likedProducts,
    setView,
    myOrders,
  } = useAppContext();
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<"home" | "orders" | "promos">(
    "home",
  );
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return {
          label: "Recebemos seu pedido",
          bg: "bg-yellow-100",
          text: "text-yellow-800",
        };
      case "preparing":
        return {
          label: "Em Produção",
          bg: "bg-blue-100",
          text: "text-blue-800",
        };
      case "ready":
        return {
          label: "Pronto para Retirada",
          bg: "bg-orange-100",
          text: "text-orange-800",
        };
      case "delivered":
        return {
          label: "Entregue",
          bg: "bg-green-100",
          text: "text-green-800",
        };
      case "cancelled":
        return { label: "Cancelado", bg: "bg-red-100", text: "text-red-800" };
      default:
        return {
          label: status,
          bg: "bg-neutral-100",
          text: "text-neutral-800",
        };
    }
  };

  // Sorting products by sales and likes for "Mais Saídos" carousel
  const bestSellers = [...products]
    .sort((a, b) => (b.likes || 0) + b.sales - ((a.likes || 0) + a.sales))
    .slice(0, 5);

  const filteredProducts = products.filter((p) => {
    const matchesCategory =
      activeCategory === "all" || p.categoryId === activeCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="pb-24">
      {activeTab === "home" && (
        <>
          {/* Hero / Best Sellers Carousel */}
          <section className="bg-neutral-900 text-white pt-8 pb-12 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-2xl font-black italic uppercase text-yellow-400 mb-6 tracking-wide">
                🔥 Mais Saídos
              </h2>

              <div className="flex overflow-x-auto gap-4 pb-4 snap-x hide-scrollbar">
                {bestSellers.map((product) => (
                  <motion.div
                    key={`best-${product.id}`}
                    className="flex-none w-72 sm:w-80 bg-neutral-800 rounded-2xl overflow-hidden snap-center cursor-pointer group origin-center"
                    whileHover={{ scale: 1.05, y: -5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    onClick={() => setSelectedProduct(product)}
                  >
                    <div className="h-48 overflow-hidden relative">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLikeProduct(product.id);
                        }}
                        className={`absolute top-3 right-3 h-8 ${product.likes ? "px-3" : "w-8"} rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:text-red-500 transition-colors z-10 gap-1.5`}
                      >
                        <Heart
                          className={`w-4 h-4 ${likedProducts.includes(product.id) ? "fill-red-500 text-red-500" : ""}`}
                        />
                        {!!product.likes && (
                          <span className="text-xs font-bold">
                            {product.likes}
                          </span>
                        )}
                      </button>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4 text-white">
                        <h3 className="font-bold text-lg leading-tight">
                          {product.name}
                        </h3>
                        <p className="text-yellow-400 font-black mt-1">
                          R$ {product.price.toFixed(2).replace(".", ",")}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* Menu Section */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
            {/* Categories */}
            <div className="flex overflow-x-auto gap-2 pb-2 mb-8 hide-scrollbar">
              <button
                onClick={() => setActiveCategory("all")}
                className={`px-6 py-2 rounded-full font-bold whitespace-nowrap transition-colors ${
                  activeCategory === "all"
                    ? "bg-red-600 text-white"
                    : "bg-white text-neutral-600 border border-neutral-200 hover:border-red-600 hover:text-red-600"
                }`}
              >
                Todos
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-6 py-2 rounded-full font-bold whitespace-nowrap transition-colors ${
                    activeCategory === cat.id
                      ? "bg-red-600 text-white"
                      : "bg-white text-neutral-600 border border-neutral-200 hover:border-red-600 hover:text-red-600"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Product Grid */}
            <div className="space-y-12">
              {(activeCategory === "all" && !searchQuery
                ? categories
                : [{ id: "filtered", name: "Resultados" }]
              ).map((group) => {
                const groupProducts =
                  activeCategory === "all" && !searchQuery
                    ? filteredProducts.filter((p) => p.categoryId === group.id)
                    : filteredProducts;

                if (groupProducts.length === 0) return null;

                return (
                  <div key={group.id}>
                    {activeCategory === "all" && !searchQuery && (
                      <h2 className="text-2xl font-black text-neutral-900 mb-6 flex items-center gap-3">
                        {group.name}
                        <span className="text-sm font-bold bg-neutral-100 text-neutral-500 px-3 py-1 rounded-full">
                          {groupProducts.length}
                        </span>
                      </h2>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {groupProducts.map((product) => (
                        <motion.div
                          layout
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          key={product.id}
                          onClick={() => setSelectedProduct(product)}
                          className="bg-white rounded-2xl overflow-hidden border border-neutral-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-row h-[140px] sm:h-[160px] cursor-pointer"
                        >
                          <div className="p-4 sm:p-5 flex flex-col flex-grow w-1/2 justify-between">
                            <div>
                              <h3 className="font-bold text-base sm:text-lg text-neutral-900 leading-tight">
                                {product.name}
                              </h3>
                              <p className="text-xs sm:text-sm text-neutral-500 mt-1 line-clamp-2">
                                {product.description}
                              </p>
                            </div>
                            <div className="mt-2 flex items-center justify-between">
                              <span className="font-black text-lg sm:text-xl text-neutral-900">
                                R$ {product.price.toFixed(2).replace(".", ",")}
                              </span>
                            </div>
                          </div>
                          <div className="w-[120px] sm:w-[160px] overflow-hidden relative group flex-shrink-0 h-full">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleLikeProduct(product.id);
                              }}
                              className={`absolute top-2 right-2 h-8 ${product.likes ? "px-3" : "w-8"} rounded-full bg-white/70 backdrop-blur-md flex items-center justify-center text-neutral-600 hover:text-red-500 transition-colors z-10 gap-1.5`}
                            >
                              <Heart
                                className={`w-4 h-4 ${likedProducts.includes(product.id) ? "fill-red-500 text-red-500" : ""}`}
                              />
                              {!!product.likes && (
                                <span className="text-xs font-bold text-red-600">
                                  {product.likes}
                                </span>
                              )}
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </>
      )}

      {activeTab === "orders" && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 mb-24">
          <h2 className="text-2xl font-black text-neutral-900 mb-6">
            Meus Pedidos
          </h2>

          {myOrders.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-neutral-100 flex flex-col items-center justify-center text-center shadow-sm">
              <Receipt className="w-16 h-16 text-neutral-300 mb-4" />
              <h3 className="font-bold text-lg text-neutral-900 mb-2">
                Nenhum pedido ainda
              </h3>
              <p className="text-neutral-500 mb-6 max-w-sm">
                Você ainda não realizou nenhum pedido. Faça o seu primeiro
                pedido com a gente e acompanhe por aqui.
              </p>
              <button
                onClick={() => setActiveTab("home")}
                className="bg-red-600 text-white px-6 py-3 rounded-full font-bold hover:bg-red-700 transition-colors"
              >
                Explorar Cardápio
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {myOrders.map((order) => {
                const status = getStatusLabel(order.status);
                return (
                  <div
                    key={order.id}
                    className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100 transition-all hover:border-red-200"
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-bold text-lg text-neutral-900">
                            Pedido #{order.orderNumber || order.id.slice(0, 4)}
                          </span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-bold ${status.bg} ${status.text}`}
                          >
                            {status.label}
                          </span>
                        </div>
                        <p className="text-sm text-neutral-500">
                          {new Date(order.createdAt).toLocaleString("pt-BR")}
                        </p>
                      </div>
                      <div className="text-right flex flex-col sm:items-end">
                        <span className="text-sm font-medium text-neutral-500 mb-1">
                          Total do Pedido
                        </span>
                        <span className="font-black text-xl text-neutral-900">
                          {formatPrice(order.total)}
                        </span>
                      </div>
                    </div>

                    <div className="border-t border-neutral-100 pt-4 mt-4">
                      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4">
                        <div className="text-sm font-medium text-neutral-600 bg-neutral-50 p-3 rounded-xl border border-neutral-100 flex-1">
                          <p className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-neutral-900">
                              Forma de Pagamento:
                            </span>
                            {order.paymentMethod === "pix"
                              ? "PIX"
                              : order.paymentMethod === "card_machine"
                                ? "Máquina de Cartão"
                                : order.paymentMethod === "money"
                                  ? "Dinheiro"
                                  : "Não informado"}
                            {order.paymentMethod === "money" &&
                              order.changeFor &&
                              ` (Troco para R$ ${order.changeFor.toFixed(2).replace(".", ",")})`}
                          </p>
                          <p className="flex items-center gap-2">
                            <span className="font-bold text-neutral-900">
                              Entrega:
                            </span>
                            {order.deliveryType === "delivery"
                              ? "Delivery"
                              : order.deliveryType === "pickup"
                                ? "Retirada no Local"
                                : "Não informado"}
                          </p>
                        </div>
                        <div className="flex items-center">
                          <button
                            onClick={() => {
                              order.items.forEach((item) => {
                                addToCart(
                                  item.product,
                                  item.quantity,
                                  item.observation,
                                  item.selectedExtras,
                                );
                              });
                              setIsCartOpen(true);
                            }}
                            className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold bg-neutral-900 text-white hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2"
                          >
                            <ShoppingCart className="w-4 h-4" />
                            Repetir Pedido
                          </button>
                        </div>
                      </div>

                      <h4 className="text-sm font-bold text-neutral-700 mb-2 border-b border-neutral-50 pb-2">
                        Itens do Pedido:
                      </h4>
                      <ul className="space-y-2">
                        {order.items.map((item, idx) => {
                          const extrasTotal =
                            item.selectedExtras?.reduce(
                              (sum, ext) =>
                                sum + ext.extra.price * ext.quantity,
                              0,
                            ) || 0;
                          return (
                            <li
                              key={idx}
                              className="flex justify-between items-start text-sm"
                            >
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="bg-neutral-100 text-neutral-600 font-bold px-2 py-0.5 rounded text-xs">
                                    {item.quantity}x
                                  </span>
                                  <span className="text-neutral-700">
                                    {item.product.name}
                                  </span>
                                </div>
                                {item.selectedExtras &&
                                  item.selectedExtras.length > 0 && (
                                    <div className="ml-9 mt-1 text-xs text-neutral-500">
                                      {item.selectedExtras.map((ex) => (
                                        <p key={ex.extra.id}>
                                          + {ex.quantity}x {ex.extra.name}
                                        </p>
                                      ))}
                                    </div>
                                  )}
                              </div>
                              <span className="text-neutral-500 font-medium whitespace-nowrap">
                                {formatPrice(
                                  (item.product.price + extrasTotal) *
                                    item.quantity,
                                )}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {activeTab === "promos" && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 space-y-6">
          <h2 className="text-2xl font-black text-neutral-900 mb-6">
            Promoções Ativas
          </h2>

          <div className="bg-gradient-to-r from-red-600 to-red-500 rounded-3xl p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden group">
            <div className="absolute -right-8 -top-8 w-48 h-48 bg-white/20 rounded-full blur-3xl group-hover:bg-white/30 transition-colors" />
            <div className="relative z-10 flex-1">
              <span className="bg-yellow-400 text-black px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-4 inline-block">
                10% OFF
              </span>
              <h3 className="font-black text-3xl mb-2 italic">Boas Vindas!</h3>
              <p className="text-red-100 font-medium">
                Use o código abaixo no fechamento do seu primeiro pedido para
                ganhar 10% de desconto.
              </p>
            </div>
            <div className="relative z-10 bg-white/10 p-5 rounded-2xl backdrop-blur-sm border border-white/20 text-center min-w-[200px]">
              <span className="font-mono text-xl font-bold tracking-widest text-yellow-400 block mb-2">
                BEMVINDO10
              </span>
              <button className="w-full bg-white text-red-600 font-bold px-4 py-2 rounded-xl text-sm hover:bg-neutral-100 w-full transition-colors">
                Copiar Cupom
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-r from-teal-600 to-teal-500 rounded-3xl p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden group">
            <div className="absolute -right-8 -top-8 w-48 h-48 bg-white/20 rounded-full blur-3xl group-hover:bg-white/30 transition-colors" />
            <div className="relative z-10 flex-1">
              <span className="bg-yellow-400 text-black px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-4 inline-block">
                Frete Grátis
              </span>
              <h3 className="font-black text-3xl mb-2 italic">Delivery Free</h3>
              <p className="text-teal-100 font-medium">
                Nas compras acima de R$ 100,00 o delivery é por nossa conta!
              </p>
            </div>
            <div className="relative z-10 bg-white/10 p-5 rounded-2xl backdrop-blur-sm border border-white/20 text-center min-w-[200px] flex items-center justify-center">
              <p className="font-bold">Aplicado automaticamente</p>
            </div>
          </div>
        </section>
      )}

      {/* Spacer */}
      <div className="h-16"></div>

      {/* Customer Bottom Navigation (Mobile) */}
      <CustomerBottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && <CartDrawer onClose={() => setIsCartOpen(false)} />}
      </AnimatePresence>

      {/* Product Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <ProductModal
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function FloatingCartButton({ onClick }: { onClick: () => void }) {
  const { cart, cartTotal } = useAppContext();
  const itemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  if (itemCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-0 right-0 p-4 z-40 pointer-events-none flex justify-center sm:hidden">
      <button
        onClick={onClick}
        className="pointer-events-auto w-full max-w-sm bg-red-600 hover:bg-red-700 text-white rounded-full p-4 flex items-center justify-between shadow-2xl"
      >
        <div className="flex items-center gap-3">
          <div className="bg-white/20 w-8 h-8 rounded-full flex items-center justify-center font-bold">
            {itemCount}
          </div>
          <span className="font-bold">Ver sacola</span>
        </div>
        <span className="font-black">
          R$ {cartTotal.toFixed(2).replace(".", ",")}
        </span>
      </button>
    </div>
  );
}

function CustomerBottomNav({
  activeTab,
  setActiveTab,
}: {
  activeTab: string;
  setActiveTab: (t: any) => void;
}) {
  const { cart, setIsCartOpen, setView } = useAppContext();
  const itemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 flex justify-between px-2 pt-2 pb-safe z-40 sm:hidden overflow-x-auto hide-scrollbar">
      <div className="flex justify-around w-full max-w-md mx-auto">
        <BottomNavItem
          icon={<Home />}
          label="Início"
          active={activeTab === "home"}
          onClick={() => setActiveTab("home")}
        />
        <BottomNavItem
          icon={<Receipt />}
          label="Pedidos"
          active={activeTab === "orders"}
          onClick={() => setActiveTab("orders")}
        />
        <BottomNavItem
          icon={<TicketPercent />}
          label="Promos"
          active={activeTab === "promos"}
          onClick={() => setActiveTab("promos")}
        />
        <BottomNavItem
          icon={
            <div className="relative border-none bg-transparent">
              <ShoppingCart />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-red-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {itemCount}
                </span>
              )}
            </div>
          }
          label="Carrinho"
          active={false}
          onClick={() => setIsCartOpen(true)}
        />
        <BottomNavItem
          icon={<User />}
          label="Conta"
          active={false}
          onClick={() => setView("login")}
        />
      </div>
    </nav>
  );
}

function BottomNavItem({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center p-2 min-w-[64px] transition-colors ${active ? "text-red-600" : "text-neutral-500 hover:text-red-600"}`}
    >
      <div className="w-6 h-6 mb-1 [&>svg]:w-6 [&>svg]:h-6 flex items-center justify-center">
        {icon}
      </div>
      <span className="text-[10px] font-bold">{label}</span>
    </button>
  );
}

function CartDrawer({ onClose }: { onClose: () => void }) {
  const { cart, updateCartQuantity, removeFromCart, cartTotal, submitOrder } =
    useAppContext();
  const [step, setStep] = useState<"cart" | "checkout" | "success">("cart");

  // Checkout State
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [deliveryType, setDeliveryType] = useState<DeliveryType>("delivery");
  const [cep, setCep] = useState("");
  const [street, setStreet] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [cepLoading, setCepLoading] = useState(false);
  const [cepError, setCepError] = useState("");
  const [number, setNumber] = useState("");
  const [complement, setComplement] = useState("");

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("pix");
  const [changeFor, setChangeFor] = useState("");
  const [pixReceipt, setPixReceipt] = useState<string>("");
  const [pixVerifying, setPixVerifying] = useState(false);
  const [pixError, setPixError] = useState("");

  const handlePixUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPixReceipt(reader.result as string);
        setPixError("");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCepLookup = async () => {
    if (cep.length < 8) return;
    setCepLoading(true);
    setCepError("");
    try {
      const result = await fetchAddressByCep(cep);
      setStreet(result.street || "");
      setNeighborhood(result.neighborhood || "");
      setCity(result.city || "");
      setState(result.state || "");
    } catch (err: any) {
      setCepError(err.message);
    } finally {
      setCepLoading(false);
    }
  };

  const [submittedOrder, setSubmittedOrder] = useState<any>(null);

  const handleFinishOrder = async () => {
    if (paymentMethod === "pix" && !pixReceipt) {
      setPixError("Por favor envie o comprovante do PIX.");
      return;
    }

    let status = "pending";

    if (paymentMethod === "pix") {
      setPixVerifying(true);
      setPixError("");
      try {
        const response = await fetch("/api/verify-pix", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            image: pixReceipt,
            expectedAmount: cartTotal,
          }),
        });
        const data = await response.json();
        setPixVerifying(false);
        if (response.ok && data.valid) {
          status = "preparing"; // Auto agree because amount is correct
        } else {
          setPixError(
            data.message || "Comprovante inválido ou valor incorreto.",
          );
          return;
        }
      } catch (err: any) {
        setPixVerifying(false);
        setPixError("Erro na verificação do PIX: " + err.message);
        return;
      }
    }

    const newOrder = await submitOrder({
      customerName,
      phone,
      items: cart,
      total: cartTotal,
      status: status as any,
      deliveryType,
      address:
        deliveryType === "delivery"
          ? { cep, street, neighborhood, city, state, number, complement }
          : undefined,
      paymentMethod,
      changeFor:
        paymentMethod === "money" && changeFor
          ? parseFloat(changeFor)
          : undefined,
      pixReceipt,
    });
    setSubmittedOrder(newOrder);
    setStep("success");
  };

  const isCheckoutValid = () => {
    if (!customerName || !phone) return false;
    if (phone.length < 10 || phone.length > 11) return false;
    if (deliveryType === "delivery") {
      if (!street || !neighborhood || !number) return false;
    }
    if (paymentMethod === "money" && !changeFor) return false;
    if (paymentMethod === "pix" && !pixReceipt) return false;
    return true;
  };

  return (
    <>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-end"
      />
      <motion.div
        key="drawer"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed top-0 bottom-0 right-0 w-full sm:w-[480px] bg-white z-50 shadow-2xl flex flex-col"
      >
        <div className="p-4 border-b border-neutral-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <h2 className="font-black text-xl text-neutral-900 uppercase italic">
            {step === "cart"
              ? "Sua Sacola"
              : step === "checkout"
                ? "Finalizar Pedido"
                : "Pedido Confirmado!"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-neutral-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 hide-scrollbar bg-neutral-50">
          {step === "cart" &&
            (cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-neutral-400">
                <ShoppingBag className="w-16 h-16 mb-4 opacity-50" />
                <p className="font-medium text-lg">Sua sacola está vazia</p>
                <button
                  onClick={onClose}
                  className="mt-4 text-red-600 font-bold hover:underline"
                >
                  Ver cardápio
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map((item, idx) => (
                  <div
                    key={item.product.id + "-" + idx}
                    className="flex gap-4 bg-white p-3 rounded-2xl shadow-sm border border-neutral-100"
                  >
                    <img
                      src={item.product.image}
                      className="w-20 h-20 rounded-xl object-cover"
                      alt=""
                    />
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-bold text-neutral-900 leading-tight">
                          {item.product.name}
                        </h4>
                        {item.observation && (
                          <p className="text-xs text-neutral-500 mt-0.5 line-clamp-1 italic">
                            Obs: {item.observation}
                          </p>
                        )}
                        {item.selectedExtras &&
                          item.selectedExtras.length > 0 && (
                            <div className="mt-1">
                              {item.selectedExtras.map((ext) => (
                                <p
                                  key={ext.extra.id}
                                  className="text-xs text-neutral-600"
                                >
                                  + {ext.quantity}x {ext.extra.name}
                                </p>
                              ))}
                            </div>
                          )}
                        <p className="text-red-600 font-bold text-sm mt-1">
                          R${" "}
                          {(
                            (item.product.price +
                              (item.selectedExtras?.reduce(
                                (sum, ext) =>
                                  sum + ext.extra.price * ext.quantity,
                                0,
                              ) || 0)) *
                            item.quantity
                          )
                            .toFixed(2)
                            .replace(".", ",")}
                        </p>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() =>
                              updateCartQuantity(item.id!, item.quantity - 1)
                            }
                            className="w-8 h-8 rounded-full bg-neutral-100 font-bold text-neutral-600 flex items-center justify-center hover:bg-neutral-200"
                          >
                            -
                          </button>
                          <span className="font-bold w-4 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateCartQuantity(item.id!, item.quantity + 1)
                            }
                            className="w-8 h-8 rounded-full bg-red-100 font-bold text-red-600 flex items-center justify-center hover:bg-red-200"
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id!)}
                          className="w-8 h-8 rounded-full bg-white text-neutral-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}

          {step === "checkout" && (
            <div className="space-y-6">
              {/* Personal Info */}
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-neutral-100 space-y-4">
                <h3 className="font-bold text-neutral-900 flex items-center gap-2">
                  <Contact2 className="w-5 h-5 text-red-600" />
                  Seus Dados
                </h3>
                <input
                  type="text"
                  placeholder="Nome Completo"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full p-3 rounded-xl border border-neutral-200 focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none"
                />
                <input
                  type="tel"
                  placeholder="Seu WhatsApp (apenas números)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                  className="w-full p-3 rounded-xl border border-neutral-200 focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none"
                />
              </div>

              {/* Delivery or Pickup */}
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-neutral-100 space-y-4">
                <h3 className="font-bold text-neutral-900 flex items-center gap-2">
                  <Package className="w-5 h-5 text-red-600" />
                  Como deseja receber?
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setDeliveryType("delivery")}
                    className={`flex-1 p-3 rounded-xl border font-bold flex items-center justify-center gap-2 transition-colors ${deliveryType === "delivery" ? "bg-red-50 border-red-200 text-red-700" : "bg-neutral-50 border-neutral-200 text-neutral-500 hover:bg-neutral-100"}`}
                  >
                    <Smartphone className="w-5 h-5" /> Delivery
                  </button>
                  <button
                    onClick={() => setDeliveryType("pickup")}
                    className={`flex-1 p-3 rounded-xl border font-bold flex items-center justify-center gap-2 transition-colors ${deliveryType === "pickup" ? "bg-yellow-50 border-yellow-200 text-yellow-700" : "bg-neutral-50 border-neutral-200 text-neutral-500 hover:bg-neutral-100"}`}
                  >
                    <Store className="w-5 h-5" /> Retirar
                  </button>
                </div>

                {deliveryType === "delivery" && (
                  <div className="pt-4 space-y-4 border-t border-neutral-100 mt-4">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="CEP (somente números)"
                        value={cep}
                        onChange={(e) =>
                          setCep(e.target.value.replace(/\D/g, ""))
                        }
                        className="flex-1 p-3 rounded-xl border border-neutral-200 focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none"
                        maxLength={8}
                      />
                      <button
                        onClick={handleCepLookup}
                        disabled={cepLoading || cep.length < 8}
                        className="bg-neutral-900 text-white px-4 rounded-xl font-bold disabled:opacity-50"
                      >
                        {cepLoading ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Search className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    {cepError && (
                      <p className="text-red-500 text-sm font-medium">
                        {cepError}
                      </p>
                    )}

                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="space-y-4"
                    >
                      <div className="flex flex-col gap-4">
                        <input
                          type="text"
                          placeholder="Rua / Avenida"
                          value={street}
                          onChange={(e) => setStreet(e.target.value)}
                          className="w-full p-3 rounded-xl border border-neutral-200 focus:border-red-600 outline-none"
                        />
                        <input
                          type="text"
                          placeholder="Bairro"
                          value={neighborhood}
                          onChange={(e) => setNeighborhood(e.target.value)}
                          className="w-full p-3 rounded-xl border border-neutral-200 focus:border-red-600 outline-none"
                        />
                        <div className="flex gap-4">
                          <input
                            type="text"
                            placeholder="Número"
                            value={number}
                            onChange={(e) => setNumber(e.target.value)}
                            className="w-1/3 p-3 rounded-xl border border-neutral-200 focus:border-red-600 outline-none"
                          />
                          <input
                            type="text"
                            placeholder="Complemento"
                            value={complement}
                            onChange={(e) => setComplement(e.target.value)}
                            className="w-2/3 p-3 rounded-xl border border-neutral-200 focus:border-red-600 outline-none"
                          />
                        </div>
                      </div>

                      {/* Map */}
                      {street && city && number && (
                        <div className="w-full h-32 bg-neutral-200 rounded-xl overflow-hidden relative border border-neutral-300">
                          <iframe
                            width="100%"
                            height="100%"
                            frameBorder="0"
                            style={{ border: 0 }}
                            src={`https://maps.google.com/maps?q=${encodeURIComponent(`${street}, ${number} - ${neighborhood}, ${city} - ${state}, ${cep}`)}&output=embed`}
                            allowFullScreen
                          ></iframe>
                        </div>
                      )}
                      {!(street && city && number) && (
                        <div className="w-full h-32 bg-neutral-200 rounded-xl overflow-hidden relative flex items-center justify-center border border-neutral-300">
                          <div
                            className="absolute inset-0 opacity-20"
                            style={{
                              backgroundImage:
                                'url("https://www.transparenttextures.com/patterns/cartographer.png")',
                            }}
                          ></div>
                          <Map className="w-8 h-8 text-neutral-400" />
                          <span className="ml-2 font-medium text-neutral-500">
                            Mapa aproximado
                          </span>
                        </div>
                      )}
                    </motion.div>
                  </div>
                )}
              </div>

              {/* Payment Info */}
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-neutral-100 space-y-4">
                <h3 className="font-bold text-neutral-900 flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-red-600" />
                  Pagamento na Entrega
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setPaymentMethod("pix")}
                    className={`p-3 rounded-xl border font-bold flex flex-col items-center justify-center gap-1 transition-colors ${paymentMethod === "pix" ? "bg-teal-50 border-teal-500 text-teal-700" : "bg-neutral-50 border-neutral-200 text-neutral-500 hover:bg-neutral-100"}`}
                  >
                    <div className="w-6 h-6 text-teal-600">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M16.48 4.29l2.76 2.76a1.48 1.48 0 010 2.1l-6.19 6.19a1.48 1.48 0 01-2.1 0l-6.19-6.19a1.48 1.48 0 010-2.1l2.76-2.76a1.48 1.48 0 012.1 0l2.38 2.38 2.38-2.38a1.48 1.48 0 012.1 0zM7.52 19.71l-2.76-2.76a1.48 1.48 0 010-2.1l6.19-6.19a1.48 1.48 0 012.1 0l6.19 6.19a1.48 1.48 0 010 2.1l-2.76 2.76a1.48 1.48 0 01-2.1 0l-2.38-2.38-2.38 2.38a1.48 1.48 0 01-2.1 0z" />
                      </svg>
                    </div>
                    PIX
                  </button>
                  <button
                    onClick={() => setPaymentMethod("card_machine")}
                    className={`p-3 rounded-xl border font-bold flex flex-col items-center justify-center gap-1 transition-colors ${paymentMethod === "card_machine" ? "bg-blue-50 border-blue-500 text-blue-700" : "bg-neutral-50 border-neutral-200 text-neutral-500 hover:bg-neutral-100"}`}
                  >
                    <CreditCard className="w-6 h-6" />
                    Máquina
                  </button>
                  <button
                    onClick={() => setPaymentMethod("money")}
                    className={`p-3 rounded-xl border font-bold flex flex-col items-center justify-center gap-1 transition-colors ${paymentMethod === "money" ? "bg-green-50 border-green-500 text-green-700" : "bg-neutral-50 border-neutral-200 text-neutral-500 hover:bg-neutral-100"}`}
                  >
                    <Banknote className="w-6 h-6" />
                    Dinheiro
                  </button>
                </div>

                {paymentMethod === "pix" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-4 p-4 bg-teal-50 border border-teal-200 rounded-xl space-y-4"
                  >
                    <div>
                      <p className="text-teal-900 font-bold mb-2">
                        Chave PIX (Celular):
                      </p>
                      <p className="text-2xl font-black text-teal-700 tracking-wider mb-2">
                        98984676536
                      </p>
                      <p className="text-sm text-teal-800 mb-4">
                        Por favor envie o comprovante do pix!
                      </p>
                    </div>
                    <div>
                      {pixReceipt ? (
                        <div className="relative rounded-lg overflow-hidden border-2 border-teal-500 max-h-48 group">
                          <img
                            src={pixReceipt}
                            alt="Comprovante"
                            className="w-full h-full object-contain bg-white"
                          />
                          <button
                            type="button"
                            onClick={() => setPixReceipt("")}
                            className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-teal-400 rounded-xl bg-white cursor-pointer hover:bg-teal-50 transition-colors">
                          <Camera className="w-6 h-6 text-teal-600 mb-2" />
                          <span className="text-sm font-bold text-teal-700 text-center px-4">
                            Tirar foto ou anexar comprovante
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handlePixUpload}
                          />
                        </label>
                      )}
                      {pixError && (
                        <p className="text-red-500 text-sm font-bold mt-2">
                          {pixError}
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}

                {paymentMethod === "money" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                  >
                    <input
                      type="number"
                      placeholder="Troco para quanto? (ex: 100)"
                      value={changeFor}
                      onChange={(e) => setChangeFor(e.target.value)}
                      className="w-full p-3 rounded-xl border border-neutral-200 focus:border-red-600 outline-none mt-2"
                    />
                  </motion.div>
                )}
              </div>
            </div>
          )}

          {step === "success" && (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 pb-20">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 15 }}
                className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6"
              >
                <CheckCircle2 className="w-12 h-12 text-green-600" />
              </motion.div>
              <h2 className="text-2xl font-black text-neutral-900 mb-2">
                Pedido Enviado!
              </h2>
              {submittedOrder && (
                <div className="bg-neutral-100 p-4 rounded-xl mb-4 w-full">
                  <p className="text-sm text-neutral-500 font-medium mb-1">
                    Seu número de pedido
                  </p>
                  <p className="text-3xl font-black text-yellow-500">
                    #
                    {submittedOrder.orderNumber ||
                      submittedOrder.id.slice(0, 4).toUpperCase()}
                  </p>
                  <p className="text-neutral-900 font-bold mt-2">
                    {submittedOrder.customerName}
                  </p>
                </div>
              )}
              <p className="text-neutral-500 mb-8">
                O restaurante já recebeu seu pedido.
                {deliveryType === "delivery"
                  ? " O entregador levará até você em breve."
                  : " Venha retirar no balcão em 30 min."}
              </p>
              <button
                onClick={onClose}
                className="w-full p-4 rounded-xl font-bold bg-neutral-900 text-white hover:bg-neutral-800 transition-colors"
              >
                Voltar ao Cardápio
              </button>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {step !== "success" && cart.length > 0 && (
          <div className="p-4 bg-white border-t border-neutral-100 shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
            <div className="flex justify-between items-center mb-4 text-neutral-600 font-medium">
              <span>Total do pedido</span>
              <span className="text-xl font-black text-neutral-900">
                R$ {cartTotal.toFixed(2).replace(".", ",")}
              </span>
            </div>

            {step === "cart" ? (
              <div className="flex gap-2">
                <button
                  onClick={onClose}
                  className="flex-1 py-4 justify-center items-center rounded-full font-bold text-sm bg-neutral-100 hover:bg-neutral-200 text-neutral-900 transition-all flex"
                >
                  Adicionar mais
                </button>
                <button
                  onClick={() => setStep("checkout")}
                  className="flex-[2] py-4 rounded-full font-bold text-lg bg-red-600 hover:bg-red-700 text-white shadow-xl shadow-red-600/20 transition-all flex justify-center items-center gap-2"
                >
                  Finalizar
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleFinishOrder}
                disabled={!isCheckoutValid() || pixVerifying}
                className="w-full py-4 rounded-full font-bold text-lg bg-yellow-400 hover:bg-yellow-500 text-black shadow-xl shadow-yellow-400/20 transition-all flex justify-center items-center gap-2 disabled:opacity-50 disabled:bg-neutral-300 disabled:shadow-none"
              >
                {pixVerifying ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin text-neutral-600" />
                    <span>Verificando PIX...</span>
                  </>
                ) : (
                  "Confirmar Pedido"
                )}
              </button>
            )}
          </div>
        )}
      </motion.div>
    </>
  );
}
