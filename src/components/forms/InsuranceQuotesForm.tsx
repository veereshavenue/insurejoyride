
import React, { useState, useEffect } from "react";
import { differenceInDays } from "date-fns";
import { InsurancePlan, TravelDetails } from "@/types";
import PlanCard from "@/components/ui/PlanCard";
import PlanDetails from "@/components/ui/PlanDetails";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { ShieldCheck, Filter, Check, AlertCircle, RefreshCw } from "lucide-react";
import { getInsuranceQuotes, getPlanDetails } from "@/services/insurance";
import { useQuery } from "@tanstack/react-query";

interface InsuranceQuotesFormProps {
  travelDetails: TravelDetails;
  onSubmit: (selectedPlan: InsurancePlan) => void;
  onBack: () => void;
}

const InsuranceQuotesForm: React.FC<InsuranceQuotesFormProps> = ({ 
  travelDetails, 
  onSubmit,
  onBack 
}) => {
  const [selectedPlan, setSelectedPlan] = useState<InsurancePlan | null>(null);
  const [comparedPlans, setComparedPlans] = useState<string[]>([]);
  const [showComparisonView, setShowComparisonView] = useState(false);
  const [viewingPlanDetails, setViewingPlanDetails] = useState<InsurancePlan | null>(null);
  
  const { data: insurancePlans = [], isLoading, error, refetch } = useQuery({
    queryKey: ['insuranceQuotes', travelDetails],
    queryFn: async () => {
      console.log('Fetching insurance quotes with travel details:', JSON.stringify(travelDetails, null, 2));
      try {
        const quotes = await getInsuranceQuotes(travelDetails);
        console.log('Received insurance quotes:', JSON.stringify(quotes, null, 2));
        return quotes;
      } catch (err) {
        console.error('Error in queryFn:', err);
        throw err;
      }
    },
    enabled: !!travelDetails.startDate && !!travelDetails.endDate,
    retry: 2,
  });

  const { data: planDetailsData, isLoading: isPlanDetailsLoading } = useQuery({
    queryKey: ['planDetails', viewingPlanDetails?.id],
    queryFn: () => viewingPlanDetails ? getPlanDetails(viewingPlanDetails.id) : null,
    enabled: !!viewingPlanDetails,
  });

  useEffect(() => {
    if (planDetailsData && viewingPlanDetails) {
      setViewingPlanDetails(planDetailsData);
    }
  }, [planDetailsData]);

  // If there's an error or no plans are returned, show a helpful message
  useEffect(() => {
    if (error) {
      toast({
        title: "Error loading insurance quotes",
        description: "There was a problem loading insurance quotes. Please try again.",
        variant: "destructive"
      });
      console.error('Query error:', error);
    } else if (!isLoading && (!insurancePlans || insurancePlans.length === 0)) {
      toast({
        title: "No insurance plans found",
        description: "We couldn't find any insurance plans matching your criteria.",
        variant: "destructive"
      });
    }
  }, [error, isLoading, insurancePlans]);

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
    setViewingPlanDetails(plan);
  };

  const handleBackFromDetails = () => {
    setViewingPlanDetails(null);
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
        <p className="text-xs text-gray-400 mt-2">This may take a few moments</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-insurance-red mx-auto mb-4" />
        <p className="text-insurance-red mb-4">There was an error loading insurance quotes.</p>
        <pre className="text-xs text-gray-500 bg-gray-100 p-2 rounded mb-4 max-w-xl mx-auto overflow-auto">
          {error instanceof Error ? error.message : 'Unknown error'}
        </pre>
        <Button onClick={() => refetch()} className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Try Again
        </Button>
      </div>
    );
  }

  if (!insurancePlans || insurancePlans.length === 0) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
        <p className="text-gray-700 mb-4">No insurance plans found for your search criteria.</p>
        <div className="flex justify-center gap-4">
          <Button variant="outline" onClick={onBack}>
            Modify Search
          </Button>
          <Button onClick={() => refetch()} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Retry Search
          </Button>
        </div>
      </div>
    );
  }

  if (viewingPlanDetails && isPlanDetailsLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-insurance-blue mb-4"></div>
        <p className="text-gray-500">Loading plan details...</p>
      </div>
    );
  }

  if (viewingPlanDetails) {
    return (
      <PlanDetails 
        plan={viewingPlanDetails} 
        onBack={handleBackFromDetails} 
        onSelect={(plan) => {
          handleSelectPlan(plan);
          handleBackFromDetails();
        }}
      />
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
