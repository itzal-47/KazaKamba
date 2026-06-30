import { Link } from 'react-router-dom';
import { Search, Plus, ArrowRight, Star, Users, Shield, Zap, ShoppingBag, Camera, MessageCircle, Home as HomeIcon } from 'lucide-react';
import { ListingCard } from '../components/ListingCard';
import { CategoryFilter } from '../components/CategoryFilter';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { EmptyState } from '../components/EmptyState';
import { useEffect, useState } from 'react';
import type { Listing, Category } from '../types';
import { getCategories, getListings } from '../lib/api';

export function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredListings, setFeaturedListings] = useState<Listing[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getCategories(), getListings({ limit: 6 })])
      .then(([cats, listings]) => {
        setCategories(cats);
        setFeaturedListings(listings);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (selectedCategory === 'all') {
      getListings({ limit: 6 }).then(setFeaturedListings);
    } else {
      getListings({ categoria: selectedCategory, limit: 6 }).then(setFeaturedListings);
    }
  }, [selectedCategory]);

  const navCards = [
    { label: 'Feed', desc: 'Serviços, Casas', icon: Search, path: '/feed', color: 'primary' },
    { label: 'Mercado', desc: 'Bazar profissional', icon: ShoppingBag, path: '/mercado', color: 'mercado' },
    { label: 'Stories', desc: 'Momentos', icon: Camera, path: '/stories', color: 'stories' },
    { label: 'Chat', desc: 'Mensagens', icon: MessageCircle, path: '/chat', color: 'primary' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <section className="relative overflow-hidden bg-gradient-to-b from-background-card to-background py-16 md:py-24">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMxRTkwRkYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-40"></div>

        <div className="relative max-w-7xl mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
              <HomeIcon className="w-4 h-4" />
              Conexões locais em Angola
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight">
              Encontre pessoas, casas e oportunidades{' '}
              <span className="text-primary">perto de si</span>
            </h1>

            <p className="text-xl text-white/60 mb-4">
              Sem complicação. Sem intermediários.
            </p>

            <p className="text-lg text-accent-gold font-medium mb-10">
              Quem procura encontra. Quem oferece aparece.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/feed"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-primary text-white font-semibold text-lg hover:shadow-xl hover:shadow-primary/30 transition-all"
              >
                <Search className="w-5 h-5" />
                Explorar
              </Link>
              <Link
                to="/create"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white/10 border border-white/20 text-white font-semibold text-lg hover:bg-white/20 transition-all"
              >
                <Plus className="w-5 h-5" />
                Publicar anúncio
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-background">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {navCards.map((card) => (
              <Link
                key={card.path}
                to={card.path}
                className={`group p-6 rounded-2xl bg-gradient-to-b from-background-card to-background border border-white/10 hover:border-${card.color}/40 transition-all`}
              >
                <div className={`w-12 h-12 rounded-xl ${
                  card.color === 'mercado'
                    ? 'bg-mercado/20 group-hover:bg-mercado/30'
                    : card.color === 'stories'
                    ? 'bg-gradient-to-br from-purple-600/30 to-pink-500/30'
                    : 'bg-primary/20 group-hover:bg-primary/30'
                } flex items-center justify-center mb-4 transition-all`}>
                  <card.icon className={`w-6 h-6 ${
                    card.color === 'mercado'
                      ? 'text-mercado'
                      : card.color === 'stories'
                      ? 'text-pink-400'
                      : 'text-primary'
                  }`} />
                </div>
                <h3 className="text-white font-semibold text-lg">{card.label}</h3>
                <p className="text-white/60 text-sm">{card.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-primary/30 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-4 group-hover:bg-primary/30 transition-colors">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">Conexão Directa</h3>
              <p className="text-white/60">Contacta directamente vendedores e prestadores de serviços, sem intermediários.</p>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-mercado/30 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-mercado/20 flex items-center justify-center mb-4 group-hover:bg-mercado/30 transition-colors">
                <Shield className="w-6 h-6 text-mercado" />
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">Transparência Total</h3>
              <p className="text-white/60">Veja fotos, preços e contactos antes de decidir. Negocie com confiança.</p>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-pink-500/30 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600/30 to-pink-500/30 flex items-center justify-center mb-4 group-hover:from-purple-600/40 group-hover:to-pink-500/40 transition-colors">
                <Zap className="w-6 h-6 text-pink-400" />
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">Rapidez Simples</h3>
              <p className="text-white/60">Publique seu anúncio em segundos. Encontre o que precisa em minutos.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-background-card">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Anúncios em Destaque</h2>
              <p className="text-white/60">As melhores oportunidades perto de si</p>
            </div>
            <Link
              to="/feed"
              className="hidden md:inline-flex items-center gap-2 text-primary hover:text-white transition-colors"
            >
              Ver todos
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="mb-8">
            <CategoryFilter
              categories={categories}
              selected={selectedCategory}
              onSelect={setSelectedCategory}
            />
          </div>

          {loading ? (
            <LoadingSkeleton type="grid" count={6} />
          ) : featuredListings.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          ) : (
            <EmptyState type="listings" />
          )}

          <div className="mt-8 text-center md:hidden">
            <Link
              to="/feed"
              className="inline-flex items-center gap-2 text-primary hover:text-white transition-colors"
            >
              Ver todos
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                Mercado do Kamba
              </h2>
              <p className="text-white/70 text-lg mb-6">
                O bazar profissional de Angola. Compre e venda produtos novos e usados
                directamente com outras pessoas, sem intermediários.
              </p>
              <Link
                to="/mercado"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-mercado text-white font-semibold text-lg hover:shadow-xl hover:shadow-mercado/30 transition-all"
              >
                <ShoppingBag className="w-5 h-5" />
                Explorar Mercado
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 rounded-2xl bg-mercado/10 border border-mercado/20">
                <p className="text-3xl font-bold text-mercado mb-2">0%</p>
                <p className="text-white/60 text-sm">Comissão</p>
              </div>
              <div className="p-6 rounded-2xl bg-mercado/10 border border-mercado/20">
                <p className="text-3xl font-bold text-mercado mb-2">24h</p>
                <p className="text-white/60 text-sm">Para publicar</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Pronto para começar?
            </h2>
            <p className="text-white/60 mb-8">
              Junte-se a milhares de angolanos que já usam o KazaKamba para encontrar e oferecer oportunidades.
            </p>
            <Link
              to="/create"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-accent-gold to-accent-goldDark text-background font-semibold text-lg hover:shadow-xl hover:shadow-accent-gold/30 transition-all"
            >
              <Plus className="w-5 h-5" />
              Publicar meu primeiro anúncio
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
