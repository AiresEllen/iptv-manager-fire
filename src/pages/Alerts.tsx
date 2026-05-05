import { Bell, AlertTriangle, XCircle, MessageSquare, RefreshCw } from "lucide-react";
import { Client } from "../types";
import { getExpiringTomorrow, getExpiredClients } from "../utils/storage";

interface Props {
  clients: Client[];
  onRenew: (id: string) => void;
}

function buildWaLink(phone: string, text: string) {
  return `https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`;
}

export default function Alerts({ clients, onRenew }: Props) {
  const expiring = getExpiringTomorrow(clients);
  const expired = getExpiredClients(clients);

  function msgExpiring(c: Client) {
    return `Olá ${c.name}! 👋\n\nPassando para avisar que seu plano *${c.plan}* de IPTV vence *amanhã (${c.expiresAt})*.\n\nPara renovar e continuar assistindo sem interrupções, entre em contato! 😊`;
  }

  function msgExpired(c: Client) {
    return `Olá ${c.name}! 👋\n\nSeu plano *${c.plan}* de IPTV venceu em *${c.expiresAt}*.\n\nRenove agora para voltar a curtir seus conteúdos favoritos! 🎬`;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-white text-2xl font-bold">Alertas de vencimento</h1>
        <p className="text-gray-400 text-sm mt-1">Clientes que precisam de atenção</p>
      </div>

      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Bell size={18} className="text-yellow-400" />
          <h2 className="text-yellow-300 font-semibold">Vencem amanhã ({expiring.length})</h2>
        </div>
        {expiring.length === 0 ? (
          <p className="text-yellow-700 text-sm">Nenhum cliente vence amanhã.</p>
        ) : (
          <div className="space-y-3">
            {expiring.map((c) => (
              <div key={c.id} className="bg-gray-900/60 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-1">
                  <p className="text-white font-semibold">{c.name}</p>
                  <p className="text-gray-400 text-sm">{c.phone} · {c.plan} · vence {c.expiresAt}</p>
                </div>
                <div className="flex gap-2">
                  <a href={buildWaLink(c.phone, msgExpiring(c))} target="_blank" rel="noreferrer"
                    className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-xs font-medium transition-colors">
                    <MessageSquare size={14} /> WhatsApp
                  </a>
                  <button onClick={() => onRenew(c.id)}
                    className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-xs font-medium transition-colors">
                    <RefreshCw size={14} /> Renovar +30d
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <XCircle size={18} className="text-red-400" />
          <h2 className="text-red-300 font-semibold">Já vencidos ({expired.length})</h2>
        </div>
        {expired.length === 0 ? (
          <p className="text-red-700 text-sm">Nenhum cliente vencido no momento.</p>
        ) : (
          <div className="space-y-3">
            {expired.map((c) => (
              <div key={c.id} className="bg-gray-900/60 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-1">
                  <p className="text-white font-semibold">{c.name}</p>
                  <p className="text-gray-400 text-sm">{c.phone} · {c.plan} · venceu {c.expiresAt}</p>
                </div>
                <div className="flex gap-2">
                  <a href={buildWaLink(c.phone, msgExpired(c))} target="_blank" rel="noreferrer"
                    className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-xs font-medium transition-colors">
                    <MessageSquare size={14} /> WhatsApp
                  </a>
                  <button onClick={() => onRenew(c.id)}
                    className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-xs font-medium transition-colors">
                    <RefreshCw size={14} /> Renovar +30d
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-gray-800 border border-gray-700 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle size={16} className="text-gray-400" />
          <h3 className="text-gray-300 font-medium text-sm">Como funciona?</h3>
        </div>
        <ul className="text-gray-500 text-sm space-y-1 list-disc list-inside">
          <li>Clientes com vencimento <strong className="text-gray-300">amanhã</strong> aparecem na seção amarela.</li>
          <li>Clientes com vencimento <strong className="text-gray-300">já passado</strong> aparecem na seção vermelha.</li>
          <li>Clique em <strong className="text-gray-300">WhatsApp</strong> para abrir conversa individual com mensagem pronta.</li>
          <li>Clique em <strong className="text-gray-300">Renovar +30d</strong> para estender o vencimento em 30 dias.</li>
        </ul>
      </div>
    </div>
  );
}