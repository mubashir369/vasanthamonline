import React from 'react';
import Link from 'next/link';

interface BrandLogoProps {
  storeName?: string;
  tagline?: string;
  className?: string;
  logoUrl?: string;
}

export default function BrandLogo({
  storeName = 'Vasantham Group',
  tagline = 'Where elegance is woven with tradition.',
  className = '',
  logoUrl,
}: BrandLogoProps) {
  return (
    <Link href="/" className={`flex items-center gap-3 group ${className}`}>
      {logoUrl ? (
        <img
          src={logoUrl}
          alt={storeName}
          className="h-10 w-10 object-contain rounded-md"
        />
      ) : (
        <div className="relative flex items-center justify-center w-11 h-11 rounded-lg bg-gradient-to-br from-crimson-800 via-crimson-900 to-crimson-950 border border-gold-400/50 shadow-md group-hover:border-gold-300 transition-all duration-300">
          {/* Traditional Kerala Textile Motif SVG */}
          <svg
            viewBox="0 0 100 100"
            className="w-8 h-8 text-gold-400 fill-current drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]"
          >
            {/* Outer ornamental border */}
            <path
              d="M50 5 L60 20 L75 10 L80 28 L95 28 L88 45 L98 55 L85 65 L90 82 L73 78 L65 95 L50 85 L35 95 L27 78 L10 82 L15 65 L2 55 L12 45 L5 28 L20 28 L25 10 L40 20 Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              className="opacity-70"
            />
            {/* Stylized 'V' weaving motif */}
            <path
              d="M32 30 L50 68 L68 30 L60 30 L50 54 L40 30 Z"
              fill="currentColor"
            />
            {/* Center golden lotus diamond */}
            <polygon points="50,22 55,27 50,32 45,27" fill="currentColor" />
            <polygon points="50,68 53,74 50,80 47,74" fill="currentColor" />
          </svg>
        </div>
      )}
      <div className="flex flex-col">
        <span className="font-serif font-bold text-lg md:text-xl tracking-tight text-neutral-900 dark:text-neutral-50 group-hover:text-crimson-700 dark:group-hover:text-gold-400 transition-colors">
          {storeName}
        </span>
        <span className="hidden sm:inline text-[10px] md:text-xs text-neutral-500 dark:text-neutral-400 italic -mt-0.5 tracking-wide line-clamp-1">
          {tagline}
        </span>
      </div>
    </Link>
  );
}
