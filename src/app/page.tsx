"use client";
import Image from "next/image";
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { supabase } from '@/lib/supabase';
import crypto from 'crypto';

const ParticleCanvas = () => {
  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '1';
    document.body.prepend(canvas);

    const ctx = canvas.getContext('2d')!;
    
    const createParticle = (delay = 0) => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 2 + 2,
      density: (Math.random() * 30) + 1,
      vx: Math.random() * 0.3 - 0.15,
      vy: Math.random() * 0.3 - 0.15,
      baseVx: Math.random() * 0.3 - 0.15,
      baseVy: Math.random() * 0.3 - 0.15,
      isExploded: false,
      spawnDelay: delay,
      opacity: 0
    });

    const particles: Array<ReturnType<typeof createParticle>> = [];

    // Initial particle creation (no delay for initial particles)
    for (let i = 0; i < 100; i++) {
      particles.push(createParticle());
    }

    let mouse = {
      x: null as number | null,
      y: null as number | null,
      radius: 80
    };

    function handleMouseMove(e: MouseEvent) {
      mouse.x = e.x;
      mouse.y = e.y;
    }

    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const handleExplosion = (x: number, y: number) => {
      particles.forEach(particle => {
        const dx = particle.x - x;
        const dy = particle.y - y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const force = Math.max(0, (1200 - distance) / 1200);
        
        const angle = Math.atan2(dy, dx);
        const speed = force * 35;
        
        particle.vx += Math.cos(angle) * speed;
        particle.vy += (Math.sin(angle) * speed) - 2;
        
        particle.vx += (Math.random() - 0.5) * 5;
        particle.vy += (Math.random() - 0.5) * 5;
        
        particle.isExploded = true;
      });
    };

    const explosionHandler = (e: CustomEvent) => {
      handleExplosion(e.detail.x, e.detail.y);
    };

    window.addEventListener('particle-explosion', explosionHandler as EventListener);

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      for (let i = particles.length - 1; i >= 0; i--) {
        const particle = particles[i];

        // Apply friction
        const friction = 0.99;
        particle.vx *= friction;
        particle.vy *= friction;

        // Only apply return force if not exploded
        if (!particle.isExploded) {
          const returnForce = 0.005;
          particle.vx += (particle.baseVx - particle.vx) * returnForce;
          particle.vy += (particle.baseVy - particle.vy) * returnForce;
        }

        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Check boundaries
        if (particle.isExploded) {
          // If exploded and off screen, replace with new particle
          if (particle.x < -50 || particle.x > canvas.width + 50 ||
              particle.y < -50 || particle.y > canvas.height + 50) {
            // Much longer delay: between 2 to 5 seconds (120-300 frames)
            const newDelay = 120 + Math.random() * 180;
            particles[i] = createParticle(newDelay);
          }
        } else {
          // Normal bounce behavior for non-exploded particles
          if (particle.x < 0 || particle.x > canvas.width) {
            particle.vx *= -0.7;
            particle.x = Math.max(0, Math.min(canvas.width, particle.x));
          }
          if (particle.y < 0 || particle.y > canvas.height) {
            particle.vy *= -0.7;
            particle.y = Math.max(0, Math.min(canvas.height, particle.y));
          }
        }

        // Mouse interaction
        if (mouse.x !== null && mouse.y !== null) {
          let dx = mouse.x - particle.x;
          let dy = mouse.y - particle.y;
          let distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < mouse.radius) {
            const force = (mouse.radius - distance) / mouse.radius;
            const directionX = dx / distance;
            const directionY = dy / distance;
            
            particle.vx -= directionX * force * 0.5;
            particle.vy -= directionY * force * 0.5;
          }
        }

        // Speed limit
        const maxSpeed = particle.isExploded ? 15 : 3; // Higher speed limit for exploded particles
        const speed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
        if (speed > maxSpeed) {
          particle.vx = (particle.vx / speed) * maxSpeed;
          particle.vy = (particle.vy / speed) * maxSpeed;
        }

        // Check if particle is under specific elements
        const elements = document.elementsFromPoint(particle.x, particle.y);
        const isUnderMainElement = elements.some(el => 
          el.classList.contains('bg-black/30') ||
          (el.tagName === 'BUTTON' && !el.classList.contains('fixed'))
        );

        // Draw particle
        const baseOpacity = 0.3;
        const opacity = isUnderMainElement ? baseOpacity * 0.6 : baseOpacity;

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(139, 92, 246, ${opacity})`;
        ctx.fill();
        ctx.shadowBlur = 15;
        ctx.shadowColor = `rgba(139, 92, 246, ${opacity * 1.5})`;
      }

      requestAnimationFrame(animate);
    }

    animate();

    return () => {
      window.removeEventListener('particle-explosion', explosionHandler as EventListener);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', resizeCanvas);
      canvas.remove();
    };
  }, []);

  return null;
};

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
  const [textHover, setTextHover] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isPlaying, setIsPlaying] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [showBrainrot, setShowBrainrot] = useState(false);
  const [videoPositions, setVideoPositions] = useState<Array<{id: number, x: number, y: number, videoIndex: number}>>([]);
  const [pfpRotation, setPfpRotation] = useState(0);
  const videoRefs = useRef<{[key: string]: HTMLVideoElement | null}>({});

  const brainrotVideos = [
    '/brainrot1.mp4',
    '/brainrot2.mp4',
    '/brainrot3.mp4',
    '/brainrot4.mp4',
    '/brainrot5.mp4'
  ];

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

  const logToLinear = (value: number) => {
    // Gentler curve that preserves more volume in lower range
    return Math.pow(value, 1.5);
  };

  const linearToLog = (value: number) => {
    // Inverse of the curve
    return Math.pow(value, 1/1.5);
  };

  const handleStart = () => {
    const audio = new Audio('/location.mp3');
    audio.volume = logToLinear(volume);
    audio.loop = true;
    audioRef.current = audio;
    audio.play()
      .then(() => {
        setIsPlaying(true);
        setShowIntro(false);
      })
      .catch((error) => {
        console.error('Error playing audio:', error);
        setShowIntro(false);
      });
  };

  const handleBackgroundClick = useCallback((e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Remove the inner circle effect
    setClickEffects(prev => [
      ...prev,
      {
        x,
        y,
        id: nextEffectId++
      }
    ]);
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

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const logValue = parseFloat(e.target.value);
    const linearVolume = logToLinear(logValue);
    setVolume(logValue);
    if (audioRef.current) {
      audioRef.current.volume = linearVolume;
    }
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handlePfpClick = useCallback((e: React.MouseEvent) => {
    setPfpRotation(prev => prev + 360);
    
    // Get the profile picture position
    const pfpElement = e.currentTarget as HTMLElement;
    const rect = pfpElement.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    // Dispatch explosion event
    window.dispatchEvent(new CustomEvent('particle-explosion', {
      detail: { x, y }
    }));
  }, []);

  return (
    <>
      <ParticleCanvas />
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
                left: effect.x,
                top: effect.y,
              }}
            >
              {/* Remove the inner circle and flash effects, keep only the outer ring */}
              <div
                className="absolute -translate-x-1/2 -translate-y-1/2 border-2 border-purple-500/30 rounded-full animate-ripple"
              />
            </div>
          ))}

          {showIntro ? (
            <div 
              className="min-h-screen select-none relative text-white"
              onClick={handleStart}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleStart();
                }
              }}
            >
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div 
                  ref={welcomeRef}
                  onMouseMove={(e) => handleMouseMove(e, true)}
                  onMouseLeave={() => handleMouseLeave(true)}
                  className="text-center space-y-8 p-8 rounded-2xl bg-purple-900/20 backdrop-blur-sm border border-purple-500/20 shadow-xl transform transition-all duration-200 ease-out w-11/12 max-w-lg mx-auto"
                  style={{
                    transform: `perspective(1000px) rotateX(${welcomeTilt.x}deg) rotateY(${welcomeTilt.y}deg)`,
                    boxShadow: `
                      ${-welcomeTilt.y}px ${-welcomeTilt.x}px 20px rgba(139, 92, 246, 0.1),
                      0 4px 6px -1px rgba(0, 0, 0, 0.1),
                      0 2px 4px -1px rgba(0, 0, 0, 0.06)
                    `
                  }}
                >
                  <h1 
                    className="text-5xl md:text-7xl font-bold relative group cursor-default select-none animate-float"
                    onMouseEnter={() => setTextHover(true)}
                    onMouseLeave={() => setTextHover(false)}
                  >
                    {/* Enhanced glowing background effect */}
                    <div 
                      className="absolute inset-0 blur-[50px] bg-purple-500/50 rounded-full transition-all duration-300 group-hover:bg-purple-400/70 group-hover:blur-[100px]"
                      style={{
                        transform: textHover ? 'scale(1.5)' : 'scale(1)',
                        opacity: textHover ? 1 : 0.7,
                      }}
                    />
                    
                    {/* Main text with enhanced gradient */}
                    <span className="relative bg-clip-text text-transparent bg-gradient-to-b from-white via-purple-200 to-purple-400 hover:from-purple-100 hover:via-white hover:to-purple-300 transition-all duration-300 drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
                      <span className="inline-block hover:scale-125 transition-transform duration-150 hover:text-white">W</span>
                      <span className="inline-block hover:scale-125 transition-transform duration-150 hover:text-white">e</span>
                      <span className="inline-block hover:scale-125 transition-transform duration-150 hover:text-white">l</span>
                      <span className="inline-block hover:scale-125 transition-transform duration-150 hover:text-white">c</span>
                      <span className="inline-block hover:scale-125 transition-transform duration-150 hover:text-white">o</span>
                      <span className="inline-block hover:scale-125 transition-transform duration-150 hover:text-white">m</span>
                      <span className="inline-block hover:scale-125 transition-transform duration-150 hover:text-white">e</span>
                    </span>

                    {/* Enhanced animated border */}
                    <div className="absolute -inset-2 border-2 border-purple-400/30 rounded-lg blur transition-all duration-300 opacity-0 group-hover:opacity-100" />
                    
                    {/* Additional glow effect */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/0 via-purple-400/10 to-purple-600/0 rounded-lg blur-xl transition-all duration-300 opacity-0 group-hover:opacity-100" />
                  </h1>
                  <div className="text-base md:text-lg font-medium bg-purple-600/30 hover:bg-purple-500/40 px-4 md:px-8 py-3 md:py-4 rounded-lg shadow-lg transform hover:scale-110 transition-all duration-300 backdrop-blur-sm hover:shadow-purple-500/50 group">
                    Click Anywhere to Start
                    <div className="h-0.5 w-0 group-hover:w-full bg-purple-400/50 transition-all duration-300" />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="min-h-screen text-white flex flex-col items-center justify-center p-4 md:p-8">
              <div 
                ref={containerRef}
                onMouseMove={(e) => handleMouseMove(e)}
                onMouseLeave={() => handleMouseLeave()}
                className="flex flex-col items-center space-y-4 md:space-y-6 bg-black/20 backdrop-blur-sm p-6 md:p-8 rounded-2xl w-11/12 max-w-md transition-transform duration-200 ease-out"
                style={{
                  transform: `perspective(1000px) rotateX(${tiltEffect.x}deg) rotateY(${tiltEffect.y}deg)`,
                  boxShadow: `
                    ${-tiltEffect.y}px ${-tiltEffect.x}px 20px rgba(139, 92, 246, 0.1),
                    0 4px 6px -1px rgba(0, 0, 0, 0.1),
                    0 2px 4px -1px rgba(0, 0, 0, 0.06)
                  `
                }}
              >
                <div 
                  className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-purple-500 shadow-lg animate-fade-in-scale cursor-pointer group relative"
                  onClick={handlePfpClick}
                  style={{
                    transform: `rotate(${pfpRotation}deg)`,
                    transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                >
                  <div className="relative">
                    <Image
                      src="/profile.jpg"
                      alt="Profile Picture"
                      width={128}
                      height={128}
                      className="object-cover transition-opacity group-hover:opacity-90"
                      priority
                      onContextMenu={(e) => e.preventDefault()}
                      draggable="false"
                    />
                  </div>
                  <span className="absolute inset-0 flex items-center justify-center text-sm text-purple-300/80 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none bg-black/40 backdrop-blur-[2px]">
                    click me
                  </span>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">Darnix</h1>
                <p className="text-purple-300/50 text-sm mt-0.5">(darnixgotbanned on discord)</p>
                <p className="text-purple-300 text-center text-base md:text-lg">
                  Proud <a href="https://fatality.win/members/darnix.49526/" className="text-purple-400 hover:text-purple-300 transition-colors font-semibold hover:scale-110 inline-block">
                    fatality
                  </a> user & aspiring developer
                </p>

                <p className="text-purple-200/40 text-center text-sm italic mt-1">
                  "The quieter you become, the more you can hear"
                </p>
              </div>

              {/* Buttons and Audio Controls Container */}
              <div className="mt-8 md:mt-12 w-11/12 max-w-md z-10 space-y-6 md:space-y-8">
                {/* Buttons */}
                <div className="space-y-3 md:space-y-4">
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

                {/* Audio Controls - now same width as buttons */}
                <div className="bg-black/30 backdrop-blur-sm rounded-xl overflow-hidden">
                  <div className="flex items-center px-4 py-4">
                    <button
                      onClick={togglePlay}
                      className="p-2.5 rounded-lg bg-purple-600/30 hover:bg-purple-500/40 transition-all duration-300 group mr-4"
                    >
                      {isPlaying ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6 text-purple-200/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6 text-purple-200/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                    </button>
                    
                    <div className="flex-1 flex items-center">
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="h-4 w-4 md:h-5 md:w-5 text-purple-300/50 mr-3" 
                        viewBox="0 0 20 20" 
                        fill="currentColor"
                      >
                        <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                      </svg>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={volume}
                        onChange={handleVolumeChange}
                        className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-purple-900/30 
                          [&::-webkit-slider-thumb]:appearance-none 
                          [&::-webkit-slider-thumb]:h-3.5 
                          [&::-webkit-slider-thumb]:w-3.5 
                          md:[&::-webkit-slider-thumb]:h-4 
                          md:[&::-webkit-slider-thumb]:w-4 
                          [&::-webkit-slider-thumb]:rounded-full 
                          [&::-webkit-slider-thumb]:bg-purple-400 
                          hover:[&::-webkit-slider-thumb]:bg-purple-300 
                          [&::-webkit-slider-thumb]:transition-colors
                          [&::-webkit-slider-thumb]:shadow-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
