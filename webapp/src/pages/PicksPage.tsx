import { ListRow } from '../components/ListRow';
import { SectionTitle } from '../components/SectionTitle';
import type { AppContent } from '../types';

type PicksPageProps = {
  content: AppContent;
};

export function PicksPage({ content }: PicksPageProps) {
  const mixById = new Map(content.mixes.map((mix) => [mix.id, mix]));

  return (
    <section className="content-section">
      <SectionTitle title="Подборки" />
      <div className="collection-list">
        {content.collections.map((collection) => (
          <article key={collection.id} className="collection-card" style={{ backgroundImage: `linear-gradient(180deg, rgba(9,9,9,.18), rgba(9,9,9,.82)), url(${collection.image})` }}>
            <div>
              <h3>{collection.title}</h3>
              <p>{collection.description}</p>
            </div>
            <div className="collection-card__mixes">
              {collection.mixIds.slice(0, 3).map((mixId) => {
                const mix = mixById.get(mixId);
                return mix ? <span key={mixId}>{mix.title}</span> : null;
              })}
            </div>
          </article>
        ))}
      </div>

      <SectionTitle title="Свежие новости" />
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
    </section>
  );
}
