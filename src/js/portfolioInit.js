// Reveal portfolio title as soon as DOM is ready to avoid FOUC
// Adds the .visible class on the next animation frame
(function(){
  function revealTitle(){
    var el = document.querySelector('.portfolio-title');
    if(!el) return;
    // Use rAF so the browser has applied initial styles before we show
    requestAnimationFrame(function(){ el.classList.add('visible'); });
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', revealTitle);
    // fallback in case DOMContentLoaded doesn't fire early enough
    window.addEventListener('load', function(){ setTimeout(revealTitle, 50); });
  } else {
    revealTitle();
  }
})();
