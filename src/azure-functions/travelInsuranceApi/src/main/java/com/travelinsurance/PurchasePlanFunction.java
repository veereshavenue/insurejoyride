
package com.travelinsurance;

import com.microsoft.azure.functions.*;
import com.microsoft.azure.functions.annotation.*;
import org.json.JSONArray;
import org.json.JSONObject;

import java.sql.*;
import java.time.LocalDateTime;
import java.util.*;

/**
 * Azure Functions with HTTP Trigger for Purchasing an Insurance Plan
 */
public class PurchasePlanFunction {
    // Database connection info - this would normally come from app settings
    private static final String DB_URL = System.getenv("MYSQL_CONNECTION_STRING");
    private static final String DB_USER = System.getenv("MYSQL_USER");
    private static final String DB_PASSWORD = System.getenv("MYSQL_PASSWORD");

    /**
     * This function listens at endpoint "/api/purchase".
     */
    @FunctionName("purchasePlan")
    public HttpResponseMessage run(
            @HttpTrigger(
                name = "req",
                methods = {HttpMethod.POST},
                authLevel = AuthorizationLevel.FUNCTION,
                route = "purchase")
                HttpRequestMessage<Optional<String>> request,
            final ExecutionContext context) {
        
        context.getLogger().info("Java HTTP trigger processed a request to purchase an insurance plan.");

        // Parse request body
        String requestBody = request.getBody().orElse("");
        if (requestBody.isEmpty()) {
            return request
                    .createResponseBuilder(HttpStatus.BAD_REQUEST)
                    .body("Please provide purchase details in the request body")
                    .build();
        }

        Connection conn = null;
        try {
            // Parse the request JSON
            JSONObject requestJson = new JSONObject(requestBody);
            
            // Extract purchase details
            String userId = requestJson.getString("userId");
            String planId = requestJson.getString("planId");
            JSONObject travelDetails = requestJson.getJSONObject("travelDetails");
            double price = requestJson.getDouble("price");
            String paymentMethod = requestJson.getString("paymentMethod");
            String paymentReference = requestJson.optString("paymentReference", null);
            
            // Generate a reference number for the policy
            String referenceNumber = "POL-" + System.currentTimeMillis() + "-" + 
                                    String.format("%04d", new Random().nextInt(10000));
            
            // Start database transaction
            conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASSWORD);
            conn.setAutoCommit(false);
            
            // 1. Create the travel policy record
            String policyId = createTravelPolicy(conn, userId, planId, referenceNumber, travelDetails, 
                                                price, paymentMethod, paymentReference);
            
            // 2. Create traveler records
            JSONArray travelers = travelDetails.getJSONArray("travelers");
            for (int i = 0; i < travelers.length(); i++) {
                JSONObject traveler = travelers.getJSONObject(i);
                createTravelerInfo(conn, policyId, traveler);
            }
            
            // 3. Create payment transaction record
            createPaymentTransaction(conn, policyId, userId, price, paymentMethod, paymentReference);
            
            // Commit the transaction
            conn.commit();
            
            // Prepare the response
            JSONObject response = new JSONObject();
            response.put("success", true);
            response.put("policyId", policyId);
            response.put("referenceNumber", referenceNumber);
            
            return request
                    .createResponseBuilder(HttpStatus.OK)
                    .header("Content-Type", "application/json")
                    .body(response.toString())
                    .build();
                    
        } catch (Exception e) {
            // Rollback transaction on error
            if (conn != null) {
                try {
                    conn.rollback();
                } catch (SQLException ex) {
                    context.getLogger().severe("Error rolling back transaction: " + ex.getMessage());
                }
            }
            
            context.getLogger().severe("Error processing purchase: " + e.getMessage());
            return request
                    .createResponseBuilder(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error processing purchase: " + e.getMessage())
                    .build();
        } finally {
            if (conn != null) {
                try {
                    conn.close();
                } catch (SQLException ex) {
                    context.getLogger().severe("Error closing connection: " + ex.getMessage());
                }
            }
        }
    }

    /**
     * Create a travel policy record
     */
    private String createTravelPolicy(Connection conn, String userId, String planId, String referenceNumber,
                                    JSONObject travelDetails, double price, String paymentMethod,
                                    String paymentReference) throws SQLException {
        String sql = "INSERT INTO travel_policies (user_id, plan_id, reference_number, " +
                    "coverage_type, origin_country, destination_country, trip_type, " +
                    "start_date, end_date, cover_type, total_price, status, " +
                    "payment_status, payment_method, payment_reference) " +
                    "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        
        try (PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            stmt.setString(1, userId);
            stmt.setString(2, planId);
            stmt.setString(3, referenceNumber);
            stmt.setString(4, travelDetails.getString("coverageType"));
            stmt.setString(5, travelDetails.getString("originCountry"));
            stmt.setString(6, travelDetails.getString("destinationCountry"));
            stmt.setString(7, travelDetails.getString("tripType"));
            stmt.setDate(8, java.sql.Date.valueOf(travelDetails.getString("startDate")));
            stmt.setDate(9, java.sql.Date.valueOf(travelDetails.getString("endDate")));
            stmt.setString(10, travelDetails.getString("coverType"));
            stmt.setDouble(11, price);
            stmt.setString(12, "Active");
            stmt.setString(13, "Completed"); // Assume payment is successful
            stmt.setString(14, paymentMethod);
            stmt.setString(15, paymentReference);
            
            stmt.executeUpdate();
            
            try (ResultSet generatedKeys = stmt.getGeneratedKeys()) {
                if (generatedKeys.next()) {
                    return generatedKeys.getString(1);
                } else {
                    throw new SQLException("Creating policy failed, no ID obtained.");
                }
            }
        }
    }

    /**
     * Create a traveler info record
     */
    private void createTravelerInfo(Connection conn, String policyId, JSONObject traveler) throws SQLException {
        String sql = "INSERT INTO traveler_info (policy_id, first_name, last_name, date_of_birth, " +
                    "email, phone, emergency_contact, address, passport_number, " +
                    "passport_issue_date, passport_expiry_date, passport_nationality, " +
                    "beneficiary_name, beneficiary_relationship, beneficiary_contact) " +
                    "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        
        try (PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, policyId);
            stmt.setString(2, traveler.getString("firstName"));
            stmt.setString(3, traveler.getString("lastName"));
            stmt.setDate(4, java.sql.Date.valueOf(traveler.getString("dateOfBirth")));
            
            stmt.setString(5, traveler.optString("email", null));
            stmt.setString(6, traveler.optString("phone", null));
            stmt.setString(7, traveler.optString("emergencyContact", null));
            stmt.setString(8, traveler.optString("address", null));
            
            // Handle passport info if present
            JSONObject passport = traveler.optJSONObject("passport");
            if (passport != null) {
                stmt.setString(9, passport.optString("number", null));
                String issueDate = passport.optString("issueDate", null);
                stmt.setDate(10, issueDate != null ? java.sql.Date.valueOf(issueDate) : null);
                String expiryDate = passport.optString("expiryDate", null);
                stmt.setDate(11, expiryDate != null ? java.sql.Date.valueOf(expiryDate) : null);
                stmt.setString(12, passport.optString("nationality", null));
            } else {
                stmt.setNull(9, Types.VARCHAR);
                stmt.setNull(10, Types.DATE);
                stmt.setNull(11, Types.DATE);
                stmt.setNull(12, Types.VARCHAR);
            }
            
            // Handle beneficiary info if present
            JSONObject beneficiary = traveler.optJSONObject("beneficiary");
            if (beneficiary != null) {
                stmt.setString(13, beneficiary.optString("name", null));
                stmt.setString(14, beneficiary.optString("relationship", null));
                stmt.setString(15, beneficiary.optString("contactDetails", null));
            } else {
                stmt.setNull(13, Types.VARCHAR);
                stmt.setNull(14, Types.VARCHAR);
                stmt.setNull(15, Types.VARCHAR);
            }
            
            stmt.executeUpdate();
        }
    }

    /**
     * Create a payment transaction record
     */
    private void createPaymentTransaction(Connection conn, String policyId, String userId, 
                                        double amount, String paymentMethod, String paymentReference) throws SQLException {
        String sql = "INSERT INTO payment_transactions (policy_id, user_id, amount, currency, " +
                    "payment_method, status, reference) " +
                    "VALUES (?, ?, ?, ?, ?, ?, ?)";
        
        if (paymentReference == null || paymentReference.isEmpty()) {
            paymentReference = "PMT-" + System.currentTimeMillis() + "-" + 
                            String.format("%04d", new Random().nextInt(10000));
        }
        
        try (PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, policyId);
            stmt.setString(2, userId);
            stmt.setDouble(3, amount);
            stmt.setString(4, "USD"); // Default currency
            stmt.setString(5, paymentMethod);
            stmt.setString(6, "Completed"); // Assume payment is successful
            stmt.setString(7, paymentReference);
            
            stmt.executeUpdate();
        }
    }
}
