import { SiteRecord } from "./chartHelpers";
import { startOfMonth, endOfMonth, subMonths, subDays, startOfDay, endOfDay } from "date-fns";

export interface OrganisationStats {
  totalSites: number;
  uniqueCustomers: number;
  totalInteractions: number;
  totalSavings: number;
  totalCarbonSavings: number;
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
