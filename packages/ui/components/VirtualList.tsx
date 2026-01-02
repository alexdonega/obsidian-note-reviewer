import React, { useState, useEffect, useRef, useCallback } from 'react';

interface VirtualListProps<T> {
  items: T[];
  itemHeight: number;
  windowHeight?: number;
  overscan?: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
  onScroll?: (scrollTop: number) => void;
}

export function VirtualList<T>({
  items,
  itemHeight,
  windowHeight = 600,
  overscan = 3,
  renderItem,
  className = '',
  onScroll,
}: VirtualListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate visible range
  const totalHeight = items.length * itemHeight;
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + windowHeight) / itemHeight) + overscan
  );

  const visibleItems = items.slice(startIndex, endIndex + 1);
  const offsetY = startIndex * itemHeight;

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const newScrollTop = e.currentTarget.scrollTop;
      setScrollTop(newScrollTop);
      onScroll?.(newScrollTop);
    },
    [onScroll]
  );

  return (
    <div
      ref={containerRef}
      className={`overflow-auto ${className}`}
      style={{ height: windowHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map((item, index) => (
            <div
              key={startIndex + index}
              style={{ height: itemHeight }}
              className="virtual-list-item"
            >
              {renderItem(item, startIndex + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Grid variant for virtual scrolling
interface VirtualGridProps<T> {
  items: T[];
  itemWidth: number;
  itemHeight: number;
  columns: number;
  windowHeight?: number;
  gap?: number;
  overscan?: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
}

export function VirtualGrid<T>({
  items,
  itemWidth,
  itemHeight,
  columns,
  windowHeight = 600,
  gap = 16,
  overscan = 1,
  renderItem,
  className = '',
}: VirtualGridProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const rowHeight = itemHeight + gap;
  const totalRows = Math.ceil(items.length / columns);
  const totalHeight = totalRows * rowHeight;

  const startRow = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
  const endRow = Math.min(
    totalRows - 1,
    Math.ceil((scrollTop + windowHeight) / rowHeight) + overscan
  );

  const startIndex = startRow * columns;
  const endIndex = Math.min(items.length - 1, (endRow + 1) * columns - 1);

  const visibleItems = items.slice(startIndex, endIndex + 1);
  const offsetY = startRow * rowHeight;

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`overflow-auto ${className}`}
      style={{ height: windowHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            display: 'grid',
            gridTemplateColumns: `repeat(${columns}, ${itemWidth}px)`,
            gap: `${gap}px`,
          }}
        >
          {visibleItems.map((item, index) => (
            <div
              key={startIndex + index}
              style={{ width: itemWidth, height: itemHeight }}
              className="virtual-grid-item"
            >
              {renderItem(item, startIndex + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Infinite scroll variant
interface InfiniteScrollProps<T> {
  items: T[];
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
  renderItem: (item: T, index: number) => React.ReactNode;
  loadingIndicator?: React.ReactNode;
  threshold?: number;
  className?: string;
}

export function InfiniteScroll<T>({
  items,
  hasMore,
  isLoading,
  onLoadMore,
  renderItem,
  loadingIndicator,
  threshold = 300,
  className = '',
}: InfiniteScrollProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (loadingRef.current || !hasMore || isLoading) return;

      const { scrollTop, scrollHeight, clientHeight } = container;
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

      if (distanceFromBottom < threshold) {
        loadingRef.current = true;
        onLoadMore();
      }
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [hasMore, isLoading, onLoadMore, threshold]);

  useEffect(() => {
    if (!isLoading) {
      loadingRef.current = false;
    }
  }, [isLoading]);

  return (
    <div
      ref={containerRef}
      className={`overflow-auto ${className}`}
    >
      {items.map((item, index) => (
        <div key={index}>{renderItem(item, index)}</div>
      ))}

      {isLoading && (
        <div className="flex justify-center p-4">
          {loadingIndicator || (
            <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          )}
        </div>
      )}

      {!hasMore && items.length > 0 && (
        <div className="text-center p-4 text-muted-foreground">
          No more items to load
        </div>
      )}
    </div>
  );
}

// Smooth scroll to item
export function useVirtualScrollTo(containerRef: React.RefObject<HTMLDivElement>) {
  return useCallback(
    (index: number, itemHeight: number, behavior: ScrollBehavior = 'smooth') => {
      if (!containerRef.current) return;

      const targetScrollTop = index * itemHeight;
      containerRef.current.scrollTo({
        top: targetScrollTop,
        behavior,
      });
    },
    [containerRef]
  );
}

// Hook for auto-scrolling to bottom (useful for chat interfaces)
export function useAutoScrollToBottom(
  containerRef: React.RefObject<HTMLDivElement>,
  enabled: boolean = true
) {
  useEffect(() => {
    if (!enabled || !containerRef.current) return;

    const container = containerRef.current;
    const isNearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight < 100;

    if (isNearBottom) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [containerRef, enabled]);
}
