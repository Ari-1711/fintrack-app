import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Mail, Lock, Loader2, Wallet } from 'lucide-react';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        setMessage('Registration successful! Please check your email for verification.');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-4 font-sans text-zinc-50">
      <div className="w-full max-w-md rounded-2xl bg-zinc-900 p-8 shadow-2xl border border-zinc-800 relative overflow-hidden">
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-32 h-32 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none"></div>

        <div className="mb-8 text-center relative z-10">
          <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500 text-zinc-950 shadow-lg shadow-emerald-500/20">
            <Wallet size={24} />
          </div>
          <h2 className="mb-2 text-3xl font-bold tracking-tight">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-zinc-400">
            {isLogin
              ? 'Sign in to continue to FinTrack'
              : 'Start managing your finances better'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
          {error && (
            <div className="rounded-lg bg-rose-500/10 p-4 text-sm text-rose-400 border border-rose-500/20">
              {error}
            </div>
          )}
          
          {message && (
            <div className="rounded-lg bg-emerald-500/10 p-4 text-sm text-emerald-400 border border-emerald-500/20">
              {message}
            </div>
          )}

          <div className="space-y-4">
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-zinc-500">
                <Mail size={18} />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Address"
                className="w-full rounded-xl bg-zinc-950 border border-zinc-800 py-3.5 pl-11 pr-4 text-zinc-50 placeholder:text-zinc-500 focus:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-700 transition-all"
              />
            </div>

            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-zinc-500">
                <Lock size={18} />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full rounded-xl bg-zinc-950 border border-zinc-800 py-3.5 pl-11 pr-4 text-zinc-50 placeholder:text-zinc-500 focus:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-700 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center rounded-xl bg-emerald-500 py-3.5 font-bold text-zinc-950 shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 focus:outline-none disabled:opacity-70 transition-all"
          >
            {loading ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : isLogin ? (
              'Sign In'
            ) : (
              'Sign Up'
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-zinc-400 relative z-10">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="font-medium text-emerald-400 hover:text-emerald-300 focus:outline-none transition-colors"
          >
            {isLogin ? 'Sign up' : 'Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
}
