import { useEffect, useRef } from 'react';

interface UseMobileKeyboardFixOptions {
  enabled?: boolean;
  delay?: number;
  block?: 'center' | 'nearest' | 'start' | 'end';
}

/**
 * Custom hook to fix mobile keyboard covering input fields in dialogs with ScrollArea.
 *
 * When a form input receives focus on mobile, the virtual keyboard appears and can
 * cover the input field. This hook automatically scrolls the focused input into view
 * within the ScrollArea container.
 *
 * @param options Configuration options
 * @param options.enabled Whether the hook is active (default: true)
 * @param options.delay Delay in ms before scrolling to account for keyboard animation (default: 300ms)
 * @param options.block Scroll positioning: 'center', 'nearest', 'start', or 'end' (default: 'center')
 * @returns A ref that must be attached to the scroll container parent element
 *
 * @example
 * ```tsx
 * const isMobile = useIsMobile();
 * const scrollContainerRef = useMobileKeyboardFix({
 *   enabled: isMobile && isOpen,
 *   delay: 350,
 *   block: 'center'
 * });
 *
 * return (
 *   <div ref={scrollContainerRef} className="overflow-auto">
 *     <ScrollArea>
 *       <form>
 *         <textarea />
 *       </form>
 *     </ScrollArea>
 *   </div>
 * );
 * ```
 */
export function useMobileKeyboardFix(options: UseMobileKeyboardFixOptions = {}) {
  const {
    enabled = true,
    delay = 300,
    block = 'center'
  } = options;

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled) return;

    const handleFocus = (event: FocusEvent) => {
      const target = event.target as HTMLElement;

      // Only handle focus on form inputs
      if (!target.matches('input, textarea, select')) {
        return;
      }

      // Find the ScrollArea viewport (Radix UI uses this data attribute)
      const scrollContainer = scrollContainerRef.current?.querySelector('[data-radix-scroll-area-viewport]');

      if (!scrollContainer) {
        // Fallback: try to scroll the element into view directly if ScrollArea not found
        setTimeout(() => {
          target.scrollIntoView({
            behavior: 'smooth',
            block,
            inline: 'nearest'
          });
        }, delay);
        return;
      }

      // Get bounding rectangles for position calculations
      const containerRect = scrollContainer.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();

      // Calculate if element is visible within the viewport
      const isAboveViewport = targetRect.top < containerRect.top;
      const isBelowViewport = targetRect.bottom > containerRect.bottom;

      // Only scroll if the element is outside the visible area
      if (isAboveViewport || isBelowViewport) {
        setTimeout(() => {
          // Calculate the scroll position needed
          const scrollTop = scrollContainer.scrollTop;
          const containerTop = containerRect.top;
          const targetTop = targetRect.top;
          const offsetTop = scrollTop + (targetTop - containerTop);

          // Adjust scroll position based on desired block position
          let finalScrollTop = offsetTop;

          if (block === 'center') {
            const containerHeight = containerRect.height;
            const targetHeight = targetRect.height;
            finalScrollTop = offsetTop - (containerHeight / 2) + (targetHeight / 2);
          } else if (block === 'start') {
            finalScrollTop = offsetTop - 20; // 20px padding from top
          } else if (block === 'end') {
            const containerHeight = containerRect.height;
            const targetHeight = targetRect.height;
            finalScrollTop = offsetTop - containerHeight + targetHeight + 20; // 20px padding from bottom
          }
          // 'nearest' uses the calculated offsetTop as-is

          // Smooth scroll to the calculated position
          scrollContainer.scrollTo({
            top: finalScrollTop,
            behavior: 'smooth'
          });
        }, delay);
      }
    };

    // Use capture phase to catch focus events before they bubble
    // This ensures we catch the event even if it's handled by other listeners
    document.addEventListener('focusin', handleFocus, true);

    return () => {
      document.removeEventListener('focusin', handleFocus, true);
    };
  }, [enabled, delay, block]);

  return scrollContainerRef;
}
