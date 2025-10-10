import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../services/accountService';

export const useInactivityTimer = () => {
  const navigate = useNavigate();
  const timeoutRef = useRef(null);
  const randomIntervalRef = useRef(null);

  useEffect(() => {
    // Get settings from localStorage
    const inactivityAction = localStorage.getItem('inactivityAction') || 'none';
    const randomTabSwitch = localStorage.getItem('randomTabSwitch') === 'true';
    const inactivityTime = parseInt(localStorage.getItem('inactivityTime') || '5');

    console.log('Inactivity settings loaded:', { inactivityAction, randomTabSwitch, inactivityTime });

    if (inactivityAction === 'none' && !randomTabSwitch) {
      console.log('Inactivity protection disabled');
      return; // Features disabled
    }

    const handleInactivityAction = () => {
      console.log('Inactivity triggered! Action:', inactivityAction);
      
      if (inactivityAction === 'lock') {
        console.log('Locking app...');
        logout();
        navigate('/login');
      } else if (inactivityAction === 'switch') {
        console.log('Switching to Google...');
        window.location.href = 'https://www.google.com';
      }
    };

    const resetTimer = () => {
      console.log('Activity detected - timer reset');
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      if (inactivityAction !== 'none') {
        console.log(`Starting ${inactivityTime} minute inactivity timer`);
        timeoutRef.current = setTimeout(() => {
          handleInactivityAction();
        }, inactivityTime * 60 * 1000); // Convert minutes to milliseconds
      }
    };

    // Events to track user activity
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click', 'mousemove'];

    events.forEach(event => {
      document.addEventListener(event, resetTimer);
    });

    // Start the timer immediately
    resetTimer();

    // Random tab switch feature
    if (randomTabSwitch) {
      console.log('Random tab switching enabled');
      
      const getRandomInterval = () => {
        const minutes = Math.random() * (5 - 2) + 2;
        console.log(`Next random check in ${minutes.toFixed(2)} minutes`);
        return minutes * 60 * 1000;
      };
      
      const scheduleRandomSwitch = () => {
        randomIntervalRef.current = setTimeout(() => {
          // 20% chance to switch randomly
          if (Math.random() < 0.2) {
            console.log('Random tab switch triggered!');
            window.location.href = 'https://www.google.com';
          } else {
            console.log('Random check passed - no switch');
            scheduleRandomSwitch(); // Schedule next check
          }
        }, getRandomInterval());
      };

      scheduleRandomSwitch();
    }

    // Cleanup function
    return () => {
      console.log('Cleaning up inactivity timer');
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      if (randomIntervalRef.current) {
        clearTimeout(randomIntervalRef.current);
      }
      
      events.forEach(event => {
        document.removeEventListener(event, resetTimer);
      });
    };
  }, [navigate]);
};
