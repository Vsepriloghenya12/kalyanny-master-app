import { useState } from 'react';
import type { PublicUser, RatingSummary, RatingTargetType, UserRating } from '../types';

type RatingControlProps = {
  title: string;
  targetType: RatingTargetType;
  targetId: string;
  summary?: RatingSummary;
  userRating?: UserRating;
  user: PublicUser | null;
  onRate: (targetType: RatingTargetType, targetId: string, value: number) => Promise<void>;
  onLoginRequest: () => void;
};

const STAR_VALUES = [1, 2, 3, 4, 5];

export function RatingControl({ title, targetType, targetId, summary, userRating, user, onRate, onLoginRequest }: RatingControlProps) {
  const [pendingValue, setPendingValue] = useState<number | null>(null);
  const [error, setError] = useState('');
  const activeValue = pendingValue ?? userRating?.value ?? 0;

  const handleRate = async (value: number) => {
    if (!user) {
      onLoginRequest();
      return;
    }

    setError('');
    setPendingValue(value);

    try {
      await onRate(targetType, targetId, value);
    } catch (rateError) {
      setError(rateError instanceof Error ? rateError.message : 'Оценка не сохранилась');
    } finally {
      setPendingValue(null);
    }
  };

  const summaryText = summary && summary.count > 0 ? `${summary.average.toFixed(1)} · ${summary.count} оценок` : 'Пока без оценок';

  return (
    <section className="rating-control" aria-label={title}>
      <div className="rating-control__top">
        <div>
          <p>Рейтинг</p>
          <h4>{title}</h4>
        </div>
        <span>{summaryText}</span>
      </div>
      <div className="rating-control__stars">
        {STAR_VALUES.map((value) => (
          <button
            key={value}
            type="button"
            className={value <= activeValue ? 'rating-control__star is-active' : 'rating-control__star'}
            onClick={() => handleRate(value)}
            aria-label={`Поставить ${value} из 5`}
          >
            ★
          </button>
        ))}
      </div>
      <small>{user ? `Ваша оценка${userRating ? `: ${userRating.value}` : ' появится сразу'}` : 'Войдите по телефону, чтобы оценивать'}</small>
      {error ? <strong className="rating-control__error">{error}</strong> : null}
    </section>
  );
}
