import { useEffect, useState } from 'react';
import { Bell, Loader2, WifiOff } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import Alerts from './pages/Alerts';
import Messages from './pages/Messages';
import Apps from './pages/Apps';
import Login from './pages/Login';
import { AppLink, Client, Page } from './types';
import { loadClients, updateClient, insertClient, deleteClient, getExpiringTomorrow, getExpiredClients, loadApps, insertAppLink, updateAppLink, deleteAppLink } from './utils/storage';
import { listenToAuthState, isConfigured, signOut, type AppUser } from './lib/firebase';

export default function App() {
  const [clients, setClients] = useState<Client[]>([]);
  const [apps, setApps] = useState<AppLink[]>([]);
  const [page, setPage] = useState<Page>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [alertBanner, setAlertBanner] = useState(true);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);
  const [user, setUser] = useState<AppUser | null>(null);

  useEffect(() => {
    if (!isConfigured) {
      setAuthLoading(false);
      return;
    }

    const unsubscribe = listenToAuthState((nextUser) => {
      setUser(nextUser);
      setAuthLoading(false);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (isConfigured && !user) {
      setClients([]);
      setApps([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    Promise.all([loadClients(), loadApps()])
      .then(([clientData, appData]) => {
        setClients(clientData);
        setApps(appData);
      })
      .finally(() => setLoading(false));
  }, [user]);

  async function handleInsert(data: Omit<Client, 'id' | 'createdAt'>) {
    const created = await insertClient(data);
    setClients((prev) => [created, ...prev]);
  }

  async function handleUpdate(id: string, data: Partial<Client>) {
    await updateClient(id, data);
    setClients((prev) => prev.map((c) => c.id === id ? { ...c, ...data } : c));
  }

  async function handleDelete(id: string) {
    await deleteClient(id);
    setClients((prev) => prev.filter((c) => c.id !== id));
  }

  async function handleInsertApp(data: Omit<AppLink, 'id' | 'createdAt'>) {
    const created = await insertAppLink(data);
    setApps((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
  }

  async function handleUpdateApp(id: string, data: Partial<AppLink>) {
    await updateAppLink(id, data);
    setApps((prev) => prev.map((a) => a.id === id ? { ...a, ...data } : a).sort((a, b) => a.name.localeCompare(b.name)));
  }

  async function handleDeleteApp(id: string) {
    await deleteAppLink(id);
    setApps((prev) => prev.filter((a) => a.id !== id));
  }

  async function handleRenew(id: string) {
    const client = clients.find((c) => c.id === id);
    if (!client) return;
    const d = new Date(client.expiresAt + 'T12:00:00');
    d.setDate(d.getDate() + 30);
    const newDate = d.toISOString().slice(0, 10);
    await handleUpdate(id, { expiresAt: newDate });
  }

  const expiring = getExpiringTomorrow(clients);
  const expired = getExpiredClients(clients);
  const alertCount = expiring.length + expired.length;

  const pages: Record<Page, React.ReactNode> = {
    dashboard: <Dashboard clients={clients} loading={loading} />,
    clients: <Clients clients={clients} apps={apps} onInsert={handleInsert} onUpdate={handleUpdate} onDelete={handleDelete} />,
    apps: <Apps apps={apps} onInsert={handleInsertApp} onUpdate={handleUpdateApp} onDelete={handleDeleteApp} />,
    alerts: <Alerts clients={clients} onRenew={handleRenew} />,
    messages: <Messages clients={clients} />,
  };

  if (authLoading) {
    return (
      <div className='min-h-screen bg-gray-950 text-white flex items-center justify-center'>
        <div className='flex items-center gap-3 text-gray-300'>
          <Loader2 size={20} className='animate-spin' />
          <span>Carregando...</span>
        </div>
      </div>
    );
  }

  if (isConfigured && !user) {
    return <Login />;
  }

  return (
    <div className='min-h-screen bg-gray-950 text-white'>
      <Sidebar
        current={page}
        onNavigate={(p) => { setPage(p); setSidebarOpen(false); }}
        alertCount={alertCount}
        open={sidebarOpen}
        onToggle={() => setSidebarOpen((v) => !v)}
        userEmail={user?.email ?? undefined}
        onLogout={() => { void signOut(); }}
      />
      <main className='lg:pl-64 min-h-screen flex flex-col'>
        {!isConfigured && (
          <div className='bg-orange-500/15 border-b border-orange-500/30 px-6 py-3 flex items-center gap-3'>
            <WifiOff size={16} className='text-orange-400 flex-shrink-0' />
            <p className='text-orange-300 text-sm'>
              Firebase nao configurado. Dados salvos localmente. Adicione as variaveis VITE_FIREBASE_* no arquivo .env.
            </p>
          </div>
        )}
        {alertBanner && alertCount > 0 && (
          <div className='bg-yellow-500/15 border-b border-yellow-500/30 px-6 py-3 flex items-center gap-3'>
            <Bell size={16} className='text-yellow-400 flex-shrink-0' />
            <p className='text-yellow-300 text-sm flex-1'>
              <strong>{alertCount} cliente{alertCount !== 1 ? 's' : ''}</strong> precisam de atencao:
              {expiring.length > 0 && <span className='ml-1'>{expiring.length} vencem amanha{expired.length > 0 ? ',' : ''}</span>}
              {expired.length > 0 && <span className='ml-1'>{expired.length} ja vencido{expired.length !== 1 ? 's' : ''}</span>}.{' '}
              <button onClick={() => setPage('alerts')} className='underline hover:text-yellow-200 transition-colors'>Ver alertas</button>
            </p>
            <button onClick={() => setAlertBanner(false)} className='text-yellow-600 hover:text-yellow-400 text-lg leading-none ml-2'>x</button>
          </div>
        )}
        <div className='flex-1 px-4 sm:px-6 py-6 max-w-5xl w-full mx-auto'>
          {pages[page]}
        </div>
      </main>
    </div>
  );
}
