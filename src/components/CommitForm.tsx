import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CommitTypeSelector } from "./CommitTypeSelector";
import { ScopeInput } from "./ScopeInput";
import { ToneSelector } from "./ToneSelector";
import { CommitOutput } from "./CommitOutput";
import { Sparkles, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface FormData {
  type: string;
  scope: string;
  description: string;
  reason: string;
  breakingChange: boolean;
  tone: string;
}

export function CommitForm() {
  const [formData, setFormData] = useState<FormData>({
    type: "",
    scope: "",
    description: "",
    reason: "",
    breakingChange: false,
    tone: "professional",
  });
  const [generatedMessage, setGeneratedMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const generateCommitMessage = () => {
    if (!formData.type || !formData.description.trim()) {
      toast.error("Por favor, preencha os campos obrigatórios");
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const breakingPrefix = formData.breakingChange ? "!" : "";
      const scopePart = formData.scope ? `(${formData.scope})` : "";
      
      let description = formData.description.trim();
      
      // Convert Portuguese verbs to English imperative
      const verbMappings: Record<string, string> = {
        "adicionei": "add",
        "adicionado": "add",
        "adicionando": "add",
        "adicionar": "add",
        "corrigi": "fix",
        "corrigido": "fix",
        "corrigindo": "fix",
        "corrigir": "fix",
        "atualizei": "update",
        "atualizado": "update",
        "atualizando": "update",
        "atualizar": "update",
        "removi": "remove",
        "removido": "remove",
        "removendo": "remove",
        "remover": "remove",
        "mudei": "change",
        "mudado": "change",
        "mudando": "change",
        "mudar": "change",
        "criei": "create",
        "criado": "create",
        "criando": "create",
        "criar": "create",
        "implementei": "implement",
        "implementado": "implement",
        "implementando": "implement",
        "implementar": "implement",
        "melhorei": "improve",
        "melhorado": "improve",
        "melhorando": "improve",
        "melhorar": "improve",
        "refatorei": "refactor",
        "refatorado": "refactor",
        "refatorando": "refactor",
        "refatorar": "refactor",
      };

      let processedDesc = description.toLowerCase();
      let foundVerb = false;
      
      for (const [pt, en] of Object.entries(verbMappings)) {
        if (processedDesc.startsWith(pt + " ")) {
          processedDesc = en + processedDesc.slice(pt.length);
          foundVerb = true;
          break;
        }
      }

      // If no verb found, try to add appropriate verb based on commit type
      if (!foundVerb) {
        const typeVerbs: Record<string, string> = {
          feat: "add",
          fix: "fix",
          refactor: "refactor",
          chore: "update",
          docs: "update",
          test: "add",
          style: "improve",
        };
        const verb = typeVerbs[formData.type] || "update";
        processedDesc = `${verb} ${processedDesc}`;
      }

      let message = "";

      switch (formData.tone) {
        case "minimal":
          // No conventional commit format, just the description
          message = processedDesc;
          break;
          
        case "casual":
          // Simple conventional commit
          message = `${formData.type}${scopePart}${breakingPrefix}: ${processedDesc}`;
          break;
          
        case "professional":
          // Formal conventional commit with proper capitalization
          const formalDesc = processedDesc.charAt(0).toUpperCase() + processedDesc.slice(1);
          message = `${formData.type}${scopePart}${breakingPrefix}: ${formalDesc}`;
          if (formData.reason) {
            message += `\n\nReason: ${formData.reason}`;
          }
          break;
          
        case "detailed":
          // Full conventional commit with body
          const detailedDesc = processedDesc.charAt(0).toUpperCase() + processedDesc.slice(1);
          message = `${formData.type}${scopePart}${breakingPrefix}: ${detailedDesc}`;
          
          if (formData.reason) {
            message += `\n\n${formData.reason}`;
          }
          
          // Add context based on type
          const typeContext: Record<string, string> = {
            feat: "This commit introduces new functionality.",
            fix: "This commit resolves an existing issue.",
            refactor: "This commit improves code structure without changing behavior.",
            chore: "This commit includes maintenance work.",
            docs: "This commit updates documentation.",
            test: "This commit adds or modifies tests.",
            style: "This commit includes styling changes.",
          };
          
          if (typeContext[formData.type]) {
            message += `\n\n${typeContext[formData.type]}`;
          }
          break;
          
        default:
          message = `${formData.type}${scopePart}${breakingPrefix}: ${processedDesc}`;
      }

      if (formData.breakingChange) {
        if (formData.tone === "minimal") {
          message += " [BREAKING]";
        } else {
          message += "\n\nBREAKING CHANGE: This commit introduces breaking changes that may affect existing functionality.";
        }
      }

      setGeneratedMessage(message);
      setIsLoading(false);
      toast.success("Mensagem de commit gerada!");
    }, 800);
  };

  const handleRegenerate = () => {
    generateCommitMessage();
  };

  return (
    <div className="space-y-8">
      {/* Commit Type */}
      <CommitTypeSelector
        value={formData.type}
        onChange={(type) => setFormData((prev) => ({ ...prev, type }))}
      />

      {/* Scope */}
      <ScopeInput
        value={formData.scope}
        onChange={(scope) => setFormData((prev) => ({ ...prev, scope }))}
      />

      {/* Description */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground">
          O que foi feito? <span className="text-destructive">*</span>
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
          placeholder="ex: Adicionei validação de email no cadastro"
          rows={3}
          className={cn(
            "w-full px-3 py-2 rounded-lg border bg-card text-sm",
            "placeholder:text-muted-foreground",
            "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
            "transition-all duration-200 resize-none"
          )}
        />
      </div>

      {/* Reason */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground">
          Por que essa mudança? <span className="text-muted-foreground">(opcional)</span>
        </label>
        <textarea
          value={formData.reason}
          onChange={(e) => setFormData((prev) => ({ ...prev, reason: e.target.value }))}
          placeholder="ex: Para evitar cadastros de usuários inválidos"
          rows={2}
          className={cn(
            "w-full px-3 py-2 rounded-lg border bg-card text-sm",
            "placeholder:text-muted-foreground",
            "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
            "transition-all duration-200 resize-none"
          )}
        />
      </div>

      {/* Tone Selector */}
      <ToneSelector
        value={formData.tone}
        onChange={(tone) => setFormData((prev) => ({ ...prev, tone }))}
      />

      {/* Breaking Change */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setFormData((prev) => ({ ...prev, breakingChange: !prev.breakingChange }))}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-all duration-200",
            formData.breakingChange
              ? "border-warning bg-warning/10 text-warning"
              : "border-border bg-card text-muted-foreground hover:border-warning/50 hover:text-foreground"
          )}
        >
          <AlertTriangle className="h-4 w-4" />
          <span className="text-sm font-medium">Breaking change</span>
        </button>
      </div>

      {/* Generate Button */}
      <Button
        variant="primary"
        size="xl"
        onClick={generateCommitMessage}
        disabled={!formData.type || !formData.description.trim() || isLoading}
        className="w-full"
      >
        <Sparkles className="h-5 w-5" />
        Gerar Mensagem de Commit
      </Button>

      {/* Output */}
      <CommitOutput
        message={generatedMessage}
        onRegenerate={handleRegenerate}
        isLoading={isLoading}
      />
    </div>
  );
}
