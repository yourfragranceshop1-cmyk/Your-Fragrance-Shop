import { useEffect } from "react";

/**
 * SmoothScroll — custom inertial scroll without any external library.
 * Uses a lerp (linear interpolation) loop to smoothly follow the native
 * scroll position at ~8% per frame, giving a natural deceleration feel.
 */
export function SmoothScroll() {
  useEffect(() => {
    let targetY = window.scrollY;
    let currentY = window.scrollY;
    let rafId = 0;
    let ticking = false;

    const LERP = 0.10; // smoothing factor: lower = smoother/slower

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      targetY = Math.max(0, Math.min(targetY + e.deltaY, document.body.scrollHeight - window.innerHeight));
      if (!ticking) {
        ticking = true;
        rafId = requestAnimationFrame(animate);
      }
    };

    const animate = () => {
      currentY = lerp(currentY, targetY, LERP);
      if (Math.abs(currentY - targetY) > 0.5) {
        window.scrollTo(0, currentY);
        rafId = requestAnimationFrame(animate);
      } else {
        window.scrollTo(0, targetY);
        currentY = targetY;
        ticking = false;
      }
    };

    // Listen on document to catch all scroll events
    document.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      document.removeEventListener("wheel", onWheel);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return null;
}
