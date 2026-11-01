"use client";

import { useEffect, useState, type ReactNode } from "react";
import ChatDemo, { type ChatLine } from "./ChatDemo";
import { DEMO_CARD, PointChip, RoleTag } from "./shared";

export type StepProps = { canTry: boolean; onTry: () => void };

export type Step = {
  id: string; // analytics id
  eyebrow: string;
  title: string;
  caption?: ReactNode;
  Visual: (props: StepProps) => ReactNode;
};

/* ---------- chat scripts (module constants so ChatDemo's effect is stable) ---------- */

const FIRST_LINES: ChatLine[] = [
  { kind: "chief", text: "Big. Round. Up in the sky at night." },
  { kind: "guess", text: "Sun?" },
  { kind: "chief", text: "No! Not hot. Night!" },
  { kind: "guess", text: "Moon!" },
  { kind: "chief", text: "Yes, moon!" },
];

const PLUS1: ChatLine[] = [
  ...FIRST_LINES,
  { kind: "act", text: "Chief taps MOON", card: "easy" },
  { kind: "result", chip: "+1", text: "Got the easy word" },
];

const PLUS3: ChatLine[] = [
  { kind: "act", text: "MOON is banked (+1). Keep going!" },
  { kind: "chief", text: "Now add on… the sweet stuff bees make." },
  { kind: "guess", text: "Wax?" },
  { kind: "chief", text: "No! Sweet. Bears love it. Goes in tea." },
  { kind: "guess", text: "Honey… HONEYMOON!" },
  { kind: "chief", text: "Yes, honeymoon!" },
  { kind: "act", text: "Chief taps HONEY MOON", card: "hard" },
  { kind: "result", chip: "+3", text: "Nailed the phrase" },
];

const BONK: ChatLine[] = [
  { kind: "chief", text: "Big. Round. Up in the sky in the…" },
  { kind: "chief", text: "…eve-ning" },
  { kind: "bonk" },
  { kind: "watch", text: "Bonk! “Evening” has two syllables." },
  { kind: "act", text: "Chief taps Pass", card: "dead" },
  { kind: "result", chip: "−1", text: "Card passed" },
];

const OOPS: ChatLine[] = [
  ...FIRST_LINES,
  { kind: "act", text: "Chief taps Pass by mistake", card: "dead" },
  { kind: "chief", text: "Oh no! I hit Pass!" },
  {
    kind: "watch",
    text: "Don't worry, you can fix it at the end of the turn. Just keep going.",
  },
  { kind: "result", chip: "✓", text: "Game continues" },
];

/* ---------- steps ---------- */

export const STEPS: Step[] = [
  {
    id: "tribes",
    eyebrow: "Set up",
    title: "Split into tribes",
    caption: (
      <>
        Split into <b>2 or 3 tribes</b> (or play solo). Each turn, one player
        is the <b>chief</b>: they hold the phone and give clues. Their own
        tribe guesses. A new chief every turn.
      </>
    ),
    Visual: Tribes,
  },
  {
    id: "watcher",
    eyebrow: "Set up",
    title: "Seat a watcher",
    caption: (
      <>
        Someone from the <b>other tribe</b> sits next to the chief and watches
        the screen. If the chief breaks a rule, they <b>bonk</b> and the card
        is passed.
      </>
    ),
    Visual: Watcher,
  },
  {
    id: "screen",
    eyebrow: "Playing",
    title: "The play screen",
    caption: "Tap a part to see what it does.",
    Visual: PlayScreen,
  },
  {
    id: "plus1",
    eyebrow: "Playing",
    title: "Example: +1",
    caption: (
      <>
        When your tribe says the <b>easy word</b>, say “Yes!” and tap it for{" "}
        <b>+1</b>.
      </>
    ),
    Visual: () => <ChatDemo lines={PLUS1} />,
  },
  {
    id: "plus3",
    eyebrow: "Playing",
    title: "Example: +3",
    caption: (
      <>
        Same card. Keep going for the <b>whole phrase</b> and tap it for{" "}
        <b>+3</b>. Risky: a bonk now loses the +1. Want it safe? Tap{" "}
        <b>Next Word</b> to keep the +1.
      </>
    ),
    Visual: () => <ChatDemo lines={PLUS3} startCard="easy" />,
  },
  {
    id: "bonk",
    eyebrow: "Playing",
    title: "Example: bonk",
    caption: (
      <>
        Same card, but the chief slips up. Broke a rule, or stuck? Tap{" "}
        <b>Pass</b>. Passing costs <b>−1</b>, even if you already banked the
        +1.
      </>
    ),
    Visual: () => <ChatDemo lines={BONK} />,
  },
  {
    id: "oops",
    eyebrow: "Playing",
    title: "Oops? Keep going",
    caption: (
      <>
        Tapped the wrong button? <b>Don&apos;t stop</b>, the clock is running.
        You can fix any card after the turn.
      </>
    ),
    Visual: () => <ChatDemo lines={OOPS} />,
  },
  {
    id: "review",
    eyebrow: "After the turn",
    title: "Check, then pass it on",
    caption: (
      <>
        When time&apos;s up, you see every card. <b>Drag</b>{" "}the misclicked
        one to where it belongs, then bank the score and hand the phone to the
        next tribe&apos;s chief.
      </>
    ),
    Visual: Review,
  },
  {
    id: "rules",
    eyebrow: "Ready?",
    title: "The rules, short",
    Visual: Rules,
  },
];

/* ---------- visuals ---------- */

function Tribes() {
  return (
    <div className="my-auto">
      <div className="grid grid-cols-2 gap-3">
        <TribeCard
          name="🔥 Fire Starters"
          bg="var(--h-red-soft)"
          fg="var(--h-red-dark)"
          people={["🧔", "👩", "🧑"]}
          chief
        />
        <TribeCard
          name="🦣 Tusk Force"
          bg="var(--h-blue-soft)"
          fg="var(--h-blue-dark)"
          people={["👱", "👵", "🧒"]}
          delay={0.12}
        />
      </div>
      <p
        className="animate-rise mt-4 text-center text-xs font-bold text-ink-soft"
        style={{ animationDelay: "1s" }}
      >
        Pick tribes, round length and a word pack on the Setup screen.
      </p>
    </div>
  );
}

function TribeCard({
  name,
  bg,
  fg,
  people,
  chief,
  delay = 0,
}: {
  name: string;
  bg: string;
  fg: string;
  people: string[];
  chief?: boolean;
  delay?: number;
}) {
  return (
    <div
      className="chunk animate-rise rounded-2xl px-2 pb-3.5 pt-3 text-center"
      style={{ background: bg, animationDelay: `${delay}s` }}
    >
      <div className="whitespace-nowrap text-xs min-[390px]:text-sm" style={{ color: fg }}>
        <span className="font-display">{name}</span>
      </div>
      <div className="mt-3 flex justify-center gap-0.5 text-3xl">
        {people.map((p, i) => (
          <span
            key={p}
            className="animate-pop relative inline-block"
            style={{ animationDelay: `${delay + 0.2 + i * 0.1}s` }}
          >
            {p}
            {chief && i === 0 && (
              <span className="howto-hop absolute -bottom-1 -right-2 text-lg">📱</span>
            )}
          </span>
        ))}
      </div>
      <RoleTag
        bg={chief ? "var(--h-red)" : "var(--color-cream)"}
        color={chief ? "#fff" : "var(--color-ink-soft)"}
        className="animate-pop mt-2.5"
      >
        {chief ? "Chief" : "Waiting"}
      </RoleTag>
    </div>
  );
}

function Watcher() {
  const rules: [string, string][] = [
    ["One-syllable words only", "“Big wet sky drop” ✓  “Rainstorm” ✗"],
    ["No words from the card", "Card says MOON? Don't say “moon”."],
    ["No hands, no sound effects", "Words only."],
  ];
  return (
    <div className="flex flex-col">
      <div className="flex items-end justify-center gap-5 rounded-2xl border-[3px] border-dashed border-ink/30 bg-[#f3e6cd] px-2.5 pb-3.5 pt-5 short:pb-2 short:pt-3">
        <div className="animate-pop text-center">
          <span className="relative inline-block text-[44px] leading-none short:text-[36px]">
            🧔<span className="absolute -right-3.5 bottom-0.5 text-2xl">📱</span>
          </span>
          <br />
          <RoleTag bg="var(--h-red)" className="mt-2">Chief</RoleTag>
        </div>
        <div className="howto-slide-in text-center">
          <span className="relative inline-block text-[44px] leading-none short:text-[36px]">
            <span className="howto-bonk absolute -left-4 -top-1.5 text-[26px]">🦴</span>
            👱
            <span className="howto-hop absolute -right-2.5 -top-3.5 text-lg">👀</span>
          </span>
          <br />
          <RoleTag bg="var(--h-blue)" className="mt-2">Watcher</RoleTag>
        </div>
      </div>
      <div className="mt-3.5 grid gap-2 short:mt-2 short:gap-1.5">
        {rules.map(([title, sub], i) => (
          <div
            key={title}
            className="animate-rise flex items-center gap-2.5 rounded-2xl border-[3px] border-ink px-3 py-2 text-sm short:py-1.5"
            style={{ background: "#fffdf5", animationDelay: `${0.5 + i * 0.15}s` }}
          >
            <span className="grid h-[26px] w-[26px] flex-none place-items-center rounded-full bg-ink text-[13px] font-black text-cream">
              {i + 1}
            </span>
            <div className="font-extrabold text-ink">
              {title}
              <small className="block text-[12.5px] font-bold text-ink-soft short:hidden">{sub}</small>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const PARTS: [string, string][] = [
  ["Timer", "Ends the turn at zero."],
  ["Pause", "Restart or give up."],
  ["+1 word", "Tap when they get it."],
  ["+3 phrase", "Tap when they get it all."],
  ["Pass −1", "Skip the card."],
];

function PlayScreen() {
  const [cur, setCur] = useState(0);
  const [auto, setAuto] = useState(true);

  // Walk the pins one by one until the player taps a row themselves.
  useEffect(() => {
    if (!auto) return;
    const id = setInterval(() => setCur((c) => (c + 1) % PARTS.length), 1700);
    return () => clearInterval(id);
  }, [auto]);

  const on = (i: number) => (cur === i ? "true" : "false");
  const pins = [
    { left: -12, top: -12 },
    { right: -10, top: 4 },
    { right: -10, top: "25%" },
    { right: -10, top: "60%" },
    { right: -10, top: "89%" },
  ];

  return (
    <div className="my-auto grid grid-cols-[120px_minmax(0,1fr)] items-center gap-3.5 py-3 pl-3 short:py-1">
      <div
        aria-hidden
        className="animate-rise relative flex h-[250px] flex-col short:h-[200px] gap-1.5 rounded-2xl border-[3px] border-ink p-2"
        style={{ background: "var(--h-red)" }}
      >
        <div className="flex h-[26px] items-center gap-1">
          <span className="howto-target font-display text-base text-white" data-on={on(0)}>59</span>
          <span className="howto-target h-1.5 flex-1 rounded-full border-2 border-ink bg-white" data-on={on(0)} />
          <span
            className="howto-target grid h-[22px] w-[22px] place-items-center rounded-md border-2 border-ink bg-cream text-[9px] font-black text-ink"
            data-on={on(1)}
          >
            ❚❚
          </span>
        </div>
        <div
          className="howto-target grid flex-1 place-items-center content-center gap-1 rounded-[10px] border-2 border-ink bg-cream text-[13px]"
          data-on={on(2)}
        >
          <span className="font-display text-ink">{DEMO_CARD.easy}</span>
          <PointChip label="+1" size="xs" />
        </div>
        <div
          className="howto-target grid flex-[1.25] place-items-center content-center gap-1 rounded-[10px] border-2 border-ink text-[13px]"
          style={{ background: "#fffdf5" }}
          data-on={on(3)}
        >
          <span className="font-display text-ink">{DEMO_CARD.hard}</span>
          <PointChip label="+3" size="xs" />
        </div>
        <div
          className="howto-target grid h-[26px] place-items-center rounded-lg border-2 border-ink text-[11px] text-cream"
          style={{ background: "#5a4329" }}
          data-on={on(4)}
        >
          <span className="font-display">Pass −1</span>
        </div>
        {pins.map((pos, i) => (
          <span
            key={i}
            className="howto-pin absolute grid h-[22px] w-[22px] place-items-center rounded-full border-2 border-ink bg-cream text-xs font-black text-ink"
            style={pos}
            data-on={on(i)}
          >
            {i + 1}
          </span>
        ))}
      </div>

      <div className="grid content-center gap-1 short:gap-0">
        {PARTS.map(([title, sub], i) => (
          <button
            key={title}
            type="button"
            onClick={() => {
              setAuto(false);
              setCur(i);
            }}
            className={`animate-rise flex items-start gap-2 rounded-xl border-2 px-2 py-1.5 text-left short:py-0.5 transition-colors ${cur === i ? "border-ink bg-[#fff1cc]" : "border-transparent"}`}
            style={{ animationDelay: `${0.15 + i * 0.08}s` }}
          >
            <span className="mt-px grid h-5 w-5 flex-none place-items-center rounded-full bg-ink text-[11px] font-black text-cream">
              {i + 1}
            </span>
            <span className="text-[12.5px] leading-tight">
              <b className="block text-[13.5px] font-black text-ink">{title}</b>
              <span className="font-bold text-ink-soft">{sub}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function Review() {
  const [held, setHeld] = useState(false);
  const [up, setUp] = useState(false);
  const [landed, setLanded] = useState(false);
  const [phoneGo, setPhoneGo] = useState(false);

  useEffect(() => {
    const t = [
      setTimeout(() => setHeld(true), 700),
      setTimeout(() => setUp(true), 1100),
      setTimeout(() => {
        setHeld(false);
        setLanded(true);
      }, 2300),
      setTimeout(() => setPhoneGo(true), 3300),
    ];
    return () => t.forEach(clearTimeout);
  }, []);

  return (
    <div className="flex flex-col">
      <div className="animate-rise relative grid gap-3">
        <Bucket chip="+1" label="Got the word" bg="#dbe8fd" pulse={landed} />
        <Bucket chip="−1" label="Passed" bg="#f8dbd8" />
        <div className="howto-drag" data-held={held} data-up={up}>
          <span
            className="inline-block rounded-[9px] border-2 border-ink px-3.5 py-1 text-base text-ink"
            style={{
              background: held ? "#fff1cc" : "#fffdf5",
              boxShadow: `0 ${held ? 6 : 2}px 0 0 var(--color-ink)`,
            }}
          >
            <span className="font-display">{DEMO_CARD.easy}</span>
          </span>
          <span className="absolute -bottom-5 -right-4 text-[26px]">👆</span>
        </div>
      </div>

      <div className="relative mt-[18px] flex h-[74px] short:mt-3 short:h-[64px] items-center justify-between rounded-2xl border-[3px] border-dashed border-ink/30 bg-[#f3e6cd] px-[18px]">
        <Person emoji="🧔" label="Fire chief" color="var(--h-red-dark)" />
        <span className="text-xl text-ink-soft">➜</span>
        <Person emoji="👱" label="Tusk chief" color="var(--h-blue-dark)" />
        <span className="howto-flyphone text-[26px]" data-go={phoneGo}>
          📱
        </span>
      </div>
    </div>
  );
}

function Bucket({
  chip,
  label,
  bg,
  pulse,
}: {
  chip: string;
  label: string;
  bg: string;
  pulse?: boolean;
}) {
  return (
    <div
      className={`h-[84px] rounded-2xl short:h-[72px] border-[3px] border-ink px-2.5 py-2 ${pulse ? "howto-glow" : ""}`}
      style={{ background: bg }}
    >
      <span className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wide text-ink-soft">
        <span className="inline-flex items-center rounded-full border-2 border-ink bg-cream px-1.5 py-[3px] text-[11px] leading-none text-ink">
          <span className="font-display">{chip}</span>
        </span>
        {label}
      </span>
    </div>
  );
}

function Person({ emoji, label, color }: { emoji: string; label: string; color: string }) {
  return (
    <span className="text-center text-[34px]">
      {emoji}
      <small className="block text-[10px] font-black uppercase tracking-wide" style={{ color }}>
        {label}
      </small>
    </span>
  );
}

function Rules({ canTry, onTry }: StepProps) {
  const rules: [string, ReactNode][] = [
    ["🗣️", <><b>One-syllable words</b> only. No hands, no sounds.</>],
    ["🦴", <>The <b>watcher</b> bonks any rule break: <b>−1</b>, even with +1 banked.</>],
    ["↩️", <>Misclicked? <b>Fix it</b> after the turn.</>],
  ];
  return (
    <>
      <div className="my-auto grid gap-[22px] short:gap-3">
        <div
          className="grid grid-cols-3 rounded-[18px] border-[3px] border-ink px-1.5 pb-3.5 pt-4 short:pb-2.5 short:pt-3"
          style={{ background: "#fffdf5" }}
        >
          {(
            [
              ["+1", "Easy word"],
              ["+3", "Phrase"],
              ["−1", "Pass"],
            ] as const
          ).map(([chip, label], i) => (
            <div
              key={chip}
              className={`grid justify-items-center gap-2 text-[13px] font-extrabold text-ink-soft ${i ? "border-l-2 border-dashed border-ink/20" : ""}`}
            >
              <PointChip label={chip} size="lg" />
              {label}
            </div>
          ))}
        </div>
        <ul className="grid gap-4 px-1 short:gap-3">
          {rules.map(([icon, text]) => (
            <li
              key={icon}
              className="grid grid-cols-[40px_1fr] items-center gap-3 text-[15px] font-bold leading-snug text-ink"
            >
              <span className="grid h-10 w-10 place-items-center rounded-full border-[3px] border-ink bg-cream text-lg">
                {icon}
              </span>
              <span className="[&_b]:font-black">{text}</span>
            </li>
          ))}
        </ul>
      </div>
      {canTry ? (
        <button
          type="button"
          onClick={onTry}
          className="btn howto-shake mb-2.5 mt-2 w-full py-4 text-white short:py-3"
          style={{ background: "var(--h-red)" }}
        >
          <span className="font-display text-2xl">Give It a Try 🔥</span>
        </button>
      ) : (
        <p className="mt-2 text-center text-sm font-bold text-ink-soft">
          Your game is still going. Back to it!
        </p>
      )}
    </>
  );
}
