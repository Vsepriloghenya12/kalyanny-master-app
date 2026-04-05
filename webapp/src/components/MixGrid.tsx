import type { Mix } from '../types';

type MixGridProps = {
  mixes: Mix[];
  favorites: string[];
  onOpen: (mix: Mix) => void;
  onToggleFavorite: (id: string) => void;
};

export function MixGrid({ mixes, favorites, onOpen, onToggleFavorite }: MixGridProps) {
  return (
    <div className="mix-grid">
      {mixes.map((mix) => {
        const isFavorite = favorites.includes(mix.id);
        return (
          <article key={mix.id} className="mix-card" style={{ backgroundImage: `linear-gradient(180deg, rgba(10,10,10,.12), rgba(10,10,10,.9)), url(${mix.image})` }}>
            <button type="button" className={isFavorite ? 'mix-card__heart is-active' : 'mix-card__heart'} onClick={() => onToggleFavorite(mix.id)} aria-label="Добавить в избранное">
              ♥
            </button>
            <div className="mix-card__content">
              <div>
                <h3>{mix.title}</h3>
                <p>{mix.subtitle}</p>
              </div>
              <button type="button" className="action-button action-button--small" onClick={() => onOpen(mix)}>
                Подробнее
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
}
