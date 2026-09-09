import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Loader2, Lock, Mail, Sparkles, User } from "lucide-react";
import PhonePrefixInput from "@/components/PhonePrefixInput";
import type { RegisterFormValues } from "@/lib/authValidation";
import {
  FieldError,
  INPUT_CLASS,
  INPUT_CLASS_WITH_TOGGLE,
  inputVariants,
  tabContentVariants,
} from "./authMotion";

interface RegisterFormProps {
  form: RegisterFormValues;
  setForm: React.Dispatch<React.SetStateAction<RegisterFormValues>>;
  errors: Record<string, string>;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

const RegisterForm = ({ form, setForm, errors, loading, onSubmit }: RegisterFormProps) => {
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <motion.form
      key="register"
      variants={tabContentVariants}
      initial="enter"
      animate="center"
      exit="exit"
      className="space-y-4"
      onSubmit={onSubmit}
    >
      {/* First + last name */}
      <div className="grid grid-cols-2 gap-3">
        <motion.div custom={0} variants={inputVariants} initial="hidden" animate="visible">
          <label className="block text-xs font-sans uppercase tracking-widest text-muted-foreground mb-1.5">
            Nome
          </label>
          <div className={`relative transition-all duration-300 ${focusedField === "reg-firstName" ? "scale-[1.02]" : ""}`}>
            <User className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-300 ${focusedField === "reg-firstName" ? "text-primary" : "text-muted-foreground"}`} />
            <input
              type="text"
              value={form.firstName}
              onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
              placeholder="Mario"
              onFocus={() => setFocusedField("reg-firstName")}
              onBlur={() => setFocusedField(null)}
              className={INPUT_CLASS}
            />
          </div>
          <FieldError errors={errors} field="firstName" />
        </motion.div>

        <motion.div custom={0} variants={inputVariants} initial="hidden" animate="visible">
          <label className="block text-xs font-sans uppercase tracking-widest text-muted-foreground mb-1.5">
            Cognome
          </label>
          <div className={`relative transition-all duration-300 ${focusedField === "reg-lastName" ? "scale-[1.02]" : ""}`}>
            <User className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-300 ${focusedField === "reg-lastName" ? "text-primary" : "text-muted-foreground"}`} />
            <input
              type="text"
              value={form.lastName}
              onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
              placeholder="Rossi"
              onFocus={() => setFocusedField("reg-lastName")}
              onBlur={() => setFocusedField(null)}
              className={INPUT_CLASS}
            />
          </div>
          <FieldError errors={errors} field="lastName" />
        </motion.div>
      </div>

      {/* Email */}
      <motion.div custom={1} variants={inputVariants} initial="hidden" animate="visible">
        <label className="block text-xs font-sans uppercase tracking-widest text-muted-foreground mb-1.5">
          Email
        </label>
        <div className={`relative transition-all duration-300 ${focusedField === "reg-email" ? "scale-[1.02]" : ""}`}>
          <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-300 ${focusedField === "reg-email" ? "text-primary" : "text-muted-foreground"}`} />
          <input
            type="email"
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            placeholder="tuaemail@esempio.com"
            onFocus={() => setFocusedField("reg-email")}
            onBlur={() => setFocusedField(null)}
            className={INPUT_CLASS}
          />
        </div>
        <FieldError errors={errors} field="email" />
      </motion.div>

      {/* Phone */}
      <motion.div custom={2} variants={inputVariants} initial="hidden" animate="visible">
        <label className="block text-xs font-sans uppercase tracking-widest text-muted-foreground mb-1.5">
          Telefono
        </label>
        <div className={`transition-all duration-300 ${focusedField === "reg-phone" ? "scale-[1.02]" : ""}`}>
          <PhonePrefixInput
            value={form.phone}
            onChange={(v) => setForm(f => ({ ...f, phone: v }))}
            onFocus={() => setFocusedField("reg-phone")}
            onBlur={() => setFocusedField(null)}
            focused={focusedField === "reg-phone"}
          />
        </div>
        <FieldError errors={errors} field="phone" />
      </motion.div>

      {/* Password */}
      <motion.div custom={3} variants={inputVariants} initial="hidden" animate="visible">
        <label className="block text-xs font-sans uppercase tracking-widest text-muted-foreground mb-1.5">
          Password
        </label>
        <div className={`relative transition-all duration-300 ${focusedField === "reg-pass" ? "scale-[1.02]" : ""}`}>
          <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-300 ${focusedField === "reg-pass" ? "text-primary" : "text-muted-foreground"}`} />
          <input
            type={showPassword ? "text" : "password"}
            value={form.password}
            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
            placeholder="Min. 8 caratteri, 1 maiuscola, 1 numero"
            onFocus={() => setFocusedField("reg-pass")}
            onBlur={() => setFocusedField(null)}
            className={INPUT_CLASS_WITH_TOGGLE}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={showPassword ? "open" : "closed"}
                initial={{ rotateY: 90, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                exit={{ rotateY: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </motion.div>
            </AnimatePresence>
          </button>
        </div>
        <FieldError errors={errors} field="password" />
      </motion.div>

      {/* Confirm password */}
      <motion.div custom={4} variants={inputVariants} initial="hidden" animate="visible">
        <label className="block text-xs font-sans uppercase tracking-widest text-muted-foreground mb-1.5">
          Conferma Password
        </label>
        <div className={`relative transition-all duration-300 ${focusedField === "reg-confirm" ? "scale-[1.02]" : ""}`}>
          <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-300 ${focusedField === "reg-confirm" ? "text-primary" : "text-muted-foreground"}`} />
          <input
            type={showConfirmPassword ? "text" : "password"}
            value={form.confirmPassword}
            onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
            placeholder="Ripeti la password"
            onFocus={() => setFocusedField("reg-confirm")}
            onBlur={() => setFocusedField(null)}
            className={INPUT_CLASS_WITH_TOGGLE}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={showConfirmPassword ? "open" : "closed"}
                initial={{ rotateY: 90, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                exit={{ rotateY: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </motion.div>
            </AnimatePresence>
          </button>
        </div>
        <FieldError errors={errors} field="confirmPassword" />
      </motion.div>

      {/* Privacy checkbox */}
      <motion.div custom={5} variants={inputVariants} initial="hidden" animate="visible">
        <label className="flex items-start gap-3 cursor-pointer group p-3 rounded-xl border border-border/50 bg-muted/30 hover:bg-muted/60 hover:border-primary/30 transition-all duration-300">
          <div className="relative mt-0.5 shrink-0">
            <input
              type="checkbox"
              checked={form.acceptPrivacy}
              onChange={e => setForm(f => ({ ...f, acceptPrivacy: e.target.checked }))}
              className="peer sr-only"
            />
            <div className={`w-6 h-6 rounded-md border-2 transition-all duration-300 flex items-center justify-center shadow-sm ${
              form.acceptPrivacy
                ? "bg-primary border-primary shadow-primary/25"
                : errors.acceptPrivacy
                  ? "border-destructive bg-destructive/10 shadow-destructive/10"
                  : "border-muted-foreground/40 bg-background group-hover:border-primary/60"
            }`}>
              <AnimatePresence>
                {form.acceptPrivacy && (
                  <motion.svg
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 15 }}
                    className="w-3.5 h-3.5 text-primary-foreground"
                    viewBox="0 0 12 12"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M2 6l3 3 5-5" />
                  </motion.svg>
                )}
              </AnimatePresence>
            </div>
          </div>
          <span className="text-sm text-foreground/80 font-sans leading-relaxed">
            Accetto la{" "}
            <a href="/privacy-policy" target="_blank" onClick={e => e.stopPropagation()} className="text-primary hover:underline font-semibold">
              Privacy Policy
            </a>, il{" "}
            <a href="/rental-agreement" target="_blank" onClick={e => e.stopPropagation()} className="text-primary hover:underline font-semibold">
              Rental Agreement
            </a>{" "}e la{" "}
            <a href="/refund-policy" target="_blank" onClick={e => e.stopPropagation()} className="text-primary hover:underline font-semibold">
              Refund &amp; Cancellation Policy
            </a>{" "}
            <span className="text-destructive">*</span>
          </span>
        </label>
        <FieldError errors={errors} field="acceptPrivacy" />
      </motion.div>

      {/* Submit */}
      <motion.div custom={6} variants={inputVariants} initial="hidden" animate="visible" className="pt-1">
        <motion.button
          type="submit"
          disabled={loading}
          whileHover={!loading ? { scale: 1.02, boxShadow: "0 8px 30px -8px hsl(160 55% 16% / 0.4)" } : {}}
          whileTap={!loading ? { scale: 0.98 } : {}}
          className="w-full py-3.5 bg-primary text-primary-foreground rounded-lg font-sans text-sm tracking-widest uppercase flex items-center justify-center gap-2 group transition-all duration-300 disabled:opacity-70"
        >
          {loading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <>
              Crea Account
              <motion.span
                className="inline-block"
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <Sparkles size={16} />
              </motion.span>
            </>
          )}
        </motion.button>
      </motion.div>
    </motion.form>
  );
};

export default RegisterForm;
