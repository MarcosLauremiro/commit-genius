import { useState } from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

const suggestedScopes = [
  "auth", "api", "ui", "dashboard", "checkout", "database", "config", "core"
];

interface ScopeInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function ScopeInput({ value, onChange }: ScopeInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-foreground">
        Scope <span className="text-muted-foreground">(optional)</span>
      </label>
      
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value.toLowerCase().replace(/\s/g, "-"))}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 150)}
          placeholder="e.g., auth, api, ui"
          className={cn(
            "w-full h-10 px-3 rounded-lg border bg-card font-mono text-sm",
            "placeholder:text-muted-foreground",
            "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
            "transition-all duration-200"
          )}
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {!value && isFocused && (
        <div className="flex flex-wrap gap-2 animate-fade-in">
          {suggestedScopes.map((scope) => (
            <button
              key={scope}
              type="button"
              onClick={() => onChange(scope)}
              className={cn(
                "px-2.5 py-1 rounded-md text-xs font-mono",
                "bg-secondary text-secondary-foreground",
                "hover:bg-accent hover:text-accent-foreground",
                "transition-colors duration-150"
              )}
            >
              {scope}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
