// Scroll utility functions
export const scrollToTop = (smooth = true) => {
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: smooth ? 'smooth' : 'auto'
  });
};

export const scrollToElement = (elementId, smooth = true) => {
  const element = document.getElementById(elementId);
  if (element) {
    element.scrollIntoView({
      behavior: smooth ? 'smooth' : 'auto',
      block: 'start'
    });
  }
};

export const scrollToPosition = (x, y, smooth = true) => {
  window.scrollTo({
    top: y,
    left: x,
    behavior: smooth ? 'smooth' : 'auto'
  });
};

// Handle click events to scroll to top
export const handleClickScrollToTop = (e) => {
  // Only scroll to top if it's not a link or button with specific behavior
  const target = e.target;
  const isLink = target.tagName === 'A' || target.closest('a');
  const isButton = target.tagName === 'BUTTON' || target.closest('button');
  
  if (!isLink && !isButton) {
    scrollToTop();
  }
};
