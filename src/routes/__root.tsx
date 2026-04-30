import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth-context";
import { Toaster } from "@/components/ui/sonner";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Página não encontrada</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          O conteúdo que você procura não existe ou foi movido.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Ir para o início
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "EquiSalário — Diferença salarial entre homens e mulheres" },
      {
        name: "description",
        content:
          "Plataforma brasileira que reúne dados anônimos de empresas para revelar a diferença salarial entre homens e mulheres por idade e região.",
      },
      { property: "og:title", content: "EquiSalário — Diferença salarial entre homens e mulheres" },
      {
        property: "og:description",
        content: "Veja a diferença salarial entre homens e mulheres no Brasil em tempo real.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:title", content: "EquiSalário — Diferença salarial entre homens e mulheres" },
      { name: "description", content: "Equity Pulse provides insights into the gender pay gap with interactive salary data visualizations." },
      { property: "og:description", content: "Equity Pulse provides insights into the gender pay gap with interactive salary data visualizations." },
      { name: "twitter:description", content: "Equity Pulse provides insights into the gender pay gap with interactive salary data visualizations." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/68487801-23d3-415a-848d-c6c9def8163f/id-preview-0f248a3f--86cddbcb-1f95-4b2a-a9ad-0e3a0353cb01.lovable.app-1777558963375.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/68487801-23d3-415a-848d-c6c9def8163f/id-preview-0f248a3f--86cddbcb-1f95-4b2a-a9ad-0e3a0353cb01.lovable.app-1777558963375.png" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <AuthProvider>
      <Outlet />
      <Toaster richColors position="top-right" />
    </AuthProvider>
  );
}
