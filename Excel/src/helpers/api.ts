const API_BASE_URL = "https://da16-50-74-121-90.ngrok-free.app"; // Replace with your actual base URL

interface UploadUrlResponse {
  uploadUrl: string;
  bucket_name: string;
  path: string;
}

export async function getUploadUrl(): Promise<UploadUrlResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/office/get_upload_url`, {
      method: "GET",
      cache: "no-cache",
    });

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
