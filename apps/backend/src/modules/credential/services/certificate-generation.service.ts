import { Injectable, Logger } from '@nestjs/common';
import { createCanvas, loadImage, CanvasRenderingContext2D } from 'canvas';
import PDFDocument from 'pdfkit';
import { StorageService } from '@src/commons/services/storage.service';
import {
  buildValueMap,
  type DesignLayout,
  type DesignLayoutPlaceholder,
  type PlaceholderKey,
  type CertificateGenerationParams,
  type CertificateGenerationResult,
} from '@certify/certificate-core';

export type {
  CertificateGenerationParams,
  CertificateGenerationResult,
} from '@certify/certificate-core';

@Injectable()
export class CertificateGenerationService {
  private readonly logger = new Logger(CertificateGenerationService.name);

  constructor(private readonly storageService: StorageService) {}

  async generateCertificate(
    backgroundUrl: string,
    layout: DesignLayout,
    params: CertificateGenerationParams,
    organizationId: string,
  ): Promise<CertificateGenerationResult> {
    const valueMap = buildValueMap(params);

    // Generate PNG
    const pngBuffer = await this.renderPng(backgroundUrl, layout, valueMap);

    // Generate PDF from the PNG
    const pdfBuffer = await this.renderPdf(pngBuffer, layout.canvasWidth, layout.canvasHeight);

    // Upload both to storage
    const [imageResult, pdfResult] = await Promise.all([
      this.storageService.uploadFile(
        pngBuffer,
        'certificate',
        organizationId,
        'image/png',
        `${params.credentialUuid}.png`,
      ),
      this.storageService.uploadFile(
        pdfBuffer,
        'certificate',
        organizationId,
        'application/pdf',
        `${params.credentialUuid}.pdf`,
      ),
    ]);

    return {
      imageUrl: imageResult.url,
      pdfUrl: pdfResult.url,
    };
  }

  private async renderPng(
    backgroundUrl: string,
    layout: DesignLayout,
    valueMap: Record<PlaceholderKey, string>,
  ): Promise<Buffer> {
    const canvasWidth = layout.canvasWidth || 1100;
    const canvasHeight = layout.canvasHeight || 800;
    const canvas = createCanvas(canvasWidth, canvasHeight);
    const ctx = canvas.getContext('2d');

    // Draw background image
    try {
      const bgImage = await loadImage(backgroundUrl);
      const iw = bgImage.width;
      const ih = bgImage.height;
      const scale = Math.min(canvasWidth / iw, canvasHeight / ih);
      const scaledW = iw * scale;
      const scaledH = ih * scale;
      const offsetX = (canvasWidth - scaledW) / 2;
      const offsetY = (canvasHeight - scaledH) / 2;

      ctx.drawImage(bgImage, offsetX, offsetY, scaledW, scaledH);
    } catch (err) {
      this.logger.warn(`Failed to load background image: ${backgroundUrl}`, err);
      // Fill with white if background fails to load
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    }

    // Draw each placeholder
    for (const placeholder of layout.placeholders) {
      const resolvedText = valueMap[placeholder.key] ?? placeholder.text;
      this.drawPlaceholder(ctx, placeholder, resolvedText);
    }

    return canvas.toBuffer('image/png');
  }

  private truncateText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string {
    if (maxWidth <= 0 || ctx.measureText(text).width <= maxWidth) return text;
    const ellipsis = '…';
    let truncated = text;
    while (truncated.length > 1 && ctx.measureText(truncated + ellipsis).width > maxWidth) {
      truncated = truncated.slice(0, -1);
    }
    return truncated + ellipsis;
  }

  private drawPlaceholder(
    ctx: CanvasRenderingContext2D,
    placeholder: DesignLayoutPlaceholder,
    text: string,
  ): void {
    const scaleX = placeholder.scaleX ?? 1;
    const scaleY = placeholder.scaleY ?? 1;
    const fontSize = Math.round((placeholder.fontSize ?? 36) * scaleY);
    const fontFamily = placeholder.fontFamily ?? 'Times New Roman';
    const fontWeight = placeholder.fontWeight === 'bold' ? 'bold' : '';
    const fontStyle = placeholder.fontStyle === 'italic' ? 'italic' : '';

    ctx.save();

    // Apply font
    ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px "${fontFamily}"`.trim();
    ctx.fillStyle = placeholder.color ?? '#000000';

    // Fabric.js stores x/y as CENTER of the text (originX/originY = 'center')
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const x = placeholder.x;
    const y = placeholder.y;
    const canvasWidth = (ctx.canvas as unknown as { width: number }).width;
    const padding = 20;

    // Max width available from center position to nearest edge (with padding), accounting for scaleX
    const maxHalfW = Math.min(x - padding, canvasWidth - x - padding);
    const maxTextWidth = Math.max(60, maxHalfW * 2) / scaleX;

    const displayText = this.truncateText(ctx, text, maxTextWidth);
    ctx.fillText(displayText, x, y);
    ctx.restore();
  }

  private async renderPdf(
    pngBuffer: Buffer,
    canvasWidth: number,
    canvasHeight: number,
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      // Create PDF with page size matching the certificate dimensions
      // Convert pixels to points (72 DPI for PDF)
      const pdfWidth = canvasWidth * 0.72; // ~792pt for 1100px
      const pdfHeight = canvasHeight * 0.72; // ~576pt for 800px

      const doc = new PDFDocument({
        size: [pdfWidth, pdfHeight],
        margin: 0,
      });

      const chunks: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Embed the PNG as a full-page image
      doc.image(pngBuffer, 0, 0, {
        width: pdfWidth,
        height: pdfHeight,
      });

      doc.end();
    });
  }
}
