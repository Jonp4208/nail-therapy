'use client';

import React from 'react';

interface UnoptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
}

export default function UnoptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
}: UnoptimizedImageProps) {
  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      style={{ objectFit: 'cover' }}
    />
  );
}
