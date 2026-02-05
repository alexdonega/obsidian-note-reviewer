/**
 * Utilitários para renderização de desenhos sobre imagens
 * Baseado em: https://github.com/backnotprop/plannotator
 */

import { getStroke, getStrokeOutlinePoints } from 'perfect-freehand';
import type { Point, Stroke, DrawingTool } from '../types/drawing';

/**
 * Converte pontos de contorno em um Path2D
 */
function outlinePointsToPath(outline: number[][]): Path2D {
  const path = new Path2D();

  if (outline.length === 0) return path;

  // Move para o primeiro ponto
  path.moveTo(outline[0][0], outline[0][1]);

  // Desenha linhas para os pontos subsequentes
  for (let i = 1; i < outline.length; i++) {
    path.lineTo(outline[i][0], outline[i][1]);
  }

  // Fecha o path
  path.closePath();

  return path;
}

/**
 * Renderiza um traço de caneta (desenho à mão livre) usando perfect-freehand
 */
export function renderPenStroke(
  ctx: CanvasRenderingContext2D,
  points: Point[],
  color: string,
  size: number,
  scale = 1
) {
  if (points.length < 2) return;

  // Converte pontos para o formato esperado pelo perfect-freehand
  const scaledPoints = points.map(p => [
    p.x * scale,
    p.y * scale,
    p.pressure ?? 0.5
  ] as [number, number, number]);

  // Gera o traço com perfect-freehand
  const outline = getStrokeOutlinePoints(scaledPoints, {
    size: size * scale,
    thinning: 0.5,
    smoothing: 0.5,
    streamline: 0.5,
    taperStart: 0,
    taperEnd: 0,
    capStart: true,
    capEnd: true,
    simulatePressure: true,
  });

  if (outline.length === 0) return;

  // Converte o contorno em um path e renderiza
  const path = outlinePointsToPath(outline);
  ctx.fillStyle = color;
  ctx.fill(path);
}

/**
 * Renderiza uma seta entre dois pontos
 */
export function renderArrow(
  ctx: CanvasRenderingContext2D,
  start: Point,
  end: Point,
  color: string,
  size: number,
  scale = 1
) {
  const x1 = start.x * scale;
  const y1 = start.y * scale;
  const x2 = end.x * scale;
  const y2 = end.y * scale;
  const lineWidth = size * scale * 0.75;
  const headLength = size * scale * 3;

  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Desenha a linha principal
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();

  // Calcula o ângulo da seta
  const angle = Math.atan2(y2 - y1, x2 - x1);

  // Desenha a cabeça da seta
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(
    x2 - headLength * Math.cos(angle - Math.PI / 6),
    y2 - headLength * Math.sin(angle - Math.PI / 6)
  );
  ctx.lineTo(
    x2 - headLength * Math.cos(angle + Math.PI / 6),
    y2 - headLength * Math.sin(angle + Math.PI / 6)
  );
  ctx.closePath();
  ctx.fill();
}

/**
 * Renderiza um círculo entre dois pontos (start e end definem o diâmetro)
 */
export function renderCircle(
  ctx: CanvasRenderingContext2D,
  start: Point,
  end: Point,
  color: string,
  size: number,
  scale = 1
) {
  const x1 = start.x * scale;
  const y1 = start.y * scale;
  const x2 = end.x * scale;
  const y2 = end.y * scale;

  // Centro do círculo é o ponto médio
  const cx = (x1 + x2) / 2;
  const cy = (y1 + y2) / 2;

  // Raio é metade da distância entre os pontos
  const radius = Math.hypot(x2 - x1, y2 - y1) / 2;

  if (radius < 1) return;

  ctx.strokeStyle = color;
  ctx.lineWidth = size * scale * 0.75;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.stroke();
}

/**
 * Renderiza todos os traços de um stroke no canvas
 */
export function renderStroke(
  ctx: CanvasRenderingContext2D,
  stroke: Stroke,
  scale = 1
) {
  switch (stroke.tool) {
    case 'pen':
      renderPenStroke(ctx, stroke.points, stroke.color, stroke.size, scale);
      break;
    case 'arrow':
      if (stroke.points.length >= 2) {
        renderArrow(
          ctx,
          stroke.points[0],
          stroke.points[stroke.points.length - 1],
          stroke.color,
          stroke.size,
          scale
        );
      }
      break;
    case 'circle':
      if (stroke.points.length >= 2) {
        renderCircle(
          ctx,
          stroke.points[0],
          stroke.points[stroke.points.length - 1],
          stroke.color,
          stroke.size,
          scale
        );
      }
      break;
  }
}

/**
 * Renderiza todos os traços no canvas
 */
export function renderAllStrokes(
  ctx: CanvasRenderingContext2D,
  strokes: Stroke[],
  scale = 1
) {
  // Limpa o canvas
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  // Renderiza cada traço
  strokes.forEach(stroke => renderStroke(ctx, stroke, scale));
}

/**
 * Calcula o ponto relativo ao elemento canvas
 */
export function getCanvasPoint(
  e: React.PointerEvent<HTMLCanvasElement>,
  canvas: HTMLCanvasElement
): Point {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  return {
    x: (e.clientX - rect.left) * scaleX,
    y: (e.clientY - rect.top) * scaleY,
    pressure: e.pressure,
  };
}

/**
 * Exporta o canvas como PNG
 */
export function exportCanvasAsPNG(
  canvas: HTMLCanvasElement,
  filename = 'annotated-image.png'
): string {
  return canvas.toDataURL('image/png');
}

/**
 * Combina uma imagem base64 com os desenhos do canvas
 */
export async function combineImageAndDrawing(
  imageSrc: string,
  strokes: Stroke[],
  scale = 1
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      // Desenha a imagem base
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Renderiza os traços sobre a imagem
      strokes.forEach(stroke => renderStroke(ctx, stroke, scale));

      // Exporta como data URL
      resolve(canvas.toDataURL('image/png'));
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = imageSrc;
  });
}

/**
 * Verifica se dois pontos são próximos (para detectar toques)
 */
export function arePointsClose(
  p1: Point,
  p2: Point,
  threshold = 10
): boolean {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.hypot(dx, dy) < threshold;
}

/**
 * Calcula o centro de um conjunto de pontos
 */
export function getPointsCenter(points: Point[]): Point {
  if (points.length === 0) return { x: 0, y: 0 };

  const sum = points.reduce(
    (acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }),
    { x: 0, y: 0 }
  );

  return {
    x: sum.x / points.length,
    y: sum.y / points.length,
  };
}
