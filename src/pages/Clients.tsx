import { useMemo, useState } from 'react';
import { Plus, Search, Pencil, Trash2, CheckCircle, XCircle, Copy, ExternalLink, MessageCircle } from 'lucide-react';
import { AppLink, Client, Plan } from '../types';
import ClientModal from '../components/ClientModal';

interface Props {
  clients: Client[];
  apps: AppLink[];
  onInsert: (data: Omit<Client, 'id' | 'createdAt'>) => Promise<void>;
  onUpdate: (id: string, data: Partial<Client>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export default function Clients({ clients, apps, onInsert, onUpdate, onDelete }: Props) {
  const [search, setSearch] = useState('');
  const [filterPlan, setFilterPlan] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState('');

  const today = new Date().toISOString().slice(0, 10);
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);

  const filtered = useMemo(() => clients.filter((c) => {
    const text = [c.name, c.phone, c.username, c.server, c.player, c.mac, c.code, c.siteUrl, c.appLinkName]
      .filter(Boolean).join(' ').toLowerCase();
    const matchSearch = text.includes(search.toLowerCase());
    const matchPlan = filterPlan === 'all' || c.plan === filterPlan;
    const matchStatus = filterStatus === 'all' ? true
      : filterStatus === 'active' ? c.active && c.expiresAt >= today
      : filterStatus === 'today' ? c.active && c.expiresAt === today
      : filterStatus === 'expired' ? (c.active && c.expiresAt < today)
      : !c.active;
    return matchSearch && matchPlan && matchStatus;
  }), [clients, filterPlan, filterStatus, search, today]);

  async function handleSave(data: Omit<Client, 'id' | 'createdAt'>) {
    setSaving(true);
    try {
      if (editing) await onUpdate(editing.id, data);
      else await onInsert(data);
      setModalOpen(false);
      setEditing(null);
    } finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm('Excluir este cliente?')) return;
    await onDelete(id);
  }

  async function handleToggle(c: Client) {
    await onUpdate(c.id, { active: !c.active });
  }

  async function copyText(label: string, value?: string) {
    if (!value) return;
    await navigator.clipboard.writeText(value);
    setCopied(label);
    setTimeout(() => setCopied(''), 1400);
  }

  function openWhatsapp(c: Client) {
    const phone = c.phone.replace(/\D/g, '');
    if (!phone) return;
    const msg = `Olá ${c.name}! Tudo bem?\n\nPassando para lembrar sobre seu acesso IPTV.\nVencimento: ${formatDate(c.expiresAt)}\nValor: ${c.value ? `R$ ${c.value}` : '-'}\n\nQualquer dúvida estou à disposição.`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
  }

  const planBadge = (plan: Plan) => {
    const cls: Record<Plan, string> = {
      Basic: 'bg-gray-600/40 text-gray-300',
      Standard: 'bg-blue-500/20 text-blue-300',
      Premium: 'bg-purple-500/20 text-purple-300',
      Ultra: 'bg-yellow-500/20 text-yellow-300',
    };
    return cls[plan];
  };

  return (
    <div className='space-y-5'>
      <div className='flex items-center justify-between gap-3'>
        <div>
          <h1 className='text-white text-2xl font-bold'>Clientes</h1>
          <p className='text-gray-400 text-sm mt-1'>{clients.length} cadastrados</p>
        </div>
        <button onClick={() => { setEditing(null); setModalOpen(true); }}
          className='flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors'>
          <Plus size={18} /> Novo cliente
        </button>
      </div>

      {copied && <div className='bg-green-500/15 border border-green-500/30 text-green-300 rounded-xl px-4 py-2 text-sm'>{copied} copiado.</div>}

      <div className='flex flex-col sm:flex-row gap-3'>
        <div className='relative flex-1'>
          <Search size={16} className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-500' />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder='Buscar por nome, telefone, MAC, código, player ou app...'
            className='w-full bg-gray-800 border border-gray-700 rounded-xl pl-9 pr-4 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500' />
        </div>
        <select value={filterPlan} onChange={(e) => setFilterPlan(e.target.value)}
          className='bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500'>
          <option value='all'>Todos os planos</option>
          {['Basic','Standard','Premium','Ultra'].map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
          className='bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500'>
          <option value='all'>Todos</option>
          <option value='active'>Em dia</option>
          <option value='today'>Vence hoje</option>
          <option value='expired'>Vencidos</option>
          <option value='inactive'>Desativados</option>
        </select>
      </div>

      <div className='grid gap-3'>
        {filtered.length === 0 ? (
          <div className='bg-gray-800 rounded-2xl border border-gray-700 py-16 text-center text-gray-500'>Nenhum cliente encontrado.</div>
        ) : filtered.map((c) => {
          const isExpired = c.active && c.expiresAt < today;
          const isToday = c.active && c.expiresAt === today;
          const isExpiring = c.active && c.expiresAt === tomorrow;
          const site = c.siteUrl || '';
          return (
            <div key={c.id} className='bg-gray-800 rounded-2xl border border-gray-700 p-4 hover:border-gray-600 transition-colors'>
              <div className='flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4'>
                <div className='min-w-0 flex-1'>
                  <div className='flex flex-wrap items-center gap-2 mb-2'>
                    <h3 className='text-white font-bold text-lg'>{c.name}</h3>
                    <span className={'px-2 py-1 rounded-full text-xs font-medium ' + planBadge(c.plan)}>{c.plan}</span>
                    <span className={'px-2 py-1 rounded-full text-xs font-medium ' + (c.active ? 'bg-green-500/15 text-green-400' : 'bg-gray-700 text-gray-400')}>
                      {c.active ? 'Ativo' : 'Inativo'}
                    </span>
                    <span className={'px-2 py-1 rounded-full text-xs font-medium ' + (isExpired ? 'bg-red-500/15 text-red-400' : isToday ? 'bg-orange-500/15 text-orange-300' : isExpiring ? 'bg-yellow-500/15 text-yellow-300' : 'bg-gray-700 text-gray-300')}>
                      {isExpired ? 'Vencido' : isToday ? 'Vence hoje' : isExpiring ? 'Vence amanhã' : 'Venc. ' + formatDate(c.expiresAt)}
                    </span>
                  </div>

                  <div className='grid sm:grid-cols-2 gap-x-5 gap-y-1 text-sm text-gray-300'>
                    <Info label='Usuário IPTV' value={c.username} />
                    <Info label='WhatsApp' value={c.phone} />
                    <Info label='Servidor' value={c.server} />
                    <Info label='Player' value={c.player} />
                    <Info label='MAC' value={c.mac} />
                    <Info label='Código' value={c.code} />
                    <Info label='Valor' value={c.value ? `R$ ${c.value}` : ''} />
                    <Info label='App/Link' value={c.appLinkName || site} />
                  </div>
                  {site && <a href={site} target='_blank' rel='noreferrer' className='mt-2 inline-flex items-center gap-1 text-blue-300 hover:text-blue-200 text-sm break-all'>{site}<ExternalLink size={13} /></a>}
                  {c.notes && <p className='mt-2 text-gray-400 text-sm'>{c.notes}</p>}
                </div>

                <div className='flex flex-wrap lg:justify-end gap-2 shrink-0'>
                  <button onClick={() => openWhatsapp(c)} className='btnAction bg-green-600 hover:bg-green-700 text-white'><MessageCircle size={15} /> WhatsApp</button>
                  {site && <a href={site} target='_blank' rel='noreferrer' className='btnAction bg-gray-700 hover:bg-gray-600 text-white'><ExternalLink size={15} /> Site</a>}
                  <button onClick={() => copyText('MAC', c.mac)} className='btnIcon' title='Copiar MAC'><Copy size={16} /> MAC</button>
                  <button onClick={() => copyText('Código', c.code)} className='btnIcon' title='Copiar código'><Copy size={16} /> Código</button>
                  <button onClick={() => handleToggle(c)} title={c.active ? 'Desativar' : 'Ativar'} className='p-2 text-green-400 hover:bg-green-500/10 rounded-lg transition-colors'>
                    {c.active ? <CheckCircle size={17} /> : <XCircle size={17} />}
                  </button>
                  <button onClick={() => { setEditing(c); setModalOpen(true); }} className='p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors' title='Editar'><Pencil size={17} /></button>
                  <button onClick={() => handleDelete(c.id)} className='p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors' title='Excluir'><Trash2 size={17} /></button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {modalOpen && (
        <ClientModal initial={editing} apps={apps} onSave={handleSave} onClose={() => { setModalOpen(false); setEditing(null); }} saving={saving} />
      )}
    </div>
  );
}

function Info({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return <p><span className='text-gray-500'>{label}:</span> {value}</p>;
}

function formatDate(date: string) {
  if (!date) return '-';
  const [year, month, day] = date.split('-');
  return `${day}/${month}/${year}`;
}
