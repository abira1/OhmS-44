import { useEffect, useState, RefObject } from 'react';

interface UseIntersectionObserverOptions {
  threshold?: number | number[];
  root?: Element | null;
  rootMargin?: string;
  freezeOnceVisible?: boolean;
}

export const useIntersectionObserver = (
  elementRef: RefObject<Element>,
  options: UseIntersectionObserverOptions = {}
): [boolean, IntersectionObserverEntry | null] => {
  const {
    threshold = 0,
    root = null,
    rootMargin = '0%',
    freezeOnceVisible = false
  } = options;

  const [isIntersecting, setIsIntersecting] = useState(false);
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);

  useEffect(() => {
    const element = elementRef.current;
    const hasIOSupport = !!window.IntersectionObserver;

    if (!hasIOSupport || !element) {
      return;
    }

    const observerParams = { threshold, root, rootMargin };
    const observer = new IntersectionObserver(
      ([entry]: IntersectionObserverEntry[]) => {
        const isElementIntersecting = entry.isIntersecting;
        
        setEntry(entry);
        
        if (!freezeOnceVisible || !isIntersecting) {
          setIsIntersecting(isElementIntersecting);
        }
      },
      observerParams
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [elementRef, threshold, root, rootMargin, freezeOnceVisible, isIntersecting]);

  return [isIntersecting, entry];
};

// Hook for observing multiple elements
export const useIntersectionObserverMultiple = (
  elementsRef: RefObject<Element>[],
  options: UseIntersectionObserverOptions = {}
): [boolean[], IntersectionObserverEntry[]] => {
  const {
    threshold = 0,
    root = null,
    rootMargin = '0%',
    freezeOnceVisible = false
  } = options;

  const [intersectingStates, setIntersectingStates] = useState<boolean[]>(
    new Array(elementsRef.length).fill(false)
  );
  const [entries, setEntries] = useState<IntersectionObserverEntry[]>([]);

  useEffect(() => {
    const elements = elementsRef.map(ref => ref.current).filter(Boolean);
    const hasIOSupport = !!window.IntersectionObserver;

    if (!hasIOSupport || elements.length === 0) {
      return;
    }

    const observerParams = { threshold, root, rootMargin };
    const observer = new IntersectionObserver(
      (observerEntries: IntersectionObserverEntry[]) => {
        setEntries(observerEntries);
        
        observerEntries.forEach((entry) => {
          const elementIndex = elements.indexOf(entry.target as Element);
          if (elementIndex !== -1) {
            setIntersectingStates(prev => {
              const newStates = [...prev];
              if (!freezeOnceVisible || !newStates[elementIndex]) {
                newStates[elementIndex] = entry.isIntersecting;
              }
              return newStates;
            });
          }
        });
      },
      observerParams
    );

    elements.forEach(element => {
      if (element) observer.observe(element);
    });

    return () => {
      observer.disconnect();
    };
  }, [elementsRef, threshold, root, rootMargin, freezeOnceVisible]);

  return [intersectingStates, entries];
};

// Hook for lazy loading with callback
export const useLazyLoad = (
  elementRef: RefObject<Element>,
  callback: () => void,
  options: UseIntersectionObserverOptions = {}
) => {
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isIntersecting] = useIntersectionObserver(elementRef, {
    ...options,
    freezeOnceVisible: true
  });

  useEffect(() => {
    if (isIntersecting && !hasLoaded) {
      callback();
      setHasLoaded(true);
    }
  }, [isIntersecting, hasLoaded, callback]);

  return hasLoaded;
};

// Hook for scroll-triggered animations
export const useScrollAnimation = (
  elementRef: RefObject<Element>,
  animationClass: string,
  options: UseIntersectionObserverOptions = {}
) => {
  const [isIntersecting] = useIntersectionObserver(elementRef, {
    threshold: 0.1,
    ...options
  });

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    if (isIntersecting) {
      element.classList.add(animationClass);
    } else {
      element.classList.remove(animationClass);
    }
  }, [isIntersecting, animationClass, elementRef]);

  return isIntersecting;
};
