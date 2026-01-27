export const formatTime = (seconds: number, shouldShowPlaceholder = false): string => {
    if (shouldShowPlaceholder) return '--:--';
    if (!isFinite(seconds) || isNaN(seconds)) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const dBToLinear = (db: number) => Math.pow(10, db / 20);
