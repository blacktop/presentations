function RevealStoryVideos() {
  return {
    id: 'story-videos',
    init(deck) {
      const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
      const useHtml = new URLSearchParams(window.location.search).get('storyMedia') === 'html';

      document.querySelectorAll('section[data-story-video]').forEach(slide => {
        const media = slide.querySelector('.story-video-media');
        const video = media?.querySelector('video');
        const button = media?.querySelector('button');
        const start = slide.querySelector(slide.dataset.storyVideo);
        const hold = slide.dataset.storyVideoHold
          ? slide.querySelector(slide.dataset.storyVideoHold) : null;
        if (!media || !video || !button || !start) return;
        let mode = 'reset';
        let attempt = null;

        function available() {
          return !useHtml && !motion.matches
            && video.readyState >= 1 && !video.error;
        }

        function play() {
          const current = {};
          attempt = current;
          button.hidden = false;
          video.currentTime = 0;
          video.play().catch(() => {
            if (attempt === current && mode === 'play') button.hidden = false;
          });
        }

        function sync() {
          const ready = available();
          const onSlide = deck.getCurrentSlide() === slide;
          const next = !ready || !onSlide ? 'reset'
            : hold?.classList.contains('visible') ? 'hold'
            : start.classList.contains('visible') ? 'play' : 'reset';
          const changed = next !== mode;
          mode = next;
          media.hidden = !ready;
          slide.classList.toggle('story-video-active', ready);
          slide.classList.toggle('story-video-holding', next === 'hold');
          if (next === 'play') {
            if (changed) play();
            return;
          }
          attempt = null;
          video.pause();
          button.hidden = true;
          if (next === 'reset' && video.readyState >= 1) video.currentTime = 0;
        }

        button.addEventListener('click', event => {
          event.stopPropagation();
          if (mode === 'play' && available()) play();
        });
        video.addEventListener('playing', () => { button.hidden = true; });
        video.addEventListener('pause', () => {
          if (mode === 'play' && !video.ended && available()) button.hidden = false;
        });
        video.addEventListener('ended', () => { button.hidden = true; });
        video.addEventListener('loadedmetadata', sync);
        video.addEventListener('error', sync);
        ['ready', 'slidechanged', 'fragmentshown', 'fragmenthidden'].forEach(event => {
          deck.on(event, sync);
        });
        motion.addEventListener('change', sync);
        sync();
      });
    },
  };
}
