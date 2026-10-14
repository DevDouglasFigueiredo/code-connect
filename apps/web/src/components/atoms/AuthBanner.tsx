type AuthBannerProps = {
  src: string;
  alt: string;
  crop?: { x: number; y: number; width: number; height: number; sourceWidth: number; sourceHeight: number };
};

export function AuthBanner({ src, alt, crop }: AuthBannerProps) {
  if (crop) {
    return <svg role="img" aria-label={alt} viewBox={`${crop.x} ${crop.y} ${crop.width} ${crop.height}`} className="h-full w-full" preserveAspectRatio="xMidYMid slice"><image href={src} width={crop.sourceWidth} height={crop.sourceHeight} /></svg>;
  }
  return <img src={src} alt={alt} className="h-full w-full object-cover" />;
}
