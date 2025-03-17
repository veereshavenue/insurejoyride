
import React from "react";
import { Loader2 } from "lucide-react";

interface LoadingScreenProps {
  message?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = "Processing your request..." 
}) => {
  return (
    <div className="min-h-[400px] flex flex-col items-center justify-center">
      <div className="relative">
        <div className="absolute -inset-4 rounded-full bg-insurance-blue/10 animate-pulse"></div>
        <div className="relative bg-white rounded-full p-4">
          <Loader2 className="h-10 w-10 text-insurance-blue animate-spin" />
        </div>
      </div>
      <h3 className="mt-8 text-xl font-medium">{message}</h3>
      <p className="mt-2 text-gray-500 max-w-md text-center">
        We're finding the best insurance options tailored to your needs. This may take a moment.
      </p>
      
      <div className="mt-10 w-full max-w-md">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="h-3 w-24 bg-gray-200 rounded shimmer"></div>
            <div className="h-3 w-12 bg-gray-200 rounded shimmer"></div>
          </div>
          <div className="h-3 w-full bg-gray-200 rounded shimmer"></div>
          <div className="h-3 w-3/4 bg-gray-200 rounded shimmer"></div>
        </div>

        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between">
            <div className="h-3 w-32 bg-gray-200 rounded shimmer"></div>
            <div className="h-3 w-16 bg-gray-200 rounded shimmer"></div>
          </div>
          <div className="h-3 w-full bg-gray-200 rounded shimmer"></div>
          <div className="h-3 w-2/3 bg-gray-200 rounded shimmer"></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
