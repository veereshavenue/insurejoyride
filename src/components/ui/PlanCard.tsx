
import React from "react";
import { Check, ChevronRight, Info, Star } from "lucide-react";
import { InsurancePlan } from "@/types";
import { cn } from "@/lib/utils";

interface PlanCardProps {
  plan: InsurancePlan;
  onSelect: (plan: InsurancePlan) => void;
  onCompare: (plan: InsurancePlan) => void;
  onViewDetails: (plan: InsurancePlan) => void;
  isSelected?: boolean;
  isCompared?: boolean;
}

const PlanCard: React.FC<PlanCardProps> = ({
  plan,
  onSelect,
  onCompare,
  onViewDetails,
  isSelected = false,
  isCompared = false,
}) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };
  
  const getBadgeClass = (badge?: string) => {
    if (!badge) return "";
    switch (badge) {
      case "Popular":
        return "badge-blue";
      case "Best Value":
        return "badge-green";
      case "Premium":
        return "badge-gold";
      default:
        return "badge-blue";
    }
  };

  return (
    <div 
      className={cn(
        "glass-card rounded-xl overflow-hidden transition-all duration-300 hover-scale",
        isSelected ? "ring-2 ring-insurance-blue ring-offset-2" : "",
        isCompared ? "border-insurance-blue/50" : ""
      )}
    >
      {plan.badge && (
        <div className="bg-gradient-to-r from-insurance-blue to-insurance-blue/80 text-white py-1.5 px-4 text-xs font-medium text-center">
          {plan.badge} Plan
        </div>
      )}
      
      <div className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold">{plan.name}</h3>
            <p className="text-sm text-gray-500">{plan.provider}</p>
          </div>
          <div 
            className={cn(
              "badge",
              getBadgeClass(plan.badge)
            )}
          >
            {plan.badge || "Standard"}
          </div>
        </div>
        
        <div className="mt-4 flex justify-between items-baseline">
          <div className="text-2xl font-bold text-insurance-blue">
            {formatPrice(plan.price)}
          </div>
          <div className="flex items-center text-sm">
            {Array.from({ length: Math.floor(plan.rating) }).map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-insurance-gold text-insurance-gold" />
            ))}
            {plan.rating % 1 > 0 && (
              <Star className="w-4 h-4 fill-insurance-gold/50 text-insurance-gold" />
            )}
            <span className="ml-1 text-gray-500">{plan.rating.toFixed(1)}</span>
          </div>
        </div>
        
        <div className="mt-5 space-y-3">
          <p className="text-sm font-medium">Key Benefits:</p>
          <ul className="space-y-2">
            {plan.benefits.slice(0, 3).map((benefit) => (
              <li key={benefit.name} className="flex items-start gap-2 text-sm">
                <Check className="w-4 h-4 text-insurance-green flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-medium">{benefit.name}:</span> {benefit.limit}
                </div>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="mt-6 flex flex-col gap-3">
          <button
            onClick={() => onSelect(plan)}
            className={cn(
              "w-full py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors",
              isSelected 
                ? "bg-insurance-green text-white hover:bg-insurance-green/90" 
                : "bg-insurance-blue text-white hover:bg-insurance-blue/90"
            )}
          >
            {isSelected ? "Selected" : "Select This Plan"}
          </button>
          
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => onCompare(plan)}
              className={cn(
                "py-2 rounded-lg font-medium text-sm flex items-center justify-center gap-1 transition-colors",
                isCompared
                  ? "bg-insurance-blue/10 text-insurance-blue border border-insurance-blue/30"
                  : "border border-gray-200 hover:border-insurance-blue/30 hover:bg-insurance-blue/5"
              )}
            >
              {isCompared ? "In Comparison" : "Compare"}
            </button>
            
            <button
              onClick={() => onViewDetails(plan)}
              className="py-2 rounded-lg font-medium text-sm border border-gray-200 flex items-center justify-center gap-1 hover:border-insurance-blue/30 hover:bg-insurance-blue/5 transition-colors"
            >
              View Details
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanCard;
