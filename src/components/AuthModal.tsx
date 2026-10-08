import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Lock, Mail, User, Sparkles, Copy, Check } from 'lucide-react';
import { FinFacilLogo } from './FinFacilLogo';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail, signInDemo } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [copiedDomain, setCopiedDomain] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      if (mode === 'signin') {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password, displayName);
      }
      onClose();
    } catch (err: any) {
      const errCode = err?.code || '';
      if (errCode === 'auth/invalid-credential' || errCode === 'auth/user-not-found') {
        setErrorMsg(
          mode === 'signin'
            ? 'Conta não encontrada ou senha incorreta. Se é o seu primeiro acesso, clique na aba "Criar Conta" acima para cadastrar este e-mail.'
            : 'Dados de login inválidos.'
        );
      } else if (errCode === 'auth/email-already-in-use') {
        setErrorMsg('Este e-mail já está cadastrado. Clique na aba "Entrar na Conta" acima para fazer login.');
      } else if (errCode === 'auth/weak-password') {
        setErrorMsg('A senha deve conter no mínimo 6 caracteres.');
      } else if (errCode === 'auth/admin-restricted-operation' || errCode === 'auth/operation-not-allowed') {
        setErrorMsg('O provedor de e-mail está restrito no Firebase. Utilize o botão "Continuar com Google" acima.');
      } else {
        setErrorMsg(err.message || 'Erro de autenticação.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setErrorMsg('');
    setLoading(true);
    try {
      await signInWithGoogle();
      onClose();
    } catch (err: any) {
      const errStr = String(err?.message || '') + ' ' + String(err?.code || '') + ' ' + String(err || '');
      const isUnauthorizedDomain = errStr.includes('unauthorized-domain');

      if (isUnauthorizedDomain) {
        const currentDomain = typeof window !== 'undefined' ? window.location.hostname : 'finfacilapp.pro';
        setErrorMsg(
          `Domínio não autorizado no Firebase: "${currentDomain}". No Firebase Console, adicione tanto "finfacilapp.pro" quanto "www.finfacilapp.pro" (e "${currentDomain}" se estiver em outro endereço).`
        );
      } else if (err.code === 'auth/popup-closed-by-user') {
        setErrorMsg('A janela de login com Google foi fechada antes de concluir.');
      } else if (err.code === 'auth/cancelled-popup-request') {
        setErrorMsg('Operação cancelada.');
      } else {
        setErrorMsg(err.message || 'Falha no login com Google.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async () => {
    setErrorMsg('');
    setLoading(true);
    try {
      await signInDemo();
      onClose();
    } catch (err: any) {
      setErrorMsg(
        err.code === 'auth/admin-restricted-operation' || err.code === 'auth/operation-not-allowed'
          ? 'O acesso anônimo não está ativado no Firebase Console. Utilize o botão "Continuar com Google" acima.'
          : err.message || 'Falha no login visitante.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 space-y-4 animate-scaleUp">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-slate-950/80 border border-emerald-500/30 flex items-center justify-center shadow-lg shadow-emerald-500/10">
              <FinFacilLogo size={28} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {mode === 'signin' ? 'Acessar o Fin Fácil App' : 'Criar Conta no Fin Fácil App'}
              </h3>
              <p className="text-[11px] text-slate-400">
                Finanças simples, práticas e sincronizadas
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-200 text-xs space-y-2.5 animate-fadeIn">
            <p className="leading-relaxed">{errorMsg}</p>
            {errorMsg.includes('Domínio não autorizado') && (
              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    if (typeof navigator !== 'undefined' && window.location.hostname) {
                      navigator.clipboard.writeText(window.location.hostname);
                      setCopiedDomain(true);
                      setTimeout(() => setCopiedDomain(false), 2500);
                    }
                  }}
                  className="py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-[11px] transition flex items-center justify-center gap-1.5 border border-slate-700 active:scale-95"
                >
                  {copiedDomain ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-bold">Domínio Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                      <span>Copiar Domínio ({typeof window !== 'undefined' ? window.location.hostname : ''})</span>
                    </>
                  )}
                </button>

                <a
                  href="https://console.firebase.google.com/project/finfacil-2970f/authentication/settings"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-[11px] transition shadow shadow-red-600/30 active:scale-95"
                >
                  <span>Abrir Firebase Console</span>
                  <span>↗</span>
                </a>
              </div>
            )}
          </div>
        )}

        {/* Google Sign In Button */}
        <button
          onClick={handleGoogle}
          disabled={loading}
          className="w-full py-2.5 px-3 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-semibold text-xs flex items-center justify-center gap-2.5 shadow transition active:scale-[0.98] disabled:opacity-50"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continuar com Google</span>
        </button>

        <div className="flex items-center gap-2 text-slate-500 text-[10px] my-1">
          <div className="flex-1 h-px bg-slate-800" />
          <span>ou acesse por e-mail e senha</span>
          <div className="flex-1 h-px bg-slate-800" />
        </div>

        {/* Mode Switcher Tabs */}
        <div className="grid grid-cols-2 p-1 bg-slate-950 rounded-2xl border border-slate-800 text-xs font-semibold">
          <button
            type="button"
            onClick={() => { setMode('signin'); setErrorMsg(''); }}
            className={`py-2 rounded-xl transition ${
              mode === 'signin'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Entrar na Conta
          </button>
          <button
            type="button"
            onClick={() => { setMode('signup'); setErrorMsg(''); }}
            className={`py-2 rounded-xl transition ${
              mode === 'signup'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Criar Nova Conta
          </button>
        </div>

        {/* Email Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === 'signup' && (
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-400 uppercase">
                Seu Nome
              </label>
              <div className="relative">
                <User className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Nome completo ou apelido"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 transition"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-slate-400 uppercase">
              E-mail
            </label>
            <div className="relative">
              <Mail className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seuemail@exemplo.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 transition"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-slate-400 uppercase">
              Senha
            </label>
            <div className="relative">
              <Lock className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 transition active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? 'Processando...' : mode === 'signin' ? 'Entrar' : 'Cadastrar'}
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="text-center text-xs text-slate-400">
          {mode === 'signin' ? (
            <p>
              Não tem uma conta?{' '}
              <button
                type="button"
                onClick={() => setMode('signup')}
                className="text-emerald-400 hover:underline font-semibold"
              >
                Cadastre-se grátis
              </button>
            </p>
          ) : (
            <p>
              Já possui conta?{' '}
              <button
                type="button"
                onClick={() => setMode('signin')}
                className="text-emerald-400 hover:underline font-semibold"
              >
                Faça login
              </button>
            </p>
          )}
        </div>

        {/* Quick Demo Access */}
        <div className="pt-1 border-t border-slate-800/80">
          <button
            type="button"
            onClick={handleDemo}
            disabled={loading}
            className="w-full py-2 px-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 text-[11px] font-medium flex items-center justify-center gap-1.5 transition active:scale-[0.98]"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Testar como Convidado (Modo Rápido)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
