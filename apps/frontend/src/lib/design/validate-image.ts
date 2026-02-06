import { IMAGE_RULES, DesignType, ASPECT_RATIO_TOLERANCE } from './image-rules';

export function validateImageAspectRatio(file: File, designType: DesignType): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      const { width, height } = img;
      URL.revokeObjectURL(url);

      const rule = IMAGE_RULES[designType];

      const expectedRatio = rule.width / rule.height;
      const actualRatio = width / height;

      const diff = Math.abs(actualRatio - expectedRatio);

      if (diff > ASPECT_RATIO_TOLERANCE) {
        reject(
          new Error(
            `Invalid image aspect ratio for ${rule.label}. Expected approximately ${rule.width}:${rule.height}.`,
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
