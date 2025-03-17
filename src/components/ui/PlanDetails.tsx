
import React from "react";
import { ChevronLeft, Check, X, AlertCircle } from "lucide-react";
import { InsurancePlan } from "@/types";

interface PlanDetailsProps {
  plan: InsurancePlan;
  onBack: () => void;
  onSelect: (plan: InsurancePlan) => void;
}

const PlanDetails: React.FC<PlanDetailsProps> = ({
  plan,
  onBack,
  onSelect,
}) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-insurance-blue font-medium hover:underline mb-4"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to All Plans
        </button>
        
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div>
            <h1 className="text-2xl font-bold">{plan.name}</h1>
            <p className="text-gray-500">{plan.provider}</p>
            
            <div className="mt-4 flex items-center gap-4">
              <div className="text-3xl font-bold text-insurance-blue">
                {formatPrice(plan.price)}
              </div>
              
              {plan.badge && (
                <span className={`badge ${
                  plan.badge === "Best Value" 
                  ? "badge-green" 
                  : plan.badge === "Premium" 
                  ? "badge-gold" 
                  : "badge-blue"
                }`}>
                  {plan.badge}
                </span>
              )}
            </div>
          </div>
          
          <button
            onClick={() => onSelect(plan)}
            className="bg-insurance-blue text-white py-3 px-6 rounded-lg font-medium hover:bg-insurance-blue/90 transition-colors"
          >
            Select This Plan
          </button>
        </div>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-lg font-semibold mb-4">Benefits</h2>
            <div className="space-y-4">
              {plan.benefits.map((benefit) => (
                <div key={benefit.name} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{benefit.name}</h3>
                    {benefit.isHighlighted && (
                      <span className="badge badge-green text-xs">Highlighted</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{benefit.description}</p>
                  <div className="mt-2 text-insurance-blue font-medium">{benefit.limit}</div>
                </div>
              ))}
            </div>
            
            <div className="mt-8">
              <h2 className="text-lg font-semibold mb-4">Pros & Cons</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-insurance-green-light p-4 rounded-lg">
                  <h3 className="font-medium text-insurance-green mb-2">Pros</h3>
                  <ul className="space-y-2">
                    {plan.pros.map((pro, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-insurance-green flex-shrink-0 mt-0.5" />
                        <span>{pro}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="bg-insurance-red-light p-4 rounded-lg">
                  <h3 className="font-medium text-insurance-red mb-2">Cons</h3>
                  <ul className="space-y-2">
                    {plan.cons.map((con, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <X className="w-4 h-4 text-insurance-red flex-shrink-0 mt-0.5" />
                        <span>{con}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <div className="bg-gray-50 p-5 rounded-lg">
              <h2 className="text-lg font-semibold mb-4">Terms & Conditions</h2>
              <p className="text-sm text-gray-600 whitespace-pre-line">
                {plan.terms}
              </p>
            </div>
            
            <div className="mt-6 bg-insurance-red-light p-5 rounded-lg">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-insurance-red" />
                <span>Exclusions</span>
              </h2>
              <ul className="space-y-2">
                {plan.exclusions.map((exclusion, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <X className="w-4 h-4 text-insurance-red flex-shrink-0 mt-0.5" />
                    <span>{exclusion}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="mt-6 p-5 border border-gray-200 rounded-lg">
              <h2 className="text-lg font-semibold mb-4">Coverage Overview</h2>
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <span className="text-sm font-medium">Coverage Limit</span>
                <span className="text-sm">{plan.coverageLimit}</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <span className="text-sm font-medium">Rating</span>
                <span className="text-sm">{plan.rating.toFixed(1)} / 5.0</span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="text-sm font-medium">Total Premium</span>
                <span className="text-sm font-bold text-insurance-blue">{formatPrice(plan.price)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanDetails;
