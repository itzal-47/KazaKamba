import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Search, Filter, ShoppingBag, Heart, MessageCircle, Clock, MapPin, ChevronDown, X, ChevronLeft, ChevronRight, Send, ThumbsUp, Share2, Tag, Package, CheckCircle, Star, Eye, RefreshCw } from 'lucide-react';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { EmptyState } from '../components/EmptyState';
import { Lightbox } from '../components/Lightbox';
import type { Listing, MarketComment } from '../types';
import { getListings, getMarketComments, addMarketComment, getCurrentUser, getProfile, addFavorite, removeFavorite, isFavorite, getListingById } from '../lib/api';
import { getCategoryImage, generateWhatsAppShareLink, generateWhatsAppContactLink, formatPrice, timeAgo, optimizeImageUrl } from '../lib/utils';
import { useAppSettings } from '../lib/AppContext';

const PRICE_RANGES = [
  { value: 'all', label: 'Todos os preços' },
  { value: '0-50000', label: '0 - 50.000 Kz' },
  { value: '50000-100000', label: '50.000 - 100.000 Kz' },
  { value: '100000-500000', label: '100.000 - 500.000 Kz' },
  { value: '500000+', label: 'Acima de 500.000 Kz' },
];

export function MercadoPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCondition, setSelectedCondition] = useState<string>('all');
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const { dataSaver } = useAppSettings();

  useEffect(() => {
    getCurrentUser().then((user) => setIsLoggedIn(!!user));
    loadListings();
  }, []);

  const loadListings = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getListings({ tipo: 'mercado' });
      setListings(data);
    } catch (err) {
      setError('Não foi possível carregar os produtos. Verifique a conexão.');
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredListings = listings.filter((listing) => {
    const matchesSearch = listing.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.descricao.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCondition = selectedCondition === 'all' || listing.condicao === selectedCondition;
    let matchesPrice = true;
    if (selectedPriceRange !== 'all') {
      const [min, max] = selectedPriceRange.split('-').map(v => v === '+' ? Infinity : parseInt(v.replace('+', '')));
      matchesPrice = listing.preco !== null && listing.preco >= (min || 0) && listing.preco <= (max || Infinity);
    }
    return matchesSearch && matchesCondition && matchesPrice;
  });

  const handleListingClick = (listing: Listing) => {
    setSelectedListing(listing);
  };

  const handleCloseDetail = () => {
    setSelectedListing(null);
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-mercado/20 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-mercado" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">Mercado do Kamba</h1>
              <p className="text-white/60">Bazar profissional para comprar e vender em Angola</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Pesquisar produtos..."
              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-mercado/50 transition-all"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all ${
              showFilters
                ? 'bg-mercado/20 border-mercado/30 text-mercado'
                : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
            }`}
          >
            <Filter className="w-5 h-5" />
            <span className="hidden sm:inline">Filtros</span>
          </button>
          <Link
            to="/create"
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-mercado text-white font-medium hover:shadow-lg hover:shadow-mercado/30 transition-all"
          >
            <Tag className="w-5 h-5" />
            <span>Vender</span>
          </Link>
        </div>

        {showFilters && (
          <div className="mb-6 p-5 rounded-xl bg-white/5 border border-white/10">
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-white/70 text-sm mb-2">Condição</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedCondition('all')}
                    className={`px-3 py-2 rounded-lg text-sm transition-all ${
                      selectedCondition === 'all' ? 'bg-mercado text-white' : 'bg-white/5 text-white/70 hover:bg-white/10'
                    }`}
                  >
                    Todos
                  </button>
                  <button
                    onClick={() => setSelectedCondition('novo')}
                    className={`px-3 py-2 rounded-lg text-sm transition-all ${
                      selectedCondition === 'novo' ? 'bg-mercado text-white' : 'bg-white/5 text-white/70 hover:bg-white/10'
                    }`}
                  >
                    Novo
                  </button>
                  <button
                    onClick={() => setSelectedCondition('usado')}
                    className={`px-3 py-2 rounded-lg text-sm transition-all ${
                      selectedCondition === 'usado' ? 'bg-mercado text-white' : 'bg-white/5 text-white/70 hover:bg-white/10'
                    }`}
                  >
                    Usado
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-white/70 text-sm mb-2">Faixa de Preço</label>
                <div className="relative">
                  <select
                    value={selectedPriceRange}
                    onChange={(e) => setSelectedPriceRange(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-mercado appearance-none"
                  >
                    {PRICE_RANGES.map((range) => (
                      <option key={range.value} value={range.value} className="bg-background-card">{range.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
                </div>
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => { setSelectedCondition('all'); setSelectedPriceRange('all'); setSearchQuery(''); }}
                  className="px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white/70 text-sm hover:bg-white/10 transition-all"
                >
                  Limpar Filtros
                </button>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse bg-white/5 rounded-2xl aspect-square" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16 bg-white/5 rounded-2xl border border-white/10">
            <RefreshCw className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">{error}</h3>
            <button
              onClick={loadListings}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-mercado text-white font-medium hover:shadow-lg hover:shadow-mercado/30 transition-all"
            >
              <RefreshCw className="w-5 h-5" />
              Tentar Novamente
            </button>
          </div>
        ) : filteredListings.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredListings.map((listing) => (
              <MercadoListingCard
                key={listing.id}
                listing={listing}
                dataSaver={dataSaver}
                isLoggedIn={isLoggedIn}
                onClick={() => handleListingClick(listing)}
              />
            ))}
          </div>
        ) : (
          <EmptyState type="mercado" />
        )}
      </div>

      {selectedListing && (
        <MarketListingDetail
          listing={selectedListing}
          isLoggedIn={isLoggedIn}
          dataSaver={dataSaver}
          onClose={handleCloseDetail}
        />
      )}
    </div>
  );
}

function MercadoListingCard({ listing, dataSaver, isLoggedIn, onClick }: { listing: Listing; dataSaver: boolean; isLoggedIn: boolean; onClick: () => void }) {
  const [isFav, setIsFav] = useState(false);
  const [isLiking, setIsLiking] = useState(false);

  useEffect(() => {
    if (isLoggedIn) {
      isFavorite(listing.id).then(setIsFav);
    }
  }, [listing.id, isLoggedIn]);

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isLoggedIn) return;
    setIsLiking(true);
    try {
      if (isFav) {
        await removeFavorite(listing.id);
        setIsFav(false);
      } else {
        await addFavorite(listing.id);
        setIsFav(true);
      }
    } finally {
      setIsLiking(false);
    }
  };

  const image = listing.fotos_urls?.[0] || getCategoryImage('tecnologia');
  const optimizedImage = optimizeImageUrl(image, dataSaver);

  return (
    <button
      onClick={onClick}
      className="group bg-gradient-to-b from-background-card to-background border border-white/10 rounded-2xl overflow-hidden hover:border-mercado/40 transition-all text-left"
    >
      <div className="relative aspect-square overflow-hidden">
        <img
          src={optimizedImage}
          alt={listing.titulo}
          className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${dataSaver ? 'blur-[0.5px]' : ''}`}
        />

        {listing.condicao && (
          <span className={`absolute top-2 left-2 px-2 py-1 rounded-lg text-xs font-medium ${
            listing.condicao === 'novo' ? 'bg-mercado text-white' : 'bg-white/90 text-background'
          }`}>
            {listing.condicao === 'novo' ? 'Novo' : 'Usado'}
          </span>
        )}

        {listing.negociavel && (
          <span className="absolute top-2 right-2 px-2 py-1 rounded-lg bg-accent-gold/90 text-background text-xs font-medium flex items-center gap-1">
            <ThumbsUp className="w-3 h-3" />
            Negócio em Mão
          </span>
        )}

        <button
          onClick={handleLike}
          disabled={isLiking}
          className={`absolute bottom-2 right-2 p-2 rounded-full backdrop-blur-sm border transition-all ${
            isFav
              ? 'bg-red-500/80 border-red-500 text-white'
              : 'bg-black/40 border-white/20 text-white hover:bg-red-500 hover:border-red-500'
          }`}
        >
          <Heart className={`w-4 h-4 ${isFav ? 'fill-white' : ''}`} />
        </button>

        <div className="absolute bottom-2 left-2 flex items-center gap-2">
          {listing.curtidas_count > 0 && (
            <span className="px-2 py-1 rounded-lg bg-black/60 backdrop-blur-sm text-white text-xs flex items-center gap-1">
              <Heart className="w-3 h-3" />
              {listing.curtidas_count}
            </span>
          )}
          {listing.visualizacoes > 0 && (
            <span className="px-2 py-1 rounded-lg bg-black/60 backdrop-blur-sm text-white/70 text-xs flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {listing.visualizacoes}
            </span>
          )}
        </div>
      </div>

      <div className="p-3">
        <h3 className="text-white font-medium text-sm line-clamp-2 mb-1 group-hover:text-mercado transition-colors">
          {listing.titulo}
        </h3>
        <p className="text-mercado font-bold text-sm">{formatPrice(listing.preco, false)}</p>
        <div className="flex items-center gap-2 mt-2 text-white/50 text-xs">
          <MapPin className="w-3 h-3" />
          <span>{listing.bairro || listing.municipio}</span>
        </div>
      </div>
    </button>
  );
}

function MarketListingDetail({ listing, isLoggedIn, dataSaver, onClose }: { listing: Listing; isLoggedIn: boolean; dataSaver: boolean; onClose: () => void }) {
  const [comments, setComments] = useState<MarketComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [sending, setSending] = useState(false);
  const [isFav, setIsFav] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showLikeAnimation, setShowLikeAnimation] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    if (isLoggedIn) {
      isFavorite(listing.id).then(setIsFav);
      getMarketComments(listing.id).then((data) => setComments(data.length > 0 ? data : getMockComments()));
    } else {
      setComments(getMockComments());
    }
  }, [listing.id, isLoggedIn]);

  const handleLike = async () => {
    if (!isLoggedIn) return;
    setShowLikeAnimation(true);
    setTimeout(() => setShowLikeAnimation(false), 1000);
    if (isFav) {
      await removeFavorite(listing.id);
      setIsFav(false);
    } else {
      await addFavorite(listing.id);
      setIsFav(true);
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !isLoggedIn) return;
    setSending(true);
    try {
      const comment = await addMarketComment(listing.id, newComment);
      setComments([...comments, comment]);
      setNewComment('');
    } catch {
      // Add locally for demo
      const tempComment: MarketComment = {
        id: Date.now().toString(),
        listing_id: listing.id,
        usuario_id: 'temp',
        texto: newComment,
        criado_em: new Date().toISOString(),
        profile: { id: 'temp', nome: 'Você', email: '', telefone: '', provincia: '', municipio: '', bairro: '', verificado: false, criado_em: '' },
      };
      setComments([...comments, tempComment]);
      setNewComment('');
    } finally {
      setSending(false);
    }
  };

  const handleWhatsAppShare = () => {
    const url = window.location.origin + window.location.pathname + '#/listing/' + listing.id;
    const link = generateWhatsAppShareLink(listing.titulo, listing.preco, url);
    window.open(link, '_blank');
  };

  const handleContact = () => {
    const phone = listing.whatsapp || listing.telefone;
    if (phone) {
      const link = generateWhatsAppContactLink(phone, listing.titulo, listing.preco);
      window.open(link, '_blank');
    }
  };

  const photos = listing.fotos_urls?.length > 0 ? listing.fotos_urls : [getCategoryImage('tecnologia')];
  const optimizedPhotos = photos.map((p: string) => optimizeImageUrl(p, dataSaver));

  const goNext = () => setCurrentIndex((i) => (i + 1) % photos.length);
  const goPrev = () => setCurrentIndex((i) => (i - 1 + photos.length) % photos.length);

  return (
    <div className="fixed inset-0 bg-black/90 z-50 overflow-y-auto">
      <div className="min-h-screen flex items-start justify-center p-4 py-8">
        <div className="w-full max-w-4xl bg-background-card rounded-2xl border border-white/10 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/5 text-white/70 hover:text-white transition-all">
              <X className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 rounded-lg bg-mercado/20 text-mercado text-sm font-medium">Mercado</span>
              {listing.condicao && (
                <span className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                  listing.condicao === 'novo' ? 'bg-mercado text-white' : 'bg-white/80 text-background'
                }`}>
                  {listing.condicao === 'novo' ? 'Novo' : 'Usado'}
                </span>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-0">
            {/* Gallery */}
            <div className="relative bg-background">
                <div
                  className="aspect-square relative overflow-hidden cursor-zoom-in"
                  onClick={() => setLightboxOpen(true)}
                  title="Clique para ver em tela cheia"
                >
                <img src={optimizedPhotos[currentIndex]} alt={listing.titulo} className="w-full h-full object-cover" />

                {showLikeAnimation && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <Heart className="w-32 h-32 text-red-500 fill-red-500 animate-ping" />
                  </div>
                )}

                {photos.length > 1 && (
                  <>
                    <button onClick={goPrev} className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-all">
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button onClick={goNext} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-all">
                      <ChevronRight className="w-6 h-6" />
                    </button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                      {photos.map((_: any, i: number) => (
                        <button key={i} onClick={() => setCurrentIndex(i)} className={`w-2 h-2 rounded-full transition-all ${i === currentIndex ? 'bg-white w-6' : 'bg-white/40'}`} />
                      ))}
                    </div>
                  </>
                )}
                </div>{/* fecha a div cursor-zoom-in */}

              <Lightbox
                images={photos}
                initialIndex={currentIndex}
                isOpen={lightboxOpen}
                onClose={() => setLightboxOpen(false)}
              />

              <div className="flex items-center justify-center gap-4 py-3 border-t border-white/10">
                <button onClick={handleLike} className={`p-3 rounded-xl border transition-all ${isFav ? 'bg-red-500/20 border-red-500/30 text-red-400' : 'bg-white/5 border-white/10 text-white/70 hover:text-white'}`}>
                  <Heart className={`w-6 h-6 ${isFav ? 'fill-red-400' : ''}`} />
                </button>
                <button onClick={handleWhatsAppShare} className="p-3 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white transition-all">
                  <Share2 className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Details */}
            <div className="p-6 flex flex-col">
              <div className="flex-1">
                {listing.profile?.verificado && (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-mercado/10 border border-mercado/20 text-mercado text-xs font-medium mb-3">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Vendedor Verificado
                  </div>
                )}

                <h2 className="text-2xl font-bold text-white mb-3">{listing.titulo}</h2>

                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl font-bold text-mercado">{formatPrice(listing.preco, false)}</span>
                  {listing.negociavel && (
                    <span className="px-2.5 py-1 rounded-lg bg-accent-gold/20 text-accent-gold text-sm font-medium">
                      Negociável
                    </span>
                  )}
                </div>

                <p className="text-white/70 mb-4">{listing.descricao}</p>

                <div className="flex items-center gap-4 text-white/50 text-sm mb-4">
                  <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{listing.bairro}, {listing.municipio}</span>
                  <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{timeAgo(listing.criado_em)}</span>
                </div>

                {listing.profile && (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 mb-4">
                    <div className="w-10 h-10 rounded-full bg-mercado/20 flex items-center justify-center">
                      <span className="text-mercado font-bold">{listing.profile.nome?.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="text-white font-medium">{listing.profile.nome}</p>
                      <p className="text-white/50 text-sm">{listing.profile.bairro}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-4">
                {(listing.whatsapp || listing.telefone) && (
                  <button onClick={handleContact} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[#25D366] text-white font-medium hover:shadow-lg transition-all">
                    <MessageCircle className="w-5 h-5" />
                    WhatsApp
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Comments Section */}
          <div className="border-t border-white/10 p-6">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Perguntas e Respostas ({comments.length})
            </h3>

            <div className="space-y-3 max-h-60 overflow-y-auto mb-4">
              {comments.map((comment) => (
                <div key={comment.id} className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-mercado/20 flex items-center justify-center">
                      <span className="text-mercado text-xs font-bold">{comment.profile?.nome?.charAt(0) || 'U'}</span>
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">{comment.profile?.nome || 'Utilizador'}</p>
                      <p className="text-white/50 text-xs">{timeAgo(comment.criado_em)}</p>
                    </div>
                  </div>
                  <p className="text-white/80 text-sm pl-10">{comment.texto}</p>
                </div>
              ))}
            </div>

            {isLoggedIn ? (
              <form onSubmit={handleComment} className="flex gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Fazer uma pergunta..."
                  className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-mercado/50"
                />
                <button type="submit" disabled={sending || !newComment.trim()} className="p-3 rounded-xl bg-mercado text-white disabled:opacity-50 transition-all">
                  <Send className="w-5 h-5" />
                </button>
              </form>
            ) : (
              <Link to="/auth" className="block text-center text-mercado hover:underline text-sm">
                Inicie sessão para fazer perguntas
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function getMockListings(): Listing[] {
  return [
    {
      id: 'm1', usuario_id: 'u1', tipo: 'mercado', titulo: 'iPhone 14 Pro Max 256GB', descricao: 'iPhone novo, lacrado. Garantia Apple.', preco: 650000, condicao: 'novo', categoria: 'tecnologia',
      fotos_urls: ['https://images.pexels.com/photos/607712/pexels-photo-607712.jpeg?auto=compress&cs=tinysrgb&w=600'], video_url: null,
      provincia: 'Luanda', municipio: 'Luanda', bairro: 'Maianga', telefone: '923456789', whatsapp: '923456789', negociavel: true, curtidas_count: 45, visualizacoes: 120, is_active: true,
      criado_em: new Date().toISOString(), updated_at: '', profile: { id: 'u1', nome: 'João Silva', email: '', telefone: '', provincia: '', municipio: '', bairro: '', verificado: true, criado_em: '' }
    },
    {
      id: 'm2', usuario_id: 'u2', tipo: 'mercado', titulo: 'PlayStation 5 Digital Edition', descricao: 'PS5 novo com 2 controles. Inclui 3 jogos.', preco: 380000, condicao: 'novo', categoria: 'gaming',
      fotos_urls: ['https://images.pexels.com/photos/7915468/pexels-photo-7915468.jpeg?auto=compress&cs=tinysrgb&w=600'], video_url: null,
      provincia: 'Luanda', municipio: 'Viana', bairro: 'Zango', telefone: '923456788', whatsapp: '923456788', negociavel: false, curtidas_count: 89, visualizacoes: 250, is_active: true,
      criado_em: new Date(Date.now() - 3600000).toISOString(), updated_at: '', profile: { id: 'u2', nome: 'Maria Santos', email: '', telefone: '', provincia: '', municipio: '', bairro: '', verificado: false, criado_em: '' }
    },
    {
      id: 'm3', usuario_id: 'u3', tipo: 'mercado', titulo: 'MacBook Air M2', descricao: 'MacBook usado por 6 meses. Perfeito estado.', preco: 550000, condicao: 'usado', categoria: 'tecnologia',
      fotos_urls: ['https://images.pexels.com/photos/18105/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=600'], video_url: null,
      provincia: 'Huambo', municipio: 'Huambo', bairro: 'Centro', telefone: '923456787', whatsapp: '923456787', negociavel: true, curtidas_count: 23, visualizacoes: 85, is_active: true,
      criado_em: new Date(Date.now() - 86400000).toISOString(), updated_at: '', profile: { id: 'u3', nome: 'Pedro Costa', email: '', telefone: '', provincia: '', municipio: '', bairro: '', verificado: true, criado_em: '' }
    },
    {
      id: 'm4', usuario_id: 'u4', tipo: 'mercado', titulo: 'Sofá 3 Lugares Moderno', descricao: 'Sofá cinza, tecido premium. Semi-novo.', preco: 150000, condicao: 'usado', categoria: 'casa',
      fotos_urls: ['https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=600'], video_url: null,
      provincia: 'Benguela', municipio: 'Lobito', bairro: 'Centro', telefone: '923456786', whatsapp: '923456786', negociavel: true, curtidas_count: 12, visualizacoes: 56, is_active: true,
      criado_em: new Date(Date.now() - 7200000).toISOString(), updated_at: '', profile: { id: 'u4', nome: 'Ana Lopes', email: '', telefone: '', provincia: '', municipio: '', bairro: '', verificado: false, criado_em: '' }
    },
  ];
}

function getMockComments(): MarketComment[] {
  return [
    {
      id: 'c1', listing_id: 'm1', usuario_id: 'uc1', texto: 'Ainda está disponível?',
      criado_em: new Date(Date.now() - 3600000).toISOString(),
      profile: { id: 'uc1', nome: 'Carlos Neto', email: '', telefone: '', provincia: '', municipio: '', bairro: '', verificado: false, criado_em: '' }
    },
    {
      id: 'c2', listing_id: 'm1', usuario_id: 'u1', texto: 'Sim, ainda disponível! Pode combinar para ver hoje.',
      criado_em: new Date(Date.now() - 1800000).toISOString(),
      profile: { id: 'u1', nome: 'João Silva', email: '', telefone: '', provincia: '', municipio: '', bairro: '', verificado: true, criado_em: '' }
    },
    {
      id: 'c3', listing_id: 'm1', usuario_id: 'uc2', texto: 'Aceitas troca por um iPad Pro?',
      criado_em: new Date(Date.now() - 900000).toISOString(),
      profile: { id: 'uc2', nome: 'Sofia Mendes', email: '', telefone: '', provincia: '', municipio: '', bairro: '', verificado: false, criado_em: '' }
    },
  ];
}

export default MercadoPage;