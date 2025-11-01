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
    <div className="absolute right-8 top-1/2 -translate-y-1/2 z-20 pointer-events-none">
      <div 
        className="relative w-80 h-96 transition-transform duration-300 ease-out"
        style={{ 
          transform: `translateX(${(mousePosition.x - 50) * 0.15}px) translateY(${(mousePosition.y - 50) * 0.15}px)` 
        }}
      >
        {/* Main Body - Baymax style rounded inflated look */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-48 h-56 bg-gradient-to-br from-slate-100 via-white to-slate-200 rounded-[40%] shadow-2xl border-4 border-slate-300/50 relative overflow-hidden">
          {/* Metallic shine effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-transparent to-slate-400/30 rounded-[40%]" />
          
          {/* Chest Port - glowing circle */}
          <div className="absolute top-16 left-1/2 -translate-x-1/2 w-16 h-16 bg-gradient-to-br from-primary/40 to-primary-glow/60 rounded-full border-4 border-white shadow-lg">
            <div className="absolute inset-2 bg-primary rounded-full animate-pulse" />
            <div className="absolute inset-4 bg-primary-glow rounded-full" />
          </div>

          {/* Body segmentation lines */}
          <div className="absolute top-1/3 left-0 right-0 h-0.5 bg-slate-300/40" />
          <div className="absolute top-2/3 left-0 right-0 h-0.5 bg-slate-300/40" />
        </div>

        {/* Left Arm - inflated rounded style */}
        <div 
          className="absolute bottom-32 left-[10%] w-12 h-32 origin-top transition-transform duration-500 ease-out"
          style={{ transform: `rotate(${rotation.leftArm}deg)` }}
        >
          <div className="w-full h-full bg-gradient-to-br from-slate-100 via-white to-slate-200 rounded-[30px] border-3 border-slate-300/50 shadow-xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-slate-400/20" />
          </div>
          {/* Hand */}
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-14 h-14 bg-gradient-to-br from-slate-100 via-white to-slate-200 rounded-full border-3 border-slate-300/50 shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-transparent to-slate-400/30 rounded-full" />
            {/* Fingers indication */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-0.5">
              <div className="w-2 h-3 bg-slate-300/60 rounded-t-full" />
              <div className="w-2 h-4 bg-slate-300/60 rounded-t-full" />
              <div className="w-2 h-3 bg-slate-300/60 rounded-t-full" />
            </div>
          </div>
        </div>

        {/* Right Arm - inflated rounded style */}
        <div 
          className="absolute bottom-32 right-[10%] w-12 h-32 origin-top transition-transform duration-500 ease-out"
          style={{ transform: `rotate(${rotation.rightArm}deg)` }}
        >
          <div className="w-full h-full bg-gradient-to-br from-slate-100 via-white to-slate-200 rounded-[30px] border-3 border-slate-300/50 shadow-xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-slate-400/20" />
          </div>
          {/* Hand */}
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-14 h-14 bg-gradient-to-br from-slate-100 via-white to-slate-200 rounded-full border-3 border-slate-300/50 shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-transparent to-slate-400/30 rounded-full" />
            {/* Fingers indication */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-0.5">
              <div className="w-2 h-3 bg-slate-300/60 rounded-t-full" />
              <div className="w-2 h-4 bg-slate-300/60 rounded-t-full" />
              <div className="w-2 h-3 bg-slate-300/60 rounded-t-full" />
            </div>
          </div>
        </div>

        {/* Head - large rounded Baymax style */}
        <div 
          className="absolute bottom-64 left-1/2 -translate-x-1/2 w-40 h-48 origin-bottom transition-transform duration-300 ease-out"
          style={{ transform: `rotate(${rotation.head}deg)` }}
        >
          <div className="w-full h-full bg-gradient-to-br from-slate-100 via-white to-slate-200 rounded-[45%] border-4 border-slate-300/50 shadow-2xl relative overflow-hidden">
            {/* Metallic shine */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/70 via-transparent to-slate-400/20 rounded-[45%]" />
            
            {/* Eyes - Baymax signature style */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-8">
              <div 
                className="relative transition-all duration-300"
                style={{ 
                  transform: `translateX(${(mousePosition.x - 50) * 0.08}px) translateY(${(mousePosition.y - 50) * 0.08}px)` 
                }}
              >
                {/* Left eye - simple black dot */}
                <div className="w-4 h-4 bg-slate-900 rounded-full shadow-lg" />
                {/* Eye shine */}
                <div className="absolute top-1 left-1 w-1.5 h-1.5 bg-white rounded-full" />
              </div>
              <div 
                className="relative transition-all duration-300"
                style={{ 
                  transform: `translateX(${(mousePosition.x - 50) * 0.08}px) translateY(${(mousePosition.y - 50) * 0.08}px)` 
                }}
              >
                {/* Right eye - simple black dot */}
                <div className="w-4 h-4 bg-slate-900 rounded-full shadow-lg" />
                {/* Eye shine */}
                <div className="absolute top-1 left-1 w-1.5 h-1.5 bg-white rounded-full" />
              </div>
            </div>

            {/* Simple line mouth that changes with head rotation */}
            <div 
              className="absolute bottom-16 left-1/2 -translate-x-1/2 w-20 h-1 bg-slate-900 rounded-full transition-all duration-300"
              style={{ 
                transform: `scaleX(${0.8 + Math.abs(rotation.head) * 0.015})`,
                height: `${1 + Math.abs(rotation.head) * 0.05}px`
              }}
            />
          </div>
        </div>

        {/* Soft glow effect around robot */}
        <div className="absolute inset-0 bg-primary/5 rounded-full blur-3xl -z-10" />
        <div className="absolute inset-0 bg-white/10 rounded-full blur-2xl -z-10 animate-pulse" />
      </div>
    </div>
  );
};

export default InteractiveRobot;
