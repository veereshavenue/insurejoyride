
import { InsurancePlan } from "@/types";

export const COUNTRIES = [
  "United States",
  "United Kingdom",
  "Germany",
  "France",
  "Italy",
  "Spain",
  "Japan",
  "China",
  "India",
  "Australia",
  "Canada",
  "Brazil",
  "Mexico",
  "South Africa",
  "Russia",
  "South Korea",
  "Indonesia",
  "Saudi Arabia",
  "United Arab Emirates",
  "Singapore",
  "Thailand",
  "Malaysia",
  "Vietnam",
  "Philippines",
  "New Zealand"
];

// Helper function to generate mock insurance plans based on user selections
export const generateInsurancePlans = (
  coverageType: string,
  tripType: string,
  duration: number,
  travelers: number
): InsurancePlan[] => {
  // Base prices for different coverage types
  const basePrices = {
    Worldwide: 150,
    Schengen: 120,
    Asia: 100,
    Others: 80
  };

  // Calculate base price multiplier based on trip type
  const tripMultiplier = tripType === 'Annual Multi-Trips' ? 3.5 : 1;
  
  // Duration multiplier (more days = slightly cheaper per day)
  const durationMultiplier = duration > 30 ? 0.8 : duration > 14 ? 0.9 : 1;
  
  // Number of travelers with slight discount for groups
  const travelerMultiplier = travelers > 3 ? travelers * 0.8 : travelers;

  const basePrice = basePrices[coverageType as keyof typeof basePrices] * 
                    tripMultiplier * 
                    durationMultiplier;

  const plans: InsurancePlan[] = [
    {
      id: "global-basic",
      name: "Basic Coverage",
      provider: "GlobalGuard Insurance",
      price: Math.round(basePrice * travelerMultiplier),
      benefits: [
        { 
          name: "Medical Expenses", 
          description: "Coverage for emergency medical expenses during your trip",
          limit: "$50,000",
          isHighlighted: true
        },
        { 
          name: "Trip Cancellation", 
          description: "Reimbursement for prepaid, non-refundable expenses if you need to cancel your trip",
          limit: "$1,000" 
        },
        { 
          name: "Lost Baggage", 
          description: "Coverage for lost, stolen, or damaged baggage during your trip",
          limit: "$500" 
        },
        { 
          name: "Emergency Evacuation", 
          description: "Coverage for emergency medical evacuation",
          limit: "$25,000" 
        }
      ],
      coverageLimit: "$50,000",
      rating: 4.1,
      terms: "Coverage is valid for the specified trip dates. Pre-existing conditions are not covered unless specifically stated. Claims must be filed within 30 days of the incident.",
      exclusions: [
        "Pre-existing medical conditions",
        "Extreme sports and activities",
        "War or terrorism",
        "Self-inflicted injuries",
        "Intoxication or drug use"
      ],
      pros: [
        "Affordable premium",
        "Easy claims process",
        "24/7 emergency assistance"
      ],
      cons: [
        "Lower coverage limits",
        "Basic benefits only",
        "Limited adventure activities coverage"
      ],
      logoUrl: "public/lovable-uploads/7964d9f0-2350-425a-95c4-5ae8a80dda04.png"
    },
    {
      id: "secure-standard",
      name: "Standard Coverage",
      provider: "SecureTraveler",
      price: Math.round(basePrice * 1.4 * travelerMultiplier),
      benefits: [
        { 
          name: "Medical Expenses", 
          description: "Coverage for emergency medical expenses during your trip",
          limit: "$100,000",
          isHighlighted: true
        },
        { 
          name: "Trip Cancellation", 
          description: "Reimbursement for prepaid, non-refundable expenses if you need to cancel your trip",
          limit: "$2,500" 
        },
        { 
          name: "Lost Baggage", 
          description: "Coverage for lost, stolen, or damaged baggage during your trip",
          limit: "$1,000" 
        },
        { 
          name: "Emergency Evacuation", 
          description: "Coverage for emergency medical evacuation",
          limit: "$50,000" 
        },
        { 
          name: "Travel Delay", 
          description: "Coverage for additional expenses due to travel delays",
          limit: "$500" 
        }
      ],
      coverageLimit: "$100,000",
      rating: 4.3,
      badge: "Popular",
      terms: "Coverage is valid for the specified trip dates. 14-day look-back period for pre-existing conditions. Claims must be filed within 60 days of the incident.",
      exclusions: [
        "Pre-existing medical conditions (with exceptions)",
        "Certain adventure sports",
        "War or terrorism",
        "Self-inflicted injuries",
        "Intoxication or drug use"
      ],
      pros: [
        "Good balance of coverage and cost",
        "Coverage for common travel issues",
        "24/7 emergency assistance",
        "Travel delay protection"
      ],
      cons: [
        "Some adventure activities not covered",
        "Limited pre-existing condition coverage"
      ],
      logoUrl: "public/lovable-uploads/7964d9f0-2350-425a-95c4-5ae8a80dda04.png"
    },
    {
      id: "premier-plus",
      name: "Premier Coverage",
      provider: "EliteCover",
      price: Math.round(basePrice * 2 * travelerMultiplier),
      benefits: [
        { 
          name: "Medical Expenses", 
          description: "Coverage for emergency medical expenses during your trip",
          limit: "$250,000",
          isHighlighted: true
        },
        { 
          name: "Trip Cancellation", 
          description: "Reimbursement for prepaid, non-refundable expenses if you need to cancel your trip",
          limit: "$5,000" 
        },
        { 
          name: "Lost Baggage", 
          description: "Coverage for lost, stolen, or damaged baggage during your trip",
          limit: "$2,500" 
        },
        { 
          name: "Emergency Evacuation", 
          description: "Coverage for emergency medical evacuation",
          limit: "$100,000" 
        },
        { 
          name: "Travel Delay", 
          description: "Coverage for additional expenses due to travel delays",
          limit: "$1,000" 
        },
        { 
          name: "Adventure Activities", 
          description: "Coverage for certain adventure activities and sports",
          limit: "Included" 
        }
      ],
      coverageLimit: "$250,000",
      rating: 4.7,
      badge: "Best Value",
      terms: "Coverage is valid for the specified trip dates. Pre-existing conditions waiver available if purchased within 14 days of initial trip payment. Claims must be filed within 90 days of the incident.",
      exclusions: [
        "Certain extreme sports (professional level)",
        "War or terrorism (with exceptions)",
        "Self-inflicted injuries",
        "Intoxication or drug use"
      ],
      pros: [
        "High coverage limits",
        "Comprehensive benefits",
        "Pre-existing conditions waiver available",
        "Coverage for adventure activities",
        "Generous cancellation coverage"
      ],
      cons: [
        "Higher premium",
        "Some exclusions still apply"
      ],
      logoUrl: "public/lovable-uploads/7964d9f0-2350-425a-95c4-5ae8a80dda04.png"
    },
    {
      id: "luxury-elite",
      name: "Elite Coverage",
      provider: "LuxuryTravelGuard",
      price: Math.round(basePrice * 3 * travelerMultiplier),
      benefits: [
        { 
          name: "Medical Expenses", 
          description: "Coverage for emergency medical expenses during your trip",
          limit: "$500,000",
          isHighlighted: true
        },
        { 
          name: "Trip Cancellation", 
          description: "Reimbursement for prepaid, non-refundable expenses if you need to cancel your trip",
          limit: "$10,000" 
        },
        { 
          name: "Lost Baggage", 
          description: "Coverage for lost, stolen, or damaged baggage during your trip",
          limit: "$5,000" 
        },
        { 
          name: "Emergency Evacuation", 
          description: "Coverage for emergency medical evacuation",
          limit: "$250,000" 
        },
        { 
          name: "Travel Delay", 
          description: "Coverage for additional expenses due to travel delays",
          limit: "$2,000" 
        },
        { 
          name: "Adventure Activities", 
          description: "Coverage for adventure activities and sports",
          limit: "Included" 
        },
        { 
          name: "Concierge Services", 
          description: "24/7 premium concierge services during your trip",
          limit: "Included" 
        }
      ],
      coverageLimit: "$500,000",
      rating: 4.9,
      badge: "Premium",
      terms: "Coverage is valid for the specified trip dates. Pre-existing conditions are covered with no waiting period. Claims can be filed any time within 180 days of the incident.",
      exclusions: [
        "Professional sports competitions",
        "Self-inflicted injuries",
        "Illegal activities"
      ],
      pros: [
        "Highest coverage limits",
        "Most comprehensive coverage",
        "Pre-existing conditions included",
        "Premium concierge services",
        "Minimal exclusions"
      ],
      cons: [
        "Most expensive option"
      ],
      logoUrl: "public/lovable-uploads/7964d9f0-2350-425a-95c4-5ae8a80dda04.png"
    },
    {
      id: "budget-saver",
      name: "Economy Coverage",
      provider: "BudgetGuard",
      price: Math.round(basePrice * 0.7 * travelerMultiplier),
      benefits: [
        { 
          name: "Medical Expenses", 
          description: "Coverage for emergency medical expenses during your trip",
          limit: "$25,000",
          isHighlighted: true
        },
        { 
          name: "Trip Cancellation", 
          description: "Reimbursement for prepaid, non-refundable expenses if you need to cancel your trip",
          limit: "$500" 
        },
        { 
          name: "Lost Baggage", 
          description: "Coverage for lost, stolen, or damaged baggage during your trip",
          limit: "$250" 
        }
      ],
      coverageLimit: "$25,000",
      rating: 3.5,
      terms: "Coverage is valid for the specified trip dates. Claims must be filed within 30 days of the incident.",
      exclusions: [
        "Pre-existing medical conditions",
        "Adventure activities",
        "Trip delays",
        "War or terrorism",
        "Self-inflicted injuries",
        "Intoxication or drug use"
      ],
      pros: [
        "Lowest price option",
        "Basic emergency coverage",
        "Simple claims process"
      ],
      cons: [
        "Very limited coverage",
        "Low benefit limits",
        "Many exclusions"
      ],
      logoUrl: "public/lovable-uploads/7964d9f0-2350-425a-95c4-5ae8a80dda04.png"
    },
    {
      id: "adventure-special",
      name: "Adventure Coverage",
      provider: "ThrillSeeker Insurance",
      price: Math.round(basePrice * 1.8 * travelerMultiplier),
      benefits: [
        { 
          name: "Medical Expenses", 
          description: "Coverage for emergency medical expenses during your trip",
          limit: "$150,000",
          isHighlighted: true
        },
        { 
          name: "Trip Cancellation", 
          description: "Reimbursement for prepaid, non-refundable expenses if you need to cancel your trip",
          limit: "$3,000" 
        },
        { 
          name: "Lost Equipment", 
          description: "Coverage for lost, stolen, or damaged sports equipment",
          limit: "$2,000" 
        },
        { 
          name: "Emergency Evacuation", 
          description: "Coverage for emergency medical evacuation, including from remote locations",
          limit: "$150,000" 
        },
        { 
          name: "Adventure Sports", 
          description: "Comprehensive coverage for adventure activities and extreme sports",
          limit: "Included",
          isHighlighted: true
        }
      ],
      coverageLimit: "$150,000",
      rating: 4.6,
      terms: "Coverage is valid for the specified trip dates. Claims must be filed within 60 days of the incident. Covers most adventure activities including skiing, scuba diving, hiking, and more.",
      exclusions: [
        "Professional competitions",
        "War or terrorism",
        "Self-inflicted injuries",
        "Intoxication or drug use"
      ],
      pros: [
        "Specialized for adventure travelers",
        "Covers extreme sports and activities",
        "Equipment protection",
        "Remote evacuation coverage"
      ],
      cons: [
        "Higher price than standard plans",
        "Less comprehensive general travel benefits"
      ],
      logoUrl: "public/lovable-uploads/7964d9f0-2350-425a-95c4-5ae8a80dda04.png"
    }
  ];

  return plans;
};
