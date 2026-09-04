export const PHOTO_SRC = "/quest-photo.jpg";

export type ZoneId =
  | "sunlit_shores"
  | "wedding_garden"
  | "the_haven"
  | "starry_ascent"
  | "cathedral";

export type Relic = {
  id: string;
  name: string;
  zone: ZoneId;
  card: string;
  note: string;
};

export const RELICS: Relic[] = [
  {
    id: "lantern",
    name: "The Lantern of Quiet Care",
    zone: "sunlit_shores",
    card: "I see every small thing you do, even when you think no one notices. Your gentleness changes everything around me.",
    note: "Relic I",
  },
  {
    id: "anchor",
    name: "The Anchor of Comfort",
    zone: "wedding_garden",
    card: "When the world gets loud and heavy, you are my safe place to land. You anchor my heart.",
    note: "Relic II",
  },
  {
    id: "bloom",
    name: "The Bloom of Reflection",
    zone: "wedding_garden",
    card: "Your heart is so thoughtful. Every conversation with you leaves my soul lighter than before.",
    note: "Relic III",
  },
  {
    id: "shield",
    name: "The Shield of Unshakable Faith",
    zone: "the_haven",
    card: "Your trust and faith lift me up every single day. Standing beside you makes me a better man.",
    note: "Relic IV — emits a protective pulse when your health drops to one heart.",
  },
  {
    id: "seal",
    name: "The Seal of Perfect Peace",
    zone: "starry_ascent",
    card: "You are my absolute peace, Maria. In a restless world, you are my quiet sanctuary.",
    note: "Relic V",
  },
];

export const RELIC_IDS = RELICS.map((r) => r.id);

export type Envelope = {
  id: string;
  title: string;
  zone: ZoneId;
  letter: string;
};

export const ENVELOPES: Envelope[] = [
  {
    id: "waterfall",
    title: "Waterfall Envelope #1",
    zone: "sunlit_shores",
    letter:
      "Maria — I hid this one behind the water on purpose. The loudest place on the map, and still the quietest place I know, because you're the one who found it. Thank you for walking toward me even when the noise was rushing. I would cross that water a thousand times for you. — Andrew",
  },
  {
    id: "hedge",
    title: "Hedge Envelope #2",
    zone: "wedding_garden",
    letter:
      "You broke through the wall. That's exactly what you did for my heart — you kept showing up gently until the hedges opened. I love the way you never force anything; you just bloom, and everything around you rearranges itself to make room. — Andrew",
  },
  {
    id: "patio",
    title: "Coffee Patio Envelope #3",
    zone: "the_haven",
    letter:
      "Every coffee, every long talk, every ordinary afternoon with you has been my favorite part of being alive. If forever looks like this table and your laugh across from me, then I am the richest man in any realm. — Andrew",
  },
  {
    id: "summit",
    title: "Starlight Envelope #4",
    zone: "starry_ascent",
    letter:
      "You climbed. Of course you climbed. You have always been the kind of person who keeps going with a soft heart, and that is the rarest strength there is. Look at the stars for a second — that's what loving you feels like. — Andrew",
  },
  {
    id: "cathedral",
    title: "Cathedral Envelope #5",
    zone: "cathedral",
    letter:
      "Last one. There is nothing left to hide, only a door to walk through together. I choose you today and every day after, in the loud seasons and the quiet ones. Come find me by the stained glass. — Andrew",
  },
];

export const ENVELOPE_IDS = ENVELOPES.map((e) => e.id);

export const MEMORY_STONE_TEXT =
  "Memory Stone I — The Fountain: This is the exact place I asked you forever. The water kept moving and the whole square kept living, and you were completely still and completely certain. I will never forget the way you looked at me. — Andrew";

export const VAULT_JOURNAL: { title: string; body: string }[] = [
  {
    title: "For the way you listen",
    body: "You listen with your whole body — you put things down, you turn toward me, and suddenly whatever I was carrying weighs less. That is a gift you give without noticing.",
  },
  {
    title: "For your gentleness",
    body: "Gentleness is not weakness. Yours has softened rooms, arguments, hard days, and me. It is the strongest thing in my life.",
  },
  {
    title: "For your faith",
    body: "You pray for us when I am too tired to find words. You keep our little family pointed toward God, and that is why I am not afraid of the future.",
  },
  {
    title: "For your joy",
    body: "The way you light up over small good things — a song, a dessert, a plan on paper — makes ordinary life feel like a celebration.",
  },
  {
    title: "For choosing me",
    body: "Out of everyone, every day, you keep choosing me. I will spend forever trying to deserve that, and enjoying every second of the trying.",
  },
];

export type DialogueChoice = { id: string; player: string; andrew: string };

export const CEREMONY_OPENING =
  "Maria... before we walk through those doors, I just wanted to pause and look at you. You've brought so much light and stillness into my life. How are you feeling right now?";

export const CEREMONY_CHOICES: DialogueChoice[] = [
  {
    id: "a",
    player: "I'm so happy... I can't believe we made it to this moment.",
    andrew:
      "Every step to get here was worth it. Standing next to you is the easiest decision I've ever made.",
  },
  {
    id: "b",
    player: "My heart is beating so fast, but being here with you gives me total peace.",
    andrew:
      "That’s the beauty of us—you've always been my peace, and I'll always be your safe place.",
  },
  {
    id: "c",
    player: "I'm ready. Let's walk through those doors together!",
    andrew: "Hand in hand, always. Let's go start forever.",
  },
];

export const FINAL_PROPOSAL =
  "Maria, you gathered these relics, but the truth is... you brought all this peace into my life from the start. I see every effort, I cherish every quiet moment, and I see the incredible woman you are. You brought me absolute peace—now let me spend forever making sure you always feel that same peace with me.";

export const ANDREW_AFFIRMATIONS = [
  "Take a breath, my love. You're doing beautifully.",
  "You don't have to rush. I'm not going anywhere.",
  "Every step you take makes this world kinder.",
  "You are my favorite person in every realm.",
  "Rest here a moment. I'll keep watch.",
];

export const REST_STONE_LINES = [
  "The stone hums warmly. Peace returns to your heart.",
  "You breathe. The noise fades. Hearts and stamina restored.",
  "A soft chime — the roses in your arms glow brighter.",
];

export type ZoneInfo = {
  id: ZoneId;
  act: string;
  title: string;
  objective: string;
};

export const ZONES: Record<ZoneId, ZoneInfo> = {
  sunlit_shores: {
    id: "sunlit_shores",
    act: "Act I",
    title: "The Sunlit Shores & Sunken Grotto",
    objective: "Push three stones onto the pressure plates to divert the river, then claim the Lantern.",
  },
  wedding_garden: {
    id: "wedding_garden",
    act: "Act II",
    title: "The Labyrinth of the Wedding Garden",
    objective: "Collect the four seasonal keys, open the Conservatory, and calm the Stress Spectre.",
  },
  the_haven: {
    id: "the_haven",
    act: "Act III",
    title: "The Haven — Town Square & Sanctuary",
    objective: "Gather three lost music sheets and bring the melody back to Andrew.",
  },
  starry_ascent: {
    id: "starry_ascent",
    act: "Act IV",
    title: "The Realm of Rest & The Starry Ascent",
    objective: "Align the three crystal pillars, then reach the Altar of Joy at the summit.",
  },
  cathedral: {
    id: "cathedral",
    act: "Act V",
    title: "The Cathedral Courtyard",
    objective: "Find Andrew by the stained-glass window.",
  },
};

export const ZONE_ORDER: ZoneId[] = [
  "sunlit_shores",
  "wedding_garden",
  "the_haven",
  "starry_ascent",
  "cathedral",
];

export const STORY_PREMISE =
  "Step into Maria's journey as the Bringer of Peace. Walk a world in full bloom, trailing golden light and rose petals wherever you go, calm every worry you meet, collect 5 sacred Relics of Devotion, and uncover hidden love notes along your path to the Grand Cathedral.";

export const HOW_TO_PLAY = [
  {
    title: "Move",
    body: "Use the virtual touch joystick, WASD, or arrow keys to walk through the realm. Maria's pace is gentle and deliberate — take your time.",
  },
  {
    title: "Attack",
    body: "Tap ATTACK (or SPACE / J) to swing your weapon. Anything you strike is transformed into butterflies, never harmed. Stronger weapons swing wider.",
  },
  {
    title: "Dash",
    body: "Tap DASH (or SHIFT / K) for a quick burst of movement. Use it to cross gaps or escape a crowd. It recharges after a few seconds.",
  },
  {
    title: "Interact",
    body: "Walk near glowing people, stones, doors, or letters and tap TALK (or E / ENTER) to read, rest, collect relics, and open new paths.",
  },
];

export const REALM_LANDMARKS: { direction: string; name: string; act: string; zone: ZoneId }[] = [
  { direction: "West", name: "The River Gates & Sunken Grotto", act: "Act I", zone: "sunlit_shores" },
  { direction: "North", name: "The Labyrinth of the Wedding Garden", act: "Act II", zone: "wedding_garden" },
  { direction: "Center", name: "The Haven Town Square & Fountain", act: "Act III", zone: "the_haven" },
  { direction: "East", name: "The Starry Ascent Mountain", act: "Act IV", zone: "starry_ascent" },
  { direction: "Summit", name: "The Grand Cathedral of Serenity", act: "Act V", zone: "cathedral" },
];

/** Controls reference shown by the HUD "Controls" button. */
export const CONTROLS_HELP: { title: string; body: string }[] = [
  {
    title: "Move",
    body: "Drag the joystick in the bottom-left, or use WASD / the arrow keys on a keyboard.",
  },
  {
    title: "Interact",
    body: "Walk close to a person, stone or letter until the gold bubble appears above Maria, then tap TALK (or press E).",
  },
  {
    title: "Attack",
    body: "Tap ATTACK (or press Space) to swing your equipped weapon. Anything you strike turns to butterflies — nothing is ever harmed.",
  },
  {
    title: "Dash",
    body: "Tap DASH (or press Shift) for a quick burst of speed. The gold bar under your hearts shows when it is ready again.",
  },
  {
    title: "Objective Arrow",
    body: "The glowing gold arrow circling Maria points toward the current act's goal. It fades once you are close.",
  },
];

// =========================================================================
// WEAPONS, BLACKSMITH, ACT GUIDES & BOSSES
// =========================================================================

export type Weapon = {
  id: string;
  name: string;
  icon: string;
  damage: number;
  reach: number;
  color: number;
  blurb: string;
};

export const WEAPONS: Weapon[] = [
  {
    id: "spark-wand",
    name: "Radiant Spark Wand",
    icon: "✨",
    damage: 2,
    reach: 72,
    color: 0xffd977,
    blurb: "Carved from grotto driftwood. Its light scatters worry before it can settle.",
  },
  {
    id: "floral-bow",
    name: "Floral Bow",
    icon: "🏹",
    damage: 3,
    reach: 90,
    color: 0xff9ec4,
    blurb: "Strung with garden vine. Every arrow blooms where it lands.",
  },
  {
    id: "lightblade",
    name: "Lightblade",
    icon: "⚔️",
    damage: 4,
    reach: 78,
    color: 0xbfe3ff,
    blurb: "Forged in Haven's clocktower. It cuts through noise, never through people.",
  },
  {
    id: "starlight-censer",
    name: "Celestial Stave",
    icon: "🌟",
    damage: 5,
    reach: 96,
    color: 0xa9b6ff,
    blurb: "Swings a slow arc of constellations that calms whatever it touches.",
  },
  {
    id: "ring-of-dawn",
    name: "Vow Shield / Peace Blade",
    icon: "🛡️",
    damage: 6,
    reach: 104,
    color: 0xffe6a8,
    blurb: "A shield that guards the promise and a blade that never needs to be drawn in anger.",
  },
];

export const WEAPON_BY_ID: Record<string, Weapon> = Object.fromEntries(
  WEAPONS.map((w) => [w.id, w]),
);

/** Act I's guide hands this over — there is no forge and no practice blade. */
export const DEFAULT_WEAPON = "spark-wand";

export const ACT_GUIDES: Record<ZoneId, { name: string; weapon: string; line: string }> = {
  sunlit_shores: {
    name: "Wren of the Shores",
    weapon: "spark-wand",
    line: "Welcome, Bringer of Peace. Follow the road east to the River Gate Temple — the Warden of Rushing Water guards the Lantern there. Take my Radiant Spark Wand; its light is louder than any worry.",
  },
  wedding_garden: {
    name: "Ivy the Gardener",
    weapon: "floral-bow",
    line: "The hedges shift, but the promenade always leads to the Conservatory. The Stress Spectre waits inside. Take my Floral Bow — draw it and every arrow blooms.",
  },
  the_haven: {
    name: "Marlowe the Bellkeeper",
    weapon: "lightblade",
    line: "Haven is loud today. The Clamour of Doubt paces the town hall steps and Andrew waits by the fountain. Take the Lightblade — it cuts through noise, never through hearts.",
  },
  starry_ascent: {
    name: "Astra the Stargazer",
    weapon: "starlight-censer",
    line: "Climb the islands to the Observatory at the peak. The Weight of Weariness circles it. Swing this Starlight Censer and it will remember how to rest.",
  },
  cathedral: {
    name: "Sister Lumen",
    weapon: "ring-of-dawn",
    line: "There is nothing left to fight here, only a door to walk through. Take the Ring of Dawn, and go meet him by the stained glass.",
  },
};

export type BossReply = {
  id: string;
  text: string;
  answer: string;
  /** Opening advantage granted by this reply. */
  boon: "stamina" | "slow" | "heart";
  boonText: string;
};

export type BossConfig = {
  name: string;
  hp: number;
  taunt: string;
  /** Sprite key registered in textures.ts */
  art: string;
  /** Aura colour for the boss glow. */
  color: number;
  scale: number;
  /** Line the boss speaks before the fight begins. */
  intro: string;
  replies: BossReply[];
};

const REPLY_BOONS: Record<BossReply["boon"], string> = {
  stamina: "Your breath steadies — full stamina and a quicker dash.",
  slow: "The air thickens around it — your foe moves slower.",
  heart: "Courage warms you — one heart restored.",
};

export const ACT_BOSSES: Record<ZoneId, BossConfig | null> = {
  sunlit_shores: {
    name: "Warden of Rushing Water",
    hp: 6,
    taunt: "The Warden of Rushing Water rises from the river. Steady — you have crossed worse.",
    art: "boss-water",
    color: 0x4ec9d6,
    scale: 1.15,
    intro:
      "I am the current that never lets anyone cross. Everyone who has stood here turned back. Why should you be different?",
    replies: [
      {
        id: "bold",
        text: "Because I am not turning back today.",
        answer: "Then wade in, small one. Let us see what stubborn love is made of.",
        boon: "stamina",
        boonText: REPLY_BOONS.stamina,
      },
      {
        id: "gentle",
        text: "You sound tired of holding this river alone.",
        answer: "…No one has ever said that to me. Come then. Perhaps I can be put down.",
        boon: "slow",
        boonText: REPLY_BOONS.slow,
      },
      {
        id: "faith",
        text: "He walked on water once. I only have to cross it.",
        answer: "Faith. Always the thing that undoes me. Very well — cross, if you can.",
        boon: "heart",
        boonText: REPLY_BOONS.heart,
      },
    ],
  },
  wedding_garden: {
    name: "The Stress Spectre",
    hp: 7,
    taunt: "The Stress Spectre unfurls above the glass roof. Breathe. Swing.",
    art: "boss-garden",
    color: 0xb79cf0,
    scale: 1.2,
    intro:
      "Seating charts. Deposits. Rain on the day. I am every list you have not finished. Shall I read them all aloud?",
    replies: [
      {
        id: "bold",
        text: "Read them. I will still be standing at the end.",
        answer: "How rude of you to be calm. Fine — let us do this properly.",
        boon: "stamina",
        boonText: REPLY_BOONS.stamina,
      },
      {
        id: "gentle",
        text: "You are only trying to keep me safe. Rest now.",
        answer: "Rest? I have never been offered that. My thorns feel heavier already.",
        boon: "slow",
        boonText: REPLY_BOONS.slow,
      },
      {
        id: "faith",
        text: "Not one flower in this garden worries, and they are dressed better than me.",
        answer: "…That is annoyingly true. Come on then, gardener's girl.",
        boon: "heart",
        boonText: REPLY_BOONS.heart,
      },
    ],
  },
  the_haven: {
    name: "The Clamour of Doubt",
    hp: 8,
    taunt: "The Clamour of Doubt clatters across the square. Answer it with your blade of light.",
    art: "boss-haven",
    color: 0xd9a441,
    scale: 1.2,
    intro:
      "Tick. Tick. Are you ready for a whole life with him? Truly ready? I can list the reasons you are not.",
    replies: [
      {
        id: "bold",
        text: "Nobody is ready. We are going anyway.",
        answer: "Bold. My gears do not like bold. Very well.",
        boon: "stamina",
        boonText: REPLY_BOONS.stamina,
      },
      {
        id: "gentle",
        text: "You are just fear wearing a clock. I hear you, and I am still choosing him.",
        answer: "Heard, and still chosen against. My hands slow at that.",
        boon: "slow",
        boonText: REPLY_BOONS.slow,
      },
      {
        id: "faith",
        text: "Perfect love casts out fear — and this love is not mine alone.",
        answer: "That name again. It always stops my ringing. Fight, then.",
        boon: "heart",
        boonText: REPLY_BOONS.heart,
      },
    ],
  },
  starry_ascent: {
    name: "The Weight of Weariness",
    hp: 9,
    taunt: "The Weight of Weariness settles over the summit. Show it what rest looks like.",
    art: "boss-star",
    color: 0x8f9bff,
    scale: 1.25,
    intro:
      "You are so tired, Maria. Lie down. The stars will still be here tomorrow, and so will the climb.",
    replies: [
      {
        id: "bold",
        text: "Tired is not the same as finished.",
        answer: "Everyone says that. Few mean it. Prove it.",
        boon: "stamina",
        boonText: REPLY_BOONS.stamina,
      },
      {
        id: "gentle",
        text: "You are right — I am tired. I will rest after, not instead.",
        answer: "Honest. That is heavier for me to carry than defiance.",
        boon: "slow",
        boonText: REPLY_BOONS.slow,
      },
      {
        id: "faith",
        text: "He gives strength to the weary. I am counting on that tonight.",
        answer: "Then climb, weary one. I will not stop you long.",
        boon: "heart",
        boonText: REPLY_BOONS.heart,
      },
    ],
  },
  cathedral: null,
};

// =========================================================================
// SHIELD, SIGNPOST & PICKUPS
// =========================================================================

/** The Act I guide's very special gift — auto-guards Maria at one heart. */
export const AEGIS = {
  id: "aegis",
  name: "Aegis of Unshakable Faith",
  line: "One more thing, and this one is very special. The Aegis of Unshakable Faith. Keep it close — when you are down to your last heart, it will wake on its own, push back everything near you, and hold you safe for a moment. It only rests a little while between guards.",
  trigger: "The Aegis wakes — a ring of gold pushes the worry back.",
};

export const HEART_PICKUP_TEXT = "A heart restored.";
export const GOLDEN_HEART_TEXT = "A golden heart — full health!";

/** Short written directions shown by the wooden signpost (not the realm map). */
export const SIGNPOST_HEADER = "Weathered Signpost";


export const SIGNPOST_DIRECTIONS: Record<ZoneId, string[]> = {
  sunlit_shores: [
    "NORTH-WEST — The Blacksmith's forge. Ask for a blade; he never sends anyone away empty-handed.",
    "SOUTH — Your guide waits by the meadow trail with a gift for the road.",
    "EAST — The River Gates. Push the three stones onto the three plates to open the water.",
    "FAR EAST — The Grotto Temple and the shining gateway onward.",
  ],
  wedding_garden: [
    "NORTH — The glass conservatory and the seating puzzle.",
    "WEST — Rose walks; letters are often tucked between the hedges.",
    "EAST — The garden gateway, once the relic is yours.",
  ],
  the_haven: [
    "CENTRE — The town square and its clock.",
    "NORTH — The vault; three keys open it.",
    "EAST — The road to the Starry Ascent.",
  ],
  starry_ascent: [
    "UP — The switchbacks to the summit lantern.",
    "WEST — A quiet ferry across the still water.",
    "EAST — The last gateway, to the cathedral doors.",
  ],
  cathedral: [
    "AHEAD — The aisle. He is waiting by the stained glass.",
    "ASIDE — Side chapels, where a few last letters are hidden.",
  ],
};
