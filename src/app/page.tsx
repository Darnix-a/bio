"use client";
import Image from "next/image";
import { useState } from "react";

export default function Home() {
  const [showIntro, setShowIntro] = useState(true);

  const handleStart = () => {
    // Create new audio element each time to ensure playback
    const audio = new Audio('/location.mp3');
    audio.volume = 0.3; // Reduced volume for better user experience
    audio.loop = true;
    
    // Simplified error handling
    audio.play()
      .then(() => setShowIntro(false))
      .catch((error) => {
        console.error('Error playing audio:', error);
        setShowIntro(false);
      });
  };

  return (
    <>
      {showIntro ? (
        <div 
          className="min-h-screen bg-gradient-to-b from-[#10002b] to-[#240046] select-none cursor-pointer relative overflow-hidden text-white"
          onClick={handleStart}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              handleStart();
            }
          }}
        >
          {/* Animated background elements */}
          <div className="absolute inset-0">
            <div className="animate-pulse absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-purple-500/30 blur-3xl"></div>
            <div className="animate-pulse absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-purple-700/30 blur-3xl"></div>
          </div>

          <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
            <h1 className="text-6xl font-bold mb-8 text-white">Welcome</h1>
            <div className="text-2xl font-bold bg-purple-600 hover:bg-purple-500 px-8 py-4 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300 text-white cursor-pointer">
              Click Anywhere to Start
            </div>
          </div>
        </div>
      ) : (
        <div className="min-h-screen bg-gradient-to-b from-[#240046] to-[#3c096c] text-white flex flex-col items-center justify-center p-8 relative">
          {/* Animated background */}
          <div className="absolute inset-0">
            <div className="animate-pulse absolute top-1/3 left-1/3 w-96 h-96 rounded-full bg-purple-500/20 blur-3xl"></div>
            <div className="animate-pulse absolute bottom-1/3 right-1/3 w-96 h-96 rounded-full bg-purple-700/20 blur-3xl"></div>
          </div>
          
          {/* Profile Section */}
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
              Proud <a href="https://fatality.win/members/darnix.49526/" className="text-purple-400 hover:text-purple-300 transition-colors font-semibold">
                fatality
              </a> user<br />
            </p>
          </div>

          {/* Social Links */}
          <div className="mt-12 space-y-4 w-full max-w-md z-10">
            <a
              href="https://steamcommunity.com/id/shikanokonokokoschitantan/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center bg-purple-700 hover:bg-purple-600 text-white px-6 py-4 rounded-lg transition-all hover:scale-105 shadow-lg w-full"
            >
              <span>Steam</span>
            </a>
            <a
              href="https://github.com/Darnix-a"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center bg-purple-800 hover:bg-purple-700 text-white px-6 py-4 rounded-lg transition-all hover:scale-105 shadow-lg w-full"
            >
              <span>GitHub</span>
            </a>
          </div>
        </div>
      )}
    </>
  );
}
