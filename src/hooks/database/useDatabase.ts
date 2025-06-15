
import { db } from '@/lib/database';

export const useDatabase = () => {
  const initializeDatabase = () => {
    db.seedDatabase();
  };

  return {
    initializeDatabase,
  };
};
