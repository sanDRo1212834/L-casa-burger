import React, { useState, useEffect } from 'react';
import { useAppContext, ADMIN_EMAILS } from '../context/AppContext';
import { supabase } from '../lib/supabase';
import { Mail, Key } from 'lucide-react';

export function LoginView() {
  const { setView, setUser, isAdmin } = useAppContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const isSupabaseConfigured = () => {
    let url = import.meta.env.VITE_SUPABASE_URL || '';
    if (typeof url === 'string') {
      if (url.startsWith('"') && url.endsWith('"')) url = url.replace(/^"|"$/g, '');
      url = url.trim();
    }
    return url && url !== "" && url !== "https://placeholder.supabase.co";
  };

  useEffect(() => {
    if (isSupabaseConfigured()) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          setUser(session.user);
          if (ADMIN_EMAILS.includes(session.user.email?.toLowerCase() || '')) {
            setView('admin');
          } else {
            setView('customer');
          }
        }
      });

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session) {
          setUser(session.user);
          if (ADMIN_EMAILS.includes(session.user.email?.toLowerCase() || '')) {
            setView('admin');
          } else {
            setView('customer');
          }
        } else {
          setUser(null);
        }
      });

      return () => subscription.unsubscribe();
    }
  }, [setView, setUser]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    
    if (isSupabaseConfigured()) {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      setLoading(false);

      if (error) {
        setErrorMsg(error.message);
      }
    } else {
      // Fallback local logic se não houver supabase
      if (email.toLowerCase() === 'lucycosta308@gmail.com' && password !== '99924224') {
        setErrorMsg('Senha incorreta para esta conta.');
        return;
      }
      
      if (password.length >= 3) {
        setUser({ email });
        if (ADMIN_EMAILS.includes(email.toLowerCase())) {
          setView('admin');
        } else {
          setView('customer');
        }
      } else {
        setErrorMsg('Senha inválida. (Mínimo 3 caracteres)');
      }
    }
  };

  const handleGoogleLogin = async () => {
    if (!isSupabaseConfigured()) {
      setErrorMsg('Supabase não configurado para login com Google.');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'https://la-casa-burger.netlify.app',
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      }
    });
    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-neutral-900 flex items-center justify-center p-4">
      <div className="bg-neutral-800 p-8 rounded-3xl w-full max-w-md shadow-2xl border border-neutral-700/50">
        
        <div className="flex justify-center mb-8">
          <div className="w-24 h-24 rounded-full flex items-center justify-center border-4 border-yellow-400 shadow-[0_0_30px_rgba(220,38,38,0.3)] overflow-hidden">
            <img src="/capa.png" alt="La Casa Burguer Logo" className="w-full h-full object-cover" />
          </div>
        </div>

        <h2 className="text-2xl font-black text-white text-center mb-2 uppercase italic tracking-wide">
          Acesso Restrito
        </h2>
        <p className="text-neutral-400 text-center mb-8 font-medium">
          Sistema de Gestão La Casa Burguer
        </p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-neutral-300 mb-2">E-mail</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="w-5 h-5 text-neutral-500" />
              </div>
              <input 
                type="email" 
                value={email}
                onChange={e => { setEmail(e.target.value); setErrorMsg(''); }}
                placeholder="admin@email.com"
                className="w-full pl-12 pr-4 py-4 rounded-xl bg-neutral-900 border border-neutral-700 text-white focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 outline-none transition-all placeholder:text-neutral-600"
                required={isSupabaseConfigured()}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-neutral-300 mb-2">Senha</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Key className="w-5 h-5 text-neutral-500" />
              </div>
              <input 
                type="password" 
                value={password}
                onChange={e => { setPassword(e.target.value); setErrorMsg(''); }}
                placeholder="***"
                className="w-full pl-12 pr-4 py-4 rounded-xl bg-neutral-900 border border-neutral-700 text-white focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 outline-none transition-all placeholder:text-neutral-600"
              />
            </div>
            {errorMsg && <p className="text-red-400 text-sm mt-2 font-medium">{errorMsg}</p>}
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl font-bold bg-yellow-400 hover:bg-yellow-500 text-black transition-colors uppercase tracking-widest text-sm mt-2 flex justify-center items-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Aguarde...' : 'Entrar no Sistema'}
          </button>
        </form>

        <div className="my-6 flex items-center">
          <div className="flex-1 border-t border-neutral-700"></div>
          <span className="px-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">ou</span>
          <div className="flex-1 border-t border-neutral-700"></div>
        </div>

        <button 
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full mb-6 py-4 rounded-xl font-bold bg-white hover:bg-neutral-200 text-neutral-900 transition-colors tracking-widest text-sm flex items-center justify-center gap-3 disabled:opacity-50"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="currentColor" relative="both" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" relative="both" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" relative="both" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" relative="both" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          ENTRAR COM GOOGLE
        </button>
        
        <button 
          type="button"
          onClick={() => setView('customer')}
          className="w-full py-2 text-sm text-neutral-400 hover:text-white transition-colors"
        >
          Voltar para a lanchonete
        </button>
      </div>
    </div>
  );
}
