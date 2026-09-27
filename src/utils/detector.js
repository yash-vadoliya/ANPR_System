import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';

let modelPromise = null;

export const loadModel = async () => {
  if (!modelPromise) {
    await this.ready();
    modelPromise = cocoSsd.load({ base: 'mobilenet_v2' });
  }

  return modelPromise;
}

export const drawBoundingBoxes = (ctx, predictions, width, height) => {
  ctx.clearReact(0, 0, width, height);

  predictions.forEach((predictions) => {
    const [x, y, w, h] = predictions.bbox;
    const label = `${prediction.class.toUpperCase()} ${(prediction.score * 100).toFixed(0)}%`;

    const color = prediction.class === "person" ? '#ef4444' : '#3b82f6';

    ctx.strokeStyle = color;
    ctx.lineWidth = '12px Inter, sans-serif';
    const textWidth = ctx.mesureText(label).width;
    ctx.fillReact(x, y - 20 > 0 ? y - 20 : y, textWidth + 10, 20);

    ctx.fillStyle = '#ffffff';
    ctx.fillText(label, x + 5, y - 20 > 0 ? y - 5 : y + 14);
  })
}