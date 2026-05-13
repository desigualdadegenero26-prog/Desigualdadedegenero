import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

const FACTORS = [
  "Preconceito de gênero",
  "Maternidade",
  "Falta de oportunidades",
  "Diferença de cargos",
];
const SECTORS = ["Tecnologia", "Indústria", "Comércio", "Saúde", "Educação"];

type FormState = {
  equal_pay_brazil: string;
  inequality_is_problem: string;
  witnessed_inequality: string;
  inequality_factors: string[];
  inequality_factors_other: string;
  same_growth_opportunities: string;
  salary_transparency: string;
  maternity_impact: string;
  public_policies: string;
  most_unequal_sector: string;
  most_unequal_sector_other: string;
  should_receive_equal: string;
};

const initial: FormState = {
  equal_pay_brazil: "",
  inequality_is_problem: "",
  witnessed_inequality: "",
  inequality_factors: [],
  inequality_factors_other: "",
  same_growth_opportunities: "",
  salary_transparency: "",
  maternity_impact: "",
  public_policies: "",
  most_unequal_sector: "",
  most_unequal_sector_other: "",
  should_receive_equal: "",
};

export function OpinionSurveyForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>(initial);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const toggleFactor = (factor: string, checked: boolean) => {
    setForm((f) => ({
      ...f,
      inequality_factors: checked
        ? [...f.inequality_factors, factor]
        : f.inequality_factors.filter((x) => x !== factor),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const required: (keyof FormState)[] = [
      "equal_pay_brazil",
      "inequality_is_problem",
      "witnessed_inequality",
      "same_growth_opportunities",
      "salary_transparency",
      "maternity_impact",
      "public_policies",
      "most_unequal_sector",
      "should_receive_equal",
    ];
    for (const k of required) {
      if (!form[k]) {
        toast.error("Responda todas as perguntas antes de enviar.");
        return;
      }
    }
    setLoading(true);
    const { error } = await supabase.from("opinion_responses").insert({
      equal_pay_brazil: form.equal_pay_brazil,
      inequality_is_problem: form.inequality_is_problem,
      witnessed_inequality: form.witnessed_inequality,
      inequality_factors: form.inequality_factors,
      inequality_factors_other: form.inequality_factors_other || null,
      same_growth_opportunities: form.same_growth_opportunities,
      salary_transparency: form.salary_transparency,
      maternity_impact: form.maternity_impact,
      public_policies: form.public_policies,
      most_unequal_sector: form.most_unequal_sector,
      most_unequal_sector_other: form.most_unequal_sector_other || null,
      should_receive_equal: form.should_receive_equal,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Obrigado por participar!");
    setDone(true);
    setForm(initial);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate({ to: "/" })}
          className="mb-3 text-primary hover:bg-primary/10"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        <div className="rounded-xl border-2 border-primary bg-gradient-blue p-6 text-primary-foreground shadow-blue">
          <p className="text-xs uppercase tracking-wider text-gold">Pesquisa de opinião</p>
          <h1 className="mt-1 text-3xl font-bold text-gold">Desigualdade salarial no Brasil</h1>
          <p className="mt-1 text-sm opacity-90">
            Sua opinião é anônima e ajuda a entender a percepção da população sobre o tema.
          </p>
        </div>
      </div>

      {done && (
        <div className="flex items-center gap-3 rounded-lg border-2 border-gold bg-gold/10 p-4">
          <CheckCircle2 className="h-5 w-5 text-gold-deep" />
          <p className="text-sm font-medium text-primary">
            Resposta registrada. Você pode responder novamente se quiser.
          </p>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-8 rounded-xl border-2 border-primary bg-card p-6 shadow-blue"
      >
        <Question
          label="1. Você acredita que homens e mulheres recebem salários iguais para exercer a mesma função no Brasil?"
          value={form.equal_pay_brazil}
          onChange={(v) => set("equal_pay_brazil", v)}
          options={["Sim", "Não", "Não sei opinar"]}
        />
        <Question
          label="2. Na sua opinião, a desigualdade salarial entre homens e mulheres é um problema no mercado de trabalho brasileiro?"
          value={form.inequality_is_problem}
          onChange={(v) => set("inequality_is_problem", v)}
          options={["Sim", "Não", "Parcialmente"]}
        />
        <Question
          label="3. Você já presenciou ou teve conhecimento de casos de diferença salarial entre homens e mulheres na mesma empresa?"
          value={form.witnessed_inequality}
          onChange={(v) => set("witnessed_inequality", v)}
          options={["Sim", "Não"]}
        />

        <div className="space-y-3">
          <Label className="text-base font-semibold text-primary">
            4. Quais fatores você acredita que mais contribuem para a desigualdade salarial feminina? (selecione um ou mais)
          </Label>
          <div className="space-y-2">
            {FACTORS.map((f) => (
              <div key={f} className="flex items-center gap-3 rounded-lg border-2 border-input p-3">
                <Checkbox
                  id={`factor-${f}`}
                  checked={form.inequality_factors.includes(f)}
                  onCheckedChange={(v) => toggleFactor(f, Boolean(v))}
                />
                <Label htmlFor={`factor-${f}`} className="cursor-pointer font-normal">
                  {f}
                </Label>
              </div>
            ))}
            <Input
              placeholder="Outros (opcional)"
              value={form.inequality_factors_other}
              onChange={(e) => set("inequality_factors_other", e.target.value)}
              maxLength={200}
              className="border-2 border-input"
            />
          </div>
        </div>

        <Question
          label="5. Você acredita que mulheres têm as mesmas oportunidades de crescimento profissional que os homens?"
          value={form.same_growth_opportunities}
          onChange={(v) => set("same_growth_opportunities", v)}
          options={["Sim", "Não", "Em algumas áreas apenas"]}
        />
        <Question
          label="6. Na sua opinião, empresas deveriam divulgar informações salariais de forma mais transparente?"
          value={form.salary_transparency}
          onChange={(v) => set("salary_transparency", v)}
          options={["Sim", "Não", "Talvez"]}
        />
        <Question
          label="7. Você acha que a maternidade influencia negativamente os salários e promoções das mulheres?"
          value={form.maternity_impact}
          onChange={(v) => set("maternity_impact", v)}
          options={["Sim", "Não", "Não sei"]}
        />
        <Question
          label="8. Você considera importante a criação de políticas públicas para reduzir a desigualdade salarial?"
          value={form.public_policies}
          onChange={(v) => set("public_policies", v)}
          options={["Sim", "Não"]}
        />

        <div className="space-y-3">
          <Question
            label="9. Em qual setor você acredita que a desigualdade salarial é mais evidente?"
            value={form.most_unequal_sector}
            onChange={(v) => set("most_unequal_sector", v)}
            options={SECTORS}
          />
          <Input
            placeholder="Outros (opcional)"
            value={form.most_unequal_sector_other}
            onChange={(e) => set("most_unequal_sector_other", e.target.value)}
            maxLength={200}
            className="border-2 border-input"
          />
        </div>

        <Question
          label="10. Você acredita que homens e mulheres devem receber o mesmo salário ao exercer a mesma função?"
          value={form.should_receive_equal}
          onChange={(v) => set("should_receive_equal", v)}
          options={["Sim", "Não", "Depende da situação"]}
        />

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            type="submit"
            disabled={loading}
            className="flex-1 bg-gradient-gold text-primary font-bold border-2 border-gold-deep shadow-gold hover:opacity-90"
          >
            {loading ? "Enviando..." : "Enviar respostas"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate({ to: "/" })}
            className="border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
          >
            Voltar para a página inicial
          </Button>
        </div>
      </form>
    </div>
  );
}

function Question({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div className="space-y-3">
      <Label className="text-base font-semibold text-primary">{label}</Label>
      <RadioGroup value={value} onValueChange={onChange} className="space-y-2">
        {options.map((opt) => {
          const id = `${label.slice(0, 8)}-${opt}`;
          return (
            <div key={opt} className="flex items-center gap-3 rounded-lg border-2 border-input p-3">
              <RadioGroupItem id={id} value={opt} />
              <Label htmlFor={id} className="cursor-pointer font-normal">
                {opt}
              </Label>
            </div>
          );
        })}
      </RadioGroup>
    </div>
  );
}
