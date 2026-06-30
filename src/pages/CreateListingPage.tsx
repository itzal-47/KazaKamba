import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Upload, X, Image, Check, Loader2, MapPin, ChevronDown } from 'lucide-react';
import type { ListingFormData, ListingType, ListingCondition, PROVINCIAS, MUNICIPIOS } from '../types';
import { getCategories, createListing, getCurrentUser, getProfile } from '../lib/api';
import { PROVINCIAS as PROVINCIAS_LIST, MUNICIPIOS as MUNICIPIOS_MAP } from '../types';

const MAX_PHOTOS = 6;

const LISTING_TYPES: { value: ListingType; label: string; description: string }[] = [
  { value: 'servico', label: 'Serviço', description: 'Trabalhos, profissões, serviços' },
  { value: 'casa', label: 'Casa', description: 'Arrendamento, venda de imóveis' },
  { value: 'mercado', label: 'Mercado', description: 'Produtos novos e usados' },
];

export function CreateListingPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<{ id: string; name: string; slug: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  const [formData, setFormData] = useState<ListingFormData>({
    titulo: '',
    descricao: '',
    tipo: 'servico',
    categoria: '',
    preco: '',
    condicao: null,
    negociavel: false,
    fotos_urls: [],
    video_url: '',
    telefone: '',
    whatsapp: '',
    provincia: '',
    municipio: '',
    bairro: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    getCurrentUser().then((u) => {
      setUser(u);
      if (u) {
        getProfile(u.id).then((p) => {
          setProfile(p);
          if (p) {
            setFormData((prev) => ({
              ...prev,
              provincia: p.provincia || '',
              municipio: p.municipio || '',
              bairro: p.bairro || '',
              telefone: p.telefone || '',
              whatsapp: p.telefone || '',
            }));
          }
        });
      }
    });
    getCategories().then(setCategories);
  }, []);

  useEffect(() => {
    setFormData((prev) => ({ ...prev, municipio: '' }));
  }, [formData.provincia]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const remaining = MAX_PHOTOS - formData.fotos_urls.length;
    const filesToProcess = Array.from(files).slice(0, remaining);

    filesToProcess.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          fotos_urls: [...prev.fotos_urls, reader.result as string].slice(0, MAX_PHOTOS),
        }));
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  };

  const removePhoto = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      fotos_urls: prev.fotos_urls.filter((_, i) => i !== index),
    }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.titulo.trim()) newErrors.titulo = 'Título é obrigatório';
    if (!formData.descricao.trim()) newErrors.descricao = 'Descrição é obrigatória';
    if (!formData.categoria) newErrors.categoria = 'Categoria é obrigatória';
    if (!formData.provincia) newErrors.provincia = 'Província é obrigatória';
    if (!formData.municipio) newErrors.municipio = 'Município é obrigatório';
    if (formData.preco && isNaN(parseFloat(formData.preco))) {
      newErrors.preco = 'Preço deve ser um número válido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (!user) {
      navigate('/auth');
      return;
    }

    setLoading(true);
    try {
      await createListing(formData);
      navigate('/feed');
    } catch (error) {
      console.error('Error creating listing:', error);
      setErrors({ submit: 'Erro ao criar anúncio. Tente novamente.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="mb-8">
          <Link to="/feed" className="text-primary hover:underline text-sm mb-4 inline-block">
            Voltar ao feed
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Publicar Anúncio</h1>
          <p className="text-white/60 mt-2">Preencha os detalhes do seu anúncio</p>
        </div>

        {!user && (
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 mb-6 text-center">
            <p className="text-white/70 mb-4">Precisa de uma conta para publicar anúncios</p>
            <Link
              to="/auth"
              className="inline-block px-6 py-3 rounded-xl bg-primary text-white font-medium hover:shadow-lg hover:shadow-primary/30 transition-all"
            >
              Entrar ou Registar
            </Link>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <h3 className="text-white font-semibold mb-4">Tipo de Anúncio</h3>
            <div className="grid grid-cols-3 gap-3">
              {LISTING_TYPES.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, tipo: type.value })}
                  className={`p-3 rounded-xl border transition-all ${
                    formData.tipo === type.value
                      ? type.value === 'mercado'
                        ? 'bg-mercado/20 border-mercado text-mercado'
                        : 'bg-primary/20 border-primary text-primary'
                      : 'bg-white/5 border-white/10 text-white/70 hover:border-white/20'
                  }`}
                >
                  <p className="font-medium text-sm">{type.label}</p>
                  <p className="text-xs opacity-70 mt-1">{type.description}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <h3 className="text-white font-semibold mb-2">Fotos</h3>
            <p className="text-white/50 text-sm mb-4">Adicione até {MAX_PHOTOS} fotos ({formData.fotos_urls.length}/{MAX_PHOTOS})</p>

            <div className="grid grid-cols-3 gap-3">
              {formData.fotos_urls.map((photo, index) => (
                <div key={index} className="relative aspect-square rounded-xl overflow-hidden bg-background-card">
                  <img src={photo} alt={`Foto ${index + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-red-500 transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {formData.fotos_urls.length < MAX_PHOTOS && (
                <label className="aspect-square rounded-xl border-2 border-dashed border-white/20 hover:border-primary cursor-pointer transition-all flex flex-col items-center justify-center bg-white/5 hover:bg-white/10">
                  <Upload className="w-6 h-6 text-white/40 mb-1" />
                  <span className="text-white/40 text-xs">Adicionar</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {formData.fotos_urls.length === 0 && (
              <p className="text-white/40 text-sm mt-3 flex items-center gap-2">
                <Image className="w-4 h-4" />
                Se não adicionar fotos, usaremos uma imagem padrão
              </p>
            )}

            <div className="mt-4">
              <label className="block text-white/70 text-sm mb-2">URL do Vídeo (opcional)</label>
              <input
                type="text"
                value={formData.video_url}
                onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                placeholder="YouTube ou outro link de vídeo"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-primary/50 transition-all"
              />
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-5">
            <h3 className="text-white font-semibold">Informações</h3>

            <div>
              <label className="block text-white/70 text-sm mb-2">Título *</label>
              <input
                type="text"
                value={formData.titulo}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                placeholder="Ex: Casa 3 quartos para arrendar"
                className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-primary transition-all ${
                  errors.titulo ? 'border-red-500' : 'border-white/10'
                }`}
              />
              {errors.titulo && <p className="text-red-400 text-sm mt-1">{errors.titulo}</p>}
            </div>

            <div>
              <label className="block text-white/70 text-sm mb-2">Categoria *</label>
              <div className="relative">
                <select
                  value={formData.categoria}
                  onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                  className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white focus:outline-none focus:border-primary transition-all appearance-none ${
                    errors.categoria ? 'border-red-500' : 'border-white/10'
                  }`}
                >
                  <option value="" className="bg-background-card">Selecionar categoria</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id} className="bg-background-card">
                      {cat.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 pointer-events-none" />
              </div>
              {errors.categoria && <p className="text-red-400 text-sm mt-1">{errors.categoria}</p>}
            </div>

            {formData.tipo === 'mercado' && (
              <div>
                <label className="block text-white/70 text-sm mb-2">Condição</label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, condicao: 'novo' })}
                    className={`flex-1 py-2.5 rounded-xl border transition-all ${
                      formData.condicao === 'novo'
                        ? 'bg-mercado/20 border-mercado text-mercado'
                        : 'bg-white/5 border-white/10 text-white/70 hover:border-white/20'
                    }`}
                  >
                    Novo
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, condicao: 'usado' })}
                    className={`flex-1 py-2.5 rounded-xl border transition-all ${
                      formData.condicao === 'usado'
                        ? 'bg-mercado/20 border-mercado text-mercado'
                        : 'bg-white/5 border-white/10 text-white/70 hover:border-white/20'
                    }`}
                  >
                    Usado
                  </button>
                </div>
              </div>
            )}

            <div>
              <label className="block text-white/70 text-sm mb-2">Descrição *</label>
              <textarea
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                placeholder="Descreva o que está a oferecer..."
                rows={4}
                className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-primary transition-all resize-none ${
                  errors.descricao ? 'border-red-500' : 'border-white/10'
                }`}
              />
              {errors.descricao && <p className="text-red-400 text-sm mt-1">{errors.descricao}</p>}
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-white/70 text-sm mb-2">Preço (AOA)</label>
                <input
                  type="text"
                  value={formData.preco}
                  onChange={(e) => setFormData({ ...formData, preco: e.target.value })}
                  placeholder="Ex: 50000"
                  className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-primary transition-all ${
                    errors.preco ? 'border-red-500' : 'border-white/10'
                  }`}
                />
                {errors.preco && <p className="text-red-400 text-sm mt-1">{errors.preco}</p>}
              </div>

              <div className="flex items-end">
                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                  <input
                    type="checkbox"
                    checked={formData.negociavel}
                    onChange={(e) => setFormData({ ...formData, negociavel: e.target.checked })}
                    className="sr-only"
                  />
                  <div className={`w-5 h-5 rounded flex items-center justify-center border transition-all ${
                    formData.negociavel ? 'bg-primary border-primary' : 'border-white/30'
                  }`}>
                    {formData.negociavel && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <span className="text-white/70">Negociável</span>
                </label>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-5">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Localização
            </h3>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-white/70 text-sm mb-2">Província *</label>
                <div className="relative">
                  <select
                    value={formData.provincia}
                    onChange={(e) => setFormData({ ...formData, provincia: e.target.value })}
                    className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white focus:outline-none focus:border-primary transition-all appearance-none ${
                      errors.provincia ? 'border-red-500' : 'border-white/10'
                    }`}
                  >
                    <option value="" className="bg-background-card">Selecionar</option>
                    {PROVINCIAS_LIST.map((p) => (
                      <option key={p.value} value={p.value} className="bg-background-card">
                        {p.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 pointer-events-none" />
                </div>
                {errors.provincia && <p className="text-red-400 text-sm mt-1">{errors.provincia}</p>}
              </div>

              <div>
                <label className="block text-white/70 text-sm mb-2">Município *</label>
                <div className="relative">
                  <select
                    value={formData.municipio}
                    onChange={(e) => setFormData({ ...formData, municipio: e.target.value })}
                    disabled={!formData.provincia}
                    className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white focus:outline-none focus:border-primary transition-all appearance-none disabled:opacity-50 ${
                      errors.municipio ? 'border-red-500' : 'border-white/10'
                    }`}
                  >
                    <option value="" className="bg-background-card">Selecionar</option>
                    {(MUNICIPIOS_MAP[formData.provincia] || []).map((m) => (
                      <option key={m.value} value={m.value} className="bg-background-card">
                        {m.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 pointer-events-none" />
                </div>
                {errors.municipio && <p className="text-red-400 text-sm mt-1">{errors.municipio}</p>}
              </div>
            </div>

            <div>
              <label className="block text-white/70 text-sm mb-2">Bairro *</label>
              <input
                type="text"
                value={formData.bairro}
                onChange={(e) => setFormData({ ...formData, bairro: e.target.value })}
                placeholder="Ex: Maianga"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-primary transition-all"
              />
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-5">
            <h3 className="text-white font-semibold">Contacto</h3>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-white/70 text-sm mb-2">Telefone</label>
                <input
                  type="tel"
                  value={formData.telefone}
                  onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                  placeholder="Ex: 923456789"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-primary transition-all"
                />
              </div>

              <div>
                <label className="block text-white/70 text-sm mb-2">WhatsApp</label>
                <input
                  type="tel"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  placeholder="Ex: 923456789"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-primary transition-all"
                />
              </div>
            </div>
          </div>

          {errors.submit && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
              {errors.submit}
            </div>
          )}

          <div className="flex gap-4">
            <Link
              to="/feed"
              className="flex-1 py-4 rounded-xl bg-white/5 border border-white/10 text-white text-center font-medium hover:bg-white/10 transition-all"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={loading || !user}
              className={`flex-1 py-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                formData.tipo === 'mercado'
                  ? 'bg-mercado text-white hover:shadow-lg hover:shadow-mercado/30'
                  : 'bg-primary text-white hover:shadow-lg hover:shadow-primary/30'
              } disabled:opacity-50`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  A publicar...
                </>
              ) : (
                'Publicar Anúncio'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
