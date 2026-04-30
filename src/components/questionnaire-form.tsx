import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

const REGIONS = ["Norte", "Nordeste", "Centro-Oeste", "Sudeste", "Sul"];

const entrySchema = z.object({
  gender: z.enum(["male", "female"]),
  age: z.number().int().min(16).max(100),
  region: z.string().min(1),
  role: z.string().trim().min(2).max(80),
  salary: z.number().positive().max(10000000),
});

type Company = {
  id: string;
  name: string;
  region: string;
};

export function QuestionnaireForm({ company }: { company: Company }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    gender: "female" as "female" | "male",
    age: "",
    region: company.region,
    role: "",
    salary: "",
  });
  const [loading, setLoading] = useState(false);
  const [submittedCount, setSubmittedCount] = useState(0);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = entrySchema.safeParse({
      gender: form.gender,
      age: Number(form.age),
      region: form.region,
      role: form.role,
      salary: Number(form.salary),
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("salary_entries").insert({
      ...parsed.data,
      company_id: company.id,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Registro enviado!");
    setSubmittedCount((c) => c + 1);
    setForm({ ...form, age: "", role: "", salary: "" });
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate({ to: "/dashboard" })}
          className="mb-3 text-primary hover:bg-primary/10"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar ao painel
        </Button>
        <div className="rounded-xl border-2 border-primary bg-gradient-blue p-6 text-primary-foreground shadow-blue">
          <p className="text-xs uppercase tracking-wider text-gold">Questionário salarial</p>
          <h1 className="mt-1 text-3xl font-bold">{company.name}</h1>
          <p className="mt-1 text-sm opacity-90">
            Preencha um registro por funcionário. Os dados são anônimos nos gráficos públicos.
          </p>
        </div>
      </div>

      {submittedCount > 0 && (
        <div className="flex items-center gap-3 rounded-lg border-2 border-gold bg-gold/10 p-4">
          <CheckCircle2 className="h-5 w-5 text-gold-deep" />
          <p className="text-sm font-medium text-primary">
            {submittedCount} {submittedCount === 1 ? "registro enviado" : "registros enviados"} nesta sessão.
          </p>
        </div>
      )}

      <form
        onSubmit={handleAdd}
        className="space-y-5 rounded-xl border-2 border-primary bg-card p-6 shadow-blue"
      >
        <h2 className="border-b-2 border-gold pb-2 text-xl font-bold">Novo registro</h2>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Gênero</Label>
            <Select
              value={form.gender}
              onValueChange={(v) => setForm({ ...form, gender: v as "female" | "male" })}
            >
              <SelectTrigger className="border-2 border-input">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="female">Mulher</SelectItem>
                <SelectItem value="male">Homem</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Idade</Label>
            <Input
              type="number"
              min={16}
              max={100}
              value={form.age}
              onChange={(e) => setForm({ ...form, age: e.target.value })}
              required
              className="border-2 border-input focus-visible:border-primary"
            />
          </div>
          <div className="space-y-2">
            <Label>Região</Label>
            <Select value={form.region} onValueChange={(v) => setForm({ ...form, region: v })}>
              <SelectTrigger className="border-2 border-input">
                <SelectValue />
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
          <div className="space-y-2">
            <Label>Salário (R$)</Label>
            <Input
              type="number"
              min={0}
              step="0.01"
              value={form.salary}
              onChange={(e) => setForm({ ...form, salary: e.target.value })}
              required
              className="border-2 border-input focus-visible:border-primary"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Cargo</Label>
            <Input
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              maxLength={80}
              required
              className="border-2 border-input focus-visible:border-primary"
            />
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            type="submit"
            disabled={loading}
            className="flex-1 bg-gradient-gold text-primary font-bold border-2 border-gold-deep shadow-gold hover:opacity-90"
          >
            {loading ? "Enviando..." : "Enviar registro"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate({ to: "/dashboard" })}
            className="border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
          >
            Concluir e ver painel
          </Button>
        </div>
      </form>
    </div>
  );
}
