import { useEffect, useMemo, useState } from 'react';
import { StarRating } from '../components/StarRating';
import { getMixDirection, getMixRating, getMixStrength } from '../mixMeta';
import type { AppContent, Mix } from '../types';

type MixerPageProps = {
  content: AppContent;
  favoriteMixes: string[];
  onToggleFavoriteMix: (id: string) => void;
  onOpenMix: (mix: Mix) => void;
  showPopularOnly?: boolean;
};

const TASTE_TAGS = ['цитрус', 'ягоды', 'холодок', 'сладкий', 'тропики', 'десерт', 'пряности'];
const ALL_FILTER_VALUE = 'all';
const POPULAR_FILTER_VALUE = 'popular';

function formatTasteLabel(taste: string) {
  const labels: Record<string, string> = {
    цитрус: 'Цитрус',
    ягоды: 'Ягоды',
    холодок: 'Свежий',
    сладкий: 'Сладкий',
    тропики: 'Тропики',
    десерт: 'Десерт',
    пряности: 'Пряный'
  };

  return labels[taste] ?? taste;
}

function uniqueValues(values: string[]) {
  return [...new Set(values)].sort((first, second) => first.localeCompare(second, 'ru'));
}

export function MixerPage({ content, favoriteMixes, onToggleFavoriteMix, onOpenMix, showPopularOnly = false }: MixerPageProps) {
  const [activeTaste, setActiveTaste] = useState(ALL_FILTER_VALUE);
  const [activeStrength, setActiveStrength] = useState(ALL_FILTER_VALUE);
  const [activeDirection, setActiveDirection] = useState(ALL_FILTER_VALUE);
  const [activeStatus, setActiveStatus] = useState(showPopularOnly ? POPULAR_FILTER_VALUE : ALL_FILTER_VALUE);
  const [activeSearch, setActiveSearch] = useState('');
  const [draftTaste, setDraftTaste] = useState(ALL_FILTER_VALUE);
  const [draftStrength, setDraftStrength] = useState(ALL_FILTER_VALUE);
  const [draftDirection, setDraftDirection] = useState(ALL_FILTER_VALUE);
  const [draftStatus, setDraftStatus] = useState(showPopularOnly ? POPULAR_FILTER_VALUE : ALL_FILTER_VALUE);
  const [draftSearch, setDraftSearch] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const mixStrengths = useMemo(() => uniqueValues(content.mixes.map(getMixStrength)), [content.mixes]);
  const mixDirections = useMemo(() => uniqueValues(content.mixes.map(getMixDirection)), [content.mixes]);

  useEffect(() => {
    setActiveTaste(ALL_FILTER_VALUE);
    setActiveStrength(ALL_FILTER_VALUE);
    setActiveDirection(ALL_FILTER_VALUE);
    setActiveStatus(showPopularOnly ? POPULAR_FILTER_VALUE : ALL_FILTER_VALUE);
    setActiveSearch('');
  }, [showPopularOnly]);

  const matches = useMemo(() => {
    return content.mixes.filter((mix) => {
      const mixStrength = getMixStrength(mix);
      const mixDirection = getMixDirection(mix);
      const normalizedSearch = activeSearch.trim().toLowerCase();
      const searchableText = `${mix.title} ${mix.subtitle} ${mix.description} ${mix.details} ${mix.ingredients.join(' ')} ${mix.notes.join(' ')} ${mixStrength} ${mixDirection}`.toLowerCase();
      const matchesTaste = activeTaste === ALL_FILTER_VALUE || mix.notes.includes(activeTaste);
      const matchesStrength = activeStrength === ALL_FILTER_VALUE || mixStrength === activeStrength;
      const matchesDirection = activeDirection === ALL_FILTER_VALUE || mixDirection === activeDirection;
      const matchesStatus = activeStatus === ALL_FILTER_VALUE || mix.isPopular;
      const matchesSearch = !normalizedSearch || searchableText.includes(normalizedSearch);

      return matchesTaste && matchesStrength && matchesDirection && matchesStatus && matchesSearch;
    });
  }, [activeDirection, activeSearch, activeStatus, activeStrength, activeTaste, content.mixes]);

  const hasFilters = activeTaste !== ALL_FILTER_VALUE || activeStrength !== ALL_FILTER_VALUE || activeDirection !== ALL_FILTER_VALUE || activeStatus !== ALL_FILTER_VALUE || activeSearch.trim() !== '';

  const openFilters = () => {
    setDraftTaste(activeTaste);
    setDraftStrength(activeStrength);
    setDraftDirection(activeDirection);
    setDraftStatus(activeStatus);
    setDraftSearch(activeSearch);
    setIsFilterOpen(true);
  };

  const resetFilters = () => {
    setActiveTaste(ALL_FILTER_VALUE);
    setActiveStrength(ALL_FILTER_VALUE);
    setActiveDirection(ALL_FILTER_VALUE);
    setActiveStatus(showPopularOnly ? POPULAR_FILTER_VALUE : ALL_FILTER_VALUE);
    setActiveSearch('');
    setDraftTaste(ALL_FILTER_VALUE);
    setDraftStrength(ALL_FILTER_VALUE);
    setDraftDirection(ALL_FILTER_VALUE);
    setDraftStatus(showPopularOnly ? POPULAR_FILTER_VALUE : ALL_FILTER_VALUE);
    setDraftSearch('');
    setIsFilterOpen(false);
  };

  const applyFilters = () => {
    setActiveTaste(draftTaste);
    setActiveStrength(draftStrength);
    setActiveDirection(draftDirection);
    setActiveStatus(draftStatus);
    setActiveSearch(draftSearch);
    setIsFilterOpen(false);
  };

  return (
    <section className="content-section tobacco-page mixes-page" aria-label="Миксы">
      <header className="tobacco-page__header">
        <h1>Миксы</h1>
      </header>

      <div className="tobacco-toolbar">
        <div className="tobacco-brand-rail" aria-label="Быстрые фильтры по вкусам миксов">
          <button type="button" className={activeTaste === ALL_FILTER_VALUE ? 'tobacco-brand-filter is-active' : 'tobacco-brand-filter'} onClick={() => setActiveTaste(ALL_FILTER_VALUE)}>
            Все
          </button>
          {TASTE_TAGS.map((tag) => (
            <button key={tag} type="button" className={activeTaste === tag ? 'tobacco-brand-filter is-active' : 'tobacco-brand-filter'} onClick={() => setActiveTaste(tag)}>
              {formatTasteLabel(tag)}
            </button>
          ))}
        </div>
        <button type="button" className={hasFilters ? 'tobacco-filter-button is-active' : 'tobacco-filter-button'} onClick={openFilters} aria-label="Открыть фильтры миксов">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 7h10" />
            <path d="M18 7h2" />
            <path d="M16 5v4" />
            <path d="M4 17h2" />
            <path d="M10 17h10" />
            <path d="M8 15v4" />
            <path d="M4 12h5" />
            <path d="M13 12h7" />
            <path d="M11 10v4" />
          </svg>
        </button>
      </div>

      <div className="tobacco-list">
        {matches.map((mix) => {
          const isFavorite = favoriteMixes.includes(mix.id);
          const mixStrength = getMixStrength(mix);
          const mixDirection = getMixDirection(mix);

          return (
            <article
              key={mix.id}
              className="tobacco-list-item"
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
              <div className="tobacco-list-item__media">
                <img src={mix.image} alt={mix.title} />
              </div>
              <div className="tobacco-list-item__content">
                <div>
                  <p>{mixDirection}</p>
                  <h3>{mix.title}</h3>
                </div>
                <span>{mix.subtitle} · {mixStrength}</span>
                <small>{mix.description}</small>
                <StarRating rating={getMixRating(mix)} className="mixes-page__rating" />
              </div>
              <div className="tobacco-list-item__side">
                {mix.isPopular ? <span className="tobacco-list-item__badge">Top</span> : null}
                <button
                  type="button"
                  className={isFavorite ? 'tobacco-list-item__heart is-active' : 'tobacco-list-item__heart'}
                  onClick={(event) => {
                    event.stopPropagation();
                    onToggleFavoriteMix(mix.id);
                  }}
                  aria-label="Добавить микс в избранное"
                >
                  ♥
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {!matches.length ? <p className="empty-state">Пока нет точного совпадения. Сними один из фильтров и попробуй другой набор вкусов.</p> : null}

      {isFilterOpen ? (
        <div className="modal-backdrop modal-backdrop--above-nav" onClick={() => setIsFilterOpen(false)} role="presentation">
          <div className="modal-sheet tobacco-filter-modal" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-label="Фильтры миксов">
            <button type="button" className="modal-sheet__close" onClick={() => setIsFilterOpen(false)} aria-label="Закрыть">
              ×
            </button>
            <div className="tobacco-filter-modal__body">
              <label className="tobacco-filter-modal__search">
                <span>Поиск</span>
                <input
                  value={draftSearch}
                  onChange={(event) => setDraftSearch(event.target.value)}
                  placeholder="Название, вкус, ингредиент"
                  autoFocus
                />
              </label>

              <section className="tobacco-filter-modal__section">
                <h3>Вкус</h3>
                <div className="tobacco-filter-modal__options">
                  <button type="button" className={draftTaste === ALL_FILTER_VALUE ? 'tobacco-filter-option is-active' : 'tobacco-filter-option'} onClick={() => setDraftTaste(ALL_FILTER_VALUE)}>
                    Любой
                  </button>
                  {TASTE_TAGS.map((tag) => (
                    <button key={tag} type="button" className={draftTaste === tag ? 'tobacco-filter-option is-active' : 'tobacco-filter-option'} onClick={() => setDraftTaste(tag)}>
                      {formatTasteLabel(tag)}
                    </button>
                  ))}
                </div>
              </section>

              <section className="tobacco-filter-modal__section">
                <h3>Крепость</h3>
                <div className="tobacco-filter-modal__options">
                  <button type="button" className={draftStrength === ALL_FILTER_VALUE ? 'tobacco-filter-option is-active' : 'tobacco-filter-option'} onClick={() => setDraftStrength(ALL_FILTER_VALUE)}>
                    Любая
                  </button>
                  {mixStrengths.map((strength) => (
                    <button key={strength} type="button" className={draftStrength === strength ? 'tobacco-filter-option is-active' : 'tobacco-filter-option'} onClick={() => setDraftStrength(strength)}>
                      {strength}
                    </button>
                  ))}
                </div>
              </section>

              <section className="tobacco-filter-modal__section">
                <h3>Направление вкуса</h3>
                <div className="tobacco-filter-modal__options">
                  <button type="button" className={draftDirection === ALL_FILTER_VALUE ? 'tobacco-filter-option is-active' : 'tobacco-filter-option'} onClick={() => setDraftDirection(ALL_FILTER_VALUE)}>
                    Любое
                  </button>
                  {mixDirections.map((direction) => (
                    <button key={direction} type="button" className={draftDirection === direction ? 'tobacco-filter-option is-active' : 'tobacco-filter-option'} onClick={() => setDraftDirection(direction)}>
                      {direction}
                    </button>
                  ))}
                </div>
              </section>

              <section className="tobacco-filter-modal__section">
                <h3>Статус</h3>
                <div className="tobacco-filter-modal__options">
                  <button type="button" className={draftStatus === ALL_FILTER_VALUE ? 'tobacco-filter-option is-active' : 'tobacco-filter-option'} onClick={() => setDraftStatus(ALL_FILTER_VALUE)}>
                    Все
                  </button>
                  <button type="button" className={draftStatus === POPULAR_FILTER_VALUE ? 'tobacco-filter-option is-active' : 'tobacco-filter-option'} onClick={() => setDraftStatus(POPULAR_FILTER_VALUE)}>
                    Популярные
                  </button>
                </div>
              </section>

              <div className="tobacco-filter-modal__actions">
                <button type="button" className="tobacco-filter-modal__reset" onClick={resetFilters}>
                  Сбросить
                </button>
                <button type="button" className="tobacco-filter-modal__apply" onClick={applyFilters}>
                  Применить
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
