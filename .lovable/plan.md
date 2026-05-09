## Objetivo

Adicionar, abaixo de cada um dos dois gráficos existentes ("Salário médio — Homens" e "Salário médio — Mulheres"), um novo gráfico de barras inspirado na imagem enviada, mostrando a **diferença salarial de contratação por setor (2023 vs 2025)**, separado por gênero.

## O que será feito

1. Criar um novo componente `SectorGapChart` em `src/components/sector-gap-chart.tsx` com:
   - Barras agrupadas por setor: **Total, Indústria, Agropecuária, Construção, Serviços, Comércio**
   - Duas séries: **2023** (rosa claro / azul claro) e **2025** (vermelho / azul escuro)
   - Rótulos numéricos no topo de cada barra (valores negativos em %)
   - Título dinâmico conforme o gênero ("Homens" ou "Mulheres") e legenda no topo
   - Estilo visual coerente com o design system (bordas, cores em `oklch`, gradiente dourado nos badges)

2. Atualizar `src/components/salary-charts.tsx`:
   - Logo abaixo do `<ChartCard>` de **Homens**, renderizar `<SectorGapChart gender="male" />`
   - Logo abaixo do `<ChartCard>` de **Mulheres**, renderizar `<SectorGapChart gender="female" />`
   - Manter o grid de 2 colunas; os dois novos gráficos ocuparão o espaço em branco abaixo dos atuais

## Dados

Como o banco `salary_entries` ainda não armazena o setor da contratação por ano de comparação, vou usar **dados estáticos ilustrativos** baseados na imagem de referência (mesmos números mostrados: -13,7 / -14,3 no Total, -11,4 / -13,7 em Indústria, etc.) para o gráfico das mulheres, e um conjunto espelhado/positivo de referência para o gráfico dos homens (todos próximos de 0 já que a comparação é em relação ao próprio gênero como base).

> Se preferir, posso em vez disso criar uma migração no banco para guardar esses valores por setor/ano e alimentar os gráficos via Supabase — me avise.

## Detalhes técnicos

- Biblioteca: `recharts` (já em uso) com `BarChart` + `LabelList` para os rótulos numéricos.
- Tokens semânticos do `src/styles.css` para cores (sem hex hardcoded em componentes, exceto a paleta já existente `COLORS_M` / `COLORS_F`).
- Componente puro de apresentação, sem alterações em backend nem em rotas.

## Arquivos

- **Novo:** `src/components/sector-gap-chart.tsx`
- **Editado:** `src/components/salary-charts.tsx` (apenas inserção dos dois novos componentes no grid)
