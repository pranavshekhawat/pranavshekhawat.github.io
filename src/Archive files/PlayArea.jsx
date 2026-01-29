import React, { useRef, useEffect, useState } from "react";
import "./css/playarea.css";

const PlayArea = ({ onClose, flowerRect }) => {
  const canvasRef = useRef(null);
  const cursorSprinklerRef = useRef(null);
  const mousePos = useRef({ x: 0, y: 0 });
  const particlesRef = useRef([]);
  const animationFrameRef = useRef(null);
  const [isClosing, setIsClosing] = useState(false);
  const expandCircleRef = useRef(null);

  const colors = [
    "#FF1493", "#FF69B4", "#FFB3D9",
    "#7B68EE", "#BA55D3", "#C9B1E8",
    "#0047AB", "#4169E1", "#6B9FD1",
    "#FF7F50", "#FFB3A7", "#FF6347",
    "#20B2AA", "#B3E5D9", "#40E0D0",
    "#8470D0", "#D9C9F0", "#FFFFFF"
  ];

  class Particle {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.size = Math.random() * 80 + 60;
      this.color = colors[Math.floor(Math.random() * colors.length)];
      this.speedX = (Math.random() - 0.5) * 20;
      this.speedY = Math.random() * -11 - 7;
      this.gravity = 0.77;
      this.opacity = 1;
    }

    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      this.speedY += this.gravity;
    }

    draw(ctx) {
      ctx.globalAlpha = this.opacity;
      const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size);
      gradient.addColorStop(0, this.color + '8C');
      gradient.addColorStop(0.3, this.color + '68');
      gradient.addColorStop(0.6, this.color + '33');
      gradient.addColorStop(0.9, this.color + '0A');
      gradient.addColorStop(1, this.color + '00');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    isAlive() {
      return this.y < window.innerHeight + 100;
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext("2d");

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particlesRef.current = particlesRef.current.filter(p => p.isAlive());
      particlesRef.current.forEach(particle => {
        particle.update();
        particle.draw(ctx);
      });
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    const handleMouseMove = (e) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      
      // Update cursor sprinkler position
      if (cursorSprinklerRef.current) {
        cursorSprinklerRef.current.style.left = `${e.clientX - 10}px`;
        cursorSprinklerRef.current.style.top = `${e.clientY - 10}px`;
      }
      
      // Reduced from 1 to 0.5 particles per move (roughly 1 particle every 2 moves)
      if (Math.random() > 0.5) {
        particlesRef.current.push(new Particle(e.clientX, e.clientY));
      }
    };

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    if (expandCircleRef.current) {
      expandCircleRef.current.style.animation = 'contractIn 1.2s ease-out forwards';
    }
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div className={`play-area-overlay ${isClosing ? 'closing' : ''}`}>
      <div 
        ref={expandCircleRef}
        className="expand-circle-overlay"
        style={{
          left: `${flowerRect?.x || window.innerWidth / 2}px`,
          top: `${flowerRect?.y || window.innerHeight / 2}px`,
          transform: 'translate(-50%, -50%)',
        }}
      ></div>
      <canvas ref={canvasRef} className="particle-canvas"></canvas>
      <div ref={cursorSprinklerRef} className="cursor-sprinkler"></div>
    </div>
  );
};

export default PlayArea;