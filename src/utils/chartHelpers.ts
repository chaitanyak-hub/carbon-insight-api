export interface SiteRecord {
  agent_name?: string;
  site_status?: string;
  onboard_date?: string;
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
): { name: string; sites: number; uniqueContacts: number }[] => {
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
      record.onboard_date ? isDateInRange(record.onboard_date, startDate, endDate) : false
    );
  }

  // Group by agent and count sites + unique contacts
  const grouped = filtered.reduce((acc, record) => {
    const agentName = formatAgentName(record.agent_name!);
    if (!acc[agentName]) {
      acc[agentName] = { sites: 0, contacts: new Set<string>() };
    }
    acc[agentName].sites += 1;
    if (record.contact_email) {
      acc[agentName].contacts.add(record.contact_email.toLowerCase());
    }
    return acc;
  }, {} as Record<string, { sites: number; contacts: Set<string> }>);

  // Convert to array and sort by sites count
  return Object.entries(grouped)
    .map(([name, data]) => ({ 
      name, 
      sites: data.sites,
      uniqueContacts: data.contacts.size
    }))
    .sort((a, b) => b.sites - a.sites);
};

export const filterAndGroupSitesByTeam = (
  records: SiteRecord[],
  teamMapping: (email: string) => string | null,
  startDate?: Date,
  endDate?: Date
): { name: string; sites: number; uniqueContacts: number }[] => {
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
      record.onboard_date ? isDateInRange(record.onboard_date, startDate, endDate) : false
    );
  }

  // Group by team and count sites + unique contacts
  const grouped = filtered.reduce((acc, record) => {
    const teamName = teamMapping(record.agent_name!);
    if (teamName) {
      if (!acc[teamName]) {
        acc[teamName] = { sites: 0, contacts: new Set<string>() };
      }
      acc[teamName].sites += 1;
      if (record.contact_email) {
        acc[teamName].contacts.add(record.contact_email.toLowerCase());
      }
    }
    return acc;
  }, {} as Record<string, { sites: number; contacts: Set<string> }>);

  // Convert to array and sort by sites count
  return Object.entries(grouped)
    .map(([name, data]) => ({ 
      name, 
      sites: data.sites,
      uniqueContacts: data.contacts.size
    }))
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
