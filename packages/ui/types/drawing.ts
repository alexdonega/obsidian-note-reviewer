/**
 * Tipos e constantes para funcionalidades de desenho sobre imagens
 * Baseado em: https://github.com/backnotprop/plannotator
 */

export type DrawingTool = 'pen' | 'arrow' | 'circle';

export interface Point {
  x: number;
  y: number;
  pressure?: number;
}

export interface Stroke {
  id: string;
  tool: DrawingTool;
  points: Point[];
  color: string;
  size: number;
}

export interface DrawingState {
  tool: DrawingTool;
  color: string;
  strokeSize: number;
  strokes: Stroke[];
  currentStroke: Stroke | null;
}

export const DRAWING_COLORS = [
  '#ef4444', // red
  '#eab308', // yellow
  '#22c55e', // green
  '#3b82f6', // blue
  '#ffffff', // white
] as const;

export const DRAWING_SIZES = [2, 4, 6, 8] as const;

export const DEFAULT_DRAWING_STATE: DrawingState = {
  tool: 'pen',
  color: '#ef4444',
  strokeSize: 4,
  strokes: [],
  currentStroke: null,
};

/**
 * Atalhos de teclado para ferramentas de desenho
 */
export const DRAWING_KEYBINDINGS: Record<string, DrawingTool> = {
  '1': 'pen',
  '2': 'arrow',
  '3': 'circle',
};

/**
 * Configurações para cada ferramenta de desenho
 */
export const TOOL_CONFIG: Record<DrawingTool, {
  label: string;
  icon: string;
  cursor: string;
}> = {
  pen: {
    label: 'Caneta',
    icon: '✏️',
    cursor: 'crosshair',
  },
  arrow: {
    label: 'Seta',
    icon: '→',
    cursor: 'crosshair',
  },
  circle: {
    label: 'Círculo',
    icon: '○',
    cursor: 'crosshair',
  },
};
