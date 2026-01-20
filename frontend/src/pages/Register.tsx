import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    setLoading(false);

    if (error) alert(error.message);
    else {
      alert('Register success! Check your email.');
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[url('https://images.unsplash.com/photo-1524985069026-dd778a71c7b4')] bg-cover bg-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/70"></div>

      {/* Card */}
      <form
        onSubmit={handleRegister}
        className="relative z-10 w-full max-w-md bg-black/70 backdrop-blur-xl p-10 rounded-2xl shadow-2xl border border-white/10"
      >
        <h1 className="text-3xl font-bold mb-8">Sign Up</h1>

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
          {loading ? 'Creating account...' : 'Sign Up'}
        </button>

        {/* Links */}
        <div className="mt-6 text-sm text-white/70 text-center">
          Already have an account?{' '}
          <Link to="/login" className="hover:text-white">
            Sign In
          </Link>
        </div>
      </form>
    </div>
  );
}
