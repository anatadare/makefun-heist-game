// Level data for Star Sapphire Heist: three museum rooms of rising difficulty.
// Coordinates are canvas pixels. The HUD occupies y 0..64, the room is y 64..800.
// walls block movement and sight, cover blocks movement and sight, shadows hide the thief.

export const ROOM = { x: 0, y: 64, w: 1280, h: 736 };

function borderWalls() {
  return [
    { x: 0, y: 64, w: 1280, h: 16 }, // top
    { x: 0, y: 784, w: 1280, h: 16 }, // bottom
    { x: 0, y: 64, w: 16, h: 736 }, // left
    { x: 1264, y: 64, w: 16, h: 736 }, // right
  ];
}

export const LEVELS = [
  {
    name: 'The Marble Gallery',
    subtitle: 'Night shift, one sleepy guard rotation. Grab the Star Sapphire and slip out.',
    playerStart: { x: 90, y: 720 },
    exit: { x: 1170, y: 752, w: 94, h: 32, label: 'EXIT' },
    sapphire: { x: 640, y: 128 },
    loot: [
      { x: 220, y: 330, kind: 'gold', value: 150 },
      { x: 1080, y: 300, kind: 'painting', value: 200 },
    ],
    guards: [
      { waypoints: [[300, 210], [980, 210], [980, 430], [300, 430]], speed: 68 },
      { waypoints: [[200, 660], [1080, 660]], speed: 82 },
    ],
    cameras: [
      { x: 640, y: 86, baseAngle: Math.PI / 2, sweep: 0.85, range: 300, speed: 0.55 },
    ],
    walls: [
      ...borderWalls(),
      { x: 320, y: 300, w: 280, h: 16 },
      { x: 700, y: 300, w: 260, h: 16 },
      { x: 900, y: 420, w: 16, h: 220 },
    ],
    cover: [
      { x: 400, y: 170, w: 120, h: 56, kind: 'case' },
      { x: 760, y: 170, w: 120, h: 56, kind: 'case' },
      { x: 200, y: 480, w: 120, h: 56, kind: 'case' },
      { x: 1000, y: 480, w: 120, h: 56, kind: 'case' },
      { x: 600, y: 520, w: 46, h: 46, kind: 'statue' },
      { x: 150, y: 580, w: 40, h: 40, kind: 'plant' },
      { x: 1100, y: 130, w: 40, h: 40, kind: 'plant' },
    ],
    shadows: [
      { x: 120, y: 120, w: 190, h: 120 },
      { x: 950, y: 590, w: 220, h: 130 },
      { x: 560, y: 600, w: 160, h: 110 },
    ],
    coins: 3,
    smokes: 2,
    parTime: 75,
  },
  {
    name: 'The Vault Corridor',
    subtitle: 'Two cameras, three guards, and a dark service lane along the west wall.',
    playerStart: { x: 90, y: 720 },
    exit: { x: 1170, y: 752, w: 94, h: 32, label: 'EXIT' },
    sapphire: { x: 640, y: 128 },
    loot: [
      { x: 170, y: 250, kind: 'gold', value: 150 },
      { x: 1120, y: 240, kind: 'painting', value: 200 },
      { x: 640, y: 560, kind: 'gem', value: 250 },
    ],
    guards: [
      { waypoints: [[240, 180], [1040, 180], [1040, 360], [240, 360]], speed: 78 },
      { waypoints: [[1040, 640], [240, 640]], speed: 92 },
      { waypoints: [[640, 420], [640, 700], [300, 700], [300, 420]], speed: 72 },
    ],
    cameras: [
      { x: 400, y: 86, baseAngle: Math.PI / 2, sweep: 0.8, range: 300, speed: 0.7 },
      { x: 880, y: 86, baseAngle: Math.PI / 2, sweep: 0.8, range: 300, speed: 0.7 },
    ],
    walls: [
      ...borderWalls(),
      { x: 240, y: 300, w: 200, h: 16 },
      { x: 840, y: 300, w: 200, h: 16 },
      { x: 480, y: 480, w: 320, h: 16 },
      { x: 1020, y: 480, w: 16, h: 180 },
    ],
    cover: [
      { x: 300, y: 170, w: 120, h: 56, kind: 'case' },
      { x: 860, y: 170, w: 120, h: 56, kind: 'case' },
      { x: 180, y: 420, w: 120, h: 56, kind: 'case' },
      { x: 980, y: 420, w: 120, h: 56, kind: 'case' },
      { x: 560, y: 600, w: 160, h: 56, kind: 'desk' },
      { x: 640, y: 380, w: 46, h: 46, kind: 'statue' },
      { x: 150, y: 130, w: 40, h: 40, kind: 'plant' },
      { x: 1150, y: 620, w: 40, h: 40, kind: 'plant' },
    ],
    shadows: [
      { x: 24, y: 120, w: 90, h: 560 },
      { x: 900, y: 590, w: 240, h: 130 },
      { x: 520, y: 120, w: 240, h: 90 },
    ],
    coins: 3,
    smokes: 2,
    parTime: 90,
  },
  {
    name: 'The Sapphire Vault',
    subtitle: 'The real vault. Four guards, three cameras, one very bright sapphire.',
    playerStart: { x: 90, y: 720 },
    exit: { x: 1170, y: 752, w: 94, h: 32, label: 'EXIT' },
    sapphire: { x: 640, y: 400 },
    loot: [
      { x: 170, y: 180, kind: 'gold', value: 150 },
      { x: 1120, y: 180, kind: 'painting', value: 200 },
      { x: 170, y: 640, kind: 'gem', value: 250 },
      { x: 1120, y: 640, kind: 'gold', value: 150 },
    ],
    guards: [
      { waypoints: [[240, 170], [1040, 170], [1040, 300], [240, 300]], speed: 88 },
      { waypoints: [[1040, 660], [240, 660]], speed: 100 },
      { waypoints: [[300, 420], [640, 420], [640, 560], [300, 560]], speed: 82 },
      { waypoints: [[980, 560], [980, 420], [640, 420]], speed: 82 },
    ],
    cameras: [
      { x: 320, y: 86, baseAngle: Math.PI / 2, sweep: 0.7, range: 310, speed: 0.8 },
      { x: 640, y: 86, baseAngle: Math.PI / 2, sweep: 0.7, range: 310, speed: 0.8 },
      { x: 960, y: 86, baseAngle: Math.PI / 2, sweep: 0.7, range: 310, speed: 0.8 },
    ],
    walls: [
      ...borderWalls(),
      { x: 200, y: 260, w: 220, h: 16 },
      { x: 860, y: 260, w: 220, h: 16 },
      { x: 420, y: 300, w: 16, h: 160 },
      { x: 844, y: 300, w: 16, h: 160 },
      { x: 520, y: 520, w: 240, h: 16 },
    ],
    cover: [
      { x: 280, y: 170, w: 120, h: 56, kind: 'case' },
      { x: 880, y: 170, w: 120, h: 56, kind: 'case' },
      { x: 280, y: 600, w: 120, h: 56, kind: 'case' },
      { x: 880, y: 600, w: 120, h: 56, kind: 'case' },
      { x: 560, y: 330, w: 160, h: 56, kind: 'desk' },
      { x: 640, y: 470, w: 46, h: 46, kind: 'statue' },
      { x: 150, y: 420, w: 40, h: 40, kind: 'plant' },
      { x: 1150, y: 420, w: 40, h: 40, kind: 'plant' },
    ],
    shadows: [
      { x: 24, y: 120, w: 90, h: 300 },
      { x: 1166, y: 120, w: 90, h: 300 },
      { x: 480, y: 600, w: 320, h: 120 },
      { x: 560, y: 120, w: 160, h: 90 },
    ],
    coins: 4,
    smokes: 3,
    parTime: 105,
  },
];
