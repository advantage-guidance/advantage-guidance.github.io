// Animate visible task examples; native controls also work without JavaScript.
(() => {
  const videos = [...document.querySelectorAll('.task-video')];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const visibleVideos = new Set();
  const manuallyPaused = new Set();
  const automaticPauses = new Set();

  const pause = (video) => {
    if (!video.paused) {
      automaticPauses.add(video);
      video.pause();
    }
  };

  const updatePlayback = () => {
    videos.forEach((video) => {
      if (document.hidden || !visibleVideos.has(video)) {
        pause(video);
      } else if (!reducedMotion.matches && !manuallyPaused.has(video)) {
        video.play().catch(() => {}); // Controls remain available if autoplay is blocked.
      }
    });
  };

  videos.forEach((video) => {
    video.muted = true;
    video.addEventListener('pause', () => {
      if (!automaticPauses.delete(video)) manuallyPaused.add(video);
    });
    video.addEventListener('play', () => manuallyPaused.delete(video));
  });

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(({ target, isIntersecting }) => {
        if (isIntersecting) visibleVideos.add(target);
        else visibleVideos.delete(target);
      });
      updatePlayback();
    }, { threshold: 0.25 });
    videos.forEach((video) => observer.observe(video));
  }

  document.addEventListener('visibilitychange', updatePlayback);
  reducedMotion.addEventListener('change', () => {
    if (reducedMotion.matches) videos.forEach(pause);
    else updatePlayback();
  });
})();
