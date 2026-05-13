import { Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { LogOut } from "lucide-react";
import logo from "@/assets/equisalario-logo.png";

interface Props {
  onOpenLogin: () => void;
}

export function SiteHeader({ onOpenLogin }: Props) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 border-b-2 border-primary bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="EquiSalário" className="h-10 w-10 object-contain" />
          <span className="text-lg font-bold tracking-tight text-primary">
            Equi<span className="text-gold">Salário</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link to="/" className="text-sm font-medium text-foreground/80 hover:text-primary [&.active]:text-primary [&.active]:font-bold">
            Início
          </Link>
          <a href="/#graficos" className="text-sm font-medium text-foreground/80 hover:text-primary">
            Gráficos
          </a>
          <a href="/#sobre" className="text-sm font-medium text-foreground/80 hover:text-primary">
            Sobre
          </a>
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Button
                variant="outline"
                size="sm"
                className="border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                onClick={() => navigate({ to: "/dashboard" })}
              >
                Painel da Empresa
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={async () => {
                  await signOut();
                  navigate({ to: "/" });
                }}
                aria-label="Sair"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Button
              onClick={onOpenLogin}
              className="bg-gradient-gold text-primary font-semibold border-2 border-gold-deep shadow-gold hover:opacity-90"
            >
              Empresas: Login
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
