/**
 * Industry Standard Client-Side Image Optimizer
 * Seamlessly resizes and compresses high-resolution camera photos (5MB - 20MB)
 * down to crisp, lightweight images (~100KB - 300KB) before upload and AI screening.
 */

export interface OptimizedImageResult {
  file: File;
  previewUrl: string;
  base64: string;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  formattedOriginal: string;
  formattedCompressed: string;
}

export interface ImageOptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  mimeType?: "image/webp" | "image/jpeg";
}

function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

export async function optimizeProfilePhoto(
  file: File,
  options: ImageOptimizationOptions = {}
): Promise<OptimizedImageResult> {
  const {
    maxWidth = 1024,
    maxHeight = 1024,
    quality = 0.82,
    mimeType = "image/jpeg",
  } = options;

  return new Promise((resolve, reject) => {
    // If not an image, reject
    if (!file.type.startsWith("image/")) {
      reject(new Error("Selected file is not an image."));
      return;
    }

    const originalSize = file.size;
    const reader = new FileReader();

    reader.onerror = () => reject(new Error("Failed to read image file."));

    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error("Failed to load image preview."));

      img.onload = () => {
        let { width, height } = img;

        // Calculate aspect-ratio preserved dimensions
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        // Create high performance off-screen canvas
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Could not initialize 2D graphics canvas."));
          return;
        }

        // Apply smooth downsampling algorithms
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to optimized Base64
        const base64 = canvas.toDataURL(mimeType, quality);

        // Convert to Blob & File
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Image compression failed."));
              return;
            }

            const optimizedFileName = file.name.replace(/\.[^/.]+$/, "") + (mimeType === "image/webp" ? ".webp" : ".jpg");
            const optimizedFile = new File([blob], optimizedFileName, {
              type: mimeType,
              lastModified: Date.now(),
            });

            const compressedSize = blob.size;
            const ratio = originalSize > 0 ? Math.round(((originalSize - compressedSize) / originalSize) * 100) : 0;
            const previewUrl = URL.createObjectURL(blob);

            resolve({
              file: optimizedFile,
              previewUrl,
              base64,
              originalSize,
              compressedSize,
              compressionRatio: Math.max(0, ratio),
              formattedOriginal: formatBytes(originalSize),
              formattedCompressed: formatBytes(compressedSize),
            });
          },
          mimeType,
          quality
        );
      };

      img.src = e.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}
