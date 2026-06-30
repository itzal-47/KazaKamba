import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, SlidersHorizontal, X, MapPin, ChevronDown, Share2, MessageCircle, CheckCircle, Heart, Eye } from 'lucide-react';
import { CategoryFilter } from '../components/CategoryFilter';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { EmptyState } from '../components/EmptyState';
import type { Listing, Category } from '../types';
import { getCategories, getListings, getCurrentUser, addFavorite, removeFavorite, isFavorite } from '../lib/api';
import { PROVINCIAS, MUNICIPIOS } from '../types';
import { getCategoryImage, generateWhatsAppShareLink, generateWhatsAppContactLink, formatPrice, timeAgo, optimizeImageUrl } from '../lib/utils';
import { useAppSettings } from '../lib/AppContext';

export function FeedPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState<Category[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'recent' | 'price_asc' | 'price_desc' | 'nearest'>('recent');

  const [selectedProvincia, setSelectedProvincia] = useState('all');
  const [selectedMunicipio, setSelectedMunicipio] = useState('all');

  const [user, setUser] = useState<any>(null);
  const { dataSaver } = useAppSettings();

  useEffect(() => {
    getCurrentUser().then(setUser);
    getCategories().then(setCategories);
  }, []);

  useEffect(() => {
    setListings([]);
    setSelectedMunicipio('all');
  }, [selectedProvincia]);

  useEffect(() => {
    const search = searchParams.get('search') || '';
    setSearchQuery(search);
    setLoading(true);

    const filters: any = { search };
    if (selectedCategory !== 'all') filters.categoria = selectedCategory;
    if (selectedProvincia !== 'all') filters.provincia = selectedProvincia;

    getListings(filters)
      .then((data) => {
        let sorted = [...data];
        if (sortBy === 'price_asc') {
          sorted.sort((a, b) => (a.preco || 0) - (b.preco || 0));
        } else if (sortBy === 'price_desc') {
          sorted.sort((a, b) => (b.preco || 0) - (a.preco || 0));
        } else if (sortBy === 'nearest') {
          sorted.sort((a, b) => {
            if (a.provincia === selectedProvincia && b.provincia !== selectedProvincia) return -1;
            if (a.provincia !== selectedProvincia && b.provincia === selectedProvincia) return 1;
            return 0;
          });
        }
        setListings(sorted);
      })
      .finally(() => setLoading(false));
  }, [searchParams, selectedCategory, sortBy, selectedProvincia]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchParams({ search: searchQuery.trim() });
    } else {
      setSearchParams({});
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchParams({});
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Search className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">Feed de Anúncios</h1>
              <p className="text-white/60">Serviços, Casas e Emprego em Angola</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSearch} className="mb-6">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
              <input
                type="text"
                placeholder="Pesquisar por título, descrição..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`p-3 rounded-xl border transition-all ${
                showFilters
                  ? 'bg-primary border-primary text-white'
                  : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
              }`}
            >
              <SlidersHorizontal className="w-5 h-5" />
            </button>
          </div>
        </form>

        {showFilters && (
          <div className="mb-6 p-5 rounded-xl bg-white/5 border border-white/10 space-y-4">
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-white/70 text-sm mb-2 flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  Província
                </label>
                <div className="relative">
                  <select
                    value={selectedProvincia}
                    onChange={(e) => setSelectedProvincia(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary appearance-none"
                  >
                    <option value="all" className="bg-background-card">Todas</option>
                    {PROVINCIAS.map((p) => (
                      <option key={p.value} value={p.value} className="bg-background-card">{p.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-white/70 text-sm mb-2">Município</label>
                <div className="relative">
                  <select
                    value={selectedMunicipio}
                    onChange={(e) => setSelectedMunicipio(e.target.value)}
                    disabled={selectedProvincia === 'all'}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary appearance-none disabled:opacity-50"
                  >
                    <option value="all" className="bg-background-card">Todos</option>
                    {(MUNICIPIOS[selectedProvincia] || []).map((m) => (
                      <option key={m.value} value={m.value} className="bg-background-card">{m.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-white/70 text-sm mb-2">Ordenar</label>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary appearance-none"
                  >
                    <option value="recent" className="bg-background-card">Mais recentes</option>
                    <option value="price_asc" className="bg-background-card">Menor preço</option>
                    <option value="price_desc" className="bg-background-card">Maior preço</option>
                    <option value="nearest" className="bg-background-card">Mais próximo</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
                </div>
              </div>
            </div>

            {(selectedProvincia !== 'all' || selectedMunicipio !== 'all') && (
              <div className="flex flex-wrap gap-2 pt-2 border-t border-white/10">
                {selectedProvincia !== 'all' && (
                  <span className="px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary text-sm flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    {PROVINCIAS.find(p => p.value === selectedProvincia)?.label}
                    <button onClick={() => setSelectedProvincia('all')} className="hover:text-white"><X className="w-3.5 h-3.5" /></button>
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        <div className="mb-6">
          <CategoryFilter
            categories={categories}
            selected={selectedCategory}
            onSelect={setSelectedCategory}
          />
        </div>

        {searchParams.get('search') && (
          <div className="mb-6 px-4 py-3 rounded-xl bg-primary/10 border border-primary/20">
            <p className="text-white/80">
              Resultados para: <span className="text-primary font-medium">"{searchParams.get('search')}"</span>
            </p>
          </div>
        )}

        {loading ? (
          <LoadingSkeleton type="grid" count={9} />
        ) : listings.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <FeedListingCard
                key={listing.id}
                listing={listing}
                isLoggedIn={!!user}
                dataSaver={dataSaver}
                onRefresh={() => {
                  getListings({}).then(setListings);
                }}
              />
            ))}
          </div>
        ) : (
          <EmptyState type="search" actionLabel="Limpar filtros" actionLink={searchParams.get('search') ? '/feed' : undefined} />
        )}
      </div>
    </div>
  );
}

function FeedListingCard({ listing, isLoggedIn, dataSaver, onRefresh }: { listing: Listing; isLoggedIn: boolean; dataSaver: boolean; onRefresh: () => void }) {
  const [isFav, setIsFav] = useState(false);
  const [showActions, setShowActions] = useState(false);

  useEffect(() => {
    if (isLoggedIn) {
      isFavorite(listing.id).then(setIsFav);
    }
  }, [listing.id, isLoggedIn]);

  const handleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoggedIn) return;
    if (isFav) {
      await removeFavorite(listing.id);
      setIsFav(false);
    } else {
      await addFavorite(listing.id);
      setIsFav(true);
    }
  };

  const handleWhatsAppShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = window.location.origin + window.location.pathname + '#/listing/' + listing.id;
    const link = generateWhatsAppShareLink(listing.titulo, listing.preco, url);
    window.open(link, '_blank');
  };

  const handleContact = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const phone = listing.whatsapp || listing.telefone;
    if (phone) {
      const link = generateWhatsAppContactLink(phone, listing.titulo, listing.preco);
      window.open(link, '_blank');
    }
  };

  const image = listing.fotos_urls?.[0] || getCategoryImage(listing.categoria || '');
  const optimizedImage = optimizeImageUrl(image, dataSaver);

  return (
    <div
      className="group bg-gradient-to-b from-background-card to-background border border-white/10 rounded-2xl overflow-hidden hover:border-primary/30 hover:shadow-xl hover:shadow-primary/10 transition-all relative"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <Link
        to={`/listing/${listing.id}`}
        className="block"
      >
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={optimizedImage}
            alt={listing.titulo}
            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${dataSaver ? 'blur-[0.5px]' : ''}`}
          />

          {listing.profile?.verificado && (
            <div className="absolute top-3 left-3 px-2.5 py-1.5 rounded-lg bg-primary/90 backdrop-blur-sm text-white text-xs font-medium flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5" />
              Kamba Verificado
            </div>
          )}

          {listing.curtidas_count > 0 && (
            <span className="absolute bottom-3 right-3 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-sm text-white text-xs flex items-center gap-1">
              <Heart className="w-3 h-3" />
              {listing.curtidas_count}
            </span>
          )}

          {listing.visualizacoes > 0 && (
            <span className="absolute bottom-3 left-3 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-sm text-white/70 text-xs flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {listing.visualizacoes}
            </span>
          )}

          <button
            onClick={handleFavorite}
            className={`absolute top-3 right-3 p-2.5 rounded-full backdrop-blur-sm border transition-all ${
              isFav
                ? 'bg-red-500/80 border-red-500 text-white'
                : 'bg-black/40 border-white/20 text-white hover:bg-red-500 hover:border-red-500'
            }`}
          >
            <Heart className={`w-4 h-4 ${isFav ? 'fill-white' : ''}`} />
          </button>
        </div>

        <div className="p-4">
          <h3 className="text-white font-semibold text-lg line-clamp-2 mb-2 group-hover:text-primary transition-colors">
            {listing.titulo}
          </h3>

          <p className="text-white/60 text-sm line-clamp-2 mb-3">
            {listing.descricao}
          </p>

          <div className="flex items-center justify-between text-sm">
            <span className="text-primary font-semibold flex items-center gap-1">
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
                {timeAgo(listing.criado_em)}
              </span>
            </div>
          </div>
        </div>
      </Link>

      {showActions && (
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-background-card via-background-card/95 to-transparent flex gap-2 translate-y-0 opacity-100 transition-all">
          <button
            onClick={handleWhatsAppShare}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white text-sm font-medium hover:bg-white/20 transition-all"
          >
            <Share2 className="w-4 h-4" />
            Status WhatsApp
          </button>
          {(listing.whatsapp || listing.telefone) && (
            <button
              onClick={handleContact}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:shadow-lg hover:shadow-primary/30 transition-all"
            >
              <MessageCircle className="w-4 h-4" />
              Contactar
            </button>
          )}
        </div>
      )}
    </div>
  );
}
