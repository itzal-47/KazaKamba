import { Link } from 'react-router-dom';
import { Package, Search, MessageCircle, Heart, Camera, ShoppingBag, Home } from 'lucide-react';

interface EmptyStateProps {
  type: 'listings' | 'favorites' | 'chats' | 'stories' | 'mercado' | 'search';
  title?: string;
  description?: string;
  actionLabel?: string;
  actionLink?: string;
}

const config: Record<string, { icon: typeof Package; defaultTitle: string; defaultDescription: string; defaultAction: string; defaultLink: string }> = {
  listings: {
    icon: Home,
    defaultTitle: 'Nenhum anúncio encontrado',
    defaultDescription: 'Seja o primeiro a publicar um anúncio na sua região.',
    defaultAction: 'Publicar anúncio',
    defaultLink: '/create',
  },
  favorites: {
    icon: Heart,
    defaultTitle: 'Nenhum favorito ainda',
    defaultDescription: 'Salve anúncios que gostou para ver mais tarde.',
    defaultAction: 'Explorar anúncios',
    defaultLink: '/feed',
  },
  chats: {
    icon: MessageCircle,
    defaultTitle: 'Nenhuma conversa',
    defaultDescription: 'Inicie uma conversa com um vendedor ou prestador de serviço.',
    defaultAction: 'Ver anúncios',
    defaultLink: '/feed',
  },
  stories: {
    icon: Camera,
    defaultTitle: 'Nenhuma story disponível',
    defaultDescription: 'As stories expiram após 24 horas. Volte mais tarde!',
    defaultAction: 'Ver anúncios',
    defaultLink: '/feed',
  },
  mercado: {
    icon: ShoppingBag,
    defaultTitle: 'Nenhum produto encontrado',
    defaultDescription: 'Explore produtos novos e usados no mercado.',
    defaultAction: 'Ver mercado',
    defaultLink: '/mercado',
  },
  search: {
    icon: Search,
    defaultTitle: 'Nenhum resultado',
    defaultDescription: 'Tente ajustar os filtros ou a pesquisa.',
    defaultAction: 'Limpar filtros',
    defaultLink: '/feed',
  },
};

export function EmptyState({ type, title, description, actionLabel, actionLink }: EmptyStateProps) {
  const cfg = config[type];
  const Icon = cfg.icon;

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
        <Icon className="w-10 h-10 text-white/30" />
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">{title || cfg.defaultTitle}</h3>
      <p className="text-white/60 text-center max-w-md mb-6">{description || cfg.defaultDescription}</p>
      {(actionLink || cfg.defaultLink) && (
        <Link
          to={actionLink || cfg.defaultLink}
          className="px-6 py-3 rounded-xl bg-primary text-white font-medium hover:bg-primary-light transition-colors"
        >
          {actionLabel || cfg.defaultAction}
        </Link>
      )}
    </div>
  );
}
