import type { Product } from '../types';

type ProductModalProps = {
  product: Product | null;
  isFavorite: boolean;
  onClose: () => void;
  onToggleFavorite: (id: string) => void;
};

export function ProductModal({ product, isFavorite, onClose, onToggleFavorite }: ProductModalProps) {
  if (!product) return null;

  const profileTitle = product.type === 'hookah' ? 'Профиль кальяна' : product.type === 'accessory' ? 'Профиль аксессуара' : 'Профиль табака';
  const strengthLabel = product.type === 'hookah' ? 'Тяга' : product.type === 'accessory' ? 'Тип' : 'Крепость';
  const lineLabel = product.type === 'accessory' ? 'Категория' : 'Линейка';

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div className="modal-sheet product-modal" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-label={product.title}>
        <button type="button" className="modal-sheet__close" onClick={onClose} aria-label="Закрыть">
          ×
        </button>
        <div className="modal-sheet__hero product-modal__hero" style={{ backgroundImage: `linear-gradient(180deg, rgba(5,5,5,.08), rgba(5,5,5,.9)), url(${product.image})` }}>
          <p className="product-modal__eyebrow">{product.brand}</p>
          <h3>{product.title}</h3>
          <p>{product.line}</p>
        </div>
        <div className="modal-sheet__body">
          <section className="modal-sheet__section">
            <h4>{profileTitle}</h4>
            <dl className="modal-sheet__meta">
              <div>
                <dt>Бренд</dt>
                <dd>{product.brand}</dd>
              </div>
              <div>
                <dt>{strengthLabel}</dt>
                <dd>{product.strength}</dd>
              </div>
              <div>
                <dt>{lineLabel}</dt>
                <dd>{product.line}</dd>
              </div>
              <div>
                <dt>Статус</dt>
                <dd>{product.isNew ? 'Новинка' : 'В каталоге'}</dd>
              </div>
            </dl>
          </section>
          <section className="modal-sheet__section">
            <h4>Описание</h4>
            <p>{product.description}</p>
          </section>
          <button type="button" className={isFavorite ? 'product-modal__favorite is-active' : 'product-modal__favorite'} onClick={() => onToggleFavorite(product.id)}>
            {isFavorite ? 'В избранном' : 'Добавить в избранное'}
          </button>
        </div>
      </div>
    </div>
  );
}
