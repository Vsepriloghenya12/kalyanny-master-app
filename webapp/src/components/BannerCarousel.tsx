import { useEffect, useMemo, useState } from 'react';
import type { Banner } from '../types';

type BannerCarouselProps = {
  banners: Banner[];
  onAction: (target: string) => void;
};

export function BannerCarousel({ banners, onAction }: BannerCarouselProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % banners.length);
    }, 4500);
    return () => window.clearInterval(timer);
  }, [banners.length]);

  const currentBanner = useMemo(() => banners[index] ?? banners[0], [banners, index]);

  if (!currentBanner) return null;

  return (
    <section className="banner-carousel" aria-label="Баннеры">
      <div className="banner-carousel__track" style={{ backgroundImage: `linear-gradient(90deg, rgba(4,4,4,.82), rgba(4,4,4,.12)), url(${currentBanner.image})` }}>
        <div className="banner-carousel__content">
          <p className="banner-carousel__eyebrow">Подборки и новые вкусы</p>
          <h1>{currentBanner.title}</h1>
          <p>{currentBanner.subtitle}</p>
          <button type="button" className="action-button" onClick={() => onAction(currentBanner.buttonTarget)}>
            {currentBanner.buttonLabel}
          </button>
        </div>
      </div>

      <div className="banner-carousel__thumbs" role="tablist" aria-label="Переключение баннеров">
        {banners.map((banner, bannerIndex) => (
          <button
            key={banner.id}
            type="button"
            className={bannerIndex === index ? 'banner-dot is-active' : 'banner-dot'}
            onClick={() => setIndex(bannerIndex)}
            aria-label={`Показать баннер ${bannerIndex + 1}: ${banner.title}`}
          />
        ))}
      </div>
    </section>
  );
}
