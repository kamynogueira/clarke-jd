import { useState, useRef, useEffect } from "react";
import { Document, Packer, Paragraph, TextRun, ImageRun, AlignmentType, BorderStyle } from "docx";
import { saveAs } from "file-saver";

/* ─── Google Fonts ─── */
const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href = "https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;700;800&display=swap";
document.head.appendChild(fontLink);

/* ─── Foton DS Tokens ─── */
const T = {
  green600: "#19E58A",
  green500: "#00DF7C",
  green100: "#E6F9DC",
  gray900:  "#222222",
  gray800:  "#2E2E2E",
  gray600:  "#595959",
  gray500:  "#818181",
  gray400:  "#9C9C9B",
  gray300:  "#C5C5C5",
  gray200:  "#E8E8E8",
  gray100:  "#F2F2F2",
  gray50:   "#FAFAFA",
  white:    "#FFFFFF",
  shadow:   "1px 1px 4px 0px rgba(34,34,34,0.15)",
  radiusSm: "10px",
  radiusMd: "20px",
  radiusPill: "1000px",
  transitionFast: "150ms ease",
  transitionBase: "200ms ease",
};

/* ─── Shared styles ─── */
const base = {
  fontFamily: "'Poppins', sans-serif",
  color: T.gray900,
};

const s = {
  wrap: { ...base, background: T.gray100, minHeight: "100vh" },

  // Header
  header: {
    background: T.gray900,
    padding: "14px 24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  logoText: {
    color: T.green500,
    fontWeight: 800,
    fontSize: 18,
    letterSpacing: "-0.3px",
  },
  headerSub: { color: T.gray400, fontSize: 12, fontWeight: 400 },

  // Page wrapper
  body: { maxWidth: 640, margin: "0 auto", padding: "32px 16px" },

  // Card
  card: {
    background: T.gray50,
    borderRadius: T.radiusMd,
    padding: 28,
    boxShadow: T.shadow,
    marginBottom: 16,
  },

  // Section label
  sectionLabel: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    background: T.green100,
    color: T.green500,
    borderRadius: T.radiusPill,
    padding: "3px 12px",
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.5px",
    textTransform: "uppercase",
    marginBottom: 10,
  },

  // Heading
  h2: { fontSize: 22, fontWeight: 800, color: T.gray900, margin: "0 0 6px" },
  h3: { fontSize: 17, fontWeight: 700, color: T.gray900, margin: "0 0 14px" },
  body: { fontSize: 14, color: T.gray600, lineHeight: 1.6, margin: 0 },

  // Inputs
  input: {
    width: "100%",
    border: `1.5px solid transparent`,
    borderRadius: T.radiusPill,
    padding: "10px 16px",
    fontSize: 14,
    fontFamily: "'Poppins', sans-serif",
    background: T.gray100,
    color: T.gray900,
    outline: "none",
    boxSizing: "border-box",
    transition: `border-color ${T.transitionFast}`,
  },
  textarea: {
    width: "100%",
    border: `1.5px solid transparent`,
    borderRadius: T.radiusSm,
    padding: "10px 14px",
    fontSize: 13,
    fontFamily: "'Poppins', sans-serif",
    background: T.gray100,
    color: T.gray900,
    outline: "none",
    resize: "vertical",
    minHeight: 80,
    boxSizing: "border-box",
    transition: `border-color ${T.transitionFast}`,
  },
  label: {
    display: "block",
    fontSize: 12,
    fontWeight: 700,
    color: T.gray900,
    marginBottom: 6,
  },
  labelNum: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    background: T.green100,
    color: T.green500,
    borderRadius: T.radiusPill,
    fontSize: 10,
    fontWeight: 700,
    width: 20,
    height: 20,
    marginRight: 6,
    flexShrink: 0,
  },

  // Buttons
  btnPrimary: {
    background: T.green600,
    color: T.gray900,
    border: "none",
    borderRadius: T.radiusPill,
    padding: "11px 24px",
    fontWeight: 700,
    fontSize: 14,
    fontFamily: "'Poppins', sans-serif",
    cursor: "pointer",
    width: "100%",
    transition: `background-color ${T.transitionFast}`,
  },
  btnSecondary: {
    background: T.gray200,
    color: T.gray900,
    border: "none",
    borderRadius: T.radiusPill,
    padding: "10px 20px",
    fontWeight: 700,
    fontSize: 13,
    fontFamily: "'Poppins', sans-serif",
    cursor: "pointer",
    transition: `background-color ${T.transitionFast}`,
  },
  btnDark: {
    background: T.gray900,
    color: T.white,
    border: "none",
    borderRadius: T.radiusPill,
    padding: "11px 24px",
    fontWeight: 700,
    fontSize: 14,
    fontFamily: "'Poppins', sans-serif",
    cursor: "pointer",
    width: "100%",
    transition: `background-color ${T.transitionFast}`,
  },

  // Area selector button
  areaBtn: (sel) => ({
    background: sel ? T.green600 : T.white,
    color: sel ? T.gray900 : T.gray900,
    border: `1.5px solid ${sel ? T.green600 : T.gray300}`,
    borderRadius: T.radiusSm,
    padding: "12px 16px",
    textAlign: "left",
    cursor: "pointer",
    fontWeight: sel ? 700 : 400,
    fontSize: 14,
    fontFamily: "'Poppins', sans-serif",
    width: "100%",
    transition: `all ${T.transitionFast}`,
    marginBottom: 8,
  }),

  // Progress bar
  progressTrack: {
    background: T.gray200,
    borderRadius: T.radiusPill,
    height: 6,
    marginBottom: 20,
  },
  progressFill: (pct) => ({
    background: T.green500,
    borderRadius: T.radiusPill,
    height: 6,
    width: `${pct}%`,
    transition: `width ${T.transitionBase}`,
  }),

  // Preview section
  previewSection: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottom: `0.5px solid ${T.gray200}`,
  },
  previewTitle: {
    fontWeight: 700,
    fontSize: 12,
    color: T.gray900,
    borderBottom: `2px solid ${T.green500}`,
    paddingBottom: 4,
    marginBottom: 8,
  },
  previewText: {
    fontSize: 13,
    color: T.gray600,
    lineHeight: 1.7,
    whiteSpace: "pre-line",
  },
};

/* ─── Constants ─── */
const AREAS = [
  "Gente & Gestão","Financeiro","Gestão de Clientes",
  "Comercial","Marketing & Parcerias","Produto & Tecnologia",
];

const BLOCOS = [
  { id: "desafios", titulo: "Desafios da Vaga", emoji: "🚀", perguntas: [
    { id: "d1", label: "Em uma frase, qual é o grande problema ou oportunidade que essa pessoa vai endereçar na Clarke?" },
    { id: "d2", label: "Quais são os 2 ou 3 principais desafios do dia a dia dessa vaga?" },
    { id: "d3", label: "O que torna essa vaga única ou especialmente relevante para a Clarke agora?" },
  ]},
  { id: "responsabilidades", titulo: "Responsabilidades", emoji: "📋", perguntas: [
    { id: "r1", label: "Quais são as principais atividades do dia a dia dessa pessoa? Liste pelo menos 4." },
    { id: "r2", label: "Com quais times ou áreas ela vai interagir com mais frequência?" },
    { id: "r3", label: "Quais métricas ou resultados essa pessoa será diretamente responsável por entregar?" },
  ]},
  { id: "senioridade", titulo: "Nível de Senioridade", emoji: "📊", perguntas: [
    { id: "s1", label: "Qual nível você espera para essa vaga?" },
    { id: "s2", label: "Quantos anos de experiência relevante essa pessoa precisa ter?" },
    { id: "s3", label: "Essa pessoa vai atuar de forma mais autônoma ou com suporte próximo de um gestor?" },
  ]},
  { id: "requisitos", titulo: "Requisitos", emoji: "🔒", perguntas: [
    { id: "req1", label: "Quais conhecimentos ou habilidades técnicas são absolutamente inegociáveis?" },
    { id: "req2", label: "Existe algum requisito de localização, disponibilidade para viagens ou modelo de trabalho?" },
    { id: "req3", label: "Há formação acadêmica ou certificação obrigatória?" },
  ]},
  { id: "diferenciais", titulo: "Diferenciais", emoji: "⭐", perguntas: [
    { id: "dif1", label: "O que faria você preferir um candidato a outro, mesmo que ambos atendam os requisitos mínimos?" },
    { id: "dif2", label: "Existe alguma experiência prévia que seria um grande diferencial?" },
    { id: "dif3", label: "Há alguma habilidade comportamental essencial para ter sucesso nessa vaga?" },
  ]},
];

const INTRO = `A Clarke nasceu para empoderar os consumidores de energia elétrica. Acreditamos que conhecimento é poder, e queremos oferecer autonomia e liberdade para nossos clientes. Por isso, damos a eles a possibilidade de comprar energia limpa e mais barata no mercado livre de energia elétrica.\n\nOs nossos desafios de produto, processos, ferramentas e comunicação são constantes e precisamos de um time brilhante e comprometido para permitir crescimento acelerado e constante.`;

const CLARKE_CONTEXT = `
CONTEXTO CLARKE ENERGIA 2026:
- Estratégia: evoluir de gestora para hub de soluções de energia
- Pilares: Crescimento em Vendas, Tombamento Atacadista, Retenção e Encantamento de Clientes, Ativação de Carteira, Novos Produtos (GD Solar, ACL BT, SVA)
- Metas: NPS acima de 85, crescimento de receita, expansão de produtos
- Cultura: humana, direta, consultiva, orientada a dados, sem jargões corporativos
- Tom: leveza + autoridade, simples mas com profundidade
`;

const BENCHMARKS = {
  "Comercial": `BENCHMARKS — COMERCIAL (energia, SaaS B2B): Requisitos comuns: vendas consultivas B2B, CRM, prospecção ativa. Diferenciais: mercado livre de energia, ciclos de venda longos, network industrial. Pleno: 2-4 anos, metas individuais. Sênior: 4-7 anos, contas estratégicas. Erros comuns: requisitos genéricos, sem ticket médio, sem definir hunter/farmer. Tendência: letramento em dados e análises de economia ao cliente.`,
  "Gestão de Clientes": `BENCHMARKS — CS/GESTÃO DE CLIENTES (energia, SaaS B2B): Requisitos: CS ou Account Management B2B, capacidade analítica, comunicação empática. Diferenciais: churn prevention, ferramentas de CS, background em energia. Pleno: 2-4 anos, carteira de 40-80 clientes. Sênior: 4-7 anos, contas VIP, QBRs. Métricas: NPS, churn, NRR, tempo de resposta. Erros: confundir CS com suporte, não definir tamanho da carteira. Tendência: CS consultivo com dados.`,
  "Produto & Tecnologia": `BENCHMARKS — PRODUTO & TECH (energytechs, SaaS): Produto: discovery, roadmap, métricas (DAU, retention). Tech: React, Node/Python, APIs, testes. Diferenciais: domínios regulados, traduzir complexidade técnica. Pleno Dev: 3-5 anos, features autônomas. Sênior Dev: 5-8 anos, referência técnica. Erros: lista de tecnologias longa, stack não especificado. Tendência: "product engineers" que entendem negócio + tech.`,
  "Gente & Gestão": `BENCHMARKS — GENTE & GESTÃO (startups, scale-ups): Requisitos: recrutamento técnico e comportamental, People Analytics. Diferenciais: empresas de tech ou energia, ATS, psicologia. Pleno: 2-4 anos, processos seletivos autônomos. Sênior: 4-7 anos, estruturação de People, HRBP. Erros: volume de vagas não especificado, requisitos acadêmicos restritivos. Tendência: profissionais de People orientados a dados com visão de negócio.`,
  "Financeiro": `BENCHMARKS — FINANCEIRO (energytechs, scale-ups): Requisitos: Excel avançado, fechamento contábil, FP&A, regulações. Diferenciais: energia ou utilities, CCEE, BI. Pleno: 2-4 anos, rotinas financeiras. Sênior: 4-7 anos, processos financeiros, auditoria. Erros: não definir se operacional ou analítico, formação rígida demais. Tendência: entender modelo de negócio de gestão de energia.`,
  "Marketing & Parcerias": `BENCHMARKS — MARKETING & PARCERIAS (B2B, energytechs): Requisitos: marketing B2B, automação (RD Station, HubSpot), métricas (CAC, LTV). Diferenciais: mercados técnicos, conteúdo educativo complexo. Pleno: 2-4 anos, campanhas autônomas. Sênior: 4-7 anos, geração de demanda, budget. Erros: B2B vs B2C, canal principal não especificado. Tendência: equilibrar educação de mercado + geração de leads.`,
};

function buildJDPrompt(area, nomeVaga, respostas) {
  const r = (b, p) => respostas[b]?.[p] || "";
  return `Você é analista sênior de Gente & Gestão da Clarke Energia. Sua tarefa é transformar as respostas brutas de um gestor em um Job Description completo, descritivo e atrativo para divulgação.

CONTEXTO DA CLARKE:
A Clarke é uma EnergyTech que empodера empresas no mercado livre de energia. Cultura jovem, consultiva, orientada a dados, com atendimento como principal ativo estratégico.

VAGA: ${nomeVaga} | ÁREA: ${area}

RESPOSTAS DO GESTOR:
Problema/oportunidade central: ${r("desafios","d1")}
Principais desafios do dia a dia: ${r("desafios","d2")}
Por que essa vaga é relevante agora: ${r("desafios","d3")}
Atividades principais: ${r("responsabilidades","r1")}
Times com quem vai interagir: ${r("responsabilidades","r2")}
Métricas e resultados esperados: ${r("responsabilidades","r3")}
Nível: ${r("senioridade","s1")}
Anos de experiência: ${r("senioridade","s2")}
Autonomia: ${r("senioridade","s3")}
Requisitos técnicos inegociáveis: ${r("requisitos","req1")}
Localização/modelo de trabalho: ${r("requisitos","req2")}
Formação obrigatória: ${r("requisitos","req3")}
O que diferencia candidatos: ${r("diferenciais","dif1")}
Experiência prévia ideal: ${r("diferenciais","dif2")}
Habilidade comportamental essencial: ${r("diferenciais","dif3")}

INSTRUÇÕES DE ESCRITA:

1. DESAFIOS: Escreva 2 a 3 parágrafos corridos descrevendo os desafios da vaga no contexto da Clarke. Use as respostas do gestor como base, mas enriqueça com a estratégia da empresa (crescimento acelerado, novos produtos, retenção de clientes, tombamento atacadista). O texto deve explicar o momento da Clarke, por que essa vaga existe agora e qual o impacto esperado. Tom descritivo e inspirador, na terceira pessoa. Mínimo 80 palavras.

2. RESPONSABILIDADES: Transforme tudo em lista de tópicos com verbo de ação no infinitivo. Mesmo que o gestor tenha escrito em parágrafo, identifique cada atividade e separe em itens. Inclua as métricas mencionadas como parte dos tópicos. Mínimo 6 itens.

3. SENIORIDADE: Uma frase clara com nível + anos de experiência + perfil de autonomia esperado. Ex: "Pleno — Buscamos alguém com 3 a 5 anos de experiência que consiga atuar com autonomia no dia a dia, tomando iniciativa sem esperar por direcionamento constante."

4. REQUISITOS: Lista de tópicos, um por linha, começando com "- ". Separe cada requisito em item próprio mesmo que o gestor tenha listado vários juntos. Inclua localização/modelo de trabalho e formação como itens separados. Mínimo 5 itens.

5. DIFERENCIAIS: Lista de tópicos, um por linha, começando com "- ". Expanda cada diferencial com uma frase descritiva, não apenas uma palavra. Mínimo 4 itens.

Responda APENAS com JSON válido, sem texto antes ou depois, sem markdown:
{"desafios":"parágrafo 1\\n\\nparágrafo 2\\n\\nparágrafo 3","responsabilidades":"- item 1\\n- item 2\\n- item 3\\n- item 4\\n- item 5\\n- item 6","senioridade":"Nível — descrição completa","requisitos":"- item 1\\n- item 2\\n- item 3\\n- item 4\\n- item 5","diferenciais":"- item 1\\n- item 2\\n- item 3\\n- item 4"}`;
}

function buildKickoffSystem(area, nomeVaga, jd) {
  const bm = BENCHMARKS[area] || "";
  return `Você é analista sênior de Gente & Gestão da Clarke Energia conduzindo um kickoff de vaga com o gestor responsável.
${CLARKE_CONTEXT}
${bm}
JD DA VAGA — Área: ${area} | Vaga: ${nomeVaga}
Desafios: ${jd.desafios}
Responsabilidades: ${jd.responsabilidades}
Senioridade: ${jd.senioridade}
Requisitos: ${jd.requisitos}
Diferenciais: ${jd.diferenciais}
REGRAS: Cruze a JD com benchmarks de mercado. Questione o que é inegociável vs "seria bom ter". Aponte lacunas. Máximo 2-3 provocações por mensagem. Tom direto, jeito Clarke. Quando o gestor confirmar que está satisfeito, gere JSON final: {"final":true,"desafios":"...","responsabilidades":"...","senioridade":"...","requisitos":"...","diferenciais":"..."}. Nunca gere o JSON sem confirmação do gestor.`;
}

async function callAPI(payload) {
  const res = await fetch("/api/generate-jd", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Erro desconhecido");
  return data.text;
}

async function gerarDocx(area, nomeVaga, jd) {
  const logoRes = await fetch("/logo.png");
  const logoBuffer = await logoRes.arrayBuffer();
  const GREEN = "19E58A", DARK = "222222", GRAY = "595959";

  const sectionTitle = (text) => new Paragraph({
    children: [new TextRun({ text, bold: true, size: 26, color: DARK, font: "Poppins" })],
    spacing: { before: 400, after: 160 },
    border: { bottom: { color: GREEN, size: 12, style: BorderStyle.SINGLE } },
  });
  const bodyText = (text) => text.split("\n").map(line =>
    new Paragraph({
      children: [new TextRun({ text: line.replace(/^- /, ""), size: 22, color: DARK, font: "Poppins" })],
      bullet: line.startsWith("- ") ? { level: 0 } : undefined,
      spacing: { after: 100 },
    })
  );
  const labeledField = (label) => [new Paragraph({
    children: [
      new TextRun({ text: `${label}: `, bold: true, size: 22, color: DARK, font: "Poppins" }),
      new TextRun({ text: "(time de People preenche)", size: 22, color: GRAY, italics: true, font: "Poppins" }),
    ],
    spacing: { after: 120 },
  })];

  const doc = new Document({
    sections: [{
      properties: { page: { margin: { top: 1000, bottom: 1000, left: 1200, right: 1200 } } },
      children: [
        new Paragraph({ children: [new ImageRun({ data: logoBuffer, transformation: { width: 160, height: 40 } })], spacing: { after: 300 } }),
        new Paragraph({ children: [new TextRun("")], border: { bottom: { color: GREEN, size: 20, style: BorderStyle.SINGLE } }, spacing: { after: 400 } }),
        ...INTRO.split("\n\n").map(p => new Paragraph({ children: [new TextRun({ text: p, size: 20, color: GRAY, font: "Poppins", italics: true })], spacing: { after: 160 } })),
        new Paragraph({ children: [new TextRun("")], spacing: { after: 200 } }),
        new Paragraph({ children: [new TextRun({ text: area.toUpperCase(), size: 18, color: GREEN, bold: true, font: "Poppins" })], spacing: { after: 80 } }),
        new Paragraph({ children: [new TextRun({ text: nomeVaga, size: 36, bold: true, color: DARK, font: "Poppins" })], spacing: { after: 400 } }),
        sectionTitle("Desafios da Vaga"), ...bodyText(jd.desafios),
        sectionTitle("Responsabilidades"), ...bodyText(jd.responsabilidades),
        sectionTitle("Nível de Senioridade"), ...bodyText(jd.senioridade),
        sectionTitle("Requisitos"), ...bodyText(jd.requisitos),
        sectionTitle("Diferenciais"), ...bodyText(jd.diferenciais),
        sectionTitle("Informações Complementares"),
        ...labeledField("Perfil referência (LinkedIn)"),
        ...labeledField("Faixa salarial"),
        ...labeledField("Material do desafio técnico"),
        ...labeledField("Perguntas de triagem"),
        new Paragraph({ children: [new TextRun("")], spacing: { before: 600 } }),
        new Paragraph({ children: [new TextRun({ text: "clarke energia  |  clarke.com.br", size: 18, color: GREEN, font: "Poppins" })], alignment: AlignmentType.CENTER, border: { top: { color: GREEN, size: 8, style: BorderStyle.SINGLE } }, spacing: { before: 200 } }),
      ],
    }],
  });
  const blob = await Packer.toBlob(doc);
  saveAs(blob, `JD_${nomeVaga.replace(/\s+/g, "_")}.docx`);
}

/* ─── App ─── */
export default function App() {
  const [etapa, setEtapa] = useState("selecao");
  const [areaSel, setAreaSel] = useState("");
  const [nomeVaga, setNomeVaga] = useState("");
  const [blocoAtual, setBlocoAtual] = useState(0);
  const [respostas, setRespostas] = useState({});
  const [jdGerado, setJdGerado] = useState(null);
  const [jdFinal, setJdFinal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [baixando, setBaixando] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [inputMsg, setInputMsg] = useState("");
  const chatEndRef = useRef(null);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatMessages]);

  const getRespVal = (b, p) => respostas[b]?.[p] || "";
  const handleResp = (b, p, v) => setRespostas(prev => ({ ...prev, [b]: { ...(prev[b] || {}), [p]: v } }));
  const blocoOk = (bloco) => bloco.perguntas.every(p => getRespVal(bloco.id, p.id).trim() !== "");
  const pct = Math.round((blocoAtual / BLOCOS.length) * 100);
  const ultimo = blocoAtual === BLOCOS.length - 1;

  const handleGerarJD = async () => {
    setLoading(true);
    try {
      const text = await callAPI({ prompt: buildJDPrompt(areaSel, nomeVaga, respostas) });
      const match = text.replace(/```json|```/g, "").trim().match(/\{[\s\S]*\}/);
      if (!match) throw new Error("JSON não encontrado");
      setJdGerado(JSON.parse(match[0]));
      setEtapa("documento");
    } catch (e) { alert("Erro ao gerar JD: " + e.message); }
    finally { setLoading(false); }
  };

  const handleIniciarKickoff = async () => {
    setEtapa("kickoff"); setLoading(true); setChatMessages([]); setJdFinal(null);
    try {
      const system = buildKickoffSystem(areaSel, nomeVaga, jdGerado);
      const text = await callAPI({ system, messages: [{ role: "user", content: "Pode iniciar o kickoff da vaga." }] });
      setChatMessages([{ role: "user", content: "Pode iniciar o kickoff da vaga." }, { role: "assistant", content: text }]);
    } catch (e) { alert("Erro ao iniciar kickoff: " + e.message); }
    finally { setLoading(false); }
  };

  const handleEnviarMsg = async () => {
    if (!inputMsg.trim() || loading) return;
    const novaMsg = { role: "user", content: inputMsg };
    const updated = [...chatMessages, novaMsg];
    setChatMessages(updated); setInputMsg(""); setLoading(true);
    try {
      const text = await callAPI({ system: buildKickoffSystem(areaSel, nomeVaga, jdGerado), messages: updated });
      const jsonMatch = text.match(/\{[\s\S]*"final"\s*:\s*true[\s\S]*\}/);
      if (jsonMatch) { try { setJdFinal(JSON.parse(jsonMatch[0])); } catch (_) {} }
      setChatMessages(prev => [...prev, { role: "assistant", content: text }]);
    } catch (e) { alert("Erro: " + e.message); }
    finally { setLoading(false); }
  };

  const handleBaixarDocx = async (jd) => {
    setBaixando(true);
    try { await gerarDocx(areaSel, nomeVaga, jd); }
    catch (e) { alert("Erro ao gerar documento: " + e.message); }
    finally { setBaixando(false); }
  };

  const resetar = () => {
    setEtapa("selecao"); setAreaSel(""); setNomeVaga(""); setBlocoAtual(0);
    setRespostas({}); setJdGerado(null); setChatMessages([]); setJdFinal(null);
  };

  const Header = ({ subtitle, backLabel, onBack }) => (
    <div style={s.header}>
      <div>
        <div style={s.logoText}>clarke energia</div>
        {subtitle && <div style={s.headerSub}>{subtitle}</div>}
      </div>
      {onBack && (
        <button onClick={onBack} style={{ background: "transparent", border: `1.5px solid ${T.gray600}`, borderRadius: T.radiusPill, color: T.gray400, padding: "6px 14px", fontSize: 12, fontFamily: "'Poppins', sans-serif", cursor: "pointer" }}>
          ← {backLabel}
        </button>
      )}
    </div>
  );

  /* ── TELA 1: Seleção de área ── */
  if (etapa === "selecao") return (
    <div style={s.wrap}>
      <Header subtitle="Criador de Job Description" />
      <div style={s.body}>
        <div style={s.card}>
          <div style={s.sectionLabel}>Passo 1 de 3</div>
          <h2 style={s.h2}>Olá, gestor(a)! 👋</h2>
          <p style={{ ...s.body, marginBottom: 20 }}>Vou te guiar pelas perguntas para criarmos o Job Description da sua vaga. Para começar, qual área da Clarke essa vaga pertence?</p>
          {AREAS.map(a => (
            <button key={a} style={s.areaBtn(areaSel === a)} onClick={() => setAreaSel(a)}
              onMouseOver={e => { if (areaSel !== a) e.currentTarget.style.borderColor = T.green500; }}
              onMouseOut={e => { if (areaSel !== a) e.currentTarget.style.borderColor = T.gray300; }}>
              {a}
            </button>
          ))}
          {areaSel && (
            <button style={{ ...s.btnPrimary, marginTop: 8 }} onClick={() => setEtapa("nome")}>
              Continuar →
            </button>
          )}
        </div>
      </div>
    </div>
  );

  /* ── TELA 2: Nome da vaga ── */
  if (etapa === "nome") return (
    <div style={s.wrap}>
      <Header subtitle="Criador de Job Description" backLabel="Voltar" onBack={() => setEtapa("selecao")} />
      <div style={s.body}>
        <div style={s.card}>
          <div style={s.sectionLabel}>{areaSel}</div>
          <h2 style={s.h2}>Nome da Vaga</h2>
          <p style={{ ...s.body, marginBottom: 16 }}>Como essa vaga deve aparecer na divulgação?</p>
          <input style={s.input} placeholder="Ex: Desenvolvedor(a) Fullstack Pleno" value={nomeVaga}
            onChange={e => setNomeVaga(e.target.value)}
            onFocus={e => e.target.style.borderColor = T.green500}
            onBlur={e => e.target.style.borderColor = "transparent"} />
          <button style={{ ...s.btnPrimary, marginTop: 16, opacity: nomeVaga.trim() ? 1 : 0.4 }}
            disabled={!nomeVaga.trim()} onClick={() => { setBlocoAtual(0); setEtapa("perguntas"); }}>
            Começar questionário →
          </button>
        </div>
      </div>
    </div>
  );

  /* ── TELA 3: Perguntas ── */
  if (etapa === "perguntas") {
    const bloco = BLOCOS[blocoAtual];
    return (
      <div style={s.wrap}>
        <Header subtitle={`${areaSel} · ${nomeVaga}`} backLabel="Voltar" onBack={() => blocoAtual === 0 ? setEtapa("nome") : setBlocoAtual(b => b - 1)} />
        <div style={s.body}>
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: T.gray500 }}>Seção {blocoAtual + 1} de {BLOCOS.length}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: T.green500 }}>{pct}%</span>
            </div>
            <div style={s.progressTrack}><div style={s.progressFill(pct)} /></div>
          </div>

          <div style={s.card}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <span style={{ fontSize: 24 }}>{bloco.emoji}</span>
              <h3 style={s.h3}>{bloco.titulo}</h3>
            </div>
            {bloco.perguntas.map((p, i) => (
              <div key={p.id} style={{ marginBottom: 18 }}>
                <label style={{ ...s.label, display: "flex", alignItems: "flex-start", gap: 0 }}>
                  <span style={s.labelNum}>{i + 1}</span>
                  <span>{p.label}</span>
                </label>
                <textarea style={s.textarea} value={getRespVal(bloco.id, p.id)}
                  onChange={e => handleResp(bloco.id, p.id, e.target.value)}
                  placeholder="Escreva sua resposta aqui..."
                  onFocus={e => e.target.style.borderColor = T.green500}
                  onBlur={e => e.target.style.borderColor = "transparent"} />
              </div>
            ))}
            <button style={{ ...s.btnPrimary, opacity: blocoOk(bloco) && !loading ? 1 : 0.4, cursor: blocoOk(bloco) ? "pointer" : "not-allowed" }}
              disabled={!blocoOk(bloco) || loading}
              onClick={ultimo ? handleGerarJD : () => setBlocoAtual(b => b + 1)}>
              {ultimo ? (loading ? "Gerando JD..." : "✨ Gerar Job Description") : "Próximo →"}
            </button>
            {!blocoOk(bloco) && <p style={{ fontSize: 12, color: T.gray400, textAlign: "right", marginTop: 6 }}>Preencha todas as perguntas para avançar.</p>}
          </div>
        </div>
      </div>
    );
  }

  /* ── TELA 4: Documento ── */
  if (etapa === "documento") return (
    <div style={s.wrap}>
      <Header subtitle="Job Description" backLabel="Editar" onBack={() => { setEtapa("perguntas"); setBlocoAtual(0); }} />
      <div style={s.body}>
        <div style={s.card}>
          <div style={s.sectionLabel}>{areaSel}</div>
          <h2 style={{ ...s.h2, marginBottom: 20 }}>{nomeVaga}</h2>
          {[
            { titulo: "Desafios da Vaga", conteudo: jdGerado.desafios },
            { titulo: "Responsabilidades", conteudo: jdGerado.responsabilidades },
            { titulo: "Nível de Senioridade", conteudo: jdGerado.senioridade },
            { titulo: "Requisitos", conteudo: jdGerado.requisitos },
            { titulo: "Diferenciais", conteudo: jdGerado.diferenciais },
          ].map(sec => (
            <div key={sec.titulo} style={s.previewSection}>
              <div style={s.previewTitle}>{sec.titulo}</div>
              <div style={s.previewText}>{sec.conteudo}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <button style={s.btnPrimary} onClick={() => handleBaixarDocx(jdGerado)} disabled={baixando}>
            {baixando ? "Gerando arquivo..." : "⬇️ Baixar .docx"}
          </button>
          <button style={s.btnDark} onClick={handleIniciarKickoff} disabled={loading}>
            {loading ? "Iniciando kickoff..." : "🚀 Iniciar Kickoff da Vaga"}
          </button>
          <button style={s.btnSecondary} onClick={resetar}>+ Nova vaga</button>
        </div>
      </div>
    </div>
  );

  /* ── TELA 5: Kickoff ── */
  if (etapa === "kickoff") return (
    <div style={{ ...s.wrap, padding: 0 }}>
      <Header subtitle={`Kickoff · ${nomeVaga}`} backLabel="Voltar à JD" onBack={() => setEtapa("documento")} />

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "24px 16px 160px" }}>
        {chatMessages
          .filter(m => !(m.role === "user" && m.content === "Pode iniciar o kickoff da vaga."))
          .map((msg, i) => (
            <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start", marginBottom: 16 }}>
              {msg.role === "assistant" && (
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: T.green500, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, marginRight: 10, flexShrink: 0, color: T.gray900, fontWeight: 700 }}>✦</div>
              )}
              <div style={{
                background: msg.role === "user" ? T.gray900 : T.white,
                color: msg.role === "user" ? T.white : T.gray900,
                borderRadius: msg.role === "user" ? `${T.radiusMd} ${T.radiusMd} ${T.radiusSm} ${T.radiusMd}` : `${T.radiusMd} ${T.radiusMd} ${T.radiusMd} ${T.radiusSm}`,
                padding: "12px 16px", maxWidth: "85%", fontSize: 14, lineHeight: 1.6,
                boxShadow: T.shadow, whiteSpace: "pre-wrap", fontFamily: "'Poppins', sans-serif",
              }}>
                {msg.content.replace(/\{[\s\S]*"final"\s*:\s*true[\s\S]*\}/, "").trim()}
              </div>
            </div>
          ))
        }

        {loading && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: T.green500, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>✦</div>
            <div style={{ background: T.white, borderRadius: T.radiusMd, padding: "12px 16px", boxShadow: T.shadow }}>
              <div style={{ display: "flex", gap: 4 }}>
                {[0,1,2].map(i => <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: T.green500, animation: `bounce 1s ${i*0.2}s infinite` }} />)}
              </div>
            </div>
          </div>
        )}

        {jdFinal && (
          <div style={{ background: T.green100, border: `2px solid ${T.green500}`, borderRadius: T.radiusMd, padding: 20, marginBottom: 16 }}>
            <div style={{ fontWeight: 700, color: T.gray900, marginBottom: 8, fontSize: 15 }}>✅ JD Atualizada pelo Kickoff</div>
            <p style={{ fontSize: 13, color: T.gray600, marginBottom: 16 }}>As sugestões do kickoff foram incorporadas. Baixe a versão final agora.</p>
            <button style={{ ...s.btnPrimary, width: "auto", padding: "10px 24px" }} onClick={() => handleBaixarDocx(jdFinal)} disabled={baixando}>
              {baixando ? "Gerando..." : "⬇️ Baixar JD Final .docx"}
            </button>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: T.white, borderTop: `0.5px solid ${T.gray200}`, padding: 16, boxShadow: "0 -4px 20px rgba(0,0,0,0.06)" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", gap: 10 }}>
          <textarea style={{ ...s.textarea, margin: 0, minHeight: 48, maxHeight: 120, flex: 1, resize: "none" }}
            placeholder="Responda as provocações ou peça ajustes..."
            value={inputMsg} onChange={e => setInputMsg(e.target.value)}
            onFocus={e => e.target.style.borderColor = T.green500}
            onBlur={e => e.target.style.borderColor = "transparent"}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleEnviarMsg(); } }} />
          <button style={{ ...s.btnPrimary, width: "auto", padding: "0 20px", minHeight: 48 }}
            onClick={handleEnviarMsg} disabled={loading || !inputMsg.trim()}>
            Enviar
          </button>
        </div>
      </div>
      <style>{`@keyframes bounce{0%,100%{transform:translateY(0);opacity:.4}50%{transform:translateY(-6px);opacity:1}}`}</style>
    </div>
  );

  return null;
}