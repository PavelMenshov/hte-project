// Анимированный счётчик от 0 до target
import { useState, useEffect, useRef } from "react";

export function useCounter(target: number, duration = 1500, decimals = 0) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (target === 0) return;
    const start = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - start;
      const t = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
      setValue(parseFloat((target * eased).toFixed(decimals)));
      if (t >= 1) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration, decimals]);

  return value;
}

// Счётчик, который при смене target анимирует от текущего значения к новому (для "живого" обновления)
export function useLiveCounter(target: number, duration = 1500, decimals = 0, active = true) {
  const [value, setValue] = useState(0);
  const valueRef = useRef(0);
  valueRef.current = value;

  useEffect(() => {
    if (!active || target === 0) return;
    const startValue = valueRef.current;
    const startTime = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const t = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      const newVal = startValue + (target - startValue) * eased;
      setValue(parseFloat(newVal.toFixed(decimals)));
      if (t >= 1) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration, decimals, active]);

  return value;
}
