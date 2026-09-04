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
    title: "Envelope #1 — Love",
    zone: "sunlit_shores",
    letter:
      "LOVE. Maria — I hid this one behind the water on purpose, because love is like that: loud and rushing on the outside, still and certain underneath. Loving you isn't a feeling I fell into, it's a choice I make every morning and would make a thousand more times. — Andrew",
  },
  {
    id: "hedge",
    title: "Envelope #2 — Peace",
    zone: "wedding_garden",
    letter:
      "PEACE. You never force anything. You just bloom, and the world rearranges itself to make room for you. That is what you brought into my life — peace. Not the empty kind, the kind that stays through hard seasons because you're standing in it with me. — Andrew",
  },
  {
    id: "patio",
    title: "Envelope #3 — Patience",
    zone: "the_haven",
    letter:
      "PATIENCE. Every long talk, every ordinary afternoon, every time you waited for me to find my words instead of rushing me — that's patience, and it's the quiet way you've loved me best. Forever with you looks like this table, and I am in no hurry anywhere else. — Andrew",
  },
  {
    id: "summit",
    title: "Envelope #4 — Kindness",
    zone: "starry_ascent",
    letter:
      "KINDNESS. You climbed all this way and still stopped for everyone along the road. You keep going with a soft heart, and that is the rarest strength there is. Look at the stars for a second — your kindness is what makes the whole sky feel warm. — Andrew",
  },
  {
    id: "cathedral",
    title: "Envelope #5 — Loyalty",
    zone: "cathedral",
    letter:
      "LOYALTY. Last one. Nothing left to hide, only a door to walk through together. I choose you today and every day after, in the loud seasons and the quiet ones, for as long as I have breath. Come find me by the stained glass. — Andrew",
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

/** One beat of the church ceremony: a spoken line, or a choice for Maria. */
export type CeremonyBeat =
  | { speaker: string; text: string }
  | { choices: DialogueChoice[] };

/** The full wedding inside the little church — priest, vows, rings, kiss. */
export const CEREMONY_SCRIPT: CeremonyBeat[] = [
  {
    speaker: "Pastor Alcir",
    text: "Light through old glass, candles along the stone, and every face here worn soft with joy. I get to say the word family twice today — once as your pastor, once as Andrew's grandfather. Dearly beloved, we are gathered in the sight of God to join Andrew and Maria in holy matrimony. Come forward, children. Take each other's hands.",
  },
  {
    speaker: "Andrew",
    text: "Maria... my hands are shaking a little. Not from fear — from the weight of how much this means. I have walked through five realms to stand here, and none of it was as hard as waiting for this moment to be real.",
  },
  { choices: CEREMONY_CHOICES },
  {
    speaker: "Pastor Alcir",
    text: "Love is patient. Love is kind. It does not envy, it does not boast, it keeps no record of wrongs. It always protects, always trusts, always hopes, always perseveres. Love never fails. Hear that clearly today: what you enter is not a feeling that visits you — it is a promise you renew every single morning, in the ordinary light of an ordinary kitchen.",
  },
  {
    speaker: "Pastor Alcir",
    text: "Andrew, will you have this woman to be your wedded wife — to love her, comfort her, honour and keep her, in sickness and in health, in plenty and in want, and forsaking all others be faithful to her as long as you both shall live?",
  },
  {
    speaker: "Andrew",
    text: "I will. With everything I am, and everything I am still becoming — I will.",
  },
  {
    speaker: "Pastor Alcir",
    text: "Maria, will you have this man to be your wedded husband — to love him, comfort him, honour and keep him, in sickness and in health, in plenty and in want, and forsaking all others be faithful to him as long as you both shall live?",
  },
  {
    speaker: "Maria",
    text: "I will. Today, tomorrow, and every ordinary day after — I will.",
  },
  {
    speaker: "Pastor Alcir",
    text: "Then speak now the vows you have written for one another. Say them slowly. Heaven is listening, and so is everyone who loves you.",
  },
  {
    speaker: "Andrew",
    text: "Maria — I promise to be the calm in your loud days and the joy in your quiet ones. I promise to listen before I answer, to apologise before the sun goes down, and to choose you louder on the days it is hard than on the days it is easy. I promise to pray over our home, to work for our future, and to never let a night pass without you knowing exactly what you are to me.",
  },
  {
    speaker: "Andrew",
    text: "You met every fear I have and did not flinch. You carried what I could not say out loud. Whatever comes for us, it will have to come through both of us — and I like our odds. You are my peace. I take you as my wife.",
  },
  {
    speaker: "Maria",
    text: "Andrew — I promise to walk beside you, never behind you and never ahead. I promise to be gentle with your heart and honest with my own, to tell you the truth kindly, and to stay when staying costs something. I promise laughter in our kitchen, grace in our arguments, and God at the centre of everything we build. I have seen what you fight when no one is watching, and I have never once wanted to run. I will be the safe place you come home to and the voice that tells you the truth about yourself. You are my home. I take you as my husband.",
  },
  {
    speaker: "Pastor Alcir",
    text: "The rings, please. A circle — no beginning, no end, no seam where it could ever come apart. Andrew, place it on her finger and say: with this ring, I thee wed.",
  },
  {
    speaker: "Andrew",
    text: "With this ring, I thee wed. All that I have is yours, and all that I build, I build for you.",
  },
  {
    speaker: "Maria",
    text: "With this ring, I thee wed. All that I am is yours, and all that I become, I become beside you.",
  },
  {
    speaker: "Pastor Alcir",
    text: "Inasmuch as Andrew and Maria have consented together in holy wedlock before God and this company, by the authority entrusted to me I pronounce them husband and wife. What God has joined together, let no one separate. Andrew — kiss your bride.",
  },
  {
    speaker: "The Church",
    text: "The whole church rises at once. Bells break open over the golden realm, petals drift down from the rafters, and every person you have ever loved is on their feet — Marcos and Raquel, Silvia and Gustavo, every friend, every witness, all of it, for you two.",
  },
];


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
    objective: "Follow the road east to the Sunken Grotto, calm the Warden, and claim the Lantern.",
  },
  wedding_garden: {
    id: "wedding_garden",
    act: "Act II",
    title: "The Wedding Garden",
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
  {
    title: "Weapons",
    body: "Each act's guide gives Maria that act's own weapon when their conversation ends. Every weapon stays in the belt on the right and can be switched at any time.",
  },
];

export const REALM_LANDMARKS: { direction: string; name: string; act: string; zone: ZoneId }[] = [
  { direction: "West", name: "The River Gates & Sunken Grotto", act: "Act I", zone: "sunlit_shores" },
  { direction: "North", name: "The Wedding Garden", act: "Act II", zone: "wedding_garden" },
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
  {
    title: "Ping Objective",
    body: "Tap PING OBJECTIVE under the objective tracker: a gold pulse ripples out from Maria and a large compass marker shows the exact direction for a few seconds. You always steer yourself.",
  },
];

// =========================================================================
// WEAPONS, ACT GUIDES & BOSSES
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
    id: "ember-blade",
    name: "Ember Blade",
    icon: "\u{1F525}",
    damage: 200,
    reach: 80,
    color: 0xffa14a,
    blurb: "Forged in Bram's own fire, still warm at the edge. Deals 200 damage.",
  },
  {
    id: "spark-wand",
    name: "Radiant Spark Wand",
    icon: "✨",
    damage: 100,
    reach: 72,
    color: 0xffd977,
    blurb: "Carved from grotto driftwood. Its light scatters worry before it can settle. Deals 100 damage.",
  },
  {
    id: "floral-bow",
    name: "Floral Bow",
    icon: "🏹",
    damage: 180,
    reach: 90,
    color: 0xff9ec4,
    blurb: "Strung with garden vine. Every arrow blooms where it lands. Deals 180 damage.",
  },
  {
    id: "lightblade",
    name: "Lightblade",
    icon: "⚔️",
    damage: 280,
    reach: 78,
    color: 0xbfe3ff,
    blurb: "Forged in Haven's clocktower. It cuts through noise, never through people. Deals 280 damage.",
  },
  {
    id: "love-sword",
    name: "The Love Sword",
    icon: "💗",
    damage: 380,
    reach: 88,
    color: 0xff6fae,
    blurb: "Andrew's own blade, forged rose-pink. He carries its blue twin and fights at your side wherever you go. Deals 380 damage.",
  },
  {
    id: "starlight-censer",
    name: "Celestial Stave",
    icon: "🌟",
    damage: 420,
    reach: 96,
    color: 0xa9b6ff,
    blurb: "Swings a slow arc of constellations that calms whatever it touches. Deals 420 damage.",
  },
  {
    id: "ring-of-dawn",
    name: "Vow Shield / Peace Blade",
    icon: "🛡️",
    damage: 520,
    reach: 104,
    color: 0xffe6a8,
    blurb: "A shield that guards the promise and a blade that never needs to be drawn in anger. Deals 520 damage.",
  },
  {
    id: "eternal-vow",
    name: "Ring of Eternal Vow",
    icon: "💍",
    damage: 720,
    reach: 116,
    color: 0xffd977,
    blurb: "A vow made metal. Legendary — it ends most arguments in a single swing. Deals 720 damage.",
  },
  {
    id: "seraph-edge",
    name: "Seraph's Edge",
    icon: "🗡️",
    damage: 650,
    reach: 132,
    color: 0xbfe3ff,
    blurb: "Feather-light and impossibly fast. Legendary — it sweeps wide enough to clear a crowd. Deals 650 damage.",
  },
  {
    id: "golden-crown",
    name: "Crown of the Golden Ring",
    icon: "👑",
    damage: 1000,
    reach: 150,
    color: 0xffb347,
    blurb: "The realm's own crown. Legendary — nothing that stands against love survives two strikes of it. Deals 1000 damage.",
  },
];

/** Hidden legendary pickups — one each in Acts I, III and IV. */
export const LEGENDARY_PICKUPS: {
  zone: ZoneId;
  weapon: string;
  x: number;
  y: number;
  prompt: string;
  body: string;
}[] = [
  {
    zone: "sunlit_shores",
    weapon: "eternal-vow",
    x: 18,
    y: 88,
    prompt: "Take the Ring of Eternal Vow",
    body:
      "Half buried in the shore grass, still warm. The Ring of Eternal Vow is yours — swing it and doubt simply stops. Equip it any time from the weapon list.",
  },
  {
    zone: "the_haven",
    weapon: "seraph-edge",
    x: 108,
    y: 92,
    prompt: "Take the Seraph's Edge",
    body:
      "Left behind a market stall, wrapped in white cloth. The Seraph's Edge is yours — faster and wider than anything you have carried. Equip it any time from the weapon list.",
  },
  {
    zone: "starry_ascent",
    weapon: "golden-crown",
    x: 44,
    y: 92,
    prompt: "Take the Crown of the Golden Ring",
    body:
      "Resting on a fallen star. The Crown of the Golden Ring is yours — the strongest thing in any realm, and it answers only to you. Equip it any time from the weapon list.",
  },
];

export const WEAPON_BY_ID: Record<string, Weapon> = Object.fromEntries(
  WEAPONS.map((w) => [w.id, w]),
);

/** Act I's guide hands this over — there is no forge and no practice blade. */
export const DEFAULT_WEAPON = "spark-wand";

/** Andrew's gift in Act III — the pink Love Sword, and he joins the fight. */
export const LOVE_SWORD = {
  id: "love-sword",
  line: "I made this sword for you — I thought you might need it. Rose-pink, because that is what you are to me. I kept the blue one, so wherever this road goes, I'm swinging right beside you.",
};

/** Act IV's second boss — appears the moment the first one softens. */
export const SECOND_BOSSES: Partial<Record<ZoneId, BossConfig>> = {
  starry_ascent: {
    name: "The Hollow of Doubtful Nights",
    demon:
      "This is what finds Andrew at three in the morning — the what-if he can never argue down.",
    mariaLine:
      "I've felt him lie awake with this. It doesn't get him tonight.",
    hp: 5460,
    taunt: "The stars go cold. A second shadow rises — The Hollow of Doubtful Nights.",
    art: "boss-hollow",
    color: 0x27336e,
    scale: 1.2,
    projectile: { color: 0x27336e, speed: 200, every: 1900 },
    silent: true,

    intro:
      "Weariness was the kind one. I am what comes at three in the morning — the question with no answer.",
    slides: [],

  },
};

/** Post-Act II speed collectible found near the Haven spawn. */
export const SWIFT_SANDALS = {
  id: "swift-sandals",
  name: "The Swift Sandals of Joy",
  prompt: "Take the Swift Sandals",
  multiplier: 1.45,
  body:
    "Left on the Haven cobblestones, gold ribbons still fluttering. The moment Maria laces them on her step lightens — she moves through every realm noticeably faster from here on, and the sandals never leave her.",
};

/** The forge on the Sunlit Shores — Bram hands over the Act II weapon early. */
export const BLACKSMITH = {
  name: "Bram the Smith",
  weapon: "ember-blade",
  line: "Heard you're headed north to the garden. Rough hedges up there. I forged this Ember Blade in my own fire this morning — two hundred weight of hurt in every swing. Take it before you go, and let it keep the dark off you.",
  repeat: "The forge stays lit for you. That Ember Blade will hold — two hundred in every swing, and it never dulls when it's swung for someone you love.",
};

export const ACT_GUIDES: Record<
  ZoneId,
  { name: string; weapon: string; line: string; pages: string[] }
> = {
  sunlit_shores: {
    name: "Wren of the Shores",
    weapon: "spark-wand",
    line: "Welcome, Bringer of Peace. Follow the road east to the River Gate Temple — the Warden of Rushing Water guards the Lantern there. Take my Radiant Spark Wand; its light is louder than any worry.",
    pages: [
      "Oh — you're awake. Steady now. I'm Wren, keeper of these shores, and I've been waiting on this rock since before sunrise, because the sea told me someone was coming today.",
      "Your name is Maria. Hold on to that. This is the Realm of the Golden Ring — five lands laid end to end like beads on a chain, and every one of them was built out of something Andrew feels about you.",
      "Andrew is the reason all this exists. He's waiting at the far end of the chain and he cannot come to you — that's the rule here. The road only runs one way, and it has to be walked by you.",
      "You're gathering five Relics, one hidden in each land. They aren't treasure, they're truths — things Andrew has been trying to tell you. There are sealed Envelopes too, tucked away where the world goes quiet. Letters. Read them slowly; that's not a side quest, that's the point.",
      "Each land is guarded. Sorrow here takes shape and walks around. Whatever you meet, it isn't evil — it only tries to convince you that you are too much or not enough. You beat it by refusing to believe it.",
      "So take this. The Radiant Spark Wand. Swing it and it throws light, not blades — what it touches remembers it was gentle once and turns back into petals. Better weapons come later; keep them all and swap in your Armory.",
      "Watch your hearts in the corner. Five hits and you wake back at the start of the land — nothing lost but time. Rest stones give the hearts back, and so does your house: a hearth to cook on, a chest for what you gather, a bed for the night.",
      "The sun here runs a real day — seven in the morning to seven at night, then the lamps come on. Animals wander the grass; hunt them if you need food, cook the meat, eat when your hearts run low.",
      "Your road today: follow the coastal path east until you reach the River Gate Temple, and go inside. If you lose your bearings there's a signpost in every land and a map button in the corner. You're not lost, Maria. You're expected.",
    ],
  },
  wedding_garden: {
    name: "Ivy the Gardener",
    weapon: "ember-blade",
    line: "The promenade runs straight to the Conservatory — no mazes here, just open beds and light. Four seasonal keys wake its doors, and the Stress Spectre waits inside.",
    pages: [
      "Mind the beds, love — mind the beds. There. I'm Ivy, and everything you can see growing here I put in the ground myself. Welcome to the Wedding Garden, the second land of the chain.",
      "This place grew out of one specific afternoon: the day Andrew first pictured you walking down an aisle. That's why every path here is straight and open, no mazes, nothing hidden from you. He didn't want you to have to guess.",
      "Two things are buried in this garden. The Anchor of Comfort and the Bloom of Reflection — two relics in one land, which never happens anywhere else. And an envelope, tucked into the hedge where the wind doesn't reach.",
      "The Conservatory at the top of the promenade is locked with four seasonal keys — spring, summer, autumn, winter — scattered around the garden beds. Collect all four and the glass doors open. The Stress Spectre is what's waiting inside, and she is fast, so keep moving.",
      "Take the Floral Bow. Vine-strung, fires from a distance, and every arrow blooms where it lands — you can fight the Spectre without ever letting her close. Keep your old wand too; some days a short reach is the kinder one.",
      "Rest stone's by the arbour, your house is just west, and the wedding guests wandering the lawn will all talk to you. Talk back. They have things to say about the two of you that you have never heard.",
    ],
  },
  the_haven: {
    name: "Marlowe the Bellkeeper",
    weapon: "lightblade",
    line: "Haven is loud today. The Clamour of Doubt paces the town hall steps and Andrew waits by the fountain. Take the Lightblade — it cuts through noise, never through hearts.",
    pages: [
      "Marlowe. Bellkeeper. Third land — welcome to the Haven, and I'll be honest with you: it's loud today.",
      "This is the town Andrew built in his head for the ordinary years. Not the wedding, not the proposal — the Tuesdays. Groceries, coffee going cold, the two of you arguing about nothing and laughing about it by evening. That's what these streets are made of.",
      "The Shield of Unshakable Faith is here, and so is the third envelope, out on the patio where you two would have taken your long talks. And Andrew — the real Andrew, or as close as this realm can hold — is waiting by the fountain. Go to him before you fight anything. Please.",
      "The Clamour of Doubt paces the town hall steps. It's the voice that says you're not doing enough, that you're behind, that everyone else has it figured out. It doesn't hit hard. It just doesn't stop. Patience beats it, not fury.",
      "Take the Lightblade. It cuts through noise and never through hearts. And take the Memory Stone by the fountain seriously when you find it — that one's about the day he asked you.",
    ],
  },
  starry_ascent: {
    name: "Astra the Stargazer",
    weapon: "starlight-censer",
    line: "Listen closely, this peak has a lock on it. Three crystal pillars stand across the plateau, and each one turns through three colours: blue, gold, then rose. Only when all three burn warm gold at the same time does the Celestial Staircase form and the Seal of Perfect Peace become reachable — that Seal is the only thing that opens the way to the cathedral. So: turn a pillar, check its colour, move to the next, and come back around until all three are gold. The Weight of Weariness will circle you the whole time; swing this Starlight Censer and it will remember how to rest.",
    pages: [
      "Careful on the ledge. I'm Astra — I watch the sky from this plateau, and I've watched you climb the whole way up. Fourth land. You are very nearly there.",
      "This peak is made of the nights Andrew couldn't sleep for thinking about you. That's why the stars are so close here. Every one of them is a thought he had at two in the morning that he never quite managed to say out loud.",
      "The Seal of Perfect Peace is at the top, and it is the only thing that opens the road to the cathedral. No Seal, no wedding. So listen carefully to the lock.",
      "Three crystal pillars stand across the plateau. Each one turns through three colours when you touch it: blue, then gold, then rose, then back to blue. The Celestial Staircase only forms when all three are burning warm gold at the same moment. Turn one, check it, walk to the next, and keep circling until they match.",
      "The Weight of Weariness circles you the entire time. It's exhaustion given a body — it gets heavier the longer you fight it, which is exactly how the real thing works. Don't out-muscle it. Out-last it.",
      "Take the Starlight Censer. Swing it and everything it touches remembers how to rest, including you. The fourth envelope is at the summit — read it up there, with the sky right on top of you. That's how it was meant to be read.",
    ],
  },
  cathedral: {
    name: "Sister Lumen",
    weapon: "ring-of-dawn",
    line: "There is nothing left to fight here, only a door to walk through. Take the Ring of Dawn, and go meet him by the stained glass.",
    pages: [
      "Shh. Softly now. I'm Sister Lumen, and this is the last land — you can put your shoulders down.",
      "There is nothing here to fight. Not one thing. Every creature you met on the road was something that wanted you to turn back, and you didn't, and now they're all behind you.",
      "Your family is inside. Marcos and Raquel. Silvia and Gustavo. Every friend, every face. Pastor Alcir is at the altar and he'll marry you himself — he's Andrew's grandfather, did you know that? He asked for the honour twice.",
      "The last envelope is here, and it's the shortest one. Loyalty. He didn't need many words for that one.",
      "Take the Ring of Dawn. Then go through the doors and stand where the coloured light falls, and let him look at you. That's all that's left, Maria. Go.",
    ],
  },
};

export type ReplyFlavor = "bold" | "gentle" | "faith";

export type BossReply = {
  id: ReplyFlavor;
  text: string;
  /** What the boss spits back after this reply. */
  answer: string;
};

/** One beat of the confrontation: the boss speaks, Maria answers. */
export type BossSlide = {
  boss: string;
  replies: BossReply[];
};

export type BossConfig = {
  name: string;
  hp: number;
  taunt: string;
  /** Sprite key registered in textures.ts */
  art: string;
  /** Short relationship subtitle shown under the name in dialogue */
  role?: string;
  /** Aura colour for the boss glow. */
  color: number;
  scale: number;
  /** Which of Andrew's real struggles this creature actually is. */
  demon: string;
  /** Maria's quiet recognition, spoken before she answers. */
  mariaLine: string;
  /** Line the boss speaks before the fight begins (first slide). */
  intro: string;
  /** Five-beat confrontation. */
  slides: BossSlide[];
  /** When true the boss fights immediately — no intro dialogue. */
  silent?: boolean;
  /** Ranged attack: bolt colour, speed and cadence in ms. */
  projectile?: { color: number; speed: number; every: number };
};

/** Food only ever drops from animals — raw heals a little, cooked heals a lot. */
export type FoodItem = {
  id: string;
  name: string;
  icon: string;
  heal: number;
  cookedId?: string;
  raw?: boolean;
  blurb: string;
};

export const FOOD_ITEMS: FoodItem[] = [
  {
    id: "raw-meat",
    name: "Raw Meat",
    icon: "🥩",
    heal: 0,
    cookedId: "cooked-meat",
    raw: true,
    blurb: "Fresh from the wild. Cook it on the hearth at home before eating.",
  },
  {
    id: "cooked-meat",
    name: "Cooked Meat",
    icon: "🍖",
    heal: 0.5,
    blurb: "Warm, seasoned and restoring. Half a heart back.",
  },
  {
    id: "berries",
    name: "Wild Berries",
    icon: "🫐",
    heal: 0.5,
    blurb: "Sweet handful gathered where the animals graze. Half a heart back.",
  },
  {
    id: "apple",
    name: "Apple",
    icon: "\u{1F34E}",
    heal: 0.25,
    blurb: "Picked from an orchard tree. A quarter heart back.",
  },
  {
    id: "orange",
    name: "Orange",
    icon: "\u{1F34A}",
    heal: 0.25,
    blurb: "Sun-warm and sweet. A quarter heart back.",
  },
];

export const FOOD_BY_ID: Record<string, FoodItem> = Object.fromEntries(
  FOOD_ITEMS.map((f) => [f.id, f]),
);

/** Every animal in the realm shares this health pool. */
export const ANIMAL_HP = 50;

export const HOUSE = {
  name: "Maria's House",
  prompt: "Enter Maria's house",
  welcome: "The door swings shut behind you. Warm light, no worry, nothing here can reach you.",
};


/** Opening advantage earned by whichever tone Maria used most. */
export const BOON_BY_FLAVOR: Record<
  ReplyFlavor,
  { boon: "stamina" | "slow" | "heart"; boonText: string }
> = {
  bold: {
    boon: "stamina",
    boonText: "You answered with steel — full stamina and a quicker dash.",
  },
  gentle: {
    boon: "slow",
    boonText: "You answered with mercy — the thing before you moves slower.",
  },
  faith: {
    boon: "heart",
    boonText: "You answered with faith — one heart restored.",
  },
};

export const ACT_BOSSES: Record<ZoneId, BossConfig | null> = {
  sunlit_shores: {
    name: "Warden of Rushing Water",
    role: "a fear that rises",
    demon: "This is fear.",
    mariaLine: "I know this one. He carries it at 2 a.m.",
    hp: 2600,
    taunt: "The river darkens. The Warden rises to block the crossing.",
    art: "boss-water",
    color: 0x4ec9d6,
    scale: 1.15,
    projectile: { color: 0x4ec9d6, speed: 190, every: 2200 },
    intro: "Turn back, bride. The current keeps what it takes.",
    slides: [
      {
        boss: "Turn back, bride. The current keeps what it takes.",
        replies: [
          {
            id: "bold",
            text: "Then I'll be the first across.",
            answer: "Everyone says that from the bank.",
          },
          {
            id: "gentle",
            text: "You look tired of holding this river.",
            answer: "Tired. And still here.",
          },
          {
            id: "faith",
            text: "I don't fear floods.",
            answer: "Let's see how deep yours goes.",
          },
        ],
      },
      {
        boss: "I'm the number he checks at 2 a.m. I never sleep.",
        replies: [
          { id: "bold", text: "I know. That's why I came.", answer: "How brave. How useless." },
          { id: "gentle", text: "I've seen his face in that blue light.", answer: "Then you've seen my work." },
          { id: "faith", text: "Our bread is already promised.", answer: "Promises don't pay in April." },
        ],
      },
      {
        boss: "I'll make him quiet about money. Quiet turns into distance.",
        replies: [
          { id: "bold", text: "We'll talk about all of it. Loudly.", answer: "Loud houses starve me." },
          { id: "gentle", text: "He won't carry it alone again.", answer: "Shared weight. I hate that." },
          { id: "faith", text: "We'll pray over the numbers.", answer: "Then fight me and be done." },
        ],
      },
    ],
  },
  wedding_garden: {
    name: "The Stress Spectre",
    role: "a fear that gathers",
    demon: "This is fear.",
    mariaLine: "He never says it out loud. Tonight it answers to me.",
    hp: 3640,
    taunt: "The glass darkens. The Stress Spectre descends.",
    art: "boss-garden",
    color: 0xb79cf0,
    scale: 1.2,
    projectile: { color: 0xb79cf0, speed: 210, every: 2000 },
    intro: "So many plans. So little of him left over.",
    slides: [
      {
        boss: "So many plans. So little of him left over.",
        replies: [
          { id: "bold", text: "Plans don't own him. Move.", answer: "They own everyone eventually." },
          { id: "gentle", text: "He does it because he loves us.", answer: "Love is my favourite fuel." },
          { id: "faith", text: "Cares get cast, not carried.", answer: "He keeps picking them back up." },
        ],
      },
      {
        boss: "I make him busy so he can't feel anything. It works.",
        replies: [
          { id: "bold", text: "Not anymore. Hands off.", answer: "Bold. Loud. Predictable." },
          { id: "gentle", text: "He's allowed to stop with me.", answer: "Permission. Dangerous word." },
          { id: "faith", text: "Rest was commanded first.", answer: "He ignores that too." },
        ],
      },
      {
        boss: "Cut me down, then. Every ruined wedding started this way.",
        replies: [
          { id: "bold", text: "I'm not leaving. Raise your hands.", answer: "Worse than strong." },
          { id: "gentle", text: "I only came to take him back.", answer: "Take him, if you can." },
          { id: "faith", text: "I'm done carrying you.", answer: "Then finish it." },
        ],
      },
    ],
  },
  the_haven: {
    name: "The Clamour of Doubt",
    role: "a fear that whispers",
    demon: "This is fear.",
    mariaLine: "I've heard this voice through his silence. Not tonight.",
    hp: 7800,
    taunt: "The square falls silent. The Clamour turns toward you.",
    art: "boss-haven",
    color: 0xd9a441,
    scale: 1.25,
    projectile: { color: 0xd9a441, speed: 230, every: 1700 },
    intro: "He isn't good enough for you. He knows it.",
    slides: [
      {
        boss: "He isn't good enough for you. He knows it.",
        replies: [
          { id: "bold", text: "I choose him. Every day.", answer: "Choices wear thin." },
          { id: "gentle", text: "He's already enough.", answer: "Tell him. See if he believes you." },
          { id: "faith", text: "God gave him to me on purpose.", answer: "Then I'll settle for you." },
        ],
      },
      {
        boss: "I'll be in every argument. Small voice, long memory.",
        replies: [
          { id: "bold", text: "I'll shout you down.", answer: "You'll get tired." },
          { id: "gentle", text: "We'll finish our fights kindly.", answer: "Kindness is a wall I can't climb." },
          { id: "faith", text: "Grace covers our worst nights.", answer: "Grace. Always grace." },
        ],
      },
      {
        boss: "Strike me and I'll only speak from further away.",
        replies: [
          { id: "bold", text: "Then keep backing up.", answer: "Take the square, bride." },
          { id: "gentle", text: "He won't hear you alone.", answer: "Alone was my whole plan." },
          { id: "faith", text: "Perfect love throws fear out.", answer: "Then throw." },
        ],
      },
    ],
  },
  starry_ascent: {
    name: "The Weight of Weariness",
    role: "a fear that settles",
    demon: "This is fear.",
    mariaLine: "He calls it discipline. I know what it really is.",
    hp: 4160,
    taunt: "The stars dim. The Weight of Weariness settles over the plateau.",
    art: "boss-star",
    color: 0x8f9dd6,
    scale: 1.2,
    projectile: { color: 0x8f9dd6, speed: 180, every: 2400 },
    intro: "Lie down. No one would blame you.",
    slides: [
      {
        boss: "Lie down. No one would blame you.",
        replies: [
          { id: "bold", text: "Get off my back.", answer: "They all stand up first." },
          { id: "gentle", text: "I'm tired. I'm still climbing.", answer: "Honest. Unpleasant." },
          { id: "faith", text: "He strengthens the weary.", answer: "I'll still be heavy by morning." },
        ],
      },
      {
        boss: "I'll take his evenings, then his laugh.",
        replies: [
          { id: "bold", text: "His evenings are mine.", answer: "Time is on my side." },
          { id: "gentle", text: "His rest is my job now.", answer: "You keep halving me." },
          { id: "faith", text: "We'll keep a sabbath.", answer: "Stubborn people with a rhythm." },
        ],
      },
      {
        boss: "Tired men get polite. That's how marriages end.",
        replies: [
          { id: "bold", text: "Nothing polite about us.", answer: "Loud houses again." },
          { id: "gentle", text: "I'll ask on the nights he can't.", answer: "Taking turns. Unfair." },
          { id: "faith", text: "We carry each other.", answer: "Then climb, and let's see." },
        ],
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
  line: "One more thing, and this one is special. The Aegis of Unshakable Faith. You never have to use it — the moment you're down to your last heart it wakes on its own, throws a ring of gold out around you, knocks back everything standing close and holds you safe for a few seconds so you can breathe and get clear. Then it sleeps for a short while before it can guard you again. Remember that when the Conservatory doors open: the Stress Spectre inside is fast, and she counts on you panicking at your last heart. You won't be alone at that moment.",
  trigger: "The Aegis wakes — a ring of gold pushes the worry back.",
};

export const HEART_PICKUP_TEXT = "A heart restored.";
export const GOLDEN_HEART_TEXT = "A golden heart — full health!";

/** Short written directions shown by the wooden signpost (not the realm map). */
export const SIGNPOST_HEADER = "Weathered Signpost";


export const SIGNPOST_DIRECTIONS: Record<ZoneId, string[]> = {
  sunlit_shores: [
    "NEARBY — Your realm guide. Speak with them; they will place this act's weapon in your hands.",
    "SOUTH — Your guide waits by the meadow trail with a gift for the road.",
    "EAST — The road to the Sunken Grotto. Follow it straight to the Warden.",
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

/** Bram's dog — an optional companion Maria can adopt in the Wedding Garden. */
export const MAX_DOG = {
  name: "Max",
  ask: "This scruffy fellow is Max. He's been my shadow at the forge since he was a pup, but he keeps staring north like the garden's calling him. Would you like him to walk with you? He won't lift a paw until you swing first — he only ever defends.",
  yes: "Max is at your side! He'll bound after anything that troubles you — but only after you strike first.",
  no: "Max wags anyway. He'll be right here by the forge whenever you change your mind.",
  already: "Max looks up at you, tail going wild. He's yours as long as you'll have him.",
};

// =========================================================================
// WEDDING GUESTS — one excited visitor per act, family in the Cathedral
// =========================================================================

export type GuestInfo = {
  id: string;
  name: string;
  /** Sprite key registered in textures.ts */
  art: string;
  /** Short relationship subtitle shown under the name in dialogue */
  role?: string;
  prompt: string;
  lines: string[];
};

export const WEDDING_GUESTS: Partial<Record<ZoneId, GuestInfo>> = {
  sunlit_shores: {
    id: "lorena",
    name: "Lorena",
    art: "lorena",
    role: "Maria\u2019s closest friend",
    prompt: "Say hello to Lorena",
    lines: [
      "Maria! I still cannot believe it is really happening — you and Andrew, married!",
      "I have had the date circled on my calendar in about six different colors.",
      "I am SO excited for the wedding. Do not let any river monster keep you from that aisle.",
    ],
  },
  wedding_garden: {
    id: "alicia",
    name: "Alicia",
    art: "alicia",
    role: "Bridesmaid & lifelong friend",
    prompt: "Say hello to Alicia",
    lines: [
      "Look at all these flowers — it is like the whole garden got the invitation!",
      "I am so excited for the wedding, Maria. I have already cried twice and it is not even the day yet.",
      "You have been my person since before I can remember. Seeing you this loved is the best thing I have ever watched.",
    ],
  },
  the_haven: {
    id: "pedro",
    name: "Pedro",
    art: "pedro",
    role: "Maria\u2019s little brother",
    prompt: "Say hello to Pedro",
    lines: [
      "MARI! Are you getting married for REAL for real?!",
      "I am SO excited. Mom said I have to wear nice shoes and I said fine, but only this once.",
      "You are the best sister. Tell Andrew he is almost as cool as me. Almost.",
    ],
  },
  starry_ascent: {
    id: "gianluca",
    name: "Gianluca",
    art: "gianluca",
    role: "Best Man",
    prompt: "Say hello to Gianluca",
    lines: [
      "All the way up this mountain, and still all anyone can talk about is the wedding.",
      "I am excited, Maria. Genuinely. You two make it look easy.",
      "Get to the top, grab that star, and get to the church. I am saving you a seat.",
    ],
  },
};

/** Pastor Adriel — a supportive pastor cheering on Maria & Andrew in Act IV. */
export const PASTOR_ADRIEL: GuestInfo = {
  id: "adriel",
  name: "Pastor Adriel",
  art: "adriel",
  role: "A pastor who has prayed for your love story",
  prompt: "Speak with Pastor Adriel",
  lines: [
    "Maria, I have watched the two of you grow together, and I want you to know — your love has always pointed toward something bigger than yourselves.",
    "Marriage is not the finish line; it is the threshold. There will be hard days, but the same faith that brought you here will carry you through them.",
    "Andrew is a good man, and you are a strong woman. Together you will be a light. I am honored to celebrate with you both.",
  ],
};

export const FAMILY_GUESTS: GuestInfo[] = [
  {
    id: "raquel",
    name: "Mom (Raquel)",
    art: "raquel",
    role: "Andrew\u2019s mother",
    prompt: "Hug Mom",
    lines: [
      "My baby boy. Getting married. I have been dreaming about this day since before you could walk.",
      "Maria is everything I ever prayed for you to find, Andrew.",
      "I am not going to cry. ...I am absolutely going to cry. I am so excited.",
    ],
  },
  {
    id: "marcos",
    name: "Dad (Marcos)",
    art: "marcos",
    role: "Andrew\u2019s father",
    prompt: "Hug Dad",
    lines: [
      "Son. You look sharp. Your old man is proud — I mean that.",
      "You chose well, and more importantly, she chose you. Never stop earning that.",
      "I am so excited for this wedding. Best day this family has ever had.",
    ],
  },
  {
    id: "silvia",
    name: "Mom (Silvia)",
    art: "silvia",
    role: "Maria\u2019s mother",
    prompt: "Hug Silvia",
    lines: [
      "Maria, my daughter — you are glowing. A mother knows when her girl has found the right one.",
      "Andrew, welcome to the family, officially. You were already ours the day she brought you home.",
      "I am so excited I have not slept properly in a week. Worth it.",
    ],
  },
  {
    id: "gustavo",
    name: "Dad (Gustavo)",
    art: "gustavo",
    role: "Maria\u2019s father",
    prompt: "Hug Gustavo",
    lines: [
      "There is my girl. And the young man brave enough to marry her.",
      "Andrew — take care of my daughter. I can see in your face that you will.",
      "I could not be more excited. Today our two families become one big, loud, wonderful one.",
    ],
  },
];

/** Andrew's closest friends, all standing together in the Act V cathedral. */
export const CATHEDRAL_FRIENDS: GuestInfo[] = [
  {
    id: "andre",
    name: "Andre",
    art: "andre",
    role: undefined,
    prompt: "Greet Andre",
    lines: [
      "There he is. Suit and everything, and somehow the calmest man in the building.",
      "This is the day he has been waiting on. I would not miss it for anything.",
      "I am so excited for this wedding I could not sleep last night. Let's get you two married.",
    ],
  },
  {
    id: "phillip",
    name: "Phillip",
    art: "phillip",
    role: "Lifelong Friend",
    prompt: "Greet Phillip",
    lines: [
      "Andrew and I have known each other since we were kids — scraped knees, bad haircuts, all of it. And now this.",
      "You two are the real deal. Everyone in this room knows it.",
      "So excited for you both. Go on — he is waiting up front.",
    ],
  },
  {
    id: "italo",
    name: "Italo",
    art: "italo",
    role: undefined,
    prompt: "Greet Italo",
    lines: [
      "Today is finally here. I have been counting down to this one for months.",
      "Andrew has not stopped talking about this day since he decided to ask.",
      "I am so excited for this wedding. Let's get it started.",
    ],
  },
  {
    id: "gabe",
    name: "Gabe",
    art: "gabe",
    role: "Closest Friend",
    prompt: "Greet Gabe",
    lines: [
      "Six years I have known this guy, and today is easily the best day of them. I have the rings, checked four times, we are fine.",
      "You two make the rest of us believe in this stuff, you know that?",
      "I am so excited for the wedding. Best day of the year, easy.",
    ],
  },
];
