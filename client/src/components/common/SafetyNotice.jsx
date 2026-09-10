import React from 'react';
import { ShieldCheck } from 'lucide-react';

const SafetyNotice = ({ className = '' }) => (
  <div className={`flex gap-3 rounded-xl bg-amber-50 border border-amber-200 p-4 ${className}`}>
    <ShieldCheck className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
    <div className="text-sm text-amber-800">
      <p className="font-semibold mb-1">Food Safety Reminder</p>
      <ul className="list-disc list-inside space-y-0.5 text-amber-700">
        <li>Only donate food that is safe for consumption</li>
        <li>Ensure proper packaging and labeling</li>
        <li>Accurately state storage conditions and allergens</li>
        <li>Collection must happen before the expiry time</li>
      </ul>
    </div>
  </div>
);

export default SafetyNotice;
