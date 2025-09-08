import React, { forwardRef, useImperativeHandle, useState } from 'react';

const HUD = forwardRef(function HUD(_, ref) {
  const [score, setScore] = useState(0);
  const [paused, setPaused] = useState(false);
  const [lives, setLives] = useState(3);

  useImperativeHandle(ref, () => ({
    setScore,
    setPaused,
    setLives,
  }));

  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-zinc-800/60 p-3">
      <div className="flex items-center gap-4">
        <span className="rounded-lg bg-emerald-600/20 px-3 py-1.5 text-emerald-300 font-semibold">
          Score: {score}
        </span>
        <span className="rounded-lg bg-sky-600/20 px-3 py-1.5 text-sky-300 font-semibold">
          Lives: {lives}
        </span>
      </div>
      <div className="text-sm text-white/70">
        {paused ? 'Paused' : 'Running'}
      </div>
    </div>
  );
});

export default HUD;
