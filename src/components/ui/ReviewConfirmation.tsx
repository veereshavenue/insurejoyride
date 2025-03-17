
import React from "react";
import { Check, ShieldCheck } from "lucide-react";
import { TravelDetails, InsurancePlan, Traveler } from "@/types";

interface ReviewConfirmationProps {
  travelDetails: TravelDetails;
  selectedPlan: InsurancePlan;
  onProceed: () => void;
  onEdit: (section: string) => void;
}

const ReviewConfirmation: React.FC<ReviewConfirmationProps> = ({
  travelDetails,
  selectedPlan,
  onProceed,
  onEdit,
}) => {
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

  const renderTravelerInfo = (traveler: Traveler, index: number) => (
    <div key={traveler.id} className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
      <div className="flex justify-between items-start">
        <h3 className="font-medium text-lg">
          {traveler.firstName} {traveler.lastName}
        </h3>
        <span className="text-sm text-gray-500">Traveler {index + 1}</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 mt-4">
        <div>
          <h4 className="text-sm font-medium text-gray-500">Personal Information</h4>
          <div className="space-y-2 mt-2">
            <div className="grid grid-cols-2">
              <span className="text-sm text-gray-500">Date of Birth:</span>
              <span className="text-sm">{formatDate(traveler.dateOfBirth)}</span>
            </div>
            <div className="grid grid-cols-2">
              <span className="text-sm text-gray-500">Phone:</span>
              <span className="text-sm">{traveler.phone || "—"}</span>
            </div>
            <div className="grid grid-cols-2">
              <span className="text-sm text-gray-500">Email:</span>
              <span className="text-sm">{traveler.email || "—"}</span>
            </div>
            <div className="grid grid-cols-2">
              <span className="text-sm text-gray-500">Emergency Contact:</span>
              <span className="text-sm">{traveler.emergencyContact || "—"}</span>
            </div>
            <div className="grid grid-cols-2">
              <span className="text-sm text-gray-500">Address:</span>
              <span className="text-sm">{traveler.address || "—"}</span>
            </div>
          </div>
        </div>
        
        <div>
          <h4 className="text-sm font-medium text-gray-500">Passport Information</h4>
          <div className="space-y-2 mt-2">
            <div className="grid grid-cols-2">
              <span className="text-sm text-gray-500">Number:</span>
              <span className="text-sm">{traveler.passport?.number || "—"}</span>
            </div>
            <div className="grid grid-cols-2">
              <span className="text-sm text-gray-500">Issue Date:</span>
              <span className="text-sm">{traveler.passport?.issueDate ? formatDate(traveler.passport.issueDate) : "—"}</span>
            </div>
            <div className="grid grid-cols-2">
              <span className="text-sm text-gray-500">Expiry Date:</span>
              <span className="text-sm">{traveler.passport?.expiryDate ? formatDate(traveler.passport.expiryDate) : "—"}</span>
            </div>
            <div className="grid grid-cols-2">
              <span className="text-sm text-gray-500">Nationality:</span>
              <span className="text-sm">{traveler.passport?.nationality || "—"}</span>
            </div>
          </div>
          
          <h4 className="text-sm font-medium text-gray-500 mt-4">Beneficiary</h4>
          <div className="space-y-2 mt-2">
            <div className="grid grid-cols-2">
              <span className="text-sm text-gray-500">Name:</span>
              <span className="text-sm">{traveler.beneficiary?.name || "—"}</span>
            </div>
            <div className="grid grid-cols-2">
              <span className="text-sm text-gray-500">Relationship:</span>
              <span className="text-sm">{traveler.beneficiary?.relationship || "—"}</span>
            </div>
            <div className="grid grid-cols-2">
              <span className="text-sm text-gray-500">Contact:</span>
              <span className="text-sm">{traveler.beneficiary?.contactDetails || "—"}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-100">
        <h4 className="text-sm font-medium text-gray-500">Uploaded Documents</h4>
        <div className="grid grid-cols-2 gap-4 mt-2">
          <div>
            <span className="text-sm text-gray-500">Passport:</span>
            <span className="text-sm ml-2">
              {traveler.documents?.passport ? (
                <span className="text-insurance-green">Uploaded</span>
              ) : (
                <span className="text-insurance-red">Not uploaded</span>
              )}
            </span>
          </div>
          <div>
            <span className="text-sm text-gray-500">Visa:</span>
            <span className="text-sm ml-2">
              {traveler.documents?.visa ? (
                <span className="text-insurance-green">Uploaded</span>
              ) : (
                <span className="text-insurance-red">Not uploaded</span>
              )}
            </span>
          </div>
        </div>
      </div>
      
      <button
        onClick={() => onEdit(`traveler-${index}`)}
        className="mt-4 text-sm text-insurance-blue hover:underline"
      >
        Edit Details
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold">Trip Details</h2>
            <p className="text-gray-500">Review your travel information</p>
          </div>
          <button
            onClick={() => onEdit("travel-details")}
            className="text-sm text-insurance-blue hover:underline"
          >
            Edit
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 mt-6">
          <div>
            <span className="text-sm text-gray-500">Coverage Type</span>
            <p className="font-medium">{travelDetails.coverageType}</p>
          </div>
          <div>
            <span className="text-sm text-gray-500">Trip Type</span>
            <p className="font-medium">{travelDetails.tripType}</p>
          </div>
          <div>
            <span className="text-sm text-gray-500">Origin Country</span>
            <p className="font-medium">{travelDetails.originCountry}</p>
          </div>
          <div>
            <span className="text-sm text-gray-500">Destination Country</span>
            <p className="font-medium">{travelDetails.destinationCountry}</p>
          </div>
          <div>
            <span className="text-sm text-gray-500">Departure Date</span>
            <p className="font-medium">{formatDate(travelDetails.startDate)}</p>
          </div>
          <div>
            <span className="text-sm text-gray-500">Return Date</span>
            <p className="font-medium">{formatDate(travelDetails.endDate)}</p>
          </div>
          <div>
            <span className="text-sm text-gray-500">Cover Type</span>
            <p className="font-medium">{travelDetails.coverType}</p>
          </div>
          <div>
            <span className="text-sm text-gray-500">Number of Travelers</span>
            <p className="font-medium">{travelDetails.travelers.length}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold">Selected Plan</h2>
            <p className="text-gray-500">Your chosen insurance plan</p>
          </div>
          <button
            onClick={() => onEdit("plan")}
            className="text-sm text-insurance-blue hover:underline"
          >
            Change
          </button>
        </div>
        
        <div className="mt-6 flex flex-col md:flex-row items-start gap-6">
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 w-full md:w-72">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-insurance-blue/10 rounded">
                <ShieldCheck className="h-6 w-6 text-insurance-blue" />
              </div>
              <div>
                <h3 className="font-medium">{selectedPlan.name}</h3>
                <p className="text-sm text-gray-500">{selectedPlan.provider}</p>
              </div>
            </div>
            
            <div className="pb-4 mb-4 border-b border-gray-200">
              <div className="text-2xl font-bold text-insurance-blue">
                {formatPrice(selectedPlan.price)}
              </div>
              <p className="text-sm text-gray-500">Total Premium</p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-2">Coverage Summary</h4>
              <ul className="space-y-2">
                {selectedPlan.benefits.slice(0, 3).map((benefit) => (
                  <li key={benefit.name} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-insurance-green flex-shrink-0" />
                    <span>{benefit.name}: {benefit.limit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="flex-1">
            <h3 className="text-lg font-medium mb-3">Plan Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-sm text-gray-500">Coverage Limit</span>
                <span className="text-sm font-medium">{selectedPlan.coverageLimit}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-sm text-gray-500">Provider</span>
                <span className="text-sm font-medium">{selectedPlan.provider}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-sm text-gray-500">Plan Type</span>
                <span className="text-sm font-medium">{selectedPlan.name}</span>
              </div>
              <div className="flex justify-between pb-2">
                <span className="text-sm text-gray-500">Total Price</span>
                <span className="text-sm font-bold text-insurance-blue">{formatPrice(selectedPlan.price)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold mb-4">Travelers Information</h2>
        {travelDetails.travelers.map(renderTravelerInfo)}
      </div>
      
      <div className="bg-gray-50 p-6 rounded-lg">
        <div className="flex items-start gap-4">
          <div className="bg-insurance-blue/10 p-2 rounded mt-1">
            <ShieldCheck className="h-6 w-6 text-insurance-blue" />
          </div>
          <div>
            <h3 className="font-medium">Important Notice</h3>
            <p className="text-sm text-gray-600 mt-1">
              By proceeding to payment, you confirm that all information provided is accurate and complete. 
              Any false information may result in claim denial. Please review carefully before proceeding.
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex justify-center">
        <button
          onClick={onProceed}
          className="bg-insurance-blue text-white py-3 px-8 rounded-lg font-medium hover:bg-insurance-blue/90 transition-colors"
        >
          Proceed to Payment
        </button>
      </div>
    </div>
  );
};

export default ReviewConfirmation;
