/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  // "class" → o dark mode é controlado pela classe .dark no <html>
  // (o AppContext aplica essa classe consoante a escolha do utilizador)
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Tokens semânticos — usados em todo o app em vez de cores fixas
        // Modo escuro (padrão / Modo Kamba)
        background: {
          DEFAULT: '#0A192F',
          card: '#0F2B48',
          elevated: '#132F4A',
        },
        primary: {
          DEFAULT: '#1E90FF',
          light: '#4DA6FF',
          dark: '#0077E6',
          50: '#EBF7FF',
          100: '#D7EFFF',
          200: '#AFE0FF',
          300: '#87D1FF',
          400: '#5FC2FF',
          500: '#1E90FF',
          600: '#0077E6',
          700: '#005EB8',
          800: '#00468A',
          900: '#002D5C',
        },
        mercado: {
          DEFAULT: '#10B981',
          light: '#34D399',
          dark: '#059669',
          50: '#ECFDF5',
          100: '#D1FAE5',
          200: '#A7F3D0',
          300: '#6EE7B7',
          400: '#34D399',
          500: '#10B981',
          600: '#059669',
          700: '#047857',
          800: '#065F46',
          900: '#064E3B',
        },
        stories: {
          gradient: 'linear-gradient(135deg, #9333EA 0%, #EC4899 100%)',
          purple: '#9333EA',
          pink: '#EC4899',
        },
        accent: {
          gold: '#D4AF37',
          goldDark: '#B8860B',
        },
        neutral: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
        },
      },
      backgroundImage: {
        'stories-gradient': 'linear-gradient(135deg, #9333EA 0%, #EC4899 100%)',
        'primary-gradient': 'linear-gradient(135deg, #1E90FF 0%, #0077E6 100%)',
        'mercado-gradient': 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
      },
    },
  },
  plugins: [],
};
