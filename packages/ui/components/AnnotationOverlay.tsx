import React, { useEffect, useState, useRef } from 'react';
import { Annotation } from '../types';
import { AnnotationMarker, getMarkerStyleForType } from './AnnotationMarker';
import { calculateMarkerPosition } from '../utils/elementSelector';

export interface AnnotationOverlayProps {
  annotations: Annotation[];
  selectedId: string | null;
  onMarkerClick: (annotationId: string) => void;
  containerRef?: React.RefObject<HTMLElement>;
  enabled?: boolean;
}

/**
 * AnnotationOverlay - Overlay layer for rendering annotation markers
 *
 * Creates a positioned overlay on top of markdown content to display
 * visual markers for annotations. Handles both block-level and inline
 * annotations with proper z-index management.
 */
export const AnnotationOverlay: React.FC<AnnotationOverlayProps> = ({
  annotations,
  selectedId,
  onMarkerClick,
  containerRef,
  enabled = true
}) => {
  const [markerPositions, setMarkerPositions] = useState<Map<string, { top: number; left: number }>>(new Map());
  const overlayRef = useRef<HTMLDivElement>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  // Calculate marker positions when annotations or container changes
  useEffect(() => {
    if (!enabled) return;

    const updatePositions = () => {
      const container = containerRef?.current || document.body;
      const newPositions = new Map<string, { top: number; left: number }>();

      annotations.forEach(annotation => {
        // Skip global comments - they don't have text positions
        if (annotation.isGlobal) return;

        // Find target element using targetSelector if available
        let targetElement: HTMLElement | null = null;

        if (annotation.targetSelector) {
          targetElement = container.querySelector(annotation.targetSelector);
        }

        // Fallback: try to find element by blockId if available
        if (!targetElement && annotation.blockId) {
          targetElement = container.querySelector(`[data-block-id="${annotation.blockId}"]`);
        }

        // If we found an element, calculate marker position
        if (targetElement) {
          const position = calculateMarkerPosition(
            targetElement,
            annotation.startOffset
          );

          // Adjust position to account for scroll offset
          const containerRect = container.getBoundingClientRect();
          const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
          const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

          newPositions.set(annotation.id, {
            top: position.top - containerRect.top + scrollTop,
            left: position.left - containerRect.left + scrollLeft
          });
        }
      });

      setMarkerPositions(newPositions);
    };

    // Initial position calculation
    updatePositions();

    // Set up ResizeObserver to update positions on container resize
    if (containerRef?.current) {
      resizeObserverRef.current = new ResizeObserver(updatePositions);
      resizeObserverRef.current.observe(containerRef.current);
    }

    // Update positions on scroll
    const handleScroll = () => updatePositions();
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', updatePositions);

    return () => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', updatePositions);
    };
  }, [annotations, containerRef, enabled]);

  // Clean up ResizeObserver on unmount
  useEffect(() => {
    return () => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
    };
  }, []);

  if (!enabled) return null;

  return (
    <div
      ref={overlayRef}
      className="annotation-overlay pointer-events-none fixed inset-0 z-40"
      style={{ pointerEvents: 'none' }}
    >
      {annotations.map(annotation => {
        // Skip if no position calculated or it's a global comment
        const position = markerPositions.get(annotation.id);
        if (!position || annotation.isGlobal) return null;

        const markerStyle = getMarkerStyleForType(annotation.type);
        const isSelected = selectedId === annotation.id;

        return (
          <div
            key={annotation.id}
            className="annotation-marker-wrapper"
            style={{ pointerEvents: 'auto' }}
          >
            <AnnotationMarker
              annotation={annotation}
              position={position}
              isSelected={isSelected}
              onClick={onMarkerClick}
              style={markerStyle}
            />
          </div>
        );
      })}
    </div>
  );
};

/**
 * Hook to manage annotation overlay positioning
 * Provides utilities for updating marker positions
 */
export function useAnnotationOverlay(
  containerRef: React.RefObject<HTMLElement>,
  annotations: Annotation[]
) {
  const [positions, setPositions] = useState<Map<string, { top: number; left: number }>>(new Map());

  const updatePosition = (annotationId: string, position: { top: number; left: number }) => {
    setPositions(prev => new Map(prev).set(annotationId, position));
  };

  const removePosition = (annotationId: string) => {
    setPositions(prev => {
      const newMap = new Map(prev);
      newMap.delete(annotationId);
      return newMap;
    });
  };

  const clearAllPositions = () => {
    setPositions(new Map());
  };

  // Recalculate all positions
  const recalculateAll = () => {
    const container = containerRef?.current || document.body;
    const newPositions = new Map<string, { top: number; left: number }>();

    annotations.forEach(annotation => {
      if (annotation.isGlobal) return;

      let targetElement: HTMLElement | null = null;

      if (annotation.targetSelector) {
        targetElement = container.querySelector(annotation.targetSelector);
      }

      if (!targetElement && annotation.blockId) {
        targetElement = container.querySelector(`[data-block-id="${annotation.blockId}"]`);
      }

      if (targetElement) {
        const position = calculateMarkerPosition(targetElement, annotation.startOffset);
        newPositions.set(annotation.id, position);
      }
    });

    setPositions(newPositions);
  };

  return {
    positions,
    updatePosition,
    removePosition,
    clearAllPositions,
    recalculateAll
  };
}
