"use client";
import Image from "next/image";
import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from '@/lib/supabase';
import crypto from 'crypto';

export default function Home() {
  const [showIntro, setShowIntro] = useState(true);
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
  const [visitorCount, setVisitorCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [clickEffects, setClickEffects] = useState<Array<{ x: number; y: number; id: number }>>([]);
  let nextEffectId = 0;
  const [tiltEffect, setTiltEffect] = useState({ x: 0, y: 0 });
  const [welcomeTilt, setWelcomeTilt] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const welcomeRef = useRef<HTMLDivElement>(null);

  // Mouse tracking effect
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
  }, []);

  // Visitor counter effect
  useEffect(() => {
    const checkAndIncrementVisitors = async () => {
      try {
        setIsLoading(true);

        // Get client IP
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        const ip = data.ip;
        console.log('Got IP:', ip); // Debug log

        // Create a hash of the IP (for privacy)
        const ipHash = crypto
          .createHash('sha256')
          .update(ip)
          .digest('hex');
        console.log('Created hash:', ipHash); // Debug log

        // Check if this IP has visited before
        const { data: existingVisitor, error: checkError } = await supabase
          .from('unique_visitors')
          .select('ip_hash')
          .eq('ip_hash', ipHash)
          .single();

        console.log('Existing visitor check:', existingVisitor, checkError); // Debug log

        if (!existingVisitor) {
          console.log('New visitor detected'); // Debug log
          
          // New visitor - add to unique_visitors and increment count
          const { error: insertError } = await supabase
            .from('unique_visitors')
            .insert([{ ip_hash: ipHash }]);

          if (insertError) {
            console.error('Error inserting new visitor:', insertError);
            return;
          }

          // Get current count
          const { data: currentData, error: countError } = await supabase
            .from('visitors')
            .select('count')
            .eq('id', 1)
            .single();

          if (countError) {
            console.error('Error getting current count:', countError);
            return;
          }

          console.log('Current count:', currentData?.count); // Debug log

          // Increment count
          const newCount = (currentData?.count || 0) + 1;
          const { error: updateError } = await supabase
            .from('visitors')
            .update({ count: newCount })
            .eq('id', 1);

          if (updateError) {
            console.error('Error updating count:', updateError);
            return;
          }

          console.log('Updated count to:', newCount); // Debug log
          setVisitorCount(newCount);
        } else {
          console.log('Returning visitor'); // Debug log
          
          // Returning visitor - just get current count
          const { data: currentData, error: countError } = await supabase
            .from('visitors')
            .select('count')
            .eq('id', 1)
            .single();

          if (countError) {
            console.error('Error getting current count:', countError);
            return;
          }

          setVisitorCount(currentData?.count || 0);
        }
      } catch (error) {
        console.error('Error with visitor counter:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAndIncrementVisitors();
  }, []);

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

  const handleBackgroundClick = useCallback((e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    const newEffect = {
      x,
      y,
      id: nextEffectId++
    };
    
    setClickEffects(prev => [...prev, newEffect]);
    setTimeout(() => {
      setClickEffects(prev => prev.filter(effect => effect.id !== newEffect.id));
    }, 1000);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>, isWelcome = false) => {
    const ref = isWelcome ? welcomeRef : containerRef;
    if (!ref.current) return;
    
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const tiltX = (y - centerY) / 15;
    const tiltY = (centerX - x) / 15;
    
    isWelcome ? setWelcomeTilt({ x: tiltX, y: tiltY }) : setTiltEffect({ x: tiltX, y: tiltY });
  };

  const handleMouseLeave = (isWelcome = false) => {
    isWelcome ? setWelcomeTilt({ x: 0, y: 0 }) : setTiltEffect({ x: 0, y: 0 });
  };

  return (
    <div>
      {/* Visitor Counter */}
      <div className="fixed top-4 left-4 text-purple-300/50 text-sm z-50 flex items-center gap-2">
        {isLoading ? (
          <span>Loading...</span>
        ) : (
          <span>{visitorCount.toLocaleString()} visitors</span>
        )}
      </div>

      <div 
        className="min-h-screen relative"
        onClick={handleBackgroundClick}
        style={{
          background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(93, 0, 255, 0.15) 0%, rgb(36, 0, 70) 35%, rgb(16, 0, 43) 100%)`
        }}
      >
        {/* Click effects */}
        {clickEffects.map(effect => (
          <div
            key={effect.id}
            className="absolute pointer-events-none"
            style={{
              left: `${effect.x}%`,
              top: `${effect.y}%`,
              transform: 'translate(-50%, -50%)'
            }}
          >
            <div className="animate-ripple rounded-full border-2 border-purple-500/50" />
          </div>
        ))}

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
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10 backdrop-blur-sm bg-black/10">
              <div 
                ref={welcomeRef}
                onMouseMove={(e) => handleMouseMove(e, true)}
                onMouseLeave={() => handleMouseLeave(true)}
                className="text-center space-y-8 p-8 rounded-2xl bg-purple-900/20 backdrop-blur-sm border border-purple-500/20 shadow-xl transform transition-all duration-200 ease-out"
                style={{
                  transform: `perspective(1000px) rotateX(${welcomeTilt.x}deg) rotateY(${welcomeTilt.y}deg)`,
                  boxShadow: `
                    ${-welcomeTilt.y}px ${-welcomeTilt.x}px 20px rgba(139, 92, 246, 0.1),
                    0 4px 6px -1px rgba(0, 0, 0, 0.1),
                    0 2px 4px -1px rgba(0, 0, 0, 0.06)
                  `
                }}
              >
                <h1 className="text-7xl font-bold text-white animate-fade-in bg-clip-text text-transparent bg-gradient-to-b from-white to-purple-300">
                  Welcome
                  </p>
                  <div className="text-lg font-medium bg-purple-600/30 hover:bg-purple-500/40 px-8 py-4 rounded-lg shadow-lg transform hover:scale-110 transition-all duration-300 backdrop-blur-sm hover:shadow-purple-500/50 group">
                    Click Anywhere to Start
                    <div className="h-0.5 w-0 group-hover:w-full bg-purple-400/50 transition-all duration-300" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="min-h-screen text-white flex flex-col items-center justify-center p-8 relative">
            <div 
              ref={containerRef}
              onMouseMove={(e) => handleMouseMove(e)}
              onMouseLeave={() => handleMouseLeave()}
              className="flex flex-col items-center space-y-6 bg-black/20 backdrop-blur-sm p-8 rounded-2xl z-10 w-full max-w-md transition-transform duration-200 ease-out"
              style={{
                transform: `perspective(1000px) rotateX(${tiltEffect.x}deg) rotateY(${tiltEffect.y}deg)`,
                boxShadow: `
                  ${-tiltEffect.y}px ${-tiltEffect.x}px 20px rgba(139, 92, 246, 0.1),
                  0 4px 6px -1px rgba(0, 0, 0, 0.1),
                  0 2px 4px -1px rgba(0, 0, 0, 0.06)
                `
              }}
            >
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
              <p className="text-purple-300/50 text-sm mt-0.5">(darnixgotbanned on discord)</p>
              <p className="text-purple-300 text-center text-lg">
                Proud <a href="https://fatality.win/members/darnix.49526/" className="text-purple-400 hover:text-purple-300 transition-colors font-semibold hover:scale-110 inline-block">
                  fatality
                </a> user & Gambling enjoyer
              </p>

              <p className="text-purple-200/40 text-center text-sm italic mt-1">
                "The quieter you become, the more you can hear"
              </p>
            </div>

            <div className="mt-12 space-y-4 w-full max-w-md z-10">
              <a
                href="https://steamcommunity.com/id/shikanokonokokoschitantan/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center bg-gradient-to-b from-purple-600 to-purple-700 text-white px-6 py-4 rounded-lg transition-all hover:scale-110 shadow-lg w-full hover:shadow-purple-500/50 hover:from-purple-500 hover:to-purple-600 hover:shadow-xl"
              >
                <span>Steam</span>
              </a>

              <a
                href="https://github.com/Darnix-a"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center bg-gradient-to-b from-purple-700 to-purple-800 text-white px-6 py-4 rounded-lg transition-all hover:scale-110 shadow-lg w-full hover:shadow-purple-600/50 hover:from-purple-600 hover:to-purple-700 hover:shadow-xl"
              >
                <span>GitHub</span>
              </a>

              <a
                href="https://www.faceit.com/en/players/d4rnix"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center bg-gradient-to-b from-purple-800 to-purple-900 text-white px-6 py-4 rounded-lg transition-all hover:scale-110 shadow-lg w-full hover:shadow-purple-700/50 hover:from-purple-700 hover:to-purple-800 hover:shadow-xl"
              >
                <span>FACEIT</span>
              </a>

              <a
                href="https://www.youtube.com/@bingusschmingus"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center bg-gradient-to-b from-purple-900 to-purple-950 text-white px-6 py-4 rounded-lg transition-all hover:scale-110 shadow-lg w-full hover:shadow-purple-800/50 hover:from-purple-800 hover:to-purple-900 hover:shadow-xl"
              >
                <span>YouTube</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
