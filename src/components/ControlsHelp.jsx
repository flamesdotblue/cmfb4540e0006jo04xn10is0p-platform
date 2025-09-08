import React from 'react';

export default function ControlsHelp() {
  return (
    <div>
      <h3 className="text-xl font-bold">Controls</h3>
      <ul className="mt-4 space-y-2 text-white/90">
        <li>Left / Right Arrows or A / D: Move</li>
        <li>Up Arrow / W / Space: Jump</li>
        <li>P: Pause / Resume</li>
        <li>R: Reset level</li>
      </ul>
      <div className="mt-6 rounded-lg border border-white/10 bg-zinc-800/60 p-4 text-sm text-white/70">
        Tip: Collect all coins to win. Avoid falling off the map. Pixel rendering is enabled for a retro look.
      </div>
    </div>
  );
}
