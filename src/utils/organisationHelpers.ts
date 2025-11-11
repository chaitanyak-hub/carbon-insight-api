import { SiteRecord } from "./chartHelpers";
import { startOfMonth, endOfMonth, subMonths, subDays, startOfDay, endOfDay, format, eachDayOfInterval } from "date-fns";

export interface OrganisationStats {
  totalSites: number;
  uniqueCustomers: number;
  totalInteractions: number;
  totalSavings: number;
  totalCarbonSavings: number;
}

export interface DailyStats {
  date: string;
  sites: number;
  customers: number;
  interactions: number;
  savings: number;
  carbonSavings: number;
}

const isDateInRange = (dateStr: string | null | undefined, startDate: Date, endDate: Date): boolean => {
  if (!dateStr) return false;
  const date = new Date(dateStr);
  return date >= startDate && date <= endDate;
};

const calculateSavingsFromRecommendations = (recommendations: any[]): { savings: number; carbonSavings: number } => {
  if (!recommendations || !Array.isArray(recommendations) || recommendations.length === 0) {
    return { savings: 0, carbonSavings: 0 };
  }
  
  const savings = recommendations
    .filter((rec: any) => rec.potential_savings > 0)
    .reduce((total: number, rec: any) => total + (rec.potential_savings || 0), 0);
  
  const carbonSavings = recommendations
    .filter((rec: any) => rec.potential_carbon_savings > 0)
    .reduce((total: number, rec: any) => total + (rec.potential_carbon_savings || 0), 0);
  
  return { savings, carbonSavings };
};

export const getOrganisationStats = (
  records: SiteRecord[],
  startDate: Date,
  endDate: Date
): OrganisationStats => {
  const activeSites = records.filter(
    (record) =>
      record.site_status === "ACTIVE" &&
      isDateInRange(record.onboard_date, startDate, endDate)
  );

  const uniqueCustomers = new Set(
    activeSites.map((record) => record.contact_email).filter(Boolean)
  ).size;

  const totalInteractions = activeSites.reduce(
    (sum, record) => sum + (record.logged_in_contacts || 0),
    0
  );

  let totalSavings = 0;
  let totalCarbonSavings = 0;

  activeSites.forEach((record) => {
    if (record.recommendations) {
      const { savings, carbonSavings } = calculateSavingsFromRecommendations(record.recommendations);
      totalSavings += savings;
      totalCarbonSavings += carbonSavings;
    }
  });

  return {
    totalSites: activeSites.length,
    uniqueCustomers,
    totalInteractions,
    totalSavings,
    totalCarbonSavings,
  };
};

export const getLast7DaysStats = (records: SiteRecord[]): OrganisationStats => {
  const now = new Date();
  const startDate = startOfDay(subDays(now, 7));
  const endDate = endOfDay(now);
  return getOrganisationStats(records, startDate, endDate);
};

export const getCurrentMonthStats = (records: SiteRecord[]): OrganisationStats => {
  const now = new Date();
  const startDate = startOfMonth(now);
  const endDate = endOfMonth(now);
  return getOrganisationStats(records, startDate, endDate);
};

export const getPreviousMonthStats = (records: SiteRecord[]): OrganisationStats => {
  const now = new Date();
  const previousMonth = subMonths(now, 1);
  const startDate = startOfMonth(previousMonth);
  const endDate = endOfMonth(previousMonth);
  return getOrganisationStats(records, startDate, endDate);
};

export const getTotalStats = (records: SiteRecord[]): OrganisationStats => {
  const activeSites = records.filter((record) => record.site_status === "ACTIVE");

  const uniqueCustomers = new Set(
    activeSites.map((record) => record.contact_email).filter(Boolean)
  ).size;

  const totalInteractions = activeSites.reduce(
    (sum, record) => sum + (record.logged_in_contacts || 0),
    0
  );

  let totalSavings = 0;
  let totalCarbonSavings = 0;

  activeSites.forEach((record) => {
    if (record.recommendations) {
      const { savings, carbonSavings } = calculateSavingsFromRecommendations(record.recommendations);
      totalSavings += savings;
      totalCarbonSavings += carbonSavings;
    }
  });

  return {
    totalSites: activeSites.length,
    uniqueCustomers,
    totalInteractions,
    totalSavings,
    totalCarbonSavings,
  };
};

const getDailyStatsForRange = (records: SiteRecord[], startDate: Date, endDate: Date): DailyStats[] => {
  const days = eachDayOfInterval({ start: startDate, end: endDate });
  
  return days.map((day) => {
    const dayStart = startOfDay(day);
    const dayEnd = endOfDay(day);
    
    const daySites = records.filter(
      (record) =>
        record.site_status === "ACTIVE" &&
        isDateInRange(record.onboard_date, dayStart, dayEnd)
    );

    const uniqueCustomers = new Set(
      daySites.map((record) => record.contact_email).filter(Boolean)
    ).size;

    const totalInteractions = daySites.reduce(
      (sum, record) => sum + (record.logged_in_contacts || 0),
      0
    );

    let totalSavings = 0;
    let totalCarbonSavings = 0;

    daySites.forEach((record) => {
      if (record.recommendations) {
        const { savings, carbonSavings } = calculateSavingsFromRecommendations(record.recommendations);
        totalSavings += savings;
        totalCarbonSavings += carbonSavings;
      }
    });

    return {
      date: format(day, "MMM dd"),
      sites: daySites.length,
      customers: uniqueCustomers,
      interactions: totalInteractions,
      savings: totalSavings,
      carbonSavings: totalCarbonSavings,
    };
  });
};

export const getLast7DaysDailyStats = (records: SiteRecord[]): DailyStats[] => {
  const now = new Date();
  const startDate = startOfDay(subDays(now, 6));
  const endDate = endOfDay(now);
  return getDailyStatsForRange(records, startDate, endDate);
};

export const getCurrentMonthDailyStats = (records: SiteRecord[]): DailyStats[] => {
  const now = new Date();
  const startDate = startOfMonth(now);
  const endDate = endOfDay(now);
  return getDailyStatsForRange(records, startDate, endDate);
};

export const getPreviousMonthDailyStats = (records: SiteRecord[]): DailyStats[] => {
  const now = new Date();
  const previousMonth = subMonths(now, 1);
  const startDate = startOfMonth(previousMonth);
  const endDate = endOfMonth(previousMonth);
  return getDailyStatsForRange(records, startDate, endDate);
};

export const getTotalDailyStats = (records: SiteRecord[]): DailyStats[] => {
  const activeSites = records.filter((record) => record.site_status === "ACTIVE" && record.onboard_date);
  
  if (activeSites.length === 0) return [];
  
  const dates = activeSites.map((record) => new Date(record.onboard_date!)).sort((a, b) => a.getTime() - b.getTime());
  const startDate = startOfMonth(dates[0]);
  const endDate = endOfDay(new Date());
  
  const months = eachDayOfInterval({ start: startDate, end: endDate }).filter((day) => day.getDate() === 1);
  
  return months.map((month) => {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    
    const monthSites = activeSites.filter(
      (record) => isDateInRange(record.onboard_date, monthStart, monthEnd)
    );

    const uniqueCustomers = new Set(
      monthSites.map((record) => record.contact_email).filter(Boolean)
    ).size;

    const totalInteractions = monthSites.reduce(
      (sum, record) => sum + (record.logged_in_contacts || 0),
      0
    );

    let totalSavings = 0;
    let totalCarbonSavings = 0;

    monthSites.forEach((record) => {
      if (record.recommendations) {
        const { savings, carbonSavings } = calculateSavingsFromRecommendations(record.recommendations);
        totalSavings += savings;
        totalCarbonSavings += carbonSavings;
      }
    });

    return {
      date: format(month, "MMM yyyy"),
      sites: monthSites.length,
      customers: uniqueCustomers,
      interactions: totalInteractions,
      savings: totalSavings,
      carbonSavings: totalCarbonSavings,
    };
  });
};
