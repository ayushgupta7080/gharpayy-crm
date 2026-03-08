import { Badge } from "@/components/ui/badge";

type LeadStatus = 'New Lead' | 'Contacted' | 'Requirement Collected' | 'Property Suggested' | 'Visit Scheduled' | 'Visit Completed' | 'Booked' | 'Lost';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const getVariants = (s: string) => {
    switch (s) {
      case 'New Lead':
        return "bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200";
      case 'Contacted':
        return "bg-purple-100 text-purple-800 hover:bg-purple-200 border-purple-200";
      case 'Requirement Collected':
      case 'Property Suggested':
        return "bg-indigo-100 text-indigo-800 hover:bg-indigo-200 border-indigo-200";
      case 'Visit Scheduled':
      case 'Visit Completed':
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-200";
      case 'Booked':
        return "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-emerald-200";
      case 'Lost':
        return "bg-rose-100 text-rose-800 hover:bg-rose-200 border-rose-200";
      default:
        return "bg-slate-100 text-slate-800 hover:bg-slate-200 border-slate-200";
    }
  };

  return (
    <Badge variant="outline" className={`${getVariants(status)} font-medium shadow-sm transition-colors ${className || ''}`}>
      {status}
    </Badge>
  );
}

export function VisitStatusBadge({ status }: { status: string }) {
  const getVariants = (s: string) => {
    switch (s) {
      case 'Scheduled':
        return "bg-blue-100 text-blue-800 hover:bg-blue-200";
      case 'Completed':
        return "bg-emerald-100 text-emerald-800 hover:bg-emerald-200";
      case 'Rescheduled':
        return "bg-orange-100 text-orange-800 hover:bg-orange-200";
      case 'Cancelled':
        return "bg-rose-100 text-rose-800 hover:bg-rose-200";
      case 'Booked':
        return "bg-indigo-100 text-indigo-800 hover:bg-indigo-200";
      default:
        return "bg-slate-100 text-slate-800 hover:bg-slate-200";
    }
  };

  return (
    <Badge variant="secondary" className={`${getVariants(status)} border-transparent`}>
      {status}
    </Badge>
  );
}
