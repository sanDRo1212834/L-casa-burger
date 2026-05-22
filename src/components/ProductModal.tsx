import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Minus, ChevronDown, ChevronUp } from 'lucide-react';
import { Product, CartItemExtra, Extra } from '../types';
import { useAppContext } from '../context/AppContext';

export function ProductModal({ product, onClose }: { product: Product, onClose: () => void }) {
  const { addToCart, categories } = useAppContext();
  const [quantity, setQuantity] = useState(1);
  const [observation, setObservation] = useState('');
  const [imageLoaded, setImageLoaded] = useState(false);
  const [selectedExtras, setSelectedExtras] = useState<CartItemExtra[]>([]);
  const [isExtrasExpanded, setIsExtrasExpanded] = useState(true);
  const [isCombosExpanded, setIsCombosExpanded] = useState(true);

  const category = categories.find(c => c.id === product.categoryId);
  const availableExtras = [...(category?.extras || []), ...(product.extras || [])];

  // Remove duplicates by ID just in case
  const uniqueExtrasArray = Array.from(new Map(availableExtras.map(item => [item.name.toLowerCase(), item])).values());
  const justExtras = uniqueExtrasArray.filter(e => e.type !== 'combo');
  const justCombos = uniqueExtrasArray.filter(e => e.type === 'combo');

  const handleToggleExtra = (extra: Extra) => {
    setSelectedExtras(prev => {
      const existing = prev.find(e => e.extra.id === extra.id);
      if (existing) {
        return prev.filter(e => e.extra.id !== extra.id);
      } else {
        return [...prev, { extra, quantity: 1 }];
      }
    });
  };

  const handleExtraQuantity = (extraId: string, delta: number) => {
    setSelectedExtras(prev => prev.map(e => {
      if (e.extra.id === extraId) {
        const newQuantity = Math.max(1, e.quantity + delta);
        return { ...e, quantity: newQuantity };
      }
      return e;
    }));
  };

  const extrasTotal = selectedExtras.reduce((sum, item) => sum + (item.extra.price * item.quantity), 0);
  const finalPrice = (product.price + extrasTotal) * quantity;

  const handleAdd = () => {
    addToCart(product, quantity, observation, selectedExtras);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        className="w-full max-w-lg bg-white sm:rounded-3xl rounded-t-3xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="relative h-64 flex-shrink-0 bg-neutral-200">
          {!imageLoaded && (
            <div className="absolute inset-0 animate-pulse bg-neutral-300" />
          )}
          <img 
            src={product.image} 
            alt={product.name} 
            className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`} 
            onLoad={() => setImageLoaded(true)}
          />
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center text-neutral-900 hover:bg-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 hide-scrollbar">
          <h2 className="text-2xl font-black text-neutral-900 mb-2">{product.name}</h2>
          <p className="text-neutral-500 mb-6">{product.description}</p>

          {justCombos.length > 0 && (
            <div className="mb-6">
              <button 
                onClick={() => setIsCombosExpanded(!isCombosExpanded)} 
                className="w-full flex items-center justify-between py-2 border-b border-neutral-100 mb-3 group"
              >
                <h3 className="font-bold text-lg text-neutral-900 group-hover:text-red-600 transition-colors">Combos</h3>
                {isCombosExpanded ? <ChevronUp className="w-5 h-5 text-neutral-400" /> : <ChevronDown className="w-5 h-5 text-neutral-400" />}
              </button>
              <AnimatePresence>
                {isCombosExpanded && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden space-y-3"
                  >
                    {justCombos.map(combo => {
                      const selected = selectedExtras.find(e => e.extra.id === combo.id);
                      return (
                        <div key={combo.id} className="flex items-center justify-between p-3 rounded-2xl border border-neutral-100 bg-neutral-50 cursor-pointer" onClick={(e) => {
                          if ((e.target as HTMLElement).closest('.qty-btn')) return;
                          handleToggleExtra(combo);
                        }}>
                          <div>
                            <p className="font-bold text-neutral-800">{combo.name}</p>
                            <p className="text-sm font-bold text-green-600">+ R$ {combo.price.toFixed(2).replace('.', ',')}</p>
                          </div>
                          
                          {selected ? (
                            <div className="flex items-center gap-3 qty-btn">
                              <button onClick={(e) => { e.stopPropagation(); handleExtraQuantity(combo.id, -1); }} className="w-8 h-8 rounded-full bg-white border border-neutral-200 flex items-center justify-center hover:bg-neutral-100">
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="font-bold w-4 text-center">{selected.quantity}</span>
                              <button onClick={(e) => { e.stopPropagation(); handleExtraQuantity(combo.id, 1); }} className="w-8 h-8 rounded-full bg-white border border-neutral-200 flex items-center justify-center hover:bg-neutral-100">
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="w-8 h-8 rounded-full border-2 border-neutral-300 flex items-center justify-center text-neutral-400">
                              <Plus className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {justExtras.length > 0 && (
            <div className="mb-6">
              <button 
                onClick={() => setIsExtrasExpanded(!isExtrasExpanded)} 
                className="w-full flex items-center justify-between py-2 border-b border-neutral-100 mb-3 group"
              >
                <h3 className="font-bold text-lg text-neutral-900 group-hover:text-red-600 transition-colors">Adicionais</h3>
                {isExtrasExpanded ? <ChevronUp className="w-5 h-5 text-neutral-400" /> : <ChevronDown className="w-5 h-5 text-neutral-400" />}
              </button>
              <AnimatePresence>
                {isExtrasExpanded && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden space-y-3"
                  >
                    {justExtras.map(extra => {
                      const selected = selectedExtras.find(e => e.extra.id === extra.id);
                      return (
                        <div key={extra.id} className="flex items-center justify-between p-3 rounded-2xl border border-neutral-100 bg-neutral-50 cursor-pointer" onClick={(e) => {
                          if ((e.target as HTMLElement).closest('.qty-btn')) return;
                          handleToggleExtra(extra);
                        }}>
                          <div>
                            <p className="font-bold text-neutral-800">{extra.name}</p>
                            <p className="text-sm font-bold text-green-600">+ R$ {extra.price.toFixed(2).replace('.', ',')}</p>
                          </div>
                          
                          {selected ? (
                            <div className="flex items-center gap-3 qty-btn">
                              <button onClick={(e) => { e.stopPropagation(); handleExtraQuantity(extra.id, -1); }} className="w-8 h-8 rounded-full bg-white border border-neutral-200 flex items-center justify-center hover:bg-neutral-100">
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="font-bold w-4 text-center">{selected.quantity}</span>
                              <button onClick={(e) => { e.stopPropagation(); handleExtraQuantity(extra.id, 1); }} className="w-8 h-8 rounded-full bg-white border border-neutral-200 flex items-center justify-center hover:bg-neutral-100">
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="w-8 h-8 rounded-full border-2 border-neutral-300 flex items-center justify-center text-neutral-400">
                              <Plus className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          <h3 className="font-bold text-lg text-neutral-900 mb-3">Alguma observação?</h3>
          <textarea 
            value={observation}
            onChange={(e) => setObservation(e.target.value)}
            placeholder="Ex: Tirar cebola, sem maionese..."
            className="w-full bg-neutral-100 rounded-xl p-4 text-neutral-900 outline-none focus:ring-2 focus:ring-yellow-400 placeholder:text-neutral-400 resize-none min-h-[100px]"
          />
        </div>

        <div className="p-4 sm:p-6 bg-white border-t border-neutral-100 flex items-center gap-4">
          <div className="flex items-center gap-3 bg-neutral-100 rounded-full p-1 border border-neutral-200">
            <button 
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-10 h-10 rounded-full bg-white text-neutral-900 font-bold text-xl flex items-center justify-center shadow-sm"
            >-</button>
            <span className="font-bold w-6 text-center">{quantity}</span>
            <button 
              onClick={() => setQuantity(quantity + 1)}
              className="w-10 h-10 rounded-full bg-white text-neutral-900 font-bold text-xl flex items-center justify-center shadow-sm"
            >+</button>
          </div>

          <button 
            onClick={handleAdd}
            className="flex-1 py-4 rounded-full font-bold text-lg bg-yellow-400 hover:bg-yellow-500 text-black shadow-lg shadow-yellow-400/20 transition-all flex justify-between items-center px-6"
          >
            <span>Adicionar</span>
            <span>R$ {finalPrice.toFixed(2).replace('.', ',')}</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
