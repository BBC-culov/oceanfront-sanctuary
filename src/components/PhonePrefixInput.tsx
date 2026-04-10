import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Phone } from "lucide-react";

const PREFIXES = [
  { code: "+39", country: "IT", flag: "🇮🇹", label: "Italia" },
  { code: "+238", country: "CV", flag: "🇨🇻", label: "Capo Verde" },
  { code: "+351", country: "PT", flag: "🇵🇹", label: "Portogallo" },
  { code: "+34", country: "ES", flag: "🇪🇸", label: "Spagna" },
  { code: "+33", country: "FR", flag: "🇫🇷", label: "Francia" },
  { code: "+49", country: "DE", flag: "🇩🇪", label: "Germania" },
  { code: "+44", country: "GB", flag: "🇬🇧", label: "Regno Unito" },
  { code: "+41", country: "CH", flag: "🇨🇭", label: "Svizzera" },
  { code: "+43", country: "AT", flag: "🇦🇹", label: "Austria" },
  { code: "+31", country: "NL", flag: "🇳🇱", label: "Paesi Bassi" },
  { code: "+32", country: "BE", flag: "🇧🇪", label: "Belgio" },
  { code: "+1", country: "US", flag: "🇺🇸", label: "USA / Canada" },
  { code: "+55", country: "BR", flag: "🇧🇷", label: "Brasile" },
  { code: "+7", country: "RU", flag: "🇷🇺", label: "Russia" },
  { code: "+86", country: "CN", flag: "🇨🇳", label: "Cina" },
  { code: "+81", country: "JP", flag: "🇯🇵", label: "Giappone" },
  { code: "+61", country: "AU", flag: "🇦🇺", label: "Australia" },
  { code: "+91", country: "IN", flag: "🇮🇳", label: "India" },
  { code: "+46", country: "SE", flag: "🇸🇪", label: "Svezia" },
  { code: "+47", country: "NO", flag: "🇳🇴", label: "Norvegia" },
  { code: "+45", country: "DK", flag: "🇩🇰", label: "Danimarca" },
  { code: "+48", country: "PL", flag: "🇵🇱", label: "Polonia" },
  { code: "+30", country: "GR", flag: "🇬🇷", label: "Grecia" },
  { code: "+90", country: "TR", flag: "🇹🇷", label: "Turchia" },
  { code: "+212", country: "MA", flag: "🇲🇦", label: "Marocco" },
  { code: "+20", country: "EG", flag: "🇪🇬", label: "Egitto" },
  { code: "+27", country: "ZA", flag: "🇿🇦", label: "Sudafrica" },
];

function extractPrefix(phone: string): { prefix: string; number: string } {
  if (!phone) return { prefix: "+39", number: "" };
  const cleaned = phone.replace(/\s/g, "");
  // Try matching longest prefix first
  const sorted = [...PREFIXES].sort((a, b) => b.code.length - a.code.length);
  for (const p of sorted) {
    if (cleaned.startsWith(p.code)) {
      return { prefix: p.code, number: cleaned.slice(p.code.length) };
    }
  }
  return { prefix: "+39", number: cleaned.replace(/^\+/, "") };
}

interface PhonePrefixInputProps {
  value: string;
  onChange: (fullPhone: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  focused?: boolean;
  placeholder?: string;
  className?: string;
  /** Compact variant for booking forms */
  variant?: "default" | "compact";
  disabled?: boolean;
}

const PhonePrefixInput = ({
  value,
  onChange,
  onFocus,
  onBlur,
  focused = false,
  placeholder = "333 123 4567",
  className = "",
  variant = "default",
  disabled = false,
}: PhonePrefixInputProps) => {
  const { prefix, number } = extractPrefix(value);
  const [selectedPrefix, setSelectedPrefix] = useState(prefix);
  const [localNumber, setLocalNumber] = useState(number);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // Sync from parent
  useEffect(() => {
    const { prefix: p, number: n } = extractPrefix(value);
    setSelectedPrefix(p);
    setLocalNumber(n);
  }, [value]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Focus search when dropdown opens
  useEffect(() => {
    if (open && searchRef.current) {
      setTimeout(() => searchRef.current?.focus(), 50);
    }
  }, [open]);

  const handleNumberChange = (num: string) => {
    const digitsOnly = num.replace(/\D/g, "");
    setLocalNumber(digitsOnly);
    onChange(`${selectedPrefix} ${digitsOnly}`);
  };

  const handlePrefixChange = (code: string) => {
    setSelectedPrefix(code);
    setOpen(false);
    setSearch("");
    onChange(`${code} ${localNumber}`);
  };

  const currentPrefix = PREFIXES.find((p) => p.code === selectedPrefix) || PREFIXES[0];
  const filtered = PREFIXES.filter(
    (p) =>
      p.label.toLowerCase().includes(search.toLowerCase()) ||
      p.code.includes(search) ||
      p.country.toLowerCase().includes(search.toLowerCase())
  );

  const isCompact = variant === "compact";

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div className={`flex items-stretch ${isCompact ? "h-11" : ""}`}>
        {/* Prefix button */}
        <button
          type="button"
          onClick={() => !disabled && setOpen(!open)}
          disabled={disabled}
          className={`flex items-center gap-1 shrink-0 border border-r-0 transition-all duration-200 ${
            isCompact
              ? "px-2.5 rounded-l-md bg-card/50 border-border/60 text-sm"
              : `px-3 rounded-l-lg bg-muted/50 border-border ${
                  focused
                    ? "border-primary/50 ring-2 ring-primary/20"
                    : ""
                }`
          } ${disabled ? "opacity-60 cursor-not-allowed" : "hover:bg-muted/80 cursor-pointer"}`}
        >
          <span className="text-base leading-none" role="img" aria-label={currentPrefix.label}>{currentPrefix.flag}</span>
          <span className="font-sans text-xs text-foreground">{currentPrefix.code}</span>
          {!disabled && <ChevronDown className={`w-3 h-3 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`} />}
        </button>

        {/* Number input */}
        <div className="relative flex-1">
          {!isCompact && (
            <Phone className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-300 ${
              focused ? "text-primary" : "text-muted-foreground"
            }`} />
          )}
          <input
            type="tel"
            value={localNumber}
            onChange={(e) => handleNumberChange(e.target.value)}
            onFocus={onFocus}
            onBlur={onBlur}
            disabled={disabled}
            placeholder={placeholder}
            className={
              isCompact
                ? `w-full h-full px-3 rounded-r-md bg-card/50 border border-border/60 font-sans text-sm focus:border-primary/40 focus:bg-background transition-all duration-200 focus:outline-none ${disabled ? "opacity-60 cursor-not-allowed" : ""}`
                : `w-full pl-10 pr-4 py-3 rounded-r-lg bg-muted/50 border border-border text-foreground text-sm font-sans placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all duration-300 ${
                    focused ? "border-primary/50 ring-2 ring-primary/20" : ""
                  } ${disabled ? "opacity-60 cursor-not-allowed" : ""}`
            }
          />
        </div>
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 left-0 top-full mt-1 w-64 bg-popover border border-border rounded-lg shadow-xl overflow-hidden"
          >
            {/* Search */}
            <div className="p-2 border-b border-border/40">
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cerca paese..."
                className="w-full px-3 py-2 rounded-md bg-muted/50 border border-border/50 text-sm font-sans text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary/30"
              />
            </div>
            {/* List */}
            <div className="max-h-52 overflow-y-auto">
              {filtered.length === 0 ? (
                <p className="text-center text-xs text-muted-foreground py-4">Nessun risultato</p>
              ) : (
                filtered.map((p) => (
                  <button
                    key={p.code + p.country}
                    type="button"
                    onClick={() => handlePrefixChange(p.code)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-sans transition-colors hover:bg-muted/60 ${
                      p.code === selectedPrefix ? "bg-primary/10 text-primary font-medium" : "text-foreground"
                    }`}
                  >
                    <span className="text-base" role="img" aria-label={p.label}>{p.flag}</span>
                    <span className="flex-1 text-left">{p.label}</span>
                    <span className="text-xs text-muted-foreground">{p.code}</span>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PhonePrefixInput;
