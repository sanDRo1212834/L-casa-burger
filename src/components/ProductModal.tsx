import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X } from 'lucide-react';
import { Product } from '../types';
import { useAppContext } from '../context/AppContext';

export function ProductModal({ product, onClose }: { product: Product, onClose: () => void }) {
  const { addToCart } = useAppContext();
  const [quantity, setQuantity] = useState(1);
  const [observation, setObservation] = useState('');
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleAdd = () => {
    addToCart(product, quantity, observation);
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

        <div className="p-6 overflow-y-auto flex-1">
          <h2 className="text-2xl font-black text-neutral-900 mb-2">{product.name}</h2>
          <p className="text-neutral-500 mb-6">{product.description}</p>

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
            <span>R$ {(product.price * quantity).toFixed(2).replace('.', ',')}</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
