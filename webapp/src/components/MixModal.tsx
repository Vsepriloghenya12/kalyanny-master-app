import type { Mix, PublicUser, RatingSummary, RatingTargetType, UserRating } from '../types';
import { getMixDirection, getMixStrength } from '../mixMeta';
import { RatingControl } from './RatingControl';

type MixModalProps = {
  mix: Mix | null;
  user: PublicUser | null;
  ratingSummary?: RatingSummary;
  userRating?: UserRating;
  onClose: () => void;
  onLoginRequest: () => void;
  onRate: (targetType: RatingTargetType, targetId: string, value: number) => Promise<void>;
};

export function MixModal({ mix, user, ratingSummary, userRating, onClose, onLoginRequest, onRate }: MixModalProps) {
  if (!mix) return null;

  const mixDirection = getMixDirection(mix);
  const mixStrength = getMixStrength(mix);

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div className="modal-sheet" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-label={mix.title}>
        <button type="button" className="modal-sheet__close" onClick={onClose} aria-label="Закрыть">
          ×
        </button>
        <div className="modal-sheet__hero" style={{ backgroundImage: `linear-gradient(180deg, rgba(255,248,236,.04), rgba(244,238,230,.32)), url(${mix.image})` }}>
          <div className="modal-sheet__hero-text profile-badge">
            <span>{mixStrength}</span>
            <span>{mixDirection}</span>
          </div>
        </div>
        <div className="modal-sheet__body">
          <section className="modal-sheet__section">
            <h4>Профиль</h4>
            <dl className="modal-sheet__meta">
              <div>
                <dt>Крепость</dt>
                <dd>{mixStrength}</dd>
              </div>
              <div>
                <dt>Направление</dt>
                <dd>{mixDirection}</dd>
              </div>
            </dl>
          </section>
          <section className="modal-sheet__section">
            <h4>Вкусы</h4>
            <p className="modal-sheet__ingredients">{mix.ingredients.join(' · ')}</p>
          </section>
          <section className="modal-sheet__section">
            <h4>Описание</h4>
            <p>{mix.description}</p>
          </section>
          <section className="modal-sheet__section">
            <h4>Как раскрывается</h4>
            <p>{mix.details}</p>
          </section>
          {mix.authorNickname ? (
            <section className="modal-sheet__section">
              <h4>Автор</h4>
              <p>{mix.authorNickname}</p>
            </section>
          ) : null}
          <RatingControl
            title="Оценить микс"
            targetType="mix"
            targetId={mix.id}
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
