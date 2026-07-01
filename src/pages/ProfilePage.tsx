import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User, FileText, Heart, Clock, ChevronRight, Plus, Settings, LogOut,
  ShoppingBag, Moon, Sun, Wifi, Mail, Save, CheckCircle, AlertCircle,
  ChevronDown, MapPin, Phone, Trash2, Palette,
} from 'lucide-react';
import { ListingCard } from '../components/ListingCard';
import type { Listing, Profile } from '../types';
import { getMyListings, getFavorites, getProfile, signOut, updateProfile, createProfile, deleteAccount } from '../lib/api';
import { supabase } from '../lib/supabase';
import { useAppSettings } from '../lib/AppContext';
import type { ThemeMode } from '../lib/AppContext';
import { PROVINCIAS, MUNICIPIOS } from '../types';

type Tab = 'listings' | 'favorites' | 'history';
type SettingsSection = 'profile' | 'tema' | 'data' | 'suggestions' | 'conta';

export function ProfilePage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('listings');
  const [myListings, setMyListings] = useState<Listing[]>([]);
  const [favorites, setFavorites] = useState<{ listing: Listing }[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [settingsSection, setSettingsSection] = useState<SettingsSection>('profile');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const { dataSaver, setDataSaver, theme, setTheme, isDark } = useAppSettings();

  // Edição de perfil
  const [editNome, setEditNome] = useState('');
  const [editTelefone, setEditTelefone] = useState('');
  const [editProvincia, setEditProvincia] = useState('');
  const [editMunicipio, setEditMunicipio] = useState('');
  const [editBairro, setEditBairro] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sugestões
  const [suggestionText, setSuggestionText] = useState('');
  const [sendingSuggestion, setSendingSuggestion] = useState(false);
  const [suggestionSent, setSuggestionSent] = useState(false);

  // ─── Carrega dados do utilizador após sessão confirmada ──────────────────
  const loadUserData = async (userId: string) => {
    setLoading(true);
    try {
      let p = await getProfile(userId);

      // Se o perfil não existe ainda (ex: primeiro login após confirmação de email),
      // tenta criá-lo com os metadados do Supabase Auth
      if (!p) {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        const meta = authUser?.user_metadata || {};
        try {
          p = await createProfile({
            id: userId,
            email: authUser?.email || '',
            nome: meta.nome || meta.name || 'Utilizador',
            telefone: meta.telefone || '',
            provincia: meta.provincia || '',
            municipio: meta.municipio || '',
            bairro: meta.bairro || '',
            verificado: false,
          });
        } catch {
          // Perfil já existe — corrida de criação — tenta buscar de novo
          p = await getProfile(userId);
        }
      }

      if (p) {
        setProfile(p);
        setEditNome(p.nome || '');
        setEditTelefone(p.telefone || '');
        setEditProvincia(p.provincia || '');
        setEditMunicipio(p.municipio || '');
        setEditBairro(p.bairro || '');
      }

      const [listings, favs] = await Promise.all([getMyListings(), getFavorites()]);
      setMyListings(listings);
      setFavorites(favs);
    } catch (err) {
      console.error('Erro ao carregar perfil:', err);
    } finally {
      setLoading(false);
    }
  };

  // Escuta mudanças de sessão em tempo real (confirmação de email, refresh de token, etc.)
  useEffect(() => {
    // Estado inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        loadUserData(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Escuta mudanças (SIGNED_IN, TOKEN_REFRESHED, SIGNED_OUT)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) {
        loadUserData(u.id);
      } else {
        setProfile(null);
        setMyListings([]);
        setFavorites([]);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => { setEditMunicipio(''); }, [editProvincia]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    setSaveSuccess(false);
    try {
      const updated = await updateProfile({
        nome: editNome,
        telefone: editTelefone,
        provincia: editProvincia,
        municipio: editMunicipio,
        bairro: editBairro,
      });
      setProfile(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Erro ao guardar perfil:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleSendSuggestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!suggestionText.trim()) return;
    setSendingSuggestion(true);
    await new Promise((r) => setTimeout(r, 800));
    console.log('Sugestão:', suggestionText);
    setSuggestionSent(true);
    setSendingSuggestion(false);
    setSuggestionText('');
    setTimeout(() => setSuggestionSent(false), 5000);
  };

  const handleDeleteAccount = async () => {
    setDeletingAccount(true);
    setDeleteError(null);
    try {
      await deleteAccount();
      navigate('/');
    } catch (err: any) {
      setDeleteError(err?.message || 'Erro ao eliminar a conta. Tenta novamente.');
      setDeletingAccount(false);
    }
  };

  const tabs = [
    { id: 'listings' as const, label: 'Meus Anúncios', icon: FileText, count: myListings.length },
    { id: 'favorites' as const, label: 'Favoritos', icon: Heart, count: favorites.length },
    { id: 'history' as const, label: 'Histórico', icon: Clock },
  ];

  const themes: { id: ThemeMode; label: string; desc: string; icon: typeof Sun }[] = [
    { id: 'branco', label: 'Branco', desc: 'Modo claro — fundo branco', icon: Sun },
    { id: 'preto',  label: 'Preto',  desc: 'Modo escuro — fundo azul-noite', icon: Moon },
    { id: 'kamba',  label: 'Modo Kamba', desc: 'Segue o tema do dispositivo', icon: Palette },
  ];

  // ─── Não logado ───────────────────────────────────────────────────────────
  if (!user && !loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center max-w-md p-8 rounded-2xl bg-white/5 border border-white/10">
          <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
            <User className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Aceda à sua conta</h2>
          <p className="text-white/60 mb-6">Inicie sessão para ver o seu perfil, anúncios e favoritos</p>
          <Link to="/auth" className="inline-block px-8 py-3 rounded-xl bg-primary text-white font-medium hover:shadow-lg hover:shadow-primary/30 transition-all">
            Entrar ou Registar
          </Link>
        </div>
      </div>
    );
  }

  // ─── Modal de Definições ──────────────────────────────────────────────────
  if (showSettings) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <button
            onClick={() => setShowSettings(false)}
            className="flex items-center gap-2 text-white/70 hover:text-white mb-6 transition-colors"
          >
            <ChevronRight className="w-5 h-5 rotate-180" />
            Voltar ao Perfil
          </button>
          <h1 className="text-2xl font-bold text-white mb-6">Definições</h1>

          <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
            {([
              { id: 'profile',     label: 'Perfil',     icon: User },
              { id: 'tema',        label: 'Tema',        icon: Palette },
              { id: 'data',        label: 'Dados',       icon: Wifi },
              { id: 'suggestions', label: 'Sugestões',   icon: Mail },
              { id: 'conta',       label: 'Conta',       icon: Trash2 },
            ] as const).map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setSettingsSection(id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap transition-all ${
                  settingsSection === id
                    ? id === 'conta' ? 'bg-red-500 text-white' : 'bg-primary text-white'
                    : id === 'conta' ? 'bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20'
                               : 'bg-white/5 border border-white/10 text-white/70 hover:bg-white/10'
                }`}
              >
                <Icon className="w-4 h-4" />{label}
              </button>
            ))}
          </div>

          {/* ── Perfil ─────────────────────────────────────────────────── */}
          {settingsSection === 'profile' && (
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-5">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2"><User className="w-5 h-5" />Gestão de Perfil</h2>

              <div>
                <label className="block text-white/70 text-sm mb-2">Nome Completo</label>
                <input type="text" value={editNome} onChange={(e) => setEditNome(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-primary/50"
                  placeholder="Seu nome" />
              </div>

              <div>
                <label className="block text-white/70 text-sm mb-2 flex items-center gap-2"><Phone className="w-4 h-4" />WhatsApp / Telefone</label>
                <input type="tel" value={editTelefone} onChange={(e) => setEditTelefone(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-primary/50"
                  placeholder="Ex: 923456789" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/70 text-sm mb-2">Província</label>
                  <div className="relative">
                    <select value={editProvincia} onChange={(e) => setEditProvincia(e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary appearance-none">
                      <option value="" className="bg-[#0F2B48]">Selecionar</option>
                      {PROVINCIAS.map((p) => <option key={p.value} value={p.value} className="bg-[#0F2B48]">{p.label}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-white/70 text-sm mb-2">Município</label>
                  <div className="relative">
                    <select value={editMunicipio} onChange={(e) => setEditMunicipio(e.target.value)} disabled={!editProvincia}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary appearance-none disabled:opacity-50">
                      <option value="" className="bg-[#0F2B48]">Selecionar</option>
                      {(MUNICIPIOS[editProvincia] || []).map((m) => <option key={m.value} value={m.value} className="bg-[#0F2B48]">{m.label}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-white/70 text-sm mb-2">Bairro</label>
                <input type="text" value={editBairro} onChange={(e) => setEditBairro(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-primary/50"
                  placeholder="Ex: Maianga" />
              </div>

              <button onClick={handleSaveProfile} disabled={saving}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-white font-medium hover:shadow-lg hover:shadow-primary/30 transition-all disabled:opacity-50">
                {saving ? <><div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />A guardar...</> : <><Save className="w-5 h-5" />Guardar Alterações</>}
              </button>
              {saveSuccess && <div className="flex items-center gap-2 text-green-400 text-sm"><CheckCircle className="w-4 h-4" />Perfil actualizado!</div>}
            </div>
          )}

          {/* ── Tema ───────────────────────────────────────────────────── */}
          {settingsSection === 'tema' && (
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-5">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2"><Palette className="w-5 h-5" />Aparência</h2>
              <p className="text-white/60 text-sm">Escolhe como o KazaKamba aparece no teu dispositivo.</p>
              <div className="space-y-3">
                {themes.map(({ id, label, desc, icon: Icon }) => (
                  <button key={id} onClick={() => setTheme(id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${
                      theme === id ? 'bg-primary/20 border-primary/50 text-white' : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                    }`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${theme === id ? 'bg-primary/30' : 'bg-white/10'}`}>
                      <Icon className={`w-5 h-5 ${theme === id ? 'text-primary' : 'text-white/50'}`} />
                    </div>
                    <div className="text-left flex-1">
                      <p className={`font-medium ${theme === id ? 'text-white' : 'text-white/80'}`}>{label}</p>
                      <p className="text-white/50 text-xs mt-0.5">{desc}</p>
                    </div>
                    {theme === id && <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                <div className={`w-3 h-3 rounded-full flex-shrink-0 ${isDark ? 'bg-neutral-600' : 'bg-yellow-300'}`} />
                <p className="text-white/60 text-sm">Modo actual: <span className="text-white font-medium">{isDark ? 'Escuro' : 'Claro'}</span></p>
              </div>
            </div>
          )}

          {/* ── Dados ──────────────────────────────────────────────────── */}
          {settingsSection === 'data' && (
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-6">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2"><Wifi className="w-5 h-5" />Modo Poupança de Dados</h2>
              <p className="text-white/60 text-sm">Reduz o consumo de dados móveis bloqueando o autoplay de vídeos e reduzindo a qualidade das imagens.</p>
              <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${dataSaver ? 'bg-green-500/20' : 'bg-white/10'}`}>
                    <Wifi className={`w-6 h-6 ${dataSaver ? 'text-green-400' : 'text-white/40'}`} />
                  </div>
                  <div>
                    <p className="text-white font-medium">Data Saver</p>
                    <p className="text-white/50 text-sm">{dataSaver ? 'Activado' : 'Desactivado'}</p>
                  </div>
                </div>
                <button onClick={() => setDataSaver(!dataSaver)}
                  className={`w-14 h-8 rounded-full relative transition-all ${dataSaver ? 'bg-green-500' : 'bg-white/20'}`}>
                  <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all ${dataSaver ? 'left-7' : 'left-1'}`} />
                </button>
              </div>
            </div>
          )}

          {/* ── Sugestões ──────────────────────────────────────────────── */}
          {settingsSection === 'suggestions' && (
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-5">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2"><Mail className="w-5 h-5" />Caixa de Sugestões</h2>
              {suggestionSent ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-400" />
                  </div>
                  <p className="text-white font-medium mb-2">Obrigado pela sua sugestão!</p>
                  <p className="text-white/60 text-sm">A sua ideia foi registada.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <textarea value={suggestionText} onChange={(e) => setSuggestionText(e.target.value)} rows={5}
                    placeholder="Descreva a sua ideia ou sugestão para melhorar o KazaKamba..."
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-primary/50 resize-none" />
                  <button onClick={handleSendSuggestion} disabled={sendingSuggestion || !suggestionText.trim()}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-white font-medium hover:shadow-lg hover:shadow-primary/30 transition-all disabled:opacity-50">
                    {sendingSuggestion ? <><div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />A enviar...</> : <><Mail className="w-5 h-5" />Enviar Sugestão</>}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── Conta (zona perigosa) ──────────────────────────────────── */}
          {settingsSection === 'conta' && (
            <div className="space-y-4">
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-3"><LogOut className="w-5 h-5" />Terminar Sessão</h2>
                <p className="text-white/60 text-sm mb-4">Sai da tua conta neste dispositivo. Os teus dados ficam guardados.</p>
                <button onClick={handleSignOut}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 transition-all">
                  <LogOut className="w-5 h-5" />Terminar Sessão
                </button>
              </div>

              <div className="p-6 rounded-2xl bg-red-500/5 border border-red-500/20">
                <h2 className="text-lg font-semibold text-red-400 flex items-center gap-2 mb-3"><Trash2 className="w-5 h-5" />Eliminar Conta</h2>
                <p className="text-white/60 text-sm mb-4">
                  Esta acção é <strong className="text-red-400">permanente e irreversível</strong>. Todos os teus anúncios,
                  mensagens, stories e dados serão eliminados. Não é possível recuperar a conta.
                </p>
                {!showDeleteConfirm ? (
                  <button onClick={() => setShowDeleteConfirm(true)}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-all">
                    <Trash2 className="w-5 h-5" />Eliminar Conta
                  </button>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30">
                      <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                      <p className="text-red-300 text-sm font-medium">Tens a certeza absoluta? Esta acção não pode ser desfeita.</p>
                    </div>
                    {deleteError && (
                      <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />{deleteError}
                      </div>
                    )}
                    <div className="flex gap-3">
                      <button onClick={() => { setShowDeleteConfirm(false); setDeleteError(null); }} disabled={deletingAccount}
                        className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 transition-all disabled:opacity-50">
                        Cancelar
                      </button>
                      <button onClick={handleDeleteAccount} disabled={deletingAccount}
                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition-all disabled:opacity-50">
                        {deletingAccount ? <><div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />A eliminar...</> : <><Trash2 className="w-5 h-5" />Sim, eliminar</>}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── Vista principal ──────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Cabeçalho do perfil */}
        <div className="p-6 rounded-2xl bg-gradient-to-b from-[#0F2B48] to-background border border-white/10 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                {profile?.foto_url ? (
                  <img src={profile.foto_url} alt={profile.nome} className="w-full h-full rounded-2xl object-cover" />
                ) : (
                  <span className="text-3xl text-primary font-bold">
                    {profile?.nome?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                )}
              </div>
              <div>
                {loading ? (
                  <div className="space-y-2">
                    <div className="h-7 w-40 bg-white/10 rounded animate-pulse" />
                    <div className="h-4 w-28 bg-white/10 rounded animate-pulse" />
                  </div>
                ) : (
                  <>
                    <h1 className="text-2xl font-bold text-white mb-1">
                      {profile?.nome || user?.email?.split('@')[0] || 'Utilizador'}
                    </h1>
                    <div className="flex items-center gap-2 text-white/60 text-sm">
                      <MapPin className="w-4 h-4 flex-shrink-0" />
                      <span>{[profile?.bairro, profile?.municipio, profile?.provincia].filter(Boolean).join(', ') || 'Localização não definida'}</span>
                    </div>
                    {profile?.verificado && (
                      <span className="inline-flex mt-2 px-2 py-0.5 rounded bg-green-500/20 text-green-400 text-xs items-center gap-1">
                        <CheckCircle className="w-3 h-3" />Verificado
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button onClick={() => setShowSettings(true)}
                className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white transition-all"
                aria-label="Definições">
                <Settings className="w-5 h-5" />
              </button>
              <button onClick={handleSignOut}
                className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all"
                aria-label="Terminar sessão">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="text-center p-4 rounded-xl bg-white/5">
              <p className="text-2xl font-bold text-white">{myListings.length}</p>
              <p className="text-white/60 text-sm">Anúncios</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-white/5">
              <p className="text-2xl font-bold text-red-400">{favorites.length}</p>
              <p className="text-white/60 text-sm">Favoritos</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-white/5">
              <p className="text-2xl font-bold text-primary">
                {myListings.reduce((sum, l) => sum + (l.visualizacoes || 0), 0)}
              </p>
              <p className="text-white/60 text-sm">Visualizações</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl whitespace-nowrap transition-all ${
                activeTab === tab.id ? 'bg-primary text-white' : 'bg-white/5 border border-white/10 text-white/70 hover:bg-white/10'
              }`}>
              <tab.icon className="w-4 h-4" />
              <span className="font-medium">{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === tab.id ? 'bg-white/20' : 'bg-white/10'}`}>{tab.count}</span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[4/3] rounded-2xl bg-white/5 mb-4" />
                <div className="h-6 bg-white/5 rounded w-3/4 mb-2" />
                <div className="h-4 bg-white/5 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : activeTab === 'listings' ? (
          myListings.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-6">
              {myListings.map((listing) => <ListingCard key={listing.id} listing={listing} />)}
            </div>
          ) : (
            <div className="text-center py-16 bg-white/5 rounded-2xl border border-white/10">
              <FileText className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Nenhum anúncio ainda</h3>
              <p className="text-white/60 mb-6">Publique o seu primeiro anúncio e comece a conectar com pessoas</p>
              <Link to="/create" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-medium hover:shadow-lg hover:shadow-primary/30 transition-all">
                <Plus className="w-5 h-5" />Publicar Anúncio
              </Link>
            </div>
          )
        ) : activeTab === 'favorites' ? (
          favorites.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-6">
              {favorites.map((fav) => fav.listing && <ListingCard key={fav.listing.id} listing={fav.listing} />)}
            </div>
          ) : (
            <div className="text-center py-16 bg-white/5 rounded-2xl border border-white/10">
              <Heart className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Nenhum favorito ainda</h3>
              <p className="text-white/60 mb-6">Explore e guarde os seus anúncios favoritos</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/feed" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-medium hover:shadow-lg hover:shadow-primary/30 transition-all">
                  Ver Feed <ChevronRight className="w-4 h-4" />
                </Link>
                <Link to="/mercado" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-green-500 text-white font-medium hover:shadow-lg transition-all">
                  <ShoppingBag className="w-5 h-5" />Ver Mercado
                </Link>
              </div>
            </div>
          )
        ) : (
          <div className="text-center py-16 bg-white/5 rounded-2xl border border-white/10">
            <Clock className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Histórico de visualizações</h3>
            <p className="text-white/60">Em breve poderá ver o histórico de anúncios visualizados</p>
          </div>
        )}
      </div>
    </div>
  );
}
