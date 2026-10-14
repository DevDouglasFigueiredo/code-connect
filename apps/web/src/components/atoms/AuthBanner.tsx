type AuthBannerProps = {
  src: string;
  alt: string;
  variant?: 'login' | 'registration';
  crop?: { x: number; y: number; width: number; height: number; sourceWidth: number; sourceHeight: number };
};

export function AuthBanner({ src, alt, crop, variant }: AuthBannerProps) {
  if (crop) {
    return <svg role="img" aria-label={alt} viewBox={`${crop.x} ${crop.y} ${crop.width} ${crop.height}`} className="h-full w-full" preserveAspectRatio="xMidYMid slice"><image href={src} width={crop.sourceWidth} height={crop.sourceHeight} /></svg>;
  }
  if (!variant) return <img src={src} alt={alt} className="h-full w-full object-cover" />;
  return <div className={`relative overflow-hidden ${variant === 'registration' ? 'aspect-[296/360] sm:aspect-[480/415] lg:aspect-[407/675]' : 'aspect-[296/360] sm:aspect-[480/415] lg:aspect-[407/628]'}`}>
    <img src={src} alt={alt} className={`absolute max-w-none ${variant === 'registration' ? 'h-[115.28%] w-[210.3%] left-[-62.58%] top-[-15.28%] sm:h-[101.93%] sm:w-[132.05%] sm:left-[-23.87%] sm:top-[-1.69%] lg:h-full lg:w-[248.77%] lg:left-[-89.74%] lg:top-0' : 'h-[115.28%] w-[210.3%] left-[-55.15%] top-[-15.28%] sm:h-[101.93%] sm:w-[132.05%] sm:left-[-23.87%] sm:top-[-1.69%] lg:h-[101.49%] lg:w-[234.89%] lg:left-[-68.8%] lg:top-[-1.11%]'}`} />
    <div aria-hidden="true" className="absolute bottom-[25px] left-1/2 h-10 w-[127px] -translate-x-1/2 lg:bottom-[35px]">
      <img alt="" src="/auth/Group4.svg" className="absolute bottom-[6.09%] left-0 h-[58.43%] w-[11.96%]" />
      <img alt="" src="/auth/Group5.svg" className="absolute top-[15.11%] left-[9.43%] h-[58.42%] w-[11.97%]" />
      <img alt="" src="/auth/Group6.svg" className="absolute right-0 top-0 h-full w-[73.12%]" />
    </div>
  </div>;
}
