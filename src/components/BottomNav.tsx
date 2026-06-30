import { NavLink } from 'react-router-dom';
import { LayoutGrid, ShoppingBag, Camera, MessageCircle, User } from 'lucide-react';

const navItems = [
  { path: '/feed', label: 'Feed', icon: LayoutGrid },
  { path: '/mercado', label: 'Mercado', icon: ShoppingBag },
  { path: '/stories', label: 'Stories', icon: Camera },
  { path: '/chat', label: 'Chat', icon: MessageCircle },
  { path: '/profile', label: 'Perfil', icon: User },
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="bg-[#0A192F]/95 backdrop-blur-xl border-t border-white/10">
        <div className="flex justify-around items-center py-2 px-4">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `flex flex-col items-center gap-1 py-2 px-3 rounded-xl transition-all ${
                isActive
                  ? 'text-primary'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              {({ isActive }) => (
                <>
                  <div className={`relative p-2 rounded-xl transition-all ${
                    isActive
                      ? item.path === '/mercado'
                        ? 'bg-mercado/20'
                        : item.path === '/stories'
                        ? 'bg-gradient-to-br from-purple-600/30 to-pink-500/30'
                        : 'bg-primary/20'
                      : 'bg-transparent'
                  }`}>
                    <item.icon className={`w-5 h-5 ${isActive && item.path === '/stories' ? 'text-pink-400' : ''}`} />
                    {item.path === '/stories' && (
                      <span className={`absolute inset-0 rounded-xl ${isActive ? 'border-2 border-transparent bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-border' : ''}`} />
                    )}
                  </div>
                  <span className={`text-xs font-medium ${isActive && item.path === '/mercado' ? 'text-mercado' : isActive && item.path === '/stories' ? 'text-pink-400' : ''}`}>
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}
