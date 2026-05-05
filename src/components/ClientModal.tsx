import { useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { X, Loader2, Search } from 'lucide-react';
import { AppLink, Client, Plan } from '../types';

interface Props {
  initial: Client | null;
  apps: AppLink[];
  onSave: (data: Omit<Client, 'id' | 'createdAt'>) => Promise<void>;
  onClose: () => void;
  saving?: boolean;
}

const plans: Plan[] = ['Basic', 'Standard', 'Premium', 'Ultra'];

export default function ClientModal({ initial, apps, onSave, onClose, saving }: Props) {
  const [name, setName] = useState(initial?.name ?? '');
  const [phone, setPhone] = useState(initial?.phone ?? '');
  const [plan, setPlan] = useState<Plan>(initial?.plan ?? 'Basic');
  const [expiresAt, setExpiresAt] = useState(initial?.expiresAt ?? '');
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [active, setActive] = useState(initial?.active ?? true);
  const [username, setUsername] = useState(initial?.username ?? '');
  const [server, setServer] = useState(initial?.server ?? '');
  const [player, setPlayer] = useState(initial?.player ?? '');
  const [mac, setMac] = useState(initial?.mac ?? '');
  const [code, setCode] = useState(initial?.code ?? '');
  const [siteUrl, setSiteUrl] = useState(initial?.siteUrl ?? '');
  const [value, setValue] = useState(initial?.value ?? '');
  const [appLinkId, setAppLinkId] = useState(initial?.appLinkId ?? '');
  const [appLinkName, setAppLinkName] = useState(initial?.appLinkName ?? '');
  const [appSearch, setAppSearch] = useState('');

  const filteredApps = useMemo(() => {
    const term = appSearch.trim().toLowerCase();
    if (!term) return apps.slice(0, 6);
    return apps.filter((app) =>
      app.name.toLowerCase().includes(term) ||
      app.url.toLowerCase().includes(term) ||
      app.description.toLowerCase().includes(term)
    ).slice(0, 6);
  }, [apps, appSearch]);

  function selectApp(app: AppLink) {
    setAppLinkId(app.id);
    setAppLinkName(app.name);
    setSiteUrl(app.url);
    setAppSearch('');
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !expiresAt) return;
    await onSave({
      name: name.trim(),
      phone: phone.replace(/\D/g, ''),
      plan,
      expiresAt,
      notes: notes.trim(),
      active,
      username: username.trim(),
      server: server.trim(),
      player: player.trim(),
      mac: mac.trim(),
      code: code.trim(),
      siteUrl: siteUrl.trim(),
      value: value.trim(),
      appLinkId,
      appLinkName,
    });
  }

  return (
    <div className='fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4'>
      <div className='bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-3xl shadow-2xl max-h-[92vh] overflow-y-auto'>
        <div className='flex items-center justify-between px-6 py-4 border-b border-gray-800 sticky top-0 bg-gray-900 z-10'>
          <h2 className='text-white font-bold text-lg'>{initial ? 'Editar cliente' : 'Novo cliente'}</h2>
          <button onClick={onClose} className='text-gray-400 hover:text-white'><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className='px-6 py-5 space-y-4'>
          <div className='grid sm:grid-cols-2 gap-3'>
            <Field label='Nome *'><input value={name} onChange={(e) => setName(e.target.value)} required className={inputCls} placeholder='Nome completo' /></Field>
            <Field label='Usuário IPTV'><input value={username} onChange={(e) => setUsername(e.target.value)} className={inputCls} placeholder='Usuário IPTV' /></Field>
            <Field label='Servidor'><input value={server} onChange={(e) => setServer(e.target.value)} className={inputCls} placeholder='Servidor' /></Field>
            <Field label='Player'><input value={player} onChange={(e) => setPlayer(e.target.value)} className={inputCls} placeholder='Player usado' /></Field>
            <Field label='MAC'><input value={mac} onChange={(e) => setMac(e.target.value)} className={inputCls} placeholder='MAC do aparelho/app' /></Field>
            <Field label='Código / chave'><input value={code} onChange={(e) => setCode(e.target.value)} className={inputCls} placeholder='Código de identificação' /></Field>
          </div>

          <div className='rounded-2xl border border-gray-700 bg-gray-950/40 p-4 space-y-3'>
            <label className='text-gray-300 text-sm font-semibold flex items-center gap-2'><Search size={15} /> App / Link usado</label>
            <input value={appSearch} onChange={(e) => setAppSearch(e.target.value)} placeholder='Digite para buscar app/link cadastrado...'
              className={inputCls} />
            {appSearch.trim() && (
              <div className='grid gap-2'>
                {filteredApps.length === 0 ? <p className='text-gray-500 text-sm'>Nenhum app/link encontrado.</p> : filteredApps.map((app) => (
                  <button type='button' key={app.id} onClick={() => selectApp(app)}
                    className='text-left rounded-xl border border-gray-700 bg-gray-800 hover:bg-gray-700 px-3 py-2 transition-colors'>
                    <p className='text-white text-sm font-medium'>{app.name}</p>
                    <p className='text-gray-400 text-xs break-all'>{app.url}</p>
                  </button>
                ))}
              </div>
            )}
            {appLinkName && <p className='text-green-300 text-xs'>Selecionado: {appLinkName}</p>}
            <Field label='Site / URL'>
              <input value={siteUrl} onChange={(e) => { setSiteUrl(e.target.value); setAppLinkId(''); setAppLinkName(''); }} className={inputCls} placeholder='Link do app ou site' />
            </Field>
          </div>

          <div className='grid sm:grid-cols-2 gap-3'>
            <Field label='Valor'><input value={value} onChange={(e) => setValue(e.target.value)} className={inputCls} placeholder='Ex: 30,00' /></Field>
            <Field label='Telefone (WhatsApp) *'>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} required className={inputCls} placeholder='5511999999999' />
              <p className='text-gray-600 text-xs mt-1'>Com código do país, sem + ou espaço. Ex: 5511999999999</p>
            </Field>
            <Field label='Plano *'>
              <select value={plan} onChange={(e) => setPlan(e.target.value as Plan)} className={inputCls}>
                {plans.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </Field>
            <Field label='Vencimento *'>
              <input type='date' value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} required className={inputCls} />
            </Field>
          </div>

          <Field label='Observações'>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2}
              className={inputCls + ' resize-none'} placeholder='Anotações opcionais...' />
          </Field>

          <div className='flex items-center gap-3'>
            <input type='checkbox' id='activeCheck' checked={active} onChange={(e) => setActive(e.target.checked)} className='w-4 h-4 accent-blue-500' />
            <label htmlFor='activeCheck' className='text-gray-300 text-sm'>Cliente ativo</label>
          </div>
          <div className='flex gap-3 pt-2'>
            <button type='button' onClick={onClose} disabled={saving}
              className='flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 py-2.5 rounded-xl text-sm font-medium transition-colors'>
              Cancelar
            </button>
            <button type='submit' disabled={saving}
              className='flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2'>
              {saving && <Loader2 size={15} className='animate-spin' />}
              {initial ? 'Salvar' : 'Cadastrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <div><label className='text-gray-400 text-sm block mb-1'>{label}</label>{children}</div>;
}

const inputCls = 'w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500';
