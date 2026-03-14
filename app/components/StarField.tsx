"use client";

import { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  radius: number;
  opacity: number;
  twinkleSpeed: number;
  twinklePhase: number;
  drift: number;
}

export default function StarField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let stars: Star[] = [];

    function resize() {
      canvas!.width = window.innerWidth;
      canvas!.height = window.innerHeight;
      initStars();
    }

    function initStars() {
      const area = canvas!.width * canvas!.height;
      const count = Math.floor(area / 3000); // density similar to Grok
      stars = [];

      for (let i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * canvas!.width,
          y: Math.random() * canvas!.height,
          radius: Math.random() * 1.4 + 0.3,
          opacity: Math.random() * 0.7 + 0.1,
          twinkleSpeed: Math.random() * 0.008 + 0.002,
          twinklePhase: Math.random() * Math.PI * 2,
          drift: (Math.random() - 0.5) * 0.15,
        });
      }
    }

    function draw(time: number) {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);

      for (const star of stars) {
        const twinkle =
          Math.sin(time * star.twinkleSpeed + star.twinklePhase) * 0.4 + 0.6;
        const alpha = star.opacity * twinkle;

        ctx!.beginPath();
        ctx!.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx!.fill();

        // subtle glow for brighter stars
        if (star.radius > 1) {
          ctx!.beginPath();
          ctx!.arc(star.x, star.y, star.radius * 2.5, 0, Math.PI * 2);
          ctx!.fillStyle = `rgba(255, 255, 255, ${alpha * 0.08})`;
          ctx!.fill();
        }

        // very slow drift
        star.y += star.drift * 0.05;
        if (star.y < -5) star.y = canvas!.height + 5;
        if (star.y > canvas!.height + 5) star.y = -5;
      }

      animationId = requestAnimationFrame(draw);
    }

    resize();
    animationId = requestAnimationFrame(draw);
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0"
      aria-hidden="true"
    />
  );
}