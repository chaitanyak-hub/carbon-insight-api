import { SiteRecord } from "./chartHelpers";
import { startOfMonth, endOfMonth, subMonths, subDays, startOfDay, endOfDay, format, eachDayOfInterval, startOfWeek, endOfWeek, eachWeekOfInterval } from "date-fns";

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

export interface RecommendationTypeStats {
  type: string;
  totalSavings: number;
  totalCost: number;
  totalCarbonSavings: number;
  count: number;
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
  
  return months
    .filter((month) => {
      const monthNum = month.getMonth();
      // Exclude July (6) and August (7)
      return monthNum !== 6 && monthNum !== 7;
    })
    .map((month) => {
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

const getWeeklyStatsForRange = (records: SiteRecord[], startDate: Date, endDate: Date): DailyStats[] => {
  const weeks = eachWeekOfInterval({ start: startDate, end: endDate }, { weekStartsOn: 1 });
  
  return weeks.map((weekStart, index) => {
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
    
    const weekSites = records.filter(
      (record) =>
        record.site_status === "ACTIVE" &&
        isDateInRange(record.onboard_date, weekStart, weekEnd)
    );

    const uniqueCustomers = new Set(
      weekSites.map((record) => record.contact_email).filter(Boolean)
    ).size;

    const totalInteractions = weekSites.reduce(
      (sum, record) => sum + (record.logged_in_contacts || 0),
      0
    );

    let totalSavings = 0;
    let totalCarbonSavings = 0;

    weekSites.forEach((record) => {
      if (record.recommendations) {
        const { savings, carbonSavings } = calculateSavingsFromRecommendations(record.recommendations);
        totalSavings += savings;
        totalCarbonSavings += carbonSavings;
      }
    });

    return {
      date: `Week ${index + 1}`,
      sites: weekSites.length,
      customers: uniqueCustomers,
      interactions: totalInteractions,
      savings: totalSavings,
      carbonSavings: totalCarbonSavings,
    };
  });
};

export const getCurrentMonthWeeklyStats = (records: SiteRecord[]): DailyStats[] => {
  const now = new Date();
  const startDate = startOfMonth(now);
  const endDate = endOfDay(now);
  return getWeeklyStatsForRange(records, startDate, endDate);
};

export const getPreviousMonthWeeklyStats = (records: SiteRecord[]): DailyStats[] => {
  const now = new Date();
  const previousMonth = subMonths(now, 1);
  const startDate = startOfMonth(previousMonth);
  const endDate = endOfMonth(previousMonth);
  return getWeeklyStatsForRange(records, startDate, endDate);
};

// Recommendation Type Analysis
const getRecommendationTypeStatsForRange = (
  records: SiteRecord[],
  startDate: Date,
  endDate: Date
): RecommendationTypeStats[] => {
  const activeSites = records.filter(
    (record) =>
      record.site_status === "ACTIVE" &&
      isDateInRange(record.onboard_date, startDate, endDate)
  );

  const typeMap = new Map<string, RecommendationTypeStats>();

  activeSites.forEach((record) => {
    if (record.recommendations && Array.isArray(record.recommendations)) {
      record.recommendations.forEach((rec: any) => {
        const type = rec.type || "Unknown";
        const existing = typeMap.get(type) || {
          type,
          totalSavings: 0,
          totalCost: 0,
          totalCarbonSavings: 0,
          count: 0,
        };

        typeMap.set(type, {
          type,
          totalSavings: existing.totalSavings + (rec.potential_savings || 0),
          totalCost: existing.totalCost + (rec.upgrade_cost || 0),
          totalCarbonSavings: existing.totalCarbonSavings + (rec.potential_carbon_savings || 0),
          count: existing.count + 1,
        });
      });
    }
  });

  return Array.from(typeMap.values()).sort((a, b) => b.totalSavings - a.totalSavings);
};

export const getLast7DaysRecommendationStats = (records: SiteRecord[]): RecommendationTypeStats[] => {
  const now = new Date();
  const startDate = startOfDay(subDays(now, 6));
  const endDate = endOfDay(now);
  return getRecommendationTypeStatsForRange(records, startDate, endDate);
};

export const getCurrentMonthRecommendationStats = (records: SiteRecord[]): RecommendationTypeStats[] => {
  const now = new Date();
  const startDate = startOfMonth(now);
  const endDate = endOfDay(now);
  return getRecommendationTypeStatsForRange(records, startDate, endDate);
};

export const getPreviousMonthRecommendationStats = (records: SiteRecord[]): RecommendationTypeStats[] => {
  const now = new Date();
  const previousMonth = subMonths(now, 1);
  const startDate = startOfMonth(previousMonth);
  const endDate = endOfMonth(previousMonth);
  return getRecommendationTypeStatsForRange(records, startDate, endDate);
};

export const getTotalRecommendationStats = (records: SiteRecord[]): RecommendationTypeStats[] => {
  const activeSites = records.filter((record) => record.site_status === "ACTIVE");
  
  const typeMap = new Map<string, RecommendationTypeStats>();

  activeSites.forEach((record) => {
    if (record.recommendations && Array.isArray(record.recommendations)) {
      record.recommendations.forEach((rec: any) => {
        const type = rec.type || "Unknown";
        const existing = typeMap.get(type) || {
          type,
          totalSavings: 0,
          totalCost: 0,
          totalCarbonSavings: 0,
          count: 0,
        };

        typeMap.set(type, {
          type,
          totalSavings: existing.totalSavings + (rec.potential_savings || 0),
          totalCost: existing.totalCost + (rec.upgrade_cost || 0),
          totalCarbonSavings: existing.totalCarbonSavings + (rec.potential_carbon_savings || 0),
          count: existing.count + 1,
        });
      });
    }
  });

  return Array.from(typeMap.values()).sort((a, b) => b.totalSavings - a.totalSavings);
};
