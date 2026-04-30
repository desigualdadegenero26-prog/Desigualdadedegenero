import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

const REGIONS = ["Norte", "Nordeste", "Centro-Oeste", "Sudeste", "Sul"];
const SIZES = ["1-10", "11-50", "51-200", "201-500", "500+"];

const schema = z.object({
  name: z.string().trim().min(2, "Nome muito curto").max(120),
  cnpj: z.string().trim().min(14, "CNPJ inválido").max(18),
  sector: z.string().trim().min(2).max(60),
  size: z.string().min(1, "Selecione o tamanho"),
  region: z.string().min(1, "Selecione a região"),
});

interface Props {
  onCreated: (c: {
    id: string;
    name: string;
    cnpj: string;
    sector: string;
    size: string;
    region: string;
  }) => void;
}

export function CompanyRegisterForm({ onCreated }: Props) {
  const { user } = useAuth();
  const [form, setForm] = useState({ name: "", cnpj: "", sector: "", size: "", region: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("companies")
      .insert({ ...parsed.data, user_id: user.id })
      .select()
      .single();
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Empresa cadastrada! Agora envie os dados da pesquisa.");
    onCreated(data);
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 text-center">
        <span className="inline-block rounded-full border-2 border-gold bg-card px-4 py-1 text-xs font-bold uppercase text-gold-deep">
          Etapa 1 de 2
        </span>
        <h1 className="mt-3 text-3xl font-bold">Cadastre sua empresa</h1>
        <p className="mt-2 text-muted-foreground">
          Após o cadastro você poderá enviar registros do questionário salarial.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-xl border-2 border-primary bg-card p-6 shadow-blue"
      >
        <div className="space-y-2">
          <Label htmlFor="name">Nome da empresa</Label>
          <Input
            id="name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            maxLength={120}
            required
            className="border-2 border-input focus-visible:border-primary"
          />
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="cnpj">CNPJ</Label>
            <Input
              id="cnpj"
              value={form.cnpj}
              onChange={(e) => setForm({ ...form, cnpj: e.target.value })}
              placeholder="00.000.000/0000-00"
              maxLength={18}
              required
              className="border-2 border-input focus-visible:border-primary"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sector">Setor</Label>
            <Input
              id="sector"
              value={form.sector}
              onChange={(e) => setForm({ ...form, sector: e.target.value })}
              placeholder="Tecnologia, Varejo..."
              maxLength={60}
              required
              className="border-2 border-input focus-visible:border-primary"
            />
          </div>
          <div className="space-y-2">
            <Label>Nº de funcionários</Label>
            <Select value={form.size} onValueChange={(v) => setForm({ ...form, size: v })}>
              <SelectTrigger className="border-2 border-input">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {SIZES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Região</Label>
            <Select value={form.region} onValueChange={(v) => setForm({ ...form, region: v })}>
              <SelectTrigger className="border-2 border-input">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {REGIONS.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-gold text-primary font-bold border-2 border-gold-deep shadow-gold hover:opacity-90"
        >
          {loading ? "Cadastrando..." : "Cadastrar empresa"}
        </Button>
      </form>
    </div>
  );
}
