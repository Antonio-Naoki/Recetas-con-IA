import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Leaf, Menu, X, Bell, User } from "lucide-react";

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-eco-primary rounded-lg flex items-center justify-center">
              <Leaf className="text-white" size={16} />
            </div>
            <h1 className="text-xl font-bold text-eco-primary">EcoRecetas</h1>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <a 
              href="#dashboard" 
              className="text-eco-primary font-medium border-b-2 border-eco-primary pb-4 transition-colors"
            >
              Dashboard
            </a>
            <a 
              href="#ingredients" 
              className="text-slate-600 hover:text-eco-primary transition-colors pb-4"
            >
              Mis Ingredientes
            </a>
            <a 
              href="#recipes" 
              className="text-slate-600 hover:text-eco-primary transition-colors pb-4"
            >
              Recetas
            </a>
            <a 
              href="#planner" 
              className="text-slate-600 hover:text-eco-primary transition-colors pb-4"
            >
              Planificador
            </a>
          </nav>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="text-slate-600 hover:text-eco-primary">
              <Bell size={18} />
            </Button>
            <div className="w-8 h-8 bg-eco-secondary rounded-full flex items-center justify-center">
              <User className="text-slate-700" size={16} />
            </div>
            
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden text-slate-600"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-slate-200 py-4">
            <nav className="flex flex-col space-y-2">
              <a 
                href="#dashboard" 
                className="text-eco-primary font-medium px-3 py-2 rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </a>
              <a 
                href="#ingredients" 
                className="text-slate-600 hover:text-eco-primary px-3 py-2 rounded-md transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Mis Ingredientes
              </a>
              <a 
                href="#recipes" 
                className="text-slate-600 hover:text-eco-primary px-3 py-2 rounded-md transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Recetas
              </a>
              <a 
                href="#planner" 
                className="text-slate-600 hover:text-eco-primary px-3 py-2 rounded-md transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Planificador
              </a>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
