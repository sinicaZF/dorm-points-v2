import type { FormData, PointBreakdown } from './types';

export function calculatePoints(data: FormData): PointBreakdown {
  const serviceYearsPoints = Math.floor(
    data.serviceYears.years * 2 + Math.floor(data.serviceYears.months / 6)
  );

  const jobLevelPoints = Math.floor(data.baseSalary / 1000);

  const dependentsPoints = data.familyMembers.filter(
    (m) => m.name.trim() !== ''
  ).length * 4;

  const totalA = serviceYearsPoints + jobLevelPoints + dependentsPoints;

  let propertyDeduction = 0;
  if (data.hasSelfOwnedProperty && data.selfOwnedProperties.length > 0) {
    propertyDeduction = totalA * 0.5;
  }

  let borrowDeduction = 0;
  if (data.previousBorrowCount >= 2) {
    borrowDeduction = data.hasSelfOwnedProperty
      ? propertyDeduction * (2 / 3)
      : totalA * (2 / 3);
  } else if (data.previousBorrowCount === 1) {
    borrowDeduction = data.hasSelfOwnedProperty
      ? propertyDeduction * 0.5
      : totalA * 0.5;
  }

  const totalB = propertyDeduction + borrowDeduction;
  const totalC = Math.max(0, totalA - totalB);

  return {
    serviceYears: serviceYearsPoints,
    jobLevel: jobLevelPoints,
    dependents: dependentsPoints,
    totalA,
    propertyDeduction,
    borrowDeduction,
    totalB,
    totalC,
  };
}

export function roundToTwo(num: number): number {
  return Math.round(num * 100) / 100;
}
