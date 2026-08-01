export const ACT_KEY = 'activities-loading';
export const ACT_TYPES = ['CALL','EMAIL','MEETING','NOTE','TASK'] as const;
export const ACT_COLORS: Record<string,string> = { CALL:'#4F8EF7',EMAIL:'#34D399',MEETING:'#A78BFA',NOTE:'#FBBF24',TASK:'#FB7185' };
