import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export const useInactivityTimer = () => {
  const navigate = useNavigate();
  const timeoutRef = useRef(null);

  useEffect(() => {
    // Get settings from localStorage
    const lockOnInactivity = localStorage.getItem('lockOnInactivity') === 'true';
    const randomTabSwitch = localStorage.getItem('randomTabSwitch') === 'true';
    const inactivityTime = parseInt(localStorage.getItem('inactivityTime') || '5');

    if (!lockOnInactivity && !randomTabSwitch) {
      return; // Features disabled
    }

    const resetTimer = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        if (lockOnInactivity) {
          // Lock the app - redirect to login
          localStorage.removeItem('aegis-session');
          navigate('/login');
        } else if (randomTabSwitch) {
          // Switch to Google
          window.location.href = 'https://www.google.com';
        }
      }, inactivityTime * 60 * 1000); // Convert minutes to milliseconds
    };

    // Events to track user activity
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];

    events.forEach(event => {
      document.addEventListener(event, resetTimer);
    });

    // Start the timer
    resetTimer();

    // Random tab switch feature
    let randomSwitchInterval;
    if (randomTabSwitch) {
      // Random interval between 2-5 minutes
      const getRandomInterval = () => Math.random() * (5 - 2) + 2;
      
      const scheduleRandomSwitch = () => {
        const minutes = getRandomInterval();
        randomSwitchInterval = setTimeout(() => {
          // 20% chance to switch randomly
          if (Math.random() < 0.2) {
            window.location.href = 'https://www.google.com';
          } else {
            scheduleRandomSwitch(); // Schedule next check
          }
        }, minutes * 60 * 1000);
      };

      scheduleRandomSwitch();
    }

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (randomSwitchInterval) {
        clearTimeout(randomSwitchInterval);
      }
      events.forEach(event => {
        document.removeEventListener(event, resetTimer);
      });
    };
  }, [navigate]);
};
