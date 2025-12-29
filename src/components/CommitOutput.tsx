import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check, RefreshCw, Minimize2, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface CommitOutputProps {
  message: string;
  onRegenerate: () => void;
  onToneChange: (tone: "short" | "detailed") => void;
  tone: "short" | "detailed";
  isLoading: boolean;
}

export function CommitOutput({ 
  message, 
  onRegenerate, 
  onToneChange, 
  tone, 
  isLoading 
}: CommitOutputProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  if (!message && !isLoading) return null;

  return (
    <div className="space-y-4 animate-slide-up">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground">
          Generated Commit
        </label>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToneChange(tone === "short" ? "detailed" : "short")}
            disabled={isLoading}
            className="text-xs gap-1.5"
          >
            {tone === "short" ? (
              <>
                <Maximize2 className="h-3.5 w-3.5" />
                More detailed
              </>
            ) : (
              <>
                <Minimize2 className="h-3.5 w-3.5" />
                More concise
              </>
            )}
          </Button>
        </div>
      </div>

      <div className={cn(
        "relative rounded-lg border bg-code-bg border-code-border overflow-hidden",
        isLoading && "animate-pulse-subtle"
      )}>
        <pre className="p-4 font-mono text-sm text-foreground whitespace-pre-wrap break-words min-h-[80px]">
          {isLoading ? (
            <span className="text-muted-foreground">Generating commit message...</span>
          ) : (
            message
          )}
        </pre>
        
        {!isLoading && message && (
          <div className="absolute top-2 right-2 flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCopy}
              className="h-8 w-8 bg-background/80 backdrop-blur-sm hover:bg-background"
            >
              {copied ? (
                <Check className="h-4 w-4 text-success" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <Button
          variant="primary"
          size="lg"
          onClick={handleCopy}
          disabled={isLoading || !message}
          className="flex-1"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              Copy to clipboard
            </>
          )}
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={onRegenerate}
          disabled={isLoading}
        >
          <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
          Regenerate
        </Button>
      </div>
    </div>
  );
}
