
import { useEffect, useRef } from 'react';

const ParticleCanvas = () => {
  const canvasRef = useRef(null);
  const animRef   = useRef(null);
  const mouseRef  = useRef({ x: -9999, y: -9999 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const PARTICLE_COUNT   = 90;
    const CONNECTION_DIST  = 130;
    const MOUSE_REPEL_DIST = 110;
    const SPEED            = 0.45;
    const DOT_COLOR        = '56, 189, 248';  // sky-400
    const LINE_COLOR       = '56, 189, 248';

    let W, H, particles;

    const resize = () => {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };

    const rnd = (min, max) => Math.random() * (max - min) + min;

    const makeParticle = () => ({
      x:     rnd(0, W),
      y:     rnd(0, H),
      vx:    rnd(-SPEED, SPEED),
      vy:    rnd(-SPEED, SPEED),
      r:     rnd(1.5, 3.5),
      alpha: rnd(0.35, 0.9),
    });

    const init = () => {
      resize();
      particles = Array.from({ length: PARTICLE_COUNT }, makeParticle);
    };

    const draw = () => {
      ctx.clearRect(0, 0, W, H);

      for (const p of particles) {
        // Mouse repulsion
        const dx   = p.x - mouseRef.current.x;
        const dy   = p.y - mouseRef.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MOUSE_REPEL_DIST && dist > 0) {
          const force = (MOUSE_REPEL_DIST - dist) / MOUSE_REPEL_DIST;
          p.x += (dx / dist) * force * 2.5;
          p.y += (dy / dist) * force * 2.5;
        }

        p.x += p.vx;
        p.y += p.vy;

        // Bounce off edges
        if (p.x < 0)  { p.x = 0; p.vx *= -1; }
        if (p.x > W)  { p.x = W; p.vx *= -1; }
        if (p.y < 0)  { p.y = 0; p.vy *= -1; }
        if (p.y > H)  { p.y = H; p.vy *= -1; }

        // Draw glowing dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle   = `rgba(${DOT_COLOR}, ${p.alpha})`;
        ctx.shadowColor = `rgba(${DOT_COLOR}, 0.6)`;
        ctx.shadowBlur  = 8;
        ctx.fill();
        ctx.shadowBlur  = 0;
      }

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a  = particles[i];
          const b  = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d  = Math.sqrt(dx * dx + dy * dy);
          if (d < CONNECTION_DIST) {
            const opacity = (1 - d / CONNECTION_DIST) * 0.25;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(${LINE_COLOR}, ${opacity})`;
            ctx.lineWidth   = 0.8;
            ctx.stroke();
          }
        }
      }

      animRef.current = requestAnimationFrame(draw);
    };

    /* ── Mouse tracking ─────────────────────────────────────────── */
    const handleMouse = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    const handleMouseLeave = () => {
      mouseRef.current = { x: -9999, y: -9999 };
    };

    /* ── Init ───────────────────────────────────────────────────── */
    init();
    draw();

    window.addEventListener('resize', init);
    window.addEventListener('mousemove', handleMouse);
    window.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', init);
      window.removeEventListener('mousemove', handleMouse);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position : 'fixed',
        top      : 0,
        left     : 0,
        width    : '100vw',
        height   : '100vh',
        zIndex   : 0,
        pointerEvents: 'none',   // never blocks clicks
        display  : 'block',
      }}
    />
  );
};

export default ParticleCanvas;
