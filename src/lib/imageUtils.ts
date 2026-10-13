/**
 * Client-side utility to convert any uploaded image File (JPEG, PNG, HEIC, etc.)
 * into optimized .webp format using HTML5 Canvas before uploading to the server.
 */
export async function convertToWebP(file: File, quality = 0.85): Promise<File> {
  // If already webp and reasonably sized, return directly
  if (file.type === 'image/webp') {
    return file;
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      try {
        URL.revokeObjectURL(objectUrl);
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(file); // fallback to original if canvas context unavailable
          return;
        }

        ctx.drawImage(img, 0, 0);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file);
              return;
            }

            const cleanName = file.name.replace(/\.[^/.]+$/, '') + '.webp';
            const webpFile = new File([blob], cleanName, {
              type: 'image/webp',
              lastModified: Date.now(),
            });

            resolve(webpFile);
          },
          'image/webp',
          quality
        );
      } catch (err) {
        URL.revokeObjectURL(objectUrl);
        resolve(file); // fallback gracefully if any canvas error occurs
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file); // fallback
    };

    img.src = objectUrl;
  });
}
