// packages/server/src/utils/username-generator.ts

const ADJECTIVES = [
  'swift', 'jade', 'calm', 'pale', 'cool', 'dusk', 'iron', 'mild',
  'keen', 'bold', 'teal', 'slate', 'ash', 'dim', 'soft', 'gold',
  'grey', 'blue', 'dark', 'warm', 'prim', 'wry', 'sage', 'grim',
];

const ANIMALS = [
  'falcon', 'otter', 'lynx', 'crane', 'fox', 'elk', 'wolf', 'hawk',
  'seal', 'mink', 'hare', 'deer', 'owl', 'bear', 'crow',
];

export const PRESENCE_COLORS = ['#3D8F82', '#4A9E6E', '#5A8FC0', '#8C7BC4'];

export function generateUsername(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
  return `${adj}-${animal}`;
}

export function assignColor(currentRoomSize: number): string {
  return PRESENCE_COLORS[currentRoomSize % PRESENCE_COLORS.length];
}
