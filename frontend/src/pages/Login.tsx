import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) alert(error.message);
    else navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[url('https://images.unsplash.com/photo-1524985069026-dd778a71c7b4')] bg-cover bg-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/70"></div>

      {/* Card */}
      <form
        onSubmit={handleLogin}
        className="relative z-10 w-full max-w-md bg-black/70 backdrop-blur-xl p-10 rounded-2xl shadow-2xl border border-white/10"
      >
        <h1 className="text-3xl font-bold mb-8">Sign In</h1>

        {/* Email */}
        <div className="mb-4">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full px-4 py-3 rounded-md bg-zinc-800 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-red-600"
          />
        </div>

        {/* Password */}
        <div className="mb-6">
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full px-4 py-3 rounded-md bg-zinc-800 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-red-600"
          />
        </div>

        {/* Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-md bg-red-600 hover:bg-red-700 transition font-semibold"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>

        {/* Links */}
        <div className="mt-6 flex justify-between text-sm text-white/70">
          <Link to="/register" className="hover:text-white">
            Sign up
          </Link>
          <Link to="/forgot-password" className="hover:text-white">
            Forgot password?
          </Link>
        </div>
      </form>
    </div>
  );
}
