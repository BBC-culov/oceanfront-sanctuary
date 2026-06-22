import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Send, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import PhonePrefixInput from "@/components/PhonePrefixInput";
import { toast } from "sonner";

interface Props {
  projectId: string;
  projectTitle: string;
}

const ProjectInquiryForm = ({ projectId, projectTitle }: Props) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState(
    `Sono interessato/a al progetto "${projectTitle}". Vorrei ricevere maggiori informazioni.`
  );
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error("Compila tutti i campi obbligatori");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("project_inquiries" as any).insert({
      project_id: projectId,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || null,
      message: message.trim(),
    });
    setSubmitting(false);
    if (error) {
      toast.error("Errore nell'invio. Riprova o contattaci direttamente.");
      return;
    }
    setSubmitted(true);
    toast.success("Richiesta inviata. Ti contatteremo a breve.");
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="border border-border bg-secondary/40 p-8 text-center rounded-sm"
      >
        <CheckCircle2 className="w-12 h-12 mx-auto text-primary mb-4" />
        <h3 className="font-serif text-2xl mb-2">Richiesta ricevuta</h3>
        <p className="font-sans text-sm text-muted-foreground">
          Grazie {name}. Il nostro team ti contatterà al più presto.
        </p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="inq-name" className="font-sans text-xs uppercase tracking-wider">
          Nome e cognome *
        </Label>
        <Input
          id="inq-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="mt-1.5"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="inq-email" className="font-sans text-xs uppercase tracking-wider">
            Email *
          </Label>
          <Input
            id="inq-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1.5"
          />
        </div>
        <div>
          <Label className="font-sans text-xs uppercase tracking-wider">Telefono</Label>
          <div className="mt-1.5">
            <PhonePrefixInput value={phone} onChange={setPhone} variant="compact" />
          </div>
        </div>
      </div>
      <div>
        <Label htmlFor="inq-msg" className="font-sans text-xs uppercase tracking-wider">
          Messaggio *
        </Label>
        <Textarea
          id="inq-msg"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={5}
          required
          className="mt-1.5"
        />
      </div>
      <Button type="submit" disabled={submitting} className="w-full">
        {submitting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Invio…
          </>
        ) : (
          <>
            <Send className="w-4 h-4 mr-2" /> Invia richiesta
          </>
        )}
      </Button>
    </form>
  );
};

export default ProjectInquiryForm;
