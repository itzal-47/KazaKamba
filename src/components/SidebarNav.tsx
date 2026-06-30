import { NavLink } from 'react-router-dom';
import { LayoutGrid, ShoppingBag, Camera, MessageCircle, User, Home, PlusCircle, Info } from 'lucide-react';

const mainNavItems = [
  { path: '/feed', label: 'Feed', icon: LayoutGrid, description: 'Serviços, Casas, Emprego' },
  { path: '/mercado', label: 'Mercado', icon: ShoppingBag, description: 'Bazar profissional' },
  { path: '/stories', label: 'Stories', icon: Camera, description: 'Momentos dos trabalhadores' },
  { path: '/chat', label: 'Chat', icon: MessageCircle, description: 'Mensagens internas' },
];

const secondaryNavItems = [
  { path: '/profile', label: 'Perfil', icon: User },
  { path: '/create', label: 'Publicar', icon: PlusCircle },
  { path: '/about', label: 'Sobre', icon: Info },
];

export function SidebarNav() {
  return (
    <aside className="hidden md:flex flex-col w-64 fixed left-0 top-0 bottom-0 bg-[#0F2B48] border-r border-white/10 z-40">
      <div className="p-6 border-b border-white/10">
        <NavLink to="/" className="flex items-center gap-3 group">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-background-card flex items-center justify-center shadow-lg shadow-primary/20">
            <Home className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-xl font-bold text-white tracking-tight">
              Kaza<span className="text-primary">Kamba</span>
            </span>
            <p className="text-xs text-white/50">Conexões locais</p>
          </div>
        </NavLink>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        <div className="px-3 space-y-1">
          {mainNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive
                  ? item.path === '/mercado'
                    ? 'bg-mercado/20 text-mercado'
                    : item.path === '/stories'
                    ? 'bg-gradient-to-r from-purple-600/20 to-pink-500/20 text-pink-400'
                    : 'bg-primary/20 text-primary'
                  : 'text-white/70 hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <div>
                <span className="font-medium">{item.label}</span>
                <p className={`text-xs ${item.path === '/mercado' ? 'text-mercado/70' : item.path === '/stories' ? 'text-pink-400/70' : 'text-white/50'}`}>
                  {item.description}
                </p>
              </div>
            </NavLink>
          ))}
        </div>
      </div>

      <div className="p-3 border-t border-white/10 space-y-1">
        {secondaryNavItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              isActive
                ? 'bg-primary/20 text-primary'
                : 'text-white/70 hover:bg-white/5 hover:text-white'
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </aside>
  );
}
