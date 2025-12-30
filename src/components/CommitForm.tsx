import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CommitTypeSelector } from "./CommitTypeSelector";
import { ScopeInput } from "./ScopeInput";
import { ToneSelector } from "./ToneSelector";
import { CommitOutput } from "./CommitOutput";
import { Sparkles, AlertTriangle, CloudOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Groq } from "groq-sdk";

interface FormData {
  type: string;
  scope: string;
  description: string;
  reason: string;
  breakingChange: boolean;
  tone: string;
  idioma: "ingles" | "português"
}

// Função que será usada para chamar a IA via Gemini API
async function generateWithAI(formData: FormData): Promise<string> {
  // Use uma chave da Groq (gratuita em groq.com)
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;

  if (!apiKey) {
    throw new Error("AI_NOT_CONFIGURED");
  }

  try {
    const groq = new Groq({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true // Necessário para apps client-side como React/Vite
    });

    const scopePart = formData.scope ? `(${formData.scope})` : "";
    const breakingPrefix = formData.breakingChange ? "!" : "";

    // Instruções de tom (mantendo sua lógica)
    const toneInstructions: Record<string, string> = {
      minimal: "Gere uma mensagem mínima e direta, apenas com o essencial.",
      casual: "Gere uma mensagem casual e amigável, mas ainda profissional.",
      professional: "Gere uma mensagem profissional e formal, seguindo rigorosamente o padrão Conventional Commits.",
      detailed: "Gere uma mensagem detalhada com explicações completas, incluindo contexto e razões.",
    };

    const prompt = `Gere uma mensagem de commit seguindo o padrão Conventional Commits.
Tipo: ${formData.type}${scopePart}${breakingPrefix}
Descrição: ${formData.description}
${formData.reason ? `Razão: ${formData.reason}` : ""}
${formData.breakingChange ? "Esta mudança é um BREAKING CHANGE." : ""}
Tom: ${formData.tone}
Instrução de tom: ${toneInstructions[formData.tone] || toneInstructions.professional}

REGRAS CRÍTICAS:
- Formato: tipo(escopo): descrição
- Descrição em ${formData.idioma} começando com verbo no infinitivo (ex: add, fix, update)
- Responda APENAS com a mensagem de commit final, sem introduções ou explicações.`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "Você é um especialista em Git e Conventional Commits. Responda apenas o texto do commit."
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama-3.3-70b-versatile", // Modelo gratuito e muito potente
      temperature: 0.2, // Menor temperatura para ser mais preciso
    });

    return chatCompletion.choices[0]?.message?.content?.trim() || "";

  } catch (error) {
    console.error("Erro Groq:", error);
    throw new Error("Erro ao gerar commit com Groq");
  }
}

// Fallback local para quando a IA não está configurada
function generateLocalFallback(formData: FormData): string {
  const breakingPrefix = formData.breakingChange ? "!" : "";
  const scopePart = formData.scope ? `(${formData.scope})` : "";

  let description = formData.description.trim();

  // Mapeamento de verbos PT -> EN
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
      message = processedDesc;
      break;

    case "casual":
      message = `${formData.type}${scopePart}${breakingPrefix}: ${processedDesc}`;
      break;

    case "professional":
      const formalDesc = processedDesc.charAt(0).toUpperCase() + processedDesc.slice(1);
      message = `${formData.type}${scopePart}${breakingPrefix}: ${formalDesc}`;
      if (formData.reason) {
        message += `\n\nReason: ${formData.reason}`;
      }
      break;

    case "detailed":
      const detailedDesc = processedDesc.charAt(0).toUpperCase() + processedDesc.slice(1);
      message = `${formData.type}${scopePart}${breakingPrefix}: ${detailedDesc}`;

      if (formData.reason) {
        message += `\n\n${formData.reason}`;
      }

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

  return message;
}

export function CommitForm() {
  const [formData, setFormData] = useState<FormData>({
    type: "",
    scope: "",
    description: "",
    reason: "",
    breakingChange: false,
    tone: "professional",
    idioma: "ingles"
  });
  const [generatedMessage, setGeneratedMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAIEnabled, setIsAIEnabled] = useState(false);

  const generateCommitMessage = async () => {
    if (!formData.type || !formData.description.trim()) {
      toast.error("Por favor, preencha os campos obrigatórios");
      return;
    }

    setIsLoading(true);

    try {
      // Tenta usar IA primeiro
      const message = await generateWithAI(formData);
      setGeneratedMessage(message);
      setIsAIEnabled(true);
      toast.success("Mensagem gerada com IA!");
    } catch (error) {
      // Se IA não está configurada, usa fallback local
      if (error instanceof Error && error.message === "AI_NOT_CONFIGURED") {
        const message = generateLocalFallback(formData);
        setGeneratedMessage(message);
        setIsAIEnabled(false);
        toast.info("Gerado localmente (IA não configurada)", {
          description: "Configure VITE_GEMINI_API_KEY no arquivo .env para usar IA",
        });
      } else {
        toast.error("Erro ao gerar mensagem com IA", {
          description: error instanceof Error ? error.message : "Tente novamente",
        });
        console.error(error);
        // Em caso de erro, usa fallback local
        const message = generateLocalFallback(formData);
        setGeneratedMessage(message);
        setIsAIEnabled(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerate = () => {
    generateCommitMessage();
  };

  return (
    <div className="space-y-8">
      {/* AI Status Banner */}
      {!isAIEnabled && generatedMessage && (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border text-sm animate-fade-in">
          <CloudOff className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <p className="text-muted-foreground">
            Usando geração local. Configure <strong>VITE_GEMINI_API_KEY</strong> no arquivo <code className="text-xs bg-muted px-1 py-0.5 rounded">.env</code> para usar IA do Google Gemini.
          </p>
        </div>
      )}

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

      {/* Language Selector */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground">
          Idioma da mensagem
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setFormData((prev) => ({ ...prev, idioma: "ingles" }))}
            className={cn(
              "flex-1 px-4 py-2.5 rounded-lg border transition-all duration-200 text-sm font-medium",
              formData.idioma === "ingles"
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground"
            )}
          >
            🇺🇸 Inglês
          </button>
          <button
            type="button"
            onClick={() => setFormData((prev) => ({ ...prev, idioma: "português" }))}
            className={cn(
              "flex-1 px-4 py-2.5 rounded-lg border transition-all duration-200 text-sm font-medium",
              formData.idioma === "português"
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground"
            )}
          >
            🇧🇷 Português
          </button>
        </div>
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
        isLoading={isLoading}
      />
    </div>
  );
}
