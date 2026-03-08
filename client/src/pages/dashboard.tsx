import { useDashboardStats } from "@/hooks/use-dashboard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, CalendarCheck, Home, ArrowUpRight, TrendingUp, AlertCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { StatusBadge } from "@/components/status-badge";
import { motion } from "framer-motion";

export default function Dashboard() {
  const { data: stats, isLoading, error } = useDashboardStats();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-[400px] w-full rounded-2xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-destructive/10 text-destructive rounded-xl border border-destructive/20 flex items-center gap-3">
        <AlertCircle className="h-5 w-5" />
        Failed to load dashboard statistics.
      </div>
    );
  }

  if (!stats) return null;

  const chartData = Object.entries(stats.leadsByStage).map(([name, value]) => ({
    name,
    total: value,
  }));

  const statCards = [
    {
      title: "Total Leads",
      value: stats.totalLeads,
      icon: Users,
      trend: "+12% this month",
      color: "text-blue-600",
      bg: "bg-blue-50 dark:bg-blue-500/10"
    },
    {
      title: "Visits Scheduled",
      value: stats.visitsScheduled,
      icon: CalendarCheck,
      trend: "Next 7 days",
      color: "text-purple-600",
      bg: "bg-purple-50 dark:bg-purple-500/10"
    },
    {
      title: "Confirmed Bookings",
      value: stats.bookingsConfirmed,
      icon: Home,
      trend: "+4% this month",
      color: "text-emerald-600",
      bg: "bg-emerald-50 dark:bg-emerald-500/10"
    },
    {
      title: "Needs Follow Up",
      value: stats.needsFollowUp.length,
      icon: AlertCircle,
      trend: "Action required",
      color: "text-rose-600",
      bg: "bg-rose-50 dark:bg-rose-500/10"
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1 text-sm">Welcome back! Here's what's happening with your leads today.</p>
        </div>
        <Button asChild className="gap-2 rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
          <Link href="/new-lead">
            <PlusCircle className="h-4 w-4" />
            Add New Lead
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, idx) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            key={stat.title}
          >
            <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <p className="text-3xl font-display font-bold text-foreground tracking-tight">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform duration-300`}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-xs font-medium text-muted-foreground gap-1">
                  <TrendingUp className="h-3 w-3" />
                  {stat.trend}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 delay-200 animate-fade-in-up">
        <Card className="lg:col-span-2 border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle>Pipeline Overview</CardTitle>
            <CardDescription>Number of leads in each stage of the funnel.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 0, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <Tooltip 
                    cursor={{ fill: 'hsl(var(--muted)/0.4)' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  />
                  <Bar 
                    dataKey="total" 
                    fill="hsl(var(--primary))" 
                    radius={[6, 6, 0, 0]}
                    maxBarSize={50}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm flex flex-col">
          <CardHeader className="pb-3 border-b border-border/40">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-rose-500" />
                Needs Follow Up
              </CardTitle>
            </div>
            <CardDescription>Leads requiring immediate attention</CardDescription>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-auto">
            {stats.needsFollowUp.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground flex flex-col items-center justify-center h-full">
                <CalendarCheck className="h-10 w-10 text-muted mb-3" />
                <p>All caught up!</p>
              </div>
            ) : (
              <div className="divide-y divide-border/40">
                {stats.needsFollowUp.slice(0, 5).map(lead => (
                  <div key={lead.id} className="p-4 hover:bg-muted/30 transition-colors flex items-center justify-between group">
                    <div className="space-y-1">
                      <p className="font-medium text-sm text-foreground">{lead.name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{formatDistanceToNow(new Date(lead.lastUpdatedAt || lead.createdAt!), { addSuffix: true })}</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" asChild className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link href={`/leads/${lead.id}`}>
                        <ArrowUpRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          {stats.needsFollowUp.length > 5 && (
            <div className="p-3 border-t border-border/40 text-center">
              <Button variant="link" className="text-xs text-muted-foreground w-full" asChild>
                <Link href="/leads">View all {stats.needsFollowUp.length} leads</Link>
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function PlusCircle(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M8 12h8" />
      <path d="M12 8v8" />
    </svg>
  );
}
