const indicator = document.querySelector(".transcribing-status");

if (indicator && "IntersectionObserver" in window) {
  const observer = new IntersectionObserver(([entry]) => {
    indicator.dataset.paused = String(!entry.isIntersecting);
  });

  observer.observe(indicator);
}
