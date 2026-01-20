import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [username, setUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      navigate('/login');
      return;
    }

    setUser(user);

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (data) {
      setUsername(data.username || '');
      setAvatarUrl(data.avatar_url || null);
    }

    setLoading(false);
  };

  const saveProfile = async () => {
    if (!user) return;

    setSaving(true);

    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      username,
      avatar_url: avatarUrl,
    });

    setSaving(false);

    if (error) alert(error.message);
    else alert('Profile saved!');
  };

  const uploadAvatar = async (file: File) => {
    if (!user) return;

    const filePath = `${user.id}/avatar.png`;

    await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });

    const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);

    setAvatarUrl(data.publicUrl);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[url('https://images.unsplash.com/photo-1524985069026-dd778a71c7b4')] bg-cover bg-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/80"></div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-lg bg-black/70 backdrop-blur-xl p-10 rounded-2xl shadow-2xl border border-white/10">
        <h1 className="text-3xl font-bold mb-8 text-center">Edit Profile</h1>

        {/* Avatar */}
        <div className="flex flex-col items-center mb-8 group">
          <div className="relative">
            <img
              src={
                avatarUrl ||
                'https://ui-avatars.com/api/?name=User&background=111827&color=fff&size=256'
              }
              className="w-32 h-32 rounded-full object-cover border-4 border-white/20"
            />

            <label className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 rounded-full cursor-pointer transition">
              <span className="text-sm">Change</span>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files) uploadAvatar(e.target.files[0]);
                }}
              />
            </label>
          </div>

          <p className="text-sm text-white/50 mt-3">{user.email}</p>
        </div>

        {/* Username */}
        <div className="mb-6">
          <label className="text-sm text-white/70 mb-1 block">Username</label>
          <input
            value={username}
            placeholder="Your name"
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-3 rounded-md bg-zinc-800 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-red-600"
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-4">
          <button
            onClick={saveProfile}
            disabled={saving}
            className="flex-1 py-3 rounded-md bg-red-600 hover:bg-red-700 transition font-semibold disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>

          <button
            onClick={logout}
            className="px-6 py-3 rounded-md border border-white/20 hover:bg-white/10 transition"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
