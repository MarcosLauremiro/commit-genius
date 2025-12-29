import { Header } from "@/components/Header";
import { CommitForm } from "@/components/CommitForm";
import { useEffect } from "react";

const Index = () => {
  useEffect(() => {
    // Set dark mode by default
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-2xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-10 animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              Escreva commits melhores,{" "}
              <span className="text-gradient">mais rápido</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-md mx-auto">
              Gere mensagens de commit profissionais e padronizadas em segundos com ajuda da IA.
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-lg animate-slide-up">
            <CommitForm />
          </div>

          {/* Footer hint */}
          <p className="text-center text-xs text-muted-foreground mt-8">
            Dica: Use{" "}
            <kbd className="px-1.5 py-0.5 rounded bg-secondary font-mono text-[10px]">
              Ctrl + Enter
            </kbd>{" "}
            para gerar rapidamente
          </p>
        </div>
      </main>
    </div>
  );
};

export default Index;
