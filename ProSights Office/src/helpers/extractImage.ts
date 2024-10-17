const API_BASE_URL = "https://extremely-excited-hawk.ngrok-free.app"; // Replace with your actual base URL

export interface ExtractedTable {
  header_row_md: string;
  main_table_md: string;
}

/**
 * Extracts table data from an image file.
 *
 * This function sends the image file to the API endpoint for table extraction
 * and returns the extracted text.
 *
 * @param {File} file - The image file containing the table to be extracted.
 * @returns {Promise<string>} A promise that resolves to the extracted text from the table.
 * @throws {Error} If the network request fails or the server responds with an error.
 *
 * @example
 * try {
 *   const imageFile = new File([...], "table.jpg", { type: "image/jpeg" });
 *   const extractedText = await extractTableFromImage(imageFile);
 *   console.log("Extracted text:", extractedText);
 * } catch (error) {
 *   console.error("Failed to extract table from image:", error);
 * }
 */
export async function extractTableFromImage(file: File): Promise<ExtractedTable> {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await fetch(`${API_BASE_URL}/office/extract_table_from_image`, {
      method: "POST",
      body: formData,
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    console.log("Response:", response);

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error extracting table from image:", error);
    throw error;
  }
}

interface UploadUrlResponse {
  uploadUrl: string;
  bucket_name: string;
  path: string;
}

/**
 * Fetches a pre-signed URL for uploading an image to cloud storage.
 *
 * This function makes a GET request to the API endpoint to obtain a temporary,
 * secure URL for uploading an image. It also returns additional information
 * about the upload destination.
 *
 * @returns {Promise<UploadUrlResponse>} A promise that resolves to an object containing:
 *   - uploadUrl: string - The pre-signed URL for uploading the image
 *   - bucket_name: string - The name of the cloud storage bucket
 *   - path: string - The path where the image will be stored in the bucket
 *
 * @throws {Error} If the network request fails or the server responds with an error
 *
 * @example
 * try {
 *   const { uploadUrl, bucket_name, path } = await getUploadUrl();
 *   // Use the uploadUrl to upload an image
 * } catch (error) {
 *   console.error("Failed to get upload URL:", error);
 * }
 */

export async function getUploadUrl(content_type: string): Promise<UploadUrlResponse> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/office/get_upload_url?content_type=${encodeURIComponent(content_type)}`,
      {
        method: "GET",
        cache: "no-cache",
        credentials: "include",
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Upload URL response:", data);
    return {
      uploadUrl: data.upload_url,
      bucket_name: data.bucket_name,
      path: data.path,
    };
  } catch (error) {
    console.error("Error fetching upload URL:", error);
    throw error;
  }
}

/**
 * Uploads an image file to the provided pre-signed URL.
 *
 * @param {string} uploadUrl - The pre-signed URL for uploading the image
 * @param {File} file - The image file to be uploaded
 * @returns {Promise<void>} A promise that resolves when the upload is complete
 * @throws {Error} If the upload fails
 */
export async function uploadImageToGcpBucketUrl(uploadUrl: string, file: File): Promise<void> {
  try {
    const response = await fetch(uploadUrl, {
      method: "PUT",
      body: file,
      headers: {
        "Content-Type": "application/octet-stream",
      },
    });

    console.log("Upload response:", response);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    console.log("Image uploaded successfully");
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
}
