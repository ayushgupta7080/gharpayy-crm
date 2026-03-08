import { useParams } from "wouter";
import { useLead, useUpdateLead } from "@/hooks/use-leads";
import { useAgents } from "@/hooks/use-agents";
import { useVisits, useCreateVisit, useUpdateVisit } from "@/hooks/use-visits";
import { useActivities } from "@/hooks/use-activities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge, VisitStatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { format } from "date-fns";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Phone, ArrowLeft, Building2, MapPin, Calendar, CheckCircle2, History, Plus } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";

const visitFormSchema = z.object({
  propertyName: z.string().min(1, "Property name is required"),
  visitDate: z.string().min(1, "Date and time is required"),
  outcome: z.string().default("Scheduled"),
});

export default function LeadDetails() {
  const { id } = useParams<{ id: string }>();
  const leadId = parseInt(id, 10);

  const { data: lead, isLoading: isLoadingLead } = useLead(leadId);
  const { data: agents } = useAgents();
  const { data: visits } = useVisits(leadId);
  const { data: activities } = useActivities(leadId);

  const updateLead = useUpdateLead();
  const createVisit = useCreateVisit();
  const updateVisit = useUpdateVisit();

  const [visitDialogOpen, setVisitDialogOpen] = useState(false);

  const visitForm = useForm<z.infer<typeof visitFormSchema>>({
    resolver: zodResolver(visitFormSchema),
    defaultValues: {
      propertyName: "",
      visitDate: "",
      outcome: "Scheduled",
    }
  });

  if (isLoadingLead) {
    return <div className="space-y-6"><Skeleton className="h-40 w-full rounded-2xl" /><div className="grid grid-cols-3 gap-6"><Skeleton className="col-span-1 h-[400px] rounded-2xl" /><Skeleton className="col-span-2 h-[400px] rounded-2xl" /></div></div>;
  }

  if (!lead) return <div>Lead not found</div>;

  const handleStatusChange = (newStatus: string) => {
    updateLead.mutate({ id: leadId, status: newStatus });
  };

  const handleAgentChange = (agentIdStr: string) => {
    updateLead.mutate({ id: leadId, agentId: parseInt(agentIdStr, 10) });
  };

  const onVisitSubmit = (values: z.infer<typeof visitFormSchema>) => {
    createVisit.mutate({
      leadId,
      propertyName: values.propertyName,
      visitDate: new Date(values.visitDate),
      outcome: values.outcome
    }, {
      onSuccess: () => {
        setVisitDialogOpen(false);
        visitForm.reset();
      }
    });
  };

  return (
    <div className="space-y-6 animate-fade-in-up max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <Button variant="ghost" asChild className="-ml-4 text-muted-foreground hover:text-foreground">
          <Link href="/leads">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Leads
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN: Lead Profile & Quick Actions */}
        <div className="space-y-6">
          <Card className="border-border/50 shadow-sm rounded-2xl overflow-hidden">
            <div className="h-24 bg-gradient-to-br from-primary/80 to-accent/80" />
            <CardContent className="pt-0 relative px-6 pb-6">
              <div className="h-20 w-20 rounded-2xl bg-card border-4 border-card flex items-center justify-center text-3xl font-display font-bold text-primary shadow-md -mt-10 mb-4">
                {lead.name.charAt(0)}
              </div>
              <h2 className="text-2xl font-display font-bold text-foreground tracking-tight">{lead.name}</h2>
              <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>{lead.phone}</span>
              </div>
              <div className="mt-4 pt-4 border-t border-border/40 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs mb-1">Source</p>
                  <p className="font-medium text-foreground">{lead.source}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs mb-1">Created</p>
                  <p className="font-medium text-foreground">{lead.createdAt ? format(new Date(lead.createdAt), "MMM d, yyyy") : '-'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm rounded-2xl">
            <CardHeader className="pb-3 border-b border-border/40">
              <CardTitle className="text-base font-semibold">Management Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 pt-5">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pipeline Stage</label>
                <Select value={lead.status} onValueChange={handleStatusChange} disabled={updateLead.isPending}>
                  <SelectTrigger className="w-full rounded-xl bg-secondary/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {['New Lead', 'Contacted', 'Requirement Collected', 'Property Suggested', 'Visit Scheduled', 'Visit Completed', 'Booked', 'Lost'].map(s => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Assigned Agent</label>
                <Select value={lead.agentId?.toString() || ""} onValueChange={handleAgentChange} disabled={updateLead.isPending}>
                  <SelectTrigger className="w-full rounded-xl bg-secondary/20">
                    <SelectValue placeholder="Unassigned" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {agents?.map(agent => (
                      <SelectItem key={agent.id} value={agent.id.toString()}>{agent.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN: Tabs (Visits, Timeline) */}
        <div className="col-span-1 lg:col-span-2">
          <Tabs defaultValue="visits" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-secondary/30 rounded-xl p-1 mb-6">
              <TabsTrigger value="visits" className="rounded-lg data-[state=active]:shadow-sm">
                <MapPin className="h-4 w-4 mr-2" /> Visits
              </TabsTrigger>
              <TabsTrigger value="timeline" className="rounded-lg data-[state=active]:shadow-sm">
                <History className="h-4 w-4 mr-2" /> Activity Timeline
              </TabsTrigger>
            </TabsList>

            <TabsContent value="visits" className="space-y-4 outline-none">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold tracking-tight">Property Visits</h3>
                <Dialog open={visitDialogOpen} onOpenChange={setVisitDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="rounded-xl gap-2 shadow-md shadow-primary/10">
                      <Plus className="h-4 w-4" /> Schedule Visit
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="rounded-2xl sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Schedule a Property Visit</DialogTitle>
                    </DialogHeader>
                    <Form {...visitForm}>
                      <form onSubmit={visitForm.handleSubmit(onVisitSubmit)} className="space-y-4 mt-4">
                        <FormField
                          control={visitForm.control}
                          name="propertyName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Property Name / Address</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g. Sunrise Apartments #402" className="rounded-xl" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={visitForm.control}
                          name="visitDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Date & Time</FormLabel>
                              <FormControl>
                                <Input type="datetime-local" className="rounded-xl" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <DialogFooter className="mt-6">
                          <Button type="submit" disabled={createVisit.isPending} className="rounded-xl w-full">
                            {createVisit.isPending ? "Scheduling..." : "Schedule Visit"}
                          </Button>
                        </DialogFooter>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>

              {(!visits || visits.length === 0) ? (
                <Card className="border-dashed border-border/60 bg-transparent shadow-none">
                  <CardContent className="p-12 text-center text-muted-foreground flex flex-col items-center">
                    <Building2 className="h-10 w-10 text-muted mb-3" />
                    <p>No visits scheduled yet.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {visits.map(visit => (
                    <Card key={visit.id} className="border-border/50 shadow-sm overflow-hidden group">
                      <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                        <div className="flex gap-4">
                          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <Building2 className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-foreground">{visit.propertyName}</h4>
                            <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {format(new Date(visit.visitDate), "PPP p")}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                          <Select 
                            value={visit.outcome} 
                            onValueChange={(val) => updateVisit.mutate({ id: visit.id, leadId, outcome: val })}
                          >
                            <SelectTrigger className="h-8 text-xs font-medium w-[130px] rounded-lg">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Scheduled">Scheduled</SelectItem>
                              <SelectItem value="Completed">Completed</SelectItem>
                              <SelectItem value="Rescheduled">Rescheduled</SelectItem>
                              <SelectItem value="Cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                          <VisitStatusBadge status={visit.outcome} />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="timeline" className="outline-none">
              <Card className="border-border/50 shadow-sm rounded-2xl">
                <CardContent className="p-6">
                  {(!activities || activities.length === 0) ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No activity recorded yet.
                    </div>
                  ) : (
                    <div className="relative border-l-2 border-muted ml-3 space-y-8 pb-4">
                      {activities.map((act, i) => (
                        <div key={act.id} className="relative pl-6">
                          <span className="absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 border-card bg-primary ring-2 ring-primary/20" />
                          <div className="flex flex-col gap-1">
                            <p className="text-sm font-medium text-foreground">{act.action}</p>
                            <p className="text-xs text-muted-foreground">
                              {act.createdAt ? format(new Date(act.createdAt), "MMM d, yyyy 'at' h:mm a") : ''}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
