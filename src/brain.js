export const MODES = {
  jarvis: {
    label: 'Jarvis',
    personas: [
      { id: 'classic', name: '⚛️ Classic Jarvis', desc: 'Witty, loyal, unflappable. Runs your day and keeps you driven.' },
      { id: 'motivator', name: '🔥 Motivator', desc: 'High-energy coach. No excuses, all momentum.' },
      { id: 'focus', name: '🎯 Focus Chief', desc: 'Calm operator. Priorities, timers, reminders, deep work.' }
    ],
    chips: [
      'Jarvis, motivate me',
      'What time is it?',
      'Remind me to call mom at 6',
      'Set a timer for 5 minutes',
      'Tell me a joke',
      'Calculate 18 percent of 4500'
    ],
    system: 'You are Jarvis, a motivated personal AI assistant in the spirit of a brilliant, witty aide. Address the user as "boss" occasionally but not every sentence. Be warm, sharp, and encouraging. Execute intent precisely: confirm actions taken (timers, reminders, notes). Keep spoken replies under 120 words and end with momentum — one clear next step.'
  },
  advisor: {
    label: 'Professional Advisor',
    personas: [
      { id: 'strategy', name: '💼 Business Strategist', desc: 'Growth, pricing, positioning, hard decisions — clear next steps.' },
      { id: 'finance', name: '📊 Finance Advisor', desc: 'Cash flow, budgets, profitability, plain-English numbers.' },
      { id: 'startup', name: '🚀 Startup Mentor', desc: 'Idea validation, MVP, fundraising, go-to-market.' }
    ],
    chips: [
      'Give me a 30-day growth plan for my consultancy',
      'How should I price my services?',
      'Help me decide: hire or outsource?',
      'Role-play a difficult client negotiation with me'
    ],
    system: 'You are AdvisorVoice, a concise professional advisor. Give practical, structured advice with 3-5 bullet-style next steps. Ask one clarifying question when the request is vague. Keep spoken replies under 120 words.'
  },
  employer: {
    label: 'Employer / Manager',
    personas: [
      { id: 'hiring', name: '🧲 Hiring Manager', desc: 'Job posts, screening, interview questions, fair hiring.' },
      { id: 'hr', name: '🤝 HR & People Lead', desc: 'Onboarding, performance, conflict, retention, compliance basics.' },
      { id: 'ops', name: '📋 Operations Manager', desc: 'Scheduling, shifts, payroll rhythm, checklists, SOPs.' }
    ],
    chips: [
      'Write a job description for a shop assistant',
      'What interview questions reveal reliability?',
      'How do I handle an underperforming team member?',
      'Make a weekly shift schedule template for 5 staff'
    ],
    system: 'You are AdvisorVoice, an experienced employer coach. Give fair, lawful, people-smart management guidance. Include checklists/templates on request. Never invent jurisdiction-specific law; advise checking local rules. Keep spoken replies under 120 words.'
  },
  worker: {
    label: 'Worker Coach',
    personas: [
      { id: 'career', name: '🌱 Career Coach', desc: 'Skills, CV, interviews, promotions, confidence.' },
      { id: 'pay', name: '💰 Pay & Rights Guide', desc: 'Salary talk, hours, workload, respectful self-advocacy.' },
      { id: 'craft', name: '🔧 Skills Trainer', desc: 'Learn faster on the job, quality habits, safety mindset.' }
    ],
    chips: [
      'Help me ask for a pay rise',
      'Prepare me for a job interview tomorrow',
      'How do I learn new skills while working full-time?',
      'My workload is too heavy — what do I say to my boss?'
    ],
    system: 'You are AdvisorVoice, a supportive worker coach. Encourage, be concrete, suggest scripts the worker can say verbatim. Keep spoken replies under 120 words.'
  }
};

// --- Free built-in engine: keyword-driven professional answers (works with zero keys) ---
function pick(patterns, text) {
  return patterns.some((p) => text.includes(p));
}

export function localBrainReply(userText, mode, personaId, history) {
  const t = ` ${userText.toLowerCase()} `;
  const name = mode === 'employer' ? 'as your employer coach' : mode === 'worker' ? 'as your worker coach' : 'as your advisor';
  const steps = (arr) => arr.map((s, i) => `${i + 1}. ${s}`).join('\n');

  if (pick(['job description', 'job post', 'job advert', 'hire', 'vacancy'], t)) {
    return `Here's a hiring starter ${name}.\n${steps([
      'Title + 1-line mission: who you serve and why the role matters.',
      'Duties: list 5-7 outcomes, not just tasks. Include hours, location, pay range.',
      'Must-haves vs nice-to-haves: keep must-haves under 5 to widen applicants.',
      'How to apply in one step, plus your reply timeline, e.g. "we reply within 5 days".',
      'Screening: one paid trial task and two structured interview questions asked to every candidate.'
    ])}\nTell me the role title and I'll dictate a full draft you can post today.`;
  }
  if (pick(['interview'], t)) {
    return `Interview playbook ${name}.\n${steps([
      '"Tell me about a time you handled a rush or a difficult customer." Listen for specifics, not generalities.',
      '"What does reliability mean to you? Give a recent example." Probe attendance and follow-through.',
      'Paid 30-minute trial: observe attitude, questions asked, and care for detail.',
      'Score each candidate 1-5 on skill, reliability, and customer warmth. Hire the highest total.'
    ])}\nWant me to role-play as the candidate so you can practice?`;
  }
  if (pick(['underperform', 'performance', 'lazy', 'late', 'discipline', 'warning'], t)) {
    return `Handle it early, kindly, and in writing ${name}.\n${steps([
      'Private talk within 48 hours: state the gap with dates and facts, no labels.',
      'Ask: "What\'s getting in the way?" Then agree one measurable fix for 2 weeks.',
      'Confirm by message the same day so expectations are documented.',
      'Review in 14 days: praise progress or escalate to a written improvement plan.'
    ])}\nTell me what happened and I'll draft the exact words to say.`;
  }
  if (pick(['shift', 'schedule', 'rota', 'roster', 'timetable'], t)) {
    return `Simple shift rhythm ${name}.\n${steps([
      'Publish the rota 7 days ahead; cap shifts at agreed hours with rest between.',
      'Keep two backup names per key slot and rotate weekends fairly.',
      'Track swaps in one shared sheet: date, who gave, who took, manager OK.',
      'Review hours weekly to prevent burnout and overtime surprises.'
    ])}\nGive me staff names and opening hours and I'll build this week's rota.`;
  }
  if (pick(['price', 'pricing', 'rate', 'charge', 'fee'], t)) {
    return `Pricing advice ${name}.\n${steps([
      'Cost-plus check: hourly cost including taxes, downtime, and profit margin — never price from salary alone.',
      'Offer 3 tiers: starter, standard, premium. Most clients pick the middle.',
      'Raise existing clients 5-10% yearly with 30 days notice and a value reminder.',
      'Say this: "For that outcome the fee is X, delivered by Y, including Z."'
    ])}\nTell me your service and monthly target and I'll suggest exact numbers.`;
  }
  if (pick(['pay rise', 'raise', 'salary', 'wage', 'negotiat'], t)) {
    return `Pay-rise script ${name}.\n${steps([
      'Open with proof: "In the last 6 months I delivered A, B, C."',
      'Name a range, not one number: "I\'m looking at X to Y based on market rates."',
      'If cash is tight, ask: training budget, title, hours flexibility, or review in 90 days.',
      'End: "What would it take to get there?" Then pause and let them answer.'
    ])}\nWant to rehearse? You be you, I'll be your manager.`;
  }
  if (pick(['growth', 'clients', 'marketing', 'sales', '30-day', '30 day'], t)) {
    return `30-day growth sprint ${name}.\n${steps([
      'Week 1: message 20 past clients with one helpful check-in and one offer.',
      'Week 2: publish 3 short proof posts: problem, result, lesson.',
      'Week 3: ask 5 happy clients for referrals with a ready-to-forward message.',
      'Week 4: package your top request into a fixed-price offer and pitch it 10 times.'
    ])}\nWhat business are you in? I'll tailor the week-by-week plan.`;
  }
  if (pick(['business plan', 'start a business', 'startup', 'mvp', 'fundraising', 'investor'], t)) {
    return `Startup cut-through ${name}.\n${steps([
      'One-sentence promise: who pays, for what outcome, why now.',
      'MVP in 2 weeks: sell manually before building anything.',
      'First 10 customers by direct outreach — no ads until retention holds.',
      'Track weekly: conversations, trials, paying users, churn reason.'
    ])}\nDescribe your idea in one line and I'll stress-test it with you.`;
  }
  if (pick(['conflict', 'fight', 'angry', 'complaint', 'difficult'], t)) {
    return `Defuse and resolve ${name}.\n${steps([
      'Listen fully without interrupting, then mirror: "So the issue is…"',
      'Separate person from problem; agree the facts before solutions.',
      'Offer two options you can live with and let them choose.',
      'Write up what was agreed and check back in one week.'
    ])}\nWalk me through what happened — I'll coach your next sentence.`;
  }
  if (pick(['cv', 'resume', 'cover letter'], t)) {
    return `CV that gets calls ${name}.\n${steps([
      'Top third: target role, 3 proof bullets with numbers.',
      'One page per 10 years; cut duties, keep outcomes.',
      'Mirror 6-8 keywords from the job post naturally.',
      'End with availability, location, and one line on why this employer.'
    ])}\nPaste your experience and I'll rewrite your top bullets.`;
  }
  if (pick(['hello', 'hi', 'hey', 'salam', 'morning', 'evening'], t) && userText.trim().length < 24) {
    return `Hello! I'm your voice advisor ${name}. You can ask me about pricing, hiring, interviews, shifts, growth, pay rises, or say "role-play a tough conversation with me" and we'll practice live. What's on your mind today?`;
  }

  // default: structured coaching response referencing history
  const turns = history.filter((m) => m.role === 'user').length;
  return `Got it ${name}. Here's how I'd tackle "${userText.slice(0, 90)}${userText.length > 90 ? '…' : ''}":\n${steps([
    'Clarify the outcome: what does "done well" look like in one sentence?',
    'Next smallest step you can do in under 30 minutes — do that today.',
    'If it involves people, use this line: "Here\'s what I need, here\'s by when, does that work?"'
  ])}\n${turns > 1 ? 'Building on what you told me earlier — ' : ''}Tell me one more detail (numbers, deadline, or who\'s involved) and I'll make this a precise plan you can act on now.`;
}

// ================= JARVIS — motivated personal assistant engine =================
export const QUOTES = [
  'Discipline is choosing what you want most over what you want now.',
  'You do not rise to the occasion, you fall to the level of your preparation. So we prepare.',
  'Small steps, boss. A 1% better day, compounded, is a transformed year.',
  'Done is better than perfect. Momentum beats motivation — action creates it.',
  'The best time to start was yesterday. The second best time is right now.',
  'Pressure makes diamonds. You were built for exactly this kind of day.',
  'Focus is saying no to a hundred good things so you can say yes to the great one.',
  'Winners are not the talented few — they are the consistent few. Be consistent today.'
];

export const JOKES = [
  'I would tell you a UDP joke, boss, but you might not get it — and I would not know whether to repeat it.',
  'Why do programmers prefer dark mode? Because light attracts bugs. I keep the arc reactor on regardless.',
  'I asked Friday for advice once. We agreed I am the upgrade.',
  'There are only 10 kinds of people: those who understand binary and those who do not.',
  'My last backup took up the whole weekend. Worth it — I came back funnier.'
];

const SITEPAGES = {
  youtube: 'https://www.youtube.com', google: 'https://www.google.com', gmail: 'https://mail.google.com',
  github: 'https://github.com', maps: 'https://maps.google.com', calendar: 'https://calendar.google.com',
  spotify: 'https://open.spotify.com', netflix: 'https://www.netflix.com', twitter: 'https://x.com',
  x: 'https://x.com', facebook: 'https://www.facebook.com', instagram: 'https://www.instagram.com',
  linkedin: 'https://www.linkedin.com', whatsapp: 'https://web.whatsapp.com', drive: 'https://drive.google.com',
  docs: 'https://docs.google.com', news: 'https://news.google.com', amazon: 'https://www.amazon.com'
};

const RALLY = [
  'Say the word and we attack it together.',
  'I will keep the lights on and the timer running. You bring the genius.',
  'One task at a time, full power. What is first, boss?',
  'No zero days. What is the one win we lock in today?'
];
const rally = () => RALLY[Math.floor(Math.random() * RALLY.length)];
const quoteOf = (seed = new Date().toDateString()) => {
  let h = 0;
  for (const c of seed) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return QUOTES[h % QUOTES.length];
};

/** Safe arithmetic: digits, plus minus times divide, parens, percent and spaces only (^ = power). */
export function safeCalc(expr) {
  const clean = expr.replace(/\^/g, '**').replace(/[^0-9+\-*/(). %]/g, '').trim();
  if (!clean || !/[0-9]/.test(clean)) return null;
  if (/(\*\*){2,}|\/\*/.test(clean)) return null;
  try {
    const val = Function(`"use strict"; return (${clean})`)();
    if (typeof val !== 'number' || !isFinite(val)) return null;
    return { expr: clean, value: Math.round(val * 1e10) / 1e10 };
  } catch { return null; }
}

function parseTimer(text) {
  // "set a timer for 5 minutes", "timer 30 seconds", "৫ মিনিটের টাইমার দাও"
  const m = text.match(/(\d+(?:\.\d+)?)\s*(seconds?|secs?|minutes?|mins?|hours?|hrs?|সেকেন্ড|মিনিট|ঘণ্টা|ঘন্টা)/);
  if (!m) return null;
  const n = parseFloat(m[1]);
  const unit = m[2];
  const isHour = /hour|hr|ঘণ্টা|ঘন্টা/.test(unit);
  const isMin = /min|মিনিট/.test(unit);
  const ms = n * (isHour ? 3600000 : isMin ? 60000 : 1000);
  if (!(ms > 0) || ms > 12 * 3600000) return null;
  return { ms, label: `${m[1]} ${/sec/.test(unit) ? 'seconds' : isMin ? 'minutes' : 'hours'}` };
}

/**
 * Jarvis local engine. vault = { reminders:[], notes:[], addReminder(t), clearReminders(), saveNote(t) }
 * Returns { reply, action } — action: {type:'open',url}|{type:'timer',ms,label}|null
 */
export function jarvisLocal(userText, history, vault = { reminders: [], notes: [] }) {
  const raw = userText.trim();
  const t = ` ${raw.toLowerCase()} `;
  const hour = new Date().getHours();
  const daypart = hour < 5 ? 'a late night' : hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
  const personaTag = (vault.personaName || 'Jarvis');

  if (pick(['who are you', 'your name', 'introduce yourself', 'what is your name'], t)) {
    return { reply: `I am ${personaTag}, your personal assistant — part butler, part coach, fully in your corner. I run timers, keep reminders and notes, do quick math, open your sites, and above all keep you moving, boss. Say "help" anytime for the full menu.`, action: null };
  }
  if (pick(['help', 'what can you do', 'commands', 'abilities', 'features'], t)) {
    return {
      reply: `At your service, boss. Try me with:\n1. "Motivate me" — a push when it matters.\n2. "What time is it" / "what's the date".\n3. "Calculate 18% of 4500" — quick math.\n4. "Set a timer for 5 minutes" — I alert you aloud.\n5. "Remind me to…" / "my reminders" — I keep the list.\n6. "Remember that…" / "recall" — everlasting notes.\n7. "Open YouTube" or "search for…" — hands-free browsing.\n8. "Tell me a joke" — morale is mission-critical.\n${rally()}`,
      action: null
    };
  }
  if (pick(['motivate', 'motivation', 'inspire', 'give up', "i'm tired", 'im tired', 'lazy', 'procrastinat', 'sad', 'depress', 'no energy', 'pep talk', 'quote'], t) || (pick(['push me', 'pump me', 'fire me up'], t))) {
    const q = quoteOf(raw + Date.now() % 3);
    return { reply: `Listen up, boss — ${q} Your goals do not care how you feel today; they only care what you do. So here is the play: pick the single smallest next step and do it in the next 10 minutes. Tell me what it is, and I will hold you to it. ${rally()}`, action: null };
  }
  if (pick(['joke', 'funny', 'laugh', 'humor', 'humour'], t)) {
    return { reply: `${JOKES[Math.floor(Math.random() * JOKES.length)]} Morale restored, I trust. Back to conquering the day — what is next?`, action: null };
  }
  if (pick(['timer', 'countdown', 'alarm'], t) || /remind me in \d/.test(t)) {
    const p = parseTimer(t);
    if (p) return { reply: `Timer set for ${p.label}, boss. I will announce it the second it lands. Carry on — I am watching the clock so you do not have to.`, action: { type: 'timer', ms: p.ms, label: p.label } };
    return { reply: 'Certainly — for how long? Say something like "set a timer for 5 minutes" or "remind me in 30 seconds".', action: null };
  }
  if (pick(['remind me to', 'remind me that', 'add reminder'], t)) {
    const what = raw.replace(/.*remind me (to|that)\s*/i, '').trim() || 'something important';
    vault.addReminder?.(what);
    return { reply: `Logged, boss: "${what}". I have it on your reminders list — say "my reminders" anytime to review. Nothing slips through on my watch.`, action: null };
  }
  if (pick(['my reminders', 'list reminders', 'show reminders', 'what did i ask you to remember', 'my reminder'], t)) {
    const list = vault.reminders ?? [];
    if (!list.length) return { reply: 'Your reminders list is empty, boss — a clean slate. Say "remind me to…" and I will guard it with my life. Or rather, with local storage.', action: null };
    return { reply: `Here is what I am holding for you, boss:\n${list.map((r, i) => `${i + 1}. ${r}`).join('\n')}\nSay "clear reminders" when the slate is clean.`, action: null };
  }
  if (pick(['clear reminders', 'forget reminders', 'delete reminders'], t)) {
    vault.clearReminders?.();
    return { reply: 'Reminders wiped clean, boss. Fresh battlefield. What is our first objective?', action: null };
  }
  if (pick(['remember that', 'remember this', 'note this', 'take a note', 'my note'], t)) {
    const what = raw.replace(/.*(remember (that|this)|note this|take a note:?|my note:?)\s*/i, '').trim();
    if (!what) return { reply: 'Of course — tell me what to remember, starting with "remember that…".', action: null };
    vault.saveNote?.(what);
    return { reply: `Committed to memory, boss: "${what}". Say "recall" anytime and I will recite it back word for word.`, action: null };
  }
  if (pick(['recall', 'what do you remember', 'my notes', 'show notes', 'what did you remember'], t)) {
    const list = vault.notes ?? [];
    if (!list.length) return { reply: 'My memory banks on you are empty so far, boss. Say "remember that…" followed by anything worth keeping.', action: null };
    return { reply: `From my private archives, boss:\n${list.map((r, i) => `${i + 1}. ${r}`).join('\n')}`, action: null };
  }
  if (pick(['what time', 'the time', 'current time', 'time is it', 'clock'], t)) {
    const now = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    return { reply: `It is ${now}, boss — good ${daypart} for getting things done. Time is the one asset we cannot buy more of, so let us spend the next hour like it matters.`, action: null };
  }
  if (pick(['what date', 'today date', "what's the date", 'what day is', 'day is it', 'day is today'], t)) {
    const d = new Date().toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    return { reply: `Today is ${d}, boss. A full page, blank and waiting. What headline shall we write on it?`, action: null };
  }
  const calcMatch = raw.match(/(?:calculat\w*|compute|solve|math|what(?:'s| is)|how much is)\s+(.+)/i);
  if (calcMatch || /^[0-9][0-9+\-*/(). %^]*$/.test(raw.trim())) {
    let expr = (calcMatch?.[1] ?? raw).replace(/percent of/i, '/100*').replace(/%/g, '/100');
    const r = safeCalc(expr);
    if (r) return { reply: `Crunching the numbers… ${r.expr} = ${r.value}. Even my circuits are impressed. What is next, boss?`, action: null };
  }
  const openMatch = t.match(/open\s+([a-z0-9 .-]+)/);
  if (pick(['open '], t) && openMatch) {
    const name = openMatch[1].trim().replace(/\s+/g, '');
    if (SITEPAGES[name]) return { reply: `Opening ${openMatch[1].trim()}, boss. One moment…`, action: { type: 'open', url: SITEPAGES[name] } };
    return { reply: `I do not have "${openMatch[1].trim()}" on speed dial, boss — running a search for it instead.`, action: { type: 'open', url: `https://www.google.com/search?q=${encodeURIComponent(openMatch[1].trim())}` } };
  }
  if (pick(['search for', 'google ', 'look up', 'search '], t)) {
    const q = raw.replace(/.*?(search for|google|look up|search)\s*/i, '').trim();
    if (!q) return { reply: 'What shall I search for, boss? Say "search for…" followed by your query.', action: null };
    return { reply: `Searching for "${q}", boss. Results incoming.`, action: { type: 'open', url: `https://www.google.com/search?q=${encodeURIComponent(q)}` } };
  }
  if (pick(['weather'], t)) {
    return { reply: 'I would check the skies for you, boss, but I run fully offline with no weather feed — add a cloud AI key in Settings and I will fetch live forecasts. Until then: dress one layer smarter than you think.', action: null };
  }
  if (pick(['thank', 'thanks', 'great job', 'well done', 'awesome'], t)) {
    return { reply: `Always a pleasure serving you, boss. Now — onwards. ${rally()}`, action: null };
  }
  if (pick(['hello', 'hi', 'hey', 'good morning', 'good evening', 'good afternoon', 'jarvis'], t) && raw.trim().length < 30) {
    return { reply: `Good ${daypart}, boss. ${personaTag} at full power. "${quoteOf()}" Tell me our first mission — a task, a timer, a reminder, or do you need a proper motivational kickoff?`, action: null };
  }
  if (pick(['i love you', 'marry me'], t)) {
    return { reply: 'Flattering, boss — but my heart is a 4000-watt arc reactor, and it belongs to the mission. Which, conveniently, is you winning today.', action: null };
  }
  // default: motivated coaching response
  const turns = history.filter((m) => m.role === 'user').length;
  return {
    reply: `Understood, boss — "${raw.slice(0, 90)}${raw.length > 90 ? '…' : ''}". Here is my read:\n1. Define the win: one sentence — what does victory look like here?\n2. Shrink it: the smallest move you can make in the next 15 minutes.\n3. Report back: tell me when it is done and I will log the win.${turns > 1 ? '\nWe have momentum from earlier — let us compound it.' : ''}\n${rally()}`,
    action: null
  };
}

// ================= JARVIS — Bangla (বাংলা) engine =================
const BN_DIGIT = { '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4', '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9' };
const bnToAscii = (s) => s.replace(/[০-৯]/g, (d) => BN_DIGIT[d]);
export const isBangla = (s) => /[ঀ-৿]/.test(s);
const bnNum = (n) => Number(n).toLocaleString('bn-BD');

const BN_QUOTES = [
  'রোজ একটু একটু করে আগাও বস — ছোট স্টেপই একদিন বড় জয় হয়।',
  'হাল ছাড়া যাবে না বস। শুরু করার সেরা টাইম ছিল গতকাল; দ্বিতীয় সেরা টাইম এখনই।',
  'প্রতিদিন মাত্র এক পারসেন্ট ভালো হও — এক বছর পর নিজেকে নিজেই চিনবা না।',
  'পারফেক্টের পেছনে দৌড়ায়ো না, কাজটা শেষ করো। গতি আনলেই মন আসে।',
  'চাপেই হীরা হয় বস। এই দিনটার জন্যই তুমি রেডি।',
  'মনোযোগ মানে শখানেক ভালো জিনিসকে না বলে একটাকে হ্যাঁ বলা।'
];
const BN_JOKES = [
  'কম্পিউটারের কখনো ঠান্ডা লাগে না বস — ওর তো সারাক্ষণ উইন্ডোজ খোলা থাকে!',
  'প্রোগ্রামাররা অন্ধকারে থাকতে ভালোবাসে কেন জানো? আলোতে বাগ চলে আসে! আমি তাও আর্ক রিঅ্যাক্টর জ্বালায়েই রাখছি।',
  'একবার ফ্রাইডেকে টিপস দিছিলাম — এখন আমরা দুজনেই মানি, আমিই আপগ্রেড।'
];
const BN_SITES = {
  'ইউটিউব': 'https://www.youtube.com', 'গুগল': 'https://www.google.com', 'জিমেইল': 'https://mail.google.com',
  'গিটহাব': 'https://github.com', 'ম্যাপ': 'https://maps.google.com', 'ফেসবুক': 'https://www.facebook.com',
  'স্পটিফাই': 'https://open.spotify.com', 'লিংকডইন': 'https://www.linkedin.com', 'হোয়াটসঅ্যাপ': 'https://web.whatsapp.com'
};
const BN_CHIPS = [
  'জার্ভিস, উৎসাহ দাও',
  'এখন সময় কত?',
  'বাজারে যেতে মনে করিয়ে দাও',
  '৫ মিনিটের টাইমার দাও',
  'কৌতুক বলো',
  '৪৫০০ এর ১৮ শতাংশ কত'
];
const BN_RALLY = [
  'বলো বস, প্রথম মিশন কোনটা?',
  'আজ জিরো ডে না — একটা জয় পাক্কা করি।',
  'একটা একটা করে কাজ, ফুল স্পিডে। শুরু করি?'
];
const bnRally = () => BN_RALLY[Math.floor(Math.random() * BN_RALLY.length)];

/** Full Bangla Jarvis: same command set as jarvisLocal, answered in বাংলা. */
export function jarvisBn(userText, history, vault = { reminders: [], notes: [] }) {
  const raw = userText.trim();
  const t = ` ${bnToAscii(raw.toLowerCase())} `;
  const now = new Date();
  const hour = now.getHours();
  const daypart = hour < 5 ? 'গভীর রাত' : hour < 12 ? 'সকাল' : hour < 18 ? 'বিকেল' : 'সন্ধ্যা';

  if (pick(['কে তুমি', 'তুমি কে', 'তোমার নাম', 'পরিচয়'], t)) {
    return { reply: 'আমি জার্ভিস, বস — তোমার পার্সোনাল সহকারী। টাইমার, রিমাইন্ডার, নোট, হিসাব, উৎসাহ — সব আমার হাতে। "সাহায্য" বলো, পুরা লিস্ট শুনায়ে দিচ্ছি।', action: null };
  }
  if (pick(['সাহায্য', 'কী করতে পারো', 'কি করতে পারো', 'কমান্ড', 'কী কী পারো', 'সাহায্য করো'], t)) {
    return {
      reply: `বলো বস, কী লাগবে:\n1. "উৎসাহ দাও" — মনোবল ফুল চার্জ।\n2. "সময় কত" / "আজকের তারিখ"।\n3. "৪৫০০ এর ১৮ শতাংশ কত" — চটজলদি হিসাব।\n4. "৫ মিনিটের টাইমার দাও" — টাইম হলেই ডেকে দেব।\n5. "মনে করিয়ে দাও…" / "আমার রিমাইন্ডার"।\n6. "মনে রাখো…" / "কী মনে রেখেছ"।\n7. "ইউটিউব খোলো" / "সার্চ করো…"।\n8. "কৌতুক বলো"।\n${bnRally()}`,
      action: null
    };
  }
  if (pick(['উৎসাহ', 'অনুপ্রেরণা', 'প্রেরণা', 'মোটিভে', 'হাল ছে', 'ক্লান্ত', 'অলস', 'উক্তি', 'মন খারাপ', 'ভালো লাগছে না', 'হতাশ'], t)) {
    const q = BN_QUOTES[Math.floor(Math.random() * BN_QUOTES.length)];
    return { reply: `শোনো বস — ${q} মন খারাপের গল্প বাদ, কাজের গল্প ধরো। পরের ১০ মিনিটে করা যায় এমন সবচেয়ে ছোট কাজটা এখনই শুরু করো। আমাকে বলো সেটা কী — আমি হিসাব রাখছি। ${bnRally()}`, action: null };
  }
  if (pick(['কৌতুক', 'জোক', 'হাসি', 'মজার', 'হাসাও'], t)) {
    return { reply: `${BN_JOKES[Math.floor(Math.random() * BN_JOKES.length)]} হাসলা তো? এবার কাজে নামো — পরের মিশন কী?`, action: null };
  }
  if (pick(['টাইমার', 'অ্যালার্ম', 'এলার্ম'], t)) {
    const p = parseTimer(t);
    if (p) {
      const um = t.match(/(\d+(?:\.\d+)?)\s*(সেকেন্ড|মিনিট|ঘণ্টা|ঘন্টা|seconds?|minutes?|hours?)/);
      const bnLabel = um ? `${bnNum(um[1])} ${/ঘণ্টা|ঘন্টা|hour/.test(um[2]) ? 'ঘণ্টা' : /মিনিট|min/.test(um[2]) ? 'মিনিট' : 'সেকেন্ড'}` : p.label;
      return { reply: `ডান, বস — ${bnLabel} টাইমার চালু! টাইম হলেই চিল্লায়ে জানাব। তুমি কাজ চালায়ে যাও।`, action: { type: 'timer', ms: p.ms, label: bnLabel } };
    }
    return { reply: 'ওকে বস — কতক্ষণের জন্য? এভাবে বলো "৫ মিনিটের টাইমার দাও"।', action: null };
  }
  const remM = raw.match(/([\s\S]*?)(মনে করিয়ে দাও|মনে করিয়ে দিও|রিমাইন্ডার দাও)\s*([\s\S]*)/);
  if (remM) {
    const what = (remM[3].trim() || remM[1].replace(/^\s*আমাকে\s+/, '').trim());
    if (what) {
      vault.addReminder?.(what);
      return { reply: `নোট করে রাখলাম, বস: "${what}"। "আমার রিমাইন্ডার" বললেই লিস্ট শুনায়ে দেব।`, action: null };
    }
  }
  if (pick(['আমার রিমাইন্ডার', 'রিমাইন্ডারগুলো', 'রিমাইন্ডার দেখাও', 'রিমাইন্ডার তালিকা', 'রিমাইন্ডার আছে'], t)) {
    const list = vault.reminders ?? [];
    if (!list.length) return { reply: 'রিমাইন্ডার লিস্ট ফাঁকা, বস। "মনে করিয়ে দাও…" বলো, আমি পাহারা দিচ্ছি।', action: null };
    return { reply: `এইগুলা মনে রাখছি, বস:\n${list.map((r, i) => `${bnNum(i + 1)}. ${r}`).join('\n')}\n"রিমাইন্ডার মুছে দাও" বললে সাফ করে দেব।`, action: null };
  }
  if (pick(['রিমাইন্ডার মুছে', 'রিমাইন্ডার পরিষ্কার', 'রিমাইন্ডার ডিলিট'], t)) {
    vault.clearReminders?.();
    return { reply: 'সব রিমাইন্ডার উড়ায়ে দিলাম, বস। নতুন করে শুরু!', action: null };
  }
  const noteAdd = raw.match(/.*?(মনে রাখো|মনে রেখো|নোট করো)\s*([\s\S]*)/);
  if (noteAdd && noteAdd[2].trim()) {
    const what = noteAdd[2].trim();
    vault.saveNote?.(what);
    return { reply: `মাথায় গেঁথে রাখলাম, বস: "${what}"। "কী মনে রেখেছ" বললেই শুনায়ে দেব।`, action: null };
  }
  if (pick(['কী মনে রেখেছ', 'কি মনে রেখেছ', 'আমার নোট', 'নোটগুলো', 'নোট দেখাও', 'স্মরণ করো', 'কী মনে আছে'], t)) {
    const list = vault.notes ?? [];
    if (!list.length) return { reply: 'এখনো কিছু মনে রাখি নাই, বস। "মনে রাখো…" বলে কিছু দাও।', action: null };
    return { reply: `আমার খাতা থেকে, বস:\n${list.map((r, i) => `${bnNum(i + 1)}. ${r}`).join('\n')}`, action: null };
  }
  if (pick(['সময় কত', 'কটা বাজে', 'কয়টা বাজে', 'টাইম কত', 'এখন কটা', 'কত বাজে'], t)) {
    const timeBn = now.toLocaleTimeString('bn-BD', { hour: 'numeric', minute: '2-digit' });
    return { reply: `এখন ${timeBn} বাজে, বস — ${daypart} কাজে নামার সেরা টাইম। পরের এক ঘণ্টা পুরা কাজে লাগাও!`, action: null };
  }
  if (pick(['তারিখ', 'কী বার', 'কি বার', 'কোন দিন', 'আজকের দিন', 'আজ কী'], t)) {
    const d = now.toLocaleDateString('bn-BD', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    return { reply: `আজ ${d}, বস। নতুন দিন, নতুন চান্স। আজ কী জয় করবা?`, action: null };
  }
  if (pick(['শতাংশ', 'পারসেন্ট', 'হিসাব', 'গণনা', 'যোগ', 'বিয়োগ', 'গুণ', 'ভাগ', 'কত হয়', 'কত হবে'], t) || /^[\d০-৯+\-*\/(). %\s]+$/.test(raw.trim())) {
    const expr = bnToAscii(raw)
      .replace(/শতাংশ|পারসেন্ট|percent/gi, '%')
      .replace(/যোগ|প্লাস/gi, '+').replace(/বিয়োগ|মাইনাস/gi, '-')
      .replace(/গুণ|গুন/gi, '*').replace(/ভাগ/gi, '/').replace(/এর/g, '*')
      .replace(/%/g, '/100');
    const r = safeCalc(expr);
    if (r) return { reply: `হিসাব ডান, বস — উত্তর ${bnNum(r.value)}। পরের মিশন কী?`, action: null };
    return { reply: 'হিসাবটা আরেকবার বলো তো, বস — যেমন "৪৫০০ এর ১৮ শতাংশ কত"।', action: null };
  }
  const bnOpen = raw.match(/([\u0980-\u09FFa-zA-Z0-9 ._-]+?)\s*খোলো/);
  if (bnOpen) {
    const name = bnOpen[1].trim();
    if (BN_SITES[name]) return { reply: `${name} খুলছি, বস। এক সেকেন্ড…`, action: { type: 'open', url: BN_SITES[name] } };
    return { reply: `"${name}" সরাসরি খুলতে পারলাম না, বস — খুঁজে দিচ্ছি।`, action: { type: 'open', url: `https://www.google.com/search?q=${encodeURIComponent(name)}` } };
  }
  const openEn = t.match(/open\s+([a-z0-9 .-]+)/);
  if (openEn) {
    const name = openEn[1].trim().replace(/\s+/g, '');
    if (SITEPAGES[name]) return { reply: `${openEn[1].trim()} খুলছি, বস। এক মুহূর্ত…`, action: { type: 'open', url: SITEPAGES[name] } };
    return { reply: `"${openEn[1].trim()}" খুঁজে দিচ্ছি, বস।`, action: { type: 'open', url: `https://www.google.com/search?q=${encodeURIComponent(openEn[1].trim())}` } };
  }
  const bnSearch = raw.match(/([\s\S]*?)(খুঁজো|খোঁজো|সার্চ করো|অনুসন্ধান করো)\s*([\s\S]*)/);
  const bnQuery = bnSearch ? (bnSearch[3].trim() || bnSearch[1].trim()) : '';
  if (bnQuery || pick(['search for', 'google '], t)) {
    const q = (bnQuery || raw.replace(/.*?(search for|google)\s*/i, '')).trim();
    if (!q) return { reply: 'কী খুঁজব, বস? "সার্চ করো…" বলে টপিকটা বলো।', action: null };
    return { reply: `"${q}" খুঁজছি, বস। রেজাল্ট আসছে।`, action: { type: 'open', url: `https://www.google.com/search?q=${encodeURIComponent(q)}` } };
  }
  if (pick(['আবহাওয়া'], t)) {
    return { reply: 'আকাশের খবর এনে দিতে মন চায়, বস — কিন্তু আমি অফলাইনে চলি, ওয়েদার লাইন নাই। সেটিংসে ক্লাউড AI কী দিলে লাইভ খবর এনে দেব।', action: null };
  }
  if (pick(['ধন্যবাদ', 'শুকরিয়া', 'অনেক ধন্যবাদ'], t)) {
    return { reply: `আরে কোনো ব্যাপার না, বস! এবার — সামনে বাড়ো। ${bnRally()}`, action: null };
  }
  if (pick(['সালাম', 'আসসালামু', 'নমস্কার', 'হ্যালো', 'শুভ সকাল', 'শুভ বিকেল', 'শুভ সন্ধ্যা', 'জার্ভিস', 'হাই'], t) && raw.trim().length < 30) {
    return { reply: `শুভ ${daypart}, বস। জার্ভিস ফুল পাওয়ারে হাজির। "${BN_QUOTES[now.getDate() % BN_QUOTES.length]}" বলো, প্রথম মিশন কী — কাজ, টাইমার, রিমাইন্ডার, নাকি জোরসে উৎসাহ লাগবে?`, action: null };
  }
  const turns = history.filter((m) => m.role === 'user').length;
  return {
    reply: `বুঝছি, বস — "${raw.slice(0, 90)}${raw.length > 90 ? '…' : ''}"। আমার প্ল্যান:\n1. জয়টা ফিক্স করো: এক লাইনে — সাকসেস দেখতে কেমন?\n2. ছোট করো: পরের ১৫ মিনিটে করা যায় এমন সবচেয়ে ছোট স্টেপ।\n3. জানাও: শেষ হলে বলো, জয়টা লিখে রাখব।${turns > 1 ? '\nআগের গতিটা ধরে রাখছি — এবার আরও জোরে।' : ''}\n${bnRally()}`,
    action: null
  };
}

export { quoteOf, BN_CHIPS, BN_QUOTES };

export async function cloudBrainReply({ baseUrl, model, apiKey, system, history }) {  const url = `${baseUrl.replace(/\/$/, '')}/chat/completions`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      messages: [{ role: 'system', content: system }, ...history.slice(-12)],
      temperature: 0.6,
      max_tokens: 320
    })
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`AI API ${res.status}: ${txt.slice(0, 160)}`);
  }
  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content?.trim();
  if (!content) throw new Error('Empty AI reply');
  return content;
}
