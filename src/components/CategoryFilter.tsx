import { HardHat, Laptop, GraduationCap, Home, Wrench, Briefcase, LayoutGrid } from 'lucide-react';
import type { Category } from '../types';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  HardHat,
  Laptop,
  GraduationCap,
  Home,
  Wrench,
  Briefcase,
};

interface Props {
  categories: Category[];
  selected: string;
  onSelect: (slug: string) => void;
}

export function CategoryFilter({ categories, selected, onSelect }: Props) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      <button
        onClick={() => onSelect('all')}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap transition-all ${
          selected === 'all'
            ? 'bg-[#1E90FF] text-white shadow-lg shadow-[#1E90FF]/30'
            : 'bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white'
        }`}
      >
        <LayoutGrid className="w-4 h-4" />
        <span className="text-sm font-medium">Todos</span>
      </button>

      {categories.map((category) => {
        const Icon = iconMap[category.icon] || LayoutGrid;
        return (
          <button
            key={category.id}
            onClick={() => onSelect(category.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap transition-all ${
              selected === category.id
                ? 'bg-[#1E90FF] text-white shadow-lg shadow-[#1E90FF]/30'
                : 'bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span className="text-sm font-medium">{category.name}</span>
          </button>
        );
      })}
    </div>
  );
}
