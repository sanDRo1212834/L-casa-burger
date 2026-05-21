import React, { useEffect, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { Download, RefreshCw, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function PWAPrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered: ' + r);
    },
    onRegisterError(error) {
      console.log('SW registration error', error);
    },
  });

  const [installPromptEvent, setInstallPromptEvent] = useState<any>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setInstallPromptEvent(e);
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!installPromptEvent) return;
    
    installPromptEvent.prompt();
    const { outcome } = await installPromptEvent.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
      setShowInstallPrompt(false);
    } else {
      console.log('User dismissed the install prompt');
    }
    setInstallPromptEvent(null);
  };

  const handleUpdate = () => {
    setIsUpdating(true);
    // Add artificial delay for the progress bar animation
    setTimeout(() => {
      updateServiceWorker(true);
    }, 2500);
  };

  const cancelUpdate = () => {
    setNeedRefresh(false);
  };

  const cancelInstall = () => {
    setShowInstallPrompt(false);
  };

  return (
    <>
      {/* Install Prompt */}
      <AnimatePresence>
        {showInstallPrompt && !needRefresh && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-neutral-900 border border-neutral-700 w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl relative"
            >
              <button 
                onClick={cancelInstall}
                className="absolute top-3 right-3 text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="p-6 text-center pt-8">
                <div className="w-20 h-20 bg-neutral-800 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-neutral-700 shadow-inner">
                  <img src="/favicon.png" alt="La Casa Burger" className="w-16 h-16 object-contain" />
                </div>
                
                <h3 className="text-xl font-bold text-white mb-2">Instalar Aplicativo</h3>
                <p className="text-sm text-neutral-400 mb-6">Instale o aplicativo da La Casa Burger na sua tela inicial para um acesso mais rápido e fácil!</p>
                
                <button 
                  onClick={handleInstall}
                  className="w-full bg-yellow-400 text-black font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 hover:bg-yellow-500 transition-colors"
                >
                  <Download className="w-5 h-5" />
                  Instalar Agora
                </button>
                <button 
                  onClick={cancelInstall}
                  className="w-full text-neutral-500 font-medium py-3 px-4 mt-2 text-sm hover:text-white transition-colors"
                >
                  Agora não
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Update Prompt */}
      <AnimatePresence>
        {needRefresh && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            {/* Background Logo slightly transparent */}
            <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
               <img src="/favicon.png" alt="" className="w-64 h-64 md:w-96 md:h-96 object-contain grayscale" />
            </div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-neutral-900/90 border border-neutral-700 w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl relative z-10"
            >
              {!isUpdating && (
                <button 
                  onClick={cancelUpdate}
                  className="absolute top-3 right-3 text-neutral-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
              
              <div className="p-6 text-center pt-8">
                <div className="w-20 h-20 bg-neutral-800 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-neutral-700 shadow-inner relative overflow-hidden">
                   <img src="/favicon.png" alt="La Casa Burger" className="w-16 h-16 object-contain relative z-10" />
                   {isUpdating && (
                     <motion.div 
                       className="absolute inset-0 bg-yellow-400/20"
                       animate={{ 
                         opacity: [0.5, 1, 0.5],
                         rotate: [0, 180, 360]
                       }}
                       transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                     />
                   )}
                </div>
                
                <h3 className="text-xl font-bold text-white mb-2">Atualização Disponível</h3>
                
                {isUpdating ? (
                  <>
                    <p className="text-sm text-neutral-400 mb-6">Atualizando o sistema, por favor aguarde...</p>
                    <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-yellow-400"
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 2.2, ease: "easeInOut" }}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-neutral-400 mb-6">Uma nova versão do sistema está disponível com melhorias e correções.</p>
                    
                    <button 
                      onClick={handleUpdate}
                      className="w-full bg-yellow-400 text-black font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 hover:bg-yellow-500 transition-colors"
                    >
                      <RefreshCw className="w-5 h-5" />
                      Atualizar Agora
                    </button>
                    <button 
                      onClick={cancelUpdate}
                      className="w-full text-neutral-500 font-medium py-3 px-4 mt-2 text-sm hover:text-white transition-colors"
                    >
                      Mais tarde
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
