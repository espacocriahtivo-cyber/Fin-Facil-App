import React, { useState } from 'react';
import { useFinancial } from '../context/FinancialContext';
import { formatCurrency, formatDateBR } from '../utils/export';
import { 
  getNotificationPermission, 
  requestNotificationPermission, 
  sendPushNotification 
} from '../utils/notifications';
import { 
  X, 
  Bell, 
  CheckCircle2, 
  AlertTriangle, 
  Calendar, 
  Sparkles, 
  Building2, 
  User 
} from 'lucide-react';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { pendingAlerts, markAsPaid, transactions } = useFinancial();

  const [permission, setPermission] = useState<NotificationPermission>(getNotificationPermission());
  const [testSent, setTestSent] = useState(false);

  if (!isOpen) return null;

  const handleRequestPermission = async () => {
    const granted = await requestNotificationPermission();
    setPermission(getNotificationPermission());
    if (granted) {
      sendPushNotification('Fin Fácil App Ativado! 🔔', {
        body: 'Você agora receberá alertas inteligentes de contas e vencimentos pendentes.',
      });
      setTestSent(true);
    }
  };

  const handleTestNotification = () => {
    const success = sendPushNotification('Alerta de Vencimento (Teste) ⏰', {
      body: 'Conta DAS-MEI ou Boleto vence amanhã no valor de R$ 75,00.',
    });
    setTestSent(success);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full sm:max-w-lg bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden animate-slideUp">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Contas & Notificações Push</h3>
              <p className="text-[11px] text-slate-400">
                Lembretes inteligentes de pagamentos pendentes
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

        {/* Modal Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Push Notification Card */}
          <div className="rounded-2xl bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-800 p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-bold text-slate-200">
                  Notificações Push no Dispositivo
                </h4>
              </div>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                  permission === 'granted'
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : permission === 'denied'
                    ? 'bg-red-500/20 text-red-300'
                    : 'bg-amber-500/20 text-amber-300'
                }`}
              >
                {permission === 'granted'
                  ? 'Ativas'
                  : permission === 'denied'
                  ? 'Bloqueadas no Navegador'
                  : 'Desativadas'}
              </span>
            </div>

            <p className="text-[11px] text-slate-400 mb-3">
              Receba avisos automáticos na barra de notificações quando contas e boletos estiverem vencendo, para evitar juros e multas tanto no pessoal quanto no seu negócio.
            </p>

            <div className="flex items-center gap-2">
              {permission !== 'granted' ? (
                <button
                  onClick={handleRequestPermission}
                  className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow transition active:scale-95"
                >
                  Ativar Notificações Push
                </button>
              ) : (
                <button
                  onClick={handleTestNotification}
                  className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 text-xs font-semibold transition active:scale-95"
                >
                  {testSent ? 'Notificação enviada! 🚀' : 'Enviar Teste de Notificação'}
                </button>
              )}
            </div>
          </div>

          {/* Pending Bills List */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-300 flex items-center justify-between">
              <span>Lançamentos Pendentes ({pendingAlerts.length})</span>
            </h4>

            {pendingAlerts.length === 0 ? (
              <div className="text-center py-8 rounded-2xl bg-slate-950/40 border border-slate-800/80 p-4">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-80" />
                <p className="text-xs font-semibold text-slate-200">
                  Tudo em dia! Nenhuma conta pendente.
                </p>
                <p className="text-[11px] text-slate-500">
                  Novos pagamentos pendentes aparecerão aqui e dispararão lembretes.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {pendingAlerts.map((alert) => {
                  const t = alert.transaction;
                  const isOverdue = alert.status === 'overdue';
                  const isToday = alert.status === 'due_today';

                  return (
                    <div
                      key={t.id}
                      className={`p-3 rounded-2xl border flex items-center justify-between gap-3 transition ${
                        isOverdue
                          ? 'bg-red-500/10 border-red-500/30 text-red-200'
                          : isToday
                          ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                          : 'bg-slate-950/70 border-slate-800 text-slate-200'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                              isOverdue
                                ? 'bg-red-500 text-white'
                                : isToday
                                ? 'bg-amber-500 text-slate-950 font-black'
                                : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            {isOverdue
                              ? `Atrasado ${Math.abs(alert.daysDiff)}d`
                              : isToday
                              ? 'Vence Hoje!'
                              : `Em ${alert.daysDiff} dias`}
                          </span>

                          <span
                            className={`text-[9px] px-1.5 py-0.2 rounded font-medium flex items-center gap-1 ${
                              t.context === 'personal'
                                ? 'bg-indigo-500/20 text-indigo-300'
                                : 'bg-emerald-500/20 text-emerald-300'
                            }`}
                          >
                            {t.context === 'personal' ? (
                              <>
                                <User className="w-2.5 h-2.5" /> Pessoal
                              </>
                            ) : (
                              <>
                                <Building2 className="w-2.5 h-2.5" /> Negócio
                              </>
                            )}
                          </span>
                        </div>

                        <p className="text-xs font-semibold text-slate-100 truncate mt-1">
                          {t.description}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {t.category} • Vencimento: {formatDateBR(t.dueDate || t.date)}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="text-xs font-bold text-slate-100">
                          {formatCurrency(t.amount)}
                        </p>
                        <button
                          onClick={() => markAsPaid(t.id)}
                          className="mt-1 px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold shadow transition active:scale-95 flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Pagar</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
