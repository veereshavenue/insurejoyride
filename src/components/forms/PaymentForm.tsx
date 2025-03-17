import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { InsurancePlan, TravelDetails } from "@/types";
import { CreditCard, Lock, Check } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface PaymentFormProps {
  travelDetails: TravelDetails;
  selectedPlan: InsurancePlan;
  onSubmit: () => void;
  onBack: () => void;
  userId?: string;
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  travelDetails,
  selectedPlan,
  onSubmit,
  onBack,
  userId,
}) => {
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [billingAddress, setBillingAddress] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"credit-card" | "paypal">("credit-card");
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };
  
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\s/g, "");
    const formattedValue = value
      .replace(/\D/g, "")
      .replace(/(\d{4})(?=\d)/g, "$1 ")
      .slice(0, 19);
    
    setCardNumber(formattedValue);
  };
  
  const handleExpiryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    
    if (value.length <= 2) {
      setExpiryDate(value);
    } else {
      setExpiryDate(`${value.slice(0, 2)}/${value.slice(2, 4)}`);
    }
  };
  
  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 4);
    setCvv(value);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (paymentMethod === "credit-card") {
      if (!cardNumber || !cardName || !expiryDate || !cvv || !billingAddress) {
        toast({
          title: "Missing Information",
          description: "Please fill in all payment details.",
          variant: "destructive",
        });
        return;
      }
      
      if (cardNumber.replace(/\s/g, "").length < 16) {
        toast({
          title: "Invalid Card Number",
          description: "Please enter a valid 16-digit card number.",
          variant: "destructive",
        });
        return;
      }
      
      if (cvv.length < 3) {
        toast({
          title: "Invalid CVV",
          description: "Please enter a valid security code.",
          variant: "destructive",
        });
        return;
      }
    }
    
    setIsProcessing(true);
    
    console.log("Processing payment for user:", userId);
    
    setTimeout(() => {
      setIsProcessing(false);
      onSubmit();
      
      toast({
        title: "Payment Successful",
        description: "Your payment has been processed successfully.",
      });
    }, 2000);
  };
  
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Payment</h2>
        <p className="text-gray-500 mt-2">
          Complete your purchase by providing payment details
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Payment Method</h3>
                  <div className="flex space-x-4">
                    <div
                      className={`border rounded-lg p-4 flex items-center gap-3 cursor-pointer transition-colors flex-1 ${
                        paymentMethod === "credit-card"
                          ? "border-insurance-blue bg-insurance-blue/5"
                          : "border-gray-200"
                      }`}
                      onClick={() => setPaymentMethod("credit-card")}
                    >
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                          paymentMethod === "credit-card"
                            ? "border-insurance-blue"
                            : "border-gray-400"
                        }`}
                      >
                        {paymentMethod === "credit-card" && (
                          <div className="w-3 h-3 rounded-full bg-insurance-blue" />
                        )}
                      </div>
                      <CreditCard className="h-5 w-5 text-gray-600" />
                      <span>Credit Card</span>
                    </div>
                    <div
                      className={`border rounded-lg p-4 flex items-center gap-3 cursor-pointer transition-colors flex-1 ${
                        paymentMethod === "paypal"
                          ? "border-insurance-blue bg-insurance-blue/5"
                          : "border-gray-200"
                      }`}
                      onClick={() => setPaymentMethod("paypal")}
                    >
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                          paymentMethod === "paypal"
                            ? "border-insurance-blue"
                            : "border-gray-400"
                        }`}
                      >
                        {paymentMethod === "paypal" && (
                          <div className="w-3 h-3 rounded-full bg-insurance-blue" />
                        )}
                      </div>
                      <span className="text-blue-700 font-bold">Pay<span className="text-blue-900">Pal</span></span>
                    </div>
                  </div>
                </div>
                
                {paymentMethod === "credit-card" ? (
                  <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Card Number
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          placeholder="1234 5678 9012 3456"
                          value={cardNumber}
                          onChange={handleCardNumberChange}
                          maxLength={19}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Cardholder Name
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          placeholder="John Doe"
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value)}
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Expiry Date
                          </label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            placeholder="MM/YY"
                            value={expiryDate}
                            onChange={handleExpiryDateChange}
                            maxLength={5}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            CVV
                          </label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            placeholder="123"
                            value={cvv}
                            onChange={handleCvvChange}
                            maxLength={4}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Billing Address
                        </label>
                        <textarea
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          placeholder="Enter your billing address"
                          value={billingAddress}
                          onChange={(e) => setBillingAddress(e.target.value)}
                          rows={3}
                        />
                      </div>
                    </div>
                  </form>
                ) : (
                  <div className="bg-gray-50 p-6 rounded-lg text-center">
                    <p className="text-gray-600">
                      You will be redirected to PayPal to complete your payment.
                    </p>
                  </div>
                )}
                
                <div className="flex items-center gap-2 bg-gray-50 p-4 rounded-lg">
                  <Lock className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    Your payment information is secure and encrypted
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <div className="bg-gray-50 rounded-lg p-6 sticky top-6">
            <h3 className="text-lg font-medium mb-4">Order Summary</h3>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span>Plan:</span>
                <span className="font-medium">{selectedPlan.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Provider:</span>
                <span>{selectedPlan.provider}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Coverage Duration:</span>
                <span>
                  {new Date(travelDetails.startDate).toLocaleDateString()} - {new Date(travelDetails.endDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Number of Travelers:</span>
                <span>{travelDetails.travelers.length}</span>
              </div>
              
              <div className="border-t border-gray-200 pt-3 mt-3">
                <div className="flex justify-between font-medium">
                  <span>Subtotal:</span>
                  <span>{formatPrice(selectedPlan.price)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500 mt-1">
                  <span>Taxes & Fees:</span>
                  <span>{formatPrice(selectedPlan.price * 0.1)}</span>
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-3">
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span className="text-insurance-blue">
                  {formatPrice(selectedPlan.price * 1.1)}
                </span>
              </div>
            </div>
            
            <Button
              className="w-full mt-6 bg-insurance-blue hover:bg-insurance-blue/90"
              onClick={handleSubmit}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                `Pay ${formatPrice(selectedPlan.price * 1.1)}`
              )}
            </Button>
            
            <Button
              variant="outline"
              className="w-full mt-3"
              onClick={onBack}
              disabled={isProcessing}
            >
              Back
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentForm;
