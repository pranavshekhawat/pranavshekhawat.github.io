import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import './css/portfolio.css';

const Portfolio = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  let tooltip = null;

    const createTooltip = (x, y, playState) => {
      tooltip = document.createElement('div');
      // use the 'plain' variant so CSS can show a pointer-following plain text tooltip
      tooltip.className = 'flower-play-tooltip plain';
      // set initial text according to current play state
      tooltip.textContent = playState ? 'Close' : 'Play';
      document.body.appendChild(tooltip);
      // initial placement (bottom-right of pointer) — increased offset so tooltip sits further from cursor
      tooltip.style.left = `${x + 10}px`;
      tooltip.style.top = `${y + 8}px`;
      requestAnimationFrame(() => { tooltip.style.opacity = '1'; });
    };

    const removeTooltip = () => {
      if (!tooltip) return;
      tooltip.style.opacity = '0';
      const t = setTimeout(() => {
        if (tooltip && tooltip.parentNode) tooltip.parentNode.removeChild(tooltip);
        tooltip = null;
        clearTimeout(t);
      }, 240);
    };

    // make LinkedIn and Email icons slightly magnetic with small radius (~0.5cm)
    useEffect(() => {
      const icons = Array.from(document.querySelectorAll('.social-icon.linkedin-icon, .social-icon.email-icon'));
      if (!icons.length) return;

      const threshold = 28; // px radius for activation (~0.5cm depending on display)

      // store per-icon center so proximity checks are stable
      const iconData = icons.map(icon => {
        const r = icon.getBoundingClientRect();
        // prepare smooth transform style
        icon.style.transition = 'transform 180ms cubic-bezier(.22,.9,.28,1), box-shadow 180ms';
        icon.style.willChange = 'transform';
        // do NOT add or modify aria-label/title here — leave accessibility attributes untouched
        const title = icon.getAttribute('title') || icon.getAttribute('aria-label') || '';
        return { icon, center: { x: r.left + r.width / 2, y: r.top + r.height / 2 }, title };
      });

      let activeIcon = null;
      let tooltipLocal = null;
      let rafTooltip = null;

      const createTooltipLocal = (text, x, y, anchor) => {
        if (!text) return null;
        if (tooltipLocal) {
          tooltipLocal.textContent = text;
          // update position: if anchor provided position at its upper-right, else fallback to pointer-based top-right
          if (anchor && anchor.getBoundingClientRect) {
            const r = anchor.getBoundingClientRect();
            const w = tooltipLocal.offsetWidth || 120;
            const h = tooltipLocal.offsetHeight || 28;
            let left = r.right + 6; // moved closer (was +12)
            let top = r.top - h - 4; // moved closer (was -8)
            left = Math.min(Math.max(8, left), window.innerWidth - w - 8);
            top = Math.max(8, top);
            tooltipLocal.style.left = `${left}px`;
            tooltipLocal.style.top = `${top}px`;
          } else if (typeof x === 'number' && typeof y === 'number') {
            const w = tooltipLocal.offsetWidth || 120;
            const h = tooltipLocal.offsetHeight || 28;
            let left = x + 8; // moved closer (was +12)
            let top = y - h - 4; // moved closer (was -8)
            left = Math.min(Math.max(8, left), window.innerWidth - w - 8);
            top = Math.max(8, top);
            tooltipLocal.style.left = `${left}px`;
            tooltipLocal.style.top = `${top}px`;
          }
          return tooltipLocal;
        }

        tooltipLocal = document.createElement('div');
        // reuse flower tooltip styling for visual consistency; use plain variant
        tooltipLocal.className = 'flower-play-tooltip plain';
        tooltipLocal.textContent = text;
        // ensure visible and not interactable
        tooltipLocal.style.position = 'fixed';
        tooltipLocal.style.pointerEvents = 'none';
        tooltipLocal.style.zIndex = '11000';
        tooltipLocal.style.opacity = '0';
        tooltipLocal.style.transition = 'opacity 160ms ease, transform 160ms ease';
        document.body.appendChild(tooltipLocal);

        // initial placement: anchor upper-right if provided, else pointer-top-right
        if (anchor && anchor.getBoundingClientRect) {
          const r = anchor.getBoundingClientRect();
          const w = tooltipLocal.offsetWidth || 120;
          const h = tooltipLocal.offsetHeight || 28;
          let left = r.right + 3; // moved closer
          let top = r.top - h - 2; // moved closer
          left = Math.min(Math.max(8, left), window.innerWidth - w - 8);
          top = Math.max(8, top);
          tooltipLocal.style.left = `${left}px`;
          tooltipLocal.style.top = `${top}px`;
        } else if (typeof x === 'number' && typeof y === 'number') {
          const w = tooltipLocal.offsetWidth || 120;
          const h = tooltipLocal.offsetHeight || 28;
          let left = x + 6; // moved closer
          let top = y - h - 2; // moved closer
          left = Math.min(Math.max(8, left), window.innerWidth - w - 8);
          top = Math.max(8, top);
          tooltipLocal.style.left = `${left}px`;
          tooltipLocal.style.top = `${top}px`;
        }

        requestAnimationFrame(() => { tooltipLocal.style.opacity = '1'; });
        return tooltipLocal;
      };

      const removeTooltipLocal = () => {
        if (!tooltipLocal) return;
        tooltipLocal.style.opacity = '0';
        const t = setTimeout(() => {
          if (tooltipLocal && tooltipLocal.parentNode) tooltipLocal.parentNode.removeChild(tooltipLocal);
          tooltipLocal = null;
          clearTimeout(t);
        }, 200);
        if (rafTooltip) { cancelAnimationFrame(rafTooltip); rafTooltip = null; }
      };

      const onPointerMove = (e) => {
        let nearest = null;
        let minDist = Infinity;

        iconData.forEach(d => {
          const dist = Math.hypot(e.clientX - d.center.x, e.clientY - d.center.y);
          if (dist < minDist) { minDist = dist; nearest = d; }
        });

        if (nearest && minDist < threshold) {
          // if another icon was active, reset it
          if (activeIcon && activeIcon !== nearest.icon) {
            activeIcon.style.transform = '';
            activeIcon.style.zIndex = '';
          }

          activeIcon = nearest.icon;
          const dx = Math.round(e.clientX - nearest.center.x);
          const dy = Math.round(e.clientY - nearest.center.y);

          // move the real icon using a transform so layout isn't affected
          activeIcon.style.transform = `translate3d(${dx}px, ${dy}px, 0) scale(1.06)`;
          activeIcon.style.zIndex = '10000';
          document.body.style.cursor = 'pointer';

          // manage tooltip: anchor it to the icon's upper-right corner
          if (nearest.title) createTooltipLocal(nearest.title, undefined, undefined, nearest.icon);
          if (tooltipLocal) {
            if (rafTooltip) cancelAnimationFrame(rafTooltip);
            rafTooltip = requestAnimationFrame(() => {
              const r = nearest.icon.getBoundingClientRect();
              const w = tooltipLocal.offsetWidth || 120;
              const h = tooltipLocal.offsetHeight || 28;
              let left = r.right + 4; // moved closer (was +10)
              let top = r.top - h - 2; // moved closer (was -8)
              left = Math.min(Math.max(8, left), window.innerWidth - w - 8);
              top = Math.max(8, top);
              tooltipLocal.style.left = `${left}px`;
              tooltipLocal.style.top = `${top}px`;
            });
          }

        } else if (activeIcon) {
          // pointer moved out of threshold
          activeIcon.style.transform = '';
          activeIcon.style.zIndex = '';
          activeIcon = null;
          document.body.style.cursor = '';
          removeTooltipLocal();
        }
      };

      const recomputeCenters = () => {
        iconData.forEach(d => {
          const r = d.icon.getBoundingClientRect();
          d.center.x = r.left + r.width / 2;
          d.center.y = r.top + r.height / 2;
        });
      };

      window.addEventListener('pointermove', onPointerMove, { passive: true });
      window.addEventListener('resize', recomputeCenters);
      window.addEventListener('scroll', recomputeCenters, { passive: true });

      // Keep click behavior intact for anchors
      const clickHandlers = [];
      icons.forEach(icon => {
        if (icon.tagName.toLowerCase() === 'a') {
          const handler = (ev) => {
            const href = icon.getAttribute('href') || '';
            if (!href) return;
            if (href.startsWith('mailto:')) return; // allow default
            if (href.startsWith('#')) {
              ev.preventDefault();
              const id = href.slice(1);
              try { document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (e) {}
            } else if (href.startsWith('http') || href.startsWith('//')) {
              ev.preventDefault();
              window.open(href, '_blank', 'noreferrer');
            }
          };
          icon.addEventListener('click', handler);
          clickHandlers.push({ icon, handler });
        }
      });

      return () => {
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('resize', recomputeCenters);
        window.removeEventListener('scroll', recomputeCenters);
        clickHandlers.forEach(({ icon, handler }) => icon.removeEventListener('click', handler));
        // restore styles
        iconData.forEach(d => {
          d.icon.style.transform = '';
          d.icon.style.transition = '';
          d.icon.style.zIndex = '';
        });
        removeTooltipLocal();
        document.body.style.cursor = '';
      };
    }, []);

    // restore magnetic/sticky behavior for flower icon (save original once, follow pointer near it, restore on release/click)
    const flowerOrigRef = useRef(null);
    const flowerReleaseRef = useRef(null);
    useEffect(() => {
      const flower = document.querySelector('.flower-icon');
      if (!flower) return;

      // Update tooltip text if it exists when play state changes
      if (tooltip) {
        tooltip.textContent = isPlaying ? 'Close' : 'Play';
      }

      let rafId = null;
      let isMagnetic = false;
      const threshold = 80; // px
      const baseTransition = 'left 180ms cubic-bezier(.22,.9,.28,1), top 180ms cubic-bezier(.22,.9,.28,1), transform 160ms ease';

      const rect = flower.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;

      if (!flowerOrigRef.current) {
        flowerOrigRef.current = { left: rect.left, top: rect.top };
      }

      const { left: origLeftNum, top: origTopNum } = flowerOrigRef.current;
      const origLeft = `${origLeftNum}px`;
      const origTop = `${origTopNum}px`;
      const origCx = origLeftNum + w / 2;
      const origCy = origTopNum + h / 2;

      // prepare element for free movement
      flower.style.position = 'fixed';
      flower.style.left = origLeft;
      flower.style.top = origTop;
      flower.style.transition = baseTransition;
      flower.setAttribute('draggable', 'false');
      flower.style.touchAction = 'none';
      flower.style.userSelect = 'none';

      let pointerX = origCx;
      let pointerY = origCy;

      const releaseToOrigin = () => {
        if (isMagnetic) {
          isMagnetic = false;
          flower.classList.remove('magnetic');
        }
        removeTooltip();
        document.body.style.cursor = '';
        flower.style.transition = baseTransition;
        flower.style.left = origLeft;
        flower.style.top = origTop;
        pointerX = origCx;
        pointerY = origCy;
        if (rafId) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
      };

      flowerReleaseRef.current = releaseToOrigin;

      const loop = () => {
        if (isMagnetic) {
          flower.style.left = `${pointerX - w / 2}px`;
          flower.style.top = `${pointerY - h / 2}px`;
          if (tooltip) {
            tooltip.style.left = `${pointerX + 10}px`;
            tooltip.style.top = `${pointerY + 8}px`;
          }
        }
        rafId = requestAnimationFrame(loop);
      };

      const onPointerMoveFlower = (e) => {
        pointerX = e.clientX;
        pointerY = e.clientY;
        const dist = Math.hypot(e.clientX - origCx, e.clientY - origCy);

        if (dist < threshold) {
          if (!isMagnetic) {
            isMagnetic = true;
            flower.classList.add('magnetic');
            createTooltip(e.clientX, e.clientY, isPlaying);
            // disable transition while following for immediate response
            flower.style.transition = 'none';
            if (!rafId) rafId = requestAnimationFrame(loop);
          }
        } else {
          if (isMagnetic) {
            releaseToOrigin();
          }
        }
      };

      const onDragStart = (ev) => ev.preventDefault();

      document.addEventListener('pointermove', onPointerMoveFlower, { passive: true });
      flower.addEventListener('dragstart', onDragStart);

      return () => {
        document.removeEventListener('pointermove', onPointerMoveFlower);
        flower.removeEventListener('dragstart', onDragStart);
        if (rafId) cancelAnimationFrame(rafId);
        removeTooltip();
        document.body.style.cursor = '';
        try { flower.style.transition = ''; flower.style.left = ''; flower.style.top = ''; flower.style.position = ''; } catch (e) {}
        flowerReleaseRef.current = null;
      };
    }, [isPlaying]);

    useEffect(() => {
      if (!isPlaying && flowerReleaseRef.current) {
        flowerReleaseRef.current();
      }
    }, [isPlaying]);

    // Bird animation system - spawn birds from mouse pointer when playing
    useEffect(() => {
      if (!isPlaying) return;

      const birdImages = [
        `${process.env.PUBLIC_URL}/images/portfolio/leftbird_wingup.png`,
        `${process.env.PUBLIC_URL}/images/portfolio/leftbird_wingmid.png`,
        `${process.env.PUBLIC_URL}/images/portfolio/leftbird_wingdown.png`,
        `${process.env.PUBLIC_URL}/images/portfolio/rightbird_wingup.png`,
        `${process.env.PUBLIC_URL}/images/portfolio/rightbird_wingmid.png`,
        `${process.env.PUBLIC_URL}/images/portfolio/rightbird_wingdown.png`,
      ];

      let birdId = 0;
      const activeBirds = [];

      const createBird = (x, y) => {
        const bird = document.createElement('div');
        bird.className = 'bird-sprite';
        bird.style.position = 'fixed';
        bird.style.pointerEvents = 'none';
        bird.style.zIndex = '9999';
        bird.style.left = `${x}px`;
        bird.style.top = `${y}px`;
        bird.style.width = '60px';
        bird.style.height = '60px';
        bird.style.opacity = '1';
        bird.style.transform = 'scale(1)';
        
        const img = document.createElement('img');
        const isLeft = Math.random() > 0.5;
        const frames = isLeft ? birdImages.slice(0, 3) : birdImages.slice(3, 6);
        let frameIndex = 0;
        img.src = frames[frameIndex];
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'contain';
        bird.appendChild(img);
        document.body.appendChild(bird);

        // Animate wing flapping
        const flapInterval = setInterval(() => {
          frameIndex = (frameIndex + 1) % frames.length;
          img.src = frames[frameIndex];
        }, 120);

        // Random flight path
        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * 3;
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed - 1; // bias upward

        let currentX = x;
        let currentY = y;
        let opacity = 1;
        let scale = 1;
        let frame = 0;

        const animate = () => {
          frame++;
          currentX += vx;
          currentY += vy;
          
          // Gradually shrink and fade
          if (frame > 60) {
            const fadeProgress = (frame - 60) / 120;
            scale = Math.max(0, 1 - fadeProgress * 0.7);
            opacity = Math.max(0, 1 - fadeProgress);
          }

          bird.style.left = `${currentX}px`;
          bird.style.top = `${currentY}px`;
          bird.style.transform = `scale(${scale}) rotate(${angle * 180 / Math.PI}deg)`;
          bird.style.opacity = opacity;

          // Remove if off screen or fully faded
          if (opacity <= 0 || currentX < -200 || currentX > window.innerWidth + 200 || 
              currentY < -200 || currentY > window.innerHeight + 200) {
            clearInterval(flapInterval);
            bird.remove();
            const idx = activeBirds.indexOf(bird);
            if (idx > -1) activeBirds.splice(idx, 1);
            return;
          }

          requestAnimationFrame(animate);
        };

        requestAnimationFrame(animate);
        activeBirds.push(bird);
      };

      const onPointerMoveBirds = (e) => {
        // Spawn birds occasionally as mouse moves
        if (Math.random() < 0.15) { // 15% chance per frame
          createBird(e.clientX, e.clientY);
        }
      };

      const onClickBirds = (e) => {
        // Spawn 2-3 birds on click
        const count = 2 + Math.floor(Math.random() * 2);
        for (let i = 0; i < count; i++) {
          setTimeout(() => createBird(e.clientX, e.clientY), i * 50);
        }
      };

      document.addEventListener('pointermove', onPointerMoveBirds, { passive: true });
      document.addEventListener('click', onClickBirds);

      return () => {
        document.removeEventListener('pointermove', onPointerMoveBirds);
        document.removeEventListener('click', onClickBirds);
        // Clean up all active birds
        activeBirds.forEach(bird => bird.remove());
        activeBirds.length = 0;
      };
    }, [isPlaying]);

   var year = new Date().getFullYear();
	const [loadingVisible, setLoadingVisible] = useState(true);
	const [progress, setProgress] = useState(0);
	const progressRef = useRef(0);
	const loaderRef = useRef(null);
	const progressIntervalRef = useRef(null);
	const startTimeoutRef = useRef(null);
  // measure SVG circle length to ensure full 360° completion without gaps
  const circleRef = useRef(null);
  const [circumference, setCircumference] = useState(339.292);
  // Play-mode round cursor overlay
  useEffect(() => {
    if (!isPlaying) {
      document.body.classList.remove('play-mode-cursor-hidden');
      return;
    }
    const cursor = document.createElement('div');
    cursor.className = 'round-play-cursor';
    document.body.appendChild(cursor);
    document.body.classList.add('play-mode-cursor-hidden');
    let rafId = null;
    let pending = false;
    let cx = 0, cy = 0;
    const update = () => {
      cursor.style.left = `${cx}px`;
      cursor.style.top = `${cy}px`;
      pending = false;
    };
    const onPointerMove = (e) => {
      cx = e.clientX;
      cy = e.clientY;
      if (!pending) {
        pending = true;
        rafId = requestAnimationFrame(update);
      }
    };
    const onPointerDown = () => { cursor.classList.add('is-clicking'); };
    const onPointerUp = () => { cursor.classList.remove('is-clicking'); };
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointerup', onPointerUp);
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerup', onPointerUp);
      if (rafId) cancelAnimationFrame(rafId);
      try { cursor.remove(); } catch (e) {}
      document.body.classList.remove('play-mode-cursor-hidden');
    };
  }, [isPlaying]);
  // when loader is visible, measure the actual rendered circle length
  useEffect(() => {
    if (!loadingVisible) return;
    const el = circleRef.current;
    if (el && typeof el.getTotalLength === 'function') {
      try {
        const len = el.getTotalLength();
        if (Number.isFinite(len) && len > 0) setCircumference(len);
      } catch (e) {}
    }
  }, [loadingVisible]);
	// track mouse to position loader
	useEffect(() => {
		const onMouseMove = (e) => {
			if (loaderRef.current) {
				loaderRef.current.style.left = `${e.clientX}px`;
				loaderRef.current.style.top = `${e.clientY}px`;
			}
		};
		window.addEventListener('mousemove', onMouseMove);
		return () => window.removeEventListener('mousemove', onMouseMove);
	}, []);
	const containerRef = useRef(null);
	const cloudsRef = useRef(null);
	const cloudsWrapperRef = useRef(null);
	// adjust this value to make cloud image appear larger (percentage of original)
	const CLOUD_SCALE = 40; // increase to make clouds larger
	const elemsRef = useRef([]);
	const addToRefs = (el) => {
		if (el && !elemsRef.current.includes(el)) elemsRef.current.push(el);
	};

	// PUBLIC assets
	const bgImage = `${process.env.PUBLIC_URL}/images/portfolio/firstbackground.jpg`;
	const cloudsImage = `${process.env.PUBLIC_URL}/images/portfolio/clouds.png`;

	// start a slow infinite clouds animation by translating the wide inner element
	useEffect(() => {
		if (!cloudsRef.current) return;

    let offsetPx = 0;
    const speedPxPerSec = 24; // adjust for desired speed

    const onTick = () => {
      // seconds since last tick (deltaRatio is relative to 60fps)
      const dt = gsap.ticker.deltaRatio() / 60;
      offsetPx -= speedPxPerSec * dt;
      if (cloudsRef.current) {
        // continuous scroll using background-position X (seamless with repeat-x)
        cloudsRef.current.style.backgroundPosition = `${offsetPx}px 50%`;
      }
    };

    gsap.ticker.add(onTick);
    return () => {
      gsap.ticker.remove(onTick);
      try {
        if (cloudsRef.current) cloudsRef.current.style.backgroundPosition = '0% 50%';
      } catch (e) {}
    };
  }, []);

	useEffect(() => {
		// use PUBLIC_URL so the asset is resolved correctly when served from a subpath (e.g. GitHub Pages)
		const imagePath = bgImage;

		// keep top visible for at least this many ms before starting the scroll
		const MIN_TOP_MS = 1000;
		const startTime = Date.now();
		let startTimeout = null;

		const animate = () => {
			const container = containerRef.current;
			if (!container) return;

			// ensure starting position shows the upper half (use percentages so GSAP can interpolate)
			gsap.set(container, { backgroundPosition: '50% 0%' });

			// timeline: scroll background then reveal content
			const tl = gsap.timeline();
			tl.to(container, {
				backgroundPosition: '50% 100%',
				duration: 1, // 1s smooth scroll as requested
				ease: 'power2.inOut',
			});

			// move clouds wrapper up in sync with background scroll so they appear with the lower background
			if (cloudsWrapperRef.current) {
				tl.to(cloudsWrapperRef.current, { y: '0%', duration: 1, ease: 'power2.inOut' }, 0);
				// ensure immediately visible (no fade)
				tl.set(cloudsWrapperRef.current, { opacity: 1 }, 0);
			}

			// reveal children AFTER the background scroll completes
			tl.fromTo(elemsRef.current,
				{ y: 24, opacity: 0 },
				{ y: 0, opacity: 1, stagger: 0.12, duration: 0.7, ease: 'power2.out' }
			);
		};

		// preload background image and run animation as soon as it loads
		const img = new Image();
		let didAnimate = false;
		// start a simulated progress while image loads
		progressIntervalRef.current = window.setInterval(() => {
			const newP = Math.min(95, progressRef.current + Math.floor(Math.random() * 3) + 1);
			setProgress(newP);
			progressRef.current = newP;
		}, 50);

		// helper to animate progressRef.current -> 100 over `duration` ms using rAF
		let rafId = null;
		const animateProgressTo100 = (duration) => {
			if (duration <= 0) {
				setProgress(100);
				progressRef.current = 100;
				if (progressIntervalRef.current) {
					window.clearInterval(progressIntervalRef.current);
					progressIntervalRef.current = null;
				}
				return;
			}
			const startVal = progressRef.current;
			const startTime = Date.now();
			const step = () => {
				const now = Date.now();
				const t = Math.min(1, (now - startTime) / duration);
				const val = Math.round(startVal + (100 - startVal) * t);
				setProgress(val);
				progressRef.current = val;
				if (t < 1) {
					rafId = window.requestAnimationFrame(step);
				} else {
					if (progressIntervalRef.current) {
						window.clearInterval(progressIntervalRef.current);
						progressIntervalRef.current = null;
					}
				}
			};
			rafId = window.requestAnimationFrame(step);
		};

		const onImgLoad = () => {
			if (didAnimate) return;
			didAnimate = true;
			// ensure we have been showing the top for at least MIN_TOP_MS
			const elapsed = Date.now() - startTime;
			const waitTop = Math.max(0, MIN_TOP_MS - elapsed);
			// Ensure progress takes at least 1s from start
			const MIN_PROGRESS_MS = 1000;
			const waitProgress = Math.max(0, MIN_PROGRESS_MS - elapsed);
			// start animating the progress to 100 over waitProgress ms (so it completes at MIN_PROGRESS_MS)
			animateProgressTo100(waitProgress);
			// start background animation after both constraints are satisfied
			const totalWait = Math.max(waitTop, waitProgress);
			startTimeout = window.setTimeout(() => {
				// ensure progress is 100 and interval cleared
				if (progressIntervalRef.current) {
					window.clearInterval(progressIntervalRef.current);
					progressIntervalRef.current = null;
				}
				setProgress(100);
				progressRef.current = 100;
				if (rafId) window.cancelAnimationFrame(rafId);
				animate();
        // hide loader shortly after to allow final frame to render visibly
        setTimeout(() => setLoadingVisible(false), 220);
			}, totalWait);
		};

		img.src = imagePath;
		if (img.complete) {
			onImgLoad();
		} else {
			img.addEventListener('load', onImgLoad);
			// fallback: listen for window load in case other resources block
			const onWindowLoad = () => onImgLoad();
			window.addEventListener('load', onWindowLoad);

			return () => {
				img.removeEventListener('load', onImgLoad);
				window.removeEventListener('load', onWindowLoad);
				if (startTimeout) window.clearTimeout(startTimeout);
				if (progressIntervalRef.current) window.clearInterval(progressIntervalRef.current);
				if (startTimeoutRef.current) window.clearTimeout(startTimeoutRef.current);
			};
		}
	}, [bgImage]);

	return (<>
      
        {/* <div ref={addToRefs} className='shadow-box shadow-box-one'></div>
        <div ref={addToRefs} className='shadow-box shadow-box-two'></div> */}
      
		<div ref={containerRef} className="portfolio-container" style={{ backgroundImage: `url(${bgImage})` }}>
      
			{/* cloud layer - wrapper crops overflow; inner element is wider and translated to create seamless motion */}
			<div ref={cloudsWrapperRef} className="clouds-wrapper">
				<div ref={cloudsRef} className="clouds" style={{ backgroundImage: `url(${cloudsImage})`, backgroundSize: `${CLOUD_SCALE}% auto` }} />
			</div>
       
			<div className="portfolio-content" style={{ opacity: loadingVisible ? 0 : undefined, pointerEvents: loadingVisible ? 'none' : 'auto' }}>

				{/* Social media icons - Top Left */}
      <div ref={addToRefs} className="social-icons ">
        <a href="https://www.linkedin.com/in/pranavshekhawat" target="_blank" rel="noreferrer" className="social-icon linkedin-icon blur-pill" aria-label="LinkedIn">
          <svg x="0px" y="0px" viewBox="0 0 24 24">
            <path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z"></path>
          </svg>
        </a>
        <a href="mailto:pranavshekhawat.nift@gmail.com" className="social-icon email-icon blur-pill" aria-label="Email">
          <svg x="0px" y="0px" viewBox="0 0 24 24">
            <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"></path>
          </svg>
        </a>
      </div>

      <a
        ref={addToRefs}
        className={`flower-icon ${isPlaying ? 'playing' : ''}`}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (flowerReleaseRef.current) {
            flowerReleaseRef.current();
          } else if (flowerOrigRef.current) {
            const { left, top } = flowerOrigRef.current;
            const flower = e.currentTarget;
            flower.style.position = 'fixed';
            flower.style.left = `${left}px`;
            flower.style.top = `${top}px`;
          }

          setIsPlaying(prev => !prev);
        }}
      >
        <svg x="0px" y="0px" viewBox="0 0 512 512">
          <path d="M512,224.438c0-63.766-51.703-115.469-115.484-115.469c-8.781,0-17.328,1-25.531,2.859
        C365.656,52.984,316.219,6.875,256,6.875c-60.234,0-109.672,46.109-114.984,104.953c-8.219-1.859-16.766-2.859-25.531-2.859
        C51.703,108.969,0,160.672,0,224.438c0,47.594,28.797,88.469,69.906,106.141c-10.297,17.281-16.234,37.484-16.234,59.063
        c0,63.766,51.703,115.484,115.484,115.484c34.625,0,65.672-15.266,86.844-39.406c21.156,24.141,52.219,39.406,86.844,39.406
        c63.781,0,115.484-51.719,115.484-115.484c0-21.578-5.938-41.781-16.25-59.063C483.203,312.906,512,272.031,512,224.438z
         M256,372.531c-53.563,0-97-43.406-97-97c0-53.563,43.438-96.984,97-96.984s96.984,43.422,96.984,96.984
        C352.984,329.125,309.563,372.531,256,372.531z"/>
        </svg>
      </a>

      {/* Portfolio title */}
      <h1 ref={addToRefs} className="portfolio-title">PRANAV SHEKHAWAT</h1>

     

      <div ref={addToRefs} className="copyright_text blur-pill"><p>© {year} Pranav Shekhawat.</p></div>
				<h1 ref={addToRefs} className={`portfolio-welcome ${isPlaying ? 'hidden' : ''}`}>कलम कलम कलम कलम कलम कलम कलम कलम कलम कलम कलम कलम कलम कलम </h1>
				<p ref={addToRefs} className={isPlaying ? 'hidden' : ''} style={{ marginTop: '0.75rem', opacity: isPlaying ? 0 : undefined }}>
					Frontend developer & designer — welcome to my portfolio.
				</p>
				<div ref={addToRefs} className={isPlaying ? 'hidden' : ''} style={{ marginTop: '1.25rem', opacity: isPlaying ? 0 : undefined }}>
					<button className="portfolio-button">View projects</button>
				</div>
			</div>

			{loadingVisible && (
				<div ref={loaderRef} className="loader">
					<div className="loader-circle">
						<svg viewBox="0 0 120 120">
              {/* Background circle */}
							<circle 
								cx="60" 
								cy="60" 
								r="54"
								className="loader-circle-bg"
							/>
							{/* Progress circle */}
							<circle 
								cx="60" 
								cy="60" 
                r="54"
                ref={circleRef}
								className="loader-circle-progress"
								style={{
                  strokeDasharray: circumference,
                  // ensure top start and full completion at 100%
                  strokeDashoffset: progress >= 100 ? 0 : (circumference * (1 - Math.max(0, Math.min(100, progress)) / 100))
								}}
							/>
						</svg>
						<span>{progress}%</span>
					</div>
				</div>
			)}
		</div>
	</>);
};

export default Portfolio;