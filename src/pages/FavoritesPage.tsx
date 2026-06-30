import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ArrowRight, User } from 'lucide-react';
import { ListingCard } from '../components/ListingCard';
import type { Listing } from '../types';
import { getFavorites, getCurrentUser } from '../lib/api';

export function FavoritesPage() {
  const [favorites, setFavorites] = useState<{ listing: Listing }[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    getCurrentUser().then((u) => {
      setUser(u);
      if (u) {
        getFavorites()
          .then(setFavorites)
          .finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });
  }, []);

  const refreshFavorites = () => {
    if (user) {
      getFavorites().then(setFavorites);
    }
  };

  if (!user && !loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center max-w-md p-8 rounded-2xl bg-white/5 border border-white/10">
          <div className="w-20 h-20 rounded-full bg-mercado/20 flex items-center justify-center mx-auto mb-6">
            <User className="w-10 h-10 text-mercado" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Inicie sessao</h2>
          <p className="text-white/60 mb-6">Entre para ver seus favoritos salvos</p>
          <Link
            to="/auth"
            className="inline-block px-8 py-3 rounded-xl bg-mercado text-white font-medium hover:shadow-lg hover:shadow-mercado/30 transition-all"
          >
            Entrar ou Registar
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Meus Favoritos</h1>
          <p className="text-white/60">
            {favorites.length} {favorites.length === 1 ? 'anúncio salvo' : 'anúncios salvos'}
          </p>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[4/3] rounded-2xl bg-white/5 mb-4"></div>
                <div className="h-6 bg-white/5 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-white/5 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : favorites.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((fav) => (
              fav.listing && (
                <div key={fav.listing.id} onClick={refreshFavorites}>
                  <ListingCard listing={fav.listing} />
                </div>
              )
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white/5 rounded-2xl border border-white/10">
            <Heart className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Nenhum favorito ainda</h3>
            <p className="text-white/60 mb-6 max-w-md mx-auto">
              Explore anúncios e clique no coração para salvar seus favoritos aqui
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/feed"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-medium hover:shadow-lg hover:shadow-primary/30 transition-all"
              >
                Explorar Feed
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/mercado"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-mercado text-white font-medium hover:shadow-lg hover:shadow-mercado/30 transition-all"
              >
                Ver Mercado
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
