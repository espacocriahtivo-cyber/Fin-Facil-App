import React from 'react';
import { useFinancial } from '../context/FinancialContext';
import { useAuth } from '../context/AuthContext';
import { ScopeFilter } from '../types';
import { 
  Wifi, 
  WifiOff, 
  Bell, 
  User as UserIcon, 
  Building2, 
  Layers,
  Eye,
  EyeOff
} from 'lucide-react';
import { FinFacilLogo } from './FinFacilLogo';

interface HeaderProps {
  onOpenNotifications: () => void;
  onOpenAuth: () => void;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenNotifications,
  onOpenAuth,
  onOpenSettings,
}) => {
  const { scope, setScope, isOnline, pendingAlerts, showBalances, toggleShowBalances } = useFinancial();
  const { user, userProfile } = useAuth();

  const scopes: { id: ScopeFilter; label: string; icon: React.ReactNode }[] = [
    { id: 'all', label: 'Juntos', icon: <Layers className="w-3.5 h-3.5" /> },
    { id: 'personal', label: 'Pessoal', icon: <UserIcon className="w-3.5 h-3.5" /> },
    { id: 'business', label: 'Negócio', icon: <Building2 className="w-3.5 h-3.5" /> },
  ];

  const urgentAlertsCount = pendingAlerts.filter(
    (a) => a.status === 'overdue' || a.status === 'due_today'
  ).length;

  return (
    <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white px-4 py-2.5 transition-all">
      <div className="max-w-4xl mx-auto flex flex-col gap-2.5">
        {/* Top line: Brand + Connection Status + Privacy Toggle + Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-slate-950/80 border border-emerald-500/30 flex items-center justify-center shadow-lg shadow-emerald-500/10">
              <FinFacilLogo size={30} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold tracking-tight text-white text-base">Fin Fácil App</span>
                {/* Offline / Online Status Pill */}
                <div
                  className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium border transition-colors ${
                    isOnline
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : 'bg-amber-500/15 border-amber-500/40 text-amber-300 animate-pulse'
                  }`}
                  title={
                    isOnline
                      ? 'Conectado à nuvem Firebase em tempo real'
                      : 'Modo offline: dados salvos localmente e sincronizados ao reconectar'
                  }
                >
                  {isOnline ? (
                    <>
                      <Wifi className="w-2.5 h-2.5" />
                      <span>Online</span>
                    </>
                  ) : (
                    <>
                      <WifiOff className="w-2.5 h-2.5" />
                      <span>Offline</span>
                    </>
                  )}
                </div>
              </div>
              <p className="text-[11px] text-slate-400 leading-none truncate max-w-[170px]">
                {userProfile?.businessName || 'Equilíbrio Pessoal & Negócio'}
              </p>
            </div>
          </div>

          {/* Right Header Icons */}
          <div className="flex items-center gap-1.5">
            {/* Privacy Eye Toggle (Show/Hide Values) */}
            <button
              onClick={toggleShowBalances}
              className={`p-2 rounded-xl border transition active:scale-95 ${
                showBalances
                  ? 'bg-slate-800/80 hover:bg-slate-700/80 border-slate-700/50 text-slate-300'
                  : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-400'
              }`}
              aria-label={showBalances ? 'Ocultar valores' : 'Mostrar valores'}
              title={showBalances ? 'Ocultar valores' : 'Mostrar valores'}
            >
              {showBalances ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>

            {/* Notification Bell */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/50 text-slate-200 transition active:scale-95"
              aria-label="Notificações e Contas a Vencer"
              title="Notificações e Contas a Vencer"
            >
              <Bell className="w-4 h-4" />
              {pendingAlerts.length > 0 && (
                <span
                  className={`absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold rounded-full text-white ${
                    urgentAlertsCount > 0 ? 'bg-red-500 animate-bounce' : 'bg-amber-500'
                  }`}
                >
                  {pendingAlerts.length}
                </span>
              )}
            </button>

            {/* User Profile / Login */}
            {user ? (
              <button
                onClick={onOpenSettings}
                className="flex items-center gap-1.5 pl-1.5 pr-2.5 py-1 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/50 text-slate-200 transition active:scale-95"
              >
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'Avatar'}
                    className="w-5 h-5 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-indigo-600/80 text-[10px] flex items-center justify-center font-bold">
                    {(user.displayName || user.email || 'U')[0].toUpperCase()}
                  </div>
                )}
                <span className="text-xs font-medium max-w-[70px] truncate">
                  {user.displayName?.split(' ')[0] || (user.isAnonymous ? 'Demo' : 'Conta')}
                </span>
              </button>
            ) : (
              <button
                onClick={onOpenAuth}
                className="px-2.5 py-1 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow transition active:scale-95"
              >
                Entrar
              </button>
            )}
          </div>
        </div>

        {/* Scope Selector: Pessoal vs Micro Negócio vs Consolidado */}
        <div className="grid grid-cols-3 bg-slate-950/80 p-0.5 rounded-xl border border-slate-800 text-xs font-medium">
          {scopes.map((s) => {
            const isActive = scope === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setScope(s.id)}
                className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg transition-all ${
                  isActive
                    ? s.id === 'personal'
                      ? 'bg-indigo-600 text-white shadow font-semibold'
                      : s.id === 'business'
                      ? 'bg-emerald-600 text-white shadow font-semibold'
                      : 'bg-slate-700 text-white shadow font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {s.icon}
                <span>{s.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
