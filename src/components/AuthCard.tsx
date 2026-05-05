import { FormEvent, useMemo, useState } from 'react';
import { Loader2, LockKeyhole, Monitor, TriangleAlert } from 'lucide-react';
import { isConfigured, signInWithPassword } from '../lib/firebase';

interface Props {
  onSuccess?: () => void;
}

function getFriendlyError(message?: string) {
  if (!message) return 'Nao foi possivel entrar. Tente novamente.';

  const normalized = message.toLowerCase();
  if (normalized.includes('auth/invalid-credential') || normalized.includes('auth/wrong-password') || normalized.includes('auth/user-not-found')) {
    return 'Email ou senha invalidos.';
  }
  if (normalized.includes('auth/too-many-requests')) {
    return 'Muitas tentativas. Aguarde um pouco e tente novamente.';
  }
  if (normalized.includes('auth/network-request-failed')) {
    return 'Falha de conexao. Verifique sua internet e tente novamente.';
  }
  return message;
}

export default function AuthCard({ onSuccess }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const disabled = useMemo(() => !email.trim() || !password.trim() || loading, [email, password, loading]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isConfigured) {
      setError('Configure o Firebase no arquivo .env para usar o login.');
      return;
    }

    setLoading(true);
    setError('');

    const { error } = await signInWithPassword(email.trim(), password);
    if (error) {
      setError(getFriendlyError(error.message));
      setLoading(false);
      return;
    }

    setLoading(false);
    onSuccess?.();
  }

  return (
    <div className='w-full max-w-md rounded-2xl border border-gray-800 bg-gray-900/95 shadow-2xl shadow-black/40 p-6 sm:p-8'>
      <div className='flex items-center gap-3 mb-6'>
        <div className='w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center'>
          <Monitor size={22} className='text-white' />
        </div>
        <div>
          <h1 className='text-2xl font-bold text-white'>IPTV Manager</h1>
          <p className='text-sm text-gray-400'>Entre para acessar seu painel</p>
        </div>
      </div>

      {!isConfigured && (
        <div className='mb-5 rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-200 flex gap-3'>
          <TriangleAlert size={18} className='mt-0.5 flex-shrink-0' />
          <div>
            <p className='font-semibold mb-1'>Firebase nao configurado</p>
            <p>Preencha as variaveis <code className='text-yellow-100'>VITE_FIREBASE_*</code> no arquivo .env.</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className='space-y-4'>
        <div>
          <label className='block text-sm font-medium text-gray-300 mb-2'>Email</label>
          <input
            type='email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder='seuemail@exemplo.com'
            className='w-full rounded-xl border border-gray-700 bg-gray-950 px-4 py-3 text-white outline-none focus:border-blue-500'
            autoComplete='email'
          />
        </div>

        <div>
          <label className='block text-sm font-medium text-gray-300 mb-2'>Senha</label>
          <div className='relative'>
            <LockKeyhole size={18} className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-500' />
            <input
              type='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder='Digite sua senha'
              className='w-full rounded-xl border border-gray-700 bg-gray-950 pl-11 pr-4 py-3 text-white outline-none focus:border-blue-500'
              autoComplete='current-password'
            />
          </div>
        </div>

        {error && (
          <div className='rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200'>
            {error}
          </div>
        )}

        <button
          type='submit'
          disabled={disabled}
          className='w-full rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-400 text-white font-semibold py-3 transition-colors flex items-center justify-center gap-2'
        >
          {loading && <Loader2 size={18} className='animate-spin' />}
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>

      <p className='mt-5 text-xs text-gray-500'>Use o email e a senha cadastrados no Firebase Authentication.</p>
    </div>
  );
}
