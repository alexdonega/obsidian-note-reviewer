/**
 * Componente de anotação de imagem
 * Permite desenhar sobre imagens com caneta, seta e círculo
 * Baseado em: https://github.com/backnotprop/plannotator
 */

import React, { useRef, useState, useEffect, useCallback } from 'react';
import type { DrawingState, DrawingTool, Point, Stroke } from '../types/drawing';
import { DEFAULT_DRAWING_STATE, DRAWING_COLORS, DRAWING_SIZES, TOOL_CONFIG, DRAWING_KEYBINDINGS } from '../types/drawing';
import {
  renderAllStrokes,
  renderStroke,
  getCanvasPoint,
  exportCanvasAsPNG,
} from '../utils/drawing';

interface ImageAnnotatorProps {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
  className?: string;
  onAnnotationsChange?: (strokes: Stroke[]) => void;
  initialStrokes?: Stroke[];
}

export const ImageAnnotator: React.FC<ImageAnnotatorProps> = ({
  src,
  alt = '',
  className = '',
  onAnnotationsChange,
  initialStrokes = [],
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [drawing, setDrawing] = useState<DrawingState>({
    ...DEFAULT_DRAWING_STATE,
    strokes: initialStrokes,
  });
  const [isDrawing, setIsDrawing] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [canvasScale, setCanvasScale] = useState(1);

  // Carregar imagem e configurar canvas
  useEffect(() => {
    const img = imageRef.current;
    const canvas = canvasRef.current;
    if (!img || !canvas) return;

    const handleImageLoad = () => {
      setImageLoaded(true);

      // Configura o tamanho do canvas para corresponder à imagem
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;

      // Renderiza os traços iniciais
      if (drawing.strokes.length > 0) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          renderAllStrokes(ctx, drawing.strokes);
        }
      }
    };

    if (img.complete) {
      handleImageLoad();
    } else {
      img.addEventListener('load', handleImageLoad);
    }

    return () => {
      img.removeEventListener('load', handleImageLoad);
    };
  }, []);

  // Renderiza traços quando mudam
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imageLoaded) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    renderAllStrokes(ctx, drawing.strokes);
  }, [drawing.strokes, imageLoaded]);

  // Atualiza canvas scale quando o container muda de tamanho
  useEffect(() => {
    const updateScale = () => {
      const img = imageRef.current;
      const container = containerRef.current;
      if (!img || !container) return;

      const displayWidth = img.clientWidth;
      const naturalWidth = img.naturalWidth;
      setCanvasScale(displayWidth / naturalWidth);
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [imageLoaded]);

  // Atalhos de teclado para ferramentas de desenho
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tool = DRAWING_KEYBINDINGS[e.key];
      if (tool) {
        e.preventDefault();
        setDrawing(prev => ({ ...prev, tool }));
      }

      // Undo (Ctrl+Z)
      if (e.key === 'z' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setDrawing(prev => {
          const newStrokes = prev.strokes.slice(0, -1);
          onAnnotationsChange?.(newStrokes);
          return { ...prev, strokes: newStrokes };
        });
      }

      // Clear (Ctrl+Shift+X)
      if (e.key === 'x' && e.ctrlKey && e.shiftKey) {
        e.preventDefault();
        setDrawing(prev => {
          onAnnotationsChange?.([]);
          return { ...prev, strokes: [] };
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onAnnotationsChange]);

  // Handler para início do desenho
  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsDrawing(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    const point = getCanvasPoint(e, canvas);

    setDrawing(prev => ({
      ...prev,
      currentStroke: {
        id: crypto.randomUUID(),
        tool: prev.tool,
        points: [point],
        color: prev.color,
        size: prev.strokeSize,
      },
    }));
  }, []);

  // Handler para movimento durante o desenho
  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const point = getCanvasPoint(e, canvas);

    setDrawing(prev => {
      if (!prev.currentStroke) return prev;

      const updatedStroke = {
        ...prev.currentStroke,
        points: [...prev.currentStroke.points, point],
      };

      // Renderiza preview do traço atual
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Limpa e redesenha todos os traços
        renderAllStrokes(ctx, prev.strokes);
        // Renderiza o traço atual sendo desenhado
        renderStroke(ctx, updatedStroke);
      }

      return { ...prev, currentStroke: updatedStroke };
    });
  }, [isDrawing]);

  // Handler para finalizar o desenho
  const handlePointerUp = useCallback(() => {
    if (!isDrawing) return;

    setDrawing(prev => {
      if (!prev.currentStroke) return prev;

      const newStrokes = [...prev.strokes, prev.currentStroke];
      onAnnotationsChange?.(newStrokes);

      return {
        ...prev,
        strokes: newStrokes,
        currentStroke: null,
      };
    });

    setIsDrawing(false);
  }, [isDrawing, onAnnotationsChange]);

  // Funções de controle
  const setTool = (tool: DrawingTool) => {
    setDrawing(prev => ({ ...prev, tool }));
  };

  const setColor = (color: string) => {
    setDrawing(prev => ({ ...prev, color }));
  };

  const setSize = (size: number) => {
    setDrawing(prev => ({ ...prev, strokeSize: size }));
  };

  const undo = () => {
    setDrawing(prev => {
      const newStrokes = prev.strokes.slice(0, -1);
      onAnnotationsChange?.(newStrokes);
      return { ...prev, strokes: newStrokes };
    });
  };

  const clear = () => {
    setDrawing(prev => {
      onAnnotationsChange?.([]);
      return { ...prev, strokes: [] };
    });
  };

  const exportPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = exportCanvasAsPNG(canvas);
    const link = document.createElement('a');
    link.download = `annotated-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
  };

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      {/* Toolbar de desenho */}
      <DrawingToolbar
        currentTool={drawing.tool}
        currentColor={drawing.color}
        currentSize={drawing.strokeSize}
        strokeCount={drawing.strokes.length}
        onToolChange={setTool}
        onColorChange={setColor}
        onSizeChange={setSize}
        onUndo={undo}
        onClear={clear}
        onExport={exportPNG}
      />

      {/* Container da imagem */}
      <div className="relative">
        <img
          ref={imageRef}
          src={src}
          alt={alt}
          className="max-w-full h-auto"
          style={{ cursor: TOOL_CONFIG[drawing.tool].cursor }}
        />

        {/* Canvas overlay */}
        {imageLoaded && (
          <canvas
            ref={canvasRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            className="absolute top-0 left-0 w-full h-full touch-none"
            style={{ pointerEvents: 'auto' }}
          />
        )}
      </div>
    </div>
  );
};

/**
 * Toolbar de ferramentas de desenho
 */
interface DrawingToolbarProps {
  currentTool: DrawingTool;
  currentColor: string;
  currentSize: number;
  strokeCount: number;
  onToolChange: (tool: DrawingTool) => void;
  onColorChange: (color: string) => void;
  onSizeChange: (size: number) => void;
  onUndo: () => void;
  onClear: () => void;
  onExport: () => void;
}

const DrawingToolbar: React.FC<DrawingToolbarProps> = ({
  currentTool,
  currentColor,
  currentSize,
  strokeCount,
  onToolChange,
  onColorChange,
  onSizeChange,
  onUndo,
  onClear,
  onExport,
}) => {
  return (
    <div className="absolute top-2 left-2 right-2 bg-popover/95 backdrop-blur-sm border border-border rounded-lg shadow-lg p-2 flex flex-wrap items-center gap-2 z-10">
      {/* Ferramentas */}
      <div className="flex items-center gap-1 border-r border-border pr-2">
        {(['pen', 'arrow', 'circle'] as DrawingTool[]).map(tool => (
          <button
            key={tool}
            onClick={() => onToolChange(tool)}
            className={`p-2 rounded-md transition-all ${
              currentTool === tool
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-muted text-muted-foreground hover:text-foreground'
            }`}
            title={`${TOOL_CONFIG[tool].label} (${Object.keys(DRAWING_KEYBINDINGS).find(k => DRAWING_KEYBINDINGS[k] === tool)})`}
          >
            <span className="text-sm">{TOOL_CONFIG[tool].icon}</span>
          </button>
        ))}
      </div>

      {/* Cores */}
      <div className="flex items-center gap-1 border-r border-border pr-2">
        {DRAWING_COLORS.map(color => (
          <button
            key={color}
            onClick={() => onColorChange(color)}
            className={`w-6 h-6 rounded-full transition-all ${
              currentColor === color ? 'ring-2 ring-offset-2 ring-primary' : ''
            }`}
            style={{ backgroundColor: color }}
            title={color}
          />
        ))}
      </div>

      {/* Tamanho */}
      <div className="flex items-center gap-1 border-r border-border pr-2">
        {DRAWING_SIZES.map(size => (
          <button
            key={size}
            onClick={() => onSizeChange(size)}
            className={`p-1 rounded-md transition-all ${
              currentSize === size
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-muted text-muted-foreground hover:text-foreground'
            }`}
            title={`Tamanho ${size}px`}
          >
            <div
              className="rounded-full bg-current"
              style={{ width: size, height: size }}
            />
          </button>
        ))}
      </div>

      {/* Ações */}
      <div className="flex items-center gap-1">
        <button
          onClick={onUndo}
          disabled={strokeCount === 0}
          className="p-2 rounded-md transition-all hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
          title="Desfazer (Ctrl+Z)"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
          </svg>
        </button>

        <button
          onClick={onClear}
          disabled={strokeCount === 0}
          className="p-2 rounded-md transition-all hover:bg-destructive/10 text-muted-foreground hover:text-destructive disabled:opacity-50 disabled:cursor-not-allowed"
          title="Limpar tudo (Ctrl+Shift+X)"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>

        <button
          onClick={onExport}
          disabled={strokeCount === 0}
          className="p-2 rounded-md transition-all hover:bg-primary/10 text-muted-foreground hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed"
          title="Exportar como PNG"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        </button>
      </div>
    </div>
  );
};
