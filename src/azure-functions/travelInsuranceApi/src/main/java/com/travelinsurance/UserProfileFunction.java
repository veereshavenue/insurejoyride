
package com.travelinsurance;

import com.microsoft.azure.functions.*;
import com.microsoft.azure.functions.annotation.*;
import org.json.JSONObject;

import java.sql.*;
import java.util.*;

/**
 * Azure Functions with HTTP Trigger for User Profile Management
 */
public class UserProfileFunction {
    // Database connection info - this would normally come from app settings
    private static final String DB_URL = System.getenv("MYSQL_CONNECTION_STRING");
    private static final String DB_USER = System.getenv("MYSQL_USER");
    private static final String DB_PASSWORD = System.getenv("MYSQL_PASSWORD");

    /**
     * This function listens at endpoint "/api/user-profile".
     */
    @FunctionName("getUserProfile")
    public HttpResponseMessage getProfile(
            @HttpTrigger(
                name = "req",
                methods = {HttpMethod.GET},
                authLevel = AuthorizationLevel.FUNCTION,
                route = "user-profile/{userId}")
                HttpRequestMessage<Optional<String>> request,
            @BindingName("userId") String userId,
            final ExecutionContext context) {
        
        context.getLogger().info("Java HTTP trigger processed a request to get user profile.");

        if (userId == null || userId.isEmpty()) {
            return request
                    .createResponseBuilder(HttpStatus.BAD_REQUEST)
                    .body("Please provide a user ID")
                    .build();
        }

        try {
            Map<String, Object> profile = getUserProfile(userId);
            
            if (profile == null) {
                return request
                        .createResponseBuilder(HttpStatus.NOT_FOUND)
                        .body("Profile not found")
                        .build();
            }
            
            // Convert the results to JSON
            JSONObject resultJson = new JSONObject(profile);
            
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
     * This function listens at endpoint "/api/user-profile" for updating profiles.
     */
    @FunctionName("updateUserProfile")
    public HttpResponseMessage updateProfile(
            @HttpTrigger(
                name = "req",
                methods = {HttpMethod.POST, HttpMethod.PUT},
                authLevel = AuthorizationLevel.FUNCTION,
                route = "user-profile")
                HttpRequestMessage<Optional<String>> request,
            final ExecutionContext context) {
        
        context.getLogger().info("Java HTTP trigger processed a request to update user profile.");

        // Parse request body
        String requestBody = request.getBody().orElse("");
        if (requestBody.isEmpty()) {
            return request
                    .createResponseBuilder(HttpStatus.BAD_REQUEST)
                    .body("Please provide profile data in the request body")
                    .build();
        }

        try {
            // Parse the request JSON
            JSONObject requestJson = new JSONObject(requestBody);
            
            // Extract required fields
            String userId = requestJson.getString("userId");
            String firstName = requestJson.getString("firstName");
            String lastName = requestJson.getString("lastName");
            String email = requestJson.getString("email");
            
            // Extract optional fields
            String phone = requestJson.optString("phone", null);
            String address = requestJson.optString("address", null);
            
            // Check if profile exists
            Boolean profileExists = checkProfileExists(userId);
            
            if (profileExists) {
                // Update profile
                updateUserProfile(userId, firstName, lastName, email, phone, address);
            } else {
                // Create profile
                createUserProfile(userId, firstName, lastName, email, phone, address);
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            JSONObject resultJson = new JSONObject(response);
            
            return request
                    .createResponseBuilder(HttpStatus.OK)
                    .header("Content-Type", "application/json")
                    .body(resultJson.toString())
                    .build();
                    
        } catch (Exception e) {
            context.getLogger().severe("Error processing request: " + e.getMessage());
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", e.getMessage());
            
            return request
                    .createResponseBuilder(HttpStatus.INTERNAL_SERVER_ERROR)
                    .header("Content-Type", "application/json")
                    .body(new JSONObject(response).toString())
                    .build();
        }
    }

    // Helper methods
    private Map<String, Object> getUserProfile(String userId) throws SQLException {
        try (Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASSWORD)) {
            String sql = "SELECT * FROM user_profiles WHERE user_id = ?";
            try (PreparedStatement stmt = conn.prepareStatement(sql)) {
                stmt.setString(1, userId);
                
                try (ResultSet rs = stmt.executeQuery()) {
                    if (rs.next()) {
                        Map<String, Object> profile = new HashMap<>();
                        profile.put("id", rs.getString("id"));
                        profile.put("userId", rs.getString("user_id"));
                        profile.put("email", rs.getString("email"));
                        profile.put("firstName", rs.getString("first_name"));
                        profile.put("lastName", rs.getString("last_name"));
                        profile.put("phone", rs.getString("phone"));
                        profile.put("address", rs.getString("address"));
                        profile.put("createdAt", rs.getString("created_at"));
                        profile.put("updatedAt", rs.getString("updated_at"));
                        
                        return profile;
                    }
                }
            }
        }
        
        return null;
    }
    
    private Boolean checkProfileExists(String userId) throws SQLException {
        try (Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASSWORD)) {
            String sql = "SELECT COUNT(*) FROM user_profiles WHERE user_id = ?";
            try (PreparedStatement stmt = conn.prepareStatement(sql)) {
                stmt.setString(1, userId);
                
                try (ResultSet rs = stmt.executeQuery()) {
                    if (rs.next()) {
                        return rs.getInt(1) > 0;
                    }
                }
            }
        }
        
        return false;
    }
    
    private void updateUserProfile(String userId, String firstName, String lastName, String email, String phone, String address) throws SQLException {
        try (Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASSWORD)) {
            String sql = "UPDATE user_profiles SET first_name = ?, last_name = ?, email = ?, phone = ?, address = ?, updated_at = NOW() WHERE user_id = ?";
            try (PreparedStatement stmt = conn.prepareStatement(sql)) {
                stmt.setString(1, firstName);
                stmt.setString(2, lastName);
                stmt.setString(3, email);
                stmt.setString(4, phone);
                stmt.setString(5, address);
                stmt.setString(6, userId);
                
                stmt.executeUpdate();
            }
        }
    }
    
    private void createUserProfile(String userId, String firstName, String lastName, String email, String phone, String address) throws SQLException {
        try (Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASSWORD)) {
            String sql = "INSERT INTO user_profiles (user_id, first_name, last_name, email, phone, address) VALUES (?, ?, ?, ?, ?, ?)";
            try (PreparedStatement stmt = conn.prepareStatement(sql)) {
                stmt.setString(1, userId);
                stmt.setString(2, firstName);
                stmt.setString(3, lastName);
                stmt.setString(4, email);
                stmt.setString(5, phone);
                stmt.setString(6, address);
                
                stmt.executeUpdate();
            }
        }
    }
}
