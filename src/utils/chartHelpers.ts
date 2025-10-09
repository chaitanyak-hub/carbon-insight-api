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
): { name: string; sites: number; uniqueContacts: number; customerInteraction: number }[] => {
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

  // Group by agent and count sites + unique contacts + customer interaction
  const grouped = filtered.reduce((acc, record) => {
    const agentName = formatAgentName(record.agent_name!);
    if (!acc[agentName]) {
      acc[agentName] = { sites: 0, contacts: new Set<string>(), customerInteraction: 0 };
    }
    acc[agentName].sites += 1;
    if (record.contact_email) {
      acc[agentName].contacts.add(record.contact_email.toLowerCase());
    }
    if (record.latest_contact_login) {
      acc[agentName].customerInteraction += 1;
    }
    return acc;
  }, {} as Record<string, { sites: number; contacts: Set<string>; customerInteraction: number }>);

  // Convert to array and sort by sites count
  return Object.entries(grouped)
    .map(([name, data]) => ({ 
      name, 
      sites: data.sites,
      uniqueContacts: data.contacts.size,
      customerInteraction: data.customerInteraction
    }))
    .sort((a, b) => b.sites - a.sites);
};

export const filterAndGroupSitesByTeam = (
  records: SiteRecord[],
  teamMapping: (email: string) => string | null,
  startDate?: Date,
  endDate?: Date
): { name: string; sites: number; uniqueContacts: number; customerInteraction: number }[] => {
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

  // Group by team and count sites + unique contacts + customer interaction
  const grouped = filtered.reduce((acc, record) => {
    const teamName = teamMapping(record.agent_name!);
    if (teamName) {
      if (!acc[teamName]) {
        acc[teamName] = { sites: 0, contacts: new Set<string>(), customerInteraction: 0 };
      }
      acc[teamName].sites += 1;
      if (record.contact_email) {
        acc[teamName].contacts.add(record.contact_email.toLowerCase());
      }
      if (record.latest_contact_login) {
        acc[teamName].customerInteraction += 1;
      }
    }
    return acc;
  }, {} as Record<string, { sites: number; contacts: Set<string>; customerInteraction: number }>);

  // Convert to array and sort by sites count
  return Object.entries(grouped)
    .map(([name, data]) => ({ 
      name, 
      sites: data.sites,
      uniqueContacts: data.contacts.size,
      customerInteraction: data.customerInteraction
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

export const getWeekLabel = (date: Date): string => {
  const start = getStartOfWeek(new Date(date));
  const end = getEndOfWeek(new Date(date));
  return `${start.getDate()}/${start.getMonth() + 1} - ${end.getDate()}/${end.getMonth() + 1}`;
};

export const groupByWeek = (
  records: SiteRecord[],
  teamMapping?: (email: string) => string | null
): { week: string; sites: number; uniqueContacts: number; customerInteraction: number }[] => {
  // Filter for active sites with @edfenergy.com
  const filtered = records.filter(
    (record) =>
      record.site_status === 'ACTIVE' &&
      record.agent_name &&
      typeof record.agent_name === 'string' &&
      record.agent_name.trim().includes('@edfenergy.com') &&
      record.onboard_date
  );

  // Group by week
  const grouped = filtered.reduce((acc, record) => {
    const date = new Date(record.onboard_date!);
    const weekLabel = getWeekLabel(date);
    
    if (!acc[weekLabel]) {
      acc[weekLabel] = { 
        weekStart: getStartOfWeek(new Date(date)),
        sites: 0, 
        contacts: new Set<string>(), 
        customerInteraction: 0 
      };
    }
    
    acc[weekLabel].sites += 1;
    if (record.contact_email) {
      acc[weekLabel].contacts.add(record.contact_email.toLowerCase());
    }
    if (record.latest_contact_login) {
      acc[weekLabel].customerInteraction += 1;
    }
    
    return acc;
  }, {} as Record<string, { weekStart: Date; sites: number; contacts: Set<string>; customerInteraction: number }>);

  // Convert to array and sort by week start date
  return Object.entries(grouped)
    .map(([week, data]) => ({
      week,
      sites: data.sites,
      uniqueContacts: data.contacts.size,
      customerInteraction: data.customerInteraction,
      weekStart: data.weekStart
    }))
    .sort((a, b) => a.weekStart.getTime() - b.weekStart.getTime())
    .map(({ week, sites, uniqueContacts, customerInteraction }) => ({
      week,
      sites,
      uniqueContacts,
      customerInteraction
    }));
};
