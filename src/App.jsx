import React, { useRef } from 'react';
import HeroCover from './components/HeroCover';
import GameCanvas from './components/GameCanvas';
import ControlsHelp from './components/ControlsHelp';
import HUD from './components/HUD';

export default function App() {
  const gameRef = useRef(null);

  const scrollToGame = () => {
    const el = document.getElementById('game-section');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen w-full bg-zinc-950 text-white">
      <section className="relative h-[80vh] w-full overflow-hidden">
        <HeroCover />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/70" />
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight drop-shadow-md">
            2D Pixel Mario-Style Platformer
          </h1>
          <p className="mt-4 max-w-2xl text-zinc-200">
            Run, jump, and collect coins in a lightweight pixel platformer. Built with React, Canvas, and Tailwind.
          </p>
          <div className="mt-8 flex items-center gap-3">
            <button
              onClick={scrollToGame}
              className="rounded-lg bg-emerald-500 px-5 py-3 font-semibold text-white shadow hover:bg-emerald-400 active:scale-[0.99]"
            >
              Play Now
            </button>
            <a
              href="#game-section"
              className="rounded-lg border border-white/20 px-5 py-3 font-semibold text-white/90 backdrop-blur hover:bg-white/5"
            >
              Skip Intro
            </a>
          </div>
        </div>
      </section>

      <section id="game-section" className="relative mx-auto max-w-6xl px-4 py-10 sm:py-14">
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="rounded-2xl border border-white/10 bg-zinc-900/50 p-4 sm:p-6 shadow-xl">
            <HUD ref={gameRef} />
            <GameCanvas ref={gameRef} />
          </div>
          <div className="rounded-2xl border border-white/10 bg-zinc-900/50 p-4 sm:p-6 shadow-xl">
            <ControlsHelp />
          </div>
        </div>
        <p className="mt-8 text-center text-sm text-white/60">
          This project is a fan-made, non-commercial homage to classic platformers. No assets from Nintendo are used.
        </p>
      </section>

      <footer className="mx-auto max-w-6xl px-4 py-10 text-center text-white/60">
        <p>
          Built with React + Vite + Tailwind. Use the keyboard to play. Refresh to reset.
        </p>
      </footer>
    </div>
  );
}
