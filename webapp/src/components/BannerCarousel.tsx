import type { Banner } from '../types';

type BannerCarouselProps = {
  banners: Banner[];
  onAction: (target: string) => void;
};

export function BannerCarousel({ banners, onAction }: BannerCarouselProps) {
  if (!banners.length) return null;

  return (
    <section className="banner-carousel" aria-label="Баннеры">
      <div className="banner-grid">
        {banners.map((banner) => (
          <article key={banner.id} className="banner-card">
            <div className="banner-card__media" style={{ backgroundImage: `linear-gradient(180deg, rgba(8, 12, 22, 0.16), rgba(8, 12, 22, 0.92)), url(${banner.image})` }}>
              <div className="banner-card__content">
                <p className="banner-card__eyebrow">Подборки и новинки</p>
                <h2>{banner.title}</h2>
                <p>{banner.subtitle}</p>
                <button type="button" className="action-button action-button--compact" onClick={() => onAction(banner.buttonTarget)}>
                  {banner.buttonLabel}
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
