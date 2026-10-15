import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { ageRange, parseCsvRows, serializeCsv, type CsvRow } from "./csv-utils";

const BUCKET = "questionarios-csv";
const FILE = "respostas_questionario.csv";
const REGIONS = ["Norte", "Nordeste", "Centro-Oeste", "Sudeste", "Sul"];

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

async function readCsv(): Promise<{ rows: CsvRow[]; updatedAt: string | null }> {
  const sb = await admin();
  const { data, error } = await sb.storage.from(BUCKET).download(FILE);
  if (error || !data) {
    // Arquivo ainda não existe
    const msg = String((error as { message?: string } | null)?.message ?? "");
    if (!error || /not found|404|Object not found/i.test(msg) || msg === "{}" || msg === "")
      return { rows: [], updatedAt: null };
    throw new Error("Falha ao ler o arquivo CSV: " + msg);
  }
  const text = await data.text();
  const { data: info } = await sb.storage.from(BUCKET).list("", { search: FILE });
  const meta = info?.find((f) => f.name === FILE);
  return { rows: parseCsvRows(text), updatedAt: meta?.updated_at ?? null };
}

async function writeCsv(rows: CsvRow[]) {
  const sb = await admin();
  const body = new Blob([serializeCsv(rows)], { type: "text/csv;charset=utf-8" });
  const { error } = await sb.storage
    .from(BUCKET)
    .upload(FILE, body, { upsert: true, contentType: "text/csv;charset=utf-8", cacheControl: "0" });
  if (error) throw new Error("Falha ao gravar o arquivo CSV: " + error.message);
}

/** Acrescenta linhas com verificação pós-gravação (proteção contra envios simultâneos). */
async function appendRows(newRows: CsvRow[]) {
  for (let attempt = 0; attempt < 4; attempt++) {
    const { rows } = await readCsv();
    const ids = new Set(rows.map((r) => r.id_resposta));
    const toAdd = newRows.filter((r) => !ids.has(r.id_resposta));
    if (toAdd.length === 0) return { added: 0 };
    await writeCsv([...rows, ...toAdd]);
    const check = await readCsv();
    const after = new Set(check.rows.map((r) => r.id_resposta));
    if (toAdd.every((r) => after.has(r.id_resposta))) return { added: toAdd.length };
    await new Promise((res) => setTimeout(res, 150 + Math.random() * 300));
  }
  throw new Error("Não foi possível confirmar a gravação no CSV. Tente novamente.");
}

const entrySchema = z.object({
  submission_id: z.string().uuid(),
  company_id: z.string().uuid(),
  gender: z.enum(["male", "female"]),
  age: z.number().int().min(16).max(100),
  region: z.enum(REGIONS as [string, ...string[]]),
  role: z.string().trim().min(2).max(80),
  salary: z.number().positive().max(10000000),
  race: z.string().min(1).max(40),
  education: z.string().min(1).max(40),
  experience_years: z.number().int().min(0).max(70),
  hierarchy_level: z.string().min(1).max(40),
  work_modality: z.string().min(1).max(40),
  contract_type: z.string().min(1).max(40),
  weekly_hours: z.number().int().min(1).max(80),
  has_leadership: z.boolean(),
  benefits: z.string().max(500).optional(),
});

async function assertOwnsCompany(
  supabase: { from: (t: "companies") => any },
  companyId: string,
) {
  const { data } = await supabase.from("companies").select("id").eq("id", companyId).maybeSingle();
  if (!data) throw new Error("Empresa não encontrada para este usuário.");
}

export const submitQuestionnaireCsv = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => entrySchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertOwnsCompany(context.supabase, data.company_id);
    const row: CsvRow = {
      id_resposta: data.submission_id,
      data_hora: new Date().toISOString(),
      empresa_id: data.company_id,
      genero: data.gender === "female" ? "Mulher" : "Homem",
      idade: String(data.age),
      faixa_etaria: ageRange(data.age),
      regiao: data.region,
      cargo: data.role,
      salario: data.salary.toFixed(2),
      raca: data.race,
      escolaridade: data.education,
      anos_experiencia: String(data.experience_years),
      nivel_hierarquico: data.hierarchy_level,
      modalidade: data.work_modality,
      tipo_contrato: data.contract_type,
      horas_semanais: String(data.weekly_hours),
      lideranca: data.has_leadership ? "Sim" : "Não",
      beneficios: data.benefits ?? "",
    };
    const res = await appendRows([row]);
    return { ok: true, duplicate: res.added === 0 };
  });

export type CsvStats = {
  total: number;
  updatedAt: string | null;
  byGender: { label: string; count: number; percent: number; avgSalary: number; avgAge: number; avgHours: number }[];
  byAge: { age: string; Homem: number; Mulher: number }[];
  byRegion: { region: string; Homem: number; Mulher: number }[];
  leadership: { label: string; Homem: number; Mulher: number }[];
  gapPercent: number | null;
};

const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);

/** Público: apenas estatísticas agregadas, nunca linhas individuais. */
export const getCsvStats = createServerFn({ method: "GET" }).handler(async (): Promise<CsvStats> => {
  const { rows, updatedAt } = await readCsv();
  const valid = rows.filter(
    (r) => (r.genero === "Homem" || r.genero === "Mulher") && Number(r.salario) > 0,
  );
  const total = valid.length;
  const g = (label: string) => valid.filter((r) => r.genero === label);
  const byGender = ["Homem", "Mulher"].map((label) => {
    const rs = g(label);
    return {
      label,
      count: rs.length,
      percent: total ? (rs.length / total) * 100 : 0,
      avgSalary: avg(rs.map((r) => Number(r.salario))),
      avgAge: avg(rs.map((r) => Number(r.idade))),
      avgHours: avg(rs.map((r) => Number(r.horas_semanais)).filter((n) => n > 0)),
    };
  });
  const avgBy = (filter: (r: CsvRow) => boolean, label: string) =>
    Math.round(avg(valid.filter((r) => r.genero === label && filter(r)).map((r) => Number(r.salario))));
  const byAge = ["18-24", "25-34", "35-44", "45-54", "55+"].map((age) => ({
    age,
    Homem: avgBy((r) => r.faixa_etaria === age, "Homem"),
    Mulher: avgBy((r) => r.faixa_etaria === age, "Mulher"),
  }));
  const byRegion = REGIONS.map((region) => ({
    region,
    Homem: avgBy((r) => r.regiao === region, "Homem"),
    Mulher: avgBy((r) => r.regiao === region, "Mulher"),
  }));
  const pct = (label: string, v: string) => {
    const rs = g(label);
    return rs.length ? Math.round((rs.filter((r) => r.lideranca === v).length / rs.length) * 1000) / 10 : 0;
  };
  const leadership = [
    { label: "Em liderança", Homem: pct("Homem", "Sim"), Mulher: pct("Mulher", "Sim") },
    { label: "Sem liderança", Homem: pct("Homem", "Não"), Mulher: pct("Mulher", "Não") },
  ];
  const [m, f] = byGender;
  const gapPercent = m.count && f.count ? ((m.avgSalary - f.avgSalary) / m.avgSalary) * 100 : null;
  return { total, updatedAt, byGender, byAge, byRegion, leadership, gapPercent };
});

/** Autenticado: baixa somente as linhas da(s) empresa(s) do usuário. */
export const downloadMyCsv = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: companies } = await context.supabase.from("companies").select("id");
    const ids = new Set((companies ?? []).map((c: { id: string }) => c.id));
    const { rows } = await readCsv();
    return { csv: serializeCsv(rows.filter((r) => ids.has(r.empresa_id))) };
  });

/** Autenticado: importa um CSV existente, valida e acrescenta para a empresa do usuário. */
export const importCsv = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ company_id: z.string().uuid(), csv: z.string().max(2_000_000) }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertOwnsCompany(context.supabase, data.company_id);
    const parsed = parseCsvRows(data.csv);
    const errors: string[] = [];
    const ok: CsvRow[] = [];
    const uuid = /^[0-9a-f-]{36}$/i;
    parsed.forEach((r, i) => {
      const age = Number(r.idade);
      const sal = Number(String(r.salario).replace(",", "."));
      if (!(r.genero === "Homem" || r.genero === "Mulher")) return errors.push(`Linha ${i + 2}: gênero inválido`);
      if (!Number.isInteger(age) || age < 16 || age > 100) return errors.push(`Linha ${i + 2}: idade inválida`);
      if (!(sal > 0 && sal <= 10000000)) return errors.push(`Linha ${i + 2}: salário inválido`);
      if (!REGIONS.includes(r.regiao)) return errors.push(`Linha ${i + 2}: região inválida`);
      ok.push({
        ...r,
        id_resposta: uuid.test(r.id_resposta) ? r.id_resposta : crypto.randomUUID(),
        data_hora: r.data_hora || new Date().toISOString(),
        empresa_id: data.company_id,
        faixa_etaria: ageRange(age),
        salario: sal.toFixed(2),
        cargo: r.cargo.slice(0, 80),
        beneficios: r.beneficios.slice(0, 500),
      });
    });
    if (ok.length === 0) throw new Error(errors[0] ?? "Nenhuma linha válida no arquivo.");
    const res = await appendRows(ok);
    return { added: res.added, skipped: ok.length - res.added, invalid: errors.length, errors: errors.slice(0, 5) };
  });
