import { getMixDirection, getMixStrength } from '../mixMeta';
import type { Mix, PublicUser, RatingSummary, RatingTargetType, UserRating } from '../types';
import { ListRow } from './ListRow';
import { RatingControl } from './RatingControl';

export type TasteProfile = {
  note: string;
  label: string;
  image: string;
  description: string;
  strength: string;
  mixes: Mix[];
};

type TasteModalProps = {
  taste: TasteProfile | null;
  user: PublicUser | null;
  ratingSummary?: RatingSummary;
  userRating?: UserRating;
  onClose: () => void;
  onOpenMix: (mix: Mix) => void;
  onLoginRequest: () => void;
  onRate: (targetType: RatingTargetType, targetId: string, value: number) => Promise<void>;
};

function formatMixCount(count: number) {
  const lastDigit = count % 10;
  const lastTwoDigits = count % 100;

  if (lastDigit === 1 && lastTwoDigits !== 11) return `${count} микс`;
  if ([2, 3, 4].includes(lastDigit) && ![12, 13, 14].includes(lastTwoDigits)) return `${count} микса`;
  return `${count} миксов`;
}

export function TasteModal({ taste, user, ratingSummary, userRating, onClose, onOpenMix, onLoginRequest, onRate }: TasteModalProps) {
  if (!taste) return null;

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div className="modal-sheet taste-modal" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-label={taste.label}>
        <button type="button" className="modal-sheet__close" onClick={onClose} aria-label="Закрыть">
          ×
        </button>
        <div className="modal-sheet__hero taste-modal__hero" style={{ backgroundImage: `linear-gradient(180deg, rgba(255,248,236,.04), rgba(244,238,230,.32)), url(${taste.image})` }}>
          <div className="modal-sheet__hero-text profile-badge">
            <span>{taste.strength}</span>
            <span>{taste.label}</span>
          </div>
        </div>
        <div className="modal-sheet__body">
          <section className="modal-sheet__section">
            <h4>Профиль вкуса</h4>
            <dl className="modal-sheet__meta">
              <div>
                <dt>Крепость табака</dt>
                <dd>{taste.strength}</dd>
              </div>
              <div>
                <dt>Миксы</dt>
                <dd>{formatMixCount(taste.mixes.length)}</dd>
              </div>
            </dl>
          </section>
          <section className="modal-sheet__section">
            <h4>Описание</h4>
            <p>{taste.description}</p>
          </section>
          <section className="modal-sheet__section">
            <h4>Миксы с этим вкусом</h4>
            <div className="taste-modal__mixes">
              {taste.mixes.map((mix) => (
                <ListRow
                  key={mix.id}
                  image={mix.image}
                  title={mix.title}
                  subtitle={mix.subtitle}
                  meta={`${getMixStrength(mix)} · ${getMixDirection(mix)}`}
                  onClick={() => onOpenMix(mix)}
                />
              ))}
            </div>
          </section>
          <RatingControl
            title="Оценить вкус"
            targetType="taste"
            targetId={taste.note}
            summary={ratingSummary}
            userRating={userRating}
            user={user}
            onLoginRequest={onLoginRequest}
            onRate={onRate}
          />
        </div>
      </div>
    </div>
  );
}
