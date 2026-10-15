// Utilitários CSV compatíveis com Excel / LibreOffice / Google Sheets (UTF-8, RFC 4180)

export const CSV_HEADERS = [
  "id_resposta",
  "data_hora",
  "empresa_id",
  "genero",
  "idade",
  "faixa_etaria",
  "regiao",
  "cargo",
  "salario",
  "raca",
  "escolaridade",
  "anos_experiencia",
  "nivel_hierarquico",
  "modalidade",
  "tipo_contrato",
  "horas_semanais",
  "lideranca",
  "beneficios",
] as const;

export type CsvRow = Record<(typeof CSV_HEADERS)[number], string>;

export function ageRange(age: number) {
  if (age < 25) return "18-24";
  if (age < 35) return "25-34";
  if (age < 45) return "35-44";
  if (age < 55) return "45-54";
  return "55+";
}

function escapeCell(v: string) {
  if (/[",\r\n;]/.test(v)) return `"${v.replace(/"/g, '""')}"`;
  return v;
}

export function serializeCsv(rows: CsvRow[]) {
  const lines = [CSV_HEADERS.join(",")];
  for (const r of rows) lines.push(CSV_HEADERS.map((h) => escapeCell(r[h] ?? "")).join(","));
  return "\uFEFF" + lines.join("\r\n") + "\r\n";
}

export function parseCsvText(text: string): string[][] {
  const src = text.replace(/^\uFEFF/, "");
  const out: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQ = false;
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (inQ) {
      if (c === '"') {
        if (src[i + 1] === '"') {
          cell += '"';
          i++;
        } else inQ = false;
      } else cell += c;
    } else if (c === '"') inQ = true;
    else if (c === ",") {
      row.push(cell);
      cell = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && src[i + 1] === "\n") i++;
      row.push(cell);
      cell = "";
      if (row.some((x) => x !== "")) out.push(row);
      row = [];
    } else cell += c;
  }
  if (cell !== "" || row.length) {
    row.push(cell);
    if (row.some((x) => x !== "")) out.push(row);
  }
  return out;
}

/** Valida cabeçalho e converte em objetos. Lança erro se a estrutura for inválida. */
export function parseCsvRows(text: string): CsvRow[] {
  const table = parseCsvText(text);
  if (table.length === 0) return [];
  const header = table[0].map((h) => h.trim());
  const missing = CSV_HEADERS.filter((h) => !header.includes(h));
  if (missing.length) throw new Error(`CSV inválido: colunas ausentes (${missing.join(", ")})`);
  return table.slice(1).map((cells) => {
    const r = {} as CsvRow;
    CSV_HEADERS.forEach((h) => (r[h] = (cells[header.indexOf(h)] ?? "").trim()));
    return r;
  });
}
