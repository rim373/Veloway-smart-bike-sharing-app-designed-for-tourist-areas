package tn.supcom.cot.iam.controllers.managers;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import jakarta.ejb.Stateless;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.util.Map;
import java.util.Properties;

@Stateless
public class CloudinaryManager {

    private final Cloudinary cloudinary;

    public CloudinaryManager() {
        try {

            String cloudName = System.getenv("CLOUDINARY_CLOUD_NAME");
            String apiKey = System.getenv("CLOUDINARY_API_KEY");
            String apiSecret = System.getenv("CLOUDINARY_API_SECRET");


            if (cloudName == null || apiKey == null || apiSecret == null) {
                System.out.println("Loading Cloudinary config from properties file...");

                Properties props = new Properties();
                InputStream input = getClass().getClassLoader()
                        .getResourceAsStream("cloudinary.properties");

                if (input == null) {
                    throw new RuntimeException("cloudinary.properties file not found in resources folder");
                }

                props.load(input);

                cloudName = props.getProperty("cloudinary.cloud_name");
                apiKey = props.getProperty("cloudinary.api_key");
                apiSecret = props.getProperty("cloudinary.api_secret");

                input.close();
            }

            if (cloudName == null || apiKey == null || apiSecret == null) {
                throw new RuntimeException("Missing Cloudinary credentials");
            }

            cloudinary = new Cloudinary(ObjectUtils.asMap(
                    "cloud_name", cloudName,
                    "api_key", apiKey,
                    "api_secret", apiSecret
            ));

            System.out.println("✅ Cloudinary initialized successfully!");

        } catch (Exception e) {
            System.err.println("❌ Cloudinary initialization failed: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to initialize Cloudinary", e);
        }
    }

    public String uploadImage(File file, String folder) throws IOException {
        if (cloudinary == null) {
            throw new RuntimeException("Cloudinary not initialized");
        }

        System.out.println("Uploading image to Cloudinary: " + file.getName() + " in folder: " + folder);

        Map uploadResult = cloudinary.uploader().upload(file,
                ObjectUtils.asMap(
                        "folder", folder,
                        "resource_type", "image"
                )
        );

        String url = (String) uploadResult.get("secure_url");
        System.out.println("✅ Image uploaded successfully: " + url);

        return url;
    }

    public String uploadBase64Image(String base64Data, String folder) throws IOException {
        Map uploadResult = cloudinary.uploader().upload(base64Data,
                ObjectUtils.asMap(
                        "folder", folder,
                        "resource_type", "image"
                )
        );
        return (String) uploadResult.get("secure_url");
    }

    public void deleteImage(String publicId) throws IOException {
        cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
    }
}