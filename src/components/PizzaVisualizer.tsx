import { PizzaFlavor } from '@/types/pizza-customization';

interface PizzaVisualizerProps {
  flavors: PizzaFlavor[];
}

export default function PizzaVisualizer({ flavors }: PizzaVisualizerProps) {
  const colors = ['#B31B1B', '#FFD700', '#8B4513', '#FF6347', '#FFA500'];
  
  const getSliceColor = (index: number) => {
    return colors[index % colors.length];
  };

  const renderSlices = () => {
    if (flavors.length === 0) {
      return (
        <circle 
          cx="100" 
          cy="100" 
          r="80" 
          fill="#f3f4f6"
          stroke="#e5e7eb"
          strokeWidth="2"
        />
      );
    }

    if (flavors.length === 1) {
      return (
        <circle 
          cx="100" 
          cy="100" 
          r="80" 
          fill={getSliceColor(0)}
          className="animate-scale-in"
        />
      );
    }

    if (flavors.length === 2) {
      return (
        <g>
          <path
            d="M 100 100 L 100 20 A 80 80 0 0 1 100 180 Z"
            fill={getSliceColor(0)}
            className="animate-fade-in"
          />
          <path
            d="M 100 100 L 100 180 A 80 80 0 0 1 100 20 Z"
            fill={getSliceColor(1)}
            className="animate-fade-in"
            style={{ animationDelay: '0.1s' }}
          />
        </g>
      );
    }

    if (flavors.length === 3) {
      return (
        <g>
          <path
            d="M 100 100 L 100 20 A 80 80 0 0 1 169.28 140 Z"
            fill={getSliceColor(0)}
            className="animate-fade-in"
          />
          <path
            d="M 100 100 L 169.28 140 A 80 80 0 0 1 30.72 140 Z"
            fill={getSliceColor(1)}
            className="animate-fade-in"
            style={{ animationDelay: '0.1s' }}
          />
          <path
            d="M 100 100 L 30.72 140 A 80 80 0 0 1 100 20 Z"
            fill={getSliceColor(2)}
            className="animate-fade-in"
            style={{ animationDelay: '0.2s' }}
          />
        </g>
      );
    }

    if (flavors.length === 4) {
      return (
        <g>
          <path
            d="M 100 100 L 100 20 A 80 80 0 0 1 180 100 Z"
            fill={getSliceColor(0)}
            className="animate-fade-in"
          />
          <path
            d="M 100 100 L 180 100 A 80 80 0 0 1 100 180 Z"
            fill={getSliceColor(1)}
            className="animate-fade-in"
            style={{ animationDelay: '0.1s' }}
          />
          <path
            d="M 100 100 L 100 180 A 80 80 0 0 1 20 100 Z"
            fill={getSliceColor(2)}
            className="animate-fade-in"
            style={{ animationDelay: '0.2s' }}
          />
          <path
            d="M 100 100 L 20 100 A 80 80 0 0 1 100 20 Z"
            fill={getSliceColor(3)}
            className="animate-fade-in"
            style={{ animationDelay: '0.3s' }}
          />
        </g>
      );
    }

    return null;
  };

  return (
    <div className="relative w-full max-w-xs mx-auto">
      <svg viewBox="0 0 200 200" className="w-full h-auto drop-shadow-xl">
        {renderSlices()}
        <circle 
          cx="100" 
          cy="100" 
          r="80" 
          fill="none"
          stroke="#333"
          strokeWidth="3"
        />
      </svg>
      
      {flavors.length > 0 && (
        <div className="mt-4 space-y-2">
          {flavors.map((flavor, index) => (
            <div key={flavor.id} className="flex items-center gap-2">
              <div 
                className="w-4 h-4 rounded-full border-2 border-foreground"
                style={{ backgroundColor: getSliceColor(index) }}
              />
              <span className="text-sm font-medium">{flavor.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
