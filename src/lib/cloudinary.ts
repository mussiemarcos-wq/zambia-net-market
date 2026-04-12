import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface UploadResult {
  url: string;
  publicId: string;
  thumbnailUrl: string;
}

export async function uploadImage(
  buffer: Buffer,
  folder = "marketplace/listings"
): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
        transformation: [{ width: 800, crop: "limit" }],
      },
      (error, result) => {
        if (error || !result) {
          return reject(error || new Error("Upload failed"));
        }

        const url = result.secure_url;
        const publicId = result.public_id;

        // Build thumbnail URL with w_300,h_300,c_fill transformation
        const thumbnailUrl = cloudinary.url(publicId, {
          width: 300,
          height: 300,
          crop: "fill",
          secure: true,
        });

        resolve({ url, publicId, thumbnailUrl });
      }
    );

    uploadStream.end(buffer);
  });
}

export async function deleteImage(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId);
}

/**
 * Extract the public ID from a Cloudinary URL.
 * Example URL: https://res.cloudinary.com/demo/image/upload/v1234567890/marketplace/listings/abc123.jpg
 * Returns: marketplace/listings/abc123
 */
export function extractPublicId(cloudinaryUrl: string): string | null {
  try {
    const match = cloudinaryUrl.match(
      /\/upload\/(?:v\d+\/)?(.+?)(?:\.\w+)?$/
    );
    return match ? match[1] : null;
  } catch {
    return null;
  }
}
