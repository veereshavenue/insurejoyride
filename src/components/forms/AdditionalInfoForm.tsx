
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TravelDetails, InsurancePlan, Traveler } from "@/types";
import { Check, Upload, AlertTriangle } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface AdditionalInfoFormProps {
  travelDetails: TravelDetails;
  selectedPlan: InsurancePlan;
  onSubmit: (updatedTravelDetails: TravelDetails) => void;
  onBack: () => void;
}

const AdditionalInfoForm: React.FC<AdditionalInfoFormProps> = ({
  travelDetails,
  selectedPlan,
  onSubmit,
  onBack,
}) => {
  const [currentTravelDetails, setCurrentTravelDetails] = useState<TravelDetails>(travelDetails);
  
  const handlePassportUpload = (travelerIndex: number, file: File | null) => {
    const updatedTravelers = [...currentTravelDetails.travelers];
    
    if (!updatedTravelers[travelerIndex].documents) {
      updatedTravelers[travelerIndex].documents = {};
    }
    
    updatedTravelers[travelerIndex].documents!.passport = file;
    
    setCurrentTravelDetails({
      ...currentTravelDetails,
      travelers: updatedTravelers,
    });
    
    toast({
      title: "Passport Uploaded",
      description: `Passport for ${updatedTravelers[travelerIndex].firstName} uploaded successfully.`,
    });
  };
  
  const handleVisaUpload = (travelerIndex: number, file: File | null) => {
    const updatedTravelers = [...currentTravelDetails.travelers];
    
    if (!updatedTravelers[travelerIndex].documents) {
      updatedTravelers[travelerIndex].documents = {};
    }
    
    updatedTravelers[travelerIndex].documents!.visa = file;
    
    setCurrentTravelDetails({
      ...currentTravelDetails,
      travelers: updatedTravelers,
    });
    
    toast({
      title: "Visa Uploaded",
      description: `Visa for ${updatedTravelers[travelerIndex].firstName} uploaded successfully.`,
    });
  };
  
  const handleBeneficiaryChange = (travelerIndex: number, field: string, value: string) => {
    const updatedTravelers = [...currentTravelDetails.travelers];
    
    if (!updatedTravelers[travelerIndex].beneficiary) {
      updatedTravelers[travelerIndex].beneficiary = {
        name: "",
        relationship: "",
        contactDetails: "",
      };
    }
    
    // Fix the TypeScript error by using type assertion for the field
    if (field === "name" || field === "relationship" || field === "contactDetails") {
      updatedTravelers[travelerIndex].beneficiary![field] = value;
    }
    
    setCurrentTravelDetails({
      ...currentTravelDetails,
      travelers: updatedTravelers,
    });
  };
  
  const handlePassportInfoChange = (travelerIndex: number, field: string, value: string) => {
    const updatedTravelers = [...currentTravelDetails.travelers];
    
    if (!updatedTravelers[travelerIndex].passport) {
      updatedTravelers[travelerIndex].passport = {
        number: "",
        issueDate: "",
        expiryDate: "",
        nationality: "",
      };
    }
    
    // Fix the TypeScript error by using type assertion for the field
    if (field === "number" || field === "issueDate" || field === "expiryDate" || field === "nationality") {
      updatedTravelers[travelerIndex].passport![field] = value;
    }
    
    setCurrentTravelDetails({
      ...currentTravelDetails,
      travelers: updatedTravelers,
    });
  };
  
  const handleFileUpload = (travelerIndex: number, documentType: 'passport' | 'visa', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      if (documentType === 'passport') {
        handlePassportUpload(travelerIndex, file);
      } else {
        handleVisaUpload(travelerIndex, file);
      }
    }
  };
  
  const handleContinue = () => {
    // Check if all required fields are filled
    const missingFields = [];
    
    for (const traveler of currentTravelDetails.travelers) {
      if (!traveler.passport?.number) missingFields.push("Passport Number");
      if (!traveler.passport?.expiryDate) missingFields.push("Passport Expiry Date");
      if (!traveler.beneficiary?.name) missingFields.push("Beneficiary Name");
    }
    
    if (missingFields.length > 0) {
      toast({
        title: "Missing Information",
        description: `Please fill in the following fields: ${missingFields.join(", ")}`,
        variant: "destructive",
      });
      return;
    }
    
    onSubmit(currentTravelDetails);
  };
  
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Additional Information</h2>
        <p className="text-gray-500 mt-2">
          Please provide additional details required for your insurance policy
        </p>
      </div>
      
      <div className="bg-insurance-blue/5 p-5 rounded-lg mb-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-6 w-6 text-insurance-blue flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-medium text-gray-900">Important</h3>
            <p className="text-sm text-gray-600 mt-1">
              The information you provide should match your official documents exactly. Any discrepancies may result in claim rejection or policy cancellation.
            </p>
          </div>
        </div>
      </div>
      
      {currentTravelDetails.travelers.map((traveler, index) => (
        <Card key={traveler.id} className="mb-6">
          <CardContent className="pt-6">
            <h3 className="font-medium text-lg mb-4">
              Traveler {index + 1}: {traveler.firstName} {traveler.lastName}
            </h3>
            
            <div className="space-y-6">
              <div>
                <h4 className="font-medium mb-3">Passport Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Passport Number*
                    </label>
                    <input 
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={traveler.passport?.number || ""}
                      onChange={(e) => handlePassportInfoChange(index, "number", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nationality
                    </label>
                    <input 
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={traveler.passport?.nationality || ""}
                      onChange={(e) => handlePassportInfoChange(index, "nationality", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Issue Date
                    </label>
                    <input 
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={traveler.passport?.issueDate || ""}
                      onChange={(e) => handlePassportInfoChange(index, "issueDate", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Expiry Date*
                    </label>
                    <input 
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={traveler.passport?.expiryDate || ""}
                      onChange={(e) => handlePassportInfoChange(index, "expiryDate", e.target.value)}
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-3">Document Upload</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-dashed border-gray-300 rounded-md p-4">
                    <label className="flex flex-col items-center cursor-pointer">
                      <Upload className="h-8 w-8 text-gray-400 mb-2" />
                      <span className="text-sm font-medium">Upload Passport Copy</span>
                      <span className="text-xs text-gray-500 mt-1">PDF, JPG or PNG (Max 5MB)</span>
                      <input 
                        type="file" 
                        className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileUpload(index, 'passport', e)}
                      />
                      {traveler.documents?.passport && (
                        <div className="mt-2 flex items-center text-xs text-insurance-green">
                          <Check className="h-4 w-4 mr-1" />
                          File uploaded
                        </div>
                      )}
                    </label>
                  </div>
                  
                  <div className="border border-dashed border-gray-300 rounded-md p-4">
                    <label className="flex flex-col items-center cursor-pointer">
                      <Upload className="h-8 w-8 text-gray-400 mb-2" />
                      <span className="text-sm font-medium">Upload Visa (if applicable)</span>
                      <span className="text-xs text-gray-500 mt-1">PDF, JPG or PNG (Max 5MB)</span>
                      <input 
                        type="file" 
                        className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileUpload(index, 'visa', e)}
                      />
                      {traveler.documents?.visa && (
                        <div className="mt-2 flex items-center text-xs text-insurance-green">
                          <Check className="h-4 w-4 mr-1" />
                          File uploaded
                        </div>
                      )}
                    </label>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-3">Beneficiary Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Beneficiary Name*
                    </label>
                    <input 
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={traveler.beneficiary?.name || ""}
                      onChange={(e) => handleBeneficiaryChange(index, "name", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Relationship
                    </label>
                    <input 
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={traveler.beneficiary?.relationship || ""}
                      onChange={(e) => handleBeneficiaryChange(index, "relationship", e.target.value)}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Details
                    </label>
                    <input 
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={traveler.beneficiary?.contactDetails || ""}
                      onChange={(e) => handleBeneficiaryChange(index, "contactDetails", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      
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
        >
          Continue
        </Button>
      </div>
    </div>
  );
};

export default AdditionalInfoForm;

