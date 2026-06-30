import { supabase } from './supabase';
import type { Profile, Listing, Story, Chat, Message, MarketComment, ListingFormData } from '../types';

const IMAGE_PLACEHOLDERS = [
  'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/259588/pexels-photo-259588.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/276724/pexels-photo-276724.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/261101/pexels-photo-261101.jpeg?auto=compress&cs=tinysrgb&w=600',
];

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getProfile(userId?: string): Promise<Profile | null> {
  const id = userId || (await getCurrentUser())?.id;
  if (!id) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function createProfile(profile: Partial<Profile>): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .insert(profile)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateProfile(updates: Partial<Profile>): Promise<Profile> {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', user.id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function signUp(
  email: string,
  password: string,
  metadata: { nome: string; telefone: string; provincia: string; municipio: string; bairro: string }
) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: metadata },
  });

  if (error) throw error;
  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// ─── NOVA: Eliminar conta do utilizador ───────────────────────────────────────
// Remove o perfil da tabela profiles (ON DELETE CASCADE trata os dados ligados)
// e faz sign-out local. A remoção real do utilizador no auth.users deve ser
// feita por uma Edge Function com service_role; aqui apagamos os dados visíveis.
export async function deleteAccount(): Promise<void> {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');

  // 1. Apagar o perfil (em cascata remove listings, stories, chats, etc.)
  const { error: profileError } = await supabase
    .from('profiles')
    .delete()
    .eq('id', user.id);

  if (profileError) throw profileError;

  // 2. Fazer sign-out local (limpa sessão no cliente)
  await supabase.auth.signOut();
}

// ─── Listings ─────────────────────────────────────────────────────────────────

export async function getListings(filters?: {
  tipo?: string;
  categoria?: string;
  provincia?: string;
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<Listing[]> {
  let query = supabase
    .from('listings')
    .select('*, profile:profiles(*)')
    .eq('is_active', true)
    .order('criado_em', { ascending: false });

  if (filters?.tipo && filters.tipo !== 'all') query = query.eq('tipo', filters.tipo);
  if (filters?.categoria && filters.categoria !== 'all') query = query.eq('categoria', filters.categoria);
  if (filters?.provincia && filters.provincia !== 'all') query = query.eq('provincia', filters.provincia);
  if (filters?.search) query = query.or(`titulo.ilike.%${filters.search}%,descricao.ilike.%${filters.search}%`);

  const limit = filters?.limit ?? 20;
  const offset = filters?.offset ?? 0;
  query = query.range(offset, offset + limit - 1);

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function getListingById(id: string): Promise<Listing | null> {
  const { data, error } = await supabase
    .from('listings')
    .select('*, profile:profiles(*)')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;

  if (data) {
    // Incremento atómico (sem race condition)
    await supabase.rpc('increment_listing_views', { listing_id: id });
  }

  return data;
}

export async function createListing(formData: ListingFormData): Promise<Listing> {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');

  const photos =
    formData.fotos_urls.length > 0
      ? formData.fotos_urls
      : [IMAGE_PLACEHOLDERS[Math.floor(Math.random() * IMAGE_PLACEHOLDERS.length)]];

  const { data, error } = await supabase
    .from('listings')
    .insert({
      usuario_id: user.id,
      titulo: formData.titulo,
      descricao: formData.descricao,
      tipo: formData.tipo,
      categoria: formData.categoria,
      preco: formData.preco ? parseFloat(formData.preco) : null,
      condicao: formData.condicao,
      negociavel: formData.negociavel,
      fotos_urls: photos,
      video_url: formData.video_url || null,
      telefone: formData.telefone || null,
      whatsapp: formData.whatsapp || null,
      provincia: formData.provincia,
      municipio: formData.municipio,
      bairro: formData.bairro,
    })
    .select('*, profile:profiles(*)')
    .single();

  if (error) throw error;
  return data;
}

export async function deleteListing(id: string): Promise<void> {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');

  // Filtra por dono — não depende só da RLS (defesa em profundidade)
  const { error } = await supabase
    .from('listings')
    .delete()
    .eq('id', id)
    .eq('usuario_id', user.id);

  if (error) throw error;
}

// ─── Stories ──────────────────────────────────────────────────────────────────

export async function getStories(): Promise<Story[]> {
  const { data, error } = await supabase
    .from('stories')
    .select('*, profile:profiles(*)')
    .gte('criado_em', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
    .order('criado_em', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createStory(
  mediaUrl: string,
  tipo: 'foto' | 'video',
  legenda?: string
): Promise<Story> {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('stories')
    .insert({
      usuario_id: user.id,
      media_url: mediaUrl,
      tipo,
      legenda: legenda || null,
    })
    .select('*, profile:profiles(*)')
    .single();

  if (error) throw error;
  return data;
}

// ─── Chat ─────────────────────────────────────────────────────────────────────

export async function getChats(): Promise<Chat[]> {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('chats')
    .select('*')
    .contains('participantes', [user.id])
    .order('ultimo_message_em', { ascending: false });

  if (error) throw error;
  return data || [];
}

// ─── NOVA: Encontra um chat existente entre dois utilizadores ou cria um novo ─
export async function findOrCreateChat(
  otherUserId: string,
  listingId?: string
): Promise<Chat> {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');

  // Procura um chat que contenha exactamente estes dois participantes
  const { data: existing, error: findError } = await supabase
    .from('chats')
    .select('*')
    .contains('participantes', [user.id, otherUserId])
    .maybeSingle();

  if (findError) throw findError;
  if (existing) return existing as Chat;

  // Não existe — cria novo
  const { data: newChat, error: createError } = await supabase
    .from('chats')
    .insert({
      participantes: [user.id, otherUserId],
      ultimo_message: '',
      ultimo_message_em: new Date().toISOString(),
      listing_id: listingId || null,
    })
    .select('*')
    .single();

  if (createError) throw createError;
  return newChat as Chat;
}

export async function getMessages(chatId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*, sender:profiles!messages_sender_id_fkey(*)')
    .eq('chat_id', chatId)
    .order('criado_em', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function sendMessage(
  chatId: string,
  receiverId: string,
  texto: string,
  listingId?: string
): Promise<Message> {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('messages')
    .insert({
      chat_id: chatId,
      sender_id: user.id,
      receiver_id: receiverId,
      texto,
      listing_context_id: listingId || null,
    })
    .select('*, sender:profiles!messages_sender_id_fkey(*)')
    .single();

  if (error) throw error;

  await supabase
    .from('chats')
    .update({ ultimo_message: texto, ultimo_message_em: new Date().toISOString() })
    .eq('id', chatId);

  return data;
}

// ─── Comentários do Mercado ───────────────────────────────────────────────────

export async function getMarketComments(listingId: string): Promise<MarketComment[]> {
  const { data, error } = await supabase
    .from('market_comments')
    .select('*, profile:profiles(*)')
    .eq('listing_id', listingId)
    .order('criado_em', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function addMarketComment(
  listingId: string,
  texto: string
): Promise<MarketComment> {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('market_comments')
    .insert({ listing_id: listingId, usuario_id: user.id, texto })
    .select('*, profile:profiles(*)')
    .single();

  if (error) throw error;
  return data;
}

// ─── Favoritos ────────────────────────────────────────────────────────────────

export async function getFavorites(): Promise<{ listing: Listing }[]> {
  const user = await getCurrentUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('favorites')
    .select('listing:listings(*, profile:profiles(*))')
    .eq('usuario_id', user.id);

  if (error) throw error;
  return data || [];
}

export async function addFavorite(listingId: string): Promise<void> {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('favorites')
    .insert({ listing_id: listingId, usuario_id: user.id });

  if (error) throw error;
}

export async function removeFavorite(listingId: string): Promise<void> {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('listing_id', listingId)
    .eq('usuario_id', user.id);

  if (error) throw error;
}

export async function isFavorite(listingId: string): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;

  const { data, error } = await supabase
    .from('favorites')
    .select('id')
    .eq('listing_id', listingId)
    .eq('usuario_id', user.id)
    .maybeSingle();

  if (error) throw error;
  return !!data;
}

// ─── Os meus anúncios ─────────────────────────────────────────────────────────

export async function getMyListings(): Promise<Listing[]> {
  const user = await getCurrentUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('listings')
    .select('*, profile:profiles(*)')
    .eq('usuario_id', user.id)
    .order('criado_em', { ascending: false });

  if (error) throw error;
  return data || [];
}

// ─── Categorias ───────────────────────────────────────────────────────────────

export async function getCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order');

  if (error) throw error;
  return data || [];
}
