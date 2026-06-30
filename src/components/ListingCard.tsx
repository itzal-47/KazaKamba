import { Link } from 'react-router-dom';
import { Heart, MapPin, Clock, DollarSign, Eye } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { Listing } from '../types';
import { isFavorite, addFavorite, removeFavorite, getCurrentUser } from '../lib/api';

interface Props {
  listing: Listing;
}

function formatPrice(price: number | null, negociavel: boolean): string {
  if (price === null) return 'Negociável';
  const formatted = new Intl.NumberFormat('pt-AO', {
    style: 'currency',
    currency: 'AOA',
    minimumFractionDigits: 0,
  }).format(price);
  return negociavel ? `${formatted} (Negociável)` : formatted;
}

function timeAgo(date: string): string {
  const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return 'Agora';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d`;
  const months = Math.floor(days / 30);
  return `${months}m`;
}

export function ListingCard({ listing }: Props) {
  const [isFav, setIsFav] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    getCurrentUser().then((user) => {
      setIsLoggedIn(!!user);
      if (user) {
        isFavorite(listing.id).then(setIsFav);
      }
    });
  }, [listing.id]);

  const handleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoggedIn) return;

    setIsLoading(true);
    try {
      if (isFav) {
        await removeFavorite(listing.id);
        setIsFav(false);
      } else {
        await addFavorite(listing.id);
        setIsFav(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const mainPhoto = listing.fotos_urls?.[0] || 'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=600';

  const isMercado = listing.tipo === 'mercado';

  return (
    <Link
      to={`/listing/${listing.id}`}
      className={`group block bg-gradient-to-b from-background-card to-background border rounded-2xl overflow-hidden hover:shadow-xl transition-all ${
        isMercado ? 'border-mercado/30 hover:border-mercado/50 hover:shadow-mercado/10' : 'border-white/10 hover:border-primary/30 hover:shadow-primary/10'
      }`}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-background-card">
        <img
          src={mainPhoto}
          alt={listing.titulo}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <button
          onClick={handleFavorite}
          disabled={isLoading || !isLoggedIn}
          className="absolute top-3 right-3 p-2.5 rounded-full bg-black/40 backdrop-blur-sm border border-white/20 text-white hover:bg-red-500 hover:border-red-500 transition-all disabled:opacity-50"
        >
          <Heart className={`w-4 h-4 ${isFav ? 'fill-red-500 text-red-500' : ''}`} />
        </button>

        {listing.condicao && isMercado && (
          <span className={`absolute bottom-3 left-3 px-3 py-1.5 rounded-full text-xs font-medium ${
            listing.condicao === 'novo' ? 'bg-mercado text-white' : 'bg-white/80 text-background'
          }`}>
            {listing.condicao === 'novo' ? 'Novo' : 'Usado'}
          </span>
        )}

        {listing.categoria && !isMercado && (
          <span className="absolute bottom-3 left-3 px-3 py-1.5 rounded-lg bg-primary/90 backdrop-blur-sm text-white text-xs font-medium">
            {listing.categoria}
          </span>
        )}

        {(isMercado || listing.tipo === 'mercado') && (
          <span className="absolute top-3 left-3 px-2 py-1 rounded-lg bg-mercado/90 text-white text-xs font-medium">
            Mercado
          </span>
        )}

        {listing.curtidas_count > 0 && (
          <span className="absolute bottom-3 right-3 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-sm text-white text-xs flex items-center gap-1">
            <Heart className="w-3 h-3" />
            {listing.curtidas_count}
          </span>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-white font-semibold text-lg line-clamp-2 mb-2 group-hover:text-primary transition-colors">
          {listing.titulo}
        </h3>

        <p className="text-white/60 text-sm line-clamp-2 mb-3">
          {listing.descricao}
        </p>

        <div className="flex items-center justify-between text-sm">
          <span className={`${isMercado ? 'text-mercado' : 'text-primary'} font-semibold flex items-center gap-1`}>
            <DollarSign className="w-4 h-4" />
            {formatPrice(listing.preco, listing.negociavel)}
          </span>

          <div className="flex items-center gap-3 text-white/50">
            {(listing.bairro || listing.municipio) && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {listing.bairro || listing.municipio}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {timeAgo(listing.criado_em)}
            </span>
          </div>
        </div>

        {listing.profile && (
          <div className="mt-3 pt-3 border-t border-white/10 flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isMercado ? 'bg-mercado/20' : 'bg-primary/20'}`}>
              <span className={`${isMercado ? 'text-mercado' : 'text-primary'} text-xs font-bold`}>
                {listing.profile.nome?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            <span className="text-white/70 text-sm">{listing.profile.nome || 'Utilizador'}</span>
            {listing.visualizacoes > 0 && (
              <span className="ml-auto text-white/40 text-xs flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {listing.visualizacoes}
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
