import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plus, X, Heart, Send, ChevronLeft, ChevronRight,
  Volume2, VolumeX, User, Play, Pause, RefreshCw, Camera, CheckCircle,
} from 'lucide-react';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { EmptyState } from '../components/EmptyState';
import type { Story } from '../types';
import {
  getStories, createStory, getCurrentUser, getProfile,
  addFavorite, removeFavorite, isFavorite,
  findOrCreateChat, sendMessage,
} from '../lib/api';
import { useAppSettings } from '../lib/AppContext';
import { optimizeImageUrl, timeAgo } from '../lib/utils';

export function StoriesPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [selectedStoryIndex, setSelectedStoryIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { dataSaver } = useAppSettings();

  // ── Form de criar story ──────────────────────────────────────────────────
  const [showCreate, setShowCreate] = useState(false);
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState<'foto' | 'video'>('foto');
  const [legenda, setLegenda] = useState('');
  const [creating, setCreating] = useState(false);

  const loadStories = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getStories();
      setStories(data);
    } catch {
      setError('Não foi possível carregar as stories.');
      setStories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCurrentUser().then((user) => {
      setIsLoggedIn(!!user);
      setCurrentUserId(user?.id || null);
    });
    loadStories();
  }, []);

  const handleNext = () => {
    if (selectedStoryIndex !== null && selectedStoryIndex < stories.length - 1) {
      setSelectedStoryIndex(selectedStoryIndex + 1);
    } else {
      setSelectedStoryIndex(null);
    }
  };

  const handlePrev = () => {
    if (selectedStoryIndex !== null && selectedStoryIndex > 0) {
      setSelectedStoryIndex(selectedStoryIndex - 1);
    }
  };

  const handleCreateStory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mediaUrl.trim()) return;
    setCreating(true);
    try {
      const story = await createStory(mediaUrl.trim(), mediaType, legenda.trim() || undefined);
      setStories((prev) => [story, ...prev]);
      setShowCreate(false);
      setMediaUrl('');
      setLegenda('');
    } catch (err) {
      console.error('Erro ao criar story:', err);
    } finally {
      setCreating(false);
    }
  };

  const selectedStory = selectedStoryIndex !== null ? stories[selectedStoryIndex] : null;

  // ── Visualizador de story em tela cheia ──────────────────────────────────
  if (selectedStory) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex items-center justify-center">
        <StoryViewer
          story={selectedStory}
          stories={stories}
          currentIndex={selectedStoryIndex!}
          onNext={handleNext}
          onPrev={handlePrev}
          onClose={() => setSelectedStoryIndex(null)}
          isLoggedIn={isLoggedIn}
          currentUserId={currentUserId}
          dataSaver={dataSaver}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Stories</h1>
          <p className="text-white/60">Momentos dos trabalhadores e profissionais em Angola</p>
        </div>

        {/* Lista horizontal */}
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {/* Botão de criar story */}
          {isLoggedIn && (
            <button
              onClick={() => setShowCreate(true)}
              className="flex-shrink-0 w-28 h-48 rounded-2xl bg-gradient-to-b from-primary/20 to-background-card border-2 border-dashed border-primary/40 flex flex-col items-center justify-center gap-2 hover:border-primary/70 transition-all"
            >
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <Plus className="w-6 h-6 text-primary" />
              </div>
              <p className="text-white/70 text-xs text-center px-2">Publicar Story</p>
            </button>
          )}

          {loading ? (
            <LoadingSkeleton type="stories" count={5} />
          ) : error ? (
            <div className="flex-1 flex flex-col items-center justify-center py-8">
              <RefreshCw className="w-10 h-10 text-white/20 mb-3" />
              <p className="text-white/60 text-sm mb-3">{error}</p>
              <button
                onClick={loadStories}
                className="px-6 py-3 rounded-xl bg-primary text-white font-medium hover:shadow-lg transition-all"
              >
                Tentar Novamente
              </button>
            </div>
          ) : stories.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-8">
              <Camera className="w-12 h-12 text-white/20 mb-4" />
              <p className="text-white/60 text-center">
                Ainda não há Stories nas últimas 24h.<br />
                {isLoggedIn ? 'Sê o primeiro a partilhar!' : <Link to="/auth" className="text-primary">Entra</Link>}
              </p>
            </div>
          ) : (
            stories.map((story, index) => (
              <button
                key={story.id}
                onClick={() => setSelectedStoryIndex(index)}
                className={`flex-shrink-0 w-28 h-48 rounded-2xl relative overflow-hidden group transition-all ${story.is_viewed ? 'opacity-80' : ''}`}
              >
                <div className={`absolute inset-0 p-[3px] rounded-2xl ${story.is_viewed ? 'bg-white/20' : 'bg-gradient-to-tr from-purple-600 to-pink-500'}`}>
                  <div className="w-full h-full rounded-xl overflow-hidden bg-background-card">
                    <img
                      src={optimizeImageUrl(story.media_url, dataSaver)}
                      alt=""
                      className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${dataSaver ? 'blur-[0.5px]' : ''}`}
                    />
                  </div>
                </div>
                <div className="absolute bottom-3 left-2 right-2">
                  <p className="text-white text-xs font-medium truncate drop-shadow-lg">{story.profile?.nome || 'Utilizador'}</p>
                  <p className="text-white/60 text-[10px]">{timeAgo(story.criado_em)}</p>
                </div>
                {story.tipo === 'video' && (
                  <div className="absolute top-3 right-3 p-1.5 rounded-full bg-black/40">
                    <Play className="w-3 h-3 text-white" />
                  </div>
                )}
              </button>
            ))
          )}
        </div>

        {/* Destaques */}
        {stories.length > 0 && (
          <div className="mt-12">
            <h2 className="text-lg font-semibold text-white mb-4">Destaques da Semana</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stories.slice(0, 3).map((story, index) => (
                <button
                  key={story.id}
                  onClick={() => setSelectedStoryIndex(index)}
                  className="p-4 rounded-2xl bg-gradient-to-b from-background-card to-background border border-white/10 text-left hover:border-pink-500/30 transition-all group"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-purple-600 to-pink-500 p-0.5">
                      <div className="w-full h-full rounded-full bg-background-card flex items-center justify-center">
                        <span className="text-white font-bold">{story.profile?.nome?.charAt(0) || 'U'}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-white font-medium">{story.profile?.nome}</p>
                      <p className="text-white/50 text-sm">{story.profile?.bairro}</p>
                    </div>
                  </div>
                  <div className="aspect-video rounded-xl overflow-hidden mb-3">
                    <img
                      src={optimizeImageUrl(story.media_url, dataSaver)}
                      alt=""
                      className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${dataSaver ? 'blur-[0.5px]' : ''}`}
                    />
                  </div>
                  <div className="flex items-center gap-4 text-white/60 text-sm">
                    <span className="flex items-center gap-1"><Heart className="w-4 h-4" />{story.curtidas}</span>
                    <span className="text-pink-400 text-xs">{story.tipo === 'video' ? 'Vídeo' : 'Foto'}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Modal de criar story ─────────────────────────────────────────── */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-end sm:items-center justify-center p-4" onClick={() => setShowCreate(false)}>
          <div className="w-full max-w-md bg-background-card rounded-2xl border border-white/10 p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Publicar Story</h2>
              <button onClick={() => setShowCreate(false)} className="p-2 rounded-xl bg-white/5 text-white/60 hover:bg-white/10">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStory} className="space-y-4">
              <div>
                <label className="block text-white/70 text-sm mb-2">URL da imagem ou vídeo *</label>
                <input
                  type="url"
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  placeholder="https://..."
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-primary/50"
                />
              </div>

              <div>
                <label className="block text-white/70 text-sm mb-2">Tipo</label>
                <div className="flex gap-3">
                  {(['foto', 'video'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setMediaType(t)}
                      className={`flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all ${mediaType === t ? 'bg-primary border-primary text-white' : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'}`}
                    >
                      {t === 'foto' ? '📷 Foto' : '🎥 Vídeo'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-white/70 text-sm mb-2">Legenda <span className="text-white/40">(opcional)</span></label>
                <input
                  type="text"
                  value={legenda}
                  onChange={(e) => setLegenda(e.target.value.slice(0, 120))}
                  placeholder="Uma pequena descrição..."
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-primary/50"
                />
                <p className="text-white/30 text-xs mt-1 text-right">{legenda.length}/120</p>
              </div>

              <button
                type="submit"
                disabled={creating || !mediaUrl.trim()}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 text-white font-medium disabled:opacity-50 transition-all"
              >
                {creating ? <><div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />A publicar...</> : <><Camera className="w-5 h-5" />Publicar Story</>}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Componente StoryViewer ────────────────────────────────────────────────────
function StoryViewer({
  story, stories, currentIndex, onNext, onPrev, onClose,
  isLoggedIn, currentUserId, dataSaver,
}: {
  story: Story;
  stories: Story[];
  currentIndex: number;
  onNext: () => void;
  onPrev: () => void;
  onClose: () => void;
  isLoggedIn: boolean;
  currentUserId: string | null;
  dataSaver: boolean;
}) {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [showLikeAnimation, setShowLikeAnimation] = useState(false);
  const progressInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Resposta ao story ────────────────────────────────────────────────────
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [replySent, setReplySent] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isLoggedIn) isFavorite(story.id).then(setIsLiked);
  }, [story.id, isLoggedIn]);

  useEffect(() => {
    // Reset reply state when story changes
    setReplyText('');
    setReplySent(false);
    setReplyError(null);
  }, [story.id]);

  useEffect(() => {
    if (story.tipo === 'foto') {
      setProgress(0);
      progressInterval.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) { onNext(); return 0; }
          return prev + 2;
        });
      }, 100);
    } else {
      setProgress(0);
    }
    return () => { if (progressInterval.current) clearInterval(progressInterval.current); };
  }, [story.id, story.tipo, onNext]);

  useEffect(() => {
    if (!dataSaver && story.tipo === 'video' && videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, [story.id, story.tipo, dataSaver]);

  const handleLike = async () => {
    if (!isLoggedIn) return;
    setShowLikeAnimation(true);
    setTimeout(() => setShowLikeAnimation(false), 1000);
    if (isLiked) {
      await removeFavorite(story.id);
      setIsLiked(false);
    } else {
      await addFavorite(story.id);
      setIsLiked(true);
    }
  };

  const handleVideoProgress = () => {
    if (videoRef.current) {
      const percent = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(percent);
      if (percent >= 99) onNext();
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPaused) videoRef.current.play();
      else videoRef.current.pause();
      setIsPaused(!isPaused);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  // Pausa o avanço automático quando o input está focado
  const handleInputFocus = () => {
    if (progressInterval.current) { clearInterval(progressInterval.current); progressInterval.current = null; }
    if (videoRef.current && !isPaused) { videoRef.current.pause(); setIsPaused(true); }
  };

  // ── Enviar resposta → cria/encontra chat e insere mensagem ───────────────
  const handleSendReply = async () => {
    if (!replyText.trim() || !isLoggedIn || !story.usuario_id) return;
    // Não pode responder ao próprio story
    if (currentUserId === story.usuario_id) return;

    setSendingReply(true);
    setReplyError(null);
    try {
      const chat = await findOrCreateChat(story.usuario_id);
      await sendMessage(chat.id, story.usuario_id, replyText.trim());
      setReplySent(true);
      setReplyText('');
      setTimeout(() => setReplySent(false), 3000);
    } catch (err: any) {
      setReplyError('Erro ao enviar. Tenta novamente.');
      console.error('Reply error:', err);
    } finally {
      setSendingReply(false);
    }
  };

  const handleReplyKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendReply(); }
  };

  const isOwnStory = currentUserId === story.usuario_id;

  return (
    <div className="w-full h-full flex items-center justify-center bg-background relative">
      {/* Fechar */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-20 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all"
      >
        <X className="w-6 h-6" />
      </button>

      <div className="w-full max-w-lg h-[85vh] relative">
        {/* Barra de progresso */}
        <div className="absolute top-3 left-3 right-3 z-10 flex gap-1">
          {stories.map((_, i) => (
            <div key={i} className="flex-1 h-1 rounded-full bg-white/30 overflow-hidden">
              <div
                className="h-full bg-white transition-all duration-100"
                style={{ width: i < currentIndex ? '100%' : i === currentIndex ? `${progress}%` : '0%' }}
              />
            </div>
          ))}
        </div>

        {/* Info do utilizador */}
        <div className="absolute top-10 left-4 z-10 flex items-center gap-3">
          <div className={`w-12 h-12 rounded-full p-0.5 ${story.is_viewed === false ? 'bg-gradient-to-tr from-purple-600 to-pink-500' : 'bg-white/30'}`}>
            <div className="w-full h-full rounded-full bg-background-card flex items-center justify-center">
              <span className="text-white font-bold">{story.profile?.nome?.charAt(0) || 'U'}</span>
            </div>
          </div>
          <div>
            <p className="text-white font-medium">{story.profile?.nome || 'Utilizador'}</p>
            <p className="text-white/60 text-sm">{story.profile?.bairro} • {timeAgo(story.criado_em)}</p>
          </div>
        </div>

        {/* Média */}
        <div className="w-full h-full rounded-2xl overflow-hidden bg-background-card relative">
          {showLikeAnimation && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
              <Heart className="w-32 h-32 text-red-500 fill-red-500 animate-ping" />
            </div>
          )}

          {story.tipo === 'video' ? (
            <div className="w-full h-full relative">
              <video
                ref={videoRef}
                src={story.media_url}
                className={`w-full h-full object-cover ${dataSaver ? 'blur-[0.5px]' : ''}`}
                muted={isMuted}
                playsInline
                onTimeUpdate={handleVideoProgress}
                onEnded={onNext}
              />
              {dataSaver && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <button onClick={togglePlay} className="p-4 rounded-full bg-white/20">
                    <Play className="w-12 h-12 text-white" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <img
              src={optimizeImageUrl(story.media_url, dataSaver)}
              alt="Story"
              className={`w-full h-full object-cover ${dataSaver ? 'blur-[0.5px]' : ''}`}
            />
          )}

          {/* Legenda */}
          {(story as any).legenda && (
            <div className="absolute bottom-24 left-4 right-4 z-10">
              <p className="text-white text-sm drop-shadow-lg bg-black/30 backdrop-blur-sm rounded-xl px-3 py-2">
                {(story as any).legenda}
              </p>
            </div>
          )}
        </div>

        {/* Controlos de vídeo */}
        {story.tipo === 'video' && !dataSaver && (
          <div className="absolute top-10 right-4 z-10 flex gap-2">
            <button onClick={toggleMute} className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30">
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
            <button onClick={togglePlay} className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30">
              {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
            </button>
          </div>
        )}

        {/* Acções na base */}
        <div className="absolute bottom-4 left-4 right-4 z-10 space-y-2">
          {/* Feedback de resposta enviada */}
          {replySent && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-mercado/30 border border-mercado/50 text-white text-sm">
              <CheckCircle className="w-4 h-4 text-mercado" />
              Resposta enviada!
              <button
                onClick={() => navigate('/chat')}
                className="ml-auto text-mercado text-xs underline"
              >
                Ver conversa
              </button>
            </div>
          )}

          {replyError && (
            <div className="px-4 py-2 rounded-full bg-red-500/20 border border-red-500/30 text-red-300 text-sm">
              {replyError}
            </div>
          )}

          <div className="flex items-center gap-3">
            {/* Campo de resposta — só aparece se não é o próprio story e está logado */}
            {isLoggedIn && !isOwnStory ? (
              <div className="flex-1 flex items-center gap-2 px-4 py-3 rounded-full bg-black/40 backdrop-blur-sm border border-white/20">
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Responder..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onFocus={handleInputFocus}
                  onKeyDown={handleReplyKeyDown}
                  className="flex-1 bg-transparent text-white placeholder-white/50 focus:outline-none text-sm"
                  maxLength={500}
                />
                {replyText.trim() && (
                  <button
                    onClick={handleSendReply}
                    disabled={sendingReply}
                    className="p-1.5 rounded-full bg-primary text-white disabled:opacity-50 transition-all flex-shrink-0"
                    aria-label="Enviar resposta"
                  >
                    {sendingReply
                      ? <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      : <Send className="w-4 h-4" />}
                  </button>
                )}
              </div>
            ) : (
              <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-full bg-black/40 backdrop-blur-sm border border-white/20">
                {!isLoggedIn ? (
                  <Link to="/auth" className="flex-1 text-white/50 text-sm">Entra para responder</Link>
                ) : (
                  <span className="flex-1 text-white/30 text-sm italic">O teu próprio story</span>
                )}
              </div>
            )}

            {/* Like */}
            <button
              onClick={handleLike}
              disabled={!isLoggedIn}
              className={`p-3 rounded-full transition-all ${isLiked ? 'bg-red-500 text-white' : 'bg-black/40 text-white hover:bg-red-500 disabled:opacity-50'}`}
            >
              <Heart className={`w-6 h-6 ${isLiked ? 'fill-white' : ''}`} />
            </button>
          </div>
        </div>

        {/* Navegação */}
        {currentIndex > 0 && (
          <button
            onClick={onPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-all"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}
        {currentIndex < stories.length - 1 && (
          <button
            onClick={onNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-all"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>
    </div>
  );
}

export default StoriesPage;
