import { cn } from "@/lib/utils";
import { Briefcase, MessageCircle, Zap, Code } from "lucide-react";

const toneOptions = [
  { 
    value: "professional", 
    label: "Profissional", 
    description: "Formal e técnico", 
    icon: Briefcase,
    example: "feat(auth): implement JWT token validation"
  },
  { 
    value: "casual", 
    label: "Casual", 
    description: "Informal e direto", 
    icon: MessageCircle,
    example: "feat(auth): add JWT validation"
  },
  { 
    value: "minimal", 
    label: "Minimalista", 
    description: "Curto e objetivo", 
    icon: Zap,
    example: "add jwt auth"
  },
  { 
    value: "detailed", 
    label: "Detalhado", 
    description: "Completo com contexto", 
    icon: Code,
    example: "feat(auth): implement JWT token validation for user sessions"
  },
];

interface ToneSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function ToneSelector({ value, onChange }: ToneSelectorProps) {
  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-foreground">
        Estilo da mensagem
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {toneOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = value === option.value;
          
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={cn(
                "flex flex-col items-center gap-1.5 p-3 rounded-lg border transition-all duration-200",
                "hover:border-primary/50 hover:bg-accent/50",
                isSelected
                  ? "border-primary bg-accent shadow-glow"
                  : "border-border bg-card"
              )}
            >
              <Icon className={cn(
                "h-5 w-5",
                isSelected ? "text-primary" : "text-muted-foreground"
              )} />
              <span className={cn(
                "text-xs font-medium",
                isSelected ? "text-primary" : "text-foreground"
              )}>
                {option.label}
              </span>
              <span className="text-[10px] text-muted-foreground hidden sm:block text-center">
                {option.description}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export { toneOptions };
