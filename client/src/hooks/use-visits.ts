import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type VisitInput } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useVisits(leadId: number) {
  return useQuery({
    queryKey: [api.visits.listByLead.path, leadId],
    queryFn: async () => {
      const url = buildUrl(api.visits.listByLead.path, { leadId });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch visits");
      const data = await res.json();
      return api.visits.listByLead.responses[200].parse(data);
    },
    enabled: !!leadId,
  });
}

export function useCreateVisit() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: VisitInput) => {
      const res = await fetch(api.visits.create.path, {
        method: api.visits.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create visit");
      return api.visits.create.responses[201].parse(await res.json());
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [api.visits.listByLead.path, data.leadId] });
      queryClient.invalidateQueries({ queryKey: [api.dashboard.stats.path] });
      queryClient.invalidateQueries({ queryKey: [api.activities.listByLead.path, data.leadId] });
      toast({ title: "Visit Scheduled", description: "The property visit has been scheduled." });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });
}

export function useUpdateVisit() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, leadId, ...updates }: { id: number, leadId: number } & Partial<VisitInput>) => {
      const url = buildUrl(api.visits.update.path, { id });
      const res = await fetch(url, {
        method: api.visits.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update visit");
      return api.visits.update.responses[200].parse(await res.json());
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.visits.listByLead.path, variables.leadId] });
      queryClient.invalidateQueries({ queryKey: [api.dashboard.stats.path] });
      queryClient.invalidateQueries({ queryKey: [api.activities.listByLead.path, variables.leadId] });
      toast({ title: "Visit Updated", description: "The visit details have been updated." });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });
}
