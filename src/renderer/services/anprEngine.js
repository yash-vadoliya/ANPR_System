import { createWorker } from 'tesseract.js';
import { validateNumberPlate } from '../../config/platePatterns';

let worker = null;

export const initANPR = async () => {
  if (!worker) {
    console.log('[ANPR Engine] Initializing OCR worker...');
    worker = await createWorker('eng');
    await worker.setParameters({
      tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
      tessedit_pageseg_mode: '7',
      preserve_interword_spaces: '1',
      textord_min_xheight: '20'
    });
    console.log('[ANPR Engine] Worker ready.');
  }
  return worker;
};

function drawContrastBoostedFrame(sourceCanvas, width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.filter = 'contrast(1.7) saturate(1.5) brightness(1.08)';
  ctx.drawImage(sourceCanvas, 0, 0, width, height);

  const imgData = ctx.getImageData(0, 0, width, height);
  const { data } = imgData;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const gray = r * 0.299 + g * 0.587 + b * 0.114;

    const value = gray < 120 ? 0 : 255;
    data[i] = value;
    data[i + 1] = value;
    data[i + 2] = value;
    data[i + 3] = 255;
  }

  ctx.putImageData(imgData, 0, 0);
  return canvas;
}

function cropCenterPlateRegion(sourceCanvas) {
  const width = sourceCanvas.width;
  const height = sourceCanvas.height;
  const cropWidth = Math.min(width, Math.max(300, Math.floor(width * 0.82)));
  const cropHeight = Math.min(height, Math.max(120, Math.floor(height * 0.28)));
  const cropX = Math.max(0, Math.floor((width - cropWidth) / 2));
  const cropY = Math.max(0, Math.floor((height - cropHeight) / 2));

  const cropCanvas = document.createElement('canvas');
  cropCanvas.width = cropWidth;
  cropCanvas.height = cropHeight;

  const ctx = cropCanvas.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(sourceCanvas, cropX, cropY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);
  return drawContrastBoostedFrame(cropCanvas, cropCanvas.width, cropCanvas.height);
}

function preprocessCanvas(sourceCanvas) {
  const width = Math.max(600, sourceCanvas.width);
  const height = Math.max(220, sourceCanvas.height);
  const base = drawContrastBoostedFrame(sourceCanvas, width, height);
  const centered = cropCenterPlateRegion(base);
  return [base, centered];
}

export const scanCanvasForPlate = async (canvasElement) => {
  if (!canvasElement || canvasElement.width < 50) return null;

  try {
    const activeWorker = await initANPR();
    const variants = preprocessCanvas(canvasElement);
    let bestMatch = null;

    for (const processedCanvas of variants) {
      const result = await activeWorker.recognize(processedCanvas);
      const text = result?.data?.text || '';
      const confidence = Number(result?.data?.confidence || 0);

      if (!text || text.trim().length < 4) continue;

      console.log(`[OCR Raw Candidate]: "${text.trim()}" (Confidence: ${confidence}%)`);
      const validated = validateNumberPlate(text);

      if (validated) {
        const finalResult = {
          ...validated,
          confidence: Math.round(confidence || 0),
          detectedAt: new Date().toLocaleTimeString()
        };

        if (!bestMatch || finalResult.confidence > bestMatch.confidence) {
          bestMatch = finalResult;
        }
      }
    }

    if (bestMatch) {
      console.log(`%c[VALID PLATE IDENTIFIED]: ${bestMatch.plateNumber}`, 'color: #10b981; font-weight: bold;');
      return bestMatch;
    }
  } catch (err) {
    console.error('[ANPR Scanner Error]:', err);
  }
  return null;
};