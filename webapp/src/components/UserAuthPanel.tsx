import { useState } from 'react';
import type { FormEvent } from 'react';
import type { PublicUser } from '../types';

type UserAuthPanelProps = {
  user: PublicUser | null;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  onSubmit: (phone: string, nickname: string) => Promise<void>;
  onLogout: () => void;
};

export function UserAuthPanel({ user, isOpen, onOpen, onClose, onSubmit, onLogout }: UserAuthPanelProps) {
  const [phone, setPhone] = useState('');
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await onSubmit(phone, nickname);
      setPhone('');
      setNickname('');
      onClose();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Не удалось войти');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button type="button" className={user ? 'user-chip is-authorized' : 'user-chip'} onClick={onOpen}>
        <span>{user ? user.nickname.slice(0, 1).toUpperCase() : '+'}</span>
        <strong>{user ? user.nickname : 'Войти'}</strong>
      </button>

      {isOpen ? (
        <div className="modal-backdrop" onClick={onClose} role="presentation">
          <div className="modal-sheet user-auth-modal" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-label="Вход пользователя">
            <button type="button" className="modal-sheet__close" onClick={onClose} aria-label="Закрыть">
              ×
            </button>
            {user ? (
              <div className="user-auth-modal__body">
                <p>Профиль</p>
                <h2>{user.nickname}</h2>
                <span>Теперь можно оценивать вкусы и миксы, а также добавлять свои рецепты в базу.</span>
                <button type="button" className="user-auth-modal__secondary" onClick={onLogout}>
                  Выйти
                </button>
              </div>
            ) : (
              <form className="user-auth-modal__body" onSubmit={handleSubmit}>
                <p>Регистрация</p>
                <h2>Вход по телефону</h2>
                <span>Введите номер и никнейм. SMS пока не требуется: это быстрый профиль для оценок и авторских миксов.</span>
                <label>
                  <small>Телефон</small>
                  <input value={phone} onChange={(event) => setPhone(event.target.value)} inputMode="tel" placeholder="+7 999 123-45-67" autoFocus />
                </label>
                <label>
                  <small>Никнейм</small>
                  <input value={nickname} onChange={(event) => setNickname(event.target.value)} placeholder="Например, SmokeChef" />
                </label>
                {error ? <strong className="user-auth-modal__error">{error}</strong> : null}
                <button type="submit" className="user-auth-modal__primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Входим...' : 'Войти'}
                </button>
              </form>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
