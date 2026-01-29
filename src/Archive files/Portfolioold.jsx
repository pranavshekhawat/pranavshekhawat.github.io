import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./css/flipbook.css";
import PlayArea from "./PlayArea";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import HorizontalScroll from './utils/HorizontalScroll';
gsap.registerPlugin(ScrollTrigger);

const Portfolioold = () => {
  var year = new Date().getFullYear();
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(false);
  const [flowerRect, setFlowerRect] = useState(null);
  const [containerWidth, setContainerWidth] = useState(null);
  const scrollContainerRef = React.useRef(null);
  const scrollWrapperRef = React.useRef(null);
  const hsRef = React.useRef(null);
  const flowerOrigRef = React.useRef(null);

  React.useEffect(() => {
    // Safe null-check before accessing offsetWidth
    if (scrollContainerRef.current) {
      setContainerWidth(scrollContainerRef.current.offsetWidth);
    }
  }, []);

  // ensure the first project is centered on initial load
  React.useEffect(() => {
    if (!scrollContainerRef.current) return;
    // small delay to allow HorizontalScroll or layout to finish measuring
    const t = setTimeout(() => {
      try { scrollToProject('project-one'); } catch (e) { /* ignore */ }
    }, 120);
    return () => clearTimeout(t);
  }, [containerWidth]);

  // instantiate HorizontalScroll after mount and when ref exists
  React.useEffect(() => {
    if (!scrollContainerRef.current) return;

    const hsInstance = new HorizontalScroll({
      container: scrollContainerRef.current,
      blocks: scrollContainerRef.current.querySelectorAll('.block'),
      isAnimated: true,
      spring: 0.12,
    });

    hsRef.current = hsInstance; // keep reference for programmatic scrolling

    // ensure sizes are calculated
    if (typeof hsInstance.onResize === 'function') hsInstance.onResize();

    return () => {
      if (typeof hsInstance.destroy === 'function') hsInstance.destroy();
      hsRef.current = null;
    };
  }, []);

  React.useEffect(() => {
    const blocks = Array.from(document.querySelectorAll('.block-image'));
    const listeners = [];

    blocks.forEach((block) => {
      const blobs = Array.from(block.querySelectorAll('.interactive-blob'));
      if (!blobs.length) return;
      let raf = null;

      const onMove = (e) => {
        const rect = block.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width; // 0..1
        const y = (e.clientY - rect.top) / rect.height; // 0..1

        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          blobs.forEach((b, i) => {
            const depth = (i + 1) / blobs.length; // 0.33..1
            const rx = (x - 0.5) * 2; // -1..1
            const ry = (y - 0.5) * 2; // -1..1
            const rangeX = 40 + i * 20; // px
            const rangeY = 28 + i * 12; // px
            const tx = rx * rangeX * depth * (i % 2 === 0 ? 1 : -1);
            const ty = ry * rangeY * depth * (i % 2 === 0 ? -1 : 1);
            b.style.transform = `translate3d(${tx}px, ${ty}px, 0) scale(${1 + 0.03 * i})`;
          });
        });
      };

      const onLeave = () => {
        blobs.forEach((b) => {
          b.style.transform = '';
        });
      };

      block.addEventListener('pointermove', onMove);
      block.addEventListener('pointerleave', onLeave);
      listeners.push({ block, onMove, onLeave });
    });

    return () => {
      listeners.forEach(({ block, onMove, onLeave }) => {
        block.removeEventListener('pointermove', onMove);
        block.removeEventListener('pointerleave', onLeave);
      });
    };
  }, []);

  React.useEffect(() => {
    // create custom cursor element and attach to body
    const cursor = document.createElement('div');
    cursor.className = 'custom-cursor-open';
    cursor.innerHTML = '<span class="label">Open</span>';
    document.body.appendChild(cursor);

    let active = false;
    let raf = null;
    let currentBlock = null;
    let leaveTimeout = null;

    const move = (x, y) => {
      cursor.style.left = `${x}px`;
      cursor.style.top = `${y}px`;
    };

    const onEnter = (e) => {
      if (leaveTimeout) { clearTimeout(leaveTimeout); leaveTimeout = null; }
      const block = e.currentTarget || e.target;
      currentBlock = block;
      active = true;

      // ensure cursor starts hidden/scaled down before showing
      cursor.classList.remove('show');

      // pick the preferred container to append to: interactive-blobs sits above overlays
      const preferred = block.querySelector('.interactive-blobs') || block;

      // move the cursor element inside the preferred container so overflow:hidden masks it and it's above overlays
      if (cursor.parentNode !== preferred) {
        preferred.appendChild(cursor);
        cursor.style.position = 'absolute';
        cursor.style.zIndex = '99999';
      }

      // position relative to block
      const rect = block.getBoundingClientRect();
      move(e.clientX - rect.left, e.clientY - rect.top);

      // next frame add the show class to trigger the CSS transition (grow + fade-in)
      requestAnimationFrame(() => {
        cursor.classList.add('show');
      });
    };

    const onMove = (e) => {
      if (!active || !currentBlock) return;
      // smooth follow using RAF
      if (raf) cancelAnimationFrame(raf);
      const rect = currentBlock.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      raf = requestAnimationFrame(() => move(x, y));
    };

    const onLeave = (e) => {
      active = false;
      // trigger shrink by removing class
      cursor.classList.remove('show');

      // wait for the shrink transition to finish before moving back to body
      const duration = 1000; // match CSS 1s transition
      if (leaveTimeout) clearTimeout(leaveTimeout);
      leaveTimeout = setTimeout(() => {
        if (cursor.parentNode && cursor.parentNode !== document.body) {
          document.body.appendChild(cursor);
          cursor.style.position = 'fixed';
          cursor.style.zIndex = '9999';
          // position at the last client coordinates so it doesn't jump
          const x = (e && e.clientX) || (window.innerWidth / 2);
          const y = (e && e.clientY) || (window.innerHeight / 2);
          move(x, y);
        }
        leaveTimeout = null;
      }, duration + 20);

      currentBlock = null;
    };

    const blocks = Array.from(document.querySelectorAll('.block-image'));
    blocks.forEach((b) => {
      b.addEventListener('pointerenter', onEnter);
      b.addEventListener('pointermove', onMove);
      b.addEventListener('pointerleave', onLeave);
      // allow clicking the image area to act like opening the project
      b.addEventListener('click', (ev) => {
        const parent = b.closest('.block');
        if (parent && parent.id) {
          scrollToProject(parent.id);
        }
      });
    });

    return () => {
      blocks.forEach((b) => {
        b.removeEventListener('pointerenter', onEnter);
        b.removeEventListener('pointermove', onMove);
        b.removeEventListener('pointerleave', onLeave);
      });
      if (cursor && cursor.parentNode) cursor.parentNode.removeChild(cursor);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // runtime: detect underlying color under each project link and toggle .invert when it's close to cobalt
  React.useEffect(() => {
    const links = Array.from(document.querySelectorAll('.project-link'));
    if (!links.length) return;

    const cobalt = [0, 71, 171]; // target cobalt RGB
    const threshold = 110; // distance threshold (tuneable)

    const parseRGB = (s) => {
      if (!s) return null;
      const m = s.match(/rgba?\(\s*(\d+),\s*(\d+),\s*(\d+)/i);
      return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : null;
    };

    const colorDistance = (a, b) => {
      if (!a || !b) return Infinity;
      const dr = a[0] - b[0];
      const dg = a[1] - b[1];
      const db = a[2] - b[2];
      return Math.sqrt(dr * dr + dg * dg + db * db);
    };

    let ticking = false;
    const update = () => {
      links.forEach((link) => {
        const r = link.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;

        let el = document.elementFromPoint(cx, cy);
        let bgColor = null;
        let tries = 0;
        while (el && el !== document.documentElement && tries++ < 25) {
          const style = window.getComputedStyle(el);
          const candidate = style.backgroundColor || style.fill || style.color;
          if (candidate && candidate !== 'transparent' && candidate !== 'rgba(0, 0, 0, 0)') {
            bgColor = parseRGB(candidate);
            break;
          }
          el = el.parentElement;
        }

        const dist = colorDistance(bgColor, cobalt);
        if (dist < threshold) link.classList.add('invert'); else link.classList.remove('invert');
      });
      ticking = false;
    };

    const schedule = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };

    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    window.addEventListener('load', schedule);
    // initial run
    schedule();

    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      window.removeEventListener('load', schedule);
    };
  }, []);

  // helper to smoothly center a project block in view
  const scrollToProject = (id) => {
    const el = document.getElementById(id);
    if (!el) return;

    // If the block is inside our scroll container, center it within that container.
    if (scrollContainerRef.current && scrollContainerRef.current.contains(el)) {
      const container = scrollContainerRef.current;

      // compute element and container positions up front so we can decide nudge vs normal path
      const containerRect = container.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      const deltaViewport = (elRect.left + elRect.width / 2) - (containerRect.left + containerRect.width / 2);
      const currentScrollLeft = container.scrollLeft || 0;
      const maxScroll = Math.max(0, container.scrollWidth - container.clientWidth);
      let desiredScrollLeft = Math.round(currentScrollLeft + deltaViewport);
      desiredScrollLeft = Math.max(0, Math.min(desiredScrollLeft, maxScroll));

      const performScroll = () => {
        // Try HorizontalScroll API first (if present)
        try {
          if (hsRef.current) {
            if (typeof hsRef.current.scrollToElement === 'function') {
              hsRef.current.scrollToElement(el, { duration: 600 });
              return;
            }
            if (typeof hsRef.current.scrollTo === 'function') {
              hsRef.current.scrollTo(desiredScrollLeft, { duration: 600 });
              return;
            }
            if (typeof hsRef.current.to === 'function') {
              // fallback: some versions may expose 'to' without options
              hsRef.current.to(desiredScrollLeft);
              return;
            }
          }
        } catch (err) {
          // ignore and fall through to native methods
        }

        // Try native smooth scroll
        if (typeof container.scrollTo === 'function') {
          try {
            // If already essentially at desired position, jump to avoid tiny jitter
            if (Math.abs((container.scrollLeft || 0) - desiredScrollLeft) < 1) {
              container.scrollLeft = desiredScrollLeft;
              return;
            }
            container.scrollTo({ left: desiredScrollLeft, behavior: 'smooth' });
            return;
          } catch (err) {
            // fallthrough to manual animation
          }
        }

        // Final fallback: manual smooth animation using requestAnimationFrame
        const start = container.scrollLeft || 0;
        const distance = desiredScrollLeft - start;
        const duration = 420; //ms
        let startTime = null;

        const ease = (t) => 0.5 - Math.cos(Math.PI * t) / 2; // smooth ease-in-out

        const step = (timestamp) => {
          if (!startTime) startTime = timestamp;
          const elapsed = timestamp - startTime;
          const t = Math.min(1, elapsed / duration);
          container.scrollLeft = Math.round(start + distance * ease(t));
          if (t < 1) requestAnimationFrame(step);
        };

        requestAnimationFrame(step);
      };

      // If we're exactly (or very close) to the extreme right, some custom scrollers
      // or browsers can make further horizontal scrolls ineffective. Directly set the
      // scroller to the desired position (using the custom API if available) then
      // call performScroll on the next frame to let the scroller update.
      if ((currentScrollLeft >= maxScroll - 1) && maxScroll > 0) {
        try {
          if (hsRef.current) {
            if (typeof hsRef.current.scrollTo === 'function') {
              hsRef.current.scrollTo(desiredScrollLeft, { duration: 600 });
            } else if (typeof hsRef.current.to === 'function') {
              hsRef.current.to(desiredScrollLeft);
            } else {
              container.scrollLeft = desiredScrollLeft;
            }
          } else {
            container.scrollLeft = desiredScrollLeft;
          }
        } catch (err) {
          container.scrollLeft = desiredScrollLeft;
        }

        requestAnimationFrame(performScroll);
        return;
      }

      // normal path
      performScroll();
      return;
    }

    // Fallback to scrolling the window and centering vertically
    try {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } catch (err) {
      // final ultimate fallback: jump
      el.scrollIntoView();
    }
  };

  React.useEffect(() => {
    const scrollDivs = Array.from(document.querySelectorAll('.scroll_circle_div'));
    if (!scrollDivs.length) return;

    // Hide inline labels on all scroll indicators so CSS hover swaps won't occur
    scrollDivs.forEach(sd => {
      sd.querySelectorAll('.scroll-label').forEach(el => { try { el.style.display = 'none'; } catch (e) { /* ignore */ } });
    });

    let tooltip = null;
    let raf = null;

    const ensureSvgVisible = (sd) => {
      try {
        const svg = sd.querySelector('svg');
        if (!svg) return;
        // force common SVG child elements to be visible so hover styles can't hide them
        const elems = svg.querySelectorAll('path, line, circle, rect, .cls-1');
        elems.forEach((el) => {
          try {
            el.style.display = el.tagName.toLowerCase() === 'g' ? '' : 'inline';
            el.style.opacity = '1';
            el.style.visibility = 'visible';
          } catch (e) { /* ignore */ }
        });
        svg.style.opacity = '1';
        svg.style.visibility = 'visible';
      } catch (e) { /* ignore */ }
    };

    const createTooltip = (x, y) => {
      if (tooltip) return tooltip;
      tooltip = document.createElement('div');
      tooltip.className = 'flower-play-tooltip hover-scroll-tooltip';
      tooltip.textContent = 'Scroll';
      tooltip.style.position = 'fixed';
      tooltip.style.pointerEvents = 'none'; // ensure tooltip does not capture pointer and halt SVG hover effects
      tooltip.style.zIndex = '11000';
      tooltip.style.opacity = '0';
      tooltip.style.transition = 'opacity 160ms ease, transform 160ms ease';
      document.body.appendChild(tooltip);

      tooltip.style.left = `${x}px`;
      tooltip.style.top = `${y + 12}px`;

      requestAnimationFrame(() => { tooltip.style.opacity = '1'; });
      return tooltip;
    };

    const moveHandler = (e) => {
      if (!tooltip) createTooltip(e.clientX, e.clientY);
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        if (!tooltip) return;
        const rect = tooltip.getBoundingClientRect();
        const left = Math.min(Math.max(8, e.clientX - (rect.width / 2)), window.innerWidth - (rect.width + 8));
        tooltip.style.left = `${left}px`;
        tooltip.style.top = `${e.clientY + 14}px`;
      });
    };

    const handlers = [];

    // per-element enter/leave handlers so we can remove them cleanly
    scrollDivs.forEach((sd) => {
      const enter = (e) => {
        ensureSvgVisible(sd);
        moveHandler(e);
        document.addEventListener('pointermove', moveHandler, { passive: true });
      };

      const leave = () => {
        document.removeEventListener('pointermove', moveHandler);
        if (raf) cancelAnimationFrame(raf);
        raf = null;
        if (tooltip && tooltip.parentNode) tooltip.parentNode.removeChild(tooltip);
        tooltip = null;
      };

      sd.addEventListener('pointerenter', enter);
      sd.addEventListener('pointermove', moveHandler, { passive: true });
      sd.addEventListener('pointerleave', leave);

      handlers.push({ sd, enter, leave });
    });

    return () => {
      handlers.forEach(({ sd, enter, leave }) => {
        sd.removeEventListener('pointerenter', enter);
        sd.removeEventListener('pointermove', moveHandler);
        sd.removeEventListener('pointerleave', leave);
      });
      document.removeEventListener('pointermove', moveHandler);
      if (raf) cancelAnimationFrame(raf);
      if (tooltip && tooltip.parentNode) tooltip.parentNode.removeChild(tooltip);
    };
  }, []);

  // --- unified scroll-arrow tooltip (replaces previous duplicated handlers) ---
  React.useEffect(() => {
    const nodes = Array.from(document.querySelectorAll('.scroll_circle_div'));
    if (!nodes.length) return;

    let tooltip = null;
    let raf = null;

    const makeTooltip = (text) => {
      if (tooltip) return tooltip;
      tooltip = document.createElement('div');
      tooltip.className = 'flower-play-tooltip'; // reuse flower tooltip styles
      tooltip.textContent = text || 'Scroll';
      tooltip.style.position = 'fixed';
      tooltip.style.pointerEvents = 'none';
      tooltip.style.zIndex = '11000';
      tooltip.style.opacity = '0';
      tooltip.style.transition = 'opacity 160ms ease, transform 160ms ease';
      document.body.appendChild(tooltip);
      requestAnimationFrame(() => { tooltip.style.opacity = '1'; });
      return tooltip;
    };

    const moveTooltip = (e) => {
      if (!tooltip) makeTooltip('Scroll');
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        if (!tooltip) return;
        const rect = tooltip.getBoundingClientRect();
        const left = Math.min(Math.max(8, e.clientX - rect.width / 2), window.innerWidth - rect.width - 8);
        tooltip.style.left = `${left}px`;
        tooltip.style.top = `${e.clientY + 10}px`;
      });
    };

    const removeTooltip = () => {
      if (!tooltip) return;
      tooltip.style.opacity = '0';
      const t = setTimeout(() => {
        if (tooltip && tooltip.parentNode) tooltip.parentNode.removeChild(tooltip);
        tooltip = null;
        clearTimeout(t);
      }, 160);
      if (raf) { cancelAnimationFrame(raf); raf = null; }
    };

    const handlers = [];

    nodes.forEach((node) => {
      try { node.querySelectorAll('.scroll-label').forEach(el => el.style.display = 'none'); } catch (e) {}

      const onEnter = (e) => {
        try {
          const svg = node.querySelector('svg');
          if (svg) {
            svg.querySelectorAll('path, line, circle, rect, .cls-1').forEach(el => {
              try { el.style.opacity = '1'; el.style.visibility = 'visible'; } catch (err) {}
            });
          }
        } catch (err) {}

        moveTooltip(e);
        document.addEventListener('pointermove', moveTooltip, { passive: true });
      };

      const onMove = (e) => { moveTooltip(e); };
      const onLeave = () => {
        document.removeEventListener('pointermove', moveTooltip);
        if (raf) cancelAnimationFrame(raf);
        raf = null;
        removeTooltip();
      };

      node.addEventListener('pointerenter', onEnter);
      node.addEventListener('pointermove', onMove, { passive: true });
      node.addEventListener('pointerleave', onLeave);

      handlers.push({ node, onEnter, onMove, onLeave });
    });

    return () => {
      handlers.forEach(({ node, onEnter, onMove, onLeave }) => {
        node.removeEventListener('pointerenter', onEnter);
        node.removeEventListener('pointermove', onMove);
        node.removeEventListener('pointerleave', onLeave);
      });
      document.removeEventListener('pointermove', moveTooltip);
      if (raf) cancelAnimationFrame(raf);
      if (tooltip && tooltip.parentNode) tooltip.parentNode.removeChild(tooltip);
    };
  }, []);

  // magnetic flower: stick to pointer and show "Play" label when pointer is near
  React.useEffect(() => {
    const flower = document.querySelector('.flower-icon');
    if (!flower) return;

    let tooltip = null;
    let isMagnetic = false;
    let raf = null;
    const threshold = 80; // ~2cm in pixels (approx)

    // store the initial bounding rect once so it remains stable across re-runs
    if (!flowerOrigRef.current) {
      const r = flower.getBoundingClientRect();
      flowerOrigRef.current = { left: r.left, top: r.top, width: r.width, height: r.height };
    }
    const rect0 = flowerOrigRef.current;
    const origLeft = `${rect0.left}px`;
    const origTop = `${rect0.top}px`;
    const w = rect0.width;
    const h = rect0.height;

    // ensure the flower is positioned fixed with explicit left/top so we can move it
    flower.style.position = 'fixed';
    flower.style.left = origLeft;
    flower.style.top = origTop;
    flower.style.transition = 'left 180ms cubic-bezier(.22,.9,.28,1), top 180ms cubic-bezier(.22,.9,.28,1), transform 160ms ease';

    const createTooltip = (x, y) => {
      tooltip = document.createElement('div');
      tooltip.className = 'flower-play-tooltip';
      // set initial text according to current play state
      tooltip.textContent = isPlaying ? 'Close' : 'Play';
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

    const origCx = rect0.left + w / 2;
    const origCy = rect0.top + h / 2;

    const onMove = (e) => {
      const dist = Math.hypot(e.clientX - origCx, e.clientY - origCy);

      if (dist < threshold) {
        if (!isMagnetic) {
          isMagnetic = true;
          document.body.style.cursor = 'none';
          flower.classList.add('magnetic');
          createTooltip(e.clientX, e.clientY);
        }

        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          // place flower centered on pointer
          flower.style.left = `${e.clientX - w / 2}px`;
          flower.style.top = `${e.clientY - h / 2}px`;
          if (tooltip) {
            tooltip.style.left = `${e.clientX + 10}px`;
            tooltip.style.top = `${e.clientY + 8}px`;
          }
        });

      } else {
        if (isMagnetic) {
          isMagnetic = false;
          document.body.style.cursor = '';
          flower.classList.remove('magnetic');
          if (raf) cancelAnimationFrame(raf);
          raf = requestAnimationFrame(() => {
            // smoothly return to original location
            flower.style.left = origLeft;
            flower.style.top = origTop;
          });
          removeTooltip();
        }
      }
    };

    document.addEventListener('pointermove', onMove, { passive: true });

    return () => {
      document.removeEventListener('pointermove', onMove);
      if (tooltip && tooltip.parentNode) tooltip.parentNode.removeChild(tooltip);
      document.body.style.cursor = '';
      if (raf) cancelAnimationFrame(raf);
      // restore inline styles we changed
      flower.style.transition = '';
      flower.style.left = '';
      flower.style.top = '';
      flower.style.position = '';
    };
  }, [isPlaying]);

  // make LinkedIn and Email icons slightly magnetic with small radius (~0.5cm)
  React.useEffect(() => {
    const icons = Array.from(document.querySelectorAll('.social-icon.linkedin-icon, .social-icon.email-icon'));
    if (!icons.length) return;

    const threshold = 28; // px radius for activation (~0.5cm depending on display)

    // store per-icon center so proximity checks are stable
    const iconData = icons.map(icon => {
      const r = icon.getBoundingClientRect();
      // prepare smooth transform style
      icon.style.transition = 'transform 180ms cubic-bezier(.22,.9,.28,1), box-shadow 180ms';
      icon.style.willChange = 'transform';
      icon.style.transition = 'transform 180ms cubic-bezier(.22,.9,.28,1), box-shadow 180ms';
      icon.style.willChange = 'transform';
      // do NOT add or modify aria-label/title here — leave accessibility attributes untouched
      const title = icon.getAttribute('title') || icon.getAttribute('aria-label') || '';
      return { icon, center: { x: r.left + r.width / 2, y: r.top + r.height / 2 }, title };
    });

    let activeIcon = null;
    let tooltip = null;
    let rafTooltip = null;

    const createTooltip = (text, x, y, anchor) => {
      if (!text) return null;
      if (tooltip) {
        tooltip.textContent = text;
        // update position: if anchor provided position at its upper-right, else fallback to pointer-based top-right
        if (anchor && anchor.getBoundingClientRect) {
          const r = anchor.getBoundingClientRect();
          const w = tooltip.offsetWidth || 120;
          const h = tooltip.offsetHeight || 28;
          let left = r.right + 6; // moved closer (was +12)
          let top = r.top - h - 4; // moved closer (was -8)
          left = Math.min(Math.max(8, left), window.innerWidth - w - 8);
          top = Math.max(8, top);
          tooltip.style.left = `${left}px`;
          tooltip.style.top = `${top}px`;
        } else if (typeof x === 'number' && typeof y === 'number') {
          const w = tooltip.offsetWidth || 120;
          const h = tooltip.offsetHeight || 28;
          let left = x + 8; // moved closer (was +12)
          let top = y - h - 4; // moved closer (was -8)
          left = Math.min(Math.max(8, left), window.innerWidth - w - 8);
          top = Math.max(8, top);
          tooltip.style.left = `${left}px`;
          tooltip.style.top = `${top}px`;
        }
        return tooltip;
      }

      tooltip = document.createElement('div');
      // reuse flower tooltip styling for visual consistency
      tooltip.className = 'flower-play-tooltip';
      tooltip.textContent = text;
      // ensure visible and not interactable
      tooltip.style.position = 'fixed';
      tooltip.style.pointerEvents = 'none';
      tooltip.style.zIndex = '11000';
      tooltip.style.opacity = '0';
      tooltip.style.transition = 'opacity 160ms ease, transform 160ms ease';
      document.body.appendChild(tooltip);

      // initial placement: anchor upper-right if provided, else pointer-top-right
      if (anchor && anchor.getBoundingClientRect) {
        const r = anchor.getBoundingClientRect();
        const w = tooltip.offsetWidth || 120;
        const h = tooltip.offsetHeight || 28;
        let left = r.right + 3; // moved closer
        let top = r.top - h - 2; // moved closer
        left = Math.min(Math.max(8, left), window.innerWidth - w - 8);
        top = Math.max(8, top);
        tooltip.style.left = `${left}px`;
        tooltip.style.top = `${top}px`;
      } else if (typeof x === 'number' && typeof y === 'number') {
        const w = tooltip.offsetWidth || 120;
        const h = tooltip.offsetHeight || 28;
        let left = x + 6; // moved closer
        let top = y - h - 2; // moved closer
        left = Math.min(Math.max(8, left), window.innerWidth - w - 8);
        top = Math.max(8, top);
        tooltip.style.left = `${left}px`;
        tooltip.style.top = `${top}px`;
      }

      requestAnimationFrame(() => { tooltip.style.opacity = '1'; });
      return tooltip;
    };

    const removeTooltip = () => {
      if (!tooltip) return;
      tooltip.style.opacity = '0';
      const t = setTimeout(() => {
        if (tooltip && tooltip.parentNode) tooltip.parentNode.removeChild(tooltip);
        tooltip = null;
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
        if (nearest.title) createTooltip(nearest.title, undefined, undefined, nearest.icon);
        if (tooltip) {
          if (rafTooltip) cancelAnimationFrame(rafTooltip);
          rafTooltip = requestAnimationFrame(() => {
            const r = nearest.icon.getBoundingClientRect();
            const w = tooltip.offsetWidth || 120;
            const h = tooltip.offsetHeight || 28;
            let left = r.right + 4; // moved closer (was +10)
            let top = r.top - h - 2; // moved closer (was -8)
            left = Math.min(Math.max(8, left), window.innerWidth - w - 8);
            top = Math.max(8, top);
            tooltip.style.left = `${left}px`;
            tooltip.style.top = `${top}px`;
          });
        }

      } else if (activeIcon) {
        // pointer moved out of threshold
        activeIcon.style.transform = '';
        activeIcon.style.zIndex = '';
        activeIcon = null;
        document.body.style.cursor = '';
        removeTooltip();
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
      removeTooltip();
      document.body.style.cursor = '';
    };
  }, []);

  // Keep any visible flower tooltip text in sync with play state
  React.useEffect(() => {
    try {
      const tooltips = Array.from(document.querySelectorAll('.flower-play-tooltip'));
      tooltips.forEach(t => { t.textContent = isPlaying ? 'Close' : 'Play'; });
    } catch (e) { /* ignore in non-DOM environments */ }
  }, [isPlaying]);

  // remove any leftover floating tooltip created by earlier experiments
  React.useEffect(() => {
    try {
      document.querySelectorAll('.hover-scroll-tooltip').forEach(el => el.remove());
    } catch (e) { /* ignore in non-DOM environments */ }
  }, []);

  return (
    <>
      {isPlaying && <PlayArea onClose={() => setIsPlaying(false)} flowerRect={flowerRect} />}
      <div className="flipbook-background-container">
        {/* Animated gradient blobs */}
        <div className="gradient-blob blob-1"></div>
        <div className="gradient-blob blob-2"></div>
        <div className="gradient-blob blob-3"></div>
        <div className="gradient-blob blob-4"></div>
        <div className="gradient-blob blob-5"></div>
        <div className="gradient-blob blob-6"></div>
        <div className="gradient-blob blob-7"></div>
        <div className="gradient-blob blob-8"></div>
        <div className="gradient-blob blob-9"></div>
        <div className="gradient-blob blob-10"></div>
        <div className="gradient-blob blob-11"></div>
        <div className="gradient-blob blob-12"></div>

        {/* Pixel noise texture overlay */}
        <div className="pixel-noise-overlay"></div>
      </div>
      {/* Content area */}

      {/* Social media icons - Top Left */}
      <div className="social-icons">
        <a href="https://www.linkedin.com/in/pranavshekhawat" target="_blank" rel="noreferrer" className="social-icon linkedin-icon" aria-label="LinkedIn">
          <svg x="0px" y="0px" viewBox="0 0 24 24">
            <path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z"></path>
          </svg>
        </a>
        <a href="mailto:pranavshekhawat.nift@gmail.com" className="social-icon email-icon" aria-label="Email">
          <svg x="0px" y="0px" viewBox="0 0 24 24">
            <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"></path>
          </svg>
        </a>
      </div>

      {/* Portfolio title */}
      <h1 className="portfolio-title">PRANAV SHEKHAWAT</h1>

      <div className="copyright_text"><p>© {year} Pranav Shekhawat.</p></div>

      {/* Project link icons - Top Right */}
      <div className="project-links">
        <a href="#project-one" onClick={(e) => { e.preventDefault(); scrollToProject('project-one'); }} className="project-link" title="Project One">
          Project 1
        </a>
        <a href="#project-two" onClick={(e) => { e.preventDefault(); scrollToProject('project-two'); }} className="project-link" title="Project Two">
          Project 2
        </a>
        <a href="#about" onClick={(e) => { e.preventDefault(); scrollToProject('about'); }} className="project-link" title="About">
          About Me
        </a>
      </div>

      <a
        href="#play"
        className={`flower-icon ${isPlaying ? 'playing' : ''}`}
        onClick={(e) => {
          e.preventDefault();
          if (!isPlaying) {
            const rect = e.currentTarget.getBoundingClientRect();
            setFlowerRect({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
            setIsPlaying(true);
          } else {
            setIsPlaying(false);
          }
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

      <div className="container-my" ref={scrollContainerRef}>
        <div
          className="block block-spacer"
        >
          {/* spacer left intentionally small - scroll indicator sits here */}
          <div className="scroll_circle_div">
            <div className="scroll_circle" role="presentation" aria-hidden="true">
              <svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 82.61 82.61" width="80" height="80" aria-hidden="true" focusable="false">
                <g>
                  <line className="cls-1" x1="67.54" y1="41.3" x2="14.9" y2="41.3" />
                  <path className="cls-1" d="M47.58,21.18c.35,10.97,9.16,19.78,20.13,20.13h0c-10.97.35-19.78,9.16-20.13,20.13" />
                </g>
                <circle className="cls-1" cx="41.3" cy="41.3" r="40.3" />
              </svg>

              <span className="scroll-label" aria-hidden="true">Scroll</span>
            </div>
          </div>
        </div>

        <div
          className="block block-1"
          id="project-one"
        >
           <h1>Project One</h1>

          <div className="block-image">
            <svg viewBox="0 0 1200 675" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <filter id="threshold1" colorInterpolationFilters="sRGB">
                  <feColorMatrix type="matrix" values="0.2126 0.7152 0.0722 0 0  0.2126 0.7152 0.0722 0 0  0.2126 0.7152 0.0722 0 0  0 0 0 1 0" />
                  <feComponentTransfer>
                    <feFuncR type="table" tableValues="0 1" />
                    <feFuncG type="table" tableValues="0 1" />
                    <feFuncB type="table" tableValues="0 1" />
                  </feComponentTransfer>
                </filter>

                <mask id="mask1">
                  <image xlinkHref={`${process.env.PUBLIC_URL}/images/sampleimage1.jpeg`} filter="url(#threshold1)" x="0" y="0" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" />
                </mask>

                <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FF79B4" stopOpacity="1" />
                  <stop offset="50%" stopColor="#7B68EE" stopOpacity="1" />
                  <stop offset="100%" stopColor="#0047AB" stopOpacity="1" />
                </linearGradient>
              </defs>

              <rect width="100%" height="100%" fill="#ffffff" />
              <rect width="100%" height="100%" fill="#0047AB" mask="url(#mask1)" />
              <rect className="svg-gradient" width="100%" height="100%" fill="url(#grad1)" mask="url(#mask1)" opacity="0" />
            </svg>

            <div className="interactive-blobs" aria-hidden="true">
              <div className="interactive-blob" data-index="0"></div>
              <div className="interactive-blob" data-index="1"></div>
              <div className="interactive-blob" data-index="2"></div>
            </div>
          </div>
         
        </div>

        <div
          className="block block-2"
          id="project-two"
        >
          <div className="block-image">
            <svg viewBox="0 0 1200 675" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <filter id="threshold2" colorInterpolationFilters="sRGB">
                  <feColorMatrix type="matrix" values="0.2126 0.7152 0.0722 0 0  0.2126 0.7152 0.0722 0 0  0.2126 0.7152 0.0722 0 0   0 0 0 1 0" />
                  <feComponentTransfer>
                    <feFuncR type="table" tableValues="0 1" />
                    <feFuncG type="table" tableValues="0 1" />
                    <feFuncB type="table" tableValues="0 1" />
                  </feComponentTransfer>
                </filter>

                <mask id="mask2">
                  <image xlinkHref={`${process.env.PUBLIC_URL}/images/sampleimage2.jpeg`} filter="url(#threshold2)" x="0" y="0" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" />
                </mask>

                <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FF79B4" stopOpacity="1" />
                  <stop offset="50%" stopColor="#7B68EE" stopOpacity="1" />
                  <stop offset="100%" stopColor="#0047AB" stopOpacity="1" />
                </linearGradient>
              </defs>

              <rect width="100%" height="100%" fill="#ffffff" />
              <rect width="100%" height="100%" fill="#0047AB" mask="url(#mask2)" />
              <rect className="svg-gradient" width="100%" height="100%" fill="url(#grad2)" mask="url(#mask2)" opacity="0" />
            </svg>

            <div className="interactive-blobs" aria-hidden="true">
              <div className="interactive-blob" data-index="0"></div>
              <div className="interactive-blob" data-index="1"></div>
              <div className="interactive-blob" data-index="2"></div>
            </div>
          </div>
          <h1>Project Two</h1>
        </div>

        <div
          className="block block-3"
          id="about"
        >
           <h1>About Me</h1>
          <div className="block-image">
            <svg viewBox="0 0 1200 675" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <filter id="threshold3" colorInterpolationFilters="sRGB">
                  <feColorMatrix type="matrix" values="0.2126 0.7152 0.0722 0 0  0.2126 0.7152 0.0722 0 0  0.2126 0.7152 0.0722 0 0  0 0 0 1 0" />
                  <feComponentTransfer>
                    <feFuncR type="table" tableValues="0 1" />
                    <feFuncG type="table" tableValues="0 1" />
                    <feFuncB type="table" tableValues="0 1" />
                  </feComponentTransfer>
                </filter>

                <mask id="mask3">
                  <image xlinkHref={`${process.env.PUBLIC_URL}/images/sampleimage3.jpg`} filter="url(#threshold3)" x="0" y="0" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" />
                </mask>

                <linearGradient id="grad3" x1="0%" y1="0%" x2="100%">
                  <stop offset="0%" stopColor="#FF79B4" stopOpacity="1" />
                  <stop offset="50%" stopColor="#7B68EE" stopOpacity="1" />
                  <stop offset="100%" stopColor="#0047AB" stopOpacity="1" />
                </linearGradient>
              </defs>

              <rect width="100%" height="100%" fill="#ffffff" />
              <rect width="100%" height="100%" fill="#0047AB" mask="url(#mask3)" />
              <rect className="svg-gradient" width="100%" height="100%" fill="url(#grad3)" mask="url(#mask3)" opacity="0" />
            </svg>

            <div className="interactive-blobs" aria-hidden="true">
              <div className="interactive-blob" data-index="0"></div>
              <div className="interactive-blob" data-index="1"></div>
              <div className="interactive-blob" data-index="2"></div>
            </div>
          </div>
         
        </div>

        <div
          className="block block-spacer2"
        >
          {/* trailing spacer — show the same scroll indicator pointing direction at the end */}
          <div className="scroll_circle_div">
            <div className="scroll_circle" role="presentation" aria-hidden="true">
              <svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 82.61 82.61" width="80" height="80" aria-hidden="true" focusable="false">
                <g>
                  <line className="cls-1" x1="67.54" y1="41.3" x2="14.9" y2="41.3" />
                  <path className="cls-1" d="M47.58,21.18c.35,10.97,9.16,19.78,20.13,20.13h0c-10.97.35-19.78,9.16-20.13,20.13" />
                </g>
                <circle className="cls-1" cx="41.3" cy="41.3" r="40.3" />
              </svg>

              <span className="scroll-label" aria-hidden="true">Scroll</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Portfolioold;
