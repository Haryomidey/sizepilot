import { PDFDocument } from 'pdf-lib';

export interface ProcessedOutput {
  blob: Blob;
  name: string;
  size: number;
  mimeType: string;
  previewUrl?: string;
}

export const getFileExtension = (name: string) => name.split('.').pop()?.toLowerCase() || '';

export const replaceExtension = (name: string, extension: string) => {
  const baseName = name.replace(/\.[^/.]+$/, '');
  return `${baseName}.${extension}`;
};

export const downloadBlob = (blob: Blob, name: string) => {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = name;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
};

export const blobToDataUrl = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });

const loadImage = (file: Blob) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('This image could not be decoded.'));
    };
    image.src = url;
  });

const canvasToBlob = (canvas: HTMLCanvasElement, mimeType: string, quality?: number) =>
  new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error(`Could not export ${mimeType}.`));
      },
      mimeType,
      quality
    );
  });

export const compressImageFile = async (
  file: File,
  options: { format: string; quality: number; targetSizeKb?: number | '' }
): Promise<ProcessedOutput & { width: number; height: number }> => {
  const image = await loadImage(file);
  const canvas = document.createElement('canvas');
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;

  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas rendering is not available in this browser.');

  context.drawImage(image, 0, 0);

  const normalizedFormat = options.format === 'jpg' ? 'jpeg' : options.format;
  const mimeType = normalizedFormat === 'png' ? 'image/png' : `image/${normalizedFormat}`;
  const extension = normalizedFormat === 'jpeg' ? 'jpg' : normalizedFormat;
  const supportsQuality = mimeType !== 'image/png';
  const targetBytes = options.targetSizeKb ? Number(options.targetSizeKb) * 1024 : 0;
  let quality = Math.max(0.05, Math.min(1, options.quality / 100));
  let blob = await canvasToBlob(canvas, mimeType, supportsQuality ? quality : undefined);

  if (targetBytes > 0 && supportsQuality) {
    for (let step = 0; step < 9 && blob.size > targetBytes && quality > 0.08; step += 1) {
      quality = Math.max(0.08, quality - 0.1);
      blob = await canvasToBlob(canvas, mimeType, quality);
    }
  }

  return {
    blob,
    name: replaceExtension(file.name, extension),
    size: blob.size,
    mimeType,
    previewUrl: URL.createObjectURL(blob),
    width: canvas.width,
    height: canvas.height,
  };
};

export const convertImageFile = async (file: File, format: string): Promise<ProcessedOutput> => {
  if (format === 'pdf') {
    const imageOutput = await compressImageFile(file, { format: 'png', quality: 100 });
    const pdf = await PDFDocument.create();
    const imageBytes = await imageOutput.blob.arrayBuffer();
    const image = await pdf.embedPng(imageBytes);
    const page = pdf.addPage([image.width, image.height]);
    page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
    const bytes = await pdf.save();
    URL.revokeObjectURL(imageOutput.previewUrl || '');
    const blob = new Blob([bytes], { type: 'application/pdf' });
    return {
      blob,
      name: replaceExtension(file.name, 'pdf'),
      size: blob.size,
      mimeType: 'application/pdf',
    };
  }

  return compressImageFile(file, { format, quality: 92 });
};

export const copyFileOutput = async (file: File, name = file.name): Promise<ProcessedOutput> => {
  const blob = new Blob([await file.arrayBuffer()], { type: file.type || 'application/octet-stream' });
  return {
    blob,
    name,
    size: blob.size,
    mimeType: blob.type || 'application/octet-stream',
    previewUrl: URL.createObjectURL(blob),
  };
};

