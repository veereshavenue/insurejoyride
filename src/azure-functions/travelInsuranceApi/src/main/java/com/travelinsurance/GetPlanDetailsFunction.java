
package com.travelinsurance;

import com.microsoft.azure.functions.*;
import com.microsoft.azure.functions.annotation.*;
import org.json.JSONArray;
import org.json.JSONObject;

import java.sql.*;
import java.util.*;

/**
 * Azure Functions with HTTP Trigger for Getting Plan Details
 */
public class GetPlanDetailsFunction {
    // Database connection info - this would normally come from app settings
    private static final String DB_URL = System.getenv("MYSQL_CONNECTION_STRING");
    private static final String DB_USER = System.getenv("MYSQL_USER");
    private static final String DB_PASSWORD = System.getenv("MYSQL_PASSWORD");

    /**
     * This function listens at endpoint "/api/plans/{planId}".
     */
    @FunctionName("getPlanDetails")
    public HttpResponseMessage run(
            @HttpTrigger(
                name = "req",
                methods = {HttpMethod.GET},
                authLevel = AuthorizationLevel.FUNCTION,
                route = "plans/{planId}")
                HttpRequestMessage<Optional<String>> request,
            @BindingName("planId") String planId,
            final ExecutionContext context) {
        
        context.getLogger().info("Java HTTP trigger processed a request for plan details.");

        if (planId == null || planId.isEmpty()) {
            return request
                    .createResponseBuilder(HttpStatus.BAD_REQUEST)
                    .body("Please provide a plan ID")
                    .build();
        }

        try {
            // Get plan details
            Map<String, Object> plan = getPlanById(planId);
            
            if (plan == null) {
                return request
                        .createResponseBuilder(HttpStatus.NOT_FOUND)
                        .body("Plan not found")
                        .build();
            }
            
            // Get benefits for this plan
            List<Map<String, Object>> benefits = getBenefitsByPlanId(planId);
            plan.put("benefits", benefits);
            
            // Convert the results to JSON
            JSONObject resultJson = new JSONObject(plan);
            
            return request
                    .createResponseBuilder(HttpStatus.OK)
                    .header("Content-Type", "application/json")
                    .body(resultJson.toString())
                    .build();
                    
        } catch (Exception e) {
            context.getLogger().severe("Error processing request: " + e.getMessage());
            return request
                    .createResponseBuilder(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error processing request: " + e.getMessage())
                    .build();
        }
    }

    /**
     * Get a specific insurance plan by ID
     */
    private Map<String, Object> getPlanById(String planId) throws SQLException {
        try (Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASSWORD)) {
            String sql = "SELECT * FROM insurance_plans WHERE id = ? AND is_active = TRUE";
            try (PreparedStatement stmt = conn.prepareStatement(sql)) {
                stmt.setString(1, planId);
                
                try (ResultSet rs = stmt.executeQuery()) {
                    if (rs.next()) {
                        Map<String, Object> plan = new HashMap<>();
                        plan.put("id", rs.getString("id"));
                        plan.put("name", rs.getString("name"));
                        plan.put("provider", rs.getString("provider"));
                        plan.put("base_price", rs.getDouble("base_price"));
                        plan.put("coverage_limit", rs.getString("coverage_limit"));
                        plan.put("rating", rs.getDouble("rating"));
                        plan.put("terms", rs.getString("terms"));
                        
                        // Handle array types
                        Array exclusionsArray = rs.getArray("exclusions");
                        if (exclusionsArray != null) {
                            plan.put("exclusions", Arrays.asList((String[]) exclusionsArray.getArray()));
                        } else {
                            plan.put("exclusions", Collections.emptyList());
                        }
                        
                        plan.put("badge", rs.getString("badge"));
                        
                        Array prosArray = rs.getArray("pros");
                        if (prosArray != null) {
                            plan.put("pros", Arrays.asList((String[]) prosArray.getArray()));
                        } else {
                            plan.put("pros", Collections.emptyList());
                        }
                        
                        Array consArray = rs.getArray("cons");
                        if (consArray != null) {
                            plan.put("cons", Arrays.asList((String[]) consArray.getArray()));
                        } else {
                            plan.put("cons", Collections.emptyList());
                        }
                        
                        plan.put("logo_url", rs.getString("logo_url"));
                        
                        return plan;
                    }
                }
            }
        }
        
        return null;
    }

    /**
     * Get benefits for a specific plan
     */
    private List<Map<String, Object>> getBenefitsByPlanId(String planId) throws SQLException {
        List<Map<String, Object>> benefits = new ArrayList<>();
        
        try (Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASSWORD)) {
            String sql = "SELECT * FROM insurance_benefits WHERE plan_id = ?";
            try (PreparedStatement stmt = conn.prepareStatement(sql)) {
                stmt.setString(1, planId);
                
                try (ResultSet rs = stmt.executeQuery()) {
                    while (rs.next()) {
                        Map<String, Object> benefit = new HashMap<>();
                        benefit.put("name", rs.getString("name"));
                        benefit.put("description", rs.getString("description"));
                        benefit.put("limit", rs.getString("limit"));
                        benefit.put("isHighlighted", rs.getBoolean("is_highlighted"));
                        
                        benefits.add(benefit);
                    }
                }
            }
        }
        
        return benefits;
    }
}
