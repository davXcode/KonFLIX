import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/login',
    });

    setLoading(false);

    if (error) alert(error.message);
    else alert('Check your email for reset link!');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[url('https://images.unsplash.com/photo-1524985069026-dd778a71c7b4')] bg-cover bg-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/70"></div>

      {/* Card */}
      <form
        onSubmit={handleReset}
        className="relative z-10 w-full max-w-md bg-black/70 backdrop-blur-xl p-10 rounded-2xl shadow-2xl border border-white/10"
      >
        <h1 className="text-3xl font-bold mb-4">Reset Password</h1>

        <p className="text-white/70 mb-6 text-sm">
          Enter your email and we’ll send you a reset link.
        </p>

        {/* Email */}
        <div className="mb-6">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full px-4 py-3 rounded-md bg-zinc-800 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-red-600"
          />
        </div>

        {/* Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-md bg-red-600 hover:bg-red-700 transition font-semibold"
        >
          {loading ? 'Sending...' : 'Send Reset Link'}
        </button>

        {/* Links */}
        <div className="mt-6 text-sm text-white/70 text-center">
          <Link to="/login" className="hover:text-white">
            Back to Sign In
          </Link>
        </div>
      </form>
    </div>
  );
}
