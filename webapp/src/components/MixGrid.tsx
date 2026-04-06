import type { Mix } from '../types';
import { getMixRating } from '../mixMeta';
import { StarRating } from './StarRating';

type MixGridProps = {
  mixes: Mix[];
  favorites: string[];
  onOpen: (mix: Mix) => void;
  onToggleFavorite: (id: string) => void;
  layout?: 'grid' | 'rail';
};

export function MixGrid({ mixes, favorites, onOpen, onToggleFavorite, layout = 'grid' }: MixGridProps) {
  return (
    <div className={layout === 'rail' ? 'mix-grid mix-grid--rail' : 'mix-grid'}>
      {mixes.map((mix) => {
        const isFavorite = favorites.includes(mix.id);
        return (
          <article key={mix.id} className={layout === 'rail' ? 'mix-card mix-card--rail' : 'mix-card'} style={{ backgroundImage: `linear-gradient(180deg, rgba(10,10,10,.12), rgba(10,10,10,.9)), url(${mix.image})` }}>
            <button type="button" className={isFavorite ? 'mix-card__heart is-active' : 'mix-card__heart'} onClick={() => onToggleFavorite(mix.id)} aria-label="Добавить в избранное">
              ♥
            </button>
            <div className="mix-card__content">
              <div>
                <h3>{mix.title}</h3>
                <p>{mix.subtitle}</p>
                <StarRating rating={getMixRating(mix)} className="mix-card__rating" />
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
