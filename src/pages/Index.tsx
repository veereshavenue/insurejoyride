
import React, { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MultiStepForm from "@/components/ui/MultiStepForm";
import TravelDetailsForm from "@/components/forms/TravelDetailsForm";
import PersonalInfoForm from "@/components/forms/PersonalInfoForm";
import InsuranceQuotesForm from "@/components/forms/InsuranceQuotesForm";
import AdditionalInfoForm from "@/components/forms/AdditionalInfoForm";
import ReviewConfirmation from "@/components/ui/ReviewConfirmation";
import PaymentForm from "@/components/forms/PaymentForm";
import ConfirmationForm from "@/components/forms/ConfirmationForm";
import { TravelDetails, Traveler, InsurancePlan } from "@/types";
import { v4 as uuidv4 } from 'uuid';
import { toast } from "@/components/ui/use-toast";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/react-query";
import { supabase } from "@/lib/supabase";

const Index = () => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [selectedPlan, setSelectedPlan] = useState<InsurancePlan | null>(null);
  const [userId, setUserId] = useState<string>(""); // Will be set when user authenticates
  
  // Define the steps for our multi-step form
  const steps = [
    { id: "travel-details", label: "Travel Details" },
    { id: "personal-info", label: "Personal Information" },
    { id: "quotes", label: "Insurance Quotes" },
    { id: "additional-info", label: "Additional Information" },
    { id: "review", label: "Review & Confirm" },
    { id: "payment", label: "Payment" },
    { id: "confirmation", label: "Confirmation" }
  ];

  // Initialize form state
  const [travelDetails, setTravelDetails] = useState<TravelDetails>({
    coverageType: "Worldwide",
    originCountry: "",
    destinationCountry: "",
    tripType: "Single Trip",
    startDate: new Date().toISOString().split('T')[0],
    endDate: "",
    coverType: "Individual",
    travelers: [
      {
        id: uuidv4(),
        firstName: "",
        lastName: "",
        dateOfBirth: "",
        phone: "",
        email: "",
      }
    ]
  });

  // Check for Supabase auth session on load
  React.useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) {
        setUserId(session.user.id);
      }
    };
    
    checkSession();
    
    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user?.id) {
          setUserId(session.user.id);
        } else {
          setUserId("");
        }
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Handle form submissions for each step
  const handleTravelDetailsSubmit = (data: TravelDetails) => {
    setTravelDetails(data);
    setCurrentStep(1);
    toast({
      title: "Travel details saved",
      description: "Your travel information has been updated."
    });
  };

  const handlePersonalInfoSubmit = (data: TravelDetails) => {
    setTravelDetails(data);
    setCurrentStep(2);
    toast({
      title: "Personal information saved",
      description: "Your personal details have been updated."
    });
  };

  const handleInsuranceQuoteSelect = (plan: InsurancePlan) => {
    setSelectedPlan(plan);
    setCurrentStep(3);
    toast({
      title: "Insurance plan selected",
      description: `You've selected the ${plan.name} plan.`
    });
  };
  
  const handleAdditionalInfoSubmit = (data: TravelDetails) => {
    setTravelDetails(data);
    setCurrentStep(4);
    toast({
      title: "Additional information saved",
      description: "Your additional details have been updated."
    });
  };
  
  const handleEditSection = (section: string) => {
    if (section.startsWith("traveler-")) {
      setCurrentStep(1); // Go to personal info step
    } else if (section === "travel-details") {
      setCurrentStep(0); // Go to travel details step
    } else if (section === "plan") {
      setCurrentStep(2); // Go to quotes step
    }
  };
  
  const handleReviewConfirm = () => {
    setCurrentStep(5); // Proceed to payment
  };
  
  const handlePaymentComplete = () => {
    setCurrentStep(6); // Proceed to confirmation
  };

  const handleBackStep = () => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  };

  // Render the appropriate form based on the current step
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <TravelDetailsForm 
            initialValues={travelDetails} 
            onSubmit={handleTravelDetailsSubmit} 
          />
        );
      case 1:
        return (
          <PersonalInfoForm 
            travelDetails={travelDetails}
            onSubmit={handlePersonalInfoSubmit}
            onBack={handleBackStep}
          />
        );
      case 2:
        return (
          <InsuranceQuotesForm 
            travelDetails={travelDetails}
            onSubmit={handleInsuranceQuoteSelect}
            onBack={handleBackStep}
          />
        );
      case 3:
        return (
          <AdditionalInfoForm
            travelDetails={travelDetails}
            selectedPlan={selectedPlan!}
            onSubmit={handleAdditionalInfoSubmit}
            onBack={handleBackStep}
          />
        );
      case 4:
        return (
          <ReviewConfirmation
            travelDetails={travelDetails}
            selectedPlan={selectedPlan!}
            onProceed={handleReviewConfirm}
            onEdit={handleEditSection}
          />
        );
      case 5:
        return (
          <PaymentForm
            travelDetails={travelDetails}
            selectedPlan={selectedPlan!}
            onSubmit={handlePaymentComplete}
            onBack={handleBackStep}
            userId={userId}
          />
        );
      case 6:
        return (
          <ConfirmationForm
            travelDetails={travelDetails}
            selectedPlan={selectedPlan!}
          />
        );
      default:
        return null;
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Header />
        <main className="flex-grow pt-24 pb-16">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="bg-white shadow-sm rounded-lg p-6 md:p-8">
                <MultiStepForm 
                  steps={steps} 
                  currentStep={currentStep}
                >
                  {renderStepContent()}
                </MultiStepForm>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </QueryClientProvider>
  );
};

export default Index;
