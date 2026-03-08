import { useQuery } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";

export function useActivities(leadId: number) {
  return useQuery({
    queryKey: [api.activities.listByLead.path, leadId],
    queryFn: async () => {
      const url = buildUrl(api.activities.listByLead.path, { leadId });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch activities");
      const data = await res.json();
      return api.activities.listByLead.responses[200].parse(data);
    },
    enabled: !!leadId,
  });
}
