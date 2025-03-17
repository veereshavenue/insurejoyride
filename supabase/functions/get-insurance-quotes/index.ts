
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const { travelDetails } = await req.json()
    
    // Fetch all insurance plans with their benefits
    const { data: plansData, error: plansError } = await supabaseClient
      .from('insurance_plans')
      .select(`
        *,
        insurance_benefits(*)
      `)
      .eq('is_active', true)
    
    if (plansError) throw plansError
    
    // Calculate trip days
    const startDate = new Date(travelDetails.startDate)
    const endDate = new Date(travelDetails.endDate)
    const tripDays = Math.max(
      1,
      Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
    )
    
    // Calculate prices based on travel details
    const quotes = plansData.map(plan => {
      // Base multipliers
      let priceMultiplier = 1
      
      // Adjust for coverage type
      if (travelDetails.coverageType === 'Worldwide') {
        priceMultiplier *= 1.5
      } else if (travelDetails.coverageType === 'Schengen') {
        priceMultiplier *= 1.2
      }
      
      // Adjust for trip type
      if (travelDetails.tripType === 'Annual Multi-Trips') {
        priceMultiplier *= 4 // Annual plans cost more
      } else {
        // Adjust for trip duration for single trips
        priceMultiplier *= Math.min(tripDays / 7, 10) // Cap at 10x for very long trips
      }
      
      // Adjust for cover type and number of travelers
      const numTravelers = travelDetails.travelers.length
      if (travelDetails.coverType === 'Family') {
        priceMultiplier *= Math.min(1.8, 1 + (numTravelers * 0.2)) // Family discount
      } else if (travelDetails.coverType === 'Group') {
        priceMultiplier *= Math.min(2.5, 1 + (numTravelers * 0.25)) // Group rate
      } else {
        priceMultiplier *= numTravelers // Individual: direct multiplication
      }
      
      const calculatedPrice = Math.round(plan.base_price * priceMultiplier)
      
      // Format the response
      return {
        id: plan.id,
        name: plan.name,
        provider: plan.provider,
        price: calculatedPrice,
        benefits: plan.insurance_benefits,
        coverageLimit: plan.coverage_limit,
        rating: plan.rating,
        terms: plan.terms,
        exclusions: plan.exclusions || [],
        badge: plan.badge,
        pros: plan.pros || [],
        cons: plan.cons || [],
        logoUrl: plan.logo_url,
      }
    })

    return new Response(
      JSON.stringify(quotes),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})
