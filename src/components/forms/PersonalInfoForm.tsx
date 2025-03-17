
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Calendar } from "lucide-react";
import { TravelDetails, Traveler } from "@/types";
import { v4 as uuidv4 } from "uuid";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format, subYears } from "date-fns";
import { cn } from "@/lib/utils";

// Define the form schema for a single traveler
const travelerSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  dateOfBirth: z.date({
    required_error: "Date of birth is required",
  }),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
});

interface PersonalInfoFormProps {
  travelDetails: TravelDetails;
  onSubmit: (updatedDetails: TravelDetails) => void;
  onBack: () => void;
}

const PersonalInfoForm: React.FC<PersonalInfoFormProps> = ({ 
  travelDetails, 
  onSubmit,
  onBack
}) => {
  // We'll focus on the first traveler for simplicity
  const firstTraveler = travelDetails.travelers[0] || {
    id: uuidv4(),
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    phone: "",
    email: ""
  };

  const form = useForm<z.infer<typeof travelerSchema>>({
    resolver: zodResolver(travelerSchema),
    defaultValues: {
      firstName: firstTraveler.firstName,
      lastName: firstTraveler.lastName,
      dateOfBirth: firstTraveler.dateOfBirth ? new Date(firstTraveler.dateOfBirth) : undefined,
      email: firstTraveler.email || "",
      phone: firstTraveler.phone || "",
    }
  });

  const handleSubmit = (values: z.infer<typeof travelerSchema>) => {
    const updatedTraveler: Traveler = {
      ...firstTraveler,
      firstName: values.firstName,
      lastName: values.lastName,
      dateOfBirth: values.dateOfBirth.toISOString().split('T')[0],
      email: values.email,
      phone: values.phone,
    };

    const updatedTravelDetails: TravelDetails = {
      ...travelDetails,
      travelers: [updatedTraveler, ...travelDetails.travelers.slice(1)],
    };

    onSubmit(updatedTravelDetails);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Personal Information</h2>
        <p className="text-gray-500 mt-2">Please provide details for all travelers</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="font-medium mb-4">Primary Traveler</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter first name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter last name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dateOfBirth"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date of Birth</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <Calendar className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => 
                            date > new Date() || date < subYears(new Date(), 100)
                          }
                          captionLayout="dropdown-buttons"
                          fromYear={1920}
                          toYear={new Date().getFullYear()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" placeholder="Enter email address" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter phone number" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {travelDetails.coverType !== "Individual" && (
            <div className="text-center p-4 border border-dashed border-gray-300 rounded-lg">
              <p className="text-gray-500">
                {travelDetails.coverType === "Family" 
                  ? "Add family members" 
                  : "Add group members"}
              </p>
              <Button 
                type="button" 
                variant="outline" 
                className="mt-2"
                onClick={() => {
                  // This would typically open a modal or expand a form to add more travelers
                  console.log("Add more travelers");
                }}
              >
                Add Traveler
              </Button>
            </div>
          )}

          <div className="flex justify-between pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onBack}
            >
              Back
            </Button>
            <Button type="submit" className="bg-insurance-blue hover:bg-insurance-blue/90">
              Continue
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default PersonalInfoForm;
