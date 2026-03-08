import { useState } from "react";
import { useLeads } from "@/hooks/use-leads";
import { Link } from "wouter";
import { format } from "date-fns";
import { StatusBadge } from "@/components/status-badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Search, UserPlus, Filter, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function LeadsList() {
  const { data: leads, isLoading } = useLeads();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const statuses = [
    'New Lead', 'Contacted', 'Requirement Collected', 
    'Property Suggested', 'Visit Scheduled', 'Visit Completed', 
    'Booked', 'Lost'
  ];

  const filteredLeads = leads?.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(search.toLowerCase()) || 
                          lead.phone.includes(search);
    const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Leads Management</h1>
          <p className="text-muted-foreground mt-1">View and manage all your property inquiries.</p>
        </div>
        <Button asChild className="rounded-xl shadow-lg shadow-primary/20">
          <Link href="/new-lead">
            <UserPlus className="h-4 w-4 mr-2" />
            Add Lead
          </Link>
        </Button>
      </div>

      <Card className="p-4 border-border/50 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by name or phone..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 w-full bg-secondary/30 border-transparent focus-visible:border-primary rounded-xl"
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Filter className="h-4 w-4 text-muted-foreground shrink-0 hidden md:block" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[200px] rounded-xl bg-secondary/30 border-transparent">
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">All Statuses</SelectItem>
              {statuses.map(status => (
                <SelectItem key={status} value={status}>{status}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      <div className="rounded-2xl border border-border/50 bg-card overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        ) : filteredLeads?.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground flex flex-col items-center">
            <Search className="h-12 w-12 text-muted mb-4" />
            <h3 className="text-lg font-medium text-foreground">No leads found</h3>
            <p className="mt-1 text-sm">Try adjusting your filters or create a new lead.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-secondary/30">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-semibold py-4">Name</TableHead>
                  <TableHead className="font-semibold">Phone</TableHead>
                  <TableHead className="font-semibold">Source</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Assigned To</TableHead>
                  <TableHead className="font-semibold">Created</TableHead>
                  <TableHead className="text-right font-semibold">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeads?.map((lead) => (
                  <TableRow key={lead.id} className="group transition-colors">
                    <TableCell className="font-medium text-foreground py-4">
                      {lead.name}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{lead.phone}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{lead.source}</TableCell>
                    <TableCell>
                      <StatusBadge status={lead.status} />
                    </TableCell>
                    <TableCell>
                      {lead.agent ? (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                            {lead.agent.name.charAt(0)}
                          </div>
                          <span className="text-sm text-foreground">{lead.agent.name}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground italic">Unassigned</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {lead.createdAt ? format(new Date(lead.createdAt), "MMM d, yyyy") : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" asChild className="rounded-lg hover:bg-primary/10 hover:text-primary">
                        <Link href={`/leads/${lead.id}`}>
                          View <ChevronRight className="h-4 w-4 ml-1" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
