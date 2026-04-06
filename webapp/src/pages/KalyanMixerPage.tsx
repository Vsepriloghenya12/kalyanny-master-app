import { useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import { StarRating } from '../components/StarRating';
import { getMixDirection, getMixRating, getMixStrength } from '../mixMeta';
import type { AppContent, Mix, Product } from '../types';

type KalyanMixerPageProps = {
  content: AppContent;
  favoriteMixes: string[];
  onToggleFavoriteMix: (id: string) => void;
  onOpenMix: (mix: Mix) => void;
  onOpenProduct: (product: Product) => void;
  showPopularOnly?: boolean;
};

type MixerTaste = {
  id: string;
  name: string;
  icon: string;
  family: string;
  note: string;
  description: string;
  sweetness: number;
  freshness: number;
  strength: number;
  body: number;
  pairs: string[];
};

type SelectedTaste = {
  id: string;
  amount: number;
};

type SelectedTasteItem = SelectedTaste & {
  taste: MixerTaste;
};

type MixerMetrics = {
  sweetness: number;
  freshness: number;
  strength: number;
  body: number;
};

type MixerRecommendation = {
  title: string;
  description: string;
  icon: string;
  tasteId?: string;
};

type TobaccoExample = {
  product: Product;
  matchingTastes: SelectedTasteItem[];
  matchedAmount: number;
};

const ALL_FILTER_VALUE = 'all';

const TOBACCO_KEYWORDS_BY_TASTE: Record<string, string[]> = {
  watermelon: ['арбуз', 'watermelon'],
  lemon: ['лимон', 'lemon', 'лайм', 'lime', 'цитрус', 'citrus'],
  orange: ['апельсин', 'orange', 'цитрус', 'citrus'],
  grapefruit: ['грейпфрут', 'grapefruit', 'цитрус', 'citrus'],
  berries: ['ягод', 'berries', 'berry', 'лесн'],
  strawberry: ['клубник', 'strawberry', 'ягод'],
  peach: ['персик', 'peach'],
  mango: ['манго', 'mango', 'тропик', 'tropic'],
  pineapple: ['ананас', 'pineapple', 'тропик', 'tropic'],
  mint: ['мята', 'mint', 'свеж', 'холод', 'supernova'],
  ice: ['лед', 'ice', 'холод', 'свеж', 'supernova'],
  vanilla: ['ваниль', 'vanilla', 'йогурт', 'yogurt', 'крем', 'cream', 'слив', 'десерт'],
  cream: ['слив', 'cream', 'йогурт', 'yogurt', 'крем', 'десерт'],
  cola: ['кола', 'cola'],
  spice: ['прян', 'spice', 'oak', 'cured', 'древ', 'сигар']
};

const MIXER_TASTES: MixerTaste[] = [
  { id: 'watermelon', name: 'Арбуз', icon: '🍉', family: 'Фрукты', note: 'сладкий', description: 'Сочная сладкая база, хорошо держит легкий летний профиль.', sweetness: 4.4, freshness: 2.4, strength: 1.6, body: 2.4, pairs: ['mint', 'lemon', 'berries'] },
  { id: 'lemon', name: 'Лимон', icon: '🍋', family: 'Цитрус', note: 'цитрус', description: 'Кислый яркий акцент, поднимает микс и чистит финиш.', sweetness: 1.6, freshness: 3.8, strength: 2.2, body: 1.7, pairs: ['watermelon', 'mint', 'vanilla'] },
  { id: 'orange', name: 'Апельсин', icon: '🍊', family: 'Цитрус', note: 'цитрус', description: 'Более мягкий цитрус с округлой сладостью.', sweetness: 3.2, freshness: 3, strength: 2, body: 2.1, pairs: ['berries', 'cola', 'spice'] },
  { id: 'grapefruit', name: 'Грейпфрут', icon: '🟠', family: 'Цитрус', note: 'цитрус', description: 'Горчинка и взрослая цитрусовая сухость для баланса сладости.', sweetness: 1.8, freshness: 3.2, strength: 3, body: 2.2, pairs: ['peach', 'berries', 'ice'] },
  { id: 'berries', name: 'Лесные ягоды', icon: '🫐', family: 'Ягоды', note: 'ягоды', description: 'Плотный ягодный центр с темным ароматным послевкусием.', sweetness: 3.6, freshness: 2.4, strength: 2.4, body: 3.4, pairs: ['lemon', 'vanilla', 'ice'] },
  { id: 'strawberry', name: 'Клубника', icon: '🍓', family: 'Ягоды', note: 'ягоды', description: 'Мягкая сладкая ягода, хорошо склеивает десерт и фрукты.', sweetness: 4, freshness: 2.1, strength: 1.8, body: 2.8, pairs: ['cream', 'mango', 'mint'] },
  { id: 'peach', name: 'Персик', icon: '🍑', family: 'Фрукты', note: 'сладкий', description: 'Мягкая фруктовая база, сглаживает кислоту и крепость.', sweetness: 3.8, freshness: 1.9, strength: 1.8, body: 3.1, pairs: ['grapefruit', 'cream', 'mango'] },
  { id: 'mango', name: 'Манго', icon: '🥭', family: 'Тропики', note: 'тропики', description: 'Тропическая сладость и густое фруктовое тело.', sweetness: 4.2, freshness: 2.2, strength: 2, body: 3.5, pairs: ['pineapple', 'ice', 'strawberry'] },
  { id: 'pineapple', name: 'Ананас', icon: '🍍', family: 'Тропики', note: 'тропики', description: 'Кисло-сладкий тропический верх, добавляет искру.', sweetness: 3.2, freshness: 3, strength: 2.3, body: 2.4, pairs: ['mango', 'mint', 'cola'] },
  { id: 'mint', name: 'Мята', icon: '🌿', family: 'Свежесть', note: 'холодок', description: 'Чистая травяная свежесть без ледяного удара.', sweetness: 0.8, freshness: 4.4, strength: 1.4, body: 1.1, pairs: ['watermelon', 'lemon', 'strawberry'] },
  { id: 'ice', name: 'Лед', icon: '🧊', family: 'Свежесть', note: 'холодок', description: 'Холодный финиш, лучше добавлять небольшими долями.', sweetness: 0.4, freshness: 5, strength: 1.2, body: 0.8, pairs: ['berries', 'mango', 'grapefruit'] },
  { id: 'vanilla', name: 'Ваниль', icon: '🍦', family: 'Десерт', note: 'десерт', description: 'Кремовая округлость: смягчает резкие и кислые вкусы.', sweetness: 3.6, freshness: 0.8, strength: 1.6, body: 4, pairs: ['berries', 'lemon', 'cola'] },
  { id: 'cream', name: 'Сливки', icon: '🥛', family: 'Десерт', note: 'десерт', description: 'Плотный мягкий слой для десертного тела.', sweetness: 3.4, freshness: 0.5, strength: 1.5, body: 4.4, pairs: ['strawberry', 'peach', 'berries'] },
  { id: 'cola', name: 'Кола', icon: '🥤', family: 'Напитки', note: 'пряности', description: 'Сладкая газированная пряность, добавляет узнаваемый акцент.', sweetness: 3.7, freshness: 2, strength: 2.5, body: 2.8, pairs: ['orange', 'vanilla', 'pineapple'] },
  { id: 'spice', name: 'Пряность', icon: '🌶️', family: 'Специи', note: 'пряности', description: 'Теплый взрослый штрих: хорошо работает маленькой долей.', sweetness: 1.2, freshness: 0.8, strength: 3.6, body: 3.3, pairs: ['orange', 'cola', 'vanilla'] }
];

const STARTER_SELECTION: SelectedTaste[] = [
  { id: 'watermelon', amount: 55 },
  { id: 'lemon', amount: 30 },
  { id: 'mint', amount: 15 }
];

const MIXER_PRESETS: Array<{ title: string; subtitle: string; tastes: SelectedTaste[] }> = [
  { title: 'Арбузный айс', subtitle: 'Сочно, свежо, без тяжести.', tastes: STARTER_SELECTION },
  { title: 'Ягодный крем', subtitle: 'Плотнее и мягче, десертный финиш.', tastes: [{ id: 'berries', amount: 45 }, { id: 'cream', amount: 25 }, { id: 'strawberry', amount: 30 }] },
  { title: 'Тропик кола', subtitle: 'Сладкая газировка с фруктовым верхом.', tastes: [{ id: 'mango', amount: 40 }, { id: 'pineapple', amount: 30 }, { id: 'cola', amount: 30 }] }
];

const TASTE_BY_ID = MIXER_TASTES.reduce<Record<string, MixerTaste>>((acc, taste) => {
  acc[taste.id] = taste;
  return acc;
}, {});

const FAMILY_FILTERS = [ALL_FILTER_VALUE, ...new Set(MIXER_TASTES.map((taste) => taste.family))];
const METRIC_LABELS: Array<{ key: keyof MixerMetrics; label: string }> = [
  { key: 'strength', label: 'Крепость' },
  { key: 'sweetness', label: 'Сладость' },
  { key: 'freshness', label: 'Свежесть' },
  { key: 'body', label: 'Плотность' }
];

function clampAmount(value: number) {
  return Math.max(5, Math.min(80, value));
}

function formatFamilyLabel(family: string) {
  return family === ALL_FILTER_VALUE ? 'Все' : family;
}

function getMetricPercent(value: number) {
  return `${Math.round((Math.max(0, Math.min(5, value)) / 5) * 100)}%`;
}

function getStrengthLabel(value: number) {
  if (value < 1.8) return 'Легкая';
  if (value < 2.5) return 'Средняя';
  if (value < 3.2) return 'Средняя+';
  return 'Крепкая';
}

function getMood(metrics: MixerMetrics) {
  if (metrics.freshness >= 3.6) return 'холодный финиш';
  if (metrics.body >= 3.6) return 'плотное тело';
  if (metrics.sweetness >= 3.7) return 'мягкая сладость';
  if (metrics.strength >= 3) return 'выразительный удар';
  return 'чистый баланс';
}

function getProductSearchText(product: Product) {
  return `${product.title} ${product.brand} ${product.line} ${product.strength} ${product.description}`.toLowerCase();
}

function getTobaccoExamples(products: Product[], selectedItems: SelectedTasteItem[]): TobaccoExample[] {
  if (!selectedItems.length) return [];

  return products
    .filter((product) => product.type === 'tobacco')
    .map((product) => {
      const searchableText = getProductSearchText(product);
      const matchingTastes = selectedItems.filter((item) => {
        const keywords = TOBACCO_KEYWORDS_BY_TASTE[item.id] ?? [];
        return keywords.some((keyword) => searchableText.includes(keyword.toLowerCase()));
      });

      return {
        product,
        matchingTastes,
        matchedAmount: matchingTastes.reduce((sum, item) => sum + item.amount, 0)
      };
    })
    .filter((item) => item.matchingTastes.length > 0)
    .sort((first, second) => second.matchedAmount - first.matchedAmount || first.product.title.localeCompare(second.product.title, 'ru'));
}

function getFlavorTitle(selectedItems: SelectedTasteItem[], metrics: MixerMetrics) {
  if (!selectedItems.length) return 'Собери свой вкус';

  const familyScores = selectedItems.reduce<Record<string, number>>((acc, item) => {
    acc[item.taste.family] = (acc[item.taste.family] ?? 0) + item.amount;
    return acc;
  }, {});
  const topFamilies = Object.entries(familyScores)
    .sort((first, second) => second[1] - first[1])
    .slice(0, 2)
    .map(([family]) => family);

  return `${topFamilies.join(' + ')} · ${getMood(metrics)}`;
}

function buildRecommendations(selectedItems: SelectedTasteItem[], totalAmount: number, metrics: MixerMetrics): MixerRecommendation[] {
  const selectedIds = new Set(selectedItems.map((item) => item.id));
  const recommendations: MixerRecommendation[] = [];

  const pushTaste = (tasteId: string, title: string, description: string) => {
    const taste = TASTE_BY_ID[tasteId];
    if (!taste || selectedIds.has(tasteId)) return;
    recommendations.push({ title, description, icon: taste.icon, tasteId });
  };

  if (!selectedItems.length) {
    return [
      { title: 'Начни с базы', description: 'Для первого слоя хорошо подходят арбуз, персик или манго на 45-60%.', icon: '🍉', tasteId: 'watermelon' },
      { title: 'Добавь верх', description: 'Цитрус делает микс понятнее и ярче, особенно если база сладкая.', icon: '🍋', tasteId: 'lemon' },
      { title: 'Поставь финиш', description: 'Мята или лед дают свежий хвост, но лучше держать их небольшими долями.', icon: '🌿', tasteId: 'mint' }
    ];
  }

  if (totalAmount < 95) recommendations.push({ title: `Осталось ${100 - totalAmount}%`, description: 'Добери чашу мягкой базой или акцентом, чтобы пропорции читались ровнее.', icon: '⚖️' });
  if (totalAmount > 105) recommendations.push({ title: `Перебор ${totalAmount - 100}%`, description: 'Сумма выше 100%: уменьши самый доминирующий вкус, чтобы микс не стал мутным.', icon: '⚖️' });

  const pairCandidate = selectedItems.flatMap((item) => item.taste.pairs).find((tasteId) => !selectedIds.has(tasteId));
  if (pairCandidate) pushTaste(pairCandidate, 'Хорошая связка', `${TASTE_BY_ID[pairCandidate].name} дружит с уже выбранным профилем и добавит понятный второй слой.`);
  if (metrics.freshness < 2.1) {
    pushTaste('mint', 'Не хватает свежести', 'Добавь 5-15% мяты, чтобы финиш стал чище, но не ледяным.');
    pushTaste('ice', 'Холодный финиш', 'Лед лучше работает маленькой долей, когда микс уже сладкий или ягодный.');
  }
  if (metrics.sweetness > 3.8) {
    pushTaste('grapefruit', 'Сбей сладость', 'Грейпфрут даст горчинку и не позволит миксу стать приторным.');
    pushTaste('lemon', 'Добавь кислоты', 'Лимон поднимет верх и сделает сладкий профиль ярче.');
  }
  if (metrics.body < 2.3) {
    pushTaste('vanilla', 'Добавь тело', 'Ваниль склеивает фрукты и делает чашу плотнее.');
    pushTaste('cola', 'Сделай узнаваемее', 'Кола добавит пряный газированный слой и чуть больше характера.');
  }
  if (metrics.strength > 3.1) {
    pushTaste('peach', 'Смягчи крепость', 'Персик округляет острые вкусы и делает микс дружелюбнее.');
    pushTaste('cream', 'Округли удар', 'Сливки смягчают резкость и добавляют десертное тело.');
  }

  return recommendations.length ? recommendations.slice(0, 4) : [{ title: 'Баланс хороший', description: 'Микс уже выглядит собранным. Если хочется ярче, добавь 5-10% контрастного акцента.', icon: '✅' }];
}

export function KalyanMixerPage({ content, favoriteMixes, onToggleFavoriteMix, onOpenMix, onOpenProduct, showPopularOnly = false }: KalyanMixerPageProps) {
  const [selectedTastes, setSelectedTastes] = useState<SelectedTaste[]>(STARTER_SELECTION);
  const [activeFamily, setActiveFamily] = useState(ALL_FILTER_VALUE);

  const selectedItems = useMemo(() => {
    return selectedTastes
      .map((item) => {
        const taste = TASTE_BY_ID[item.id];
        return taste ? { ...item, taste } : null;
      })
      .filter((item): item is SelectedTasteItem => Boolean(item));
  }, [selectedTastes]);

  const selectedIds = useMemo(() => new Set(selectedItems.map((item) => item.id)), [selectedItems]);
  const totalAmount = selectedItems.reduce((sum, item) => sum + item.amount, 0);

  const metrics = useMemo<MixerMetrics>(() => {
    if (!selectedItems.length || totalAmount <= 0) return { sweetness: 0, freshness: 0, strength: 0, body: 0 };

    const weighted = (key: keyof MixerMetrics) => selectedItems.reduce((sum, item) => sum + item.taste[key] * item.amount, 0) / totalAmount;
    return { sweetness: weighted('sweetness'), freshness: weighted('freshness'), strength: weighted('strength'), body: weighted('body') };
  }, [selectedItems, totalAmount]);

  const flavorTitle = getFlavorTitle(selectedItems, metrics);
  const strengthLabel = getStrengthLabel(metrics.strength);
  const recommendations = useMemo(() => buildRecommendations(selectedItems, totalAmount, metrics), [metrics, selectedItems, totalAmount]);
  const visibleTastes = useMemo(() => MIXER_TASTES.filter((taste) => activeFamily === ALL_FILTER_VALUE || taste.family === activeFamily), [activeFamily]);

  const suggestedMixes = useMemo(() => {
    if (!selectedItems.length) return content.mixes.filter((mix) => (showPopularOnly ? mix.isPopular : true)).slice(0, 4);

    const selectedNotes = new Set(selectedItems.map((item) => item.taste.note));
    return content.mixes
      .map((mix) => ({ mix, score: mix.notes.reduce((score, note) => score + (selectedNotes.has(note) ? 1 : 0), 0) }))
      .filter((item) => item.score > 0)
      .sort((first, second) => second.score - first.score || Number(second.mix.isPopular) - Number(first.mix.isPopular))
      .slice(0, 4)
      .map((item) => item.mix);
  }, [content.mixes, selectedItems, showPopularOnly]);
  const tobaccoExamples = useMemo(() => getTobaccoExamples(content.products, selectedItems), [content.products, selectedItems]);

  const addTaste = (tasteId: string) => {
    setSelectedTastes((current) => {
      const existing = current.find((item) => item.id === tasteId);
      if (existing) return current.map((item) => (item.id === tasteId ? { ...item, amount: clampAmount(item.amount + 10) } : item));

      const currentTotal = current.reduce((sum, item) => sum + item.amount, 0);
      const defaultAmount = current.length ? Math.min(25, Math.max(10, 100 - currentTotal)) : 55;
      return [...current, { id: tasteId, amount: defaultAmount }];
    });
  };

  const updateTasteAmount = (tasteId: string, amount: number) => {
    setSelectedTastes((current) => current.map((item) => (item.id === tasteId ? { ...item, amount: clampAmount(amount) } : item)));
  };

  const removeTaste = (tasteId: string) => {
    setSelectedTastes((current) => current.filter((item) => item.id !== tasteId));
  };

  return (
    <section className="content-section mixer-builder" aria-label="Кальянный миксер">
      <header className="tobacco-page__header mixer-builder__header">
        <h1>Миксер</h1>
        <span>Собери вкус, настрой доли и посмотри, что получится по крепости и балансу.</span>
      </header>

      <section className="mixer-result-card" aria-label="Итог микса">
        <div className="mixer-result-card__orb" aria-hidden="true">
          {selectedItems.slice(0, 3).map((item) => <span key={item.id}>{item.taste.icon}</span>)}
          {!selectedItems.length ? <span>🧪</span> : null}
        </div>
        <div className="mixer-result-card__content">
          <p>Итоговый вкус</p>
          <h2>{flavorTitle}</h2>
          <span>{strengthLabel} · {totalAmount}% чаши · {selectedItems.length || 0} вкуса</span>
        </div>
        <div className="mixer-meter-grid">
          {METRIC_LABELS.map((metric) => (
            <div key={metric.key} className="mixer-meter">
              <div className="mixer-meter__top">
                <span>{metric.label}</span>
                <b>{metric.key === 'strength' ? strengthLabel : `${Math.round(metrics[metric.key] * 10) / 10}/5`}</b>
              </div>
              <div className="mixer-meter__track" style={{ '--mixer-score': getMetricPercent(metrics[metric.key]) } as CSSProperties} />
            </div>
          ))}
        </div>
      </section>

      <section className="mixer-card mixer-selected-card" aria-label="Вкусы в чаше">
        <div className="mixer-card__header">
          <div>
            <p>В чаше</p>
            <h2>Настрой пропорции</h2>
          </div>
          <button type="button" className="mixer-text-button" onClick={() => setSelectedTastes([])}>Очистить</button>
        </div>

        <div className="mixer-selected-list">
          {selectedItems.map((item) => {
            const normalizedShare = totalAmount ? Math.round((item.amount / totalAmount) * 100) : 0;
            return (
              <article key={item.id} className="mixer-selected-row">
                <div className="mixer-selected-row__top">
                  <span className="mixer-selected-row__icon">{item.taste.icon}</span>
                  <div>
                    <h3>{item.taste.name}</h3>
                    <p>{item.taste.description}</p>
                  </div>
                  <strong>{normalizedShare}%</strong>
                </div>
                <div className="mixer-slider" style={{ '--amount': item.amount } as CSSProperties}>
                  <input type="range" min="5" max="80" step="5" value={item.amount} onChange={(event) => updateTasteAmount(item.id, Number(event.target.value))} aria-label={`Доля вкуса ${item.taste.name}`} />
                  <span className="mixer-slider__thumb-icon" aria-hidden="true">{item.taste.icon}</span>
                </div>
                <button type="button" className="mixer-selected-row__remove" onClick={() => removeTaste(item.id)}>Убрать</button>
              </article>
            );
          })}
          {!selectedItems.length ? <p className="empty-state">Выбери первый вкус ниже. Лучше начинать с базы, а потом добавлять акцент и финиш.</p> : null}
        </div>
      </section>

      <section className="mixer-card" aria-label="Библиотека вкусов">
        <div className="mixer-card__header">
          <div>
            <p>Добавить вкус</p>
            <h2>Выбери ингредиенты</h2>
          </div>
        </div>
        <div className="mixer-family-rail" aria-label="Фильтр вкусов">
          {FAMILY_FILTERS.map((family) => (
            <button key={family} type="button" className={activeFamily === family ? 'mixer-family-chip is-active' : 'mixer-family-chip'} onClick={() => setActiveFamily(family)}>
              {formatFamilyLabel(family)}
            </button>
          ))}
        </div>
        <div className="mixer-taste-grid">
          {visibleTastes.map((taste) => {
            const isSelected = selectedIds.has(taste.id);
            return (
              <button key={taste.id} type="button" className={isSelected ? 'mixer-taste-button is-active' : 'mixer-taste-button'} onClick={() => addTaste(taste.id)}>
                <span>{taste.icon}</span>
                <strong>{taste.name}</strong>
                <small>{taste.family}</small>
              </button>
            );
          })}
        </div>
      </section>

      <section className="mixer-card" aria-label="Рекомендации миксера">
        <div className="mixer-card__header">
          <div>
            <p>Подсказки</p>
            <h2>Что добавить</h2>
          </div>
        </div>
        <div className="mixer-recommendation-list">
          {recommendations.map((recommendation) => (
            <article key={`${recommendation.title}-${recommendation.tasteId ?? recommendation.icon}`} className="mixer-recommendation">
              <span>{recommendation.icon}</span>
              <div>
                <h3>{recommendation.title}</h3>
                <p>{recommendation.description}</p>
              </div>
              {recommendation.tasteId ? <button type="button" onClick={() => addTaste(recommendation.tasteId!)}>+</button> : null}
            </article>
          ))}
        </div>
      </section>

      <section className="mixer-card" aria-label="Табаки для микса">
        <div className="mixer-card__header">
          <div>
            <p>Собрать из табаков</p>
            <h2>Все примеры</h2>
          </div>
        </div>
        <div className="mixer-tobacco-list">
          {tobaccoExamples.map((example) => {
            const matchLabel = example.matchingTastes.map((item) => `${item.taste.name} ${item.amount}%`).join(' · ');

            return (
              <article
                key={example.product.id}
                className="mixer-tobacco-example"
                role="button"
                tabIndex={0}
                onClick={() => onOpenProduct(example.product)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onOpenProduct(example.product);
                  }
                }}
              >
                <img src={example.product.image} alt={example.product.title} />
                <div>
                  <p>{example.product.brand} · {example.product.line}</p>
                  <h3>{example.product.title}</h3>
                  <small>Под вкус: {matchLabel}</small>
                </div>
                <span>{example.product.strength}</span>
              </article>
            );
          })}
          {!tobaccoExamples.length ? (
            <p className="empty-state">Пока нет точного табака под выбранные вкусы. Добавь цитрус, персик, холодок или десертный слой, чтобы появились совпадения из текущего каталога.</p>
          ) : null}
        </div>
      </section>

      <section className="mixer-card" aria-label="Готовые пресеты">
        <div className="mixer-card__header">
          <div>
            <p>Быстрый старт</p>
            <h2>Готовые формулы</h2>
          </div>
        </div>
        <div className="mixer-preset-rail">
          {MIXER_PRESETS.map((preset) => (
            <button key={preset.title} type="button" className="mixer-preset-card" onClick={() => setSelectedTastes(preset.tastes)}>
              <span>{preset.tastes.map((taste) => TASTE_BY_ID[taste.id]?.icon).filter(Boolean).join(' ')}</span>
              <strong>{preset.title}</strong>
              <small>{preset.subtitle}</small>
            </button>
          ))}
        </div>
      </section>

      <section className="mixer-card" aria-label="Похожие готовые миксы">
        <div className="mixer-card__header">
          <div>
            <p>Похоже по профилю</p>
            <h2>{showPopularOnly ? 'Топ миксы рядом' : 'Готовые миксы рядом'}</h2>
          </div>
        </div>
        <div className="mixer-suggested-list">
          {suggestedMixes.map((mix) => {
            const isFavorite = favoriteMixes.includes(mix.id);
            return (
              <article key={mix.id} className="mixer-suggested-mix" role="button" tabIndex={0} onClick={() => onOpenMix(mix)} onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onOpenMix(mix);
                }
              }}>
                <img src={mix.image} alt={mix.title} />
                <div>
                  <p>{getMixDirection(mix)} · {getMixStrength(mix)}</p>
                  <h3>{mix.title}</h3>
                  <StarRating rating={getMixRating(mix)} className="mixes-page__rating" />
                </div>
                <button type="button" className={isFavorite ? 'tobacco-list-item__heart is-active' : 'tobacco-list-item__heart'} onClick={(event) => {
                  event.stopPropagation();
                  onToggleFavoriteMix(mix.id);
                }} aria-label="Добавить микс в избранное">
                  ♥
                </button>
              </article>
            );
          })}
        </div>
      </section>
    </section>
  );
}
