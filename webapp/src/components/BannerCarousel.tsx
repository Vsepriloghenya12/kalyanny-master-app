import { useEffect, useRef, useState } from 'react';
import type { Banner } from '../types';

type BannerCarouselProps = {
  banners: Banner[];
  onAction: (target: string) => void;
};

export function BannerCarousel({ banners, onAction }: BannerCarouselProps) {
  const [index, setIndex] = useState(0);
  const viewportRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % banners.length);
    }, 4500);
    return () => window.clearInterval(timer);
  }, [banners.length]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const slideWidth = viewport.clientWidth;
    viewport.scrollTo({
      left: slideWidth * index,
      behavior: 'smooth'
    });
  }, [index]);

  if (!banners.length) return null;

  const handleScroll = () => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const slideWidth = viewport.clientWidth;
    if (!slideWidth) return;

    const nextIndex = Math.round(viewport.scrollLeft / slideWidth);
    if (nextIndex !== index) {
      setIndex(nextIndex);
    }
  };

  return (
    <section className="banner-carousel" aria-label="Баннеры">
      <div ref={viewportRef} className="banner-carousel__viewport" onScroll={handleScroll}>
        {banners.map((banner) => (
          <article key={banner.id} className="banner-carousel__slide">
            <div className="banner-carousel__track" style={{ backgroundImage: `linear-gradient(90deg, rgba(4,4,4,.82), rgba(4,4,4,.12)), url(${banner.image})` }}>
              <div className="banner-carousel__content">
                <p className="banner-carousel__eyebrow">Подборки и новые вкусы</p>
                <h1>{banner.title}</h1>
                <p>{banner.subtitle}</p>
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
            onClick={() => setIndex(bannerIndex)}
            aria-label={`Показать баннер ${bannerIndex + 1}: ${banner.title}`}
          />
        ))}
      </div>
    </section>
  );
}
