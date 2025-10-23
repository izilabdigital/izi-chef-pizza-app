import { ShoppingCart, User, Home, Utensils } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-pizza.jpg";

const Index = () => {
  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Hero Section */}
      <section className="relative h-[60vh] min-h-[400px] overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImage} alt="Pizza Gourmet" className="w-full h-full object-cover" />
          <div className="absolute inset-0 gradient-overlay" />
        </div>
        <div className="relative h-full flex flex-col items-center justify-center text-center px-4 z-10">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 animate-fade-in-up">
            Izi Chefe
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            A Qualidade de um Chefe, a Facilidade do Izi
          </p>
          <Button variant="gold" size="lg" className="animate-scale-in" style={{ animationDelay: "0.2s" }}>
            🍕 PEDIR AGORA
          </Button>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="px-4 -mt-8 relative z-20">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-3">
          <div className="bg-card rounded-xl p-4 shadow-card hover-lift text-center">
            <Utensils className="w-8 h-8 mx-auto mb-2 text-primary" />
            <p className="text-sm font-semibold">Cardápio</p>
          </div>
          <div className="bg-card rounded-xl p-4 shadow-card hover-lift text-center">
            <ShoppingCart className="w-8 h-8 mx-auto mb-2 text-primary" />
            <p className="text-sm font-semibold">Promoções</p>
          </div>
          <div className="bg-card rounded-xl p-4 shadow-card hover-lift text-center">
            <User className="w-8 h-8 mx-auto mb-2 text-primary" />
            <p className="text-sm font-semibold">Pedidos</p>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="px-4 mt-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">Categorias</h2>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {["Clássicas", "Especiais", "Doces", "Bebidas"].map((cat) => (
              <Button key={cat} variant="outline" className="whitespace-nowrap">
                {cat}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-elevated z-50">
        <div className="max-w-4xl mx-auto px-4 py-3 flex justify-around">
          <button className="flex flex-col items-center gap-1 text-primary">
            <Home className="w-6 h-6" />
            <span className="text-xs font-medium">Início</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-muted-foreground">
            <Utensils className="w-6 h-6" />
            <span className="text-xs">Cardápio</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-muted-foreground">
            <ShoppingCart className="w-6 h-6" />
            <span className="text-xs">Carrinho</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-muted-foreground">
            <User className="w-6 h-6" />
            <span className="text-xs">Perfil</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Index;
