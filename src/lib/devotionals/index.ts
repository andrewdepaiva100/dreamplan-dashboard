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

export const TOTAL_DEVOTIONALS = 1000;

const OPENERS = [
  (ref: string, theme: string) =>
    `Read ${ref} slowly, twice, out loud if you can. Today's reading is about ${theme.toLowerCase()}, and it is worth sitting with before you rush into the day's list. Scripture rarely lands on a heart that is skimming. Let the words settle for a moment: not as a task to be completed, but as God speaking directly into the season the two of you are actually living in right now, with all of its excitement and all of its unfinished edges.`,
  (ref: string, theme: string) =>
    `${ref} is a short passage with a long shadow. Its subject today is ${theme.toLowerCase()}, and it speaks with unusual directness to a couple standing where you are standing \u2014 engaged, planning, counting, hoping. Before you read the reflection below, take thirty seconds of quiet. Ask God to show you the one sentence he wants each of you to carry into today, and be honest if it is not the sentence you were hoping for.`,
  (ref: string, theme: string) =>
    `Andrew and Maria, today's verse is ${ref}, and its theme is ${theme.toLowerCase()}. Reading Scripture together is one of the simplest habits you can build in this season and one of the most durable. It costs a few minutes and it slowly reshapes how you think about time, money, conflict, and each other. Begin here, with the text itself, before you begin with your opinions about it.`,
  (ref: string, theme: string) =>
    `Take ${ref} as today's starting point. The theme is ${theme.toLowerCase()}. There is a particular temptation during engagement to treat God as the sponsor of your plans rather than the author of your life together. This passage resists that. It asks for something from you \u2014 attention, and then obedience \u2014 and it offers something far better than a smooth timeline in return.`,
  (ref: string, theme: string) =>
    `Today's passage is ${ref}, and it turns on ${theme.toLowerCase()}. Engagement is a loud season: vendors, dates, deposits, family opinions, and a running total in the back of your mind. A verse like this one is quiet by comparison, which is exactly why it needs to be read on purpose rather than squeezed in. Give it the first few minutes of your attention rather than the leftovers.`,
  (ref: string, theme: string) =>
    `Open with ${ref}. The theme running through today's reading is ${theme.toLowerCase()}. You are building something together right now \u2014 a wedding, a home, a shared set of habits \u2014 and every building project is shaped by what the builders believe. So start with what God says rather than with what the spreadsheet says, and let the second conversation be framed by the first.`,
];

const INSIGHTS = [
  "Notice that Scripture almost never separates the spiritual from the practical. The same book that tells you to trust God also tells you to count, save, plan, and pay what you owe. That is not a contradiction; it is a whole picture of a life lived before God. Faith is not a substitute for arithmetic, and arithmetic is not a substitute for faith. The wise couple does both without apology, holding a real plan in one hand and real dependence in the other.",
  "One reason passages like this feel demanding is that they are aimed at the heart rather than the behavior. It is possible to do the right thing with the wrong motive and feel very responsible while quietly growing hard. God is after something deeper than a balanced budget or a peaceful wedding day. He is after two people who are being formed into the likeness of Christ, and he is willing to use ordinary logistics to do the forming.",
  "It helps to remember that this verse was written to real people in real difficulty, not to an idealized couple with unlimited margin. Scripture was forged in scarcity, disappointment, and interruption. That is why it holds up when the vendor changes the price or the timeline slips. If God's word were only true when circumstances cooperated, it would be useless to almost everyone who has ever needed it, including the two of you.",
  "There is a difference between knowing a verse and being changed by it. Most of us can quote more Scripture than we obey. The gap between the two is where most of the quiet frustration in the Christian life lives. Today, close the gap by an inch. Take the specific thing this passage asks and turn it into something a person could actually observe in your week \u2014 a conversation, a transfer, a choice, an apology.",
  "God is not distant from the details you are managing. The same God who holds the stars is genuinely interested in how the two of you handle a deposit, a disagreement, and a Tuesday. Small faithfulness is not beneath him; it is his usual method. He builds character in a marriage the way a river shapes stone \u2014 not in a single dramatic moment but through steady, unremarkable, repeated passes over the same ground.",
  "Ask what this passage protects you from. Almost every command in Scripture is a fence around something valuable. Instructions about money protect you from the anxiety of never having enough; instructions about words protect you from a home where people brace themselves before speaking. Read the verse as a gift rather than a restriction, and the whole tone of obedience changes from grim duty into gratitude.",
  "Consider how this truth will apply five years from now, not just today. Engagement seasons end, and the same principles reappear wearing different clothes: a mortgage instead of a lease, a child's needs instead of a guest list, a career decision instead of a venue. What you learn in this stretch is not a temporary skill for wedding planning. It is the first draft of how the two of you will handle everything that comes next.",
  "Notice how much of Scripture assumes community. You are not intended to work this out alone as a private couple with a private plan. Wise counsel, older married friends, and a church family are not luxuries; they are part of God's design for keeping you from your own blind spots. Whatever this passage stirs up today is worth saying out loud to someone who loves you both and will tell you the truth.",
  "Every command in a passage like this rests on grace that came first. You are not obeying in order to be accepted; you are obeying because you already are. That order matters enormously in marriage. A person who is working to earn love becomes fragile and defensive; a person who is secure in love can hear correction without collapsing. Let the security come first, then let the effort flow out of it.",
  "Be careful not to read this only as a word for your fianc\u00e9. That is the oldest trick in devotional reading: hearing a verse and immediately thinking of the other person's need for it. Take it personally first. Ask what it requires of you specifically \u2014 Andrew for Andrew, Maria for Maria \u2014 before you consider anything it might mean for the two of you together.",
];

const APPLICATIONS = [
  "Bring this into the plan you already have on paper. You are tracking a wedding budget, six installments, a lease reserve, a furnishing tier, and a twenty-thousand-dollar emergency fund. Those numbers are not spiritually neutral; they are a record of what you have decided matters. Open the dashboard together after this reading and ask one honest question of it: does the way we are spending match the way we say we believe? Change one line if the answer is no.",
  "Put a number on today's obedience. Vague intentions evaporate; specific ones survive. If the passage nudges you toward generosity, name the amount and the recipient before you close this page. If it nudges you toward restraint, name the purchase you are letting go. If it nudges you toward diligence, name the transfer you will make this week and the date it will happen. Faith becomes visible at the point where it touches a calendar or an account.",
  "Think about the apartment you are preparing to fill. Every piece of furniture will eventually wear out, but the atmosphere you establish in those rooms will outlast all of it. Decide now what your home will be known for \u2014 peace, honesty, hospitality, laughter, prayer before hard conversations. Furnishing a home is largely a matter of taste and budget. Establishing a household is a matter of the decisions the two of you make repeatedly when nobody else is watching.",
  "Apply this to the wedding-day pressure specifically. There will be moments in the next months when the cost of one detail feels like a referendum on whether you are doing this right. It is not. The ceremony is one day; the covenant is the rest of your lives. Let today's passage set the proportion. Spend generously on what will still matter in ten years, and spend cautiously on what will be forgotten by the following weekend.",
  "Let this shape how you handle your monthly overhead. The small recurring costs are where money quietly disappears \u2014 a subscription here, a habit there, none of them scandalous, all of them permanent until someone cancels them. Review the recurring list together in light of this passage and ask whether each item is still serving the life you are trying to build, or whether it simply survived because nobody questioned it.",
  "Bring this to your savings milestones. Every reserve you are building \u2014 the lease deposit, the furnishing budget, the emergency fund \u2014 exists to buy you something more valuable than the money itself: the freedom to make decisions out of wisdom rather than panic. Naming that out loud makes the discipline feel less like deprivation. You are not withholding from yourselves; you are purchasing the ability to be calm later.",
  "Turn this into a practice you can repeat weekly. Pick one evening, sit down together with the numbers and this devotional, and ask three things: what changed, what worried us, and what are we thankful for. Fifteen minutes of that rhythm will do more for your marriage than any single large decision. Consistency is the underrated virtue in both finance and faith, and it is available to anyone willing to keep showing up.",
  "Consider what this means for the people outside your household. A marriage is not meant to be a closed circuit. The savings you are building, the table you will set, the spare room you may one day have \u2014 all of it can be aimed outward. Decide in this season, before the habits harden, that your home will be a place where others are fed and welcomed rather than merely a well-managed private project.",
  "Let this passage address the pressure of other people's expectations. Family opinions, cultural expectations, and the quiet weight of what other couples have done can push a budget upward without anyone deciding anything. You are allowed to say, kindly and clearly, that a particular expense is not right for you. Doing so once, early, is far easier than reversing a commitment later, and it teaches everyone how the two of you make decisions.",
  "Take this into how you talk about money with each other. Money conversations rarely stay about money; they carry fear, family history, and identity along with them. When the topic gets hot, name what is actually underneath it \u2014 I feel unsafe, I feel unseen, I feel behind. A couple that can locate the real issue underneath the dollar amount will resolve in twenty minutes what other couples argue about for years.",
];

const PRAYERS = [
  "Pray together before you move on. Father, thank you for bringing us to each other and to this season. Teach us to hold your word above our preferences and your timing above our plans. Give us honest conversations today, generous hearts, and steady hands with what you have entrusted to us. Where we are anxious, give peace; where we are careless, give attention. Build our home on you, and let our marriage point people toward your goodness. Amen.",
  "Close in prayer, out loud, even briefly. Lord, we do not want to be a couple that merely admires your word. Make us people who do it. Show each of us the specific thing you are asking today and give us the courage to act on it before the day is over. Guard our tongues, steady our finances, soften whatever has gotten hard between us, and keep us grateful. We are yours, together. Amen.",
  "Pray for each other by name. God, thank you for Andrew and for Maria \u2014 for the strengths in each that the other needs. Where one is afraid, let the other bring courage; where one is impatient, let the other bring peace. Provide for every need in this season, and let neither of us confuse your provision with our own cleverness. Bind us together in love that outlasts every pressure. Amen.",
  "End here, with open hands. Father, everything we are counting today came from you before it came to us. We give it back. Direct our spending, our saving, and our giving. Keep us from fear on the days the numbers feel tight and from pride on the days they feel comfortable. Make us faithful in the little, and prepare us for the much. In Jesus' name, amen.",
  "Take a moment to pray for your future home. Lord, before we hold the keys, we ask you to be the center of that place. Let it be a house of peace, of honest words, of quick forgiveness, and of open doors. Fill it with more prayer than complaint and more laughter than tension. Whatever we furnish it with, let its foundation be you. Amen.",
  "Pray this together slowly. God, we confess how easily we look sideways at other people's lives and forget what you have already given us. Forgive the comparison and the discontent. Teach us to be genuinely thankful today, and let that gratitude show up in how we speak to each other and how we handle our money. Great is your faithfulness to us. Amen.",
  "Finish with confession and thanks. Lord, we have not always been patient, gentle, or generous with each other this week. Thank you that your mercies are new every morning. Meet us again today. Give us wisdom for the decisions in front of us, unity in the ones we disagree about, and joy in the ordinary work of preparing for our life together. Amen.",
  "Pray before you close the page. Father, you know every number, every date, and every worry we carry into this day. We hand them to you. Help us do the next faithful thing and leave the outcome with you. Make us quick to listen, slow to anger, and eager to serve each other. Let our marriage be a small, steady picture of how Christ loves his people. Amen.",
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

/** Stable hash so both phones land on the same devotional for the same day. */
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
