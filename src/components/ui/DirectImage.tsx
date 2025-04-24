'use client';

import React from 'react';

interface DirectImageProps {
  src: string;
  alt: string;
  width?: number | string;
  height?: number | string;
  className?: string;
}

export default function DirectImage({
  src,
  alt,
  width,
  height,
  className = '',
}: DirectImageProps) {
  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      loading="lazy"
    />
  );
}
