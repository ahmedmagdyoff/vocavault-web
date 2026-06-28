'use client';

import { useState, useEffect } from 'react';

interface LearningProgress {
  dailyReviewed: number;
  totalReviewed: number;
  streak: number;
}

const STORAGE_KEY = 'voca_vault_progress';

/**
 * Calculates a real streak count by walking backwards from today through
 * consecutive days that have review activity in localStorage.
 */
function calculateStreak(dailyStats: Record<string, number>): number {
  const today = new Date();
  let streak = 0;

  for (let daysAgo = 0; daysAgo < 365; daysAgo++) {
    const date = new Date(today);
    date.setDate(today.getDate() - daysAgo);
    const dateKey = date.toISOString().split('T')[0];

    if (dailyStats[dateKey] && dailyStats[dateKey] > 0) {
      streak++;
    } else if (daysAgo === 0) {
      // Today has no reviews yet — don't break, check yesterday
      continue;
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Manages learning progress stored in localStorage —
 * daily reviewed count, total reviewed, and streak calculation.
 */
export function useLearningProgress(): LearningProgress & {
  recordReview: () => void;
} {
  const [dailyReviewed, setDailyReviewed] = useState(0);
  const [totalReviewed, setTotalReviewed] = useState(0);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return;

      const progressRecord = JSON.parse(stored);
      const today = new Date().toISOString().split('T')[0];

      setTotalReviewed(progressRecord.totalReviewed || 0);
      setDailyReviewed(progressRecord.dailyStats?.[today] || 0);
      setStreak(calculateStreak(progressRecord.dailyStats || {}));
    } catch (e) {
      console.error('Failed to load progress', e);
    }
  };

  const recordReview = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const progressRecord = stored
        ? JSON.parse(stored)
        : { totalReviewed: 0, dailyStats: {} };
      const today = new Date().toISOString().split('T')[0];

      progressRecord.totalReviewed = (progressRecord.totalReviewed || 0) + 1;
      progressRecord.dailyStats[today] = (progressRecord.dailyStats[today] || 0) + 1;

      localStorage.setItem(STORAGE_KEY, JSON.stringify(progressRecord));
      setTotalReviewed(progressRecord.totalReviewed);
      setDailyReviewed(progressRecord.dailyStats[today]);
      setStreak(calculateStreak(progressRecord.dailyStats));
    } catch (e) {
      console.error('Failed to save progress', e);
    }
  };

  return { dailyReviewed, totalReviewed, streak, recordReview };
}
