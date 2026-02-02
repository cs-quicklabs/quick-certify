import { IMAGE_RULES, DesignType } from './image-rules';

/**
 * Validate's Designs' file dimensions
 * @param file
 * @param designType
 * @returns
 */
export function validateImageDimensions(file: File, designType: DesignType): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      const { width, height } = img;
      const rule = IMAGE_RULES[designType];

      URL.revokeObjectURL(url);

      if (width < rule.minWidth || height < rule.minHeight) {
        reject(
          new Error(
            `Invalid image size. Expected at least ${rule.minWidth}×${rule.minHeight}px for ${rule.label}.`,
          ),
        );
      } else {
        resolve();
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Invalid image file'));
    };

    img.src = url;
  });
}
