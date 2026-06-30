import { HashRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { FeedPage } from './pages/FeedPage';
import { ListingDetailPage } from './pages/ListingDetailPage';
import { CreateListingPage } from './pages/CreateListingPage';
import { ProfilePage } from './pages/ProfilePage';
import { FavoritesPage } from './pages/FavoritesPage';
import { AboutPage } from './pages/AboutPage';
import { AuthPage } from './pages/AuthPage';
import { StoriesPage } from './pages/StoriesPage';
import { ChatPage } from './pages/ChatPage';
import { MercadoPage } from './pages/MercadoPage';
import { EmailConfirmationPage } from './pages/EmailConfirmationPage';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="feed" element={<FeedPage />} />
          <Route path="mercado" element={<MercadoPage />} />
          <Route path="stories" element={<StoriesPage />} />
          <Route path="chat" element={<ChatPage />} />
          <Route path="listing/:id" element={<ListingDetailPage />} />
          <Route path="create" element={<CreateListingPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="favorites" element={<FavoritesPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="auth" element={<AuthPage />} />
          <Route path="confirm-email" element={<EmailConfirmationPage />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;
