import { Outlet } from 'react-router-dom';
import { BottomNav } from './BottomNav';
import { SidebarNav } from './SidebarNav';
import { Header } from './Header';

export function Layout() {
  return (
    <div className="min-h-screen bg-background">
      <SidebarNav />
      <div className="md:ml-64">
        <Header />
        <main className="pb-20 md:pb-0">
          <Outlet />
        </main>
        <footer className="bg-background-card border-t border-white/10 py-8 mt-auto">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid md:grid-cols-4 gap-8">
              <div className="md:col-span-2">
                <h3 className="text-xl font-bold text-white mb-2">
                  Kaza<span className="text-primary">Kamba</span>
                </h3>
                <p className="text-white/60 text-sm mb-4">
                  Quem procura encontra. Quem oferece aparece.
                </p>
                <p className="text-white/40 text-sm">
                  Criado no Huambo por José Eduardo Numa Canjo, Fundador da Empresa EiVORAK.
                </p>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-3">Navegação</h4>
                <ul className="space-y-2 text-sm">
                  <li><a href="#/feed" className="text-white/60 hover:text-primary transition-colors">Feed</a></li>
                  <li><a href="#/mercado" className="text-white/60 hover:text-mercado transition-colors">Mercado</a></li>
                  <li><a href="#/stories" className="text-white/60 hover:text-pink-400 transition-colors">Stories</a></li>
                  <li><a href="#/chat" className="text-white/60 hover:text-primary transition-colors">Chat</a></li>
                </ul>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-3">Sobre</h4>
                <ul className="space-y-2 text-sm">
                  <li><a href="#/about" className="text-white/60 hover:text-primary transition-colors">O que é KazaKamba</a></li>
                  <li><a href="#/auth" className="text-white/60 hover:text-primary transition-colors">Entrar / Registar</a></li>
                </ul>
              </div>
            </div>

            <div className="border-t border-white/10 mt-8 pt-6 text-center">
              <p className="text-white/40 text-sm">
                &copy; {new Date().getFullYear()} KazaKamba. Feito com amor para Angola.
              </p>
            </div>
          </div>
        </footer>
      </div>
      <BottomNav />
    </div>
  );
}
