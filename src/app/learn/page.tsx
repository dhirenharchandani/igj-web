'use client'

import { useState } from 'react'
import Link from 'next/link'
import { BottomNav } from '@/components/layout/BottomNav'

const CHAPTERS = [
  {
    num: 1, tag: 'Foundation', title: 'The Mirror',
    oneline: 'See the patterns running underneath your decisions.',
    content: [
      'This is not a journal. This is a mirror. A system. A daily confrontation with who you are… and who you\'re becoming. Because here\'s the truth most people avoid: You don\'t get the life you want. You get the life your patterns create.',
      'A pattern is a repeated behavior driven by an unconscious belief or emotional response. It runs without your permission. The first job of inner work is to make the unconscious conscious.',
      'Most journaling processes emotions. This journal examines them. The questions aren\'t therapeutic — they\'re diagnostic. Designed to surface what\'s running underneath, not just what you\'re feeling on the surface.',
      'The check-in is not a performance. The scorecard is not a grade. Both are data. Your job is to look clearly — without defensiveness, without self-attack. Just honest observation.',
    ],
    closing: 'The person who can see themselves clearly has an enormous advantage over the person who can\'t. That\'s the work.',
    cta: { label: 'Apply this to your next check-in →', href: '/checkin/morning' },
  },
  {
    num: 2, tag: 'Identity', title: 'What Changes',
    oneline: 'How the daily rhythm creates the evidence identity needs.',
    content: [
      'Identity doesn\'t change through insight. It changes through repeated evidence. Understanding something is not the same as becoming it.',
      'Every time you do what you said you\'d do, you deposit a piece of evidence into your self-concept. Every time you don\'t, you make a withdrawal. The balance determines who you believe you are.',
      'One powerful session doesn\'t change a pattern. Thirty mediocre sessions does. The consistency is the point — not the quality of any single day.',
      'The morning check-in isn\'t motivational. It\'s architectural. You\'re constructing the day before the day constructs you.',
      'The evening tab closes the loop. It makes the gap visible. And the gap — honestly named — is the most important data point you have.',
    ],
    closing: 'You\'re not trying to have a perfect day. You\'re building a person. One day at a time.',
    cta: { label: 'Apply this to your next check-in →', href: '/checkin/morning' },
  },
  {
    num: 3, tag: 'Leverage', title: 'The System',
    oneline: 'Find your leverage point across the six pillars.',
    content: [
      'The six pillars aren\'t equal. Your performance in one pillar is upstream of everything else. Finding that pillar and focusing there first is the highest-leverage move you can make.',
      'Most people address downstream symptoms. Low energy, poor focus, procrastination — these are outcomes. The upstream cause is almost always in Self-Awareness, Identity, or Emotional Regulation.',
      'Your daily and weekly scorecard dimensions tell you where the system is breaking down. A consistently low Ownership score isn\'t a motivation problem. It\'s an identity problem. Name it accurately.',
      'For most people, one pillar is the constraint. Fix it and everything else improves. Ignore it and no amount of work on the other five will produce lasting results.',
      'When you strengthen the right pillar, the gains compound. Self-awareness improves self-talk. Better self-talk strengthens identity. Stronger identity drives better emotional regulation. The whole system lifts.',
    ],
    closing: 'Find your constraint. Work on that. Everything else is maintenance.',
    cta: { label: 'See your patterns →', href: '/patterns' },
  },
  {
    num: 4, tag: 'Consistency', title: 'The Commitment',
    oneline: 'What separates people who change from people who reflect.',
    content: [
      'Most people quit a journal in week two. Not because the journal doesn\'t work. Because it does. They start to see things they weren\'t ready to see.',
      'Resistance isn\'t laziness. It\'s protection. When the journal starts surfacing a pattern that challenges your self-concept, the self-concept fights back. That\'s the moment most people stop.',
      'Commitment isn\'t enthusiasm. It\'s showing up when you don\'t want to. It\'s doing the check-in on the day when you already know the answer will be uncomfortable.',
      'Research on behavioral change consistently shows that patterns become durable after 30 days of repeated action. The first 30 days are the hardest. Not because the practice is hard — because the resistance is highest.',
      'You\'re not building a journaling habit. You\'re building a relationship with the truth about yourself. That relationship, developed over time, is what changes behavior at the identity level.',
    ],
    closing: 'The people who change are not more motivated. They\'re more honest. And they keep showing up to be honest, even when it\'s uncomfortable. That\'s the commitment.',
    cta: { label: 'Start today\'s check-in →', href: '/checkin/morning' },
  },
]

export default function LearnPage() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <div style={{ maxWidth: 430, margin: '0 auto', background: 'var(--bg)', minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--border)' }}>
        <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--gray)', marginBottom: 4 }}>Library</p>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: 'var(--text-primary)' }}>Learn More</h1>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px 80px' }}>
        {CHAPTERS.map(ch => (
          <div key={ch.num} className="card" style={{ marginBottom: 12, cursor: 'pointer' }} onClick={() => setOpen(open === ch.num ? null : ch.num)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 11, color: 'var(--gray)', fontWeight: 500 }}>Ch.{ch.num}</span>
                  <span style={{ padding: '2px 8px', borderRadius: 10, background: 'var(--bg3)', fontSize: 10, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{ch.tag}</span>
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>{ch.title}</h3>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{ch.oneline}</p>
              </div>
              <span style={{ color: 'var(--text-tertiary)', fontSize: 18, marginLeft: 12, transition: 'transform 0.2s', transform: open === ch.num ? 'rotate(180deg)' : 'none', flexShrink: 0 }}>⌄</span>
            </div>

            {open === ch.num && (
              <div style={{ marginTop: 24, borderTop: '1px solid var(--border)', paddingTop: 20 }} className="slide-in">
                {ch.content.map((para, i) => (
                  <p key={i} style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 18 }}>{para}</p>
                ))}
                <p className="question" style={{ fontSize: 16, color: 'var(--text-primary)', lineHeight: 1.6, marginBottom: 20, borderLeft: '2px solid var(--gray)', paddingLeft: 14 }}>
                  &ldquo;{ch.closing}&rdquo;
                </p>
                <Link href={ch.cta.href} onClick={e => e.stopPropagation()}>
                  <button className="btn btn-ghost" style={{ fontSize: 13 }}>{ch.cta.label}</button>
                </Link>
              </div>
            )}
          </div>
        ))}
      </div>

      <BottomNav />
    </div>
  )
}
