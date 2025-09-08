import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';

// Simple 2D pixel platformer canvas with basic collisions, coins, and pause/reset.
const WIDTH = 800;
const HEIGHT = 450;
const GRAVITY = 0.9;
const FRICTION = 0.8;
const MOVE_SPEED = 0.8;
const MAX_XSPEED = 5;
const JUMP_VELOCITY = -14;

function rectsOverlap(a, b) {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.h + a.y > b.y
  );
}

function makeLevel() {
  // Platforms and coins inspired by classic layouts.
  const platforms = [
    { x: 0, y: HEIGHT - 40, w: WIDTH, h: 40, type: 'ground' },
    { x: 80, y: HEIGHT - 140, w: 120, h: 20, type: 'brick' },
    { x: 260, y: HEIGHT - 220, w: 80, h: 20, type: 'brick' },
    { x: 380, y: HEIGHT - 180, w: 110, h: 20, type: 'brick' },
    { x: 560, y: HEIGHT - 120, w: 140, h: 20, type: 'brick' },
  ];

  const coins = [
    { x: 110, y: HEIGHT - 170, r: 6, taken: false },
    { x: 290, y: HEIGHT - 250, r: 6, taken: false },
    { x: 410, y: HEIGHT - 210, r: 6, taken: false },
    { x: 600, y: HEIGHT - 150, r: 6, taken: false },
  ];

  return { platforms, coins };
}

const GameCanvas = forwardRef(function GameCanvas(_, hudRef) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const keysRef = useRef({});
  const stateRef = useRef(null);
  const [paused, setPaused] = useState(false);

  function reset() {
    const { platforms, coins } = makeLevel();
    stateRef.current = {
      player: {
        x: 40,
        y: HEIGHT - 90,
        w: 18,
        h: 22,
        vx: 0,
        vy: 0,
        onGround: false,
        facing: 1,
      },
      platforms,
      coins,
      score: 0,
      lives: 3,
      won: false,
      lost: false,
    };
    setPaused(false);
    if (hudRef && typeof hudRef.current?.setScore === 'function') {
      hudRef.current.setScore(0);
      hudRef.current.setLives(3);
      hudRef.current.setPaused(false);
    }
  }

  useImperativeHandle(hudRef, () => ({
    setScore: () => {},
    setPaused: setPaused,
    setLives: () => {},
  }), []);

  useEffect(() => {
    reset();
  }, []);

  useEffect(() => {
    const onKeyDown = (e) => {
      keysRef.current[e.key.toLowerCase()] = true;
      if (e.key === 'p' || e.key === 'P') togglePause();
      if (e.key === 'r' || e.key === 'R') reset();
    };
    const onKeyUp = (e) => { keysRef.current[e.key.toLowerCase()] = false; };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  function togglePause() {
    setPaused((p) => !p);
    if (hudRef && typeof hudRef.current?.setPaused === 'function') {
      hudRef.current.setPaused((p) => !p);
    }
  }

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    function drawBackground(ctx) {
      // Sky
      ctx.fillStyle = '#5fc7ff';
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
      // Distant mountains (simple)
      ctx.fillStyle = '#8fd6ff';
      ctx.beginPath();
      ctx.moveTo(0, HEIGHT - 140);
      ctx.lineTo(120, HEIGHT - 220);
      ctx.lineTo(240, HEIGHT - 140);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(200, HEIGHT - 120);
      ctx.lineTo(340, HEIGHT - 220);
      ctx.lineTo(480, HEIGHT - 120);
      ctx.closePath();
      ctx.fill();

      // Clouds
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      const clouds = [
        { x: 90, y: 70 },
        { x: 320, y: 60 },
        { x: 600, y: 80 },
      ];
      clouds.forEach((c) => {
        ctx.beginPath();
        ctx.arc(c.x, c.y, 16, 0, Math.PI * 2);
        ctx.arc(c.x + 18, c.y + 4, 14, 0, Math.PI * 2);
        ctx.arc(c.x - 18, c.y + 6, 12, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    function drawPlatforms(ctx, platforms) {
      platforms.forEach((p) => {
        if (p.type === 'ground') {
          // Ground tiles
          ctx.fillStyle = '#6b3e26';
          ctx.fillRect(p.x, p.y, p.w, p.h);
          ctx.fillStyle = '#2fab27';
          ctx.fillRect(p.x, p.y, p.w, 8);
        } else {
          // Brick style
          ctx.fillStyle = '#b4582d';
          ctx.fillRect(p.x, p.y, p.w, p.h);
          ctx.strokeStyle = '#7a2f18';
          ctx.lineWidth = 2;
          for (let y = p.y; y < p.y + p.h; y += 10) {
            ctx.beginPath();
            ctx.moveTo(p.x, y);
            ctx.lineTo(p.x + p.w, y);
            ctx.stroke();
          }
          for (let x = p.x; x < p.x + p.w; x += 16) {
            ctx.beginPath();
            ctx.moveTo(x, p.y);
            ctx.lineTo(x, p.y + p.h);
            ctx.stroke();
          }
        }
      });
    }

    function drawCoins(ctx, coins) {
      coins.forEach((c) => {
        if (c.taken) return;
        // Coin with simple shine
        ctx.fillStyle = '#ffd84d';
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        ctx.beginPath();
        ctx.arc(c.x - c.r / 3, c.y - c.r / 3, c.r / 4, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    function drawPlayer(ctx, p) {
      // Pixelated plumber-like colors without specific IP
      ctx.fillStyle = '#e63946'; // cap/shirt
      ctx.fillRect(p.x, p.y, p.w, p.h);
      ctx.fillStyle = '#1d3557'; // pants
      ctx.fillRect(p.x, p.y + p.h - 10, p.w, 10);
      ctx.fillStyle = '#f1fa8c'; // face-ish
      ctx.fillRect(p.x + 3, p.y + 4, p.w - 6, 6);
    }

    function physicsAndCollisions(s) {
      const p = s.player;
      const left = keysRef.current['arrowleft'] || keysRef.current['a'];
      const right = keysRef.current['arrowright'] || keysRef.current['d'];
      const jump = keysRef.current['arrowup'] || keysRef.current['w'] || keysRef.current[' '];

      // Horizontal input
      if (left && !right) {
        p.vx -= MOVE_SPEED;
        p.facing = -1;
      } else if (right && !left) {
        p.vx += MOVE_SPEED;
        p.facing = 1;
      } else {
        p.vx *= FRICTION;
      }
      p.vx = Math.max(-MAX_XSPEED, Math.min(MAX_XSPEED, p.vx));

      // Jump
      if (jump && p.onGround) {
        p.vy = JUMP_VELOCITY;
        p.onGround = false;
      }

      // Gravity
      p.vy += GRAVITY;
      if (p.vy > 18) p.vy = 18;

      // Apply X
      p.x += p.vx;
      // Collide X
      s.platforms.forEach((plat) => {
        const box = { x: plat.x, y: plat.y, w: plat.w, h: plat.h };
        if (rectsOverlap({ x: p.x, y: p.y, w: p.w, h: p.h }, box)) {
          if (p.vx > 0) p.x = plat.x - p.w;
          else if (p.vx < 0) p.x = plat.x + plat.w;
          p.vx = 0;
        }
      });

      // Apply Y
      p.y += p.vy;
      p.onGround = false;
      s.platforms.forEach((plat) => {
        const box = { x: plat.x, y: plat.y, w: plat.w, h: plat.h };
        if (rectsOverlap({ x: p.x, y: p.y, w: p.w, h: p.h }, box)) {
          if (p.vy > 0) {
            p.y = plat.y - p.h;
            p.vy = 0;
            p.onGround = true;
          } else if (p.vy < 0) {
            p.y = plat.y + plat.h;
            p.vy = 0;
          }
        }
      });

      // World bounds
      if (p.x < 0) { p.x = 0; p.vx = 0; }
      if (p.x + p.w > WIDTH) { p.x = WIDTH - p.w; p.vx = 0; }

      // Fall off
      if (p.y > HEIGHT + 120) {
        s.lives -= 1;
        if (hudRef && typeof hudRef.current?.setLives === 'function') hudRef.current.setLives(s.lives);
        if (s.lives <= 0) {
          s.lost = true;
        } else {
          // Respawn
          p.x = 40; p.y = HEIGHT - 90; p.vx = 0; p.vy = 0; p.onGround = false;
        }
      }

      // Coins
      s.coins.forEach((c) => {
        if (c.taken) return;
        const box = { x: c.x - c.r, y: c.y - c.r, w: c.r * 2, h: c.r * 2 };
        if (rectsOverlap({ x: p.x, y: p.y, w: p.w, h: p.h }, box)) {
          c.taken = true;
          s.score += 100;
          if (hudRef && typeof hudRef.current?.setScore === 'function') hudRef.current.setScore(s.score);
        }
      });

      // Win condition
      if (s.coins.every((c) => c.taken)) {
        s.won = true;
      }
    }

    function render(ctx, s) {
      drawBackground(ctx);
      drawPlatforms(ctx, s.platforms);
      drawCoins(ctx, s.coins);
      drawPlayer(ctx, s.player);

      // UI overlays
      if (s.won || s.lost) {
        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        ctx.fillRect(0, 0, WIDTH, HEIGHT);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 28px Inter, system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(s.won ? 'You Win! 🎉' : 'Game Over 💀', WIDTH / 2, HEIGHT / 2 - 10);
        ctx.font = '16px Inter, system-ui, sans-serif';
        ctx.fillText('Press R to restart', WIDTH / 2, HEIGHT / 2 + 20);
      } else if (paused) {
        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        ctx.fillRect(0, 0, WIDTH, HEIGHT);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 22px Inter, system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Paused (P to resume)', WIDTH / 2, HEIGHT / 2);
      }
    }

    const loop = () => {
      const s = stateRef.current;
      if (!s) return;
      const ctx2 = canvasRef.current?.getContext('2d');
      if (!ctx2) return;

      if (!paused && !s.won && !s.lost) physicsAndCollisions(s);
      render(ctx2, s);
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [paused]);

  return (
    <div className="relative">
      <div className="mb-3 flex items-center gap-2">
        <button
          onClick={() => setPaused((p) => {
            const np = !p; if (hudRef && typeof hudRef.current?.setPaused === 'function') hudRef.current.setPaused(np); return np;
          })}
          className="rounded-md bg-white/10 px-4 py-2 text-sm hover:bg-white/20"
        >
          {paused ? 'Resume (P)' : 'Pause (P)'}
        </button>
        <button
          onClick={() => {
            // soft reset keeps lives/score? We'll full reset
            const lives = stateRef.current?.lives ?? 3;
            void lives; // no-op
            const prevHud = hudRef?.current;
            reset();
            if (prevHud && typeof prevHud.setPaused === 'function') prevHud.setPaused(false);
          }}
          className="rounded-md bg-white/10 px-4 py-2 text-sm hover:bg-white/20"
        >
          Reset (R)
        </button>
      </div>
      <div className="overflow-hidden rounded-xl border border-white/10 bg-black">
        <canvas
          ref={canvasRef}
          width={WIDTH}
          height={HEIGHT}
          className="block w-full h-auto"
          style={{ imageRendering: 'pixelated' }}
        />
      </div>
    </div>
  );
});

export default GameCanvas;
