import { Component, type ErrorInfo, type ReactNode } from "react";
import { BRAND_CONTACTS } from "@/lib/contacts";

interface ErrorBoundaryProps {
  children: ReactNode;
  /** Etichetta della zona (es. "prenotazione") usata nei log per capire dove è avvenuto l'errore. */
  area?: string;
  /** Fallback compatto: usato quando il boundary avvolge solo una sezione della pagina. */
  compact?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(
      `[ErrorBoundary${this.props.area ? `:${this.props.area}` : ""}]`,
      error,
      info.componentStack
    );
  }

  private handleReload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    const { compact } = this.props;

    return (
      <div
        role="alert"
        className={`flex w-full items-center justify-center bg-background px-6 ${
          compact ? "min-h-[50vh] py-16" : "min-h-screen"
        }`}
      >
        <div className="max-w-md text-center">
          <p className="font-sans text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
            Bazhouse
          </p>
          <h1 className="mt-4 font-serif text-3xl text-foreground sm:text-4xl">
            Qualcosa è andato storto
          </h1>
          <p className="mt-4 font-sans text-sm leading-relaxed text-muted-foreground">
            Si è verificato un errore inatteso. Puoi ricaricare la pagina: i tuoi dati
            non sono stati persi. Se il problema persiste, scrivici e ti assistiamo subito.
          </p>

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={this.handleReload}
              className="w-full bg-primary px-6 py-3 font-sans text-xs uppercase tracking-[0.15em] text-primary-foreground transition-opacity hover:opacity-90 sm:w-auto"
            >
              Ricarica la pagina
            </button>
            <a
              href="/"
              className="w-full border border-border px-6 py-3 font-sans text-xs uppercase tracking-[0.15em] text-foreground transition-colors hover:bg-muted sm:w-auto"
            >
              Torna alla home
            </a>
          </div>

          <div className="mt-8 flex flex-col items-center gap-2 font-sans text-xs text-muted-foreground">
            <a
              href={BRAND_CONTACTS.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground"
            >
              WhatsApp {BRAND_CONTACTS.phoneDisplay}
            </a>
            <a
              href={`mailto:${BRAND_CONTACTS.email}`}
              className="underline hover:text-foreground"
            >
              {BRAND_CONTACTS.email}
            </a>
          </div>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
