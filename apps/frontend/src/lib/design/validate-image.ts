import { IMAGE_RULES, DIMENSION_TOLERANCE, DesignType } from './image-rules';

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
      const tolerance = DIMENSION_TOLERANCE[designType];

      URL.revokeObjectURL(url);

      const widthOk = Math.abs(width - rule.width) <= tolerance;
      const heightOk = Math.abs(height - rule.height) <= tolerance;

      if (!widthOk || !heightOk) {
        reject(
          new Error(
            `Invalid image size. Expected ${rule.width}×${rule.height}px (±${tolerance}px).`,
          ),
        );
        return;
      }

      resolve();
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Invalid image file'));
    };

    img.src = url;
  });
}
