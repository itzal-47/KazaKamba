import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, Phone, MapPin, ChevronDown, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { signUp, signIn, createProfile } from '../lib/api';
import { PROVINCIAS, MUNICIPIOS } from '../types';

type AuthMode = 'login' | 'register';

export function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [provincia, setProvincia] = useState('');
  const [municipio, setMunicipio] = useState('');
  const [bairro, setBairro] = useState('');

  useEffect(() => {
    setMunicipio('');
  }, [provincia]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'register') {
        if (!nome || !telefone || !provincia || !municipio || !bairro) {
          setError('Preencha todos os campos obrigatórios');
          setLoading(false);
          return;
        }

        const { user } = await signUp(email, password, {
          nome,
          telefone,
          provincia,
          municipio,
          bairro,
        });

        if (user) {
          const user1 = await supabase.auth.getUser();
          if (user1.data.user) {
            await createProfile({
              id: user1.data.user.id,
              email,
              nome,
              telefone,
              provincia,
              municipio,
              bairro,
              verificado: false,
            });
          }
          navigate('/confirm-email');
        }
      } else {
        await signIn(email, password);
        navigate('/feed');
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao processar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Link>

        <div className="p-8 rounded-3xl bg-gradient-to-b from-background-card to-background border border-white/10 backdrop-blur-xl">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">
              {mode === 'login' ? 'Entrar no KazaKamba' : 'Criar Conta'}
            </h1>
            <p className="text-white/60">
              {mode === 'login'
                ? 'Entre para conectar com Angola'
                : 'Junte-se à comunidade Angola'}
            </p>
          </div>

          <div className="flex gap-2 p-1 rounded-xl bg-white/5 mb-6">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                mode === 'login'
                  ? 'bg-primary text-white'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Entrar
            </button>
            <button
              onClick={() => setMode('register')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                mode === 'register'
                  ? 'bg-primary text-white'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Registar
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <>
                <div>
                  <label className="block text-white/70 text-sm mb-2">Nome Completo *</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                    <input
                      type="text"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      placeholder="Seu nome completo"
                      className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-primary/50 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-white/70 text-sm mb-2">WhatsApp *</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                    <input
                      type="tel"
                      value={telefone}
                      onChange={(e) => setTelefone(e.target.value)}
                      placeholder="Ex: 923456789"
                      className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-primary/50 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/70 text-sm mb-2">Província *</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                      <select
                        value={provincia}
                        onChange={(e) => setProvincia(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary/50 transition-all appearance-none"
                      >
                        <option value="" className="bg-background-card">Selecionar</option>
                        {PROVINCIAS.map((p) => (
                          <option key={p.value} value={p.value} className="bg-background-card">
                            {p.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-white/70 text-sm mb-2">Município *</label>
                    <div className="relative">
                      <select
                        value={municipio}
                        onChange={(e) => setMunicipio(e.target.value)}
                        disabled={!provincia}
                        className="w-full pl-4 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary/50 transition-all appearance-none disabled:opacity-50"
                      >
                        <option value="" className="bg-background-card">Selecionar</option>
                        {(MUNICIPIOS[provincia] || []).map((m) => (
                          <option key={m.value} value={m.value} className="bg-background-card">
                            {m.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-white/70 text-sm mb-2">Bairro *</label>
                  <input
                    type="text"
                    value={bairro}
                    onChange={(e) => setBairro(e.target.value)}
                    placeholder="Ex: Maianga"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-primary/50 transition-all"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-white/70 text-sm mb-2">Email *</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-primary/50 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-white/70 text-sm mb-2">Senha *</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-primary/50 transition-all"
                />
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl bg-primary text-white font-semibold hover:shadow-lg hover:shadow-primary/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="animate-pulse">Processando...</span>
              ) : mode === 'login' ? (
                'Entrar'
              ) : (
                'Criar Conta'
              )}
            </button>
          </form>

          {mode === 'login' && (
            <p className="text-center text-white/50 text-sm mt-6">
              Ainda não tem conta?{' '}
              <button
                onClick={() => setMode('register')}
                className="text-primary hover:underline"
              >
                Registe-se aqui
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
