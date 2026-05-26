export interface MSQStage {
  id: string;
  chapter: number;
  stage: number;
  title: string;
  description: string;
  type: 'dialogue' | 'combat' | 'exploration';
  objective: string;
  npcName: string;
  rewards: {
    exp: number;
    gold: number;
    item?: string;
  };
  dialogueLines: { speaker: string; text: string }[];
}

export const MAIN_SCENARIO_QUESTS: MSQStage[] = [
  {
    id: 'msq-1-1',
    chapter: 1,
    stage: 1,
    title: 'Зов Этернии',
    description: 'Мир разрознен. Слышны слухи о том, что Великие кристаллы резонируют со странной энергией. Старейшина Илорин из Фрипорта хочет видеть вас.',
    type: 'dialogue',
    objective: 'Поговорите со Старейшиной Илорином в Фрипорте.',
    npcName: 'Старейшина Илорин',
    rewards: { exp: 50, gold: 10 },
    dialogueLines: [
      { speaker: 'Старейшина Илорин', text: 'Ах, ты наконец-то прибыл. Этерния в опасности... Кристаллы баланса теряют свою силу.' },
      { speaker: 'Вы', text: 'Что я могу сделать?' },
      { speaker: 'Старейшина Илорин', text: 'Отправляйся в Восточные Степи. Найди там перерожденных гоблинов. Они похитили первый осколок. Верни его.' },
    ]
  },
  {
    id: 'msq-1-2',
    chapter: 1,
    stage: 2,
    title: 'Украденный Осколок',
    description: 'Старейшина поручил вам вернуть магический осколок, украденный гоблинами-шаманами в Восточных Степях.',
    type: 'combat',
    objective: 'Уничтожьте Гоблинов-Шаманов в Восточных Степях (2 шт).',
    npcName: 'Старейшина Илорин',
    rewards: { exp: 120, gold: 25, item: 'minor-heal-potion' },
    dialogueLines: [
      { speaker: 'Старейшина Илорин', text: 'Твоя отвага вдохновляет! Ты нашел осколок?' },
      { speaker: 'Вы', text: 'Да, он светится странным светом.' },
      { speaker: 'Старейшина Илорин', text: 'Хорошо. Теперь нам нужно выяснить, кто стоит за всем этим.' },
    ]
  },
  {
    id: 'msq-1-3',
    chapter: 1,
    stage: 3,
    title: 'Скрытая Угроза',
    description: 'Осколок нужно отнести Верховному Магу в Башню Знаний для исследования.',
    type: 'dialogue',
    objective: 'Отнесите осколок Верховному Магу.',
    npcName: 'Верховный Маг Альдо',
    rewards: { exp: 200, gold: 50 },
    dialogueLines: [
      { speaker: 'Верховный Маг Альдо', text: 'Hmm... Этот кристалл. Темная энергия. Это дело рук Культа Тени.' },
      { speaker: 'Вы', text: 'Культ Тени? Я думал, они были уничтожены в Первой Эпохе.' },
      { speaker: 'Верховный Маг Альдо', text: 'Видимо, они восстали. Мы должны предупредить другие нации.' },
    ]
  },
  {
    id: 'msq-2-1',
    chapter: 2,
    stage: 1,
    title: 'Вестник Беды',
    description: 'Отправляйтесь в Пустыню Калим`Дур и найдите посланника эльфов.',
    type: 'exploration',
    objective: 'Найдите посланника в Пустыне.',
    npcName: 'Посланник Элларион',
    rewards: { exp: 350, gold: 100 },
    dialogueLines: [
      { speaker: 'Посланник Элларион', text: 'Сюда! Быстрее! Они близко!' },
      { speaker: 'Вы', text: 'Успокойся. Альдо послал меня. Что происходит?' },
      { speaker: 'Посланник Элларион', text: 'Пустынные Скарабеи обезумели! Ими кто-то управляет!' },
    ]
  }
];
