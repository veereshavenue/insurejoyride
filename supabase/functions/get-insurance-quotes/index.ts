
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  console.log('Edge function get-insurance-quotes called with request method:', req.method);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS request with CORS headers');
    return new Response('ok', { 
      headers: corsHeaders,
      status: 200
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Missing Supabase configuration:', { 
        urlProvided: !!supabaseUrl, 
        keyProvided: !!supabaseAnonKey 
      });
      throw new Error('Missing Supabase configuration');
    }
    
    console.log('Initializing Supabase client with URL:', supabaseUrl.substring(0, 15) + '...');
    
    const supabaseClient = createClient(
      supabaseUrl,
      supabaseAnonKey,
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    // Parse the request body
    const requestData = await req.json();
    const { travelDetails } = requestData;
    
    if (!travelDetails) {
      console.error('No travel details provided in request');
      throw new Error('Travel details are required');
    }
    
    console.log('Processing travel details:', JSON.stringify({
      coverageType: travelDetails.coverageType,
      tripType: travelDetails.tripType,
      startDate: travelDetails.startDate,
      endDate: travelDetails.endDate,
      travelers: travelDetails.travelers?.length
    }));
    
    // Fetch all insurance plans with their benefits
    console.log('Querying insurance_plans table for active plans');
    const { data: plansData, error: plansError } = await supabaseClient
      .from('insurance_plans')
      .select(`
        *,
        insurance_benefits(*)
      `)
      .eq('is_active', true);
    
    if (plansError) {
      console.error('Error fetching insurance plans:', plansError);
      throw plansError;
    }
    
    console.log(`Successfully fetched ${plansData?.length || 0} insurance plans`);
    
    if (!plansData || plansData.length === 0) {
      console.log('No insurance plans found in the database with is_active=true');
      return new Response(
        JSON.stringify([]),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }
    
    // Log the first plan for debugging purposes
    if (plansData.length > 0) {
      console.log('First plan data sample (ID and name):', { 
        id: plansData[0].id, 
        name: plansData[0].name,
        hasbenefits: Array.isArray(plansData[0].insurance_benefits) && plansData[0].insurance_benefits.length > 0
      });
    }
    
    // Calculate trip days
    const startDate = new Date(travelDetails.startDate);
    const endDate = new Date(travelDetails.endDate);
    const tripDays = Math.max(
      1,
      Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
    );
    
    console.log(`Trip duration: ${tripDays} days`);
    
    // Calculate prices based on travel details
    const quotes = plansData.map(plan => {
      // Base multipliers
      let priceMultiplier = 1;
      
      // Adjust for coverage type
      if (travelDetails.coverageType === 'Worldwide') {
        priceMultiplier *= 1.5;
      } else if (travelDetails.coverageType === 'Schengen') {
        priceMultiplier *= 1.2;
      }
      
      // Adjust for trip type
      if (travelDetails.tripType === 'Annual Multi-Trips') {
        priceMultiplier *= 4; // Annual plans cost more
      } else {
        // Adjust for trip duration for single trips
        priceMultiplier *= Math.min(tripDays / 7, 10); // Cap at 10x for very long trips
      }
      
      // Adjust for cover type and number of travelers
      const numTravelers = travelDetails.travelers?.length || 1;
      if (travelDetails.coverType === 'Family') {
        priceMultiplier *= Math.min(1.8, 1 + (numTravelers * 0.2)); // Family discount
      } else if (travelDetails.coverType === 'Group') {
        priceMultiplier *= Math.min(2.5, 1 + (numTravelers * 0.25)); // Group rate
      } else {
        priceMultiplier *= numTravelers; // Individual: direct multiplication
      }
      
      const calculatedPrice = Math.round(plan.base_price * priceMultiplier);
      
      // Format the response
      return {
        id: plan.id,
        name: plan.name,
        provider: plan.provider,
        price: calculatedPrice,
        benefits: plan.insurance_benefits || [],
        coverageLimit: plan.coverage_limit,
        rating: plan.rating,
        terms: plan.terms,
        exclusions: plan.exclusions || [],
        badge: plan.badge,
        pros: plan.pros || [],
        cons: plan.cons || [],
        logoUrl: plan.logo_url,
      };
    });
    
    console.log(`Generated ${quotes.length} insurance quotes`);
    // Log the first quote for debugging
    if (quotes.length > 0) {
      console.log('First quote sample (ID, name, and price):', { 
        id: quotes[0].id, 
        name: quotes[0].name,
        price: quotes[0].price,
        benefits: quotes[0].benefits.length
      });
    }

    return new Response(
      JSON.stringify(quotes),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error in get-insurance-quotes edge function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Unknown error occurred' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});
