import { Link } from 'react-router-dom';
import { Heart, Users, Shield, Zap, Target, Rocket, MapPin, Building2, Sparkles } from 'lucide-react';

export function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <section className="relative overflow-hidden bg-gradient-to-b from-background-card to-background py-20">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMxRTkwRkYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-40"></div>

        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Feito em Angola para Angola
          </div>

          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Sobre o <span className="text-primary">KazaKamba</span>
          </h1>
          <p className="text-xl text-accent-gold font-medium mb-8">
            Quem procura encontra. Quem oferece aparece.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="p-8 rounded-3xl bg-gradient-to-b from-background-card to-background border border-white/10 backdrop-blur-xl mb-12">
            <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
              <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-primary/20 to-mercado/20 flex items-center justify-center flex-shrink-0">
                <Building2 className="w-16 h-16 text-primary" />
              </div>
              <div className="text-center md:text-left">
                <p className="text-white/60 text-sm mb-2">Fundador & Criador</p>
                <h3 className="text-2xl font-bold text-white mb-2">José Eduardo Numa Canjo</h3>
                <p className="text-primary font-medium mb-3">Fundador da Empresa EiVORAK</p>
                <div className="flex items-center justify-center md:justify-start gap-2 text-white/70">
                  <MapPin className="w-4 h-4" />
                  <span>Criado no Huambo, Angola</span>
                </div>
              </div>
            </div>
          </div>

          <div className="prose prose-invert prose-lg max-w-none mb-12">
            <p className="text-white/80 text-lg leading-relaxed mb-8">
              O KazaKamba é uma plataforma moderna para Angola que conecta pessoas directamente,
              reduzindo intermediários em serviços, trabalho, casas, oportunidades e negócios locais.
            </p>

            <p className="text-white/80 text-lg leading-relaxed mb-8">
              Não somos apenas um marketplace. Somos uma plataforma para aproximar pessoas —
              aquele que procura uma casa para renda sem intermediário, alguém que precisa de um
              serviço e quer encontrar profissionais próximos, ou quem quer mostrar seus trabalhos
              para conseguir novos clientes.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-16">
            <div className="p-6 rounded-2xl bg-gradient-to-b from-background-card to-background border border-primary/20 hover:border-primary/40 transition-all">
              <Target className="w-10 h-10 text-primary mb-4" />
              <h3 className="text-white font-semibold text-lg mb-2">Nossa Missão</h3>
              <p className="text-white/60">
                Facilitar conexões directas entre angolanos, eliminando barreiras e intermediários
                desnecessários, tornando o mercado mais transparente e acessível para todos.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-b from-background-card to-background border border-mercado/20 hover:border-mercado/40 transition-all">
              <Rocket className="w-10 h-10 text-mercado mb-4" />
              <h3 className="text-white font-semibold text-lg mb-2">Nossa Visão</h3>
              <p className="text-white/60">
                Ser a principal plataforma de conexão local em Angola, onde qualquer pessoa pode
                encontrar oportunidades ou oferecer serviços de forma simples e segura.
              </p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-white mb-8 text-center">Porquê KazaKamba?</h2>

          <div className="grid md:grid-cols-3 gap-6 mb-16">
            <div className="p-6 rounded-2xl bg-gradient-to-b from-background-card to-background border border-white/10 text-center group hover:border-primary/30 transition-all">
              <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/30 transition-colors">
                <Users className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-white font-semibold mb-2">Conexão Directa</h3>
              <p className="text-white/60 text-sm">
                Contacta directamente vendedores e prestadores, sem intermediários ou comissões escondidas
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-b from-background-card to-background border border-white/10 text-center group hover:border-mercado/30 transition-all">
              <div className="w-14 h-14 rounded-xl bg-mercado/20 flex items-center justify-center mx-auto mb-4 group-hover:bg-mercado/30 transition-colors">
                <Shield className="w-7 h-7 text-mercado" />
              </div>
              <h3 className="text-white font-semibold mb-2">Transparência</h3>
              <p className="text-white/60 text-sm">
                Veja fotos reais, preços claros e contactos diretos antes de tomar qualquer decisão
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-b from-background-card to-background border border-white/10 text-center group hover:border-pink-500/30 transition-all">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-600/30 to-pink-500/30 flex items-center justify-center mx-auto mb-4 group-hover:from-purple-600/40 group-hover:to-pink-500/40 transition-colors">
                <Zap className="w-7 h-7 text-pink-400" />
              </div>
              <h3 className="text-white font-semibold mb-2">Simplicidade</h3>
              <p className="text-white/60 text-sm">
                Publique em segundos, encontre em minutos. Interface intuitiva pensada para todos
              </p>
            </div>
          </div>

          <div className="p-8 rounded-2xl bg-gradient-to-r from-primary/10 via-mercado/10 to-background border border-white/10 mb-12">
            <div className="flex items-start gap-4">
              <Heart className="w-8 h-8 text-accent-gold flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-white font-semibold text-lg mb-2">Feito com Amor para Angola</h3>
                <p className="text-white/70">
                  O KazaKamba foi criado pensando nas necessidades específicas do mercado angolano.
                  Entendemos os desafios de encontrar casas, serviços e oportunidades locais, e
                  estamos aqui para tornar isso mais fácil para todos. Desenvolvido no Huambo por
                  José Eduardo Numa Canjo, através da empresa EiVORAK, com o objectivo de
                  fortalecer a economia local e aproximar as pessoas.
                </p>
              </div>
            </div>
          </div>

          <div className="text-center">
            <h3 className="text-xl font-semibold text-white mb-4">Pronto para começar?</h3>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/feed"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-medium hover:shadow-lg hover:shadow-primary/30 transition-all"
              >
                Explorar Anúncios
              </Link>
              <Link
                to="/mercado"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-mercado text-white font-medium hover:shadow-lg hover:shadow-mercado/30 transition-all"
              >
                Ver Mercado
              </Link>
              <Link
                to="/create"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-all"
              >
                Publicar Anúncio
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-background-card border-t border-white/10">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-white/40 text-sm mb-4">
            KazaKamba &copy; {new Date().getFullYear()} — Uma iniciativa da EiVORAK
          </p>
          <p className="text-white/60 text-sm">
            Fundado por José Eduardo Numa Canjo no Huambo, Angola
          </p>
        </div>
      </section>
    </div>
  );
}
