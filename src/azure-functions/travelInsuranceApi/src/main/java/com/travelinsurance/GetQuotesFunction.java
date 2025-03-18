package com.travelinsurance;

import com.microsoft.azure.functions.*;
import com.microsoft.azure.functions.annotation.*;
import org.json.JSONArray;
import org.json.JSONObject;

import java.sql.*;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;

/**
 * Azure Functions with HTTP Trigger for Getting Insurance Quotes
 */
public class GetQuotesFunction {
    // Database connection info - this would normally come from app settings
    private static final String DB_URL = System.getenv("MYSQL_CONNECTION_STRING");
    private static final String DB_USER = System.getenv("MYSQL_USER");
    private static final String DB_PASSWORD = System.getenv("MYSQL_PASSWORD");

    /**
     * This function listens at endpoint "/api/quotes".
     * Updated to use ANONYMOUS authorization level to allow unauthenticated requests
     * and support OPTIONS for CORS preflight
     */
    @FunctionName("getQuotes")
    public HttpResponseMessage run(
            @HttpTrigger(
                name = "req",
                methods = {HttpMethod.POST, HttpMethod.OPTIONS},
                authLevel = AuthorizationLevel.ANONYMOUS,
                route = "quotes")
                HttpRequestMessage<Optional<String>> request,
            final ExecutionContext context) {
        
        context.getLogger().info("Java HTTP trigger processed a request for insurance quotes.");
        context.getLogger().info("Request method: " + request.getHttpMethod().name());
        context.getLogger().info("Request URL: " + request.getUri().toString());
        
        // Define CORS headers
        Map<String, String> corsHeaders = new HashMap<>();
        corsHeaders.put("Access-Control-Allow-Origin", "*");
        corsHeaders.put("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        corsHeaders.put("Access-Control-Allow-Headers", "Content-Type, Authorization, x-client-info, apikey, x-requested-with, origin, accept");
        corsHeaders.put("Access-Control-Max-Age", "86400");
        
        // Log all request headers for debugging
        context.getLogger().info("=== REQUEST HEADERS ===");
        for (Map.Entry<String, String> header : request.getHeaders().entrySet()) {
            context.getLogger().info(header.getKey() + ": " + header.getValue());
        }
        
        // Handle OPTIONS request for CORS preflight
        if (request.getHttpMethod() == HttpMethod.OPTIONS) {
            context.getLogger().info("Handling OPTIONS request for CORS preflight");
            
            HttpResponseMessage.Builder responseBuilder = request.createResponseBuilder(HttpStatus.OK);
            // Add each CORS header individually
            for (Map.Entry<String, String> header : corsHeaders.entrySet()) {
                responseBuilder = responseBuilder.header(header.getKey(), header.getValue());
            }
            
            HttpResponseMessage responseMessage = responseBuilder.build();
            context.getLogger().info("OPTIONS response sent with CORS headers");
            return responseMessage;
        }

        // Parse request body
        String requestBody = request.getBody().orElse("");
        context.getLogger().info("Request body: " + requestBody);
        
        if (requestBody.isEmpty()) {
            context.getLogger().warning("Empty request body received");
            
            HttpResponseMessage.Builder responseBuilder = request.createResponseBuilder(HttpStatus.BAD_REQUEST)
                .body("Please provide travel details in the request body");
                
            // Add each CORS header individually
            for (Map.Entry<String, String> header : corsHeaders.entrySet()) {
                responseBuilder = responseBuilder.header(header.getKey(), header.getValue());
            }
            
            HttpResponseMessage responseMessage = responseBuilder.build();
            context.getLogger().info("Bad request response sent");
            return responseMessage;
        }

        try {
            // Parse the request JSON
            JSONObject requestJson = new JSONObject(requestBody);
            context.getLogger().info("Parsed JSON: " + requestJson.toString());
            
            // Extract travel details
            String coverageType = requestJson.getString("coverageType");
            String tripType = requestJson.getString("tripType");
            String startDate = requestJson.getString("startDate");
            String endDate = requestJson.getString("endDate");
            String coverType = requestJson.getString("coverType");
            JSONArray travelersJson = requestJson.getJSONArray("travelers");
            int numTravelers = travelersJson.length();
            
            context.getLogger().info("Processing quote for: " + coverageType + " - " + tripType + 
                                     " - from " + startDate + " to " + endDate + 
                                     " - " + coverType + " - Travelers: " + numTravelers);
            
            // Calculate trip duration
            LocalDate start = LocalDate.parse(startDate);
            LocalDate end = LocalDate.parse(endDate);
            long tripDays = ChronoUnit.DAYS.between(start, end) + 1;
            
            // Get insurance plans from database
            List<Map<String, Object>> plans = getInsurancePlans();
            context.getLogger().info("Retrieved " + plans.size() + " insurance plans from database");
            
            // Get benefits for all plans
            Map<String, List<Map<String, Object>>> benefitsByPlanId = getBenefitsByPlanId();
            
            // Calculate prices based on travel details
            List<Map<String, Object>> calculatedPlans = new ArrayList<>();
            
            for (Map<String, Object> plan : plans) {
                // Base multipliers
                double priceMultiplier = 1.0;
                
                // Adjust for coverage type
                if ("Worldwide".equals(coverageType)) {
                    priceMultiplier *= 1.5;
                } else if ("Schengen".equals(coverageType)) {
                    priceMultiplier *= 1.2;
                }
                
                // Adjust for trip type
                if ("Annual Multi-Trips".equals(tripType)) {
                    priceMultiplier *= 4; // Annual plans cost more
                } else {
                    // Adjust for trip duration for single trips
                    priceMultiplier *= Math.min(tripDays / 7.0, 10.0); // Cap at 10x for very long trips
                }
                
                // Adjust for cover type and number of travelers
                if ("Family".equals(coverType)) {
                    priceMultiplier *= Math.min(1.8, 1 + (numTravelers * 0.2)); // Family discount
                } else if ("Group".equals(coverType)) {
                    priceMultiplier *= Math.min(2.5, 1 + (numTravelers * 0.25)); // Group rate
                } else {
                    priceMultiplier *= numTravelers; // Individual: direct multiplication
                }
                
                // Calculate the final price
                double basePrice = ((Number) plan.get("base_price")).doubleValue();
                double calculatedPrice = Math.round(basePrice * priceMultiplier);
                
                // Create a copy of the plan with the calculated price
                Map<String, Object> calculatedPlan = new HashMap<>(plan);
                calculatedPlan.put("price", calculatedPrice);
                
                // Add benefits to the plan
                String planId = (String) plan.get("id");
                calculatedPlan.put("benefits", benefitsByPlanId.getOrDefault(planId, Collections.emptyList()));
                
                calculatedPlans.add(calculatedPlan);
            }
            
            // Convert the results to JSON
            JSONArray resultArray = new JSONArray();
            for (Map<String, Object> plan : calculatedPlans) {
                resultArray.put(new JSONObject(plan));
            }
            
            context.getLogger().info("Successfully processed quotes. Returning " + calculatedPlans.size() + " plans.");
            
            // Create the response with the required CORS headers
            HttpResponseMessage.Builder responseBuilder = request
                .createResponseBuilder(HttpStatus.OK)
                .header("Content-Type", "application/json")
                .body(resultArray.toString());
                
            // Add each CORS header individually
            for (Map.Entry<String, String> header : corsHeaders.entrySet()) {
                responseBuilder = responseBuilder.header(header.getKey(), header.getValue());
            }
            
            HttpResponseMessage responseMessage = responseBuilder.build();
            context.getLogger().info("Success response sent with quotes");
            
            // Log all response headers for debugging
            context.getLogger().info("=== RESPONSE HEADERS ===");
            // Log the headers we added
            for (Map.Entry<String, String> header : corsHeaders.entrySet()) {
                context.getLogger().info(header.getKey() + ": " + header.getValue() + " (added to response)");
            }
            
            return responseMessage;
                    
        } catch (Exception e) {
            context.getLogger().severe("Error processing request: " + e.getMessage());
            e.printStackTrace();
            
            HttpResponseMessage.Builder responseBuilder = request
                .createResponseBuilder(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error processing request: " + e.getMessage());
                
            // Add each CORS header individually
            for (Map.Entry<String, String> header : corsHeaders.entrySet()) {
                responseBuilder = responseBuilder.header(header.getKey(), header.getValue());
            }
            
            HttpResponseMessage responseMessage = responseBuilder.build();
            context.getLogger().info("Error response sent");
            return responseMessage;
        }
    }

    /**
     * Get all active insurance plans from the database
     */
    private List<Map<String, Object>> getInsurancePlans() throws SQLException {
        List<Map<String, Object>> plans = new ArrayList<>();
        
        try (Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASSWORD)) {
            String sql = "SELECT * FROM insurance_plans WHERE is_active = TRUE";
            try (PreparedStatement stmt = conn.prepareStatement(sql);
                 ResultSet rs = stmt.executeQuery()) {
                
                while (rs.next()) {
                    Map<String, Object> plan = new HashMap<>();
                    String planId = rs.getString("id");
                    
                    plan.put("id", planId);
                    plan.put("name", rs.getString("name"));
                    plan.put("provider", rs.getString("provider"));
                    plan.put("base_price", rs.getDouble("base_price"));
                    plan.put("coverage_limit", rs.getString("coverage_limit"));
                    plan.put("rating", rs.getDouble("rating"));
                    plan.put("terms", rs.getString("terms"));
                    plan.put("badge", rs.getString("badge"));
                    plan.put("logo_url", rs.getString("logo_url"));
                    
                    // Get exclusions
                    plan.put("exclusions", getExclusionsForPlan(conn, planId));
                    
                    // Get pros
                    plan.put("pros", getProsForPlan(conn, planId));
                    
                    // Get cons
                    plan.put("cons", getConsForPlan(conn, planId));
                    
                    plans.add(plan);
                }
            }
        }
        
        return plans;
    }

    /**
     * Get exclusions for a plan
     */
    private List<String> getExclusionsForPlan(Connection conn, String planId) throws SQLException {
        List<String> exclusions = new ArrayList<>();
        
        String sql = "SELECT exclusion FROM plan_exclusions WHERE plan_id = ?";
        try (PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, planId);
            
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    exclusions.add(rs.getString("exclusion"));
                }
            }
        }
        
        return exclusions;
    }

    /**
     * Get pros for a plan
     */
    private List<String> getProsForPlan(Connection conn, String planId) throws SQLException {
        List<String> pros = new ArrayList<>();
        
        String sql = "SELECT pro FROM plan_pros WHERE plan_id = ?";
        try (PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, planId);
            
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    pros.add(rs.getString("pro"));
                }
            }
        }
        
        return pros;
    }

    /**
     * Get cons for a plan
     */
    private List<String> getConsForPlan(Connection conn, String planId) throws SQLException {
        List<String> cons = new ArrayList<>();
        
        String sql = "SELECT con FROM plan_cons WHERE plan_id = ?";
        try (PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, planId);
            
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    cons.add(rs.getString("con"));
                }
            }
        }
        
        return cons;
    }

    /**
     * Get all benefits grouped by plan ID
     */
    private Map<String, List<Map<String, Object>>> getBenefitsByPlanId() throws SQLException {
        Map<String, List<Map<String, Object>>> benefitsByPlanId = new HashMap<>();
        
        try (Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASSWORD)) {
            String sql = "SELECT * FROM insurance_benefits";
            try (PreparedStatement stmt = conn.prepareStatement(sql);
                 ResultSet rs = stmt.executeQuery()) {
                
                while (rs.next()) {
                    String planId = rs.getString("plan_id");
                    
                    Map<String, Object> benefit = new HashMap<>();
                    benefit.put("name", rs.getString("name"));
                    benefit.put("description", rs.getString("description"));
                    benefit.put("limit", rs.getString("benefit_limit"));
                    benefit.put("isHighlighted", rs.getBoolean("is_highlighted"));
                    
                    benefitsByPlanId
                        .computeIfAbsent(planId, k -> new ArrayList<>())
                        .add(benefit);
                }
            }
        }
        
        return benefitsByPlanId;
    }
}
