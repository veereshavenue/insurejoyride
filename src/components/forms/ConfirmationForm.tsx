
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TravelDetails, InsurancePlan } from "@/types";
import { Check, Download, Mail, CalendarClock, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ConfirmationFormProps {
  travelDetails: TravelDetails;
  selectedPlan: InsurancePlan;
}

const ConfirmationForm: React.FC<ConfirmationFormProps> = ({
  travelDetails,
  selectedPlan,
}) => {
  const navigate = useNavigate();
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };
  
  // Generate a random policy number
  const policyNumber = `INS-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;
  
  // Generate purchase date (today)
  const purchaseDate = new Date().toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  
  // Generate a policy document download function
  const handleDownloadPolicy = () => {
    // In a real application, this would generate a PDF or redirect to a document
    alert("Policy document download would start in a real application");
  };
  
  // Function to return to homepage
  const handleReturnHome = () => {
    navigate("/");
  };
  
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="bg-insurance-green text-white rounded-full p-3">
            <Check className="h-10 w-10" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Purchase Confirmed!</h2>
        <p className="text-gray-500 mt-2">
          Your travel insurance policy has been successfully issued
        </p>
      </div>
      
      <Card className="border-insurance-green border-2">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-insurance-green/10 p-2 rounded-full">
                <ShieldCheck className="h-6 w-6 text-insurance-green" />
              </div>
              <div>
                <h3 className="font-medium">{selectedPlan.provider}</h3>
                <p className="text-sm text-gray-500">{selectedPlan.name} Plan</p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
                onClick={handleDownloadPolicy}
              >
                <Download className="h-4 w-4" />
                Download Policy
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
              >
                <Mail className="h-4 w-4" />
                Email Policy
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-500 mb-1">Policy Number</h4>
              <p className="font-medium">{policyNumber}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-500 mb-1">Purchase Date</h4>
              <p className="font-medium">{purchaseDate}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-500 mb-1">Coverage Period</h4>
              <p className="font-medium">
                {formatDate(travelDetails.startDate)} - {formatDate(travelDetails.endDate)}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-500 mb-1">Total Paid</h4>
              <p className="font-medium text-insurance-green">{formatPrice(selectedPlan.price * 1.1)}</p>
            </div>
          </div>
          
          <div className="border-t border-gray-100 pt-6">
            <h3 className="font-medium mb-4">Insured Travelers</h3>
            <div className="space-y-3">
              {travelDetails.travelers.map((traveler, index) => (
                <div 
                  key={traveler.id}
                  className="p-3 border border-gray-200 rounded-lg flex justify-between items-center"
                >
                  <div>
                    <p className="font-medium">
                      {traveler.firstName} {traveler.lastName}
                    </p>
                    <p className="text-sm text-gray-500">
                      {traveler.passport?.nationality || "Not specified"}
                    </p>
                  </div>
                  <div className="text-sm text-gray-500">
                    Traveler {index + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="bg-gray-50 p-6 rounded-lg">
        <div className="flex items-start gap-4">
          <div className="bg-insurance-blue/10 p-2 rounded-full mt-1">
            <CalendarClock className="h-6 w-6 text-insurance-blue" />
          </div>
          <div>
            <h3 className="font-medium">Next Steps</h3>
            <p className="text-sm text-gray-600 mt-1 mb-4">
              Your policy is now active. Here's what you should know:
            </p>
            <ul className="space-y-2">
              <li className="flex items-start gap-2 text-sm">
                <Check className="h-5 w-5 text-insurance-green flex-shrink-0" />
                <span>You'll receive a confirmation email with your policy details and documents.</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <Check className="h-5 w-5 text-insurance-green flex-shrink-0" />
                <span>Save your policy number for future reference when making claims or inquiries.</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <Check className="h-5 w-5 text-insurance-green flex-shrink-0" />
                <span>Download the mobile app to access your policy on the go.</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <Check className="h-5 w-5 text-insurance-green flex-shrink-0" />
                <span>For emergency assistance while traveling, call the 24/7 helpline at +1-800-TRAVEL-INS.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="flex justify-center pt-6">
        <Button
          className="bg-insurance-blue hover:bg-insurance-blue/90"
          onClick={handleReturnHome}
        >
          Return to Home
        </Button>
      </div>
    </div>
  );
};

export default ConfirmationForm;
