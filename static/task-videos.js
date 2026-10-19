// Play task examples as noninteractive animations while they are visible.
(() => {
  const videos = [...document.querySelectorAll('.task-video')];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const visibleVideos = new Set();
  const updatePlayback = () => {
    videos.forEach((video) => {
      if (document.hidden || !visibleVideos.has(video) || reducedMotion.matches) {
        video.pause();
      } else {
        video.play().catch(() => {}); // Keep the poster if autoplay is blocked.
      }
    });
  };

  videos.forEach((video) => {
    video.muted = true;
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
  } else {
    videos.forEach((video) => visibleVideos.add(video));
    updatePlayback();
  }

  document.addEventListener('visibilitychange', updatePlayback);
  reducedMotion.addEventListener('change', updatePlayback);
})();
