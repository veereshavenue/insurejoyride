
import React, { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MultiStepForm from "@/components/ui/MultiStepForm";
import TravelDetailsForm from "@/components/forms/TravelDetailsForm";
import PersonalInfoForm from "@/components/forms/PersonalInfoForm";
import { TravelDetails, Traveler, InsurancePlan } from "@/types";
import { v4 as uuidv4 } from 'uuid';
import { toast } from "@/components/ui/use-toast";

const Index = () => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  
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
        return <div className="p-4">Insurance Quotes (Step 3)</div>;
      case 3:
        return <div className="p-4">Additional Information Form (Step 4)</div>;
      case 4:
        return <div className="p-4">Review & Confirm (Step 5)</div>;
      case 5:
        return <div className="p-4">Payment Form (Step 6)</div>;
      case 6:
        return <div className="p-4">Purchase Confirmation (Step 7)</div>;
      default:
        return null;
    }
  };

  return (
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
  );
};

export default Index;
