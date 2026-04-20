import { useMemo, useState } from 'react';
import { TasteModal, type TasteProfile } from '../components/TasteModal';
import { getTasteDescription, getTasteStrength } from '../mixMeta';
import type { AppContent, Mix, PublicUser, RatingSummary, RatingTargetType, UserRating } from '../types';

type TastesPageProps = {
  content: AppContent;
  user: PublicUser | null;
  userRatings: UserRating[];
  onOpenMix: (mix: Mix) => void;
  onLoginRequest: () => void;
  onRate: (targetType: RatingTargetType, targetId: string, value: number) => Promise<void>;
};

const ALL_FILTER_VALUE = 'all';

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

function formatTasteLabel(note: string) {
  return TASTE_LABELS[note] ?? note;
}

export function TastesPage({ content, user, userRatings, onOpenMix, onLoginRequest, onRate }: TastesPageProps) {
  const [activeTaste, setActiveTaste] = useState<TasteProfile | null>(null);
  const [activeFilter, setActiveFilter] = useState(ALL_FILTER_VALUE);

  const tastes = useMemo<TasteProfile[]>(() => {
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
          label: formatTasteLabel(note),
          image: sampleMix?.image ?? '/media/mix-tropic.png',
          description: getTasteDescription(note),
          strength: getTasteStrength(mixes),
          mixes
        };
      })
      .sort((first, second) => first.label.localeCompare(second.label, 'ru'));
  }, [content.mixes]);

  const filters = useMemo(() => [ALL_FILTER_VALUE, ...tastes.map((taste) => taste.note)], [tastes]);
  const visibleTastes = activeFilter === ALL_FILTER_VALUE ? tastes : tastes.filter((taste) => taste.note === activeFilter);

  return (
    <section className="content-section tobacco-page tastes-page" aria-label="Каталог вкусов">
      <header className="tobacco-page__header">
        <h1>Вкусы</h1>
      </header>

      <div className="tobacco-brand-rail" aria-label="Фильтры вкусов">
        {filters.map((filter) => (
          <button
            key={filter}
            type="button"
            className={activeFilter === filter ? 'tobacco-brand-filter is-active' : 'tobacco-brand-filter'}
            onClick={() => setActiveFilter(filter)}
          >
            {filter === ALL_FILTER_VALUE ? 'Все' : formatTasteLabel(filter)}
          </button>
        ))}
      </div>

      <div className="tastes-page__grid">
        {visibleTastes.map((taste) => {
          const ratingSummary = findSummary(content.ratingSummaries, 'taste', taste.note);

          return (
            <article
              key={taste.note}
              className="tastes-page__card"
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
              <div className="tastes-page__badge profile-badge">
                <span>{taste.strength}</span>
                <span>{taste.label}</span>
              </div>
              <div className="tastes-page__meta">
                <h3>{taste.label}</h3>
                <p>{taste.mixes.length} миксов</p>
                <small>{ratingSummary && ratingSummary.count > 0 ? `${ratingSummary.average.toFixed(1)} ★` : 'Без оценок'}</small>
              </div>
            </article>
          );
        })}
      </div>

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
    </section>
  );
}
