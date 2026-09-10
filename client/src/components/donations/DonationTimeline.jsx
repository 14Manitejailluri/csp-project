import React from 'react';
import { CheckCircle2, Circle, Clock, Truck, Package, MapPin } from 'lucide-react';
import { formatDate } from '../../utils/formatters';

const steps = [
  { status: 'AVAILABLE', label: 'Donation Listed', icon: Package, color: 'emerald' },
  { status: 'CLAIMED', label: 'Claimed by NGO', icon: CheckCircle2, color: 'blue' },
  { status: 'ASSIGNED', label: 'Volunteer Assigned', icon: Clock, color: 'amber' },
  { status: 'PICKED_UP', label: 'Picked Up', icon: Truck, color: 'indigo' },
  { status: 'DELIVERED', label: 'Delivered', icon: MapPin, color: 'teal' },
];

const statusOrder = ['AVAILABLE', 'CLAIMED', 'ASSIGNED', 'PICKED_UP', 'DELIVERED'];

const colorMap = {
  emerald: 'bg-emerald-500 border-emerald-500 text-white',
  blue: 'bg-blue-500 border-blue-500 text-white',
  amber: 'bg-amber-500 border-amber-500 text-white',
  indigo: 'bg-indigo-500 border-indigo-500 text-white',
  teal: 'bg-teal-500 border-teal-500 text-white',
};

const DonationTimeline = ({ donation }) => {
  const currentIndex = statusOrder.indexOf(donation?.status);
  const isCancelled = ['CANCELLED', 'EXPIRED'].includes(donation?.status);

  if (isCancelled) {
    return (
      <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-100 border border-slate-200">
        <Circle className="h-4 w-4 text-slate-400" />
        <span className="text-sm text-slate-600 font-medium">
          This donation was {donation.status.toLowerCase()}.
        </span>
      </div>
    );
  }

  return (
    <ol className="relative space-y-4">
      {steps.map((step, i) => {
        const isDone = i < currentIndex;
        const isCurrent = i === currentIndex;
        const isPending = i > currentIndex;
        const Icon = step.icon;

        return (
          <li key={step.status} className="flex items-start gap-4">
            <div className="flex flex-col items-center">
              <div
                className={`w-9 h-9 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  isDone
                    ? colorMap[step.color]
                    : isCurrent
                    ? `bg-white border-${step.color}-500 text-${step.color}-500 shadow-md`
                    : 'bg-white border-slate-200 text-slate-300'
                }`}
              >
                <Icon className="h-4 w-4" />
              </div>
              {i < steps.length - 1 && (
                <div className={`w-0.5 h-6 mt-1 ${i < currentIndex ? 'bg-emerald-400' : 'bg-slate-100'}`} />
              )}
            </div>
            <div className="pt-1.5 pb-4">
              <p className={`text-sm font-medium ${isPending ? 'text-slate-400' : 'text-slate-700'}`}>
                {step.label}
              </p>
              {isCurrent && (
                <span className="inline-block mt-0.5 text-xs text-emerald-600 font-medium">Current stage</span>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
};

export default DonationTimeline;
