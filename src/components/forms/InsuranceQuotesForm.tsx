
import React, { useState, useEffect } from "react";
import { generateInsurancePlans } from "@/utils/mockData";
import { differenceInDays } from "date-fns";
import { InsurancePlan } from "@/types";
import PlanCard from "@/components/ui/PlanCard";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { ShieldCheck, Filter, Check } from "lucide-react";

interface InsuranceQuotesFormProps {
  travelDetails: any;
  onSubmit: (selectedPlan: InsurancePlan) => void;
  onBack: () => void;
}

const InsuranceQuotesForm: React.FC<InsuranceQuotesFormProps> = ({ 
  travelDetails, 
  onSubmit,
  onBack 
}) => {
  const [insurancePlans, setInsurancePlans] = useState<InsurancePlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<InsurancePlan | null>(null);
  const [comparedPlans, setComparedPlans] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showComparisonView, setShowComparisonView] = useState(false);

  useEffect(() => {
    // Calculate trip duration
    let duration = 7; // Default duration
    if (travelDetails.startDate && travelDetails.endDate) {
      const start = new Date(travelDetails.startDate);
      const end = new Date(travelDetails.endDate);
      duration = differenceInDays(end, start) + 1;
    }

    // Simulate API call to get insurance plans
    setTimeout(() => {
      const plans = generateInsurancePlans(
        travelDetails.coverageType,
        travelDetails.tripType,
        duration,
        travelDetails.travelers.length
      );
      setInsurancePlans(plans);
      setIsLoading(false);
    }, 1000);
  }, [travelDetails]);

  const handleSelectPlan = (plan: InsurancePlan) => {
    setSelectedPlan(plan);
    toast({
      title: "Plan Selected",
      description: `You selected the ${plan.name} plan.`
    });
  };

  const handleComparePlan = (plan: InsurancePlan) => {
    if (comparedPlans.includes(plan.id)) {
      setComparedPlans(comparedPlans.filter(id => id !== plan.id));
    } else {
      if (comparedPlans.length >= 3) {
        toast({
          title: "Comparison Limit",
          description: "You can compare up to 3 plans. Remove a plan to add a new one.",
          variant: "destructive"
        });
      } else {
        setComparedPlans([...comparedPlans, plan.id]);
      }
    }
  };

  const handleViewDetails = (plan: InsurancePlan) => {
    console.log("View details for plan:", plan.id);
    // This would typically open a modal with detailed plan information
    toast({
      title: "Plan Details",
      description: `Viewing details for ${plan.name} plan.`,
    });
  };

  const handleContinue = () => {
    if (selectedPlan) {
      onSubmit(selectedPlan);
    } else {
      toast({
        title: "No Plan Selected",
        description: "Please select an insurance plan to continue.",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-insurance-blue mb-4"></div>
        <p className="text-gray-500">Generating personalized insurance quotes...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Insurance Quotes</h2>
        <p className="text-gray-500 mt-2">
          Based on your trip details, we've found {insurancePlans.length} plans for you
        </p>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-5 h-5 text-insurance-blue" />
          <span className="text-sm font-medium">
            {insurancePlans.length} plans available for your trip
          </span>
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-1" 
          onClick={() => setShowComparisonView(!showComparisonView)}
        >
          <Filter className="h-4 w-4" />
          {comparedPlans.length > 0 ? `Compare (${comparedPlans.length})` : "Filter & Sort"}
        </Button>
      </div>

      {showComparisonView && comparedPlans.length > 0 ? (
        <div className="bg-gray-50 p-6 rounded-lg mb-6">
          <h3 className="font-semibold mb-4">Plan Comparison</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 pr-4 font-medium">Features</th>
                  {comparedPlans.map(planId => {
                    const plan = insurancePlans.find(p => p.id === planId);
                    return plan ? (
                      <th key={plan.id} className="text-left py-3 px-4 font-medium">
                        {plan.name}
                        <div className="text-gray-500 font-normal">${plan.price}</div>
                      </th>
                    ) : null;
                  })}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-3 pr-4 font-medium">Medical Coverage</td>
                  {comparedPlans.map(planId => {
                    const plan = insurancePlans.find(p => p.id === planId);
                    const medicalBenefit = plan?.benefits.find(b => b.name.includes("Medical"));
                    return (
                      <td key={`${planId}-medical`} className="py-3 px-4">
                        {medicalBenefit?.limit || "Not covered"}
                      </td>
                    );
                  })}
                </tr>
                <tr className="border-b">
                  <td className="py-3 pr-4 font-medium">Trip Cancellation</td>
                  {comparedPlans.map(planId => {
                    const plan = insurancePlans.find(p => p.id === planId);
                    const tripBenefit = plan?.benefits.find(b => b.name.includes("Trip Cancel"));
                    return (
                      <td key={`${planId}-trip`} className="py-3 px-4">
                        {tripBenefit?.limit || "Not covered"}
                      </td>
                    );
                  })}
                </tr>
                <tr className="border-b">
                  <td className="py-3 pr-4 font-medium">Baggage Coverage</td>
                  {comparedPlans.map(planId => {
                    const plan = insurancePlans.find(p => p.id === planId);
                    const baggageBenefit = plan?.benefits.find(b => b.name.includes("Baggage"));
                    return (
                      <td key={`${planId}-baggage`} className="py-3 px-4">
                        {baggageBenefit?.limit || "Not covered"}
                      </td>
                    );
                  })}
                </tr>
                <tr className="border-b">
                  <td className="py-3 pr-4 font-medium">Emergency Evacuation</td>
                  {comparedPlans.map(planId => {
                    const plan = insurancePlans.find(p => p.id === planId);
                    const evacuationBenefit = plan?.benefits.find(b => b.name.includes("Evacuation"));
                    return (
                      <td key={`${planId}-evac`} className="py-3 px-4">
                        {evacuationBenefit?.limit || "Not covered"}
                      </td>
                    );
                  })}
                </tr>
                <tr>
                  <td className="py-3 pr-4"></td>
                  {comparedPlans.map(planId => {
                    const plan = insurancePlans.find(p => p.id === planId);
                    return plan ? (
                      <td key={`${planId}-select`} className="py-3 px-4">
                        <Button 
                          size="sm" 
                          onClick={() => handleSelectPlan(plan)}
                          className={selectedPlan?.id === plan.id ? "bg-insurance-green" : "bg-insurance-blue"}
                        >
                          {selectedPlan?.id === plan.id ? (
                            <>
                              <Check className="w-4 h-4 mr-1" /> Selected
                            </>
                          ) : "Select"}
                        </Button>
                      </td>
                    ) : null;
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {insurancePlans.map(plan => (
            <PlanCard
              key={plan.id}
              plan={plan}
              onSelect={handleSelectPlan}
              onCompare={handleComparePlan}
              onViewDetails={handleViewDetails}
              isSelected={selectedPlan?.id === plan.id}
              isCompared={comparedPlans.includes(plan.id)}
            />
          ))}
        </div>
      )}

      <div className="flex justify-between pt-6">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onBack}
        >
          Back
        </Button>
        <Button 
          type="button" 
          className="bg-insurance-blue hover:bg-insurance-blue/90"
          onClick={handleContinue}
          disabled={!selectedPlan}
        >
          Continue
        </Button>
      </div>
    </div>
  );
};

export default InsuranceQuotesForm;
