import { Users, CheckCircle, AlertTriangle, XCircle, TrendingUp, Loader2 } from 'lucide-react';
import { Client } from '../types';
import { getExpiredClients, getExpiringTomorrow } from '../utils/storage';

interface Props { clients: Client[]; loading?: boolean; }

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  return (
    <div className='bg-gray-800 rounded-2xl p-5 flex items-center gap-4 border border-gray-700'>
      <div className={'w-12 h-12 rounded-xl flex items-center justify-center ' + color}>{icon}</div>
      <div>
        <p className='text-gray-400 text-sm'>{label}</p>
        <p className='text-white text-2xl font-bold'>{value}</p>
      </div>
    </div>
  );
}

export default function Dashboard({ clients, loading }: Props) {
  const active = clients.filter((c) => c.active);
  const expired = getExpiredClients(clients);
  const expiring = getExpiringTomorrow(clients);
  const planCount: Record<string, number> = {};
  clients.forEach((c) => { planCount[c.plan] = (planCount[c.plan] || 0) + 1; });
  const recentClients = [...clients].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);

  if (loading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <Loader2 size={32} className='text-blue-400 animate-spin' />
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-white text-2xl font-bold'>Dashboard</h1>
        <p className='text-gray-400 text-sm mt-1'>Visao geral do painel IPTV</p>
      </div>
      <div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>
        <StatCard icon={<Users size={22} className='text-blue-300' />} label='Total clientes' value={clients.length} color='bg-blue-500/20' />
        <StatCard icon={<CheckCircle size={22} className='text-green-300' />} label='Ativos' value={active.length} color='bg-green-500/20' />
        <StatCard icon={<AlertTriangle size={22} className='text-yellow-300' />} label='Vencem amanha' value={expiring.length} color='bg-yellow-500/20' />
        <StatCard icon={<XCircle size={22} className='text-red-300' />} label='Vencidos' value={expired.length} color='bg-red-500/20' />
      </div>
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <div className='bg-gray-800 rounded-2xl p-5 border border-gray-700'>
          <div className='flex items-center gap-2 mb-4'>
            <TrendingUp size={18} className='text-blue-400' />
            <h2 className='text-white font-semibold'>Planos ativos</h2>
          </div>
          <div className='space-y-3'>
            {['Basic','Standard','Premium','Ultra'].map((plan) => {
              const count = planCount[plan] || 0;
              const pct = clients.length ? Math.round((count / clients.length) * 100) : 0;
              const colors: Record<string, string> = { Basic:'bg-gray-500', Standard:'bg-blue-500', Premium:'bg-purple-500', Ultra:'bg-yellow-500' };
              return (
                <div key={plan}>
                  <div className='flex justify-between text-sm mb-1'>
                    <span className='text-gray-300'>{plan}</span>
                    <span className='text-gray-400'>{count} ({pct}%)</span>
                  </div>
                  <div className='h-2 bg-gray-700 rounded-full overflow-hidden'>
                    <div className={'h-full rounded-full ' + colors[plan]} style={{ width: pct + '%' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className='bg-gray-800 rounded-2xl p-5 border border-gray-700'>
          <div className='flex items-center gap-2 mb-4'>
            <Users size={18} className='text-blue-400' />
            <h2 className='text-white font-semibold'>Clientes recentes</h2>
          </div>
          {recentClients.length === 0 ? (
            <p className='text-gray-500 text-sm text-center py-8'>Nenhum cliente cadastrado.</p>
          ) : (
            <div className='space-y-3'>
              {recentClients.map((c) => (
                <div key={c.id} className='flex items-center justify-between'>
                  <div>
                    <p className='text-white text-sm font-medium'>{c.name}</p>
                    <p className='text-gray-400 text-xs'>{c.phone}</p>
                  </div>
                  <span className={'text-xs px-2 py-1 rounded-full font-medium ' + (c.plan === 'Ultra' ? 'bg-yellow-500/20 text-yellow-300' : c.plan === 'Premium' ? 'bg-purple-500/20 text-purple-300' : c.plan === 'Standard' ? 'bg-blue-500/20 text-blue-300' : 'bg-gray-600/40 text-gray-300')}>{c.plan}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
