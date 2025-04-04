
import { useEffect, useState } from "react";

const Confetti = () => {
  const [particles, setParticles] = useState<{ x: number; y: number; color: string; delay: number; }[]>([]);

  useEffect(() => {
    const colors = ["#6D28D9", "#DDD6FE", "#10B981", "#8B5CF6", "#FBBF24"];
    const newParticles = Array.from({ length: 50 }, (_, i) => ({
      x: Math.random() * window.innerWidth,
      y: -20 - Math.random() * 100,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 2,
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="confetti-container">
      {particles.map((particle, i) => (
        <div
          key={i}
          className="confetti"
          style={{
            left: `${particle.x}px`,
            top: `${particle.y}px`,
            backgroundColor: particle.color,
            animationDelay: `${particle.delay}s`,
            width: `${Math.random() * 10 + 5}px`,
            height: `${Math.random() * 10 + 5}px`,
            opacity: Math.random() * 0.7 + 0.3,
          }}
        />
      ))}
    </div>
  );
};

export default Confetti;
