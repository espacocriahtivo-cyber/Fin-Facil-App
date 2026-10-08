import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useFinancial } from '../context/FinancialContext';
import { 
  Building2, 
  User, 
  Wifi, 
  WifiOff, 
  LogOut, 
  Bell, 
  Save, 
  Database, 
  ShieldCheck, 
  RefreshCw,
  Trash2,
  AlertTriangle 
} from 'lucide-react';

interface SettingsViewProps {
  onOpenAuth: () => void;
  onOpenNotifications: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  onOpenAuth,
  onOpenNotifications,
}) => {
  const { user, userProfile, updateProfileSettings, signOut } = useAuth();
  const { isOnline, transactions, seedInitialDataIfEmpty, clearAllTransactions } = useFinancial();

  const [displayName, setDisplayName] = useState(userProfile?.displayName || '');
  const [businessName, setBusinessName] = useState(userProfile?.businessName || '');
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [confirmClearAll, setConfirmClearAll] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfileSettings({
        displayName: displayName.trim(),
        businessName: businessName.trim(),
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 pb-24 animate-fadeIn">
      <div>
        <h2 className="text-base font-bold text-white tracking-tight">
          Ajustes & Configurações
        </h2>
        <p className="text-[11px] text-slate-400">
          Personalização do perfil, negócio e sincronização offline
        </p>
      </div>

      {/* Account / User Box */}
      <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt="Avatar"
                className="w-11 h-11 rounded-2xl object-cover border border-slate-700"
              />
            ) : (
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-indigo-600 text-white font-black text-base flex items-center justify-center">
                {(user?.displayName || user?.email || 'U')[0].toUpperCase()}
              </div>
            )}
            <div>
              <h3 className="text-sm font-bold text-slate-100">
                {user?.displayName || (user?.isAnonymous ? 'Visitante Demo' : 'Usuário')}
              </h3>
              <p className="text-xs text-slate-400 truncate max-w-[200px]">
                {user?.email || (user?.isAnonymous ? 'Modo Demonstração' : 'Sem e-mail')}
              </p>
            </div>
          </div>

          {user ? (
            <button
              onClick={() => signOut()}
              className="p-2 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-700 transition"
              title="Desconectar"
            >
              <LogOut className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow transition"
            >
              Fazer Login
            </button>
          )}
        </div>

        {/* Profile Edit Form */}
        {user && (
          <form onSubmit={handleSave} className="space-y-3 pt-3 border-t border-slate-800/80">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <User className="w-3 h-3" /> Seu Nome
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Ex: Carlos Silva"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Building2 className="w-3 h-3" /> Nome do Micro Negócio (MEI/PJ)
              </label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Ex: Studio Criativo MEI, Consultoria ABC..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 font-semibold text-xs flex items-center justify-center gap-1.5 border border-slate-700 transition active:scale-[0.98] disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Salvando...' : savedSuccess ? 'Salvo com Sucesso! ✓' : 'Salvar Dados'}</span>
            </button>
          </form>
        )}
      </div>

      {/* Offline Mode & Sync Card */}
      <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-4 shadow-sm space-y-2.5">
        <div className="flex items-center gap-2">
          {isOnline ? (
            <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400">
              <Wifi className="w-4 h-4" />
            </div>
          ) : (
            <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400">
              <WifiOff className="w-4 h-4" />
            </div>
          )}
          <div>
            <h4 className="text-xs font-bold text-slate-100">
              {isOnline ? 'Sincronização em Tempo Real (Online)' : 'Modo Offline Ativo'}
            </h4>
            <p className="text-[10px] text-slate-400">
              {isOnline
                ? 'Conectado diretamente ao Firebase Cloud Firestore.'
                : 'Trabalhando localmente com IndexedDB offline cache.'}
            </p>
          </div>
        </div>

        <p className="text-[11px] text-slate-300 bg-slate-950/50 p-3 rounded-2xl border border-slate-800 leading-relaxed">
          O aplicativo conta com suporte offline nativo. Mesmo sem internet ou com sinal instável na rua, você pode registrar receitas, despesas e conferir seus relatórios normalmente. Todas as alterações serão sincronizadas com o banco de dados na nuvem automaticamente assim que houver conexão.
        </p>
      </div>

      {/* Notifications Shortcut */}
      <div
        onClick={onOpenNotifications}
        className="cursor-pointer rounded-2xl bg-slate-900/90 hover:bg-slate-850/80 border border-slate-800 p-3.5 flex items-center justify-between transition"
      >
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-slate-100">
              Gerenciar Notificações & Vencimentos
            </h4>
            <p className="text-[10px] text-slate-400">
              Ativar push alerts, som e teste de alertas preventivos
            </p>
          </div>
        </div>
        <span className="text-xs text-slate-400">›</span>
      </div>

      {/* Database Management & Sample Data */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-3.5 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <Database className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold">Transações Armazenadas</span>
          </div>
          <span className="font-bold text-white bg-slate-800 px-2 py-0.5 rounded-full text-[11px]">
            {transactions.length} registros
          </span>
        </div>

        {confirmClearAll ? (
          <div className="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-xs space-y-2 animate-fadeIn">
            <div className="flex items-center gap-2 font-bold text-rose-300">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>Apagar todos os {transactions.length} registros?</span>
            </div>
            <p className="text-[11px] text-slate-300">
              Essa ação apagará todos os seus lançamentos da nuvem para você recomeçar do zero.
            </p>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => setConfirmClearAll(false)}
                className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isClearing}
                onClick={async () => {
                  setIsClearing(true);
                  try {
                    await clearAllTransactions();
                    setConfirmClearAll(false);
                  } finally {
                    setIsClearing(false);
                  }
                }}
                className="py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold transition flex items-center justify-center gap-1 shadow-md shadow-rose-600/30"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isClearing ? 'Apagando tudo...' : 'Sim, Apagar Tudo'}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-2 pt-1">
            <button
              onClick={() => seedInitialDataIfEmpty()}
              className="flex-1 py-2 px-3 rounded-xl bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-300 text-xs font-medium flex items-center justify-center gap-1.5 transition active:scale-95"
            >
              <RefreshCw className="w-3.5 h-3.5 text-blue-400" />
              <span>Inserir Dados de Exemplo</span>
            </button>

            {transactions.length > 0 && (
              <button
                onClick={() => setConfirmClearAll(true)}
                className="py-2 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/25 text-rose-400 text-xs font-medium flex items-center justify-center gap-1.5 transition active:scale-95"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Apagar Todos os Registros</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Security & Multi-user isolation badge */}
      <div className="flex items-center gap-2 text-[11px] text-slate-500 justify-center pt-2">
        <ShieldCheck className="w-4 h-4 text-emerald-500" />
        <span>Dados isolados por usuário com regras seguras do Firebase</span>
      </div>
    </div>
  );
};
