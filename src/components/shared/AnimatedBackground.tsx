import { useEffect, useRef } from "react";
import useDeferredMount from "@hooks/useDeferredMount";

const AnimatedBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const shouldAnimate = useDeferredMount({ delayMs: 120, timeoutMs: 600 });

  useEffect(() => {
    if (!shouldAnimate) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let animationId: number;
    let lastTime = 0;
    let viewportWidth = window.innerWidth;
    let viewportHeight = window.innerHeight;
    let pageVisible = document.visibilityState === "visible";
    const FPS = 30;
    const FRAME_MS = 1000 / FPS;

    const particlePalette = [188, 204, 18];

    let particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      opacity: number;
      hue: number;
    }> = [];

    const resize = () => {
      viewportWidth = window.innerWidth;
      viewportHeight = window.innerHeight;
      canvas.width = viewportWidth;
      canvas.height = viewportHeight;
    };

    const createParticles = () => {
      particles = [];
      // Reduced divisor for fewer particles → less draw cost
      const divisor = viewportWidth < 768 ? 90000 : 60000;
      const count = Math.max(10, Math.min(32, Math.floor((viewportWidth * viewportHeight) / divisor)));
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * viewportWidth,
          y: Math.random() * viewportHeight,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          size: Math.random() * 2 + 0.5,
          opacity: Math.random() * 0.4 + 0.1,
          hue: particlePalette[Math.floor(Math.random() * particlePalette.length)],
        });
      }
    };

    const animate = (timestamp: number) => {
      animationId = window.requestAnimationFrame(animate);
      if (!pageVisible || timestamp - lastTime < FRAME_MS) return;
      lastTime = timestamp;

      ctx.clearRect(0, 0, viewportWidth, viewportHeight);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = viewportWidth;
        if (p.x > viewportWidth) p.x = 0;
        if (p.y < 0) p.y = viewportHeight;
        if (p.y > viewportHeight) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 92%, 62%, ${p.opacity})`;
        ctx.fill();
      });
    };

    resize();
    createParticles();
    animationId = window.requestAnimationFrame(animate);

    const handleResize = () => {
      resize();
      createParticles();
    };
    const handleVisibilityChange = () => {
      pageVisible = document.visibilityState === "visible";
      if (pageVisible) {
        lastTime = 0;
      }
    };

    window.addEventListener("resize", handleResize);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [shouldAnimate]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
};

export default AnimatedBackground;

