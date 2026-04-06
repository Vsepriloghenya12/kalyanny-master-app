import { useMemo, useRef, useState } from 'react';
import type { PointerEvent } from 'react';
import { StarRating } from '../components/StarRating';
import { TasteModal, type TasteProfile } from '../components/TasteModal';
import { getMixDirection, getMixRating, getMixStrength, getTasteDescription, getTasteStrength } from '../mixMeta';
import type { AppContent, Banner, MainTab, Mix } from '../types';

type HomePageProps = {
  content: AppContent;
  favoriteMixes: string[];
  onToggleFavoriteMix: (id: string) => void;
  onOpenMix: (mix: Mix) => void;
  setMainTab: (tab: MainTab) => void;
  onOpenPopularMixes: () => void;
  onCatalogFilterChange: (filter: 'tobacco' | 'hookah' | 'accessories' | 'brands') => void;
  onBannerAction: (target: string) => void;
};

const SWIPE_THRESHOLD = 40;

const FALLBACK_HOME_BANNERS: Banner[] = [
  {
    id: 'fallback-blackburn',
    title: 'Black Burn Citrus Boom',
    subtitle: 'Яркий цитрус, лед и плотный фруктовый профиль.',
    image: '/media/blackburn-citrus-banner.png',
    buttonLabel: 'Открыть бренд',
    buttonTarget: 'brand:brand-blackburn'
  },
  {
    id: 'fallback-starline',
    title: 'Starline Citrus Boom',
    subtitle: 'Сочная цитрусовая витрина для быстрых миксов.',
    image: '/media/starline-citrus-banner.png',
    buttonLabel: 'Смотреть продукт',
    buttonTarget: 'product:prod-starline-citrus'
  }
];

const HOME_ICONS = [
  { image: '/media/icon-tobaccos.png', label: 'Табаки', target: 'tab:tobacco' },
  { image: '/media/icon-hookahs.png', label: 'Кальяны', target: 'tab:hookah' },
  { image: '/media/icon-mixes.png', label: 'Миксы', target: 'tab:mixer' },
  { image: '/media/icon-accessories.png', label: 'Аксессуары', target: 'tab:accessories' }
];

const BRAND_FILTERS = [
  { id: 'starline', title: 'Starline', logo: '/media/brand-logo-starline.png' },
  { id: 'brand-2', title: 'Бренд 2', logo: '/media/brand-logo-filter-2.png' },
  { id: 'blackburn', title: 'Black Burn', logo: '/media/brand-logo-blackburn.png' },
  { id: 'brand-4', title: 'Бренд 4', logo: '/media/brand-logo-filter-4.png' }
];

const TASTE_LABELS: Record<string, string> = {
  сладкий: 'Сладкий',
  цитрус: 'Цитрус',
  тропики: 'Тропики',
  ягоды: 'Ягодный',
  холодок: 'Свежий',
  пряности: 'Пряный',
  десерт: 'Десертный'
};

function formatMixCount(count: number) {
  const lastDigit = count % 10;
  const lastTwoDigits = count % 100;

  if (lastDigit === 1 && lastTwoDigits !== 11) return `${count} микс`;
  if ([2, 3, 4].includes(lastDigit) && ![12, 13, 14].includes(lastTwoDigits)) return `${count} микса`;
  return `${count} миксов`;
}

export function HomePage({
  content,
  favoriteMixes,
  onToggleFavoriteMix,
  onOpenMix,
  setMainTab: _setMainTab,
  onOpenPopularMixes,
  onCatalogFilterChange: _onCatalogFilterChange,
  onBannerAction
}: HomePageProps) {
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);
  const [activeBrandFilter, setActiveBrandFilter] = useState(BRAND_FILTERS[0].id);
  const [activeTaste, setActiveTaste] = useState<TasteProfile | null>(null);
  const touchStartX = useRef<number | null>(null);
  const homeBanners = content.banners.length ? content.banners : FALLBACK_HOME_BANNERS;
  const safeActiveBannerIndex = activeBannerIndex % homeBanners.length;
  const topMixes = content.mixes.filter((mix) => mix.isPopular);
  const topTastes = useMemo(() => {
    const tasteMixes = new Map<string, Mix[]>();

    content.mixes.forEach((mix) => {
      mix.notes.forEach((note) => {
        tasteMixes.set(note, [...(tasteMixes.get(note) ?? []), mix]);
      });
    });

    return [...tasteMixes.entries()]
      .map(([note, mixes]) => {
        const sampleMix = mixes[0];
        return {
          note,
          count: mixes.length,
          image: sampleMix?.image ?? '/media/mix-tropic.png',
          label: TASTE_LABELS[note] ?? note,
          sampleTitle: sampleMix?.title ?? 'Авторский микс',
          description: getTasteDescription(note),
          strength: getTasteStrength(mixes),
          mixes
        };
      })
      .sort((first, second) => second.count - first.count || first.label.localeCompare(second.label, 'ru'))
      .slice(0, 8);
  }, [content.mixes]);

  const showBanner = (direction: 1 | -1) => {
    setActiveBannerIndex((current) => (current + direction + homeBanners.length) % homeBanners.length);
  };

  const handlePointerDown = (event: PointerEvent<HTMLElement>) => {
    touchStartX.current = event.clientX;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerUp = (event: PointerEvent<HTMLElement>) => {
    if (touchStartX.current === null) return;

    const touchEndX = event.clientX;
    const deltaX = touchEndX - touchStartX.current;
    touchStartX.current = null;
    event.currentTarget.releasePointerCapture(event.pointerId);

    if (Math.abs(deltaX) < SWIPE_THRESHOLD) {
      onBannerAction(homeBanners[safeActiveBannerIndex]?.buttonTarget ?? 'tab:tobacco');
      return;
    }

    showBanner(deltaX < 0 ? 1 : -1);
  };

  return (
    <>
      <section className="home-banner-shell" aria-label="Промо-баннеры">
        <div className="home-banner" onPointerDown={handlePointerDown} onPointerUp={handlePointerUp} onPointerCancel={() => { touchStartX.current = null; }}>
          <div className="home-banner__track" style={{ transform: `translateX(-${safeActiveBannerIndex * 100}%)` }}>
            {homeBanners.map((banner) => (
              <div className="home-banner__slide" key={banner.id}>
                <img className="home-banner__image" src={banner.image} alt={banner.title} />
              </div>
            ))}
          </div>
        </div>
        <div className="home-banner-dots" aria-label="Количество баннеров">
          {homeBanners.map((banner, index) => (
            <button
              key={banner.id}
              type="button"
              className={index === safeActiveBannerIndex ? 'home-banner-dot is-active' : 'home-banner-dot'}
              onClick={() => setActiveBannerIndex(index)}
              aria-label={`Показать баннер ${index + 1}`}
            />
          ))}
        </div>
      </section>

      <section className="home-icons" aria-label="Категории">
        {HOME_ICONS.map((item) => (
          <button key={item.label} type="button" className="home-icons__button" onClick={() => onBannerAction(item.target)} aria-label={item.label}>
            <img src={item.image} alt={item.label} />
          </button>
        ))}
      </section>

      <section className="home-section-divider home-section-divider--with-action" aria-label="Топ микс">
        <span className="home-section-divider__line" />
        <h2>Топ микс</h2>
        <span className="home-section-divider__line" />
        <button type="button" className="home-section-divider__action" onClick={onOpenPopularMixes}>
          Все
        </button>
      </section>

      <section className="home-top-mixes" aria-label="Топ миксы">
        <div className="home-top-mixes__rail">
          {topMixes.map((mix) => {
            const isFavorite = favoriteMixes.includes(mix.id);
            const mixDirection = getMixDirection(mix);
            const mixStrength = getMixStrength(mix);

            return (
              <div className="home-top-mix-item" key={mix.id}>
                <article
                  className="home-top-mix-card"
                  style={{ backgroundImage: `url(${mix.image})` }}
                  role="button"
                  tabIndex={0}
                  onClick={() => onOpenMix(mix)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      onOpenMix(mix);
                    }
                  }}
                >
                  <button
                    type="button"
                    className={isFavorite ? 'home-top-mix-card__heart is-active' : 'home-top-mix-card__heart'}
                    onClick={(event) => {
                      event.stopPropagation();
                      onToggleFavoriteMix(mix.id);
                    }}
                    aria-label="Добавить микс в избранное"
                  >
                    ♥
                  </button>
                  <div className="home-top-mix-card__content">
                    <h3>{mix.title}</h3>
                    <p>{mix.subtitle}</p>
                    <dl className="home-top-mix-card__meta">
                      <div>
                        <dt>Крепость</dt>
                        <dd>{mixStrength}</dd>
                      </div>
                      <div>
                        <dt>Вкус</dt>
                        <dd>{mixDirection}</dd>
                      </div>
                    </dl>
                  </div>
                </article>
                <StarRating rating={getMixRating(mix)} className="home-top-mix-rating" />
              </div>
            );
          })}
        </div>
      </section>

      <section className="home-section-divider home-section-divider--with-action" aria-label="Топ вкусы">
        <span className="home-section-divider__line" />
        <h2>Топ вкусы</h2>
        <span className="home-section-divider__line" />
        <button type="button" className="home-section-divider__action" onClick={onOpenPopularMixes}>
          Все
        </button>
      </section>

      <section className="home-brand-filters" aria-label="Быстрые фильтры по брендам">
        {BRAND_FILTERS.map((brand) => (
          <button
            key={brand.id}
            type="button"
            className={brand.id === activeBrandFilter ? 'home-brand-filter is-active' : 'home-brand-filter'}
            onClick={() => setActiveBrandFilter(brand.id)}
            aria-label={brand.title}
          >
            <img src={brand.logo} alt={brand.title} />
          </button>
        ))}
      </section>

      <section className="home-top-tastes" aria-label="Топ вкусы">
        <div className="home-top-tastes__rail">
          {topTastes.map((taste) => (
            <article
              key={taste.note}
              className="home-top-taste-card"
              style={{ backgroundImage: `url(${taste.image})` }}
              role="button"
              tabIndex={0}
              onClick={() => setActiveTaste(taste)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  setActiveTaste(taste);
                }
              }}
            >
              <div className="home-top-taste-card__content">
                <h3>{taste.label}</h3>
                <p>{taste.sampleTitle}</p>
                <dl className="home-top-taste-card__meta">
                  <div>
                    <dt>Миксы</dt>
                    <dd>{formatMixCount(taste.count)}</dd>
                  </div>
                </dl>
              </div>
            </article>
          ))}
        </div>
      </section>

      <TasteModal
        taste={activeTaste}
        onClose={() => setActiveTaste(null)}
        onOpenMix={(mix) => {
          setActiveTaste(null);
          onOpenMix(mix);
        }}
      />
    </>
  );
}
