import { forwardRef, useRef } from 'react';

/**
 * Wraps any element (div, Link, a...) in a cursor-tracking radial glow,
 * shown only while hovered. Pass `as` to control the rendered tag/component.
 */
const SpotlightCard = forwardRef(
  ({ as: Component = 'div', children, className = '', spotlightColor, style, ...props }, forwardedRef) => {
    const localRef = useRef(null);

    const setRefs = (node) => {
      localRef.current = node;
      if (typeof forwardedRef === 'function') forwardedRef(node);
      else if (forwardedRef) forwardedRef.current = node;
    };

    const handleMouseMove = (e) => {
      const el = localRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      el.style.setProperty('--spot-x', `${e.clientX - rect.left}px`);
      el.style.setProperty('--spot-y', `${e.clientY - rect.top}px`);
    };

    return (
      <Component
        ref={setRefs}
        onMouseMove={handleMouseMove}
        className={`relative overflow-hidden group ${className}`}
        style={spotlightColor ? { '--spot-color': spotlightColor, ...style } : style}
        {...props}
      >
        <div className="spotlight" />
        {children}
      </Component>
    );
  }
);

SpotlightCard.displayName = 'SpotlightCard';

export default SpotlightCard;
