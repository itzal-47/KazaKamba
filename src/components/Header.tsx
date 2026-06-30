import { Link, useNavigate } from 'react-router-dom';
import { Home, Plus, Heart, User, Search, Menu, X, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getCurrentUser, signOut, getProfile } from '../lib/api';
import type { Profile } from '../types';

export function Header() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  useEffect(() => {
    getCurrentUser().then((u) => {
      setUser(u);
      if (u) {
        getProfile(u.id).then(setProfile);
      }
    });

    const { data: { subscription } } = (window as any).supabase?.auth?.onAuthStateChange?.((event: string, session: any) => {
      setUser(session?.user || null);
      if (session?.user) {
        getProfile(session.user.id).then(setProfile);
      } else {
        setProfile(null);
      }
    }) || { data: { subscription: { unsubscribe: () => {} } } };

    return () => subscription.unsubscribe();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/feed?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    setUser(null);
    setProfile(null);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 md:hidden backdrop-blur-xl bg-background/90 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-background-card flex items-center justify-center shadow-lg shadow-primary/20">
              <Home className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-white tracking-tight">
              Kaza<span className="text-primary">Kamba</span>
            </span>
          </Link>

          <nav className="flex items-center gap-2">
            <Link
              to="/feed"
              className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all"
              title="Feed"
            >
              <Search className="w-5 h-5" />
            </Link>
            <Link
              to="/favorites"
              className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all"
              title="Favoritos"
            >
              <Heart className="w-5 h-5" />
            </Link>
            {user ? (
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="w-9 h-9 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold text-sm"
              >
                {profile?.nome?.charAt(0)?.toUpperCase() || 'U'}
              </button>
            ) : (
              <Link
                to="/auth"
                className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:shadow-lg hover:shadow-primary/30 transition-all"
              >
                Entrar
              </Link>
            )}
          </nav>
        </div>

        {showMobileMenu && user && (
          <div className="absolute top-full right-4 mt-2 w-48 py-2 rounded-xl bg-background-card border border-white/10 shadow-xl">
            <Link
              to="/profile"
              onClick={() => setShowMobileMenu(false)}
              className="flex items-center gap-3 px-4 py-2 text-white/70 hover:text-white hover:bg-white/5"
            >
              <User className="w-4 h-4" />
              Meu Perfil
            </Link>
            <Link
              to="/create"
              onClick={() => setShowMobileMenu(false)}
              className="flex items-center gap-3 px-4 py-2 text-white/70 hover:text-white hover:bg-white/5"
            >
              <Plus className="w-4 h-4" />
              Publicar
            </Link>
            <hr className="border-white/10 my-2" />
            <button
              onClick={() => {
                handleSignOut();
                setShowMobileMenu(false);
              }}
              className="flex items-center gap-3 px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 w-full"
            >
              <LogOut className="w-4 h-4" />
              Sair
            </button>
          </div>
        )}
      </div>

      <form onSubmit={handleSearch} className="px-4 pb-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
          <input
            type="text"
            placeholder="Pesquisar anúncios..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all"
          />
        </div>
      </form>
    </header>
  );
}
