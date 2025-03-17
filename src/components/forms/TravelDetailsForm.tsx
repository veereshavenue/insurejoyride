
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Calendar } from "lucide-react";
import { TravelDetails } from "@/types";
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
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format, addDays } from "date-fns";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  coverageType: z.enum(["Worldwide", "Schengen", "Asia", "Others"]),
  originCountry: z.string().min(1, "Origin country is required"),
  destinationCountry: z.string().min(1, "Destination country is required"),
  tripType: z.enum(["Single Trip", "Annual Multi-Trips"]),
  startDate: z.date({
    required_error: "Start date is required",
  }),
  endDate: z.date({
    required_error: "End date is required",
  }),
  coverType: z.enum(["Individual", "Group", "Family"])
});

interface TravelDetailsFormProps {
  initialValues: TravelDetails;
  onSubmit: (data: TravelDetails) => void;
}

const TravelDetailsForm: React.FC<TravelDetailsFormProps> = ({ 
  initialValues, 
  onSubmit 
}) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      coverageType: initialValues.coverageType,
      originCountry: initialValues.originCountry,
      destinationCountry: initialValues.destinationCountry,
      tripType: initialValues.tripType,
      startDate: initialValues.startDate ? new Date(initialValues.startDate) : new Date(),
      endDate: initialValues.endDate ? new Date(initialValues.endDate) : addDays(new Date(), 7),
      coverType: initialValues.coverType
    }
  });

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit({
      ...initialValues,
      ...values,
      startDate: values.startDate.toISOString().split('T')[0],
      endDate: values.endDate.toISOString().split('T')[0],
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Travel Details</h2>
        <p className="text-gray-500 mt-2">Tell us about your trip to get personalized insurance options</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="coverageType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Coverage Type</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select coverage type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Worldwide">Worldwide</SelectItem>
                      <SelectItem value="Schengen">Schengen</SelectItem>
                      <SelectItem value="Asia">Asia</SelectItem>
                      <SelectItem value="Others">Others</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tripType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Trip Type</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select trip type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Single Trip">Single Trip</SelectItem>
                      <SelectItem value="Annual Multi-Trips">Annual Multi-Trips</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="originCountry"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Origin Country</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter your country of residence" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="destinationCountry"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Destination Country</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter your destination" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Start Date</FormLabel>
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
                        disabled={(date) => date < new Date()}
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
              name="endDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>End Date</FormLabel>
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
                          date < (form.getValues().startDate || new Date())
                        }
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
              name="coverType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cover Type</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select cover type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Individual">Individual</SelectItem>
                      <SelectItem value="Group">Group</SelectItem>
                      <SelectItem value="Family">Family</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" className="bg-insurance-blue hover:bg-insurance-blue/90">
              Continue
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default TravelDetailsForm;
