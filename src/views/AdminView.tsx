import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { LayoutDashboard, ShoppingCart, PackageSearch, Users, Contact2, LayoutGrid, Coffee, Plus, Trash2, Edit, X, Search, Camera, ImagePlus, MessageCircle, Heart, LogOut } from 'lucide-react';
import { Product, Category, Order } from '../types';
import { supabase } from '../lib/supabase';

export function AdminView() {
  const [activeTab, setActiveTab] = useState<'dashboard'|'orders'|'products'|'tables'|'customers'>('dashboard');
  const { orders, setView } = useAppContext();
  
  const pendingOrders = orders.filter(o => o.status === 'pending').length;

  const handleLogout = async () => {
    let url = import.meta.env.VITE_SUPABASE_URL || '';
    if (typeof url === 'string') {
      if (url.startsWith('"') && url.endsWith('"')) url = url.replace(/^"|"$/g, '');
      url = url.trim();
    }
    const isSupabaseConfigured = url && url !== "" && url !== "https://placeholder.supabase.co";

    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setView('login');
  };

  return (
    <div className="flex min-h-[calc(100vh-80px)] bg-neutral-50 overflow-hidden relative">
      {/* Toast de Pedidos */}
      {pendingOrders > 0 && activeTab !== 'orders' && (
        <div className="absolute top-4 right-4 z-50 bg-neutral-900 border border-neutral-700 shadow-2xl rounded-2xl p-4 flex items-center gap-4 animate-in slide-in-from-top-2 fade-in duration-300">
          <div className="relative">
            <ShoppingCart className="w-6 h-6 text-white" />
            <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
              {pendingOrders}
            </span>
          </div>
          <div>
            <h4 className="text-white font-bold text-sm">Novos Pedidos</h4>
            <p className="text-neutral-400 text-xs">Você tem {pendingOrders} {pendingOrders === 1 ? 'pedido' : 'pedidos'} aguardando.</p>
          </div>
          <button onClick={() => setActiveTab('orders')} className="ml-2 bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-700 transition">
            Ver
          </button>
        </div>
      )}

      {/* Sidebar Desktop */}
      <aside className="w-64 bg-white border-r border-neutral-200 hidden md:flex flex-col">
        <nav className="flex-1 p-4 space-y-2 flex flex-col h-full">
          <SidebarItem icon={<LayoutDashboard />} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <SidebarItem 
            icon={
              <div className="relative">
                <ShoppingCart />
                {pendingOrders > 0 && <span className="absolute -top-1 -right-2 bg-red-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">{pendingOrders}</span>}
              </div>
            }
            label="Pedidos (PDV)" 
            active={activeTab === 'orders'} 
            onClick={() => setActiveTab('orders')} 
          />
          <SidebarItem icon={<PackageSearch />} label="Produtos & Estoque" active={activeTab === 'products'} onClick={() => setActiveTab('products')} />
          <SidebarItem icon={<LayoutGrid />} label="Mesas" active={activeTab === 'tables'} onClick={() => setActiveTab('tables')} />
          <SidebarItem icon={<Users />} label="Clientes" active={activeTab === 'customers'} onClick={() => setActiveTab('customers')} />
          
          <div className="mt-auto pt-4 border-t border-neutral-100">
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors text-red-600 hover:bg-red-50"
            >
              <div className="w-5 h-5 [&>svg]:w-5 [&>svg]:h-5 flex items-center justify-center">
                <LogOut />
              </div>
              Sair
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        {activeTab === 'dashboard' && <DashboardTab />}
        {activeTab === 'orders' && <OrdersTab />}
        {activeTab === 'products' && <ProductsTab />}
        {activeTab === 'tables' && <TablesTab />}
        {activeTab === 'customers' && <CustomersTab />}
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 flex justify-around p-2 pb-safe z-40">
          <MobileNavItem icon={<LayoutDashboard />} label="Resumo" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <MobileNavItem 
            icon={
              <div className="relative">
                <ShoppingCart />
                {pendingOrders > 0 && <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">{pendingOrders}</span>}
              </div>
            }
            label="Pedidos" 
            active={activeTab === 'orders'} 
            onClick={() => setActiveTab('orders')} 
          />
          <MobileNavItem icon={<PackageSearch />} label="Produtos" active={activeTab === 'products'} onClick={() => setActiveTab('products')} />
          <MobileNavItem icon={<LayoutGrid />} label="Mesas" active={activeTab === 'tables'} onClick={() => setActiveTab('tables')} />
          <MobileNavItem icon={<LogOut />} label="Sair" active={false} onClick={handleLogout} />
      </nav>
    </div>
  );
}

function SidebarItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      title={label}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${active ? 'bg-red-50 text-red-600' : 'text-neutral-600 hover:bg-neutral-100'}`}
    >
      <div className="w-5 h-5 [&>svg]:w-5 [&>svg]:h-5 flex items-center justify-center">
        {icon}
      </div>
      {label}
    </button>
  );
}

function MobileNavItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button onClick={onClick} title={label} className={`flex flex-col items-center justify-center p-2 min-w-[64px] ${active ? 'text-red-600' : 'text-neutral-500'}`}>
      <div className="w-6 h-6 mb-1 [&>svg]:w-6 [&>svg]:h-6 flex items-center justify-center">
        {icon}
      </div>
      <span className="text-[10px] font-bold">{label}</span>
    </button>
  );
}

// --- Tabs Components ---

function DashboardTab() {
  const { orders, products, customers } = useAppContext();
  
  const todayRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const lowStockCount = products.filter(p => p.stock < 20).length;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black text-neutral-900">Visão Geral</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Vendas Hoje" value={`R$ ${todayRevenue.toFixed(2)}`} color="bg-emerald-50 text-emerald-600" />
        <StatCard title="Pedidos" value={orders.length.toString()} color="bg-blue-50 text-blue-600" />
        <StatCard title="Clientes Registrados" value={customers.length.toString()} color="bg-purple-50 text-purple-600" />
        <StatCard title="Alerta de Estoque" value={`${lowStockCount} Itens`} color="bg-red-50 text-red-600" />
      </div>
      
      {/* Mock Chart Area */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100">
        <h3 className="font-bold text-neutral-900 mb-4">Vendas na Semana (Simulado)</h3>
        <div className="h-64 flex items-end gap-2 justify-between mt-8">
          {[40, 70, 45, 90, 110, 140, 180].map((h, i) => (
            <div key={i} className="w-full max-w-[40px] bg-red-100 rounded-t-md relative group">
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-2 bg-neutral-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {h} Vendas
              </div>
              <div className="bg-red-600 rounded-t-md transition-all duration-1000 w-full" style={{ height: `${(h/180)*100}%` }}></div>
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-4 text-sm text-neutral-400 font-medium">
          <span>Seg</span><span>Ter</span><span>Qua</span><span>Qui</span><span>Sex</span><span>Sáb</span><span>Dom</span>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, color }: { title: string, value: string, color: string }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100">
      <p className="text-neutral-500 font-medium text-sm mb-2">{title}</p>
      <div className={`text-2xl font-black inline-block px-3 py-1 rounded-lg ${color}`}>
        {value}
      </div>
    </div>
  );
}

function OrdersTab() {
  const { orders, updateOrderStatus } = useAppContext();
  
  const sendWhatsApp = (order: Order, type: 'production' | 'delivery' = 'production') => {
    const isDelivery = order.deliveryType === 'delivery';
    
    let paymentText = '';
    if (order.paymentMethod === 'money') {
      paymentText = `💵 *Dinheiro* (${order.changeFor ? 'troco para R$ ' + order.changeFor.toFixed(2).replace('.', ',') : 'não precisa de troco'})`;
    } else if (order.paymentMethod === 'pix') {
      paymentText = `💠 *Pix*`;
    } else if (order.paymentMethod === 'card_machine') {
      paymentText = `💳 *Máquina de Cartão*`;
    }

    let itemsText = order.items.map(item => `➡ \`\`\`${item.quantity}x ${item.product.name}\`\`\``).join('\n');

    let deliveryText = '';
    if (isDelivery && order.address) {
      const a = order.address;
      deliveryText = `🛵 *Delivery* (taxa de: *R$ 3,00*)\n🏠 ${a.street}, Nº ${a.number}${a.complement ? ' - ' + a.complement : ''}, ${a.neighborhood}, ${a.city}\n(Estimativa: *entre 40~60 minutos*)\n\n`;
    } else {
      deliveryText = `🛍️ *Retirada no Local*\n\n`;
    }

    let headerText = '';
    if (type === 'production') {
      headerText = `Agora vai! Seu pedido já está *em produção* 🥳`;
    } else {
      if (isDelivery) {
        headerText = `Oba! Seu pedido *saiu para entrega* 🛵💨`;
      } else {
        headerText = `Oba! Seu pedido está *pronto para retirada* 🛍️`;
      }
    }

    const message = `${headerText}\nPedido *nº ${order.id.slice(0, 4).toUpperCase()}*\n\n*Itens:*\n${itemsText}\n\n${paymentText}\n\n${deliveryText}Total: *R$ ${order.total.toFixed(2).replace('.', ',')}* \n\nObrigado pela preferência, se precisar de algo é só chamar! 😉`;

    const phone = order.phone.replace(/\D/g, ''); // leave only digits
    if (!phone) {
      alert("Este pedido não tem um número de telefone válido.");
      return;
    }
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/55${phone}?text=${encodedMessage}`, '_blank');
  };

  if(orders.length === 0) return <div className="text-neutral-500">Nenhum pedido recebido ainda.</div>

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black text-neutral-900">Gerenciador de Pedidos</h2>
      <div className="grid gap-4">
        {orders.map(order => (
          <div key={order.id} className="bg-white p-5 rounded-2xl shadow-sm border border-neutral-100 flex flex-col md:flex-row gap-4 items-start md:items-center">
             <div className="flex-1">
               <div className="flex items-center gap-3 mb-2">
                 <span className="font-mono text-sm font-bold text-neutral-400">#{order.id.slice(0, 4).toUpperCase()}</span>
                 <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase
                   ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : ''}
                   ${order.status === 'preparing' ? 'bg-blue-100 text-blue-700' : ''}
                   ${order.status === 'ready' ? 'bg-emerald-100 text-emerald-700' : ''}
                   ${order.status === 'delivered' ? 'bg-neutral-100 text-neutral-500' : ''}
                 `}>
                   {order.status}
                 </span>
                 <span className="px-2 py-0.5 rounded bg-neutral-100 text-neutral-600 text-xs font-bold uppercase flex items-center gap-1">
                   {order.deliveryType === 'delivery' ? <PackageSearch className="w-3 h-3" /> : <Coffee className="w-3 h-3"/>}
                   {order.deliveryType}
                 </span>
               </div>
               <p className="font-bold text-neutral-900">{order.customerName} <span className="text-neutral-400 font-normal">({order.phone || 'Sem telefone'})</span></p>
               <p className="text-sm text-neutral-500 mt-1">
                 {order.items.map(i => `${i.quantity}x ${i.product.name}`).join(', ')}
               </p>
             </div>
             
             <div className="flex flex-col md:items-end gap-2 w-full md:w-auto">
                <span className="font-black text-lg text-neutral-900">R$ {order.total.toFixed(2).replace('.',',')}</span>
                <div className="flex flex-wrap gap-2 justify-end">
                  {order.status === 'preparing' && (
                    <button 
                      onClick={() => sendWhatsApp(order, 'production')} 
                      className="bg-[#25D366] hover:bg-[#128C7E] text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors flex-1 md:flex-none justify-center"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Avisar Produção
                    </button>
                  )}
                  {order.status === 'ready' && (
                    <button 
                      onClick={() => sendWhatsApp(order, 'delivery')} 
                      className="bg-[#25D366] hover:bg-[#128C7E] text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors flex-1 md:flex-none justify-center"
                    >
                      <MessageCircle className="w-4 h-4" />
                      {order.deliveryType === 'delivery' ? 'Avisar Entrega' : 'Avisar Retirada'}
                    </button>
                  )}
                  {order.status === 'pending' && <button onClick={() => updateOrderStatus(order.id, 'preparing')} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex-1 md:flex-none">Aceitar</button>}
                  {order.status === 'preparing' && <button onClick={() => updateOrderStatus(order.id, 'ready')} className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex-1 md:flex-none">Pronto</button>}
                  {order.status === 'ready' && <button onClick={() => updateOrderStatus(order.id, 'delivered')} className="bg-neutral-800 text-white px-4 py-2 rounded-lg text-sm font-bold flex-1 md:flex-none">Finalizar</button>}
                </div>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProductsTab() {
  const { products, categories, removeProduct, addProduct, addCategory, updateProduct } = useAppContext();
  
  const [showProductModal, setShowProductModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  // Formulário Produto
  const [newProductName, setNewProductName] = useState('');
  const [newProductCategory, setNewProductCategory] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('');
  const [newProductStock, setNewProductStock] = useState('');
  const [newProductDesc, setNewProductDesc] = useState('');
  const [newProductImage, setNewProductImage] = useState('');

  // Formulário Categoria
  const [newCategoryName, setNewCategoryName] = useState('');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewProductImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const openNewProductModal = () => {
    setEditingProductId(null);
    setNewProductName('');
    setNewProductCategory('');
    setNewProductPrice('');
    setNewProductStock('');
    setNewProductDesc('');
    setNewProductImage('');
    setShowProductModal(true);
  };

  const openEditProductModal = (product: Product) => {
    setEditingProductId(product.id);
    setNewProductName(product.name);
    setNewProductCategory(product.categoryId);
    setNewProductPrice(product.price.toString());
    setNewProductStock(product.stock.toString());
    setNewProductDesc(product.description || '');
    setNewProductImage(product.image);
    setShowProductModal(true);
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductName || !newProductCategory || !newProductPrice) return;
    
    if (editingProductId) {
      const updatedProduct: Product = {
        id: editingProductId,
        name: newProductName,
        categoryId: newProductCategory,
        price: parseFloat(newProductPrice),
        stock: parseInt(newProductStock) || 0,
        description: newProductDesc,
        image: newProductImage || 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&q=80&w=500', 
        sales: products.find(p => p.id === editingProductId)?.sales || 0
      };
      updateProduct(updatedProduct);
    } else {
      const product: Product = {
        id: Math.random().toString(36).substr(2, 9),
        name: newProductName,
        categoryId: newProductCategory,
        price: parseFloat(newProductPrice),
        stock: parseInt(newProductStock) || 0,
        description: newProductDesc,
        image: newProductImage || 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&q=80&w=500', 
        sales: 0
      };
      addProduct(product);
    }
    
    setShowProductModal(false);
    
    setEditingProductId(null);
    setNewProductName('');
    setNewProductCategory('');
    setNewProductPrice('');
    setNewProductStock('');
    setNewProductDesc('');
    setNewProductImage('');
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName) return;
    
    const category: Category = {
      id: Math.random().toString(36).substr(2, 9),
      name: newCategoryName
    };
    
    addCategory(category);
    setShowCategoryModal(false);
    setNewCategoryName('');
  }
  
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <h2 className="text-2xl font-black text-neutral-900">Produtos & Estoque</h2>
        <div className="flex gap-2">
          <button onClick={() => setShowCategoryModal(true)} className="bg-neutral-100 text-neutral-700 hover:bg-neutral-200 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors">
            <Plus className="w-4 h-4" /> Nova Categoria
          </button>
          <button onClick={openNewProductModal} className="bg-neutral-900 text-white hover:bg-neutral-800 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors">
            <Plus className="w-4 h-4" /> Novo Produto
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
        <div className="p-4 border-b border-neutral-100 flex items-center relative">
          <Search className="w-5 h-5 text-neutral-400 absolute left-7" />
          <input
            type="text"
            placeholder="Buscar produto por nome ou descrição..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-colors"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200">
                <th className="p-4 text-sm font-bold text-neutral-600">Produto</th>
                <th className="p-4 text-sm font-bold text-neutral-600">Categoria</th>
                <th className="p-4 text-sm font-bold text-neutral-600">Preço</th>
                <th className="p-4 text-sm font-bold text-neutral-600">Estoque</th>
                <th className="p-4 text-sm font-bold text-neutral-600">Likes</th>
                <th className="p-4 text-sm font-bold text-neutral-600">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredProducts.map(p => {
                const cat = categories.find(c => c.id === p.categoryId)?.name || '-';
                return (
                  <tr key={p.id} className="hover:bg-neutral-50">
                    <td className="p-4 flex items-center gap-3">
                      <img src={p.image} className="w-10 h-10 rounded shadow-sm object-cover" alt="" />
                      <span className="font-bold text-neutral-900">{p.name}</span>
                    </td>
                    <td className="p-4 text-neutral-600">{cat}</td>
                    <td className="p-4 font-bold text-neutral-900">R$ {p.price.toFixed(2).replace('.', ',')}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${p.stock <= 0 ? 'bg-red-100 text-red-700' : p.stock < 20 ? 'bg-yellow-100 text-yellow-700' : 'bg-emerald-100 text-emerald-700'}`}>
                          {p.stock}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 font-bold text-red-600 flex items-center gap-1.5 min-h-[73px]">
                      <Heart className="w-4 h-4 fill-red-500" />
                      {p.likes || 0}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEditProductModal(p)} className="p-2 bg-neutral-100 rounded-lg text-neutral-600 hover:text-blue-600 transition-colors"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => removeProduct(p.id)} className="p-2 bg-neutral-100 rounded-lg text-neutral-600 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-neutral-500">
                    Nenhum produto encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Categoria */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl relative">
             <button onClick={() => setShowCategoryModal(false)} className="absolute top-4 right-4 p-2 text-neutral-400 hover:bg-neutral-100 rounded-full transition-colors">
               <X className="w-5 h-5"/>
             </button>
             <h3 className="text-xl font-black text-neutral-900 mb-6">Nova Categoria</h3>
             <form onSubmit={handleAddCategory} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-neutral-600 mb-2">Nome da Categoria</label>
                  <input type="text" required value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} placeholder="Ex: Bebidas" className="w-full p-3 rounded-xl border border-neutral-200 focus:border-red-600 outline-none" />
                </div>
                <button type="submit" className="w-full py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors">
                  Salvar Categoria
                </button>
             </form>
          </div>
        </div>
      )}

      {/* Modal Produto */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto hide-scrollbar">
             <button onClick={() => setShowProductModal(false)} className="absolute top-4 right-4 p-2 text-neutral-400 hover:bg-neutral-100 rounded-full transition-colors">
               <X className="w-5 h-5"/>
             </button>
             <h3 className="text-xl font-black text-neutral-900 mb-6">Novo Produto</h3>
             <form onSubmit={handleAddProduct} className="space-y-4">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-neutral-600 mb-2">Nome</label>
                    <input type="text" required value={newProductName} onChange={(e) => setNewProductName(e.target.value)} placeholder="Ex: Hambúrguer Duplo" className="w-full p-3 rounded-xl border border-neutral-200 focus:border-red-600 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-neutral-600 mb-2">Categoria</label>
                    <select required value={newProductCategory} onChange={(e) => setNewProductCategory(e.target.value)} className="w-full p-3 rounded-xl border border-neutral-200 focus:border-red-600 outline-none bg-white">
                      <option value="">Selecione...</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-neutral-600 mb-2">Preço (R$)</label>
                    <input type="number" step="0.01" required value={newProductPrice} onChange={(e) => setNewProductPrice(e.target.value)} placeholder="Ex: 29.90" className="w-full p-3 rounded-xl border border-neutral-200 focus:border-red-600 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-neutral-600 mb-2">Estoque Inicial</label>
                    <input type="number" required value={newProductStock} onChange={(e) => setNewProductStock(e.target.value)} placeholder="Ex: 50" className="w-full p-3 rounded-xl border border-neutral-200 focus:border-red-600 outline-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-neutral-600 mb-2">Imagem do Produto</label>
                  {newProductImage ? (
                    <label className="flex w-full h-40 border-2 border-neutral-300 border-dashed rounded-xl cursor-pointer bg-neutral-50 hover:bg-neutral-100 overflow-hidden relative transition-colors">
                      <img src={newProductImage} alt="Preview" className="w-full h-full object-cover" />
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    </label>
                  ) : (
                    <div className="flex gap-4">
                      <label className="flex-1 flex flex-col items-center justify-center p-6 border-2 border-neutral-300 border-dashed rounded-xl cursor-pointer bg-neutral-50 hover:bg-neutral-100 transition-colors">
                        <Camera className="w-8 h-8 mb-2 text-neutral-400" />
                        <span className="text-sm text-neutral-500 font-semibold mb-1">Câmera</span>
                        <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImageUpload} />
                      </label>
                      <label className="flex-1 flex flex-col items-center justify-center p-6 border-2 border-neutral-300 border-dashed rounded-xl cursor-pointer bg-neutral-50 hover:bg-neutral-100 transition-colors">
                        <ImagePlus className="w-8 h-8 mb-2 text-neutral-400" />
                        <span className="text-sm text-neutral-500 font-semibold mb-1">Galeria</span>
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                      </label>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-neutral-600 mb-2">Descrição</label>
                  <textarea rows={3} value={newProductDesc} onChange={(e) => setNewProductDesc(e.target.value)} placeholder="Descrição do produto..." className="w-full p-3 rounded-xl border border-neutral-200 focus:border-red-600 outline-none resize-none" />
                </div>

                <button type="submit" className="w-full py-4 mt-2 bg-yellow-400 text-black rounded-xl font-bold hover:bg-yellow-500 transition-colors uppercase tracking-wide">
                  Cadastrar Produto
                </button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
}

function TablesTab() {
  const { tables } = useAppContext();
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black text-neutral-900">Relatório de Mesas</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {tables.map(t => (
           <div key={t.id} className={`p-6 rounded-2xl border ${t.status === 'free' ? 'border-dashed border-neutral-300 bg-neutral-50 text-neutral-400' : t.status === 'occupied' ? 'border-blue-200 bg-blue-50 text-blue-900' : 'border-red-200 bg-red-50 text-red-900'}`}>
             <div className="flex justify-between items-start mb-4">
                <span className="text-3xl font-black">{t.tableNumber}</span>
                <span className="text-xs font-bold uppercase px-2 py-1 bg-white rounded shadow-sm">
                  {t.status === 'free' ? 'Livre' : t.status === 'occupied' ? 'Ocupada' : 'Fechando'}
                </span>
             </div>
             {t.status !== 'free' && (
               <div>
                  <p className="text-sm opacity-70">Total Parcial</p>
                  <p className="font-bold text-lg">R$ {t.currentTotal.toFixed(2).replace('.', ',')}</p>
               </div>
             )}
           </div>
        ))}
      </div>
    </div>
  );
}

function CustomersTab() {
  const { customers } = useAppContext();
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black text-neutral-900">Cadastro de Clientes</h2>
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-neutral-100">
        {customers.length === 0 ? <p className="text-neutral-500">Nenhum cliente cadastrado.</p> : (
          <ul className="divide-y divide-neutral-100">
            {customers.map(c => (
              <li key={c.id} className="py-3 flex justify-between items-center">
                <div>
                  <p className="font-bold text-neutral-900">{c.name}</p>
                  <p className="text-sm text-neutral-500">{c.phone}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-neutral-500">Pedidos</p>
                  <p className="font-black text-neutral-900">{c.totalOrders}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
