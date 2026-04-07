'use client';

import { useState } from 'react';

interface Node {
  id: string;
  label: string;
  sublabel: string;
  group: 'onboarding' | 'dashboard' | 'daily' | 'weekly' | 'library';
  isNew?: boolean;
  desc: string;
  bullets: string[];
}

// Layout: columns × rows
// Onboarding: 4 nodes in a row
// Dashboard: spans full width
// Branch headers: 3 nodes in a row
// Rows 1-4: 3 columns (daily, weekly, library) — library only goes to row 2

const ONBOARDING: Node[] = [
  { id: 'landing',   label: 'Landing page',    sublabel: 'Hook + social proof',        group: 'onboarding',           desc: 'The entry point. Builds trust with a clear hook and social proof before asking anything.', bullets: ['Coaching context headline', 'Social proof / testimonial', 'Single CTA to begin'] },
  { id: 'identity',  label: 'Identity + goal', sublabel: 'One question · 3 goals',     group: 'onboarding', isNew: true, desc: 'Earns trust before depth. One identity question + 3 goal selections personalise the whole experience.', bullets: ['Core identity question', '3 goal selections', 'Personalises AI prompts'] },
  { id: 'firstcheckin', label: 'First check-in', sublabel: 'Earn trust before depth', group: 'onboarding',           desc: 'Abbreviated first check-in so the user feels the product before committing to the full daily routine.', bullets: ['Shortened morning format', 'Instant AI insight', '"You\'ll do this every day"'] },
  { id: 'schedule',  label: 'Schedule setting', sublabel: 'Set am + pm times',         group: 'onboarding', isNew: true, desc: 'Implementation intentions. Setting a specific time doubles follow-through (Gollwitzer, 1999).', bullets: ['Morning reminder time', 'Evening reminder time', 'Notification opt-in'] },
];

const DASHBOARD: Node = {
  id: 'dashboard', label: 'Dashboard · home', sublabel: 'Contextual CTA · streak counter · patterns view',
  group: 'dashboard', isNew: true,
  desc: 'The returning user\'s home. The CTA changes based on time of day and what\'s been completed — no static menu.',
  bullets: ['Time-aware contextual CTA', 'Streak counter', 'Today\'s completion ring', 'Patterns nudge on day 7+'],
};

interface BranchNode extends Node { rowLabel?: string; returnsHome?: boolean; }

const DAILY_HEADER: Node = { id: 'daily_header', label: 'Daily check-in', sublabel: '3 tabs: am · pm · score', group: 'daily', desc: 'One screen, three tabs. Morning, evening, and scorecard live together so completion feels like a ritual, not a checklist.', bullets: ['Single screen · 3 tabs', 'Progress indicator', 'Contextual tab activation'] };
const WEEKLY_HEADER: Node = { id: 'weekly_header', label: 'Weekly reset', sublabel: 'Every Sunday', group: 'weekly', desc: 'A dedicated Sunday ritual. Surfaces the week\'s data before asking questions so responses are grounded in evidence.', bullets: ['Triggered on Sunday', 'Data-first structure', 'Deep reflection format'] };
const LIBRARY_HEADER: Node = { id: 'library_header', label: 'Learn more', sublabel: '4 chapter library', group: 'library', desc: 'Framework education. Not a browse library — the relevant chapter surfaces contextually based on your lowest pillar.', bullets: ['4 framework chapters', 'Contextual surfacing', 'Pillar-linked content'] };

const ROWS: [BranchNode | null, BranchNode | null, BranchNode | null][] = [
  // Row 1
  [
    { id: 'morning',    label: 'Morning tab',         sublabel: 'Gratitude + 6 questions',  group: 'daily',   desc: 'Sets the day\'s intention. Gratitude primes pattern recognition, not toxic positivity. 6 questions build self-awareness.', bullets: ['Gratitude × 3 (pattern lens)', '6 morning questions', 'Identity declaration', 'Pre-decide trigger response'] },
    { id: 'databridge', label: 'Data bridge',          sublabel: 'Week\'s data summary',      group: 'weekly',  isNew: true, desc: 'Surfaces scorecard averages, lowest dimension, and recurring pattern flags before the reset questions begin.', bullets: ['Week\'s scorecard averages', 'Lowest scoring pillar', 'Recurring pattern flags', 'Respond to data not intuition'] },
    { id: 'ctx_chapter',label: 'Contextual chapter',  sublabel: 'By lowest pillar score',   group: 'library', isNew: true, desc: 'The library surfaces the most relevant chapter based on your lowest-scoring pillar — not a static browse experience.', bullets: ['Lowest pillar detection', 'Matched chapter suggestion', 'In-line reading format'] },
  ],
  // Row 2
  [
    { id: 'evening',    label: 'Evening tab',          sublabel: 'Reflection + alignment',   group: 'daily',   desc: 'Closes the day with honest reflection. Where did you show up? Where didn\'t you? What would you do differently?', bullets: ['Best moment of the day', 'Full alignment moment', 'Fell short reflection', 'What I\'d do differently'] },
    { id: 'reset7',     label: '7 reset sections',     sublabel: 'Inner game deep dive',     group: 'weekly',  desc: 'Seven deep-dive sections walk through the inner game dimensions — not a simple recap, a structured pattern review.', bullets: ['7 structured sections', 'Inner game dimensions', 'Pattern identification', 'Carry forward / leave behind'] },
    { id: 'chapters4',  label: '4 chapters',           sublabel: 'Frameworks + tools',       group: 'library', returnsHome: true, desc: 'Four chapters covering the full Inner Game Framework: The Mirror, The 6 Pillars, What Changes, The Commitment.', bullets: ['The Mirror', 'The 6 Pillars', 'What Actually Changes', 'The Commitment'] },
  ],
  // Row 3
  [
    { id: 'scorecard_d', label: 'Daily scorecard',    sublabel: '5 dimensions · 1–5 scale', group: 'daily',   desc: 'Rate the 5 inner game dimensions for the day. Color-coded 1–5 scale. Total out of 25 feeds the AI insight.', bullets: ['5 dimensions rated 1–5', 'Color: red / amber / green', 'Total feeds AI prompt', 'Historical trend stored'] },
    { id: 'scorecard_w', label: 'Weekly scorecard',   sublabel: '6 dimensions · 1–5 scale', group: 'weekly',  desc: 'Rate 6 dimensions for the week. Clarity, Ownership, Presence, Standards, Courage, Growth — the outer game of inner work.', bullets: ['6 dimensions rated 1–5', 'Clarity · Ownership · Presence', 'Standards · Courage · Growth', 'Week-over-week comparison'] },
    null,
  ],
  // Row 4
  [
    { id: 'ai_insight',    label: 'AI insight',       sublabel: 'Pattern observation',      group: 'daily',   isNew: true, desc: 'Claude generates a pattern observation — not an affirmation. Based on today\'s scorecard + last 7 days of data.', bullets: ['Pattern-based, not motivational', 'Uses 7-day context window', 'Surfaces a blind spot', '→ returns to Dashboard'] },
    { id: 'ai_reflection', label: 'AI reflection',    sublabel: 'Weekly pattern insight',   group: 'weekly',  isNew: true, desc: 'Claude synthesises 7 days of check-ins and scorecard data into a weekly pattern insight with a single coaching nudge.', bullets: ['Synthesises 7 days of data', 'One coaching nudge', 'Identifies growth edge', '→ returns to Dashboard'] },
    null,
  ],
];

const GROUP_COLOR = {
  onboarding: { bg: '#eeedf9', border: '#534ab7', text: '#3c3489', sub: '#534ab7', badge: false },
  dashboard:  { bg: '#e1f5ee', border: '#0f6e56', text: '#085041', sub: '#0f6e56', badge: true  },
  daily:      { bg: '#e6f1fb', border: '#185fa5', text: '#0c447c', sub: '#185fa5', badge: false },
  weekly:     { bg: '#faeedb', border: '#854f0b', text: '#633806', sub: '#854f0b', badge: false },
  library:    { bg: '#f1efe8', border: '#5f5e5a', text: '#444441', sub: '#5f5e5a', badge: false },
} as const;

const NEW_COLOR = '#D85A30';

function NodeBox({ node, onClick, selected }: { node: Node; onClick: () => void; selected: boolean }) {
  const c = GROUP_COLOR[node.group];
  return (
    <button
      onClick={onClick}
      className="w-full rounded-xl text-left transition-all duration-150 relative"
      style={{
        background: selected ? c.border : c.bg,
        border: `1px solid ${c.border}`,
        padding: '10px 12px',
        boxShadow: selected ? `0 0 0 3px ${c.border}33` : undefined,
      }}
    >
      {node.isNew && (
        <span className="absolute -top-2.5 -right-1 text-[9px] font-semibold text-white px-1.5 py-0.5 rounded-full" style={{ background: NEW_COLOR }}>new</span>
      )}
      <p className="text-[13px] font-medium leading-snug" style={{ color: selected ? '#fff' : c.text }}>{node.label}</p>
      <p className="text-[11px] leading-snug mt-0.5" style={{ color: selected ? 'rgba(255,255,255,0.75)' : c.sub }}>{node.sublabel}</p>
    </button>
  );
}

function DetailPanel({ node, onClose }: { node: Node; onClose: () => void }) {
  const c = GROUP_COLOR[node.group];
  return (
    <div className="rounded-2xl p-5 mt-4" style={{ background: c.bg, border: `1.5px solid ${c.border}` }}>
      <div className="flex items-start justify-between mb-2">
        <div>
          {node.isNew && <span className="text-[9px] font-semibold text-white px-1.5 py-0.5 rounded-full mr-2" style={{ background: NEW_COLOR }}>new</span>}
          <span className="text-[11px] font-medium uppercase tracking-widest" style={{ color: c.sub }}>{node.group}</span>
        </div>
        <button onClick={onClose} className="text-[18px] leading-none" style={{ color: c.sub }}>×</button>
      </div>
      <p className="text-[16px] font-semibold mb-1" style={{ color: c.text }}>{node.label}</p>
      <p className="text-[12px] mb-3" style={{ color: c.sub }}>{node.desc}</p>
      <ul className="space-y-1">
        {node.bullets.map((b, i) => (
          <li key={i} className="flex items-start gap-2 text-[12px]" style={{ color: c.text }}>
            <span style={{ color: c.border }}>›</span> {b}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function FlowPage() {
  const [selected, setSelected] = useState<Node | null>(null);

  const pick = (n: Node) => setSelected(s => s?.id === n.id ? null : n);

  const Arrow = ({ vertical = true }) => (
    <div className="flex justify-center my-1">
      {vertical
        ? <span className="text-[16px]" style={{ color: '#73726c' }}>↓</span>
        : <span className="text-[16px]" style={{ color: '#73726c' }}>→</span>
      }
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: '#f8f7f4', fontFamily: 'system-ui, sans-serif' }}>
      <div className="max-w-2xl mx-auto px-4 pt-8 pb-16">

        {/* Header */}
        <p className="text-[10px] tracking-[0.14em] uppercase mb-1" style={{ color: '#73726c' }}>Inner Game Journal</p>
        <h1 className="text-[22px] font-semibold mb-1" style={{ color: '#1a1a18' }}>App Flow</h1>
        <p className="text-[12px] mb-6" style={{ color: '#73726c' }}>Tap any node for details · Dashed = return to Dashboard</p>

        {/* ONBOARDING */}
        <p className="text-[10px] tracking-[0.14em] uppercase mb-2 text-center" style={{ color: '#73726c', opacity: 0.6 }}>Onboarding · one time only</p>
        <div className="grid grid-cols-4 gap-2">
          {ONBOARDING.map((n, i) => (
            <div key={n.id} className="relative">
              <NodeBox node={n} onClick={() => pick(n)} selected={selected?.id === n.id} />
              {i < 3 && (
                <div className="absolute top-1/2 -right-1.5 -translate-y-1/2 z-10 text-[10px]" style={{ color: '#73726c' }}>→</div>
              )}
            </div>
          ))}
        </div>

        <Arrow />

        {/* RETURNING USERS NOTE */}
        <p className="text-center text-[11px] mb-1" style={{ color: '#73726c', opacity: 0.45 }}>↑ returning users start here</p>

        {/* DASHBOARD */}
        <NodeBox node={DASHBOARD} onClick={() => pick(DASHBOARD)} selected={selected?.id === DASHBOARD.id} />

        {/* T-bar connector */}
        <div className="relative my-2 h-6">
          <div className="absolute left-1/2 top-0 bottom-0 w-px" style={{ background: 'rgba(31,30,29,0.2)' }} />
          <div className="absolute top-1/2 left-[16.67%] right-[16.67%] h-px" style={{ background: 'rgba(31,30,29,0.2)' }} />
          {[0, 1, 2].map(i => (
            <div key={i} className="absolute bottom-0 w-px h-3" style={{ left: `${16.67 + i * 33.33}%`, background: 'rgba(31,30,29,0.2)' }} />
          ))}
        </div>

        {/* BRANCH HEADERS */}
        <div className="grid grid-cols-3 gap-3 mb-2">
          {[DAILY_HEADER, WEEKLY_HEADER, LIBRARY_HEADER].map(n => (
            <NodeBox key={n.id} node={n} onClick={() => pick(n)} selected={selected?.id === n.id} />
          ))}
        </div>

        {/* ROWS */}
        {ROWS.map((row, ri) => (
          <div key={ri}>
            {/* Arrow row */}
            <div className="grid grid-cols-3 gap-3 my-1">
              {row.map((n, ci) => (
                <div key={ci} className="flex justify-center">
                  {n ? <span className="text-[14px]" style={{ color: '#73726c' }}>↓</span> : null}
                </div>
              ))}
            </div>
            {/* Node row */}
            <div className="grid grid-cols-3 gap-3">
              {row.map((n, ci) => (
                <div key={ci} className="relative">
                  {n ? (
                    <>
                      <NodeBox node={n} onClick={() => pick(n)} selected={selected?.id === n.id} />
                      {n.returnsHome && (
                        <p className="text-center text-[10px] mt-1" style={{ color: '#73726c', opacity: 0.45 }}>↻ returns to home</p>
                      )}
                    </>
                  ) : (
                    ri === 1 && ci === 2 ? (
                      <p className="text-center text-[11px] pt-6" style={{ color: '#73726c', opacity: 0.35 }}>↻ returns to home</p>
                    ) : null
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Return loop indicators */}
        <div className="grid grid-cols-3 gap-3 mt-2">
          <p className="text-center text-[10px]" style={{ color: '#73726c', opacity: 0.45 }}>- - → Dashboard</p>
          <p className="text-center text-[10px]" style={{ color: '#73726c', opacity: 0.45 }}>- - → Dashboard</p>
          <p />
        </div>

        {/* Detail panel */}
        {selected && <DetailPanel node={selected} onClose={() => setSelected(null)} />}

        {/* Legend */}
        <div className="mt-8 pt-4 flex flex-wrap gap-x-4 gap-y-2" style={{ borderTop: '1px solid rgba(31,30,29,0.12)' }}>
          <p className="text-[11px] w-full mb-1" style={{ color: '#73726c', opacity: 0.55 }}>Legend</p>
          {(['onboarding', 'dashboard', 'daily', 'weekly', 'library'] as const).map(g => (
            <div key={g} className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm" style={{ background: GROUP_COLOR[g].bg, border: `1px solid ${GROUP_COLOR[g].border}` }} />
              <span className="text-[11px] capitalize" style={{ color: '#73726c' }}>{g}</span>
            </div>
          ))}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px]" style={{ color: NEW_COLOR, fontWeight: 600 }}>● new</span>
            <span className="text-[11px]" style={{ color: '#73726c' }}>Added in v2</span>
          </div>
        </div>
      </div>
    </div>
  );
}
