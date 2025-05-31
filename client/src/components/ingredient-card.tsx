import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X, Check } from "lucide-react";
import { type Ingredient } from "@shared/schema";

interface IngredientCardProps {
  ingredient: Ingredient;
  isSelected?: boolean;
  onToggle?: () => void;
  onDelete: () => void;
}

export default function IngredientCard({ 
  ingredient, 
  isSelected = false, 
  onToggle, 
  onDelete 
}: IngredientCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'fresh':
        return 'bg-eco-fresh';
      case 'expiring':
        return 'bg-eco-expiring';
      case 'expired':
        return 'bg-eco-expired';
      default:
        return 'bg-slate-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'fresh':
        return 'Fresco';
      case 'expiring':
        return 'Por caducar';
      case 'expired':
        return 'Caducado';
      default:
        return 'Desconocido';
    }
  };

  const getDaysUntilExpiry = () => {
    if (!ingredient.expiryDate) return null;
    const now = new Date();
    const expiry = new Date(ingredient.expiryDate);
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysLeft = getDaysUntilExpiry();

  return (
    <Card 
      className={`p-4 relative group hover:shadow-md transition-all cursor-pointer ${
        isSelected ? 'ring-2 ring-eco-primary bg-eco-primary/5' : ''
      }`}
      onClick={onToggle}
    >
      {/* Status indicator */}
      <div className={`absolute top-2 right-2 w-3 h-3 rounded-full ${getStatusColor(ingredient.status)}`} />
      
      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute top-2 left-2 w-6 h-6 bg-eco-primary rounded-full flex items-center justify-center">
          <Check size={12} className="text-white" />
        </div>
      )}

      {/* Delete button */}
      <Button
        size="sm"
        variant="ghost"
        className="absolute top-2 left-2 w-6 h-6 p-0 bg-slate-100 hover:bg-slate-200 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
      >
        <X size={12} className="text-slate-600" />
      </Button>

      {/* Ingredient image placeholder */}
      <div className="w-full h-24 bg-slate-100 rounded-lg mb-3 flex items-center justify-center">
        {ingredient.imageUrl ? (
          <img 
            src={ingredient.imageUrl} 
            alt={ingredient.name}
            className="w-full h-full object-cover rounded-lg"
          />
        ) : (
          <div className="text-2xl">🥗</div>
        )}
      </div>

      {/* Ingredient info */}
      <h4 className="font-medium text-slate-900 text-sm mb-1 truncate">
        {ingredient.name}
      </h4>
      <p className="text-xs text-slate-500 mb-2">
        {ingredient.quantity}
      </p>
      <p className={`text-xs font-medium ${
        ingredient.status === 'fresh' ? 'text-emerald-600' : 
        ingredient.status === 'expiring' ? 'text-amber-600' : 
        'text-red-600'
      }`}>
        {getStatusText(ingredient.status)}
        {daysLeft !== null && (
          <span>
            {daysLeft > 0 ? ` - ${daysLeft} días` : 
             daysLeft === 0 ? ' - Hoy' : 
             ' - Caducado'}
          </span>
        )}
      </p>
    </Card>
  );
}
