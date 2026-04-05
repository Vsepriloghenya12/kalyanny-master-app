import { useEffect, useRef, useState } from 'react';
import type { Banner } from '../types';

type BannerCarouselProps = {
  banners: Banner[];
  onAction: (target: string) => void;
};

export function BannerCarousel({ banners, onAction }: BannerCarouselProps) {
  const [index, setIndex] = useState(0);
  const touchStartXRef = useRef<number | null>(null);
  const interactionLockUntilRef = useRef(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = window.setInterval(() => {
      if (Date.now() < interactionLockUntilRef.current) return;
      setIndex((current) => (current + 1) % banners.length);
    }, 4500);
    return () => window.clearInterval(timer);
  }, [banners.length]);

  if (!banners.length) return null;

  const lockAutoplay = () => {
    interactionLockUntilRef.current = Date.now() + 6000;
  };

  const goToIndex = (nextIndex: number) => {
    lockAutoplay();
    setIndex(nextIndex);
  };

  const handleTouchStart = (event: React.TouchEvent<HTMLElement>) => {
    touchStartXRef.current = event.changedTouches[0]?.clientX ?? null;
    lockAutoplay();
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLElement>) => {
    const startX = touchStartXRef.current;
    touchStartXRef.current = null;

    if (startX == null) return;

    const endX = event.changedTouches[0]?.clientX ?? startX;
    const deltaX = endX - startX;

    if (Math.abs(deltaX) < 42) return;

    if (deltaX < 0) {
      setIndex((current) => (current + 1) % banners.length);
      return;
    }

    setIndex((current) => (current - 1 + banners.length) % banners.length);
  };

  return (
    <section className="banner-carousel" aria-label="Баннеры">
      <div className="banner-carousel__stage" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
        {banners.map((banner, bannerIndex) => (
          <article key={banner.id} className={bannerIndex === index ? 'banner-carousel__slide is-active' : 'banner-carousel__slide'} aria-hidden={bannerIndex !== index}>
            <div className="banner-carousel__track" style={{ backgroundImage: `linear-gradient(90deg, rgba(4,4,4,.82), rgba(4,4,4,.12)), url(${banner.image})` }}>
              <div className="banner-carousel__content">
                <p className="banner-carousel__eyebrow">Подборки и новые вкусы</p>
                <h1>{banner.title}</h1>
                <p className="banner-carousel__subtitle">{banner.subtitle}</p>
                <button type="button" className="action-button" onClick={() => onAction(banner.buttonTarget)}>
                  {banner.buttonLabel}
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="banner-carousel__thumbs" role="tablist" aria-label="Переключение баннеров">
        {banners.map((banner, bannerIndex) => (
          <button
            key={banner.id}
            type="button"
            className={bannerIndex === index ? 'banner-dot is-active' : 'banner-dot'}
            onClick={() => goToIndex(bannerIndex)}
            aria-label={`Показать баннер ${bannerIndex + 1}: ${banner.title}`}
          />
        ))}
      </div>
    </section>
  );
}
