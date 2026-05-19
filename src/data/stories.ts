import type { Story, Category, EducationContent } from '@/types';

export const categories: Category[] = [
  { id: 'all', name: '全部', icon: 'apps' },
  { id: 'grimm', name: '格林童话', icon: 'forest' },
  { id: 'andersen', name: '安徒生童话', icon: 'waves' },
  { id: 'chinese', name: '中国传统童话', icon: 'temple' },
];

export const stories: Story[] = [
  {
    id: 'little-red-riding-hood',
    title: '小红帽',
    cover: '/images/story-little-red-riding-hood.jpg',
    category: 'grimm',
    categoryName: '格林童话',
    ageRange: '3-5岁',
    minAge: 3,
    maxAge: 5,
    description: '小红帽带着礼物去看望外婆，在森林里遇到了大灰狼...',
    characters: [
      { id: 'red-hood', name: '小红帽', avatar: '👧', type: 'protagonist' },
      { id: 'wolf', name: '大灰狼', avatar: '🐺', type: 'supporting' },
      { id: 'grandma', name: '外婆', avatar: '👵', type: 'npc' },
      { id: 'hunter', name: '猎人', avatar: '🏹', type: 'npc' },
    ],
    chapters: [
      {
        id: 'ch1',
        title: '出发去外婆家',
        content: '从前，有一个可爱的小女孩，她总是戴着外婆送给她的一顶红色天鹅绒帽子，所以大家都叫她"小红帽"。一天，妈妈让她带着蛋糕去看望生病的外婆。',
        illustration: '/images/story-little-red-riding-hood.jpg',
        choices: [
          { id: 'c1', text: '帮助小红帽', icon: 'help' },
          { id: 'c2', text: '和大灰狼聊天', icon: 'chat' },
          { id: 'c3', text: '找猎人帮忙', icon: 'search' },
        ],
      },
      {
        id: 'ch2',
        title: '森林里的相遇',
        content: '小红帽走在森林的小路上，路边开满了美丽的野花。突然，一只大灰狼从树后跳了出来...',
        illustration: '/images/story-little-red-riding-hood.jpg',
        choices: [
          { id: 'c4', text: '继续采花', icon: 'local_florist' },
          { id: 'c5', text: '快点赶路', icon: 'directions_run' },
        ],
      },
    ],
  },
  {
    id: 'snow-white',
    title: '白雪公主',
    cover: '/images/story-snow-white.jpg',
    category: 'grimm',
    categoryName: '格林童话',
    ageRange: '4-6岁',
    minAge: 4,
    maxAge: 6,
    description: '美丽的白雪公主因为继母的嫉妒而逃亡，在森林里遇到了七个小矮人...',
    characters: [
      { id: 'snow-white', name: '白雪公主', avatar: '👸', type: 'protagonist' },
      { id: 'dwarfs', name: '小矮人们', avatar: '⛏️', type: 'supporting' },
      { id: 'queen', name: '皇后', avatar: '👑', type: 'npc' },
      { id: 'prince', name: '王子', avatar: '🤴', type: 'npc' },
    ],
    chapters: [
      {
        id: 'ch1',
        title: '逃亡森林',
        content: '白雪公主因为继母的嫉妒被迫逃进森林。她在森林里走了很久，终于发现了一座小房子。',
        illustration: '/images/story-snow-white.jpg',
        choices: [
          { id: 'c1', text: '敲门进去', icon: 'door_front' },
          { id: 'c2', text: '在门外等', icon: 'access_time' },
        ],
      },
    ],
  },
  {
    id: 'three-little-pigs',
    title: '三只小猪',
    cover: '/images/story-three-little-pigs.jpg',
    category: 'grimm',
    categoryName: '格林童话',
    ageRange: '3-5岁',
    minAge: 3,
    maxAge: 5,
    description: '三只小猪离开家独立生活，各自建造房子，却遇到了大灰狼...',
    characters: [
      { id: 'pig1', name: '猪大哥', avatar: '🐷', type: 'protagonist' },
      { id: 'pig2', name: '猪二哥', avatar: '🐽', type: 'protagonist' },
      { id: 'pig3', name: '猪小弟', avatar: '🐖', type: 'protagonist' },
      { id: 'wolf', name: '大灰狼', avatar: '🐺', type: 'supporting' },
    ],
    chapters: [
      {
        id: 'ch1',
        title: '建造房子',
        content: '三只小猪长大了，猪妈妈让它们出去建造自己的房子。猪大哥偷懒用稻草 quickly 建了房子...',
        illustration: '/images/story-three-little-pigs.jpg',
        choices: [
          { id: 'c1', text: '建稻草房', icon: 'grass' },
          { id: 'c2', text: '建木头房', icon: 'forest' },
          { id: 'c3', text: '建石头房', icon: 'foundation' },
        ],
      },
    ],
  },
  {
    id: 'ugly-duckling',
    title: '丑小鸭',
    cover: '/images/story-ugly-duckling.jpg',
    category: 'andersen',
    categoryName: '安徒生童话',
    ageRange: '5-7岁',
    minAge: 5,
    maxAge: 7,
    description: '一只与众不同的小鸭子，经历了许多磨难，最终变成了美丽的天鹅...',
    characters: [
      { id: 'duckling', name: '丑小鸭', avatar: '🦆', type: 'protagonist' },
      { id: 'swan', name: '天鹅', avatar: '🦢', type: 'supporting' },
      { id: 'ducks', name: '其他鸭子', avatar: '🐥', type: 'npc' },
    ],
    chapters: [
      {
        id: 'ch1',
        title: '孵化出来',
        content: '鸭妈妈孵出了一群小鸭子，但是有一只看起来和其他小鸭子不太一样，它又大又灰...',
        illustration: '/images/story-ugly-duckling.jpg',
        choices: [
          { id: 'c1', text: '安慰它', icon: 'favorite' },
          { id: 'c2', text: '带它游泳', icon: 'water' },
        ],
      },
    ],
  },
  {
    id: 'magic-brush',
    title: '神笔马良',
    cover: '/images/story-magic-brush.jpg',
    category: 'chinese',
    categoryName: '中国传统童话',
    ageRange: '6-8岁',
    minAge: 6,
    maxAge: 8,
    description: '穷苦少年马良得到一支神笔，画什么就会变成真的，他用这支笔帮助穷人...',
    characters: [
      { id: 'maliang', name: '马良', avatar: '🎨', type: 'protagonist' },
      { id: 'god', name: '神仙爷爷', avatar: '👴', type: 'supporting' },
      { id: 'officer', name: '贪官', avatar: '💰', type: 'npc' },
    ],
    chapters: [
      {
        id: 'ch1',
        title: '得到神笔',
        content: '马良是个热爱画画的穷孩子，他没有钱买画笔，就用树枝在地上画。一天晚上，一位白胡子老爷爷送给他一支金光闪闪的毛笔...',
        illustration: '/images/story-magic-brush.jpg',
        choices: [
          { id: 'c1', text: '画一只鸟', icon: 'flutter_dash' },
          { id: 'c2', text: '画一条鱼', icon: 'set_meal' },
        ],
      },
    ],
  },
  {
    id: 'nezha',
    title: '哪吒闹海',
    cover: '/images/story-nezha.jpg',
    category: 'chinese',
    categoryName: '中国传统童话',
    ageRange: '5-7岁',
    minAge: 5,
    maxAge: 7,
    description: '小哪吒为了保护百姓，与东海龙王展开了一场惊天动地的大战...',
    characters: [
      { id: 'nezha', name: '哪吒', avatar: '👶', type: 'protagonist' },
      { id: 'dragon-king', name: '龙王', avatar: '🐲', type: 'supporting' },
      { id: 'taiyi', name: '太乙真人', avatar: '☯️', type: 'npc' },
    ],
    chapters: [
      {
        id: 'ch1',
        title: '出生异象',
        content: '陈塘关总兵李靖的夫人怀孕三年六个月，生下了一个肉球。李靖以为是个妖怪，拔剑就砍...',
        illustration: '/images/story-nezha.jpg',
        choices: [
          { id: 'c1', text: '保护哪吒', icon: 'shield' },
          { id: 'c2', text: '找太乙真人', icon: 'person_search' },
        ],
      },
    ],
  },
];

export const educationContents: EducationContent[] = [
  {
    type: 'character',
    title: '识字小课堂',
    items: [
      { id: 'c1', content: '森', image: '🌲' },
      { id: 'c2', content: '林', image: '🌳' },
      { id: 'c3', content: '爱', image: '❤️' },
      { id: 'c4', content: '助', image: '🤝' },
      { id: 'c5', content: '勇', image: '🦁' },
    ],
  },
  {
    type: 'emotion',
    title: '情商小提问',
    items: [
      { id: 'e1', content: '为什么要听爸爸妈妈的话？' },
      { id: 'e2', content: '为什么要帮助别人？' },
      { id: 'e3', content: '遇到危险应该怎么办？' },
      { id: 'e4', content: '为什么要努力工作？' },
    ],
  },
];

export const aiModels = [
  { id: 'claude', name: 'Claude 3', description: '安全可靠的AI助手' },
  { id: 'llama', name: 'LLaMA 3', description: '本地运行的开源模型' },
  { id: 'qwen', name: '通义千问', description: '中文理解能力强' },
];
