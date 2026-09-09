import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  EMAIL_PATTERN,
  loginSchema,
  registerSchema,
  zodFieldErrors,
  type RegisterFormValues,
} from "@/lib/authValidation";

export type GlobalMessage = { type: "success" | "error"; text: string } | null;

/**
 * All the auth behaviour of the login/registration page: form state,
 * validation, sign in, sign up (+ welcome email) and password recovery.
 * The page components stay presentational.
 */
export function useAuthForms() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParamsReg] = useState(() => new URLSearchParams(location.search));
  const redirectTo = searchParamsReg.get("redirect") || "/";

  const [activeTab, setActiveTab] = useState<"login" | "register">("register");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [globalMessage, setGlobalMessage] = useState<GlobalMessage>(null);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [forgotPassword, setForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSent, setForgotSent] = useState(false);

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState<RegisterFormValues>({
    firstName: "", lastName: "", email: "", phone: "", password: "", confirmPassword: "", acceptPrivacy: false,
  });

  // Arriving here from "password dimenticata?" links elsewhere in the app.
  useEffect(() => {
    const state = location.state as { forgotPassword?: boolean } | null;
    if (state?.forgotPassword) {
      setActiveTab("login");
      setForgotPassword(true);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const clearMessages = () => {
    setErrors({});
    setGlobalMessage(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    const result = loginSchema.safeParse(loginForm);
    if (!result.success) {
      setErrors(zodFieldErrors(result.error));
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: loginForm.email,
      password: loginForm.password,
    });
    setLoading(false);

    if (error) {
      setGlobalMessage({ type: "error", text: "Email o password non corretti" });
    } else {
      setGlobalMessage({ type: "success", text: "Accesso effettuato! Reindirizzamento..." });
      setTimeout(() => navigate(redirectTo), 1500);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    const result = registerSchema.safeParse(registerForm);
    if (!result.success) {
      setErrors(zodFieldErrors(result.error));
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: registerForm.email,
      password: registerForm.password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          first_name: registerForm.firstName,
          last_name: registerForm.lastName,
          phone: registerForm.phone,
        },
      },
    });
    setLoading(false);

    if (error) {
      setGlobalMessage({ type: "error", text: error.message });
      return;
    }

    setRegisteredEmail(registerForm.email);
    setRegistrationSuccess(true);

    // Welcome email is best-effort: never block the success screen on it.
    try {
      await supabase.functions.invoke("send-transactional-email", {
        body: {
          templateName: "welcome",
          recipientEmail: registerForm.email,
          idempotencyKey: `welcome-${registerForm.email}`,
          templateData: { guestName: registerForm.firstName },
        },
      });
    } catch (e) {
      console.error("Welcome email failed (non-blocking):", e);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    if (!forgotEmail.trim() || !EMAIL_PATTERN.test(forgotEmail)) {
      setGlobalMessage({ type: "error", text: "Inserisci un indirizzo email valido" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      setGlobalMessage({ type: "error", text: error.message });
    } else {
      setForgotSent(true);
    }
  };

  const openForgotPassword = () => {
    setForgotPassword(true);
    clearMessages();
    setForgotSent(false);
    setForgotEmail("");
  };

  const closeForgotPassword = () => {
    setForgotPassword(false);
    clearMessages();
  };

  const selectTab = (tab: "login" | "register") => {
    setActiveTab(tab);
    clearMessages();
  };

  const goToLoginAfterSignup = () => {
    setRegistrationSuccess(false);
    setActiveTab("login");
  };

  return {
    navigate,
    activeTab, selectTab,
    loading, errors, globalMessage,
    loginForm, setLoginForm, handleLogin,
    registerForm, setRegisterForm, handleRegister,
    registrationSuccess, registeredEmail, goToLoginAfterSignup,
    forgotPassword, openForgotPassword, closeForgotPassword,
    forgotEmail, setForgotEmail, forgotSent, handleForgotSubmit,
  };
}
