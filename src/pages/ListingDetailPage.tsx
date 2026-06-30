import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Phone, MessageCircle, Share2, Heart, MapPin, Clock, Eye, ChevronLeft, Trash2, User } from 'lucide-react';
import { PhotoCarousel } from '../components/PhotoCarousel';
import { Lightbox } from '../components/Lightbox';
import { ListingCard } from '../components/ListingCard';
import type { Listing } from '../types';
import { getListingById, isFavorite, addFavorite, removeFavorite, deleteListing, getListings, getCurrentUser, getProfile } from '../lib/api';

function formatPrice(price: number | null, negotiable: boolean): string {
  if (price === null) return 'Negociável';
  const formatted = new Intl.NumberFormat('pt-AO', {
    style: 'currency',
    currency: 'AOA',
    minimumFractionDigits: 0,
  }).format(price);
  return negotiable ? `${formatted} (Negociável)` : formatted;
}

function formatDate(date: string): string {
  return new Intl.DateTimeFormat('pt-AO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date));
}

export function ListingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState<Listing | null>(null);
  const [relatedListings, setRelatedListings] = useState<Listing[]>([]);
  const [isFav, setIsFav] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showShareToast, setShowShareToast] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const isOwner = listing?.usuario_id === currentUser?.id;
  const isMercado = listing?.tipo === 'mercado';

  useEffect(() => {
    getCurrentUser().then((u) => setCurrentUser(u));
  }, []);

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    Promise.all([
      getListingById(id),
      currentUser?.id ? isFavorite(id) : Promise.resolve(false),
    ])
      .then(([data, fav]) => {
        setListing(data);
        setIsFav(fav);
        if (data?.provincia) {
          getListings({ provincia: data.provincia, limit: 4 }).then((related) => {
            setRelatedListings(related.filter((l) => l.id !== id).slice(0, 3));
          });
        }
      })
      .finally(() => setLoading(false));
  }, [id, currentUser]);

  const handleFavorite = async () => {
    if (!listing || !currentUser) {
      navigate('/auth');
      return;
    }
    if (isFav) {
      await removeFavorite(listing.id);
      setIsFav(false);
    } else {
      await addFavorite(listing.id);
      setIsFav(true);
    }
  };

  const handleCall = () => {
    if (listing?.telefone) {
      window.location.href = `tel:${listing.telefone}`;
    }
  };

  const handleWhatsApp = () => {
    if (listing?.whatsapp || listing?.telefone) {
      const number = listing.whatsapp || listing.telefone;
      const message = encodeURIComponent(`Olá! Vi o seu anúncio "${listing.titulo}" no KazaKamba e tenho interesse. Ainda está disponível?`);
      window.open(`https://wa.me/${number.replace(/\D/g, '')}?text=${message}`, '_blank');
    }
  };

  const handleShare = async () => {
    if (!listing) return;
    const shareData = {
      title: listing.titulo,
      text: `Veja este anúncio no KazaKamba: ${listing.titulo}`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setShowShareToast(true);
    setTimeout(() => setShowShareToast(false), 2000);
  };

  const handleDelete = async () => {
    if (!listing || !confirm('Tem certeza que deseja eliminar este anúncio?')) return;
    await deleteListing(listing.id);
    navigate('/feed');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="max-w-5xl mx-auto px-4">
          <div className="animate-pulse">
            <div className="aspect-[16/10] rounded-2xl bg-white/5 mb-6"></div>
            <div className="h-8 bg-white/5 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-white/5 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Anúncio não encontrado</h1>
          <Link to="/feed" className="text-primary hover:underline">
            Voltar ao feed
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-5xl mx-auto px-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-white/70 hover:text-white mb-6 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          Voltar
        </button>

        <div className="grid lg:grid-cols-[1fr,380px] gap-8">
          <div>
            <div
              className="cursor-zoom-in"
              onClick={() => { setLightboxIndex(0); setLightboxOpen(true); }}
              title="Clique para ver em tela cheia"
            >
              <PhotoCarousel photos={listing.fotos_urls} alt={listing.titulo} />
            </div>

            <Lightbox
              images={listing.fotos_urls}
              initialIndex={lightboxIndex}
              isOpen={lightboxOpen}
              onClose={() => setLightboxOpen(false)}
            />

            <div className="mt-6">
              <div className="flex items-center gap-2 mb-4">
                {listing.tipo && (
                  <span className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                    isMercado
                      ? 'bg-mercado/20 text-mercado'
                      : 'bg-primary/20 text-primary'
                  }`}>
                    {listing.tipo === 'servico' ? 'Serviço' : listing.tipo === 'casa' ? 'Casa' : 'Mercado'}
                  </span>
                )}
                {listing.condicao && isMercado && (
                  <span className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                    listing.condicao === 'novo'
                      ? 'bg-mercado text-white'
                      : 'bg-white/80 text-background'
                  }`}>
                    {listing.condicao === 'novo' ? 'Novo' : 'Usado'}
                  </span>
                )}
              </div>

              <h1 className="text-2xl md:text-3xl font-bold text-white mb-4">{listing.titulo}</h1>

              <div className="flex flex-wrap items-center gap-4 text-white/60 text-sm mb-6">
                {listing.bairro && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" />
                    {listing.bairro}, {listing.municipio}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  {formatDate(listing.criado_em)}
                </span>
                <span className="flex items-center gap-1.5">
                  <Eye className="w-4 h-4" />
                  {listing.visualizacoes || 0} visualizações
                </span>
              </div>

              <div className={`p-6 rounded-2xl mb-6 ${
                isMercado
                  ? 'bg-mercado/10 border border-mercado/20'
                  : 'bg-white/5 border border-white/10'
              }`}>
                <h3 className="text-white/60 text-sm mb-2">Preço</h3>
                <p className={`text-3xl font-bold ${isMercado ? 'text-mercado' : 'text-primary'}`}>
                  {formatPrice(listing.preco, listing.negociavel)}
                </p>
              </div>

              <div className="prose prose-invert max-w-none">
                <h3 className="text-lg font-semibold text-white mb-3">Descrição</h3>
                <p className="text-white/80 whitespace-pre-wrap leading-relaxed">{listing.descricao}</p>
              </div>

              {listing.profile && (
                <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10 flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    isMercado ? 'bg-mercado/20' : 'bg-primary/20'
                  }`}>
                    <span className={`font-bold ${isMercado ? 'text-mercado' : 'text-primary'}`}>
                      {listing.profile.nome?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div>
                    <p className="text-white font-medium">{listing.profile.nome}</p>
                    <p className="text-white/60 text-sm">{listing.profile.bairro}, {listing.profile.municipio}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="lg:sticky lg:top-24 h-fit">
            <div className="p-6 rounded-2xl bg-gradient-to-b from-background-card to-background border border-white/10">
              <div className="flex gap-3 mb-6">
                <button
                  onClick={handleFavorite}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border transition-all ${
                    isFav
                      ? 'bg-red-500/20 border-red-500/30 text-red-400'
                      : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isFav ? 'fill-red-400' : ''}`} />
                  <span>{isFav ? 'Favorito' : 'Favoritar'}</span>
                </button>
                <button
                  onClick={handleShare}
                  className="p-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all"
                >
                  <Share2 className="w-5 h-5" />
                </button>
                {isOwner && (
                  <button
                    onClick={handleDelete}
                    className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>

              {(listing.telefone || listing.whatsapp) && (
                <div className="space-y-3">
                  {listing.telefone && (
                    <button
                      onClick={handleCall}
                      className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl text-white font-semibold hover:shadow-lg transition-all ${
                        isMercado
                          ? 'bg-mercado hover:shadow-mercado/30'
                          : 'bg-primary hover:shadow-primary/30'
                      }`}
                    >
                      <Phone className="w-5 h-5" />
                      Ligar
                    </button>
                  )}

                  {(listing.whatsapp || listing.telefone) && (
                    <button
                      onClick={handleWhatsApp}
                      className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-[#25D366] text-white font-semibold hover:shadow-lg hover:shadow-[#25D366]/30 transition-all"
                    >
                      <MessageCircle className="w-5 h-5" />
                      WhatsApp
                    </button>
                  )}
                </div>
              )}

              {!listing.telefone && !listing.whatsapp && (
                <p className="text-center text-white/50 py-4">
                  Contacto não disponível
                </p>
              )}
            </div>
          </div>
        </div>

        {relatedListings.length > 0 && (
          <div className="mt-16">
            <h2 className="text-xl font-bold text-white mb-6">Anúncios Similares</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedListings.map((related) => (
                <ListingCard key={related.id} listing={related} />
              ))}
            </div>
          </div>
        )}
      </div>

      {showShareToast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 rounded-xl bg-primary text-white font-medium shadow-xl animate-fade-in z-50">
          Link copiado!
        </div>
      )}
    </div>
  );
}