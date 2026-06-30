export const CATEGORY_IMAGES: Record<string, string> = {
  saude: 'https://images.pexels.com/photos/4021778/pexels-photo-4021778.jpeg?auto=compress&cs=tinysrgb&w=600',
  tecnologia: 'https://images.pexels.com/photos/1181246/pexels-photo-1181246.jpeg?auto=compress&cs=tinysrgb&w=600',
  servicos: 'https://images.pexels.com/photos/276024/pexels-photo-276024.jpeg?auto=compress&cs=tinysrgb&w=600',
  educacao: 'https://images.pexels.com/photos/5212345/pexels-photo-5212345.jpeg?auto=compress&cs=tinysrgb&w=600',
  casas: 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=600',
  obras: 'https://images.pexels.com/photos/219906/pexels-photo-219906.jpeg?auto=compress&cs=tinysrgb&w=600',
  automovel: 'https://images.pexels.com/photos/3806288/pexels-photo-3806288.jpeg?auto=compress&cs=tinysrgb&w=600',
  moda: 'https://images.pexels.com/photos/996327/pexels-photo-996327.jpeg?auto=compress&cs=tinysrgb&w=600',
  desporto: 'https://images.pexels.com/photos/100582/pexels-photo-100582.jpeg?auto=compress&cs=tinysrgb&w=600',
  alimentacao: 'https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg?auto=compress&cs=tinysrgb&w=600',
  emprego: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=600',
  default: 'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=600',
};

export const CATEGORY_ICONS: Record<string, string> = {
  saude: 'Stethoscope',
  tecnologia: 'Laptop',
  servicos: 'Wrench',
  educacao: 'GraduationCap',
  casas: 'Home',
  obras: 'HardHat',
  automovel: 'Car',
  moda: 'Shirt',
  desporto: 'Dumbbell',
  alimentacao: 'UtensilsCrossed',
  emprego: 'Briefcase',
  default: 'Grid3x3',
};

export function getCategoryImage(categoria: string): string {
  const normalized = categoria?.toLowerCase().trim();
  return CATEGORY_IMAGES[normalized] || CATEGORY_IMAGES.default;
}

export function getCategoryIcon(categoria: string): string {
  const normalized = categoria?.toLowerCase().trim();
  return CATEGORY_ICONS[normalized] || CATEGORY_ICONS.default;
}

export function generateWhatsAppShareLink(title: string, price: string | number | null, url: string): string {
  const priceText = price ? `${price} Kz` : 'preço negociável';
  const message = `🔥 *${title}* por ${priceText}\n\nEncontrei no KazaKamba! 👀\n\n${url}`;
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}

export function generateWhatsAppContactLink(phone: string, title: string, price: string | number | null): string {
  const priceText = price ? `${price} Kz` : 'preço negociável';
  const message = `Olá! Vi o teu anúncio de *${title}* no KazaKamba por ${priceText} e tenho interesse.`;
  return `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
}

export function formatPrice(price: number | null, negociavel: boolean): string {
  if (price === null) return 'Negociável';
  const formatted = new Intl.NumberFormat('pt-AO', {
    style: 'currency',
    currency: 'AOA',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
  return negociavel ? `${formatted} (Negociável)` : formatted;
}

export function timeAgo(date: string): string {
  const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return 'Agora';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d`;
  const months = Math.floor(days / 30);
  return `${months}m`;
}

export function optimizeImageUrl(url: string, dataSaver: boolean): string {
  if (!url) return url;
  if (dataSaver) {
    return url.replace(/w=\d+/, 'w=200').replace(/auto=compress/, 'auto=compress&cs=tinysrgb');
  }
  return url;
}
