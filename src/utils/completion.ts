import { DailyProgress } from '@/types';

export function checkCompletion(entry: DailyProgress | undefined): boolean {
    if (!entry) return false;
    return (
        entry.workouts.indoor &&
        entry.workouts.outdoor &&
        entry.diet &&
        entry.reading &&
        entry.photo &&
        entry.water >= 4000
    );
}
