import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';

export function EmailConfirmationPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md text-center">
        <div className="p-8 rounded-3xl bg-gradient-to-b from-background-card to-background border border-white/10 backdrop-blur-xl">
          <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
            <div className="w-14 h-14 rounded-full bg-primary/30 flex items-center justify-center">
              <Mail className="w-7 h-7 text-primary" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-white mb-4">
            Verifique o seu Email
          </h1>

          <p className="text-white/70 mb-6">
            Enviamos um link de confirmação para o seu email. Clique no link para activar a sua conta e começar a usar o KazaKamba.
          </p>

          <div className="p-4 rounded-xl bg-mercado/10 border border-mercado/20 mb-6">
            <div className="flex items-center justify-center gap-2 text-mercado">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Email enviado com sucesso!</span>
            </div>
          </div>

          <p className="text-white/50 text-sm mb-6">
            Não recebeu o email? Verifique a pasta de spam ou lixo electrónico.
          </p>

          <div className="space-y-3">
            <Link
              to="/auth"
              className="block w-full py-3 rounded-xl bg-primary text-white font-medium hover:shadow-lg hover:shadow-primary/30 transition-all"
            >
              Tentar outro email
            </Link>

            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 text-white/60 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar ao início
            </Link>
          </div>
        </div>

        <p className="text-white/40 text-sm mt-8">
          Após confirmar o email, pode fazer login na plataforma.
        </p>
      </div>
    </div>
  );
}
