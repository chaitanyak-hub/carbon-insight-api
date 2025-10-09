export interface SiteRecord {
  agent_name?: string;
  site_status?: string;
  created_at?: string;
  [key: string]: any;
}

export const formatAgentName = (email: string): string => {
  if (!email || !email.includes('@')) return email;
  
  // Extract name part before @
  const namePart = email.split('@')[0];
  
  // Replace dots with spaces and capitalize each word
  return namePart
    .split('.')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

export const getStartOfWeek = (date: Date): Date => {
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  return new Date(date.setDate(diff));
};

export const getEndOfWeek = (date: Date): Date => {
  const startOfWeek = getStartOfWeek(new Date(date));
  return new Date(startOfWeek.setDate(startOfWeek.getDate() + 6));
};

export const isDateInRange = (dateStr: string, startDate: Date, endDate: Date): boolean => {
  const date = new Date(dateStr);
  const start = new Date(startDate.setHours(0, 0, 0, 0));
  const end = new Date(endDate.setHours(23, 59, 59, 999));
  return date >= start && date <= end;
};

export const filterAndGroupSites = (
  records: SiteRecord[],
  startDate?: Date,
  endDate?: Date
): { name: string; sites: number }[] => {
  // Filter for active sites with @edfenergy.com
  let filtered = records.filter(
    (record) =>
      record.site_status === 'ACTIVE' &&
      record.agent_name &&
      typeof record.agent_name === 'string' &&
      record.agent_name.trim().includes('@edfenergy.com')
  );

  // Apply date filter if provided
  if (startDate && endDate && filtered.length > 0) {
    filtered = filtered.filter((record) =>
      record.created_at ? isDateInRange(record.created_at, startDate, endDate) : false
    );
  }

  // Group by agent and count
  const grouped = filtered.reduce((acc, record) => {
    const agentName = formatAgentName(record.agent_name!);
    acc[agentName] = (acc[agentName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Convert to array and sort by count
  return Object.entries(grouped)
    .map(([name, sites]) => ({ name, sites }))
    .sort((a, b) => b.sites - a.sites);
};

export const getDateRanges = () => {
  const now = new Date();
  const today = new Date(now.setHours(0, 0, 0, 0));
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const weekStart = getStartOfWeek(new Date());
  const weekEnd = getEndOfWeek(new Date());

  return {
    today: { start: today, end: new Date() },
    yesterday: { start: yesterday, end: new Date(yesterday.setHours(23, 59, 59, 999)) },
    thisWeek: { start: weekStart, end: weekEnd },
  };
};
