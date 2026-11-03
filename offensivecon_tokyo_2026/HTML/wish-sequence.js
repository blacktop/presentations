function RevealWishSequence() {
  return {
    id: 'wish-sequence',
    init(deck) {
      const sequence = document.getElementById('wish-sequence');
      const video = document.getElementById('wish-intro');
      if (!sequence || !video) return;
      const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
      let activeAttempt = null;

      function visible() {
        return deck.getCurrentSlide()?.id === 'check-success'
          && sequence.classList.contains('visible');
      }

      function sync() {
        const staticView = motion.matches;
        if (!visible() || staticView) {
          activeAttempt = null;
          video.pause();
          video.currentTime = 0;
          sequence.classList.toggle('is-reaction', visible() && staticView);
          return;
        }
        if (activeAttempt) return;
        const attempt = {};
        activeAttempt = attempt;
        sequence.classList.remove('is-reaction');
        video.currentTime = 0;
        video.play().catch(() => {
          if (activeAttempt === attempt && visible()) {
            sequence.classList.add('is-reaction');
          }
        });
      }

      video.addEventListener('ended', () => {
        if (video.ended && activeAttempt && visible()
            && !motion.matches) {
          sequence.classList.add('is-reaction');
        }
      });
      ['ready', 'slidechanged', 'fragmentshown', 'fragmenthidden'].forEach(event => {
        deck.on(event, sync);
      });
      motion.addEventListener('change', sync);
      sync();
    },
  };
}
