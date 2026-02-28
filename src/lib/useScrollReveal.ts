// Хук для IntersectionObserver — добавляет класс .visible когда элемент входит в viewport
import { useEffect, useRef, useState } from "react";

export function useScrollReveal(className = "visible", threshold = 0.15) {
  const ref = useRef<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add(className);
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [className, threshold]);

  return [ref, isVisible] as const;
}
