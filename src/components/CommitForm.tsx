import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CommitTypeSelector } from "./CommitTypeSelector";
import { ScopeInput } from "./ScopeInput";
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
}

export function CommitForm() {
  const [formData, setFormData] = useState<FormData>({
    type: "",
    scope: "",
    description: "",
    reason: "",
    breakingChange: false,
  });
  const [generatedMessage, setGeneratedMessage] = useState("");
  const [tone, setTone] = useState<"short" | "detailed">("short");
  const [isLoading, setIsLoading] = useState(false);

  const generateCommitMessage = () => {
    if (!formData.type || !formData.description.trim()) {
      toast.error("Por favor, preencha os campos obrigatórios");
      return;
    }

    setIsLoading(true);

    // Simulate AI generation (in production, this would call the backend)
    setTimeout(() => {
      const breakingPrefix = formData.breakingChange ? "!" : "";
      const scopePart = formData.scope ? `(${formData.scope})` : "";
      
      // Generate a professional commit message
      let description = formData.description.trim();
      
      // Convert to imperative mood if needed
      const imperativeVerbs: Record<string, string> = {
        "adicionei": "add",
        "adicionado": "add",
        "adicionando": "add",
        "corrigi": "fix",
        "corrigido": "fix",
        "corrigindo": "fix",
        "atualizei": "update",
        "atualizado": "update",
        "atualizando": "update",
        "removi": "remove",
        "removido": "remove",
        "removendo": "remove",
        "mudei": "change",
        "mudado": "change",
        "mudando": "change",
        "criei": "create",
        "criado": "create",
        "criando": "create",
        "implementei": "implement",
        "implementado": "implement",
        "implementando": "implement",
        "added": "add",
        "adding": "add",
        "fixed": "fix",
        "fixing": "fix",
        "updated": "update",
        "updating": "update",
        "removed": "remove",
        "removing": "remove",
        "changed": "change",
        "changing": "change",
        "created": "create",
        "creating": "create",
        "implemented": "implement",
        "implementing": "implement",
      };

      // Process the description
      let processedDesc = description.toLowerCase();
      for (const [past, imperative] of Object.entries(imperativeVerbs)) {
        if (processedDesc.startsWith(past)) {
          processedDesc = processedDesc.replace(past, imperative);
          break;
        }
      }

      // Capitalize first letter
      processedDesc = processedDesc.charAt(0).toLowerCase() + processedDesc.slice(1);

      let message = `${formData.type}${scopePart}${breakingPrefix}: ${processedDesc}`;

      if (tone === "detailed" && formData.reason) {
        message += `\n\n${formData.reason}`;
      }

      if (formData.breakingChange) {
        message += `\n\nBREAKING CHANGE: Este commit introduz mudanças incompatíveis`;
      }

      setGeneratedMessage(message);
      setIsLoading(false);
      toast.success("Mensagem de commit gerada!");
    }, 800);
  };

  const handleRegenerate = () => {
    generateCommitMessage();
  };

  const handleToneChange = (newTone: "short" | "detailed") => {
    setTone(newTone);
    if (generatedMessage) {
      // Regenerate with new tone
      setTimeout(() => generateCommitMessage(), 100);
    }
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
        onToneChange={handleToneChange}
        tone={tone}
        isLoading={isLoading}
      />
    </div>
  );
}
