import { cn } from "@/lib/utils";
import { 
  Sparkles, 
  Bug, 
  RefreshCw, 
  Wrench, 
  FileText, 
  TestTube, 
  Palette 
} from "lucide-react";

const commitTypes = [
  { value: "feat", label: "feat", description: "Nova funcionalidade", icon: Sparkles, color: "text-emerald-500" },
  { value: "fix", label: "fix", description: "Correção de bug", icon: Bug, color: "text-red-400" },
  { value: "refactor", label: "refactor", description: "Refatoração", icon: RefreshCw, color: "text-amber-500" },
  { value: "chore", label: "chore", description: "Manutenção", icon: Wrench, color: "text-slate-400" },
  { value: "docs", label: "docs", description: "Documentação", icon: FileText, color: "text-blue-400" },
  { value: "test", label: "test", description: "Testes", icon: TestTube, color: "text-purple-400" },
  { value: "style", label: "style", description: "Estilos", icon: Palette, color: "text-pink-400" },
];

interface CommitTypeSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function CommitTypeSelector({ value, onChange }: CommitTypeSelectorProps) {
  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-foreground">
        Tipo de mudança <span className="text-destructive">*</span>
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        {commitTypes.map((type) => {
          const Icon = type.icon;
          const isSelected = value === type.value;
          
          return (
            <button
              key={type.value}
              type="button"
              onClick={() => onChange(type.value)}
              className={cn(
                "flex flex-col items-center gap-1.5 p-3 rounded-lg border transition-all duration-200",
                "hover:border-primary/50 hover:bg-accent/50",
                isSelected
                  ? "border-primary bg-accent shadow-glow"
                  : "border-border bg-card"
              )}
            >
              <Icon className={cn("h-5 w-5", type.color)} />
              <span className={cn(
                "font-mono text-xs font-medium",
                isSelected ? "text-primary" : "text-foreground"
              )}>
                {type.label}
              </span>
              <span className="text-[10px] text-muted-foreground hidden sm:block">
                {type.description}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
