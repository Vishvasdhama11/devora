const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const SUPPORTED_IMAGE_TYPES = new Set([
  "image/avif",
  "image/bmp",
  "image/gif",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export function getImageFileError(file: Pick<File, "size" | "type">): string | null {
  if (!SUPPORTED_IMAGE_TYPES.has(file.type.toLowerCase())) {
    return "Choose a PNG, JPEG, WebP, GIF, AVIF, or BMP image.";
  }

  if (file.size === 0) {
    return "The selected image is empty.";
  }

  if (file.size > MAX_IMAGE_SIZE) {
    return "Images must be 5 MB or smaller.";
  }

  return null;
}

export function readImageDataUrl(file: File): Promise<string> {
  const validationError = getImageFileError(file);

  if (validationError) {
    return Promise.reject(new Error(validationError));
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(reader.error ?? new Error("The image could not be read."));
    reader.onabort = () => reject(new Error("Reading the image was cancelled."));
    reader.onload = () => {
      if (typeof reader.result !== "string" || !reader.result.startsWith(`data:${file.type.toLowerCase()};base64,`)) {
        reject(new Error("The browser returned an invalid image Data URL."));
        return;
      }

      resolve(reader.result);
    };

    reader.readAsDataURL(file);
  });
}
