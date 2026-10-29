import React, { useEffect, useRef } from 'react';

export const BackgroundEffects: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Floating embers and ashes
    interface Ember {
      x: number;
      y: number;
      radius: number;
      color: string;
      speedY: number;
      speedX: number;
      opacity: number;
      decay: number;
    }

    const colors = [
      'rgba(234, 88, 12, ', // burnt orange
      'rgba(212, 175, 55, ', // antique gold
      'rgba(220, 38, 38, ',  // crimson red
      'rgba(255, 120, 40, ', // bright ember
    ];

    const embers: Ember[] = Array.from({ length: 45 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 2 + 0.8,
      color: colors[Math.floor(Math.random() * colors.length)],
      speedY: -(Math.random() * 0.7 + 0.2),
      speedX: (Math.random() - 0.5) * 0.4,
      opacity: Math.random() * 0.7 + 0.2,
      decay: Math.random() * 0.003 + 0.001,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < embers.length; i++) {
        const e = embers[i];
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2);
        ctx.fillStyle = e.color + e.opacity + ')';
        ctx.shadowBlur = 6;
        ctx.shadowColor = '#ea580c';
        ctx.fill();

        e.y += e.speedY;
        e.x += e.speedX;
        e.opacity -= e.decay;

        if (e.y < -10 || e.opacity <= 0) {
          e.y = height + 10;
          e.x = Math.random() * width;
          e.opacity = Math.random() * 0.7 + 0.3;
          e.speedY = -(Math.random() * 0.7 + 0.2);
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Dark gothic atmospheric gradient base */}
      <div className="absolute inset-0 bg-radial-gradient from-transparent via-[#09060b]/70 to-[#040205] opacity-95" />

      {/* Candlelight corner glows */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-blood-900/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-gold-700/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-ember-700/15 rounded-full blur-3xl pointer-events-none" />

      {/* Subtle Fog effect */}
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-900/30 via-transparent to-transparent" />

      {/* Animated Embers Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
};
