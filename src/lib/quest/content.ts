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
    title: "Peace Burst",
    body: "Tap PEACE (or SPACE / J) to send a ring of rose petals. Enemies touched by peace are transformed, not destroyed. Each burst costs a little stamina.",
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
    title: "Peace Burst",
    body: "Tap PEACE (or press Space) to send out blossoms that calm any worry they touch — nothing is ever harmed.",
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
