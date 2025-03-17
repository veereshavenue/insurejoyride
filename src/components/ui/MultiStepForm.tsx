
import React, { useState, useEffect } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  id: string;
  label: string;
}

interface MultiStepFormProps {
  steps: Step[];
  currentStep: number;
  children: React.ReactNode;
}

const MultiStepForm: React.FC<MultiStepFormProps> = ({
  steps,
  currentStep,
  children,
}) => {
  const [animatingStep, setAnimatingStep] = useState<number | null>(null);
  const [direction, setDirection] = useState<"forward" | "backward">("forward");

  useEffect(() => {
    const prevStep = animatingStep;
    setAnimatingStep(currentStep);
    
    if (prevStep !== null && prevStep !== currentStep) {
      setDirection(currentStep > prevStep ? "forward" : "backward");
    }
  }, [currentStep]);

  return (
    <div className="multi-step-form-container">
      <div className="mb-8">
        <div className="mb-4 hidden md:flex justify-between relative">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={cn(
                "flex flex-col items-center relative z-10",
                index < currentStep ? "text-insurance-blue" : "text-gray-400"
              )}
            >
              <div
                className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full border-2 mb-2 transition-all duration-300",
                  index < currentStep
                    ? "border-insurance-blue bg-insurance-blue text-white"
                    : index === currentStep
                    ? "border-insurance-blue text-insurance-blue"
                    : "border-gray-300"
                )}
              >
                {index < currentStep ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              <span className="text-xs font-medium">{step.label}</span>
            </div>
          ))}
          
          <div
            className="absolute top-4 left-0 h-0.5 bg-gray-200 w-full -z-0"
            aria-hidden="true"
          ></div>
          
          <div
            className="absolute top-4 left-0 h-0.5 bg-insurance-blue transition-all duration-500 -z-0"
            style={{
              width: `${(currentStep / (steps.length - 1)) * 100}%`,
            }}
            aria-hidden="true"
          ></div>
        </div>

        <div className="flex justify-between md:hidden mb-4">
          <span className="text-sm font-medium text-insurance-blue">
            Step {currentStep + 1} of {steps.length}
          </span>
          <span className="text-sm font-medium">{steps[currentStep].label}</span>
        </div>
        
        <div
          className="h-1 w-full bg-gray-200 rounded-full overflow-hidden"
          aria-hidden="true"
        >
          <div
            className="h-full bg-insurance-blue transition-all duration-500"
            style={{
              width: `${((currentStep + 1) / steps.length) * 100}%`,
            }}
          ></div>
        </div>
      </div>

      <div className="relative min-h-[400px] mb-16">
        <div
          className={cn(
            "absolute w-full transition-all duration-500 transform",
            direction === "forward" ? 
              (animatingStep === currentStep ? "animate-fade-in" : "animate-fade-out translate-x-full opacity-0") : 
              (animatingStep === currentStep ? "animate-fade-in" : "animate-fade-out -translate-x-full opacity-0")
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default MultiStepForm;
