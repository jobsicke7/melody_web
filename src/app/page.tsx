'use client';

import { useEffect, useState, useRef } from 'react';
import styles from './HeroSection.module.css';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import ReactPlayer from 'react-player';

export default function HeroSection() {
  const [showVideo, setShowVideo] = useState(false);
  const [animationState, setAnimationState] = useState(0);
  const animationRef = useRef<NodeJS.Timeout[]>([]);

  // Animation states:
  // 0: Initial state - "일상속 멜로디를" (everything together)
  // 1: "멜로" (extracted, other parts faded out)
  // 2: "멜로와 함께" (with "와 함께" faded in)
  // 3: Back to "일상속 멜로디를" (with "일상속" and "디를" faded in)

  useEffect(() => {
    const videoTimer = setTimeout(() => setShowVideo(true), 2000);
    
    // Initial entry animation
    setAnimationState(0);
    
    const startAnimation = () => {
      // Step 1 to 2: fade out "일상속" and "디를", keep "멜로"
      const step1 = setTimeout(() => setAnimationState(1), 3000);
      
      // Step 2 to 3: fade in "와 함께"
      const step2 = setTimeout(() => setAnimationState(2), 4500);
      
      // Reset for loop
      const resetTimer = setTimeout(() => {
        setAnimationState(0);
        startAnimation(); // Restart the sequence
      }, 7000);
      
      // Store timer references for cleanup
      animationRef.current = [step1, step2, resetTimer];
    };
    
    // Start animation sequence
    startAnimation();
    
    return () => {
      clearTimeout(videoTimer);
      if (animationRef.current.length > 0) {
        animationRef.current.forEach(timer => clearTimeout(timer));
      }
    };
  }, []);

  return (
    <motion.section 
      className={styles.hero}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <div className={styles.content}>
        <div className={styles.animatedTextContainer}>
          {/* Initial animation - full text with rise-up animation */}
          {animationState === 0 && (
            <div className={styles.textWrapper}>
              <motion.span
                className={styles.textPart}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
              >
                일상속&nbsp;
              </motion.span>
              <motion.span
                className={styles.textPart}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.2 }}
              >
                멜로
              </motion.span>
              <motion.span
                className={styles.textPart}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.4 }}
              >
                디를
              </motion.span>
            </div>
          )}
          
          {/* Animation state 1 - only "멜로" remains and moves slightly left */}
          {animationState === 1 && (
          <div className={styles.textWrapper}>
            <motion.span
              className={styles.textPart}
              initial={{ opacity: 1 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              일상속&nbsp;
            </motion.span>
            <motion.span
              className={`${styles.textPart} ${styles.emphasis}`}
              initial={{ x: 0 }} // 시작 위치
              animate={{ x: 'calc(-7vw - 2vh)' }} // 화면 너비와 높이에 비례한 이동
              transition={{ duration: 0.8, delay: 0.5 }} // 애니메이션 지속 시간과 지연 시간
            >
              멜로
            </motion.span>
            <motion.span
              className={styles.textPart}
              initial={{ opacity: 1 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              디를
            </motion.span>
          </div>
        )}
          
          {/* Animation state 2 - "멜로와 함께" - fixed positioning */}
          {animationState === 2 && (
            <div className={styles.textWrapper}>
              <motion.span
                className={`${styles.textPart} ${styles.emphasis}`}
                initial={{ x: 0 }}
                animate={{ x: 0 }} // Keep this position consistent
              >
                멜로
              </motion.span>
              <motion.span
                className={styles.textPart}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
              >
                와 함께
              </motion.span>
            </div>
          )}
          
        </div>
        <p>멜로와 함께 더욱 즐거운 하루를 보내보세요.</p>
        <div className={styles.buttons}>
          <Link href="https://discord.com/oauth2/authorize?client_id=1310753814319468565&permissions=8&response_type=code&redirect_uri=https%3A%2F%2Fdev.jobsickes.shop%2Finvitethanks&integration_type=0&scope=identify+bot+applications.commands" target="_blank" className={styles.buttonPrimary}>초대하기</Link>
          <Link href="/commands" className={styles.buttonSecondary}>명령어</Link>
        </div>
      </div>
      <div className={styles.media}>
        {showVideo ? (
          <ReactPlayer 
            url="https://www.youtube.com/watch?v=WGm2HmXeeRI" 
            playing
            loop 
            muted 
            className={styles.video} 
          />
        ) : (<div></div>)}
      </div>
    </motion.section>
  );
}
