
import React from "react";
import { X, Check, AlertCircle, ChevronRight } from "lucide-react";
import { InsurancePlan } from "@/types";

interface ComparePlansProps {
  plans: InsurancePlan[];
  onSelect: (plan: InsurancePlan) => void;
  onClose: () => void;
}

const ComparePlans: React.FC<ComparePlansProps> = ({
  plans,
  onSelect,
  onClose,
}) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  // Create a deduplicated list of all benefit names across all plans
  const allBenefitNames = Array.from(
    new Set(
      plans.flatMap((plan) => 
        plan.benefits.map((benefit) => benefit.name)
      )
    )
  );

  return (
    <div className="bg-white rounded-xl shadow-xl overflow-hidden">
      <div className="flex items-center justify-between bg-insurance-blue text-white p-4">
        <h2 className="text-lg font-semibold">Plan Comparison</h2>
        <button
          onClick={onClose}
          className="p-1 rounded-full hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <div className="min-w-max">
          <div className="grid" style={{ gridTemplateColumns: `220px repeat(${plans.length}, minmax(240px, 1fr))` }}>
            {/* Header row */}
            <div className="border-b border-gray-200 p-4 font-medium bg-gray-50">
              Features
            </div>
            
            {plans.map((plan) => (
              <div 
                key={plan.id} 
                className="border-b border-gray-200 p-4 bg-gray-50"
              >
                <div className="text-lg font-semibold">{plan.name}</div>
                <div className="text-sm text-gray-500">{plan.provider}</div>
                <div className="mt-2 text-2xl font-bold text-insurance-blue">
                  {formatPrice(plan.price)}
                </div>
                <button
                  onClick={() => onSelect(plan)}
                  className="mt-3 w-full bg-insurance-blue text-white py-2 rounded-lg font-medium hover:bg-insurance-blue/90 transition-colors"
                >
                  Select Plan
                </button>
              </div>
            ))}
            
            {/* Coverage limit row */}
            <div className="border-b border-gray-200 p-4 flex items-center font-medium">
              Coverage Limit
            </div>
            
            {plans.map((plan) => (
              <div 
                key={`${plan.id}-limit`} 
                className="border-b border-gray-200 p-4"
              >
                {plan.coverageLimit}
              </div>
            ))}
            
            {/* Benefits rows */}
            {allBenefitNames.map((benefitName) => (
              <React.Fragment key={benefitName}>
                <div className="border-b border-gray-200 p-4 flex items-center">
                  {benefitName}
                </div>
                
                {plans.map((plan) => {
                  const benefit = plan.benefits.find(b => b.name === benefitName);
                  return (
                    <div 
                      key={`${plan.id}-${benefitName}`} 
                      className="border-b border-gray-200 p-4"
                    >
                      {benefit ? (
                        <div className="flex items-center">
                          {benefit.limit}
                          {benefit.isHighlighted && (
                            <span className="ml-2 inline-block w-3 h-3 bg-insurance-green rounded-full"></span>
                          )}
                        </div>
                      ) : (
                        <X className="w-5 h-5 text-insurance-red/70" />
                      )}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
            
            {/* Pros rows */}
            <div className="border-b border-gray-200 p-4 flex items-center font-medium">
              Pros
            </div>
            
            {plans.map((plan) => (
              <div 
                key={`${plan.id}-pros`} 
                className="border-b border-gray-200 p-4"
              >
                <ul className="space-y-2">
                  {plan.pros.map((pro, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-insurance-green flex-shrink-0 mt-0.5" />
                      <span>{pro}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            
            {/* Cons rows */}
            <div className="border-b border-gray-200 p-4 flex items-center font-medium">
              Cons
            </div>
            
            {plans.map((plan) => (
              <div 
                key={`${plan.id}-cons`} 
                className="border-b border-gray-200 p-4"
              >
                <ul className="space-y-2">
                  {plan.cons.map((con, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <AlertCircle className="w-4 h-4 text-insurance-red/70 flex-shrink-0 mt-0.5" />
                      <span>{con}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="bg-gray-50 p-4 flex justify-end">
        <button
          onClick={onClose}
          className="flex items-center gap-1 text-insurance-blue font-medium hover:underline"
        >
          Back to All Plans <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default ComparePlans;
