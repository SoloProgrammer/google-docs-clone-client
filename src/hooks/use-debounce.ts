import { useState, useEffect } from "react";

export const useDebounce = <T>(val: T, delay: number = 1000) => {
  const [value, setValue] = useState<T | null>(null);

  useEffect(() => {
    let timer = setTimeout(() => {
      setValue(val as T);
    }, delay);

    return () => clearTimeout(timer);
  }, [val]);

  return value;
};
