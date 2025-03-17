
import React, { useState } from "react";
import { Traveler } from "@/types";
import { X, Upload } from "lucide-react";

interface AdditionalInfoProps {
  traveler: Traveler;
  onChange: (updatedTraveler: Traveler) => void;
  onRemoveFile: (fileType: "passport" | "visa") => void;
}

const AdditionalInfo: React.FC<AdditionalInfoProps> = ({
  traveler,
  onChange,
  onRemoveFile,
}) => {
  const [dragOver, setDragOver] = useState<"passport" | "visa" | null>(null);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, type: "passport" | "visa") => {
    e.preventDefault();
    setDragOver(null);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      
      // Update traveler documents based on type
      onChange({
        ...traveler,
        documents: {
          ...traveler.documents,
          [type]: file
        }
      });
    }
  };
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: "passport" | "visa") => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Update traveler documents based on type
      onChange({
        ...traveler,
        documents: {
          ...traveler.documents,
          [type]: file
        }
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Address Information</h3>
          <div>
            <label className="block text-sm font-medium mb-1">Street Address</label>
            <input
              type="text"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-insurance-blue focus:border-transparent transition-all"
              value={traveler.address || ""}
              onChange={(e) => onChange({ ...traveler, address: e.target.value })}
              placeholder="Enter street address"
            />
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Passport Information</h3>
          <div>
            <label className="block text-sm font-medium mb-1">Passport Number</label>
            <input
              type="text"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-insurance-blue focus:border-transparent transition-all"
              value={traveler.passport?.number || ""}
              onChange={(e) => onChange({ 
                ...traveler, 
                passport: { 
                  ...traveler.passport,
                  number: e.target.value 
                } 
              })}
              placeholder="Enter passport number"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Issue Date</label>
              <input
                type="date"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-insurance-blue focus:border-transparent transition-all"
                value={traveler.passport?.issueDate || ""}
                onChange={(e) => onChange({ 
                  ...traveler, 
                  passport: { 
                    ...traveler.passport,
                    issueDate: e.target.value 
                  } 
                })}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Expiry Date</label>
              <input
                type="date"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-insurance-blue focus:border-transparent transition-all"
                value={traveler.passport?.expiryDate || ""}
                onChange={(e) => onChange({ 
                  ...traveler, 
                  passport: { 
                    ...traveler.passport,
                    expiryDate: e.target.value 
                  } 
                })}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Nationality</label>
            <input
              type="text"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-insurance-blue focus:border-transparent transition-all"
              value={traveler.passport?.nationality || ""}
              onChange={(e) => onChange({ 
                ...traveler, 
                passport: { 
                  ...traveler.passport,
                  nationality: e.target.value 
                } 
              })}
              placeholder="Enter nationality"
            />
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Beneficiary Information</h3>
          <div>
            <label className="block text-sm font-medium mb-1">Beneficiary Name</label>
            <input
              type="text"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-insurance-blue focus:border-transparent transition-all"
              value={traveler.beneficiary?.name || ""}
              onChange={(e) => onChange({ 
                ...traveler, 
                beneficiary: { 
                  ...traveler.beneficiary,
                  name: e.target.value 
                } 
              })}
              placeholder="Enter beneficiary name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Relationship</label>
            <input
              type="text"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-insurance-blue focus:border-transparent transition-all"
              value={traveler.beneficiary?.relationship || ""}
              onChange={(e) => onChange({ 
                ...traveler, 
                beneficiary: { 
                  ...traveler.beneficiary,
                  relationship: e.target.value 
                } 
              })}
              placeholder="Enter relationship"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Contact Details</label>
            <input
              type="text"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-insurance-blue focus:border-transparent transition-all"
              value={traveler.beneficiary?.contactDetails || ""}
              onChange={(e) => onChange({ 
                ...traveler, 
                beneficiary: { 
                  ...traveler.beneficiary,
                  contactDetails: e.target.value 
                } 
              })}
              placeholder="Enter contact details"
            />
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Document Upload</h3>
          
          <div>
            <label className="block text-sm font-medium mb-1">Passport Copy</label>
            {traveler.documents?.passport ? (
              <div className="relative bg-gray-50 p-3 rounded-lg border border-gray-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="bg-insurance-blue/10 p-2 rounded mr-3">
                      <Upload className="h-5 w-5 text-insurance-blue" />
                    </div>
                    <div>
                      <p className="text-sm font-medium truncate max-w-[200px]">
                        {traveler.documents.passport.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {Math.round(traveler.documents.passport.size / 1024)} KB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => onRemoveFile("passport")}
                    className="p-1.5 rounded-full hover:bg-gray-200 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div
                className={`
                  border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer
                  ${dragOver === "passport" ? "border-insurance-blue bg-insurance-blue/5" : "border-gray-300 hover:border-insurance-blue/50"}
                  transition-colors
                `}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver("passport");
                }}
                onDragLeave={() => setDragOver(null)}
                onDrop={(e) => handleDrop(e, "passport")}
                onClick={() => document.getElementById("passport-upload")?.click()}
              >
                <Upload className="h-8 w-8 text-gray-400 mb-2" />
                <p className="text-sm font-medium">Drag & drop or click to upload</p>
                <p className="text-xs text-gray-500 mt-1">PDF, JPG or PNG (Max 5MB)</p>
                <input
                  id="passport-upload"
                  type="file"
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileSelect(e, "passport")}
                />
              </div>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Visa Copy</label>
            {traveler.documents?.visa ? (
              <div className="relative bg-gray-50 p-3 rounded-lg border border-gray-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="bg-insurance-blue/10 p-2 rounded mr-3">
                      <Upload className="h-5 w-5 text-insurance-blue" />
                    </div>
                    <div>
                      <p className="text-sm font-medium truncate max-w-[200px]">
                        {traveler.documents.visa.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {Math.round(traveler.documents.visa.size / 1024)} KB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => onRemoveFile("visa")}
                    className="p-1.5 rounded-full hover:bg-gray-200 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div
                className={`
                  border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer
                  ${dragOver === "visa" ? "border-insurance-blue bg-insurance-blue/5" : "border-gray-300 hover:border-insurance-blue/50"}
                  transition-colors
                `}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver("visa");
                }}
                onDragLeave={() => setDragOver(null)}
                onDrop={(e) => handleDrop(e, "visa")}
                onClick={() => document.getElementById("visa-upload")?.click()}
              >
                <Upload className="h-8 w-8 text-gray-400 mb-2" />
                <p className="text-sm font-medium">Drag & drop or click to upload</p>
                <p className="text-xs text-gray-500 mt-1">PDF, JPG or PNG (Max 5MB)</p>
                <input
                  id="visa-upload"
                  type="file"
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileSelect(e, "visa")}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdditionalInfo;
