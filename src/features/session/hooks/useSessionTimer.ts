import { useState, useEffect } from 'react';

export const useSessionTimer = (scheduledEnd?: string | Date) => {
  const [secondsRemaining, setSecondsRemaining] = useState<number | null>(null);
  const [isExpired, setIsExpired] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);

      if (scheduledEnd) {
        const endTime = new Date(scheduledEnd).getTime();
        const now = Date.now();
        const diff = Math.floor((endTime - now) / 1000);

        if (diff <= 0) {
          setSecondsRemaining(0);
          setIsExpired(true);
        } else {
          setSecondsRemaining(diff);
          setIsExpired(false);
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [scheduledEnd]);

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    const pad = (n: number) => n.toString().padStart(2, '0');

    if (hours > 0) {
      return `${pad(hours)}:${pad(minutes)}:${pad(secs)}`;
    }
    return `${pad(minutes)}:${pad(secs)}`;
  };

  return {
    elapsedSeconds,
    secondsRemaining,
    isExpired,
    formattedElapsed: formatTime(elapsedSeconds),
    formattedRemaining: secondsRemaining !== null ? formatTime(secondsRemaining) : null,
  };
};
