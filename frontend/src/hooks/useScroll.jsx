import { useEffect } from 'react';
import { scrollToTop } from '../utils/scroll';

// Hook to scroll to top when component mounts
export const useScrollToTop = (dependencies = []) => {
  useEffect(() => {
    scrollToTop();
  }, dependencies);
};

// Hook to scroll to top on click
export const useClickScrollToTop = () => {
  useEffect(() => {
    const handleClick = (e) => {
      // Only scroll to top if it's not a link or button
      const target = e.target;
      const isLink = target.tagName === 'A' || target.closest('a');
      const isButton = target.tagName === 'BUTTON' || target.closest('button');
      
      if (!isLink && !isButton) {
        scrollToTop();
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);
};
