import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../shared/auth/AuthContext';

export default function SignupPage() {
  const navigate = useNavigate();
  const { signup } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('US');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await signup({
        name,
        email,
        password,
        phone,
        addressLine1,
        addressLine2,
        city,
        state,
        postalCode,
        country,
      });
      navigate('/yard-signs', { replace: true });
    } catch (err) {
      setError(err.message || 'Signup failed.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="mx-auto max-w-md px-6 py-16 text-zinc-100">
      <h1 className="text-4xl font-black">Create Account</h1>
      <p className="mt-3 text-zinc-400">Register your Signscous trade customer account.</p>

      <form className="mt-8 space-y-4 rounded-3xl border border-white/10 bg-zinc-950 p-6" onSubmit={handleSubmit}>
        <label className="block text-sm text-zinc-300">Full Name
          <input type="text" required className="mt-2 w-full rounded-xl bg-black/60 px-3 py-2" value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label className="block text-sm text-zinc-300">Email
          <input type="email" required className="mt-2 w-full rounded-xl bg-black/60 px-3 py-2" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label className="block text-sm text-zinc-300">Password
          <input type="password" required minLength={6} className="mt-2 w-full rounded-xl bg-black/60 px-3 py-2" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        <label className="block text-sm text-zinc-300">Phone Number
          <input type="tel" required className="mt-2 w-full rounded-xl bg-black/60 px-3 py-2" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </label>
        <label className="block text-sm text-zinc-300">Address Line 1
          <input type="text" required className="mt-2 w-full rounded-xl bg-black/60 px-3 py-2" value={addressLine1} onChange={(e) => setAddressLine1(e.target.value)} />
        </label>
        <label className="block text-sm text-zinc-300">Address Line 2
          <input type="text" className="mt-2 w-full rounded-xl bg-black/60 px-3 py-2" value={addressLine2} onChange={(e) => setAddressLine2(e.target.value)} />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm text-zinc-300">City
            <input type="text" required className="mt-2 w-full rounded-xl bg-black/60 px-3 py-2" value={city} onChange={(e) => setCity(e.target.value)} />
          </label>
          <label className="block text-sm text-zinc-300">State
            <input type="text" required className="mt-2 w-full rounded-xl bg-black/60 px-3 py-2" value={state} onChange={(e) => setState(e.target.value)} />
          </label>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm text-zinc-300">Postal Code
            <input type="text" required className="mt-2 w-full rounded-xl bg-black/60 px-3 py-2" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} />
          </label>
          <label className="block text-sm text-zinc-300">Country
            <input type="text" required className="mt-2 w-full rounded-xl bg-black/60 px-3 py-2" value={country} onChange={(e) => setCountry(e.target.value)} />
          </label>
        </div>

        {error ? <p className="text-sm text-red-400">{error}</p> : null}

        <button className="w-full rounded-xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white hover:bg-orange-400 disabled:opacity-60" disabled={isLoading}>
          {isLoading ? 'Creating account...' : 'Create Account'}
        </button>
      </form>

      <p className="mt-4 text-sm text-zinc-400">
        Already have an account? <Link to="/login" className="text-orange-400">Sign in</Link>
      </p>
    </section>
  );
}
