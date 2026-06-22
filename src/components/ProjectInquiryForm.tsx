import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Send, CheckCircle2 } from "lucide-react";
import { z } from "zod";
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

const inquirySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Il nome deve avere almeno 2 caratteri")
    .max(100, "Il nome non può superare 100 caratteri"),
  email: z
    .string()
    .trim()
    .email("Email non valida")
    .max(255, "Email troppo lunga"),
  phone: z
    .string()
    .trim()
    .max(30, "Numero troppo lungo")
    .optional()
    .or(z.literal("")),
  message: z
    .string()
    .trim()
    .min(10, "Il messaggio deve avere almeno 10 caratteri")
    .max(1500, "Il messaggio non può superare 1500 caratteri"),
});

type FieldErrors = Partial<Record<"name" | "email" | "phone" | "message", string>>;

const ProjectInquiryForm = ({ projectId, projectTitle }: Props) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState(
    `Sono interessato/a al progetto "${projectTitle}". Vorrei ricevere maggiori informazioni.`
  );
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const parsed = inquirySchema.safeParse({ name, email, phone, message });
    if (!parsed.success) {
      const fe: FieldErrors = {};
      parsed.error.issues.forEach((iss) => {
        const k = iss.path[0] as keyof FieldErrors;
        if (k && !fe[k]) fe[k] = iss.message;
      });
      setErrors(fe);
      toast.error("Controlla i campi evidenziati");
      return;
    }

    // Phone format check (only digits, +, spaces, parentheses, dashes)
    if (parsed.data.phone && !/^[+\d\s()\-]+$/.test(parsed.data.phone)) {
      setErrors({ phone: "Formato telefono non valido" });
      toast.error("Formato telefono non valido");
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.from("project_inquiries" as any).insert({
      project_id: projectId,
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone || null,
      message: parsed.data.message,
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
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div>
        <Label htmlFor="inq-name" className="font-sans text-xs uppercase tracking-wider">
          Nome e cognome *
        </Label>
        <Input
          id="inq-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={100}
          required
          className="mt-1.5"
          aria-invalid={!!errors.name}
        />
        {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
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
            maxLength={255}
            required
            className="mt-1.5"
            aria-invalid={!!errors.email}
          />
          {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
        </div>
        <div>
          <Label className="font-sans text-xs uppercase tracking-wider">Telefono</Label>
          <div className="mt-1.5">
            <PhonePrefixInput value={phone} onChange={setPhone} variant="compact" />
          </div>
          {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone}</p>}
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
          maxLength={1500}
          required
          className="mt-1.5"
          aria-invalid={!!errors.message}
        />
        <div className="flex justify-between mt-1">
          {errors.message ? (
            <p className="text-xs text-destructive">{errors.message}</p>
          ) : <span />}
          <p className="text-xs text-muted-foreground">{message.length}/1500</p>
        </div>
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
