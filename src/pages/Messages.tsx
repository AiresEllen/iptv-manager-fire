import { useState } from "react";
import { Send, MessageSquare, Users, CheckSquare, Square } from "lucide-react";
import { Client } from "../types";

interface Props {
  clients: Client[];
}

function buildWaLink(phone: string, text: string) {
  return `https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`;
}

const templates = [
  {
    label: "Aviso de renovação",
    text: "Olá {nome}! 👋\n\nPassando para avisar que seu plano IPTV está próximo do vencimento.\n\nEntre em contato para renovar e continuar curtindo! 🎬",
  },
  {
    label: "Promoção / oferta",
    text: "Olá {nome}! 🎉\n\nTemos uma oferta especial pra você!\n\nNão perca! Entre em contato agora. 📺",
  },
  {
    label: "Aviso de manutenção",
    text: "Olá {nome}! ⚠️\n\nInformamos que realizaremos uma manutenção no sistema hoje. O serviço pode ficar indisponível por alguns minutos.\n\nAgradecemos sua compreensão.",
  },
  {
    label: "Boas-vindas",
    text: "Olá {nome}! 🎊\n\nBem-vindo(a) ao nosso serviço de IPTV! Seu acesso já está ativo.\n\nQualquer dúvida, estamos aqui. 😊",
  },
];

export default function Messages({ clients }: Props) {
  const [message, setMessage] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [filterPlan, setFilterPlan] = useState<string>("all");
  const [sent, setSent] = useState<Set<string>>(new Set());

  const activeClients = clients.filter((c) => c.active);
  const filtered = activeClients.filter((c) => filterPlan === "all" || c.plan === filterPlan);

  function toggleSelect(id: string) {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  }

  function toggleAll() {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map((c) => c.id)));
  }

  function applyTemplate(tpl: string) {
    setMessage(tpl);
  }

  function handleSendAll() {
    const targets = filtered.filter((c) => selected.has(c.id));
    if (!message.trim() || targets.length === 0) return;
    const nextSent = new Set(sent);
    targets.forEach((c) => {
      const personalised = message.replace(/\{nome\}/gi, c.name.split(" ")[0]);
      window.open(buildWaLink(c.phone, personalised), "_blank");
      nextSent.add(c.id);
    });
    setSent(nextSent);
  }

  const selectedClients = filtered.filter((c) => selected.has(c.id));

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-white text-2xl font-bold">Mensagens em massa</h1>
        <p className="text-gray-400 text-sm mt-1">Envie mensagens para clientes via WhatsApp</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-gray-800 rounded-2xl border border-gray-700 p-5 space-y-3">
            <h2 className="text-white font-semibold flex items-center gap-2"><MessageSquare size={17} /> Mensagem</h2>
            <div className="flex flex-wrap gap-2">
              {templates.map((t) => (
                <button key={t.label} onClick={() => applyTemplate(t.text)}
                  className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 px-3 py-1.5 rounded-lg transition-colors">
                  {t.label}
                </button>
              ))}
            </div>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={7}
              placeholder={"Digite sua mensagem...\n\nUse {nome} para personalizar com o primeiro nome do cliente."}
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500 resize-none"
            />
            <p className="text-gray-600 text-xs">Dica: use <code className="text-blue-400">{"{nome}"}</code> para inserir o primeiro nome do cliente automaticamente.</p>
          </div>

          {selectedClients.length > 0 && message.trim() && (
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-4 space-y-3">
              <p className="text-blue-300 text-sm font-medium">Prévia para {selectedClients[0].name.split(" ")[0]}:</p>
              <p className="text-gray-300 text-sm whitespace-pre-wrap">
                {message.replace(/\{nome\}/gi, selectedClients[0].name.split(" ")[0])}
              </p>
            </div>
          )}

          <button
            onClick={handleSendAll}
            disabled={selected.size === 0 || !message.trim()}
            className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:text-gray-500 text-white py-3 rounded-xl font-bold text-sm transition-colors"
          >
            <Send size={18} />
            Enviar para {selected.size} cliente{selected.size !== 1 ? "s" : ""} selecionado{selected.size !== 1 ? "s" : ""}
          </button>
          <p className="text-gray-600 text-xs text-center -mt-2">
            Cada mensagem abrirá no WhatsApp Web. Permita pop-ups no navegador.
          </p>
        </div>

        <div className="lg:col-span-2 bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-gray-700 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Users size={16} className="text-gray-400" />
              <span className="text-gray-300 text-sm font-medium">Destinatários</span>
            </div>
            <div className="flex items-center gap-2">
              <select value={filterPlan} onChange={(e) => setFilterPlan(e.target.value)}
                className="bg-gray-700 border border-gray-600 rounded-lg px-2 py-1 text-white text-xs focus:outline-none">
                <option value="all">Todos</option>
                {["Basic","Standard","Premium","Ultra"].map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
              <button onClick={toggleAll} title="Selecionar todos"
                className="text-gray-400 hover:text-white transition-colors">
                {selected.size === filtered.length && filtered.length > 0 ? <CheckSquare size={18} /> : <Square size={18} />}
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto max-h-96">
            {filtered.length === 0 ? (
              <p className="text-gray-600 text-sm text-center py-10">Nenhum cliente ativo.</p>
            ) : (
              filtered.map((c) => (
                <label key={c.id}
                  className={`flex items-center gap-3 px-4 py-3 cursor-pointer border-b border-gray-700/50 hover:bg-gray-700/40 transition-colors
                    ${selected.has(c.id) ? "bg-blue-500/10" : ""}`}>
                  <input type="checkbox" checked={selected.has(c.id)} onChange={() => toggleSelect(c.id)}
                    className="w-4 h-4 accent-blue-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">
                      {c.name}
                      {sent.has(c.id) && <span className="ml-1 text-green-400 text-xs">✓ Enviado</span>}
                    </p>
                    <p className="text-gray-500 text-xs truncate">{c.phone} · {c.plan}</p>
                  </div>
                </label>
              ))
            )}
          </div>
          <div className="px-4 py-2 border-t border-gray-700 bg-gray-900/40">
            <p className="text-gray-500 text-xs">{selected.size} de {filtered.length} selecionado{selected.size !== 1 ? "s" : ""}</p>
          </div>
        </div>
      </div>
    </div>
  );
}