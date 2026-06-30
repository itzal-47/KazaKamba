export interface Profile {
  id: string;
  email: string;
  telefone: string;
  nome: string;
  provincia: string;
  municipio: string;
  bairro: string;
  foto_url: string | null;
  verificado: boolean;
  criado_em: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  sort_order: number;
}

export type ListingType = 'servico' | 'casa' | 'mercado';
export type ListingCondition = 'novo' | 'usado' | null;

export interface Listing {
  id: string;
  usuario_id: string;
  tipo: ListingType;
  titulo: string;
  descricao: string;
  preco: number | null;
  condicao: ListingCondition;
  categoria: string;
  fotos_urls: string[];
  video_url: string | null;
  provincia: string;
  municipio: string;
  bairro: string;
  telefone: string | null;
  whatsapp: string | null;
  negociavel: boolean;
  curtidas_count: number;
  visualizacoes: number;
  is_active: boolean;
  criado_em: string;
  updated_at: string;
  profile?: Profile;
}

export interface MarketComment {
  id: string;
  listing_id: string;
  usuario_id: string;
  texto: string;
  reply_to?: string | null;
  criado_em: string;
  profile?: Profile;
}

export interface Story {
  id: string;
  usuario_id: string;
  media_url: string;
  tipo: 'foto' | 'video';
  legenda?: string;
  curtidas: number;
  criado_em: string;
  profile?: Profile;
  is_viewed?: boolean;
}

export interface Message {
  id: string;
  chat_id: string;
  sender_id: string;
  receiver_id: string;
  texto: string;
  listing_context_id: string | null;
  lida: boolean;
  criado_em: string;
  sender?: Profile;
}

export interface Chat {
  id: string;
  participantes: string[];
  ultimo_message: string;
  ultimo_message_em: string;
  listing_id?: string;
  listing?: Listing;
  other_user?: Profile;
}

export interface Favorite {
  id: string;
  listing_id: string;
  usuario_id: string;
  listing?: Listing;
  criado_em: string;
}

export type ListingFormData = {
  titulo: string;
  descricao: string;
  tipo: ListingType;
  categoria: string;
  preco: string;
  condicao: ListingCondition;
  negociavel: boolean;
  fotos_urls: string[];
  video_url: string;
  telefone: string;
  whatsapp: string;
  provincia: string;
  municipio: string;
  bairro: string;
};

export type AuthFormData = {
  email: string;
  password: string;
  nome?: string;
  telefone?: string;
  provincia?: string;
  municipio?: string;
  bairro?: string;
};

export const PROVINCIAS = [
  { value: 'luanda', label: 'Luanda' },
  { value: 'huambo', label: 'Huambo' },
  { value: 'benguela', label: 'Benguela' },
  { value: 'huila', label: 'Huíla' },
  { value: 'cabinda', label: 'Cabinda' },
  { value: 'cuza', label: 'Cuanza Norte' },
  { value: 'cuzasul', label: 'Cuanza Sul' },
  { value: 'namibe', label: 'Namibe' },
  { value: 'uige', label: 'Uíge' },
  { value: 'malange', label: 'Malanje' },
  { value: 'moxico', label: 'Moxico' },
  { value: 'cuando', label: 'Cuando Cubango' },
  { value: 'lende', label: 'Lunda Norte' },
  { value: 'lendasul', label: 'Lunda Sul' },
  { value: 'cunene', label: 'Cunene' },
  { value: 'zaire', label: 'Zaire' },
  { value: 'bie', label: 'Bié' },
];

export const MUNICIPIOS: Record<string, { value: string; label: string }[]> = {
  luanda: [
    { value: 'luanda', label: 'Luanda' },
    { value: 'viana', label: 'Viana' },
    { value: 'cacuaco', label: 'Cacuaco' },
    { value: 'cambambe', label: 'Cambambe' },
    { value: 'caxito', label: 'Caxito' },
    { value: 'icolo', label: 'Icolo e Bengo' },
    { value: 'kissama', label: 'Kissama' },
    { value: 'mussulo', label: 'Mussulo' },
  ],
  huambo: [
    { value: 'huambo', label: 'Huambo' },
    { value: 'caala', label: 'Caála' },
    { value: 'longonjo', label: 'Longonjo' },
    { value: 'catabola', label: 'Catabola' },
    { value: 'bailundo', label: 'Bailundo' },
    { value: 'chicala', label: 'Chicala-Cholohanga' },
    { value: 'chinjenje', label: 'Chinjenje' },
    { value: 'ekunha', label: 'Ekunha' },
    { value: 'hungui', label: 'Hungui' },
    { value: 'londuimbali', label: 'Londuimbali' },
    { value: 'mungo', label: 'Mungo' },
  ],
  benguela: [
    { value: 'benguela', label: 'Benguela' },
    { value: 'lobito', label: 'Lobito' },
    { value: 'catumbela', label: 'Catumbela' },
    { value: 'baiafarta', label: 'Baía Farta' },
    { value: 'bocoio', label: 'Bocoio' },
    { value: 'balombo', label: 'Balombo' },
    { value: 'cubal', label: 'Cubal' },
    { value: 'chongoroi', label: 'Chongoroi' },
    { value: 'caimbambo', label: 'Caimbambo' },
    { value: 'ganda', label: 'Ganda' },
  ],
  huila: [
    { value: 'lubango', label: 'Lubango' },
    { value: 'cuvango', label: 'Cuvango' },
    { value: 'chipindo', label: 'Chipindo' },
    { value: 'ganguela', label: 'Ganguela' },
    { value: 'caconda', label: 'Caconda' },
    { value: 'cacula', label: 'Cacula' },
    { value: 'caluquembe', label: 'Caluquembe' },
    { value: 'kuvati', label: 'Kuvati' },
    { value: 'jamba', label: 'Jamba' },
    { value: 'matala', label: 'Matala' },
    { value: 'quipungo', label: 'Quipungo' },
  ],
};
