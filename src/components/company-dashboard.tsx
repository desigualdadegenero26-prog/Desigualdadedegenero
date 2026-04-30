import { useEffect, useState } from "react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Trash2, Users, TrendingUp, Wallet } from "lucide-react";

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
  cnpj: string;
  sector: string;
  size: string;
  region: string;
};

type Entry = {
  id: string;
  gender: string;
  age: number;
  region: string;
  role: string;
  salary: number;
  created_at: string;
};

export function CompanyDashboard({ company }: { company: Company }) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [form, setForm] = useState({
    gender: "female" as "female" | "male",
    age: "",
    region: company.region,
    role: "",
    salary: "",
  });
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const { data } = await supabase
      .from("salary_entries")
      .select("*")
      .eq("company_id", company.id)
      .order("created_at", { ascending: false });
    if (data) setEntries(data as Entry[]);
  };

  useEffect(() => {
    load();
  }, [company.id]);

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
    toast.success("Registro adicionado!");
    setForm({ ...form, age: "", role: "", salary: "" });
    load();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("salary_entries").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Removido");
    load();
  };

  const total = entries.length;
  const avgF =
    entries.filter((e) => e.gender === "female").reduce((a, b) => a + Number(b.salary), 0) /
      Math.max(1, entries.filter((e) => e.gender === "female").length) || 0;
  const avgM =
    entries.filter((e) => e.gender === "male").reduce((a, b) => a + Number(b.salary), 0) /
      Math.max(1, entries.filter((e) => e.gender === "male").length) || 0;
  const gap = avgM > 0 ? ((avgM - avgF) / avgM) * 100 : 0;

  return (
    <div className="space-y-8">
      <div className="rounded-xl border-2 border-primary bg-gradient-blue p-6 text-primary-foreground shadow-blue">
        <p className="text-xs uppercase tracking-wider text-gold">Painel privado</p>
        <h1 className="mt-1 text-3xl font-bold text-primary-foreground">{company.name}</h1>
        <p className="mt-1 text-sm opacity-90">
          {company.sector} · {company.size} funcionários · {company.region} · CNPJ {company.cnpj}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard icon={Users} label="Registros enviados" value={total.toString()} />
        <StatCard
          icon={Wallet}
          label="Salário médio (M / F)"
          value={`R$ ${avgM.toFixed(0)} / R$ ${avgF.toFixed(0)}`}
        />
        <StatCard
          icon={TrendingUp}
          label="Diferença salarial"
          value={`${gap.toFixed(1)}%`}
          highlight={gap > 0}
        />
      </div>

      <div className="rounded-xl border-2 border-primary bg-card p-6 shadow-blue">
        <h2 className="mb-4 border-b-2 border-gold pb-2 text-xl font-bold">
          Adicionar registro ao questionário
        </h2>
        <form onSubmit={handleAdd} className="grid gap-4 md:grid-cols-6">
          <div className="space-y-2 md:col-span-1">
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
          <div className="space-y-2 md:col-span-1">
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
          <div className="space-y-2 md:col-span-1">
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
          <div className="space-y-2 md:col-span-1">
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
          <Button
            type="submit"
            disabled={loading}
            className="md:col-span-6 bg-gradient-gold text-primary font-bold border-2 border-gold-deep shadow-gold hover:opacity-90"
          >
            {loading ? "Salvando..." : "Adicionar ao questionário"}
          </Button>
        </form>
      </div>

      <div className="rounded-xl border-2 border-primary bg-card p-6 shadow-blue">
        <h2 className="mb-4 border-b-2 border-gold pb-2 text-xl font-bold">
          Seus registros ({entries.length})
        </h2>
        {entries.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Nenhum registro ainda. Use o formulário acima para começar.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b-2 border-primary">
                  <TableHead>Gênero</TableHead>
                  <TableHead>Idade</TableHead>
                  <TableHead>Região</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Salário</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="font-medium">
                      {e.gender === "female" ? "Mulher" : "Homem"}
                    </TableCell>
                    <TableCell>{e.age}</TableCell>
                    <TableCell>{e.region}</TableCell>
                    <TableCell>{e.role}</TableCell>
                    <TableCell>
                      R$ {Number(e.salary).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(e.id)}
                        aria-label="Remover"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  highlight,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-xl border-2 border-primary bg-card p-5 shadow-blue">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-blue">
          <Icon className="h-5 w-5 text-gold" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
          <p className={`text-xl font-bold ${highlight ? "text-gold-deep" : "text-primary"}`}>
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}
