import { VERSES } from "./verses";
import { THEMES } from "./themes";

export type Devotional = {
  id: number;
  title: string;
  reference: string;
  verse: string;
  message: string[];
  questions: string[];
  words: number;
};

export const TOTAL_DEVOTIONALS = 1500;

/** Scripture translation used throughout the bank. */
export const TRANSLATION = "BSB";

const OPENERS = [
  (ref: string, theme: string) =>
    `Read ${ref} slowly, twice, out loud if you can. Today's theme is ${theme.toLowerCase()}, and it is worth sitting with before you rush into the day's list. Scripture rarely lands on a heart that is skimming. Let the words settle for a moment — not as a task to complete, but as God speaking directly into the life you are actually living right now, with all of its momentum and all of its unfinished edges.`,
  (ref: string, theme: string) =>
    `${ref} is a short passage with a long shadow. Its subject today is ${theme.toLowerCase()}, and it speaks with unusual directness to where you are standing. Before you read the reflection below, take thirty seconds of quiet. Ask God to show you the one sentence he wants you to carry into today, and be honest with yourself if it is not the sentence you were hoping for.`,
  (ref: string, theme: string) =>
    `Today's reading is ${ref}, and its theme is ${theme.toLowerCase()}. Time in Scripture is one of the simplest habits you can build and one of the most durable. It costs a few minutes and it slowly reshapes how you think about work, failure, other people, and yourself. Begin here, with the text itself, before you begin with your opinions about it.`,
  (ref: string, theme: string) =>
    `Take ${ref} as today's starting point. The theme is ${theme.toLowerCase()}. There is a constant temptation to treat God as the sponsor of your plans rather than the author of your life. This passage resists that. It asks something of you — attention, and then obedience — and it offers something far better than a smooth week in return.`,
  (ref: string, theme: string) =>
    `Today's passage is ${ref}, and it turns on ${theme.toLowerCase()}. Life is loud: notifications, deadlines, opinions, and a running commentary in the back of your mind. A verse like this one is quiet by comparison, which is exactly why it needs to be read on purpose rather than squeezed in. Give it the first few minutes of your attention rather than the leftovers.`,
  (ref: string, theme: string) =>
    `Open with ${ref}. The thread running through today's reading is ${theme.toLowerCase()}. You are building something with your days whether or not you have named it, and every builder is shaped by what he believes. So start with what God says rather than with what your feelings say, and let the second conversation be framed by the first.`,
];

const INSIGHTS = [
  "Notice that Scripture almost never separates the spiritual from the practical. The same book that tells you to trust God also tells you to work, plan, speak carefully, and keep your word. That is not a contradiction; it is a whole picture of a life lived before God. Faith is not a substitute for effort, and effort is not a substitute for faith. A maturing person does both without apology, holding real responsibility in one hand and real dependence in the other.",
  "One reason passages like this feel demanding is that they aim at the heart rather than the behavior. It is possible to do the right thing with the wrong motive and feel very responsible while quietly growing hard. God is after something deeper than a tidy record. He is after a person being formed into the likeness of Christ, and he is willing to use ordinary days to do the forming.",
  "It helps to remember that this verse was written to real people in real difficulty, not to an idealized believer with unlimited margin. Scripture was forged in scarcity, disappointment, and interruption. That is why it holds up when the plan changes or the news is bad. If God's word were only true when circumstances cooperated, it would be useless to almost everyone who has ever needed it, including you.",
  "There is a difference between knowing a verse and being changed by it. Most of us can quote more Scripture than we obey. The gap between the two is where most of the quiet frustration in the Christian life lives. Today, close the gap by an inch. Take the specific thing this passage asks and turn it into something a person could actually observe in your week — a conversation, a choice, an apology, a habit.",
  "God is not distant from the details you are managing. The same God who holds the stars is genuinely interested in how you handle an inbox, a disagreement, and a Tuesday. Small faithfulness is not beneath him; it is his usual method. He shapes a character the way a river shapes stone — not in a single dramatic moment but through steady, unremarkable, repeated passes over the same ground.",
  "Ask what this passage protects you from. Almost every command in Scripture is a fence around something valuable. Instructions about your words protect you from a life where people brace themselves before speaking to you; instructions about desire protect you from an appetite that can never be satisfied. Read the verse as a gift rather than a restriction, and the whole tone of obedience shifts from grim duty into gratitude.",
  "Consider how this truth will apply five years from now, not only today. Seasons end, and the same principles reappear wearing different clothes: a different job, a different city, a different set of pressures. What you learn in this stretch is not a temporary coping skill. It is the first draft of how you will meet everything that comes next, and it is being written now whether you are paying attention or not.",
  "Notice how much of Scripture assumes community. You were never intended to work this out alone as a private project with private conclusions. Wise counsel, honest friends, and a church family are not luxuries; they are part of God's design for keeping you from your own blind spots. Whatever this passage stirs up today is worth saying out loud to someone who loves you and will tell you the truth.",
  "Every command in a passage like this rests on grace that came first. You are not obeying in order to be accepted; you are obeying because you already are. That order matters enormously. A person working to earn love becomes fragile and defensive; a person secure in love can hear correction without collapsing. Let the security come first, and let the effort flow out of it rather than toward it.",
  "Be careful not to read this mainly as a word for someone else. That is the oldest trick in devotional reading: hearing a verse and immediately thinking of the person who really needs it. Take it personally first. Ask what it requires of you specifically, in your circumstances, this week, before you consider what it might mean for anyone around you.",
];

const APPLICATIONS = [
  "Turn today's reading into something concrete before you close this page. Vague intentions evaporate; specific ones survive. If the passage nudges you toward courage, name the conversation. If it nudges you toward restraint, name the thing you are putting down. If it nudges you toward diligence, name the task and the hour you will do it. Faith becomes visible at the exact point where it touches a calendar.",
  "Apply this to the part of your day you usually run on autopilot. The commute, the first ten minutes after you wake, the scroll before bed. Those unmanaged margins quietly shape your mood, your appetite, and your attention more than any single decision you will make today. Choose one of them and give it to God deliberately this week, and notice what changes in the rest of the day.",
  "Bring this to a relationship rather than only to yourself. Growth that stays private eventually curdles into self-focus. Who in your life could use the encouragement, the apology, the honest question, or the practical help that this passage prompts? Do that one thing today rather than adding it to a mental list that will still be there next month, unexamined and untouched.",
  "Let this shape how you handle failure this week. You will fall short of something you intended, and the important part is not the failure but the recovery time. Confess quickly, adjust the pattern rather than only the mood, and get back on the path the same day. Long detours are chosen, not required, and shame is the slowest possible route back to God.",
  "Take this into your work. Whatever you do today — paid, unpaid, seen, or unseen — can be done as an offering. That reframing does not make hard work easy, but it does make it meaningful. Pick one task you have been doing carelessly and do it with attention, as though God were the one receiving it, because in the deepest sense he is.",
  "Let this touch what you consume. Your mind is being formed constantly by what you read, watch, and listen to, and most of that formation happens without your consent because you never chose it deliberately. Audit one input today. Remove one thing that is making you anxious, cynical, or discontented, and replace it with something that is actually true, honorable, and worth thinking about.",
  "Turn this into a practice you can repeat weekly. Pick a time, sit down with your Bible and this reading, and ask three things: what changed, what is worrying me, and what am I thankful for. Fifteen minutes of that rhythm will do more for your growth than any single dramatic decision. Consistency is the underrated virtue, and it is available to anyone willing to keep showing up.",
  "Consider what this means for the people outside your usual circle. A faith that only serves your own improvement has missed something central. The time you have, the skills you have built, the table you can set — all of it can be aimed outward. Decide, before the habits harden, that your life will be a place where others are welcomed rather than merely a well-managed private project.",
  "Let this passage address the pressure of other people's expectations. Cultural assumptions and the quiet weight of what everyone else appears to be doing can steer a life without anyone deciding anything. You are allowed to say, kindly and clearly, that a particular path is not yours. Saying it once, early, is far easier than reversing a commitment later, and it teaches people how you make decisions.",
  "Take this into how you talk to yourself. Self-talk rarely stays neutral; it carries fear, history, and identity along with it. When the internal commentary turns harsh, name what is actually underneath it — I feel behind, I feel unseen, I feel unsafe. A person who can locate the real issue beneath the noise will resolve in twenty minutes what others carry for years.",
];

const PRAYERS = [
  "Pray before you move on. Father, thank you for meeting me here. Teach me to hold your word above my preferences and your timing above my plans. Give me honesty today, a generous heart, and steady hands with what you have entrusted to me. Where I am anxious, give peace; where I am careless, give attention. Build my life on you, and let it point people toward your goodness. Amen.",
  "Close in prayer, out loud, even briefly. Lord, I do not want to be someone who merely admires your word. Make me someone who does it. Show me the specific thing you are asking today and give me the courage to act on it before the day is over. Guard my tongue, steady my heart, soften whatever has gotten hard in me, and keep me grateful. I am yours. Amen.",
  "Pray simply and specifically. God, thank you for the strengths you have given me and for the weaknesses that keep me dependent. Where I am afraid, bring courage; where I am impatient, bring peace. Provide for every real need in this season, and keep me from confusing your provision with my own cleverness. Hold me in a love that outlasts every pressure I will meet today. Amen.",
  "End here, with open hands. Father, everything I am counting today came from you before it came to me. I give it back. Direct my time, my attention, and my ambition. Keep me from fear on the days things feel tight and from pride on the days they feel comfortable. Make me faithful in the little, and prepare me for the much. In Jesus' name, amen.",
  "Take a moment to pray for the place you live and the people in it. Lord, before anything else, be the center of it. Let it be marked by peace, honest words, quick forgiveness, and open doors. Fill it with more prayer than complaint and more laughter than tension. Whatever fills those rooms, let the foundation be you. Amen.",
  "Pray this slowly. God, I confess how easily I look sideways at other people's lives and forget what you have already given me. Forgive the comparison and the discontent. Teach me to be genuinely thankful today, and let that gratitude show up in how I speak and how I spend my hours. Great is your faithfulness to me. Amen.",
  "Finish with confession and thanks. Lord, I have not always been patient, gentle, or generous this week. Thank you that your mercies are new every morning. Meet me again today. Give me wisdom for the decisions in front of me, humility in the ones I am certain about, and joy in the ordinary work you have put in my hands. Amen.",
  "Pray before you close the page. Father, you know every worry I carry into this day. I hand them to you. Help me do the next faithful thing and leave the outcome with you. Make me quick to listen, slow to anger, and eager to serve. Let my life be a small, steady picture of how Christ loves his people. Amen.",
];

const wordCount = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;

function compose(id: number): Devotional {
  const v = VERSES.length;
  const verse = VERSES[id % v]!;
  const theme = THEMES[Math.floor(id / v) % THEMES.length]!;

  const opener = OPENERS[id % OPENERS.length]!(verse.ref, theme.title);
  const insight = INSIGHTS[(id * 3 + 1) % INSIGHTS.length]!;
  const themePara = theme.paragraphs[id % theme.paragraphs.length]!;
  const application = APPLICATIONS[(id * 7 + 4) % APPLICATIONS.length]!;
  const prayer = PRAYERS[(id * 5 + 2) % PRAYERS.length]!;

  const message = [opener, insight, themePara, application, prayer];
  const questions = theme.questions[(id * 2 + 1) % theme.questions.length]!;

  return {
    id,
    title: theme.title,
    reference: verse.ref,
    verse: verse.text,
    message,
    questions,
    words: message.reduce((n, p) => n + wordCount(p), 0),
  };
}

const cache = new Map<number, Devotional>();

export function getDevotional(id: number): Devotional {
  const key = ((id % TOTAL_DEVOTIONALS) + TOTAL_DEVOTIONALS) % TOTAL_DEVOTIONALS;
  let entry = cache.get(key);
  if (!entry) {
    entry = compose(key);
    cache.set(key, entry);
  }
  return entry;
}

/** Stable hash so an assigned devotional is the same on every device. */
export function idForDate(dateKey: string): number {
  let h = 2166136261;
  for (let i = 0; i < dateKey.length; i++) {
    h ^= dateKey.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h) % TOTAL_DEVOTIONALS;
}

export const todayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
