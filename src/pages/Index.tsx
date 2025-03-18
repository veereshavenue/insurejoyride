
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, loading } = useAuth();
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [selectedPlan, setSelectedPlan] = useState<InsurancePlan | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
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

  useEffect(() => {
    // Set loading to false after initial auth check
    setIsLoading(loading);
  }, [loading]);

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
    // Check if the user is authenticated before proceeding to payment
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please sign in to continue with your purchase.",
        variant: "destructive"
      });
      navigate("/auth");
      return;
    }
    
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
        // If we somehow got to payment without auth, redirect to auth
        if (!isAuthenticated) {
          navigate("/auth");
          return null;
        }
        return (
          <PaymentForm
            travelDetails={travelDetails}
            selectedPlan={selectedPlan!}
            onSubmit={handlePaymentComplete}
            onBack={handleBackStep}
            userId={user?.id || ""}
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

  // If there's an error that prevents the app from running
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Application Error</h1>
          <p className="text-gray-700 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-insurance-blue text-white px-4 py-2 rounded hover:bg-insurance-blue/90"
          >
            Reload Application
          </button>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Header />
        <main className="flex-grow pt-24 pb-16">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="bg-white shadow-sm rounded-lg p-6 md:p-8 mb-12">
                {isLoading ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-insurance-blue"></div>
                  </div>
                ) : (
                  <MultiStepForm 
                    steps={steps} 
                    currentStep={currentStep}
                  >
                    {renderStepContent()}
                  </MultiStepForm>
                )}
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
