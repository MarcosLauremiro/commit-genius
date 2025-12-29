import { ThemeToggle } from "./ThemeToggle";
import { GitCommit } from "lucide-react";

export function Header() {
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-primary shadow-glow">
            <GitCommit className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-semibold text-foreground text-lg leading-tight">
              CommitCraft
            </h1>
            <p className="text-xs text-muted-foreground hidden sm:block">
              AI-powered commit messages
            </p>
          </div>
        </div>
        
        <ThemeToggle />
      </div>
    </header>
  );
}
