import React, { useEffect, useRef } from 'react';

const ParticleBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    let mouseX = -1000;
    let mouseY = -1000;

    const isMobile = window.innerWidth < 768;
    const particleCount = isMobile ? 30 : 60; // Menos partículas no mobile para performance

    // Resize handling
    const resizeCanvas = () => {
      canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Mouse handling
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    };

    if (!isMobile) {
      canvas.parentElement?.addEventListener('mousemove', handleMouseMove as any);
    }

    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      baseX: number;
      baseY: number;
      density: number;
      color: string;

      constructor() {
        this.x = Math.random() * canvas!.width;
        this.y = Math.random() * canvas!.height;
        this.baseX = this.x;
        this.baseY = this.y;
        this.size = Math.random() * 2 + 1;
        this.speedX = Math.random() * 0.5 - 0.25;
        this.speedY = Math.random() * 0.5 - 0.25;
        this.density = (Math.random() * 30) + 1;

        // Define random color: Purple or Black
        // Using a slightly transparent black for better blending
        this.color = Math.random() > 0.5
          ? 'rgba(139, 92, 246, 0.6)' // Purple
          : 'rgba(0, 0, 0, 0.6)';      // Black
      }

      update() {
        // Mobile: Constant movement
        if (isMobile) {
          this.x += this.speedX * 2;
          this.y += this.speedY * 2;

          // Wrap around screen
          if (this.x > canvas!.width) this.x = 0;
          else if (this.x < 0) this.x = canvas!.width;
          if (this.y > canvas!.height) this.y = 0;
          else if (this.y < 0) this.y = canvas!.height;
        }
        // Desktop: React to mouse
        // Desktop: Float + React to mouse
        else {
          // 1. Float naturally
          this.x += this.speedX;
          this.y += this.speedY;

          // Wrap around
          if (this.x > canvas!.width) this.x = 0;
          else if (this.x < 0) this.x = canvas!.width;
          if (this.y > canvas!.height) this.y = 0;
          else if (this.y < 0) this.y = canvas!.height;

          // 2. Mouse Interaction
          let dx = mouseX - this.x;
          let dy = mouseY - this.y;
          let distance = Math.sqrt(dx * dx + dy * dy);

          let maxDistance = 150;

          if (distance < maxDistance) {
            let forceDirectionX = dx / distance;
            let forceDirectionY = dy / distance;
            let force = (maxDistance - distance) / maxDistance;
            let directionX = forceDirectionX * force * this.density;
            let directionY = forceDirectionY * force * this.density;

            this.x -= directionX;
            this.y -= directionY;
          }
        }
      }

      draw() {
        if (!ctx) return;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
      }
    }

    const init = () => {
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
      }
      // Connect particles
      connect();
      animationFrameId = requestAnimationFrame(animate);
    };

    const connect = () => {
      let opacityValue = 1;
      for (let a = 0; a < particles.length; a++) {
        for (let b = a; b < particles.length; b++) {
          let dx = particles[a].x - particles[b].x;
          let dy = particles[a].y - particles[b].y;
          let distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 100) {
            opacityValue = 1 - (distance / 100);
            // Lines remain purple for consistency and visibility
            ctx.strokeStyle = 'rgba(139, 92, 246,' + opacityValue * 0.2 + ')';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particles[a].x, particles[a].y);
            ctx.lineTo(particles[b].x, particles[b].y);
            ctx.stroke();
          }
        }
      }
    }

    init();
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (!isMobile) {
        canvas.parentElement?.removeEventListener('mousemove', handleMouseMove as any);
      }
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-0 pointer-events-none w-full h-full opacity-60"
    />
  );
};

export default ParticleBackground;