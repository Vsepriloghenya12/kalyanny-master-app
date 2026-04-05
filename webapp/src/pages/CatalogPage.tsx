import { ChipTabs } from '../components/ChipTabs';
import { ListRow } from '../components/ListRow';
import { SectionTitle } from '../components/SectionTitle';
import type { AppContent } from '../types';

export type CatalogFilter = 'tobacco' | 'hookah' | 'news' | 'brands';

type CatalogPageProps = {
  content: AppContent;
  filter: CatalogFilter;
  onFilterChange: (value: CatalogFilter) => void;
  favoriteProducts: string[];
  favoriteBrands: string[];
  onToggleProduct: (id: string) => void;
  onToggleBrand: (id: string) => void;
};

export function CatalogPage({ content, filter, onFilterChange, favoriteProducts, favoriteBrands, onToggleProduct, onToggleBrand }: CatalogPageProps) {
  return (
    <section className="content-section">
      <SectionTitle title="Каталог" />
      <ChipTabs
        value={filter}
        onChange={onFilterChange}
        options={[
          { value: 'tobacco', label: 'Табаки' },
          { value: 'hookah', label: 'Кальяны' },
          { value: 'news', label: 'Новинки' },
          { value: 'brands', label: 'Бренды' }
        ]}
      />

      {filter === 'brands' ? (
        <div className="list-stack">
          {content.brands.map((brand) => {
            const isFavorite = favoriteBrands.includes(brand.id);
            return (
              <ListRow
                key={brand.id}
                image={brand.image}
                title={brand.title}
                subtitle={brand.description}
                meta={`${brand.country} · ${brand.highlight}`}
                action={
                  <button type="button" className={isFavorite ? 'mini-favorite is-active' : 'mini-favorite'} onClick={() => onToggleBrand(brand.id)}>
                    ♥
                  </button>
                }
              />
            );
          })}
        </div>
      ) : null}

      {filter === 'news' ? (
        <div className="list-stack">
          {content.news.map((item) => (
            <ListRow
              key={item.id}
              image={item.image}
              title={item.title}
              subtitle={item.description}
              meta={item.date}
              action={
                <a className="inline-link" href={item.linkTarget}>
                  {item.linkLabel}
                </a>
              }
            />
          ))}
        </div>
      ) : null}

      {filter === 'tobacco' || filter === 'hookah' ? (
        <div className="list-stack">
          {content.products
            .filter((product) => (filter === 'tobacco' ? product.type === 'tobacco' : product.type === 'hookah'))
            .map((product) => {
              const isFavorite = favoriteProducts.includes(product.id);
              return (
                <ListRow
                  key={product.id}
                  image={product.image}
                  title={product.title}
                  subtitle={product.description}
                  meta={`${product.brand} · ${product.line} · ${product.strength}`}
                  action={
                    <button type="button" className={isFavorite ? 'mini-favorite is-active' : 'mini-favorite'} onClick={() => onToggleProduct(product.id)}>
                      ♥
                    </button>
                  }
                />
              );
            })}
        </div>
      ) : null}
    </section>
  );
}
