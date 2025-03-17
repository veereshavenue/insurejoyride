
-- Create insurance_plans table
CREATE TABLE insurance_plans (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    provider VARCHAR(255) NOT NULL,
    base_price DECIMAL(10, 2) NOT NULL,
    coverage_limit VARCHAR(255) NOT NULL,
    rating DECIMAL(3, 1) NOT NULL,
    terms TEXT NOT NULL,
    badge VARCHAR(50),
    logo_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- Create plan_exclusions table for storing arrays
CREATE TABLE plan_exclusions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    plan_id VARCHAR(36) NOT NULL,
    exclusion TEXT NOT NULL,
    FOREIGN KEY (plan_id) REFERENCES insurance_plans(id)
);

-- Create plan_pros table for storing arrays
CREATE TABLE plan_pros (
    id INT AUTO_INCREMENT PRIMARY KEY,
    plan_id VARCHAR(36) NOT NULL,
    pro TEXT NOT NULL,
    FOREIGN KEY (plan_id) REFERENCES insurance_plans(id)
);

-- Create plan_cons table for storing arrays
CREATE TABLE plan_cons (
    id INT AUTO_INCREMENT PRIMARY KEY,
    plan_id VARCHAR(36) NOT NULL,
    con TEXT NOT NULL,
    FOREIGN KEY (plan_id) REFERENCES insurance_plans(id)
);

-- Create insurance_benefits table
CREATE TABLE insurance_benefits (
    id VARCHAR(36) PRIMARY KEY,
    plan_id VARCHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    benefit_limit VARCHAR(255) NOT NULL,
    is_highlighted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (plan_id) REFERENCES insurance_plans(id)
);

-- Create user_profiles table
CREATE TABLE user_profiles (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create travel_policies table
CREATE TABLE travel_policies (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    plan_id VARCHAR(36) NOT NULL,
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (plan_id) REFERENCES insurance_plans(id)
);

-- Create traveler_info table
CREATE TABLE traveler_info (
    id VARCHAR(36) PRIMARY KEY,
    policy_id VARCHAR(36) NOT NULL,
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (policy_id) REFERENCES travel_policies(id)
);

-- Create payment_transactions table
CREATE TABLE payment_transactions (
    id VARCHAR(36) PRIMARY KEY,
    policy_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL,
    reference VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (policy_id) REFERENCES travel_policies(id)
);

-- Create document_uploads table
CREATE TABLE document_uploads (
    id VARCHAR(36) PRIMARY KEY,
    traveler_id VARCHAR(36) NOT NULL,
    document_type VARCHAR(50) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    content_type VARCHAR(100) NOT NULL,
    file_size INT NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (traveler_id) REFERENCES traveler_info(id)
);

-- Sample Data for Insurance Plans and Benefits

-- Basic Plan
INSERT INTO insurance_plans (id, name, provider, base_price, coverage_limit, rating, terms, badge, logo_url, is_active)
VALUES (
    'b1111111-1111-1111-1111-111111111111',
    'Basic Coverage',
    'SafeTravel Insurance',
    50.00,
    '$100,000',
    3.5,
    'Standard terms and conditions apply. Please read the policy document for full details.',
    NULL,
    'https://example.com/logos/safetravel.png',
    TRUE
);

-- Insert exclusions for Basic Plan
INSERT INTO plan_exclusions (plan_id, exclusion) VALUES 
('b1111111-1111-1111-1111-111111111111', 'Pre-existing conditions'),
('b1111111-1111-1111-1111-111111111111', 'Extreme sports'),
('b1111111-1111-1111-1111-111111111111', 'Pandemics unless specified');

-- Insert pros for Basic Plan
INSERT INTO plan_pros (plan_id, pro) VALUES 
('b1111111-1111-1111-1111-111111111111', 'Affordable'),
('b1111111-1111-1111-1111-111111111111', 'Easy claims process'),
('b1111111-1111-1111-1111-111111111111', '24/7 assistance hotline');

-- Insert cons for Basic Plan
INSERT INTO plan_cons (plan_id, con) VALUES 
('b1111111-1111-1111-1111-111111111111', 'Limited coverage'),
('b1111111-1111-1111-1111-111111111111', 'Higher deductibles'),
('b1111111-1111-1111-1111-111111111111', 'Fewer inclusions');

-- Insert benefits for Basic Plan
INSERT INTO insurance_benefits (id, plan_id, name, description, benefit_limit, is_highlighted)
VALUES 
('b1001', 'b1111111-1111-1111-1111-111111111111', 'Medical Expenses', 'Coverage for emergency medical treatment during your trip', '$50,000', TRUE),
('b1002', 'b1111111-1111-1111-1111-111111111111', 'Trip Cancellation', 'Reimbursement for prepaid, non-refundable trip expenses', '$1,000', FALSE),
('b1003', 'b1111111-1111-1111-1111-111111111111', 'Baggage Loss', 'Coverage for lost, stolen, or damaged baggage', '$500', FALSE),
('b1004', 'b1111111-1111-1111-1111-111111111111', 'Emergency Evacuation', 'Transportation to the nearest adequate medical facility', '$25,000', FALSE);

-- Standard Plan
INSERT INTO insurance_plans (id, name, provider, base_price, coverage_limit, rating, terms, badge, logo_url, is_active)
VALUES (
    's2222222-2222-2222-2222-222222222222',
    'Standard Coverage',
    'GlobalGuard',
    100.00,
    '$500,000',
    4.2,
    'Standard terms and conditions apply. Please read the policy document for full details.',
    'Popular',
    'https://example.com/logos/globalguard.png',
    TRUE
);

-- Insert exclusions for Standard Plan
INSERT INTO plan_exclusions (plan_id, exclusion) VALUES 
('s2222222-2222-2222-2222-222222222222', 'Pre-existing conditions unless declared'),
('s2222222-2222-2222-2222-222222222222', 'War and terrorism'),
('s2222222-2222-2222-2222-222222222222', 'Illegal activities');

-- Insert pros for Standard Plan
INSERT INTO plan_pros (plan_id, pro) VALUES 
('s2222222-2222-2222-2222-222222222222', 'Comprehensive coverage'),
('s2222222-2222-2222-2222-222222222222', 'Low deductibles'),
('s2222222-2222-2222-2222-222222222222', 'Family-friendly options');

-- Insert cons for Standard Plan
INSERT INTO plan_cons (plan_id, con) VALUES 
('s2222222-2222-2222-2222-222222222222', 'Higher premium than basic plans'),
('s2222222-2222-2222-2222-222222222222', 'Some destination restrictions');

-- Insert benefits for Standard Plan
INSERT INTO insurance_benefits (id, plan_id, name, description, benefit_limit, is_highlighted)
VALUES 
('s2001', 's2222222-2222-2222-2222-222222222222', 'Medical Expenses', 'Extensive coverage for emergency medical treatment during your trip', '$250,000', TRUE),
('s2002', 's2222222-2222-2222-2222-222222222222', 'Trip Cancellation', 'Full reimbursement for prepaid, non-refundable trip expenses', '$3,000', TRUE),
('s2003', 's2222222-2222-2222-2222-222222222222', 'Baggage Loss', 'Coverage for lost, stolen, or damaged baggage with low deductible', '$1,500', FALSE),
('s2004', 's2222222-2222-2222-2222-222222222222', 'Emergency Evacuation', 'Transportation to the nearest adequate medical facility or home country if necessary', '$100,000', FALSE),
('s2005', 's2222222-2222-2222-2222-222222222222', 'Travel Delay', 'Coverage for additional expenses due to trip delays', '$500 ($150 per day)', FALSE),
('s2006', 's2222222-2222-2222-2222-222222222222', 'Missed Connection', 'Reimbursement for expenses caused by missed connections', '$500', FALSE);

-- Premium Plan
INSERT INTO insurance_plans (id, name, provider, base_price, coverage_limit, rating, terms, badge, logo_url, is_active)
VALUES (
    'p3333333-3333-3333-3333-333333333333',
    'Premium Coverage',
    'EliteTraveler Insurance',
    200.00,
    '$1,000,000',
    4.8,
    'Premium terms offer the most comprehensive coverage available. Please read the policy document for full details.',
    'Best Value',
    'https://example.com/logos/elitetraveler.png',
    TRUE
);

-- Insert exclusions for Premium Plan
INSERT INTO plan_exclusions (plan_id, exclusion) VALUES 
('p3333333-3333-3333-3333-333333333333', 'Illegal activities'),
('p3333333-3333-3333-3333-333333333333', 'Self-inflicted injuries');

-- Insert pros for Premium Plan
INSERT INTO plan_pros (plan_id, pro) VALUES 
('p3333333-3333-3333-3333-333333333333', 'Maximum coverage limits'),
('p3333333-3333-3333-3333-333333333333', 'Zero deductibles'),
('p3333333-3333-3333-3333-333333333333', 'Concierge service included'),
('p3333333-3333-3333-3333-333333333333', 'Pre-existing conditions covered');

-- Insert cons for Premium Plan
INSERT INTO plan_cons (plan_id, con) VALUES 
('p3333333-3333-3333-3333-333333333333', 'Higher premium cost');

-- Insert benefits for Premium Plan
INSERT INTO insurance_benefits (id, plan_id, name, description, benefit_limit, is_highlighted)
VALUES 
('p3001', 'p3333333-3333-3333-3333-333333333333', 'Medical Expenses', 'Unlimited coverage for emergency medical treatment worldwide', '$1,000,000', TRUE),
('p3002', 'p3333333-3333-3333-3333-333333333333', 'Trip Cancellation', 'Full reimbursement for any trip cancellation with documented reason', '$10,000', TRUE),
('p3003', 'p3333333-3333-3333-3333-333333333333', 'Baggage Loss', 'Premium coverage for lost, stolen, or damaged baggage with zero deductible', '$3,000', TRUE),
('p3004', 'p3333333-3333-3333-3333-333333333333', 'Emergency Evacuation', 'Private medical evacuation to home country if necessary', '$500,000', TRUE),
('p3005', 'p3333333-3333-3333-3333-333333333333', 'Travel Delay', 'Premium coverage for additional expenses due to trip delays', '$1,000 ($200 per day)', FALSE),
('p3006', 'p3333333-3333-3333-3333-333333333333', 'Rental Car Damage', 'Coverage for damage to rental vehicles', '$50,000', FALSE),
('p3007', 'p3333333-3333-3333-3333-333333333333', 'Adventure Sports', 'Coverage for injuries sustained during adventure sports', '$50,000', FALSE),
('p3008', 'p3333333-3333-3333-3333-333333333333', 'Concierge Service', '24/7 premium concierge service for any travel needs', 'Included', FALSE);
