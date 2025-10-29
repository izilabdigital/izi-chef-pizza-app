import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Pizza } from "lucide-react";
import { TicketPercent } from 'lucide-react';
import { PackageOpen } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import heroPizza from "@/assets/hero-pizza.jpg";
import logoizichefe from "@/assets/logoizichefe.png";
import BottomNavigation from "@/components/BottomNavigation";

const Index = () => {
  const navigate = useNavigate();

  return (
    <>
      <div className="min-h-screen bg-background pb-24">
        {/* Hero Section */}
        <section className="relative h-[60vh] min-h-[400px] overflow-hidden">
          <div className="absolute inset-0">
            <img src={heroPizza} alt="Pizza Gourmet" className="w-full h-full object-cover" />
            <div className="absolute inset-0 gradient-overlay" />
          </div>
          <div className="relative h-full flex flex-col items-center justify-center text-center px-4 z-10">
            <img src={logoizichefe} alt="Logo" className="mx-auto w-24 animate-fade-in-up" style={{ animationDelay: "0.1s" }}/>
            <p className="text-xl md:text-2xl text-white/90 mb-8 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
              A Qualidade de um Chefe, a Facilidade do Izi
            </p>
            <Button 
              variant="gold" 
              size="lg" 
              className="animate-scale-in" 
              style={{ animationDelay: "0.2s" }}
              onClick={() => navigate('/menu')}
            >
              🍕 PEDIR AGORA
            </Button>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="px-4 -mt-8 relative z-20">
          <div className="max-w-4xl mx-auto grid grid-cols-3 gap-3">
            <Card 
              className="p-4 hover-lift text-center cursor-pointer"
              onClick={() => navigate('/menu')}
            >
              <Pizza className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="text-sm font-semibold">Cardápio</p>
            </Card>
            <Card 
              className="p-4 hover-lift text-center cursor-pointer"
              onClick={() => navigate('/menu')}
            >
              <TicketPercent className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="text-sm font-semibold">Promoções</p>
            </Card>
            <Card 
              className="p-4 hover-lift text-center cursor-pointer"
              onClick={() => navigate('/order-tracking')}
            >
              <PackageOpen className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="text-sm font-semibold">Pedidos</p>
            </Card>
          </div>
        </section>

        {/* Categories */}
        <section className="px-4 mt-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">Categorias</h2>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {["Clássicas", "Especiais", "Doces", "Bebidas"].map((cat) => (
                <Button 
                  key={cat} 
                  variant="outline" 
                  className="whitespace-nowrap"
                  onClick={() => navigate('/menu')}
                >
                  {cat}
                </Button>
              ))}
            </div>
          </div>
        </section>
      </div>
      <BottomNavigation />
    </>
  );
};

export default Index;
