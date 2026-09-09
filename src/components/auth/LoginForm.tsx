import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import {
  FieldError,
  INPUT_CLASS,
  INPUT_CLASS_WITH_TOGGLE,
  inputVariants,
  tabContentVariants,
} from "./authMotion";

interface LoginFormProps {
  form: { email: string; password: string };
  setForm: React.Dispatch<React.SetStateAction<{ email: string; password: string }>>;
  errors: Record<string, string>;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onForgotPassword: () => void;
}

const LoginForm = ({ form, setForm, errors, loading, onSubmit, onForgotPassword }: LoginFormProps) => {
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <motion.form
      key="login"
      variants={tabContentVariants}
      initial="enter"
      animate="center"
      exit="exit"
      className="space-y-4"
      onSubmit={onSubmit}
    >
      {/* Email */}
      <motion.div custom={0} variants={inputVariants} initial="hidden" animate="visible">
        <label className="block text-xs font-sans uppercase tracking-widest text-muted-foreground mb-1.5">
          Email
        </label>
        <div className={`relative group transition-all duration-300 ${focusedField === "login-email" ? "scale-[1.02]" : ""}`}>
          <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-300 ${focusedField === "login-email" ? "text-primary" : "text-muted-foreground"}`} />
          <input
            type="email"
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            placeholder="tuaemail@esempio.com"
            onFocus={() => setFocusedField("login-email")}
            onBlur={() => setFocusedField(null)}
            className={INPUT_CLASS}
          />
        </div>
        <FieldError errors={errors} field="email" />
      </motion.div>

      {/* Password */}
      <motion.div custom={1} variants={inputVariants} initial="hidden" animate="visible">
        <label className="block text-xs font-sans uppercase tracking-widest text-muted-foreground mb-1.5">
          Password
        </label>
        <div className={`relative group transition-all duration-300 ${focusedField === "login-pass" ? "scale-[1.02]" : ""}`}>
          <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-300 ${focusedField === "login-pass" ? "text-primary" : "text-muted-foreground"}`} />
          <input
            type={showPassword ? "text" : "password"}
            value={form.password}
            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
            placeholder="••••••••"
            onFocus={() => setFocusedField("login-pass")}
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

      {/* Forgot password */}
      <motion.div custom={2} variants={inputVariants} initial="hidden" animate="visible" className="text-right">
        <button type="button" onClick={onForgotPassword} className="text-xs text-ocean hover:text-primary transition-colors font-sans">
          Password dimenticata?
        </button>
      </motion.div>

      {/* Submit */}
      <motion.div custom={3} variants={inputVariants} initial="hidden" animate="visible">
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
              Accedi
              <motion.span
                className="inline-block"
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <ArrowRight size={16} />
              </motion.span>
            </>
          )}
        </motion.button>
      </motion.div>
    </motion.form>
  );
};

export default LoginForm;
