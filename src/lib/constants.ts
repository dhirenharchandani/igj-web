export const PILLARS = [
  {
    id: 'self_awareness',
    name: 'Self-Awareness',
    desc: 'Know what\'s actually running you — not the story, the signal.',
    iconBg: '#EEEDFE',
    iconColor: '#534AB7',
    darkIconBg: 'rgba(83,74,183,0.15)',
  },
  {
    id: 'self_talk',
    name: 'Self-Talk',
    desc: 'The voice in your head is either your coach or your critic. You choose.',
    iconBg: '#E1F5EE',
    iconColor: '#0F6E56',
    darkIconBg: 'rgba(15,110,86,0.15)',
  },
  {
    id: 'identity_beliefs',
    name: 'Identity & Beliefs',
    desc: 'You don\'t rise to your goals. You fall to your self-concept.',
    iconBg: '#FAEEDA',
    iconColor: '#854F0B',
    darkIconBg: 'rgba(133,79,11,0.15)',
  },
  {
    id: 'emotional_regulation',
    name: 'Emotional Regulation',
    desc: 'Feel it. Name it. Don\'t be owned by it.',
    iconBg: '#FAECE7',
    iconColor: '#993C1D',
    darkIconBg: 'rgba(153,60,29,0.15)',
  },
  {
    id: 'focus_intentionality',
    name: 'Focus & Intentionality',
    desc: 'Where attention goes, energy flows. Direct it deliberately.',
    iconBg: '#E6F1FB',
    iconColor: '#185FA5',
    darkIconBg: 'rgba(24,95,165,0.15)',
  },
  {
    id: 'resilience_growth',
    name: 'Resilience & Growth',
    desc: 'The setback is the data. Use it.',
    iconBg: '#FBEAF0',
    iconColor: '#993556',
    darkIconBg: 'rgba(153,53,86,0.15)',
  },
];

export const ASSESSMENT_CATEGORIES = [
  { id: 'body_energy', icon: '⚡', bg: '#E1F5EE', name: 'Body & Energy', desc: 'I manage my physical state as a performance asset. Sleep, movement, and nutrition are the foundation everything else is built on.' },
  { id: 'mind_dialogue', icon: '🧠', bg: '#EEEDFE', name: 'Mind & Inner Dialogue', desc: 'I\'m aware of the voice in my head. I don\'t believe every thought. I direct my mental state — I don\'t just react to it.' },
  { id: 'intimacy_presence', icon: '🤝', bg: '#FAECE7', name: 'Intimacy & Presence', desc: 'My closest relationship gets my real presence, not my leftovers. I show up with depth, not just proximity.' },
  { id: 'family_roots', icon: '🏠', bg: '#FAEEDA', name: 'Family & Roots', desc: 'I\'m building connection, not just coexisting. My family knows I\'m in their corner — not just when it\'s easy.' },
  { id: 'circle_influence', icon: '🌐', bg: '#E6F1FB', name: 'Circle & Influence', desc: 'The people around me raise the standard. I invest in relationships that challenge and expand me.' },
  { id: 'purpose_impact', icon: '🎯', bg: '#FBEAF0', name: 'Purpose & Impact', desc: 'My work is an expression of something real. Not just executing tasks — building something that matters.' },
  { id: 'experiences_aliveness', icon: '🌍', bg: '#EAF3DE', name: 'Experiences & Aliveness', desc: 'I\'m creating a life worth living, not just managing one. I make space for joy, adventure, and aliveness.' },
  { id: 'inner_alignment', icon: '🔥', bg: '#FAECE7', name: 'Inner Alignment', desc: 'My actions match my values. I\'m not performing a version of myself — I\'m living as one. Congruent. Grounded. Present.' },
  { id: 'wealth_responsibility', icon: '💰', bg: '#FAEEDA', name: 'Wealth & Responsibility', desc: 'I take full ownership of my financial reality. Building, not spending. Creating, not just earning.' },
  { id: 'growth_curiosity', icon: '📚', bg: '#EEEDFE', name: 'Growth & Curiosity', desc: 'I\'m always in the game of becoming. I seek feedback. I question assumptions. My identity is a learner.' },
];

export const MORNING_QUESTIONS = [
  { id: 'q1', num: '01', text: 'The one thing that will make today matter is...', placeholder: 'Be specific. Not a task — a meaning.' },
  { id: 'q2', num: '02', text: 'The identity I\'m stepping into today is... and it means...', placeholder: 'Who are you choosing to be today?' },
  { id: 'q3', num: '03', text: 'Who needs the best version of me today, and what does that look like?', placeholder: 'Name them. Describe it.' },
  { id: 'q4', num: '04', text: 'What could knock me off my inner game today...', placeholder: 'Anticipate it honestly.' },
  { id: 'q5', num: '05', text: 'One person I\'ll make feel seen today is...', placeholder: 'And how — specifically.' },
  { id: 'q6', num: '06', text: 'The one move today that reflects who I\'m becoming...', placeholder: 'Not your busiest task. Your most meaningful one.' },
  { id: 'q7', num: '07', text: 'Where I\'ll stretch past what\'s comfortable today...', placeholder: 'Small edge or big leap — name it.' },
  { id: 'q8', num: '08', text: 'What my inner coach needs me to remember today...', placeholder: 'Write it like it\'s coming from your wisest self.' },
  { id: 'q9', num: '09', text: 'What I\'m building that I can\'t lose sight of...', placeholder: 'The long game. Not today\'s noise.' },
  { id: 'q10', num: '10', text: 'Tonight, I\'ll know I won the inner game if I...', placeholder: 'Define your win before the day defines it for you.' },
];

export const EVENING_QUESTIONS = [
  { id: 'q1', num: '01', text: 'The moment today I was most present for...', placeholder: 'Where were you fully in it?' },
  { id: 'q2', num: '02', text: 'Where I showed up as my best self today...', placeholder: 'Own the win. It matters.' },
  { id: 'q3', num: '03', text: 'The insight today I don\'t want to lose...', placeholder: 'What shifted? What landed?' },
  { id: 'q4', num: '04', text: 'If I could replay today with full awareness, I\'d change...', placeholder: 'Not self-punishment — self-data.' },
  { id: 'q5', num: '05', text: 'What I held back today that I wish I\'d given...', placeholder: 'Presence, honesty, energy, kindness — what went ungiven?' },
  { id: 'q6', num: '06', text: 'What my inner coach says about how I showed up today...', placeholder: 'Honest. Constructive. No hiding.' },
];

export const SCORECARD_ITEMS = [
  { id: 'awareness', name: 'Awareness', desc: 'I knew what was actually driving me today.' },
  { id: 'intention', name: 'Intention', desc: 'I acted from purpose, not just reaction.' },
  { id: 'state', name: 'State', desc: 'I managed my inner state, not just my schedule.' },
  { id: 'presence', name: 'Presence', desc: 'I gave my real self to the people around me.' },
  { id: 'ownership', name: 'Ownership', desc: 'I held myself fully accountable today.' },
  { id: 'authenticity', name: 'Authenticity', desc: 'I said and did what was true for me.' },
];
