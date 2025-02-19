"use client";
import Image from "next/image";
import { useState } from "react";

export default function Home() {
  const [showIntro, setShowIntro] = useState(true);

  const handleStart = () => {
    // Create new audio element each time to ensure playback
    const audio = new Audio('/location.mp3');
    audio.volume = 0.5; // Set default volume
    audio.loop = true;
    
    try {
      // Play audio immediately
      audio.play()
        .then(() => {
          setShowIntro(false);
        })
        .catch((error) => {
          console.error('Error playing audio:', error);
          setShowIntro(false);
        });
    } catch (error) {
      console.error('Error playing audio:', error);
      setShowIntro(false);
    }
  };


  return (
    <>
      {showIntro ? (
          <div 
            className="min-h-screen bg-gradient-to-b from-[#10002b] to-[#240046] select-none cursor-pointer"
            onClick={handleStart}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleStart();
              }
            }}
          >

          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <h1 className="text-6xl font-bold mb-8">Welcome</h1>
            <div className="text-4xl font-bold bg-purple-500 px-8 py-4 rounded-lg">
              Click Anywhere to Start
            </div>
          </div>
        </div>
      ) : (
        <div className="min-h-screen bg-gradient-to-b from-[#240046] to-[#3c096c] text-[#e0aaff] flex flex-col items-center justify-center p-8">
          {/* Audio element will be created dynamically */}
          
          {/* Profile Section */}
          <div className="flex flex-col items-center space-y-4">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[#9d4edd]">
              <Image
                src="/profile.jpg"
                alt="Profile Picture"
                width={128}
                height={128}
                className="object-cover"
              />
            </div>
            <h1 className="text-2xl font-bold">Darnix</h1>
            <p className="text-[#c77dff] text-center">(darnixgotbanned on discord)</p>
            <p className="text-[#c77dff] text-center">
              <a href="https://fatality.win/members/darnix.49526/" className="text-[#9d4edd] hover:text-[#7b2cbf]">Proud fatality</a> user<br />
              Lexis support
            </p>
          </div>


          {/* Social Links */}
          <div className="mt-8 space-y-3 w-full max-w-md">
            <a
              href="https://steamcommunity.com/id/shikanokonokokoschitantan/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center bg-[#7b2cbf] hover:bg-[#9d4edd] text-[#e0aaff] px-6 py-3 rounded-lg transition-colors"
            >
              <span>Steam</span>
            </a>
            <a
              href="https://github.com/Darnix-a"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center bg-[#5a189a] hover:bg-[#7b2cbf] text-[#e0aaff] px-6 py-3 rounded-lg transition-colors"
            >
              <span>GitHub</span>
            </a>
          </div>
        </div>
      )}
    </>
  );
}
