import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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
import { useServerFn } from "@tanstack/react-start";
import { submitQuestionnaireCsv } from "@/lib/csv-questionario.functions";

const REGIONS = ["Norte", "Nordeste", "Centro-Oeste", "Sudeste", "Sul"];
const RACES = ["Branca", "Preta", "Parda", "Amarela", "Indígena", "Prefiro não informar"];
const EDUCATIONS = [
  "Fundamental",
  "Médio",
  "Técnico",
  "Superior incompleto",
  "Superior completo",
  "Pós-graduação",
  "Mestrado",
  "Doutorado",
];
const HIERARCHY = ["Estágio", "Júnior", "Pleno", "Sênior", "Coordenação", "Gerência", "Diretoria"];
const MODALITIES = ["Presencial", "Híbrido", "Remoto"];
const CONTRACTS = ["CLT", "PJ", "Estágio", "Temporário", "Terceirizado"];

const entrySchema = z.object({
  gender: z.enum(["male", "female"]),
  age: z.number().int().min(16).max(100),
  region: z.string().min(1),
  role: z.string().trim().min(2).max(80),
  salary: z.number().positive().max(10000000),
  race: z.string().min(1, "Informe a raça/cor"),
  education: z.string().min(1, "Informe a escolaridade"),
  experience_years: z.number().int().min(0).max(70),
  hierarchy_level: z.string().min(1, "Informe o nível"),
  work_modality: z.string().min(1, "Informe a modalidade"),
  contract_type: z.string().min(1, "Informe o tipo de contrato"),
  weekly_hours: z.number().int().min(1).max(80),
  has_leadership: z.boolean(),
  benefits: z.string().max(500).optional(),
});

type Company = {
  id: string;
  name: string;
  region: string;
};

const initialForm = (region: string) => ({
  gender: "female" as "female" | "male",
  age: "",
  region,
  role: "",
  salary: "",
  race: "",
  education: "",
  experience_years: "",
  hierarchy_level: "",
  work_modality: "",
  contract_type: "",
  weekly_hours: "40",
  has_leadership: false,
  benefits: "",
});

export function QuestionnaireForm({ company }: { company: Company }) {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm(company.region));
  const [loading, setLoading] = useState(false);
  const [submittedCount, setSubmittedCount] = useState(0);
  const [submissionId, setSubmissionId] = useState(() => crypto.randomUUID());
  const submitCsv = useServerFn(submitQuestionnaireCsv);

  const update = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = entrySchema.safeParse({
      gender: form.gender,
      age: Number(form.age),
      region: form.region,
      role: form.role,
      salary: Number(form.salary),
      race: form.race,
      education: form.education,
      experience_years: Number(form.experience_years),
      hierarchy_level: form.hierarchy_level,
      work_modality: form.work_modality,
      contract_type: form.contract_type,
      weekly_hours: Number(form.weekly_hours),
      has_leadership: form.has_leadership,
      benefits: form.benefits || undefined,
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    try {
      const res = await submitCsv({
        data: { ...parsed.data, company_id: company.id, submission_id: submissionId },
      });
      if (!res.duplicate) {
        // Mantém o painel da empresa funcionando
        await supabase.from("salary_entries").insert({ ...parsed.data, company_id: company.id });
      }
      window.dispatchEvent(new Event("csv-updated"));
      toast.success(res.duplicate ? "Este registro já havia sido enviado." : "Registro salvo no arquivo CSV!");
      setSubmittedCount((c) => c + (res.duplicate ? 0 : 1));
      setForm(initialForm(company.region));
      setSubmissionId(crypto.randomUUID());
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao salvar o registro.");
    } finally {
      setLoading(false);
    }
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
            Preencha um registro por funcionário. Os dados aparecem de forma anônima nos gráficos públicos.
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
        className="space-y-8 rounded-xl border-2 border-primary bg-card p-6 shadow-blue"
      >
        {/* Seção 1 — Perfil pessoal */}
        <section className="space-y-5">
          <h2 className="border-b-2 border-gold pb-2 text-xl font-bold">1. Perfil pessoal</h2>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Gênero</Label>
              <Select
                value={form.gender}
                onValueChange={(v) => update("gender", v as "female" | "male")}
              >
                <SelectTrigger className="border-2 border-input"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="female">Mulher</SelectItem>
                  <SelectItem value="male">Homem</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Raça / Cor</Label>
              <Select value={form.race} onValueChange={(v) => update("race", v)}>
                <SelectTrigger className="border-2 border-input"><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {RACES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Idade</Label>
              <Input type="number" min={16} max={100} value={form.age}
                onChange={(e) => update("age", e.target.value)} required
                className="border-2 border-input focus-visible:border-primary" />
            </div>
            <div className="space-y-2">
              <Label>Região onde trabalha</Label>
              <Select value={form.region} onValueChange={(v) => update("region", v)}>
                <SelectTrigger className="border-2 border-input"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {REGIONS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        {/* Seção 2 — Formação e experiência */}
        <section className="space-y-5">
          <h2 className="border-b-2 border-gold pb-2 text-xl font-bold">2. Formação e experiência</h2>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Escolaridade</Label>
              <Select value={form.education} onValueChange={(v) => update("education", v)}>
                <SelectTrigger className="border-2 border-input"><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {EDUCATIONS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Anos de experiência na área</Label>
              <Input type="number" min={0} max={70} value={form.experience_years}
                onChange={(e) => update("experience_years", e.target.value)} required
                className="border-2 border-input focus-visible:border-primary" />
            </div>
          </div>
        </section>

        {/* Seção 3 — Cargo e contrato */}
        <section className="space-y-5">
          <h2 className="border-b-2 border-gold pb-2 text-xl font-bold">3. Cargo e contrato</h2>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label>Cargo</Label>
              <Input value={form.role} onChange={(e) => update("role", e.target.value)}
                maxLength={80} required placeholder="Ex.: Analista de Marketing"
                className="border-2 border-input focus-visible:border-primary" />
            </div>
            <div className="space-y-2">
              <Label>Nível hierárquico</Label>
              <Select value={form.hierarchy_level} onValueChange={(v) => update("hierarchy_level", v)}>
                <SelectTrigger className="border-2 border-input"><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {HIERARCHY.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tipo de contrato</Label>
              <Select value={form.contract_type} onValueChange={(v) => update("contract_type", v)}>
                <SelectTrigger className="border-2 border-input"><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {CONTRACTS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Modalidade</Label>
              <Select value={form.work_modality} onValueChange={(v) => update("work_modality", v)}>
                <SelectTrigger className="border-2 border-input"><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {MODALITIES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Carga horária semanal</Label>
              <Input type="number" min={1} max={80} value={form.weekly_hours}
                onChange={(e) => update("weekly_hours", e.target.value)} required
                className="border-2 border-input focus-visible:border-primary" />
            </div>
            <div className="flex items-center gap-3 md:col-span-2 rounded-lg border-2 border-input p-3">
              <Checkbox
                id="leadership"
                checked={form.has_leadership}
                onCheckedChange={(v) => update("has_leadership", Boolean(v))}
              />
              <Label htmlFor="leadership" className="cursor-pointer">
                Exerce cargo de liderança / gestão de pessoas
              </Label>
            </div>
          </div>
        </section>

        {/* Seção 4 — Remuneração */}
        <section className="space-y-5">
          <h2 className="border-b-2 border-gold pb-2 text-xl font-bold">4. Remuneração</h2>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Salário bruto mensal (R$)</Label>
              <Input type="number" min={0} step="0.01" value={form.salary}
                onChange={(e) => update("salary", e.target.value)} required
                placeholder="Ex.: 5500.00"
                className="border-2 border-input focus-visible:border-primary" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Benefícios oferecidos (opcional)</Label>
              <Textarea
                value={form.benefits}
                onChange={(e) => update("benefits", e.target.value)}
                maxLength={500}
                placeholder="Ex.: Vale-refeição, plano de saúde, bônus anual, home office..."
                className="border-2 border-input focus-visible:border-primary"
              />
            </div>
          </div>
        </section>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button type="submit" disabled={loading}
            className="flex-1 bg-gradient-gold text-primary font-bold border-2 border-gold-deep shadow-gold hover:opacity-90">
            {loading ? "Enviando..." : "Enviar registro"}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate({ to: "/dashboard" })}
            className="border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground">
            Concluir e ver painel
          </Button>
        </div>
      </form>
    </div>
  );
}
