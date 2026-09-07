import { useEffect } from "react";

export function SmoothScroll() {
  useEffect(() => {
    // Add smooth scroll-behavior globally
    document.documentElement.style.scrollBehavior = "smooth";

    let targetY = window.scrollY;
    let currentY = window.scrollY;
    let isRunning = false;

    const lerp = (start: number, end: number, factor: number) => {
      return start + (end - start) * factor;
    };

    const animate = () => {
      currentY = lerp(currentY, targetY, 0.12);
      if (Math.abs(targetY - currentY) > 0.5) {
        window.scrollTo(0, currentY);
        requestAnimationFrame(animate);
      } else {
        window.scrollTo(0, targetY);
        isRunning = false;
      }
    };

    const onWheel = (e: WheelEvent) => {
      // Don't intercept scroll inside scrollable dropdowns or modals
      const target = e.target as HTMLElement | null;
      if (target?.closest("[data-radix-scroll-area-viewport], .overflow-y-auto, .overflow-auto, textarea, select")) {
        return;
      }

      e.preventDefault();
      const delta = e.deltaY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      targetY = Math.max(0, Math.min(maxScroll, targetY + delta * 1.1));

      if (!isRunning) {
        isRunning = true;
        requestAnimationFrame(animate);
      }
    };

    const onScroll = () => {
      if (!isRunning) {
        targetY = window.scrollY;
        currentY = window.scrollY;
      }
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("scroll", onScroll);
      document.documentElement.style.scrollBehavior = "";
    };
  }, []);

  return null;
}
