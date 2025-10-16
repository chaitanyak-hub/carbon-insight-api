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
  // Wednesday is day 3, calculate days to go back to Wednesday
  const daysToGoBack = (day - 3 + 7) % 7;
  const result = new Date(date);
  result.setDate(result.getDate() - daysToGoBack);
  return new Date(result.setHours(0, 0, 0, 0));
};

export const getEndOfWeek = (date: Date): Date => {
  const startOfWeek = getStartOfWeek(new Date(date));
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  return new Date(endOfWeek.setHours(23, 59, 59, 999));
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
  
  // Get current month range
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  return {
    today: { start: today, end: new Date() },
    yesterday: { start: yesterday, end: new Date(yesterday.setHours(23, 59, 59, 999)) },
    thisWeek: { start: weekStart, end: weekEnd },
    thisMonth: { start: monthStart, end: monthEnd },
  };
};

export const getWeekLabel = (date: Date): string => {
  const start = getStartOfWeek(new Date(date));
  const end = getEndOfWeek(new Date(date));
  return `${start.getDate()}/${start.getMonth() + 1} - ${end.getDate()}/${end.getMonth() + 1}`;
};

export const groupByWeekAndAgent = (
  records: SiteRecord[],
  teamMapping?: (email: string) => string | null
): { week: string; [key: string]: any }[] => {
  // Filter for active sites with @edfenergy.com
  const filtered = records.filter(
    (record) =>
      record.site_status === 'ACTIVE' &&
      record.agent_name &&
      typeof record.agent_name === 'string' &&
      record.agent_name.trim().includes('@edfenergy.com') &&
      record.onboard_date
  );

  // Group by week and agent/team
  const grouped = filtered.reduce((acc, record) => {
    const date = new Date(record.onboard_date!);
    const weekLabel = getWeekLabel(date);
    const identifier = teamMapping 
      ? teamMapping(record.agent_name!)
      : formatAgentName(record.agent_name!);
    
    if (!identifier) return acc;
    
    if (!acc[weekLabel]) {
      acc[weekLabel] = { 
        weekStart: getStartOfWeek(new Date(date)),
        agents: {}
      };
    }
    
    if (!acc[weekLabel].agents[identifier]) {
      acc[weekLabel].agents[identifier] = {
        sites: 0,
        contacts: new Set<string>(),
        customerInteraction: 0
      };
    }
    
    acc[weekLabel].agents[identifier].sites += 1;
    if (record.contact_email) {
      acc[weekLabel].agents[identifier].contacts.add(record.contact_email.toLowerCase());
    }
    if (record.latest_contact_login) {
      acc[weekLabel].agents[identifier].customerInteraction += 1;
    }
    
    return acc;
  }, {} as Record<string, { weekStart: Date; agents: Record<string, { sites: number; contacts: Set<string>; customerInteraction: number }> }>);

  // Convert to array format suitable for stacked bar charts
  return Object.entries(grouped)
    .map(([week, data]) => {
      const weekData: any = { week, weekStart: data.weekStart };
      Object.entries(data.agents).forEach(([agent, stats]) => {
        weekData[agent] = stats.sites;
        weekData[`${agent}_contacts`] = stats.contacts.size;
        weekData[`${agent}_interaction`] = stats.customerInteraction;
      });
      return weekData;
    })
    .sort((a, b) => a.weekStart.getTime() - b.weekStart.getTime())
    .map(({ weekStart, ...rest }) => rest);
};
