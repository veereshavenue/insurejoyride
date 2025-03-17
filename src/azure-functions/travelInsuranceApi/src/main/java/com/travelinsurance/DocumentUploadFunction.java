
package com.travelinsurance;

import com.microsoft.azure.functions.*;
import com.microsoft.azure.functions.annotation.*;
import org.json.JSONObject;

import java.sql.*;
import java.util.*;
import java.util.Base64;
import java.util.UUID;

/**
 * Azure Functions with HTTP Trigger for Document Uploads
 */
public class DocumentUploadFunction {
    // Database connection info
    private static final String DB_URL = System.getenv("MYSQL_CONNECTION_STRING");
    private static final String DB_USER = System.getenv("MYSQL_USER");
    private static final String DB_PASSWORD = System.getenv("MYSQL_PASSWORD");
    private static final String STORAGE_CONNECTION = System.getenv("STORAGE_CONNECTION_STRING");

    /**
     * This function listens at endpoint "/api/documents/upload".
     */
    @FunctionName("uploadDocument")
    public HttpResponseMessage run(
            @HttpTrigger(
                name = "req",
                methods = {HttpMethod.POST},
                authLevel = AuthorizationLevel.FUNCTION,
                route = "documents/upload")
                HttpRequestMessage<Optional<String>> request,
            final ExecutionContext context) {
        
        context.getLogger().info("Java HTTP trigger processed a document upload request.");

        // Parse request body
        String requestBody = request.getBody().orElse("");
        if (requestBody.isEmpty()) {
            return request
                    .createResponseBuilder(HttpStatus.BAD_REQUEST)
                    .body("Please provide document data in the request body")
                    .build();
        }

        try {
            // Parse the request JSON
            JSONObject requestJson = new JSONObject(requestBody);
            
            // Extract required fields
            String userId = requestJson.getString("userId");
            String policyId = requestJson.getString("policyId");
            String travelerId = requestJson.getString("travelerId");
            String documentType = requestJson.getString("documentType");
            String fileData = requestJson.getString("fileData"); // Base64 encoded file
            String fileName = requestJson.getString("fileName");
            String contentType = requestJson.optString("contentType", "application/octet-stream");
            
            // Generate a unique filename
            String fileExtension = fileName.substring(fileName.lastIndexOf("."));
            String uniqueFilePath = userId + "/" + policyId + "/" + travelerId + "/" + 
                                  documentType + "_" + System.currentTimeMillis() + fileExtension;
            
            // In a real application, this would upload to Azure Blob Storage
            // Here, we'll simulate the upload and return a mock URL
            String documentUrl = simulateFileUpload(fileData, uniqueFilePath);
            
            // Store document info in the database
            String documentId = storeDocumentInfo(travelerId, documentType, uniqueFilePath, fileName, contentType, fileData.length());
            
            // Update the traveler record with the document URL
            updateTravelerDocumentUrl(travelerId, documentType, documentUrl);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("documentId", documentId);
            response.put("url", documentUrl);
            
            return request
                    .createResponseBuilder(HttpStatus.OK)
                    .header("Content-Type", "application/json")
                    .body(new JSONObject(response).toString())
                    .build();
                    
        } catch (Exception e) {
            context.getLogger().severe("Error processing document upload: " + e.getMessage());
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

    /**
     * Simulate uploading a file to storage
     * In a real app, this would use the Azure Storage SDK
     */
    private String simulateFileUpload(String base64Data, String filePath) {
        // In a real application, this method would:
        // 1. Decode the base64 data
        // 2. Upload the file to Azure Blob Storage
        // 3. Return the URL
        
        // For this example, we'll just return a simulated URL
        return "https://traveldocuments.blob.core.windows.net/travel-documents/" + filePath;
    }
    
    /**
     * Store document information in the database
     */
    private String storeDocumentInfo(String travelerId, String documentType, String filePath, 
                                  String originalFilename, String contentType, int fileSize) throws SQLException {
        String documentId = UUID.randomUUID().toString();
        
        try (Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASSWORD)) {
            String sql = "INSERT INTO document_uploads (id, traveler_id, document_type, file_path, original_filename, content_type, file_size) " +
                        "VALUES (?, ?, ?, ?, ?, ?, ?)";
            try (PreparedStatement stmt = conn.prepareStatement(sql)) {
                stmt.setString(1, documentId);
                stmt.setString(2, travelerId);
                stmt.setString(3, documentType);
                stmt.setString(4, filePath);
                stmt.setString(5, originalFilename);
                stmt.setString(6, contentType);
                stmt.setInt(7, fileSize);
                
                stmt.executeUpdate();
            }
        }
        
        return documentId;
    }
    
    /**
     * Update the traveler record with the document URL
     */
    private void updateTravelerDocumentUrl(String travelerId, String documentType, String documentUrl) throws SQLException {
        try (Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASSWORD)) {
            // Determine which field to update based on document type
            String fieldName;
            if ("passport".equalsIgnoreCase(documentType)) {
                fieldName = "passport_document_url";
            } else if ("visa".equalsIgnoreCase(documentType)) {
                fieldName = "visa_document_url";
            } else {
                throw new IllegalArgumentException("Invalid document type: " + documentType);
            }
            
            String sql = "UPDATE traveler_info SET " + fieldName + " = ? WHERE id = ?";
            try (PreparedStatement stmt = conn.prepareStatement(sql)) {
                stmt.setString(1, documentUrl);
                stmt.setString(2, travelerId);
                
                stmt.executeUpdate();
            }
        }
    }
}
