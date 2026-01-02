import React, { useState, useEffect, useRef } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  loading?: 'lazy' | 'eager';
  fetchPriority?: 'high' | 'low' | 'auto';
  sizes?: string;
  onLoad?: () => void;
  onError?: () => void;
  placeholder?: string;
  blurHash?: string;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  loading = 'lazy',
  fetchPriority = 'auto',
  sizes,
  onLoad,
  onError,
  placeholder,
  blurHash,
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(loading === 'eager');
  const imgRef = useRef<HTMLImageElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (loading === 'eager') return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before entering viewport
        threshold: 0.01,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [loading]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  // Generate WebP source if original is not WebP
  const isWebP = src.endsWith('.webp');
  const webpSrc = isWebP ? src : src.replace(/\.(jpg|jpeg|png)$/i, '.webp');

  // Generate srcset for responsive images
  const generateSrcSet = (imageSrc: string) => {
    if (!width) return undefined;

    const widths = [width * 0.5, width, width * 1.5, width * 2];
    return widths
      .map((w) => {
        const scaledSrc = imageSrc.replace(
          /(\.[^.]+)$/,
          `@${Math.round(w)}w$1`
        );
        return `${scaledSrc} ${Math.round(w)}w`;
      })
      .join(', ');
  };

  // Placeholder styles
  const placeholderStyle: React.CSSProperties = {
    backgroundColor: '#f3f4f6',
    backgroundImage: blurHash
      ? `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}'%3E%3Cfilter id='b'%3E%3CfeGaussianBlur stdDeviation='12'/%3E%3C/filter%3E%3Cimage filter='url(%23b)' width='100%25' height='100%25' href='${blurHash}'/%3E%3C/svg%3E")`
      : placeholder
      ? `url("${placeholder}")`
      : undefined,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  };

  if (hasError) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 ${className}`}
        style={{ width, height }}
      >
        <svg
          className="w-12 h-12 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
    );
  }

  return (
    <div
      ref={imgRef}
      className={`relative overflow-hidden ${className}`}
      style={{ width, height }}
    >
      {/* Placeholder */}
      {!isLoaded && (
        <div
          className="absolute inset-0 animate-pulse"
          style={placeholderStyle}
        />
      )}

      {/* Actual image - only render when in view */}
      {isInView && (
        <picture>
          {/* WebP source for modern browsers */}
          {!isWebP && (
            <source
              type="image/webp"
              srcSet={generateSrcSet(webpSrc)}
              sizes={sizes}
            />
          )}

          {/* Fallback to original format */}
          <img
            src={src}
            alt={alt}
            width={width}
            height={height}
            loading={loading}
            fetchPriority={fetchPriority}
            srcSet={generateSrcSet(src)}
            sizes={sizes}
            onLoad={handleLoad}
            onError={handleError}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            decoding="async"
          />
        </picture>
      )}
    </div>
  );
}

// Avatar variant with circular crop
export function OptimizedAvatar({
  src,
  alt,
  size = 40,
  ...props
}: Omit<OptimizedImageProps, 'width' | 'height'> & { size?: number }) {
  return (
    <OptimizedImage
      {...props}
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={`rounded-full ${props.className || ''}`}
    />
  );
}

// Background image with parallax effect
export function OptimizedBackgroundImage({
  src,
  alt,
  parallax = false,
  className = '',
  children,
  ...props
}: OptimizedImageProps & {
  parallax?: boolean;
  children?: React.ReactNode;
}) {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    if (!parallax) return;

    const handleScroll = () => {
      setOffset(window.pageYOffset);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [parallax]);

  return (
    <div className={`relative ${className}`}>
      <div
        className="absolute inset-0 overflow-hidden"
        style={{
          transform: parallax ? `translateY(${offset * 0.5}px)` : undefined,
        }}
      >
        <OptimizedImage
          {...props}
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
        />
      </div>
      {children && <div className="relative z-10">{children}</div>}
    </div>
  );
}
