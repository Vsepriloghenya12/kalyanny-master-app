import type { Mix } from './types';

const MIX_STRENGTH_BY_ID: Record<string, string> = {
  'mix-pinkman-frost': 'Средняя',
  'mix-black-cola-ice': 'Средняя+',
  'mix-peach-yogurt-berry': 'Средняя',
  'mix-grapefruit-mint': 'Средняя',
  'mix-bananarama-cream': 'Легкая',
  'mix-melon-frost': 'Легкая',
  'mix-supernova-citrus': 'Крепкая',
  'mix-tropic-cola': 'Средняя',
  'mix-cookie-yogurt': 'Легкая',
  'mix-kiwi-lemonade': 'Средняя'
};

const MIX_RATING_BY_ID: Record<string, number> = {
  'mix-pinkman-frost': 4.8,
  'mix-black-cola-ice': 4.7,
  'mix-peach-yogurt-berry': 4.7,
  'mix-grapefruit-mint': 4.6,
  'mix-bananarama-cream': 4.4,
  'mix-melon-frost': 4.5,
  'mix-supernova-citrus': 4.6,
  'mix-tropic-cola': 4.5,
  'mix-cookie-yogurt': 4.3,
  'mix-kiwi-lemonade': 4.4
};

const DIRECTION_BY_NOTE: Record<string, string> = {
  ягоды: 'Ягодный',
  десерт: 'Десертный',
  цитрус: 'Цитрус',
  тропики: 'Тропический',
  пряности: 'Пряный',
  холодок: 'Свежий',
  сладкий: 'Сладкий'
};

const TASTE_DESCRIPTIONS: Record<string, string> = {
  сладкий: 'Мягкий сладкий профиль, который округляет микс и делает чашу более плотной без резкой приторности.',
  цитрус: 'Яркий кислосладкий вкус с сочным стартом и чистым свежим финишем.',
  тропики: 'Солнечное фруктовое направление с манго, ананасом и легкой зеленой свежестью.',
  ягоды: 'Плотный ягодный профиль: темные ягоды, мягкая сладость и выразительное ароматное послевкусие.',
  холодок: 'Освежающий акцент, который не спорит с основным вкусом, а добавляет прохладный финиш.',
  пряности: 'Теплый пряный слой для глубины: хорошо раскрывается рядом с цитрусом и плотными фруктами.',
  десерт: 'Кремовое сладкое направление с мягкой базой, ванилью и ощущением десертной плотности.'
};

const STRENGTH_WEIGHT: Record<string, number> = {
  Легкая: 1,
  Средняя: 2,
  'Средняя+': 3,
  Крепкая: 4
};

export function getMixStrength(mix: Mix) {
  return MIX_STRENGTH_BY_ID[mix.id] ?? 'Средняя';
}

export function getMixDirection(mix: Mix) {
  const note = mix.notes.find((item) => DIRECTION_BY_NOTE[item]);
  return note ? DIRECTION_BY_NOTE[note] : 'Авторский';
}

export function getMixRating(mix: Mix) {
  return MIX_RATING_BY_ID[mix.id] ?? (mix.isPopular ? 4.6 : 4.3);
}

export function getTasteDescription(note: string) {
  return TASTE_DESCRIPTIONS[note] ?? 'Авторское вкусовое направление с балансом сладости, аромата и плотности.';
}

export function getTasteStrength(mixes: Mix[]) {
  if (!mixes.length) return 'Средняя';

  return mixes.reduce((strongest, mix) => {
    const currentStrength = getMixStrength(mix);
    return (STRENGTH_WEIGHT[currentStrength] ?? 0) > (STRENGTH_WEIGHT[strongest] ?? 0) ? currentStrength : strongest;
  }, getMixStrength(mixes[0]));
}
