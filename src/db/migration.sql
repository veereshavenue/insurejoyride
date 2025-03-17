
-- Create insurance_plans table
CREATE TABLE public.insurance_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    provider VARCHAR(255) NOT NULL,
    base_price DECIMAL(10, 2) NOT NULL,
    coverage_limit VARCHAR(255) NOT NULL,
    rating DECIMAL(3, 1) NOT NULL,
    terms TEXT NOT NULL,
    exclusions TEXT[] DEFAULT '{}',
    badge VARCHAR(50),
    pros TEXT[] DEFAULT '{}',
    cons TEXT[] DEFAULT '{}',
    logo_url VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

-- Create insurance_benefits table
CREATE TABLE public.insurance_benefits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plan_id UUID NOT NULL REFERENCES public.insurance_plans(id),
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    limit VARCHAR(255) NOT NULL,
    is_highlighted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_profiles table
CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    email VARCHAR(255) NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Create travel_policies table
CREATE TABLE public.travel_policies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    plan_id UUID NOT NULL REFERENCES public.insurance_plans(id),
    reference_number VARCHAR(50) NOT NULL UNIQUE,
    coverage_type VARCHAR(50) NOT NULL,
    origin_country VARCHAR(100) NOT NULL,
    destination_country VARCHAR(100) NOT NULL,
    trip_type VARCHAR(50) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    cover_type VARCHAR(50) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Active',
    payment_status VARCHAR(20) NOT NULL,
    payment_method VARCHAR(50),
    payment_reference VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create traveler_info table
CREATE TABLE public.traveler_info (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    policy_id UUID NOT NULL REFERENCES public.travel_policies(id),
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    date_of_birth DATE NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    emergency_contact VARCHAR(255),
    address TEXT,
    passport_number VARCHAR(50),
    passport_issue_date DATE,
    passport_expiry_date DATE,
    passport_nationality VARCHAR(100),
    beneficiary_name VARCHAR(255),
    beneficiary_relationship VARCHAR(100),
    beneficiary_contact VARCHAR(255),
    passport_document_url TEXT,
    visa_document_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create payment_transactions table
CREATE TABLE public.payment_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    policy_id UUID NOT NULL REFERENCES public.travel_policies(id),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL,
    reference VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create storage bucket for documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('travel_documents', 'travel_documents', true);

-- Set up RLS (Row Level Security) policies

-- Insurance Plans - Only authenticated users can read, only admins can modify
ALTER TABLE public.insurance_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active insurance plans" 
ON public.insurance_plans FOR SELECT 
USING (auth.role() = 'authenticated' AND is_active = true);

CREATE POLICY "Only admins can insert/update/delete insurance plans" 
ON public.insurance_plans FOR ALL 
USING (auth.role() = 'service_role');

-- Insurance Benefits - Similar to Insurance Plans
ALTER TABLE public.insurance_benefits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view insurance benefits" 
ON public.insurance_benefits FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Only admins can insert/update/delete insurance benefits" 
ON public.insurance_benefits FOR ALL 
USING (auth.role() = 'service_role');

-- User Profiles - Users can only access their own profiles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" 
ON public.user_profiles FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.user_profiles FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.user_profiles FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Travel Policies - Users can only access their own policies
ALTER TABLE public.travel_policies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own policies" 
ON public.travel_policies FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own policies" 
ON public.travel_policies FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own policies" 
ON public.travel_policies FOR UPDATE 
USING (auth.uid() = user_id);

-- Traveler Info - Users can access traveler info associated with their policies
ALTER TABLE public.traveler_info ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view travelers for their policies" 
ON public.traveler_info FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.travel_policies 
    WHERE public.travel_policies.id = public.traveler_info.policy_id 
    AND public.travel_policies.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert travelers for their policies" 
ON public.traveler_info FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.travel_policies 
    WHERE public.travel_policies.id = public.traveler_info.policy_id 
    AND public.travel_policies.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update travelers for their policies" 
ON public.traveler_info FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.travel_policies 
    WHERE public.travel_policies.id = public.traveler_info.policy_id 
    AND public.travel_policies.user_id = auth.uid()
  )
);

-- Payment Transactions - Users can only access their own transactions
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own payment transactions" 
ON public.payment_transactions FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own payment transactions" 
ON public.payment_transactions FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Sample Data for Insurance Plans and Benefits

-- Basic Plan
INSERT INTO public.insurance_plans (id, name, provider, base_price, coverage_limit, rating, terms, exclusions, badge, pros, cons, logo_url, is_active)
VALUES (
    '11111111-1111-1111-1111-111111111111',
    'Basic Coverage',
    'SafeTravel Insurance',
    50.00,
    '$100,000',
    3.5,
    'Standard terms and conditions apply. Please read the policy document for full details.',
    ARRAY['Pre-existing conditions', 'Extreme sports', 'Pandemics unless specified'],
    NULL,
    ARRAY['Affordable', 'Easy claims process', '24/7 assistance hotline'],
    ARRAY['Limited coverage', 'Higher deductibles', 'Fewer inclusions'],
    'https://example.com/logos/safetravel.png',
    TRUE
);

INSERT INTO public.insurance_benefits (plan_id, name, description, limit, is_highlighted)
VALUES 
('11111111-1111-1111-1111-111111111111', 'Medical Expenses', 'Coverage for emergency medical treatment during your trip', '$50,000', TRUE),
('11111111-1111-1111-1111-111111111111', 'Trip Cancellation', 'Reimbursement for prepaid, non-refundable trip expenses', '$1,000', FALSE),
('11111111-1111-1111-1111-111111111111', 'Baggage Loss', 'Coverage for lost, stolen, or damaged baggage', '$500', FALSE),
('11111111-1111-1111-1111-111111111111', 'Emergency Evacuation', 'Transportation to the nearest adequate medical facility', '$25,000', FALSE);

-- Standard Plan
INSERT INTO public.insurance_plans (id, name, provider, base_price, coverage_limit, rating, terms, exclusions, badge, pros, cons, logo_url, is_active)
VALUES (
    '22222222-2222-2222-2222-222222222222',
    'Standard Coverage',
    'GlobalGuard',
    100.00,
    '$500,000',
    4.2,
    'Standard terms and conditions apply. Please read the policy document for full details.',
    ARRAY['Pre-existing conditions unless declared', 'War and terrorism', 'Illegal activities'],
    'Popular',
    ARRAY['Comprehensive coverage', 'Low deductibles', 'Family-friendly options'],
    ARRAY['Higher premium than basic plans', 'Some destination restrictions'],
    'https://example.com/logos/globalguard.png',
    TRUE
);

INSERT INTO public.insurance_benefits (plan_id, name, description, limit, is_highlighted)
VALUES 
('22222222-2222-2222-2222-222222222222', 'Medical Expenses', 'Extensive coverage for emergency medical treatment during your trip', '$250,000', TRUE),
('22222222-2222-2222-2222-222222222222', 'Trip Cancellation', 'Full reimbursement for prepaid, non-refundable trip expenses', '$3,000', TRUE),
('22222222-2222-2222-2222-222222222222', 'Baggage Loss', 'Coverage for lost, stolen, or damaged baggage with low deductible', '$1,500', FALSE),
('22222222-2222-2222-2222-222222222222', 'Emergency Evacuation', 'Transportation to the nearest adequate medical facility or home country if necessary', '$100,000', FALSE),
('22222222-2222-2222-2222-222222222222', 'Travel Delay', 'Coverage for additional expenses due to trip delays', '$500 ($150 per day)', FALSE),
('22222222-2222-2222-2222-222222222222', 'Missed Connection', 'Reimbursement for expenses caused by missed connections', '$500', FALSE);

-- Premium Plan
INSERT INTO public.insurance_plans (id, name, provider, base_price, coverage_limit, rating, terms, exclusions, badge, pros, cons, logo_url, is_active)
VALUES (
    '33333333-3333-3333-3333-333333333333',
    'Premium Coverage',
    'EliteTraveler Insurance',
    200.00,
    '$1,000,000',
    4.8,
    'Premium terms offer the most comprehensive coverage available. Please read the policy document for full details.',
    ARRAY['Illegal activities', 'Self-inflicted injuries'],
    'Best Value',
    ARRAY['Maximum coverage limits', 'Zero deductibles', 'Concierge service included', 'Pre-existing conditions covered'],
    ARRAY['Higher premium cost'],
    'https://example.com/logos/elitetraveler.png',
    TRUE
);

INSERT INTO public.insurance_benefits (plan_id, name, description, limit, is_highlighted)
VALUES 
('33333333-3333-3333-3333-333333333333', 'Medical Expenses', 'Unlimited coverage for emergency medical treatment worldwide', '$1,000,000', TRUE),
('33333333-3333-3333-3333-333333333333', 'Trip Cancellation', 'Full reimbursement for any trip cancellation with documented reason', '$10,000', TRUE),
('33333333-3333-3333-3333-333333333333', 'Baggage Loss', 'Premium coverage for lost, stolen, or damaged baggage with zero deductible', '$3,000', TRUE),
('33333333-3333-3333-3333-333333333333', 'Emergency Evacuation', 'Private medical evacuation to home country if necessary', '$500,000', TRUE),
('33333333-3333-3333-3333-333333333333', 'Travel Delay', 'Premium coverage for additional expenses due to trip delays', '$1,000 ($200 per day)', FALSE),
('33333333-3333-3333-3333-333333333333', 'Rental Car Damage', 'Coverage for damage to rental vehicles', '$50,000', FALSE),
('33333333-3333-3333-3333-333333333333', 'Adventure Sports', 'Coverage for injuries sustained during adventure sports', '$50,000', FALSE),
('33333333-3333-3333-3333-333333333333', 'Concierge Service', '24/7 premium concierge service for any travel needs', 'Included', FALSE);
