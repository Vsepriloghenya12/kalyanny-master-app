import { useMemo, useRef, useState } from 'react';
import type { PointerEvent } from 'react';
import { StarRating } from '../components/StarRating';
import { TasteModal, type TasteProfile } from '../components/TasteModal';
import { getMixDirection, getMixRating, getMixStrength, getTasteDescription, getTasteStrength } from '../mixMeta';
import type { AppContent, Banner, MainTab, Mix, PublicUser, RatingSummary, RatingTargetType, UserRating } from '../types';

type HomePageProps = {
  content: AppContent;
  favoriteMixes: string[];
  onToggleFavoriteMix: (id: string) => void;
  onOpenMix: (mix: Mix) => void;
  setMainTab: (tab: MainTab) => void;
  onOpenPopularMixes: () => void;
  onOpenAllTastes: () => void;
  onBannerAction: (target: string) => void;
  user: PublicUser | null;
  userRatings: UserRating[];
  onLoginRequest: () => void;
  onRate: (targetType: RatingTargetType, targetId: string, value: number) => Promise<void>;
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

const HOME_CATEGORY_LINKS = [
  { icon: '/media/home-category-tobacco.png', label: 'Табаки', target: 'tab:tobacco' },
  { icon: '/media/home-category-hookah.png', label: 'Кальяны', target: 'tab:hookah' },
  { icon: '/media/home-category-mixes.png', label: 'Миксы', target: 'tab:mixes' },
  { icon: '/media/home-category-accessories.png', label: 'Прочее', target: 'tab:accessories' }
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

function findSummary(summaries: RatingSummary[] | undefined, targetType: RatingTargetType, targetId: string) {
  return summaries?.find((summary) => summary.targetType === targetType && summary.targetId === targetId);
}

function findUserRating(ratings: UserRating[], targetType: RatingTargetType, targetId: string) {
  return ratings.find((rating) => rating.targetType === targetType && rating.targetId === targetId);
}

function getVisibleRating(mix: Mix, summaries: RatingSummary[] | undefined) {
  return findSummary(summaries, 'mix', mix.id)?.average ?? getMixRating(mix);
}

export function HomePage({
  content,
  favoriteMixes,
  onToggleFavoriteMix,
  onOpenMix,
  setMainTab: _setMainTab,
  onOpenPopularMixes,
  onOpenAllTastes,
  onBannerAction,
  user,
  userRatings,
  onLoginRequest,
  onRate
}: HomePageProps) {
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);
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

      <section className="home-category-menu" aria-label="Категории">
        {HOME_CATEGORY_LINKS.map((item) => (
          <button key={item.label} type="button" className="home-category-menu__button" onClick={() => onBannerAction(item.target)} aria-label={item.label}>
            <img src={item.icon} alt="" aria-hidden="true" />
            <span>{item.label}</span>
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
            const mixStrength = getMixStrength(mix);
            const mixDirection = getMixDirection(mix);

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
                  <div className="home-top-mix-card__content profile-badge">
                    <span>{mixStrength}</span>
                    <span>{mixDirection}</span>
                  </div>
                </article>
                <StarRating rating={getVisibleRating(mix, content.ratingSummaries)} className="home-top-mix-rating" />
              </div>
            );
          })}
        </div>
      </section>

      <section className="home-section-divider home-section-divider--with-action" aria-label="Топ вкусы">
        <span className="home-section-divider__line" />
        <h2>Топ вкусы</h2>
        <span className="home-section-divider__line" />
        <button type="button" className="home-section-divider__action" onClick={onOpenAllTastes}>
          Все
        </button>
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
              <div className="home-top-taste-card__content profile-badge">
                <span>{taste.strength}</span>
                <span>{taste.label}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <TasteModal
        taste={activeTaste}
        user={user}
        ratingSummary={activeTaste ? findSummary(content.ratingSummaries, 'taste', activeTaste.note) : undefined}
        userRating={activeTaste ? findUserRating(userRatings, 'taste', activeTaste.note) : undefined}
        onClose={() => setActiveTaste(null)}
        onOpenMix={(mix) => {
          setActiveTaste(null);
          onOpenMix(mix);
        }}
        onLoginRequest={onLoginRequest}
        onRate={onRate}
      />
    </>
  );
}
