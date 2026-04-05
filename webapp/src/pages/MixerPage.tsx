import { useEffect, useMemo, useState } from 'react';
import { MixGrid } from '../components/MixGrid';
import { SectionTitle } from '../components/SectionTitle';
import type { AppContent, Mix } from '../types';

type MixerPageProps = {
  content: AppContent;
  favoriteMixes: string[];
  onToggleFavoriteMix: (id: string) => void;
  onOpenMix: (mix: Mix) => void;
  showPopularOnly?: boolean;
};

const TASTE_TAGS = ['цитрус', 'ягоды', 'холодок', 'сладкий', 'тропики', 'десерт', 'пряности'];

export function MixerPage({ content, favoriteMixes, onToggleFavoriteMix, onOpenMix, showPopularOnly = false }: MixerPageProps) {
  const [selectedTags, setSelectedTags] = useState<string[]>(showPopularOnly ? [] : ['тропики']);
  const sourceMixes = showPopularOnly ? content.mixes.filter((mix) => mix.isPopular) : content.mixes;

  useEffect(() => {
    setSelectedTags(showPopularOnly ? [] : ['тропики']);
  }, [showPopularOnly]);

  const matches = useMemo(() => {
    if (!selectedTags.length) return sourceMixes;
    return sourceMixes.filter((mix) => selectedTags.every((tag) => mix.notes.includes(tag)));
  }, [selectedTags, sourceMixes]);

  const toggleTag = (tag: string) => {
    setSelectedTags((current) => (current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag]));
  };

  return (
    <section className="content-section">
      <SectionTitle title={showPopularOnly ? 'Популярные миксы' : 'Миксер'} />
      <p className="lead-text">{showPopularOnly ? 'Собрали все популярные миксы в одном месте.' : 'Выбери вкусовые ноты и посмотри готовые сочетания. Это первая рабочая версия, дальше сюда можно добавить полноценный конструктор чаши.'}</p>
      <div className="tag-row">
        {TASTE_TAGS.map((tag) => (
          <button key={tag} type="button" className={selectedTags.includes(tag) ? 'tag-chip is-active' : 'tag-chip'} onClick={() => toggleTag(tag)}>
            {tag}
          </button>
        ))}
      </div>

      {matches.length ? (
        <MixGrid mixes={matches} favorites={favoriteMixes} onOpen={onOpenMix} onToggleFavorite={onToggleFavoriteMix} />
      ) : (
        <p className="empty-state">Пока нет точного совпадения. Сними один из фильтров и попробуй другой набор вкусов.</p>
      )}
    </section>
  );
}
