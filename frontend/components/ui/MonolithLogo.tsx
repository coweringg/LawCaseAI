import { cn } from '@/utils/helpers';

interface MonolithLogoProps {
  size?: number;
  className?: string;
  glowIntensity?: 'sm' | 'md' | 'lg';
  imageScale?: number;
}

export default function MonolithLogo({ size = 32, className, glowIntensity = 'md', imageScale = 1 }: MonolithLogoProps) {
  const glowMap = {
    sm: 'drop-shadow-[0_0_4px_rgba(0,230,118,0.3)]',
    md: 'drop-shadow-[0_0_8px_rgba(0,230,118,0.5)]',
    lg: 'drop-shadow-[0_0_14px_rgba(0,230,118,0.7)]',
  };

  return (
    <div
      className={cn('flex items-center justify-center', className)}
      style={{ width: size, height: size }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo-law.png"
        alt="LawCaseAI"
        width={size}
        height={size}
        className={cn('w-full h-full object-contain', glowMap[glowIntensity])}
        style={{ transform: `scale(${imageScale})` }}
      />
    </div>
  );
}
