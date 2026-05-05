import AuthCard from '../components/AuthCard';

export default function Login() {
  return (
    <div className='min-h-screen bg-gray-950 text-white relative overflow-hidden'>
      <div className='absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.18),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(168,85,247,0.16),_transparent_30%)]' />
      <div className='relative min-h-screen flex items-center justify-center px-4 py-10'>
        <AuthCard />
      </div>
    </div>
  );
}
