"use client";
import Image from "next/image";
import { useState, useEffect } from "react";

export default function Home() {
  const [showIntro, setShowIntro] = useState(true);
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 }); // Center by default

  const handleStart = () => {
    const audio = new Audio('/location.mp3');
    audio.volume = 0.3;
    audio.loop = true;
    audio.play()
      .then(() => setShowIntro(false))
      .catch((error) => {
        console.error('Error playing audio:', error);
        setShowIntro(false);
      });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      requestAnimationFrame(() => {
        const x = (e.clientX / window.innerWidth) * 100;
        const y = (e.clientY / window.innerHeight) * 100;
        setMousePosition({ x, y });
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []); // Empty dependency array

  return (
    <div 
      className="min-h-screen relative"
      style={{
        background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(93, 0, 255, 0.15) 0%, rgb(36, 0, 70) 35%, rgb(16, 0, 43) 100%)`
      }}
    >
      {/* Background orb */}
      <div 
        className="absolute blur-2xl opacity-20 pointer-events-none transition-transform duration-100 ease-out"
        style={{
          left: `${mousePosition.x}%`,
          top: `${mousePosition.y}%`,
          transform: 'translate(-50%, -50%)',
          width: '20vmin',
          height: '20vmin',
          background: 'rgb(147, 51, 234)',
          borderRadius: '50%',
        }}
      />

      {showIntro ? (
        <div 
          className="min-h-screen select-none relative overflow-hidden text-white transition-colors duration-500"
          onClick={handleStart}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              handleStart();
            }
          }}
        >
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
            <h1 className="text-6xl font-bold mb-8 text-white animate-fade-in">Welcome</h1>
            <div className="text-2xl font-bold bg-purple-600/80 hover:bg-purple-500 px-8 py-4 rounded-lg shadow-lg transform hover:scale-110 transition-all duration-300 backdrop-blur-sm hover:shadow-purple-500/50">
              Click Anywhere to Start
            </div>
          </div>
        </div>
      ) : (
        <div className="min-h-screen text-white flex flex-col items-center justify-center p-8 relative">
          <div className="flex flex-col items-center space-y-6 bg-black/20 backdrop-blur-sm p-8 rounded-2xl z-10 w-full max-w-md">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-purple-500 transform hover:scale-105 transition-all duration-300 shadow-lg">
              <Image
                src="/profile.jpg"
                alt="Profile Picture"
                width={128}
                height={128}
                className="object-cover hover:opacity-90 transition-opacity"
                priority
              />
            </div>
            <h1 className="text-3xl font-bold text-white">Darnix</h1>
            <p className="text-purple-300 text-center text-lg">(darnixgotbanned on discord)</p>
            <p className="text-purple-300 text-center text-lg">
              Proud <a href="https://fatality.win/members/darnix.49526/" className="text-purple-400 hover:text-purple-300 transition-colors font-semibold hover:scale-110 inline-block">
                fatality
              </a> user<br />
              Lexis support
            </p>
          </div>

          <div className="mt-12 space-y-4 w-full max-w-md z-10">
            <a
              href="https://steamcommunity.com/id/shikanokonokokoschitantan/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center bg-purple-700 hover:bg-purple-600 text-white px-6 py-4 rounded-lg transition-all hover:scale-110 shadow-lg w-full hover:shadow-purple-500/50"
            >
              <span>Steam</span>
            </a>
            <a
              href="https://github.com/Darnix-a"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center bg-purple-800 hover:bg-purple-700 text-white px-6 py-4 rounded-lg transition-all hover:scale-110 shadow-lg w-full hover:shadow-purple-500/50"
            >
              <span>GitHub</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
