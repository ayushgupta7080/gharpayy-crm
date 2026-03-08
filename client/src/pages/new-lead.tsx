import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { useCreateLead } from "@/hooks/use-leads";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { ArrowLeft, UserPlus } from "lucide-react";
import { Link } from "wouter";

// Locally defined schema to match insertLeadSchema requirements
const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().min(10, "Valid phone number required"),
  source: z.string().min(1, "Source is required"),
  status: z.string().default("New Lead"),
});

export default function NewLead() {
  const [, navigate] = useLocation();
  const createLead = useCreateLead();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      phone: "",
      source: "Form",
      status: "New Lead",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    createLead.mutate(values, {
      onSuccess: () => {
        navigate("/leads");
      }
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in-up">
      <Button variant="ghost" asChild className="mb-2 -ml-4 text-muted-foreground hover:text-foreground">
        <Link href="/leads">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Leads
        </Link>
      </Button>

      <div className="mb-6">
        <h1 className="text-3xl font-display font-bold text-foreground">Add New Lead</h1>
        <p className="text-muted-foreground mt-1">Manually capture a new property inquiry into the CRM.</p>
      </div>

      <Card className="border-border/50 shadow-xl shadow-black/5 overflow-hidden rounded-2xl">
        <div className="bg-primary/5 p-1 border-b border-border/50" />
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            Lead Information
          </CardTitle>
          <CardDescription>Enter the prospect's contact details and source.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Jane Doe" className="rounded-xl px-4 py-6 bg-secondary/20" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground">Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="+91 98765 43210" className="rounded-xl px-4 py-6 bg-secondary/20" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="source"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground">Lead Source</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="rounded-xl px-4 py-6 bg-secondary/20">
                            <SelectValue placeholder="Select a source" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="rounded-xl">
                          <SelectItem value="Website">Website</SelectItem>
                          <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                          <SelectItem value="Social Media">Social Media</SelectItem>
                          <SelectItem value="Phone">Phone call</SelectItem>
                          <SelectItem value="Form">Manual Form</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <Button type="button" variant="outline" className="rounded-xl" onClick={() => navigate("/leads")}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createLead.isPending}
                  className="rounded-xl px-8 shadow-lg shadow-primary/25 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
                >
                  {createLead.isPending ? "Saving..." : "Create Lead"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
