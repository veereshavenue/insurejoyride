
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

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    
    if (authError) throw new Error('Authentication error: ' + authError.message)
    if (!user) throw new Error('User not authenticated')
    
    const { 
      planId, 
      travelDetails, 
      price, 
      paymentMethod, 
      paymentReference 
    } = await req.json()
    
    // Generate a unique reference number for the policy
    const referenceNumber = `POL-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`
    
    // 1. Create the travel policy record
    const { data: policyData, error: policyError } = await supabaseClient
      .from('travel_policies')
      .insert({
        user_id: user.id,
        plan_id: planId,
        reference_number: referenceNumber,
        coverage_type: travelDetails.coverageType,
        origin_country: travelDetails.originCountry,
        destination_country: travelDetails.destinationCountry,
        trip_type: travelDetails.tripType,
        start_date: travelDetails.startDate,
        end_date: travelDetails.endDate,
        cover_type: travelDetails.coverType,
        total_price: price,
        status: 'Active',
        payment_status: 'Completed', // Assume payment is successful
        payment_method: paymentMethod,
        payment_reference: paymentReference,
      })
      .select('id')
      .single()

    if (policyError) throw policyError
    if (!policyData) throw new Error('Failed to create policy record')

    const policyId = policyData.id
    
    // 2. Create traveler records for each traveler
    for (const traveler of travelDetails.travelers) {
      const { error: travelerError } = await supabaseClient
        .from('traveler_info')
        .insert({
          policy_id: policyId,
          first_name: traveler.firstName,
          last_name: traveler.lastName,
          date_of_birth: traveler.dateOfBirth,
          email: traveler.email,
          phone: traveler.phone,
          emergency_contact: traveler.emergencyContact,
          address: traveler.address,
          passport_number: traveler.passport?.number,
          passport_issue_date: traveler.passport?.issueDate,
          passport_expiry_date: traveler.passport?.expiryDate,
          passport_nationality: traveler.passport?.nationality,
          beneficiary_name: traveler.beneficiary?.name,
          beneficiary_relationship: traveler.beneficiary?.relationship,
          beneficiary_contact: traveler.beneficiary?.contactDetails,
        })

      if (travelerError) throw travelerError
    }
    
    // 3. Create payment transaction record
    const { error: paymentError } = await supabaseClient
      .from('payment_transactions')
      .insert({
        policy_id: policyId,
        user_id: user.id,
        amount: price,
        currency: 'USD', // Default currency
        payment_method: paymentMethod,
        status: 'Completed', // Assume payment is successful
        reference: paymentReference || `PMT-${Date.now().toString(36).toUpperCase()}`,
      })

    if (paymentError) throw paymentError
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        policyId: policyId, 
        referenceNumber: referenceNumber 
      }),
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
