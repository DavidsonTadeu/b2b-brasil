import { Link } from 'react-router-dom';
import { Cpu, Shirt, Wrench, UtensilsCrossed, Package, Building2, Car, FlaskConical, Sofa, Heart, Tractor, Grid3X3 } from 'lucide-react';

const categories = [
  { name: 'Eletrônicos', icon: Cpu, color: 'bg-blue-100 text-blue-700' },
  { name: 'Têxtil e Confecção', icon: Shirt, color: 'bg-pink-100 text-pink-700' },
  { name: 'Máquinas e Equipamentos', icon: Wrench, color: 'bg-orange-100 text-orange-700' },
  { name: 'Alimentos e Bebidas', icon: UtensilsCrossed, color: 'bg-green-100 text-green-700' },
  { name: 'Embalagens', icon: Package, color: 'bg-purple-100 text-purple-700' },
  { name: 'Construção Civil', icon: Building2, color: 'bg-amber-100 text-amber-700' },
  { name: 'Automotivo', icon: Car, color: 'bg-red-100 text-red-700' },
  { name: 'Químicos', icon: FlaskConical, color: 'bg-teal-100 text-teal-700' },
  { name: 'Móveis e Decoração', icon: Sofa, color: 'bg-indigo-100 text-indigo-700' },
  { name: 'Saúde e Beleza', icon: Heart, color: 'bg-rose-100 text-rose-700' },
  { name: 'Agronegócio', icon: Tractor, color: 'bg-lime-100 text-lime-700' },
  { name: 'Outros', icon: Grid3X3, color: 'bg-gray-100 text-gray-700' },
];

export default function CategoryGrid() {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
      {categories.map((cat) => {
        const Icon = cat.icon;
        return (
          <Link
            key={cat.name}
            to={`/?category=${encodeURIComponent(cat.name)}`}
            className="flex flex-col items-center gap-2 p-4 rounded-xl bg-card border border-border hover:border-primary/30 hover:shadow-md transition-all duration-200 group"
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${cat.color} group-hover:scale-110 transition-transform`}>
              <Icon className="h-5 w-5" />
            </div>
            <span className="text-xs text-center font-medium leading-tight">{cat.name}</span>
          </Link>
        );
      })}
    </div>
  );
}