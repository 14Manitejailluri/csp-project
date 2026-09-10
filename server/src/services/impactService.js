/**
 * Standard Food Impact Conversion Factors
 * - Average 1 meal = 0.42 kg (420 grams) of food
 * - 1 kg food waste prevented = 2.5 kg CO2 equivalent greenhouse emissions prevented
 * - 1 kg food waste diverted = 1,000 liters of water saved in agricultural footprint
 */

export const normalizeQuantityToKg = (quantity, unit) => {
  const q = parseFloat(quantity) || 0;
  switch ((unit || '').toLowerCase()) {
    case 'kg':
      return q;
    case 'lbs':
      return q * 0.453592;
    case 'servings':
      return q * 0.42;
    case 'packets':
    case 'units':
      return q * 0.5;
    case 'boxes':
      return q * 5.0;
    case 'liters':
      return q * 1.0;
    default:
      return q;
  }
};

export const calculateImpactStats = (donations = []) => {
  let totalKg = 0;
  let completedCount = 0;
  let activeCount = 0;
  let expiredCount = 0;
  let cancelledCount = 0;

  for (const item of donations) {
    if (item.status === 'DELIVERED') {
      completedCount++;
      totalKg += normalizeQuantityToKg(item.quantity, item.quantityUnit);
    } else if (['AVAILABLE', 'CLAIMED', 'ASSIGNED', 'PICKED_UP'].includes(item.status)) {
      activeCount++;
    } else if (item.status === 'EXPIRED') {
      expiredCount++;
    } else if (item.status === 'CANCELLED') {
      cancelledCount++;
    }
  }

  const roundedKg = Math.round(totalKg * 10) / 10;
  const mealsRescued = Math.round(totalKg / 0.42);
  const co2OffsetKg = Math.round(totalKg * 2.5 * 10) / 10;
  const waterSavedLiters = Math.round(totalKg * 1000);

  return {
    totalDonations: donations.length,
    activeDonations: activeCount,
    completedDonations: completedCount,
    expiredDonations: expiredCount,
    cancelledDonations: cancelledCount,
    foodRescuedKg: roundedKg,
    mealsRescued,
    co2OffsetKg,
    waterSavedLiters,
  };
};
