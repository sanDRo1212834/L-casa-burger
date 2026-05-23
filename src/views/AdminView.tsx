import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { LayoutDashboard, ShoppingCart, PackageSearch, Users, Contact2, LayoutGrid, Coffee, Plus, Trash2, Edit, X, Search, Camera, ImagePlus, Heart, LogOut } from 'lucide-react';
import { Product, Category, Order, Extra } from '../types';
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
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn("SignOut failed:", err);
      }
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
            <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold animate-bounce">
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
                <ShoppingCart className={pendingOrders > 0 ? "text-red-500" : ""} />
                {pendingOrders > 0 && <span className="absolute -top-1 -right-2 bg-red-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold animate-bounce">{pendingOrders}</span>}
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
                <ShoppingCart className={pendingOrders > 0 ? "text-red-500" : ""} />
                {pendingOrders > 0 && <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold animate-bounce">{pendingOrders}</span>}
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
      
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Mock Chart Area */}
        <div className="xl:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-neutral-100">
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

        {/* Best Sellers Ranking */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100 flex flex-col">
          <h3 className="font-bold text-neutral-900 mb-4">Ranking Mais Vendidos</h3>
          <div className="flex-1 overflow-y-auto pr-2 space-y-4">
            {products.length > 0 ? (
              [...products]
                .sort((a, b) => b.sales - a.sales)
                .slice(0, 5) // Show top 5
                .map((product, index) => (
                  <div key={product.id} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center font-bold text-neutral-500 shrink-0">
                      {index + 1}
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-neutral-100 overflow-hidden shrink-0">
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-neutral-900 truncate">{product.name}</p>
                      <p className="text-xs text-neutral-500 font-medium">{product.sales} vendas</p>
                    </div>
                  </div>
                ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-neutral-400">
                <p className="text-sm font-medium">Nenhum produto</p>
                <p className="text-xs">Cadastre produtos para ver o ranking</p>
              </div>
            )}
          </div>
        </div>

        {/* Promotions Suggestions */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100 flex flex-col">
          <h3 className="font-bold text-neutral-900 mb-1">Dicas de Promoção</h3>
          <p className="text-xs text-neutral-500 mb-4 leading-tight">Itens com baixa saída que podem ser impulsionados.</p>
          <div className="flex-1 overflow-y-auto pr-2 space-y-4">
            {products.length > 0 ? (
              [...products]
                .sort((a, b) => a.sales - b.sales)
                .slice(0, 5) // Show bottom 5
                .map((product) => (
                  <div key={product.id} className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-neutral-100 overflow-hidden shrink-0">
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-neutral-900 truncate">{product.name}</p>
                      <p className="text-xs text-rose-500 font-bold">{product.sales} {product.sales === 1 ? 'venda' : 'vendas'}</p>
                    </div>
                  </div>
                ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-neutral-400">
                <p className="text-sm font-medium">Nenhum produto</p>
                <p className="text-xs">Cadastre produtos para ver sugestões</p>
              </div>
            )}
          </div>
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
  
  const sendWhatsApp = (order: Order, type: 'received' | 'production' | 'delivery' = 'received') => {
    const isDelivery = order.deliveryType === 'delivery';
    
    let paymentText = '';
    if (order.paymentMethod === 'money') {
      paymentText = `💵 *Dinheiro* (${order.changeFor ? 'troco para R$ ' + order.changeFor.toFixed(2).replace('.', ',') : 'não precisa de troco'})`;
    } else if (order.paymentMethod === 'pix') {
      paymentText = `💠 *Pix*`;
    } else if (order.paymentMethod === 'card_machine') {
      paymentText = `💳 *Máquina de Cartão*`;
    }

    let itemsText = order.items.map(item => {
      let extText = '';
      if (item.selectedExtras && item.selectedExtras.length > 0) {
        extText = item.selectedExtras.map(ex => `\n     + ${ex.quantity}x ${ex.extra.name}`).join('');
      }
      return `➡ \`\`\`${item.quantity}x ${item.product.name}\`\`\`${item.observation ? `\n   Obs: ${item.observation}` : ''}${extText}`;
    }).join('\n');

    let deliveryText = '';
    if (isDelivery && order.address) {
      const a = order.address;
      deliveryText = `🛵 *Delivery* (taxa de: *R$ ${order.deliveryFee ? order.deliveryFee.toFixed(2).replace('.',',') : 'A Combinar'}*)\n🏠 ${a.street}, Nº ${a.number}${a.complement ? ' - ' + a.complement : ''}, ${a.neighborhood}, ${a.city}\n(Estimativa: *entre 40~60 minutos*)\n\n`;
    } else {
      deliveryText = `🛍️ *Retirada no Local*\n\n`;
    }

    let message = '';
    
    if (type === 'delivery') {
      message = isDelivery ? 'Seu pedido saiu pra entrega' : 'Seu pedido está pronto para retirada 🛍️';
    } else if (type === 'production') {
      message = `Seu pedido nº ${order.orderNumber || order.id.slice(0, 4).toUpperCase()} já está em produção 🥳`;
    } else {
      let headerText = `Olá! *Recebemos seu pedido* e logo começaremos a prepará-lo 😊`;
      message = `${headerText}\nPedido *nº ${order.orderNumber || order.id.slice(0, 4).toUpperCase()}*\n\n*Itens:*\n${itemsText}\n\n${paymentText}\n\n${deliveryText}Total: *R$ ${order.total.toFixed(2).replace('.', ',')}* \n\nObrigado pela preferência, se precisar de algo é só chamar! 😉`;
    }

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
                   {order.status === 'pending' ? 'Pendente' : order.status === 'preparing' ? 'Preparo' : order.status === 'ready' ? 'Pronto' : 'Entregue'}
                 </span>
                 <span className="px-2 py-0.5 rounded bg-neutral-100 text-neutral-600 text-xs font-bold uppercase flex items-center gap-1">
                   {order.deliveryType === 'delivery' ? <PackageSearch className="w-3 h-3" /> : <Coffee className="w-3 h-3"/>}
                   {order.deliveryType === 'delivery' ? 'Entrega' : 'Retirada'}
                 </span>
               </div>
               <p className="font-bold text-neutral-900">
                 Pedido #{order.orderNumber || '?'} - {order.customerName} <span className="text-neutral-400 font-normal">({order.phone || 'Sem telefone'})</span>
               </p>
               <p className="text-sm text-neutral-500 mt-1">
                 {order.items.map(i => {
                   let extDesc = '';
                   if (i.selectedExtras && i.selectedExtras.length > 0) {
                     extDesc = ` (+ ${i.selectedExtras.map(e => `${e.quantity}x ${e.extra.name}`).join(', ')})`;
                   }
                   return `${i.quantity}x ${i.product.name}${extDesc}`;
                 }).join(' | ')}
               </p>
               
               {/* Informações de Pagamento e Entrega */}
               <div className="mt-3 flex flex-col gap-1 text-sm bg-neutral-50 p-3 rounded-xl border border-neutral-100">
                 <div className="flex gap-2 items-center">
                   <span className="font-bold text-neutral-700">Pagamento:</span>
                   <span className="text-neutral-600">
                     {order.paymentMethod === 'pix' ? 'PIX' : order.paymentMethod === 'card_machine' ? 'Máquina de Cartão' : 'Dinheiro'}
                     {order.paymentMethod === 'money' && order.changeFor ? ` (Troco para R$ ${order.changeFor.toFixed(2).replace('.', ',')})` : ''}
                   </span>
                 </div>
                 
                 <div className="flex gap-2 items-start">
                   <span className="font-bold text-neutral-700">Modo:</span>
                   <span className="text-neutral-600">
                     {order.deliveryType === 'delivery' ? 'Delivery' : 'Retirada no Local'}
                   </span>
                 </div>

                 {order.deliveryType === 'delivery' && order.address && (
                   <div className="flex gap-2 items-start text-neutral-600">
                     <span className="font-bold text-neutral-700">Endereço:</span>
                     <span>
                       {order.address.street}, {order.address.number}
                       {order.address.complement && ` - ${order.address.complement}`}
                       <br />
                       {order.address.neighborhood}, {order.address.city} - {order.address.state}
                       <br />
                       CEP: {order.address.cep}
                     </span>
                   </div>
                 )}

                 {order.deliveryType === 'delivery' && (
                   <div className="flex items-center gap-2 mt-2 border-t border-neutral-200 pt-2 text-neutral-600">
                     <span className="font-bold text-neutral-700">Frete:</span>
                     {order.status === 'pending' || order.status === 'preparing' ? (
                       <div className="flex gap-2">
                          <button onClick={() => updateOrderStatus(order.id, order.status, 4)} className={`px-2 py-1 rounded text-xs font-bold transition-colors ${order.deliveryFee === 4 ? 'bg-teal-600 text-white' : 'bg-neutral-200 text-neutral-600 hover:bg-neutral-300'}`}>R$ 4,00</button>
                          <button onClick={() => updateOrderStatus(order.id, order.status, 6)} className={`px-2 py-1 rounded text-xs font-bold transition-colors ${order.deliveryFee === 6 ? 'bg-teal-600 text-white' : 'bg-neutral-200 text-neutral-600 hover:bg-neutral-300'}`}>R$ 6,00</button>
                       </div>
                     ) : (
                       <span className="font-bold text-neutral-800">
                         R$ {order.deliveryFee ? order.deliveryFee.toFixed(2).replace('.', ',') : 'Não definido'}
                       </span>
                     )}
                   </div>
                 )}
               </div>
             </div>
             
             <div className="flex flex-col md:items-end gap-2 w-full md:w-auto">
                <span className="font-black text-lg text-neutral-900">R$ {(order.total + (order.deliveryFee || 0)).toFixed(2).replace('.',',')} {order.deliveryFee ? <span className="text-xs text-neutral-500 font-normal ml-1">(com frete)</span> : null}</span>
                <div className="flex flex-wrap gap-2 justify-end">
                  {order.status === 'pending' && (
                    <button 
                      onClick={() => sendWhatsApp(order, 'received')} 
                      className="bg-[#25D366] hover:bg-[#128C7E] text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors flex-1 md:flex-none justify-center"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.82 9.82 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                      </svg>
                      Avisar Recebido
                    </button>
                  )}
                  {order.status === 'preparing' && (
                    <button 
                      onClick={() => sendWhatsApp(order, 'production')} 
                      className="bg-[#25D366] hover:bg-[#128C7E] text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors flex-1 md:flex-none justify-center"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.82 9.82 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                      </svg>
                      Avisar Produção
                    </button>
                  )}
                  {order.status === 'ready' && (
                    <button 
                      onClick={() => sendWhatsApp(order, 'delivery')} 
                      className="bg-[#25D366] hover:bg-[#128C7E] text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors flex-1 md:flex-none justify-center"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.82 9.82 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                      </svg>
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
  const { products, categories, removeProduct, addProduct, addCategory, updateProduct, updateCategory, removeCategory } = useAppContext();
  
  const [showProductModal, setShowProductModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);

  // Tab states for Products/Categories view
  const [subTab, setSubTab] = useState<'products' | 'categories'>('products');

  // Camera states
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const streamRef = React.useRef<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      setShowCamera(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      streamRef.current = stream;
    } catch (err) {
      alert("Não foi possível acessar a câmera do navegador. Use o botão Galeria ou tente novamente.");
      setShowCamera(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
  };

  const takePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        setNewProductImage(canvas.toDataURL('image/jpeg', 0.8));
        stopCamera();
      }
    }
  };

  // Formulário Produto
  const [newProductName, setNewProductName] = useState('');
  const [newProductCategory, setNewProductCategory] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('');
  const [newProductStock, setNewProductStock] = useState('');
  const [newProductDesc, setNewProductDesc] = useState('');
  const [newProductImage, setNewProductImage] = useState('');
  const [newProductExtras, setNewProductExtras] = useState<Extra[]>([]);

  // Formulário Categoria
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryExtras, setNewCategoryExtras] = useState<Extra[]>([]);
  const [newExtraName, setNewExtraName] = useState('');
  const [newExtraPrice, setNewExtraPrice] = useState('');
  const [newComboName, setNewComboName] = useState('');
  const [newComboPrice, setNewComboPrice] = useState('');

  const handleAddExtraToCategory = (type: 'extra' | 'combo') => {
    const isCombo = type === 'combo';
    const name = isCombo ? newComboName : newExtraName;
    const price = isCombo ? newComboPrice : newExtraPrice;
    if (!name || !price) return;
    const extra: Extra = {
      id: Math.random().toString(36).substr(2, 9),
      name: name,
      price: parseFloat(price),
      type: type
    };
    setNewCategoryExtras(prev => [...prev, extra]);
    if (isCombo) {
      setNewComboName('');
      setNewComboPrice('');
    } else {
      setNewExtraName('');
      setNewExtraPrice('');
    }
  };

  const handleAddExtraToProduct = (type: 'extra' | 'combo') => {
    const isCombo = type === 'combo';
    const name = isCombo ? newComboName : newExtraName;
    const price = isCombo ? newComboPrice : newExtraPrice;
    if (!name || !price) return;
    const extra: Extra = {
      id: Math.random().toString(36).substr(2, 9),
      name: name,
      price: parseFloat(price),
      type: type
    };
    setNewProductExtras(prev => [...prev, extra]);
    if (isCombo) {
      setNewComboName('');
      setNewComboPrice('');
    } else {
      setNewExtraName('');
      setNewExtraPrice('');
    }
  };

  const handleRemoveCategoryExtra = (id: string) => {
    setNewCategoryExtras(prev => prev.filter(e => e.id !== id));
  };

  const handleRemoveProductExtra = (id: string) => {
    setNewProductExtras(prev => prev.filter(e => e.id !== id));
  };

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
    setNewProductExtras([]);
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
    setNewProductExtras(product.extras || []);
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
        sales: products.find(p => p.id === editingProductId)?.sales || 0,
        extras: newProductExtras
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
        sales: 0,
        extras: newProductExtras
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
    setNewProductExtras([]);
  };

  const openNewCategoryModal = () => {
    setEditingCategoryId(null);
    setNewCategoryName('');
    setNewCategoryExtras([]);
    setShowCategoryModal(true);
  };

  const openEditCategoryModal = (cat: Category) => {
    setEditingCategoryId(cat.id);
    setNewCategoryName(cat.name);
    setNewCategoryExtras(cat.extras || []);
    setShowCategoryModal(true);
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName) return;
    
    if (editingCategoryId) {
      updateCategory({
        id: editingCategoryId,
        name: newCategoryName,
        extras: newCategoryExtras
      });
    } else {
      const category: Category = {
        id: Math.random().toString(36).substr(2, 9),
        name: newCategoryName,
        extras: newCategoryExtras
      };
      addCategory(category);
    }
    
    setShowCategoryModal(false);
    setNewCategoryName('');
    setNewCategoryExtras([]);
    setEditingCategoryId(null);
  }
  
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-black text-neutral-900">Catálogo</h2>
          <div className="flex bg-neutral-100 p-1 rounded-xl">
            <button onClick={() => setSubTab('products')} className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${subTab === 'products' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'}`}>Produtos</button>
            <button onClick={() => setSubTab('categories')} className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${subTab === 'categories' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'}`}>Categorias</button>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={openNewCategoryModal} className="bg-neutral-100 text-neutral-700 hover:bg-neutral-200 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors">
            <Plus className="w-4 h-4" /> Nova Categoria
          </button>
          <button onClick={openNewProductModal} className="bg-neutral-900 text-white hover:bg-neutral-800 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors">
            <Plus className="w-4 h-4" /> Novo Produto
          </button>
        </div>
      </div>

      {subTab === 'products' ? (
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
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-200">
                  <th className="p-4 text-sm font-bold text-neutral-600">ID</th>
                  <th className="p-4 text-sm font-bold text-neutral-600">Nome da Categoria</th>
                  <th className="p-4 text-sm font-bold text-neutral-600">Adicionais Configurados</th>
                  <th className="p-4 text-sm font-bold text-neutral-600 w-[120px]">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {categories.map(c => (
                  <tr key={c.id} className="hover:bg-neutral-50">
                    <td className="p-4 text-neutral-500 font-mono text-xs">{c.id.slice(0, 8)}</td>
                    <td className="p-4 font-bold text-neutral-900">{c.name}</td>
                    <td className="p-4">
                      {c.extras && c.extras.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {c.extras.map(e => (
                            <span key={e.id} className={`px-2 py-1 text-xs rounded-lg font-medium border ${e.type === 'combo' ? 'bg-orange-100 text-orange-800 border-orange-200' : 'bg-neutral-100 text-neutral-700 border-neutral-200'}`}>
                              {e.name} (R$ {e.price.toFixed(2).replace('.', ',')})
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-neutral-400 text-sm italic">Nenhum</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEditCategoryModal(c)} className="p-2 bg-neutral-100 rounded-lg text-neutral-600 hover:text-blue-600 transition-colors"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => removeCategory(c.id)} className="p-2 bg-neutral-100 rounded-lg text-neutral-600 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {categories.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-neutral-500">
                      Nenhuma categoria configurada.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Categoria */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl relative">
             <button onClick={() => setShowCategoryModal(false)} className="absolute top-4 right-4 p-2 text-neutral-400 hover:bg-neutral-100 rounded-full transition-colors">
               <X className="w-5 h-5"/>
             </button>
             <h3 className="text-xl font-black text-neutral-900 mb-6">{editingCategoryId ? 'Editar Categoria' : 'Nova Categoria'}</h3>
             <form onSubmit={handleAddCategory} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-neutral-600 mb-2">Nome da Categoria</label>
                  <input type="text" required value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} placeholder="Ex: Bebidas" className="w-full p-3 rounded-xl border border-neutral-200 focus:border-red-600 outline-none" />
                </div>
                
                <div className="pt-4 border-t border-neutral-100">
                  <label className="block text-sm font-bold text-neutral-600 mb-2">Adicionais / Extras (Opcional)</label>
                  <div className="flex gap-2 mb-4">
                    <input type="text" value={newExtraName} onChange={e => setNewExtraName(e.target.value)} placeholder="Ex: Bacon" className="flex-1 p-3 rounded-xl border border-neutral-200 focus:border-red-600 outline-none" />
                    <input type="number" step="0.01" value={newExtraPrice} onChange={e => setNewExtraPrice(e.target.value)} placeholder="Preço" className="w-24 p-3 rounded-xl border border-neutral-200 focus:border-red-600 outline-none" />
                    <button type="button" onClick={() => handleAddExtraToCategory('extra')} className="bg-neutral-900 text-white p-3 rounded-xl hover:bg-neutral-800 transition-colors">
                      <Plus className="w-5 h-5"/>
                    </button>
                  </div>
                  {newCategoryExtras.filter(e => e.type !== 'combo').length > 0 && (
                    <ul className="space-y-2 mb-4">
                      {newCategoryExtras.filter(e => e.type !== 'combo').map(extra => (
                        <li key={extra.id} className="flex justify-between items-center bg-neutral-50 p-3 rounded-xl">
                          <div>
                            <p className="font-bold text-sm text-neutral-800">{extra.name}</p>
                            <p className="text-xs text-neutral-500 text-green-600 font-bold">R$ {extra.price.toFixed(2).replace('.', ',')}</p>
                          </div>
                          <button type="button" onClick={() => handleRemoveCategoryExtra(extra.id)} className="text-red-500 hover:text-red-700">
                            <X className="w-4 h-4"/>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="pt-4 border-t border-neutral-100">
                  <label className="block text-sm font-bold text-neutral-600 mb-2">Combos (Opcional)</label>
                  <div className="flex gap-2 mb-4">
                    <input type="text" value={newComboName} onChange={e => setNewComboName(e.target.value)} placeholder="Ex: Batata + Refri" className="flex-1 p-3 rounded-xl border border-neutral-200 focus:border-red-600 outline-none" />
                    <input type="number" step="0.01" value={newComboPrice} onChange={e => setNewComboPrice(e.target.value)} placeholder="Preço" className="w-24 p-3 rounded-xl border border-neutral-200 focus:border-red-600 outline-none" />
                    <button type="button" onClick={() => handleAddExtraToCategory('combo')} className="bg-neutral-900 text-white p-3 rounded-xl hover:bg-neutral-800 transition-colors">
                      <Plus className="w-5 h-5"/>
                    </button>
                  </div>
                  {newCategoryExtras.filter(e => e.type === 'combo').length > 0 && (
                    <ul className="space-y-2 mb-4">
                      {newCategoryExtras.filter(e => e.type === 'combo').map(combo => (
                        <li key={combo.id} className="flex justify-between items-center bg-neutral-50 p-3 rounded-xl">
                          <div>
                            <p className="font-bold text-sm text-neutral-800">{combo.name}</p>
                            <p className="text-xs text-neutral-500 text-green-600 font-bold">R$ {combo.price.toFixed(2).replace('.', ',')}</p>
                          </div>
                          <button type="button" onClick={() => handleRemoveCategoryExtra(combo.id)} className="text-red-500 hover:text-red-700">
                            <X className="w-4 h-4"/>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
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
                  {showCamera ? (
                    <div className="w-full flex justify-center items-center flex-col bg-neutral-900 rounded-xl overflow-hidden relative">
                      <video ref={videoRef} autoPlay playsInline className="w-full h-48 object-cover"></video>
                      <div className="absolute bottom-4 flex gap-4">
                        <button type="button" onClick={takePhoto} className="bg-red-600 text-white font-bold p-3 rounded-full hover:bg-red-700 transition-colors shadow-lg">
                          Tirar Foto
                        </button>
                        <button type="button" onClick={stopCamera} className="bg-white/20 backdrop-blur text-white font-bold p-3 rounded-full hover:bg-white/30 transition-colors">
                          <X className="w-6 h-6"/>
                        </button>
                      </div>
                    </div>
                  ) : newProductImage ? (
                    <div className="flex w-full h-40 border-2 border-neutral-300 border-dashed rounded-xl bg-neutral-50 overflow-hidden relative group">
                      <img src={newProductImage} alt="Preview" className="w-full h-full object-cover" />
                      <button 
                        type="button" 
                        onClick={() => setNewProductImage('')} 
                        className="absolute top-3 right-3 p-2 bg-neutral-900/40 backdrop-blur-md text-white rounded-full hover:bg-red-600 transition-colors"
                        title="Remover Imagem"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-4">
                      <button type="button" onClick={startCamera} className="flex-1 flex flex-col items-center justify-center p-6 border-2 border-neutral-300 border-dashed rounded-xl shrink-0 cursor-pointer bg-neutral-50 hover:bg-neutral-100 transition-colors">
                        <Camera className="w-8 h-8 mb-2 text-neutral-400" />
                        <span className="text-sm text-neutral-500 font-semibold mb-1">Câmera Web</span>
                      </button>
                      <label className="flex-1 flex flex-col items-center justify-center p-6 border-2 border-neutral-300 border-dashed rounded-xl cursor-pointer bg-neutral-50 hover:bg-neutral-100 transition-colors">
                        <ImagePlus className="w-8 h-8 mb-2 text-neutral-400" />
                        <span className="text-sm text-neutral-500 font-semibold mb-1">Arquivo / Galeria</span>
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                      </label>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-neutral-600 mb-2">Descrição</label>
                  <textarea rows={3} value={newProductDesc} onChange={(e) => setNewProductDesc(e.target.value)} placeholder="Descrição do produto..." className="w-full p-3 rounded-xl border border-neutral-200 focus:border-red-600 outline-none resize-none" />
                </div>

                <div className="pt-4 border-t border-neutral-100">
                  <label className="block text-sm font-bold text-neutral-600 mb-2">Adicionais Específicos para este Produto (Opcional)</label>
                  <p className="text-xs text-neutral-500 mb-4">Adicionais gravados na categoria já valem para o produto.</p>
                  <div className="flex gap-2 mb-4">
                    <input type="text" value={newExtraName} onChange={e => setNewExtraName(e.target.value)} placeholder="Ex: Bacon Extra" className="flex-1 p-3 rounded-xl border border-neutral-200 focus:border-red-600 outline-none" />
                    <input type="number" step="0.01" value={newExtraPrice} onChange={e => setNewExtraPrice(e.target.value)} placeholder="Preço" className="w-24 p-3 rounded-xl border border-neutral-200 focus:border-red-600 outline-none" />
                    <button type="button" onClick={() => handleAddExtraToProduct('extra')} className="bg-neutral-900 text-white p-3 rounded-xl hover:bg-neutral-800 transition-colors">
                      <Plus className="w-5 h-5"/>
                    </button>
                  </div>
                  {newProductExtras.filter(e => e.type !== 'combo').length > 0 && (
                    <ul className="space-y-2 mb-4">
                      {newProductExtras.filter(e => e.type !== 'combo').map(extra => (
                        <li key={extra.id} className="flex justify-between items-center bg-neutral-50 p-3 rounded-xl border border-neutral-100">
                          <div>
                            <p className="font-bold text-sm text-neutral-800">{extra.name}</p>
                            <p className="text-xs text-neutral-500 text-green-600 font-bold">R$ {extra.price.toFixed(2).replace('.', ',')}</p>
                          </div>
                          <button type="button" onClick={() => handleRemoveProductExtra(extra.id)} className="text-red-500 hover:text-red-700">
                            <X className="w-4 h-4"/>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="pt-4 border-t border-neutral-100">
                  <label className="block text-sm font-bold text-neutral-600 mb-2">Combos Específicos para este Produto (Opcional)</label>
                  <div className="flex gap-2 mb-4">
                    <input type="text" value={newComboName} onChange={e => setNewComboName(e.target.value)} placeholder="Ex: Batata + Refri" className="flex-1 p-3 rounded-xl border border-neutral-200 focus:border-red-600 outline-none" />
                    <input type="number" step="0.01" value={newComboPrice} onChange={e => setNewComboPrice(e.target.value)} placeholder="Preço" className="w-24 p-3 rounded-xl border border-neutral-200 focus:border-red-600 outline-none" />
                    <button type="button" onClick={() => handleAddExtraToProduct('combo')} className="bg-neutral-900 text-white p-3 rounded-xl hover:bg-neutral-800 transition-colors">
                      <Plus className="w-5 h-5"/>
                    </button>
                  </div>
                  {newProductExtras.filter(e => e.type === 'combo').length > 0 && (
                    <ul className="space-y-2 mb-4">
                      {newProductExtras.filter(e => e.type === 'combo').map(combo => (
                        <li key={combo.id} className="flex justify-between items-center bg-neutral-50 p-3 rounded-xl border border-neutral-100">
                          <div>
                            <p className="font-bold text-sm text-neutral-800">{combo.name}</p>
                            <p className="text-xs text-neutral-500 text-green-600 font-bold">R$ {combo.price.toFixed(2).replace('.', ',')}</p>
                          </div>
                          <button type="button" onClick={() => handleRemoveProductExtra(combo.id)} className="text-red-500 hover:text-red-700">
                            <X className="w-4 h-4"/>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <button type="submit" className="w-full py-4 mt-2 bg-yellow-400 text-black rounded-xl font-bold hover:bg-yellow-500 transition-colors uppercase tracking-wide">
                  {editingProductId ? 'Salvar Alterações' : 'Cadastrar Produto'}
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
