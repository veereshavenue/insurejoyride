
package com.travelinsurance;

import com.microsoft.azure.functions.*;
import com.microsoft.azure.functions.annotation.*;
import org.json.JSONObject;

import java.sql.*;
import java.util.*;

/**
 * Azure Functions with HTTP Trigger for Payment Processing
 */
public class PaymentFunction {
    // Database connection info - this would normally come from app settings
    private static final String DB_URL = System.getenv("MYSQL_CONNECTION_STRING");
    private static final String DB_USER = System.getenv("MYSQL_USER");
    private static final String DB_PASSWORD = System.getenv("MYSQL_PASSWORD");

    /**
     * This function listens at endpoint "/api/payment/process".
     */
    @FunctionName("processPayment")
    public HttpResponseMessage run(
            @HttpTrigger(
                name = "req",
                methods = {HttpMethod.POST},
                authLevel = AuthorizationLevel.FUNCTION,
                route = "payment/process")
                HttpRequestMessage<Optional<String>> request,
            final ExecutionContext context) {
        
        context.getLogger().info("Java HTTP trigger processed a payment request.");

        // Parse request body
        String requestBody = request.getBody().orElse("");
        if (requestBody.isEmpty()) {
            return request
                    .createResponseBuilder(HttpStatus.BAD_REQUEST)
                    .body("Please provide payment details in the request body")
                    .build();
        }

        try {
            // Parse the request JSON
            JSONObject requestJson = new JSONObject(requestBody);
            
            // Extract payment details
            String userId = requestJson.getString("userId");
            double amount = requestJson.getDouble("amount");
            String currency = requestJson.getString("currency");
            String paymentMethod = requestJson.getString("paymentMethod");
            
            // For credit card payments
            String cardNumber = requestJson.optString("cardNumber", null);
            String cardExpiry = requestJson.optString("cardExpiry", null);
            String cardCvv = requestJson.optString("cardCvv", null);
            String cardHolderName = requestJson.optString("cardHolderName", null);
            
            // In a real implementation, this would call a payment gateway API
            // For this example, we'll simulate a successful payment 90% of the time
            boolean isSuccessful = Math.random() > 0.1;
            
            if (!isSuccessful) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("error", "Payment failed. Please try again with a different payment method.");
                
                return request
                        .createResponseBuilder(HttpStatus.BAD_REQUEST)
                        .header("Content-Type", "application/json")
                        .body(new JSONObject(response).toString())
                        .build();
            }
            
            // Generate payment reference
            String paymentReference = "TXN-" + Long.toString(System.currentTimeMillis(), 36).toUpperCase() + 
                                     "-" + String.format("%04d", (int)(Math.random() * 10000));
            
            // Response with payment reference
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("reference", paymentReference);
            
            return request
                    .createResponseBuilder(HttpStatus.OK)
                    .header("Content-Type", "application/json")
                    .body(new JSONObject(response).toString())
                    .build();
                    
        } catch (Exception e) {
            context.getLogger().severe("Error processing payment: " + e.getMessage());
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
}
