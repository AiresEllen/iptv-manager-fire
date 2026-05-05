import { useMemo, useState, type FormEvent } from 'react';
import { ExternalLink, Link as LinkIcon, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { AppLink } from '../types';

interface Props {
  apps: AppLink[];
  onInsert: (data: Omit<AppLink, 'id' | 'createdAt'>) => Promise<void>;
  onUpdate: (id: string, data: Partial<AppLink>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export default function Apps({ apps, onInsert, onUpdate, onDelete }: Props) {
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<AppLink | null>(null);
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return apps;
    return apps.filter((app) =>
      app.name.toLowerCase().includes(term) ||
      app.url.toLowerCase().includes(term) ||
      app.description.toLowerCase().includes(term)
    );
  }, [apps, search]);

  function startEdit(app: AppLink) {
    setEditing(app);
    setName(app.name);
    setUrl(app.url);
    setDescription(app.description);
  }

  function clearForm() {
    setEditing(null);
    setName('');
    setUrl('');
    setDescription('');
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || !url.trim()) return;
    setSaving(true);
    try {
      const data = { name: name.trim(), url: url.trim(), description: description.trim() };
      if (editing) await onUpdate(editing.id, data);
      else await onInsert(data);
      clearForm();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(app: AppLink) {
    if (!confirm(`Excluir o app/link "${app.name}"?`)) return;
    await onDelete(app.id);
  }

  return (
    <div className='space-y-5'>
      <div>
        <h1 className='text-white text-2xl font-bold'>Apps / Links</h1>
        <p className='text-gray-400 text-sm mt-1'>Cadastre os links dos aplicativos uma vez e use no cadastro dos clientes.</p>
      </div>

      <form onSubmit={handleSubmit} className='bg-gray-800 border border-gray-700 rounded-2xl p-4 sm:p-5 space-y-4'>
        <div className='flex items-center gap-2 text-white font-semibold'>
          <LinkIcon size={18} /> {editing ? 'Editar app/link' : 'Novo app/link'}
        </div>
        <div className='grid sm:grid-cols-2 gap-3'>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder='Nome do app. Ex: Vu Player'
            className='w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500' />
          <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder='Link do app/login'
            className='w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500' />
        </div>
        <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder='Observação opcional. Ex: usado com MAC + código'
          className='w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500' />
        <div className='flex gap-3'>
          <button type='submit' disabled={saving}
            className='flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors'>
            <Plus size={16} /> {editing ? 'Salvar alteração' : 'Cadastrar app/link'}
          </button>
          {editing && (
            <button type='button' onClick={clearForm} className='bg-gray-700 hover:bg-gray-600 text-gray-200 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors'>Cancelar</button>
          )}
        </div>
      </form>

      <div className='relative'>
        <Search size={16} className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-500' />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder='Pesquisar app/link...'
          className='w-full bg-gray-800 border border-gray-700 rounded-xl pl-9 pr-4 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500' />
      </div>

      <div className='grid gap-3'>
        {filtered.length === 0 ? (
          <div className='bg-gray-800 rounded-2xl border border-gray-700 py-12 text-center text-gray-500'>Nenhum app/link cadastrado.</div>
        ) : filtered.map((app) => (
          <div key={app.id} className='bg-gray-800 border border-gray-700 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center gap-3 justify-between'>
            <div className='min-w-0'>
              <p className='text-white font-semibold'>{app.name}</p>
              <a href={app.url} target='_blank' rel='noreferrer' className='text-blue-300 hover:text-blue-200 text-sm break-all inline-flex items-center gap-1'>
                {app.url} <ExternalLink size={13} />
              </a>
              {app.description && <p className='text-gray-400 text-sm mt-1'>{app.description}</p>}
            </div>
            <div className='flex gap-2 shrink-0'>
              <button onClick={() => startEdit(app)} className='p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors' title='Editar'><Pencil size={16} /></button>
              <button onClick={() => handleDelete(app)} className='p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors' title='Excluir'><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
