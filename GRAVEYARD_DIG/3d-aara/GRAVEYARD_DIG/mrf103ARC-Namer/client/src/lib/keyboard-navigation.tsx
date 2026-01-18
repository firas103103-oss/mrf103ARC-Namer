/**
 * Keyboard Navigation Utilities
 * Helpers for accessible keyboard navigation
 */

import { useCallback, useEffect, useRef } from "react";

/**
 * Hook for handling keyboard navigation within a list
 */
export function useArrowNavigation<T extends HTMLElement>(
  items: unknown[],
  options: {
    onSelect?: (index: number) => void;
    onEscape?: () => void;
    loop?: boolean;
    orientation?: "vertical" | "horizontal";
  } = {}
) {
  const { onSelect, onEscape, loop = true, orientation = "vertical" } = options;
  const containerRef = useRef<T>(null);
  const currentIndex = useRef(0);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const prevKey = orientation === "vertical" ? "ArrowUp" : "ArrowLeft";
      const nextKey = orientation === "vertical" ? "ArrowDown" : "ArrowRight";

      if (e.key === prevKey) {
        e.preventDefault();
        if (currentIndex.current > 0) {
          currentIndex.current--;
        } else if (loop) {
          currentIndex.current = items.length - 1;
        }
        focusItem(currentIndex.current);
      } else if (e.key === nextKey) {
        e.preventDefault();
        if (currentIndex.current < items.length - 1) {
          currentIndex.current++;
        } else if (loop) {
          currentIndex.current = 0;
        }
        focusItem(currentIndex.current);
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onSelect?.(currentIndex.current);
      } else if (e.key === "Escape") {
        onEscape?.();
      } else if (e.key === "Home") {
        e.preventDefault();
        currentIndex.current = 0;
        focusItem(0);
      } else if (e.key === "End") {
        e.preventDefault();
        currentIndex.current = items.length - 1;
        focusItem(items.length - 1);
      }
    },
    [items.length, loop, onSelect, onEscape, orientation]
  );

  const focusItem = useCallback((index: number) => {
    const container = containerRef.current;
    if (!container) return;

    const focusableItems = container.querySelectorAll<HTMLElement>(
      '[tabindex="0"], button, [role="button"], a[href], input, select, textarea'
    );

    if (focusableItems[index]) {
      focusableItems[index].focus();
    }
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener("keydown", handleKeyDown);
    return () => container.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return { containerRef, currentIndex: currentIndex.current, focusItem };
}

/**
 * Hook for focus trap (modal dialogs)
 */
export function useFocusTrap<T extends HTMLElement>() {
  const containerRef = useRef<T>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    container.addEventListener("keydown", handleKeyDown);
    firstElement?.focus();

    return () => container.removeEventListener("keydown", handleKeyDown);
  }, []);

  return containerRef;
}

/**
 * Hook for roving tabindex pattern
 */
export function useRovingTabIndex<T extends HTMLElement>(initialIndex = 0) {
  const containerRef = useRef<T>(null);
  const activeIndex = useRef(initialIndex);

  const updateTabIndex = useCallback((index: number) => {
    const container = containerRef.current;
    if (!container) return;

    const items = container.querySelectorAll<HTMLElement>('[role="menuitem"], [role="option"], [role="tab"]');
    
    items.forEach((item, i) => {
      item.tabIndex = i === index ? 0 : -1;
      if (i === index) {
        item.focus();
      }
    });

    activeIndex.current = index;
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const container = containerRef.current;
      if (!container) return;

      const items = container.querySelectorAll<HTMLElement>('[role="menuitem"], [role="option"], [role="tab"]');
      const count = items.length;

      if (e.key === "ArrowDown" || e.key === "ArrowRight") {
        e.preventDefault();
        const nextIndex = (activeIndex.current + 1) % count;
        updateTabIndex(nextIndex);
      } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
        e.preventDefault();
        const prevIndex = (activeIndex.current - 1 + count) % count;
        updateTabIndex(prevIndex);
      }
    },
    [updateTabIndex]
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener("keydown", handleKeyDown);
    updateTabIndex(initialIndex);

    return () => container.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown, initialIndex, updateTabIndex]);

  return { containerRef, activeIndex: activeIndex.current, updateTabIndex };
}

/**
 * Skip to main content link
 */
export function SkipToContent({ targetId = "main-content" }: { targetId?: string }) {
  const handleClick = () => {
    const target = document.getElementById(targetId);
    if (target) {
      target.focus();
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <a
      href={`#${targetId}`}
      onClick={handleClick}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md"
    >
      Skip to main content
    </a>
  );
}
