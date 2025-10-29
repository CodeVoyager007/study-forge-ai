import { useEffect, useState } from "react";

const InteractiveRobot = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState({ head: 0, leftArm: 0, rightArm: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      setMousePosition({ x, y });

      // Calculate rotations based on mouse position
      const headRotation = ((x - 50) / 50) * 20; // -20 to 20 degrees
      const leftArmRotation = -10 + ((y - 50) / 50) * 30; // -40 to 20 degrees
      const rightArmRotation = -10 - ((y - 50) / 50) * 30; // 20 to -40 degrees

      setRotation({
        head: headRotation,
        leftArm: leftArmRotation,
        rightArm: rightArmRotation,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="fixed bottom-8 right-8 z-20 pointer-events-none">
      <div 
        className="relative w-64 h-64 transition-transform duration-300 ease-out"
        style={{ 
          transform: `translateX(${(mousePosition.x - 50) * 0.1}px) translateY(${(mousePosition.y - 50) * 0.1}px)` 
        }}
      >
        {/* Robot Body */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-40 bg-gradient-to-b from-primary/90 to-primary-glow/90 rounded-3xl border-4 border-primary-foreground/20 shadow-2xl backdrop-blur-sm">
          {/* Body Details */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-16 h-16 bg-background/30 rounded-xl border-2 border-primary-foreground/30" />
          <div className="absolute top-8 left-1/2 -translate-x-1/2 w-8 h-8 bg-accent rounded-full animate-pulse" />
        </div>

        {/* Left Arm */}
        <div 
          className="absolute bottom-32 left-[20%] w-6 h-24 origin-top transition-transform duration-500 ease-out"
          style={{ transform: `rotate(${rotation.leftArm}deg)` }}
        >
          <div className="w-full h-full bg-gradient-to-b from-primary to-primary-glow rounded-full border-2 border-primary-foreground/20 shadow-lg" />
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-8 bg-accent rounded-full border-2 border-primary-foreground/30" />
        </div>

        {/* Right Arm */}
        <div 
          className="absolute bottom-32 right-[20%] w-6 h-24 origin-top transition-transform duration-500 ease-out"
          style={{ transform: `rotate(${rotation.rightArm}deg)` }}
        >
          <div className="w-full h-full bg-gradient-to-b from-primary to-primary-glow rounded-full border-2 border-primary-foreground/20 shadow-lg" />
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-8 bg-accent rounded-full border-2 border-primary-foreground/30" />
        </div>

        {/* Head */}
        <div 
          className="absolute bottom-36 left-1/2 -translate-x-1/2 w-28 h-32 origin-bottom transition-transform duration-300 ease-out"
          style={{ transform: `rotate(${rotation.head}deg)` }}
        >
          <div className="w-full h-full bg-gradient-to-b from-primary-glow/90 to-primary/90 rounded-3xl border-4 border-primary-foreground/20 shadow-2xl backdrop-blur-sm relative">
            {/* Antenna */}
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-2 h-6 bg-accent rounded-full">
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-accent-glow rounded-full animate-pulse" />
            </div>

            {/* Eyes */}
            <div className="absolute top-8 left-1/2 -translate-x-1/2 flex gap-4">
              <div 
                className="w-6 h-6 bg-accent rounded-full relative overflow-hidden shadow-lg shadow-accent/50"
                style={{ 
                  transform: `translateX(${(mousePosition.x - 50) * 0.05}px) translateY(${(mousePosition.y - 50) * 0.05}px)` 
                }}
              >
                <div className="absolute inset-1 bg-background rounded-full" />
                <div className="absolute top-1 left-1 w-2 h-2 bg-accent-glow rounded-full animate-pulse" />
              </div>
              <div 
                className="w-6 h-6 bg-accent rounded-full relative overflow-hidden shadow-lg shadow-accent/50"
                style={{ 
                  transform: `translateX(${(mousePosition.x - 50) * 0.05}px) translateY(${(mousePosition.y - 50) * 0.05}px)` 
                }}
              >
                <div className="absolute inset-1 bg-background rounded-full" />
                <div className="absolute top-1 left-1 w-2 h-2 bg-accent-glow rounded-full animate-pulse" />
              </div>
            </div>

            {/* Mouth/Display */}
            <div 
              className="absolute bottom-6 left-1/2 -translate-x-1/2 w-16 h-3 bg-accent/80 rounded-full transition-all duration-300"
              style={{ 
                transform: `scaleX(${1 + Math.abs(rotation.head) * 0.01})` 
              }}
            />
          </div>
        </div>

        {/* Glow Effect */}
        <div className="absolute inset-0 bg-primary/10 rounded-full blur-3xl -z-10 animate-pulse" />
      </div>
    </div>
  );
};

export default InteractiveRobot;
