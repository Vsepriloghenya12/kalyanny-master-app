import type { Mix } from '../types';

type MixModalProps = {
  mix: Mix | null;
  onClose: () => void;
};

export function MixModal({ mix, onClose }: MixModalProps) {
  if (!mix) return null;

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div className="modal-sheet" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-label={mix.title}>
        <button type="button" className="modal-sheet__close" onClick={onClose} aria-label="Закрыть">
          ×
        </button>
        <div className="modal-sheet__hero" style={{ backgroundImage: `linear-gradient(180deg, rgba(5,5,5,.08), rgba(5,5,5,.88)), url(${mix.image})` }}>
          <h3>{mix.title}</h3>
          <p>{mix.subtitle}</p>
        </div>
        <div className="modal-sheet__body">
          <div className="tag-row">
            {mix.ingredients.map((item) => (
              <span key={item} className="tag-chip">
                {item}
              </span>
            ))}
          </div>
          <p>{mix.description}</p>
          <p>{mix.details}</p>
        </div>
      </div>
    </div>
  );
}
