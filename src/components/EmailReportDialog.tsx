import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Plus, X, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const EmailReportDialog = () => {
  const [open, setOpen] = useState(false);
  const [emails, setEmails] = useState<string[]>([""]);
  const [sending, setSending] = useState(false);

  const addEmailField = () => {
    setEmails([...emails, ""]);
  };

  const removeEmailField = (index: number) => {
    if (emails.length > 1) {
      setEmails(emails.filter((_, i) => i !== index));
    }
  };

  const updateEmail = (index: number, value: string) => {
    const newEmails = [...emails];
    newEmails[index] = value;
    setEmails(newEmails);
  };

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSendReport = async () => {
    // Validate emails
    const validEmails = emails.filter(email => email.trim() && validateEmail(email.trim()));
    
    if (validEmails.length === 0) {
      toast.error("Please enter at least one valid email address");
      return;
    }

    setSending(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('send-daily-report', {
        body: { recipients: validEmails }
      });

      if (error) throw error;

      toast.success(`Report sent successfully to ${validEmails.length} recipient(s)`);
      setOpen(false);
      setEmails([""]);
    } catch (error: any) {
      console.error('Error sending report:', error);
      toast.error(`Failed to send report: ${error.message}`);
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Mail className="h-4 w-4" />
          Send Email Report
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Send Carbon Data Report</DialogTitle>
          <DialogDescription>
            Enter email addresses to receive the daily carbon data report with PDF charts and Excel statistics.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {emails.map((email, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="flex-1">
                <Label htmlFor={`email-${index}`} className="sr-only">
                  Email {index + 1}
                </Label>
                <Input
                  id={`email-${index}`}
                  type="email"
                  placeholder="recipient@example.com"
                  value={email}
                  onChange={(e) => updateEmail(index, e.target.value)}
                  className="w-full"
                />
              </div>
              {emails.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeEmailField(index)}
                  className="shrink-0"
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Remove email</span>
                </Button>
              )}
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addEmailField}
            className="w-full gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Another Email
          </Button>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setOpen(false);
              setEmails([""]);
            }}
            disabled={sending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSendReport}
            disabled={sending}
            className="gap-2"
          >
            {sending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Mail className="h-4 w-4" />
                Send Report
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
