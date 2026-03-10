import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../shared/auth/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const redirectTo = location.state?.from || '/';

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const user = await login({ email, password });
      navigate(user.role === 'admin' ? '/admin' : redirectTo, { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="mx-auto max-w-md px-6 py-16 text-zinc-100">
      <h1 className="text-4xl font-black">Sign In</h1>
      <p className="mt-3 text-zinc-400">Access your trade account and orders.</p>

      <form className="mt-8 space-y-4 rounded-3xl border border-white/10 bg-zinc-950 p-6" onSubmit={handleSubmit}>
        <label className="block text-sm text-zinc-300">Email
          <input type="email" required className="mt-2 w-full rounded-xl bg-black/60 px-3 py-2" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label className="block text-sm text-zinc-300">Password
          <input type="password" required className="mt-2 w-full rounded-xl bg-black/60 px-3 py-2" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>

        {error ? <p className="text-sm text-red-400">{error}</p> : null}

        <button className="w-full rounded-xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white hover:bg-orange-400 disabled:opacity-60" disabled={isLoading}>
          {isLoading ? 'Signing in...' : 'Sign In'}
        </button>

        <p className="text-xs text-zinc-500">Admin demo: `admin@signscous.com` / `admin123`</p>
      </form>

      <p className="mt-4 text-sm text-zinc-400">
        Need an account? <Link to="/signup" className="text-orange-400">Create one</Link>
      </p>
    </section>
  );
}
