export const FOOD_CATEGORIES = [
  'Cooked food',
  'Packaged food',
  'Bakery',
  'Fruits',
  'Vegetables',
  'Groceries',
  'Other',
];

export const QUANTITY_UNITS = ['kg', 'lbs', 'servings', 'packets', 'boxes', 'liters', 'units'];

export const STORAGE_CONDITIONS = [
  'Room Temperature',
  'Refrigerated',
  'Frozen',
  'Hot Holding',
  'Dry Storage',
];

export const ALLERGEN_OPTIONS = [
  'Peanuts',
  'Tree Nuts',
  'Dairy / Milk',
  'Eggs',
  'Gluten / Wheat',
  'Soy',
  'Fish',
  'Shellfish',
  'Sesame',
  'None / Allergen Free',
];

export const DONATION_STATUS_COLORS = {
  AVAILABLE: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    dot: 'bg-emerald-500',
    label: 'Available',
  },
  CLAIMED: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    dot: 'bg-blue-500',
    label: 'Claimed by NGO',
  },
  ASSIGNED: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    dot: 'bg-amber-500',
    label: 'Courier Assigned',
  },
  PICKED_UP: {
    bg: 'bg-indigo-50',
    text: 'text-indigo-700',
    border: 'border-indigo-200',
    dot: 'bg-indigo-500',
    label: 'In Transit / Picked Up',
  },
  DELIVERED: {
    bg: 'bg-teal-50',
    text: 'text-teal-700',
    border: 'border-teal-200',
    dot: 'bg-teal-500',
    label: 'Delivered',
  },
  CANCELLED: {
    bg: 'bg-slate-100',
    text: 'text-slate-600',
    border: 'border-slate-300',
    dot: 'bg-slate-400',
    label: 'Cancelled',
  },
  EXPIRED: {
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
    dot: 'bg-rose-500',
    label: 'Expired',
  },
};
