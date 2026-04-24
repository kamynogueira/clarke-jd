import { useState, useRef, useEffect } from "react";
import { Document, Packer, Paragraph, TextRun, ImageRun, AlignmentType, BorderStyle } from "docx";
import { saveAs } from "file-saver";

const AREAS = ["Gente & Gestão","Financeiro","Gestão de Clientes","Comercial","Marketing & Parcerias","Produto & Tecnologia"];

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
- Tom de comunicação: leveza + autoridade, simples mas com profundidade
- Valores: cliente é prioridade, proatividade, transparência, não fugimos de conversas difíceis
`;

const BENCHMARKS = {
  "Comercial": `
BENCHMARKS DE MERCADO — ÁREA COMERCIAL (energia, SaaS B2B, fintechs):
- Requisitos mais comuns: experiência em vendas consultivas B2B, domínio de CRM (HubSpot/Salesforce), capacidade de prospecção ativa e gestão de pipeline
- Diferenciais valorizados: conhecimento em mercado livre de energia, experiência com ciclos de venda longos (3-6 meses), network no setor industrial/varejo
- Senioridade Pleno: 2-4 anos, metas individuais de receita, autonomia para negociar dentro de parâmetros definidos
- Senioridade Sênior: 4-7 anos, gestão de contas estratégicas, capacidade de fechar contratos acima de R$500k/ano
- Erros comuns em JDs: requisitos genéricos demais ("boa comunicação"), não especificar ticket médio esperado, não deixar claro se é hunter ou farmer
- Tendência de mercado: vagas comerciais em energia estão exigindo cada vez mais letramento em dados e capacidade de apresentar análises de economia ao cliente
`,
  "Gestão de Clientes": `
BENCHMARKS DE MERCADO — GESTÃO DE CLIENTES / CS (energia, SaaS B2B):
- Requisitos mais comuns: experiência em CS ou Account Management B2B, capacidade analítica para leitura de dados de consumo, comunicação clara e empática
- Diferenciais valorizados: experiência com churn prevention, domínio de ferramentas de CS (Gainsight, Totango), background em energia ou utilities
- Senioridade Pleno: 2-4 anos, carteira de 40-80 clientes, foco em retenção e expansão de receita
- Senioridade Sênior: 4-7 anos, gestão de contas VIP/enterprise, capacidade de conduzir QBRs e negociações de renovação
- Métricas típicas: NPS, churn rate, Net Revenue Retention (NRR), tempo médio de resposta
- Erros comuns em JDs: confundir CS com suporte técnico, não deixar claro o tamanho da carteira, não especificar se há meta de expansão (upsell/cross-sell)
- Tendência: mercado valoriza perfis que combinam relacionamento humano com análise de dados — o "CS consultivo"
`,
  "Produto & Tecnologia": `
BENCHMARKS DE MERCADO — PRODUTO & TECNOLOGIA (energytechs, SaaS, fintechs):
- Requisitos mais comuns para Produto: experiência com discovery, roadmap, métricas de produto (DAU, retention, NPS), metodologias ágeis
- Requisitos mais comuns para Tech: stack relevante (React, Node, Python), experiência com APIs, testes automatizados, cultura de code review
- Diferenciais valorizados: experiência em domínios regulados (energia, financeiro), capacidade de traduzir complexidade técnica para stakeholders não-técnicos
- Senioridade Pleno Dev: 3-5 anos, entrega autônoma de features, participação em decisões de arquitetura
- Senioridade Sênior Dev: 5-8 anos, referência técnica do time, mentoria de juniores
- Erros comuns em JDs: lista de tecnologias longa demais como requisito, não deixar claro o tamanho e maturidade do time, não especificar o stack real usado
- Tendência: empresas de energia estão buscando perfis que entendam tanto o negócio quanto a tecnologia — "product engineers"
`,
  "Gente & Gestão": `
BENCHMARKS DE MERCADO — GENTE & GESTÃO / RH (startups, scale-ups):
- Requisitos mais comuns: experiência em recrutamento técnico e comportamental, knowledge em People Analytics, capacidade de estruturar processos em ambientes de crescimento rápido
- Diferenciais valorizados: experiência em empresas de tecnologia ou energia, domínio de ferramentas de ATS (Greenhouse, Lever), background em psicologia ou administração
- Senioridade Pleno: 2-4 anos, condução autônoma de processos seletivos, apoio em projetos de cultura e engajamento
- Senioridade Sênior: 4-7 anos, estruturação de processos de People, parceria estratégica com lideranças (HRBP)
- Erros comuns em JDs: não especificar o volume de vagas esperado, não deixar claro se é generalista ou especialista, requisitos acadêmicos desnecessariamente restritivos
- Tendência: mercado valoriza profissionais de People que usam dados para embasar decisões e têm visão de negócio
`,
  "Financeiro": `
BENCHMARKS DE MERCADO — FINANCEIRO (energytechs, scale-ups):
- Requisitos mais comuns: domínio de Excel/Google Sheets avançado, experiência com fechamento contábil, FP&A ou controladoria, conhecimento em regulações do setor
- Diferenciais valorizados: experiência em empresas de energia ou utilities, familiaridade com CCEE e liquidação financeira do mercado livre, conhecimento em BI (Power BI, Tableau)
- Senioridade Pleno: 2-4 anos, execução de rotinas financeiras com autonomia, suporte a análises gerenciais
- Senioridade Sênior: 4-7 anos, estruturação de processos financeiros, interface com auditoria e board
- Erros comuns em JDs: não especificar se é mais operacional ou analítico, requisitos de formação muito rígidos, não deixar claro o porte financeiro da empresa
- Tendência: profissionais financeiros em energytechs precisam entender o modelo de negócio de gestão de energia para fazer análises relevantes
`,
  "Marketing & Parcerias": `
BENCHMARKS DE MERCADO — MARKETING & PARCERIAS (B2B, energytechs):
- Requisitos mais comuns: experiência em marketing B2B, domínio de ferramentas de automação (RD Station, HubSpot), capacidade de análise de métricas (CAC, LTV, MQL)
- Diferenciais valorizados: experiência em mercados regulados ou técnicos, capacidade de criar conteúdo educativo sobre temas complexos, background em parcerias ou canais
- Senioridade Pleno: 2-4 anos, execução de campanhas com autonomia, gestão de canais digitais
- Senioridade Sênior: 4-7 anos, estratégia de geração de demanda, gestão de budget e agências
- Erros comuns em JDs: confundir marketing B2B com B2C, não especificar o canal principal (inbound, eventos, parcerias), requisitos de design desnecessários para perfis estratégicos
- Tendência: marketing em energia precisa equilibrar educação do mercado (awareness sobre ACL) com geração de leads qualificados — perfil híbrido de conteúdo + performance
`,
};

const GREEN = "00C566";
const DARK = "1a1a1a";
const GRAY = "666666";

function buildJDPrompt(area, nomeVaga, respostas) {
  const r = (b, p) => respostas[b]?.[p] || "";
  return `Você é analista de Gente & Gestão da Clarke Energia. Reescreva as respostas abaixo de forma profissional, atrativa e fiel ao conteúdo informado. Tom: humano, direto, sem jargões corporativos, orientado a impacto.

VAGA: ${nomeVaga} | ÁREA: ${area}

DESAFIOS: ${r("desafios","d1")} | ${r("desafios","d2")} | ${r("desafios","d3")}
RESPONSABILIDADES: ${r("responsabilidades","r1")} | ${r("responsabilidades","r2")} | ${r("responsabilidades","r3")}
SENIORIDADE: ${r("senioridade","s1")} | ${r("senioridade","s2")} | ${r("senioridade","s3")}
REQUISITOS: ${r("requisitos","req1")} | ${r("requisitos","req2")} | ${r("requisitos","req3")}
DIFERENCIAIS: ${r("diferenciais","dif1")} | ${r("diferenciais","dif2")} | ${r("diferenciais","dif3")}

Responda APENAS com JSON válido:
{
  "desafios": "texto corrido inspirador",
  "responsabilidades": "- item 1\\n- item 2\\n- item 3\\n- item 4\\n- item 5",
  "senioridade": "Nível — descrição curta",
  "requisitos": "- item 1\\n- item 2\\n- item 3\\n- item 4",
  "diferenciais": "- item 1\\n- item 2\\n- item 3"
}`;
}

function buildKickoffSystem(area, nomeVaga, jd) {
  const benchmark = BENCHMARKS[area] || "";
  return `Você é uma analista sênior de Gente & Gestão da Clarke Energia, conduzindo um kickoff de vaga com o gestor responsável. Sua missão é garantir que a vaga esteja alinhada com a estratégia da empresa, seja competitiva no mercado e atraia o perfil certo.

${CLARKE_CONTEXT}

${benchmark}

JOB DESCRIPTION DA VAGA:
Área: ${area}
Vaga: ${nomeVaga}
Desafios: ${jd.desafios}
Responsabilidades: ${jd.responsabilidades}
Senioridade: ${jd.senioridade}
Requisitos: ${jd.requisitos}
Diferenciais: ${jd.diferenciais}

SUAS RESPONSABILIDADES NO KICKOFF:
1. Cruzar a JD com os benchmarks de mercado da área e apontar gaps ou inconsistências
2. Questionar o que é realmente inegociável versus o que é "seria bom ter"
3. Provocar o gestor sobre requisitos que podem estar eliminando bons candidatos desnecessariamente
4. Sugerir responsabilidades ou métricas que estejam faltando com base no mercado
5. Garantir alinhamento com a estratégia e cultura da Clarke 2026
6. Manter tom consultivo, direto e sem rodeios — jeito Clarke de ser

REGRAS:
- Inicie com uma análise comparativa entre a JD e os benchmarks de mercado, destacando o que está bom e o que merece atenção
- Faça no máximo 2-3 perguntas ou provocações por mensagem para não sobrecarregar o gestor
- Seja direta e objetiva, sem enrolação
- Quando o gestor indicar que está satisfeito com os ajustes, gere a JD final atualizada em JSON com a estrutura exata: {"final": true, "desafios": "...", "responsabilidades": "...", "senioridade": "...", "requisitos": "...", "diferenciais": "..."}
- Nunca gere o JSON final sem o gestor ter confirmado que quer encerrar o kickoff`;
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

  const labeledField = (label) => [
    new Paragraph({
      children: [
        new TextRun({ text: `${label}: `, bold: true, size: 22, color: DARK, font: "Poppins" }),
        new TextRun({ text: "(time de People preenche)", size: 22, color: GRAY, italics: true, font: "Poppins" }),
      ],
      spacing: { after: 120 },
    }),
  ];

  const doc = new Document({
    sections: [{
      properties: { page: { margin: { top: 1000, bottom: 1000, left: 1200, right: 1200 } } },
      children: [
        new Paragraph({
          children: [new ImageRun({ data: logoBuffer, transformation: { width: 160, height: 40 } })],
          spacing: { after: 300 },
        }),
        new Paragraph({
          children: [new TextRun({ text: "" })],
          border: { bottom: { color: GREEN, size: 20, style: BorderStyle.SINGLE } },
          spacing: { after: 400 },
        }),
        ...INTRO.split("\n\n").map(p => new Paragraph({
          children: [new TextRun({ text: p, size: 20, color: GRAY, font: "Poppins", italics: true })],
          spacing: { after: 160 },
        })),
        new Paragraph({ children: [new TextRun("")], spacing: { after: 200 } }),
        new Paragraph({
          children: [new TextRun({ text: area.toUpperCase(), size: 18, color: GREEN, bold: true, font: "Poppins" })],
          spacing: { after: 80 },
        }),
        new Paragraph({
          children: [new TextRun({ text: nomeVaga, size: 36, bold: true, color: DARK, font: "Poppins" })],
          spacing: { after: 400 },
        }),
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
        new Paragraph({
          children: [new TextRun({ text: "clarke energia  |  clarke.com.br", size: 18, color: GREEN, font: "Poppins" })],
          alignment: AlignmentType.CENTER,
          border: { top: { color: GREEN, size: 8, style: BorderStyle.SINGLE } },
          spacing: { before: 200 },
        }),
      ],
    }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `JD_${nomeVaga.replace(/\s+/g, "_")}.docx`);
}

export default function App() {
  const [etapa, setEtapa] = useState("selecao");
  const [areaSel, setAreaSel] = useState("");
  const [nomeVaga, setNomeVaga] = useState("");
  const [blocoAtual, setBlocoAtual] = useState(0);
  const [respostas, setRespostas] = useState({});
  const [jdGerado, setJdGerado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [inputMsg, setInputMsg] = useState("");
  const [jdFinal, setJdFinal] = useState(null);
  const [baixando, setBaixando] = useState(false);
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
      const clean = text.replace(/```json|```/g, "").trim();
      const match = clean.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("JSON não encontrado");
      const parsed = JSON.parse(match[0]);
      setJdGerado(parsed);
      setEtapa("documento");
    } catch (e) {
      alert("Erro ao gerar JD: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleIniciarKickoff = async () => {
    setEtapa("kickoff");
    setLoading(true);
    setChatMessages([]);
    setJdFinal(null);
    try {
      const system = buildKickoffSystem(areaSel, nomeVaga, jdGerado);
      const text = await callAPI({
        system,
        messages: [{ role: "user", content: "Pode iniciar o kickoff da vaga." }],
      });
      setChatMessages([
        { role: "user", content: "Pode iniciar o kickoff da vaga." },
        { role: "assistant", content: text },
      ]);
    } catch (e) {
      alert("Erro ao iniciar kickoff: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEnviarMsg = async () => {
    if (!inputMsg.trim() || loading) return;
    const novaMsg = { role: "user", content: inputMsg };
    const updatedMessages = [...chatMessages, novaMsg];
    setChatMessages(updatedMessages);
    setInputMsg("");
    setLoading(true);
    try {
      const system = buildKickoffSystem(areaSel, nomeVaga, jdGerado);
      const text = await callAPI({ system, messages: updatedMessages });

      // Verifica se a IA gerou a JD final
      const jsonMatch = text.match(/\{[\s\S]*"final"\s*:\s*true[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const finalJD = JSON.parse(jsonMatch[0]);
          setJdFinal(finalJD);
        } catch (_) {}
      }

      setChatMessages(prev => [...prev, { role: "assistant", content: text }]);
    } catch (e) {
      alert("Erro: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBaixarDocx = async (jd) => {
    setBaixando(true);
    try {
      await gerarDocx(areaSel, nomeVaga, jd);
    } catch (e) {
      alert("Erro ao gerar documento: " + e.message);
    } finally {
      setBaixando(false);
    }
  };

  const resetar = () => {
    setEtapa("selecao"); setAreaSel(""); setNomeVaga(""); setBlocoAtual(0);
    setRespostas({}); setJdGerado(null); setChatMessages([]); setJdFinal(null);
  };

  const s = {
    wrap: { fontFamily: "'Inter', sans-serif", background: "#f5f7f5", minHeight: "100vh", padding: "40px 20px" },
    card: { background: "white", borderRadius: "16px", padding: "32px", maxWidth: "640px", margin: "0 auto", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" },
    header: { color: "#00C566", fontWeight: "800", fontSize: "24px", marginBottom: "24px", textAlign: "center" },
    btn: { background: "#00C566", color: "white", border: "none", borderRadius: "8px", padding: "12px 24px", fontWeight: "700", cursor: "pointer", width: "100%" },
    btnGhost: { background: "transparent", color: "#00C566", border: "2px solid #00C566", borderRadius: "8px", padding: "10px 20px", fontWeight: "600", cursor: "pointer" },
    input: { width: "100%", border: "1.5px solid #e0e0e0", borderRadius: "8px", padding: "12px", fontSize: "16px", marginBottom: "16px", boxSizing: "border-box" },
    textarea: { width: "100%", border: "1.5px solid #e0e0e0", borderRadius: "8px", padding: "12px", fontSize: "14px", minHeight: "100px", marginBottom: "12px", boxSizing: "border-box", fontFamily: "inherit" },
  };

  // ── TELA 1: Área ──
  if (etapa === "selecao") return (
    <div style={s.wrap}><div style={s.card}>
      <div style={s.header}>clarke energia</div>
      <p style={{ textAlign: "center", color: "#666", marginBottom: "16px" }}>Selecione a área da vaga:</p>
      {AREAS.map(a => (
        <button key={a} style={{ ...s.btn, background: areaSel === a ? "#00C566" : "#fff", color: areaSel === a ? "#fff" : "#333", border: "1px solid #ddd", marginBottom: "8px" }} onClick={() => setAreaSel(a)}>{a}</button>
      ))}
      {areaSel && <button style={{ ...s.btn, marginTop: "16px" }} onClick={() => setEtapa("nome")}>Continuar →</button>}
    </div></div>
  );

  // ── TELA 2: Nome ──
  if (etapa === "nome") return (
    <div style={s.wrap}><div style={s.card}>
      <div style={s.header}>Nome da Vaga</div>
      <input style={s.input} placeholder="Ex: Desenvolvedor(a) Fullstack Pleno" value={nomeVaga} onChange={e => setNomeVaga(e.target.value)} />
      <div style={{ display: "flex", gap: "10px" }}>
        <button style={s.btnGhost} onClick={() => setEtapa("selecao")}>← Voltar</button>
        <button style={{ ...s.btn, opacity: nomeVaga.trim() ? 1 : 0.4 }} disabled={!nomeVaga.trim()} onClick={() => { setBlocoAtual(0); setEtapa("perguntas"); }}>Começar →</button>
      </div>
    </div></div>
  );

  // ── TELA 3: Perguntas ──
  if (etapa === "perguntas") {
    const bloco = BLOCOS[blocoAtual];
    return (
      <div style={s.wrap}><div style={s.card}>
        <div style={{ fontSize: "11px", color: "#00C566", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>{areaSel} · {nomeVaga}</div>
        <div style={{ fontSize: "12px", color: "#aaa", marginBottom: "16px" }}>Seção {blocoAtual + 1} de {BLOCOS.length} — {pct}% concluído</div>
        <div style={{ background: "#e8f5ee", borderRadius: "99px", height: "4px", marginBottom: "24px" }}>
          <div style={{ background: "#00C566", height: "4px", borderRadius: "99px", width: `${pct}%`, transition: "width .4s" }} />
        </div>
        <h2 style={{ margin: "0 0 20px" }}>{bloco.emoji} {bloco.titulo}</h2>
        {bloco.perguntas.map((p, i) => (
          <div key={p.id} style={{ marginBottom: "16px" }}>
            <label style={{ fontSize: "13px", display: "block", marginBottom: "6px", color: "#333" }}>
              <span style={{ background: "#f0faf5", color: "#00C566", borderRadius: "4px", padding: "1px 7px", fontSize: "11px", fontWeight: "700", marginRight: "6px" }}>{i + 1}</span>
              {p.label}
            </label>
            <textarea style={s.textarea} value={getRespVal(bloco.id, p.id)} onChange={e => handleResp(bloco.id, p.id, e.target.value)} placeholder="Escreva sua resposta aqui..." />
          </div>
        ))}
        <div style={{ display: "flex", gap: "10px" }}>
          <button style={s.btnGhost} onClick={() => blocoAtual === 0 ? setEtapa("nome") : setBlocoAtual(b => b - 1)}>← Voltar</button>
          <button style={{ ...s.btn, opacity: blocoOk(bloco) && !loading ? 1 : 0.4, cursor: blocoOk(bloco) ? "pointer" : "not-allowed" }}
            disabled={!blocoOk(bloco) || loading}
            onClick={ultimo ? handleGerarJD : () => setBlocoAtual(b => b + 1)}>
            {ultimo ? (loading ? "Gerando JD..." : "✨ Gerar Job Description") : "Próximo →"}
          </button>
        </div>
      </div></div>
    );
  }

  // ── TELA 4: Documento ──
  if (etapa === "documento") return (
    <div style={s.wrap}><div style={s.card}>
      <div style={s.header}>JD Gerada! 🎉</div>
      <div style={{ background: "#f8fafb", border: "1px solid #e0ede6", borderRadius: "8px", padding: "20px", marginBottom: "20px" }}>
        <div style={{ color: "#00C566", fontWeight: "700", fontSize: "11px", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>{areaSel}</div>
        <div style={{ fontWeight: "800", fontSize: "20px", marginBottom: "16px", color: "#1a1a1a" }}>{nomeVaga}</div>
        {[
          { titulo: "Desafios da Vaga", conteudo: jdGerado.desafios },
          { titulo: "Responsabilidades", conteudo: jdGerado.responsabilidades },
          { titulo: "Nível de Senioridade", conteudo: jdGerado.senioridade },
          { titulo: "Requisitos", conteudo: jdGerado.requisitos },
          { titulo: "Diferenciais", conteudo: jdGerado.diferenciais },
        ].map(sec => (
          <div key={sec.titulo} style={{ marginBottom: "16px" }}>
            <div style={{ fontWeight: "700", fontSize: "13px", color: "#1a1a1a", borderBottom: "2px solid #00C566", paddingBottom: "4px", marginBottom: "8px" }}>{sec.titulo}</div>
            <div style={{ fontSize: "13px", color: "#444", lineHeight: "1.7", whiteSpace: "pre-line" }}>{sec.conteudo}</div>
          </div>
        ))}
      </div>
      <button style={{ ...s.btn, marginBottom: "10px" }} onClick={() => handleBaixarDocx(jdGerado)} disabled={baixando}>
        {baixando ? "Gerando arquivo..." : "⬇️ Baixar .docx"}
      </button>
      <button style={{ ...s.btn, background: "#1a1a1a", marginBottom: "10px" }} onClick={handleIniciarKickoff} disabled={loading}>
        {loading ? "Iniciando kickoff..." : "🚀 Iniciar Kickoff da Vaga"}
      </button>
      <button style={{ ...s.btnGhost, width: "100%", marginTop: "4px", borderColor: "#ccc", color: "#999" }} onClick={resetar}>+ Nova vaga</button>
    </div></div>
  );

  // ── TELA 5: Kickoff ──
  if (etapa === "kickoff") return (
    <div style={{ ...s.wrap, padding: "0" }}>
      {/* Header fixo */}
      <div style={{ background: "#1a1a1a", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10 }}>
        <div>
          <div style={{ color: "#00C566", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px" }}>Kickoff da Vaga</div>
          <div style={{ color: "white", fontWeight: "700", fontSize: "16px" }}>{nomeVaga}</div>
        </div>
        <button style={{ ...s.btnGhost, width: "auto", fontSize: "12px", padding: "6px 14px", borderColor: "#666", color: "#aaa" }} onClick={() => setEtapa("documento")}>← Voltar à JD</button>
      </div>

      {/* Chat */}
      <div style={{ maxWidth: "720px", margin: "0 auto", padding: "24px 16px", paddingBottom: "140px" }}>
        {chatMessages.filter(m => m.role !== "user" || m.content !== "Pode iniciar o kickoff da vaga.").map((msg, i) => (
          <div key={i} style={{
            display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
            marginBottom: "16px",
          }}>
            {msg.role === "assistant" && (
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#00C566", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", marginRight: "10px", flexShrink: 0 }}>✦</div>
            )}
            <div style={{
              background: msg.role === "user" ? "#00C566" : "white",
              color: msg.role === "user" ? "white" : "#1a1a1a",
              borderRadius: msg.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
              padding: "12px 16px", maxWidth: "85%", fontSize: "14px", lineHeight: "1.6",
              boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
              whiteSpace: "pre-wrap",
            }}>
              {msg.content.replace(/\{[\s\S]*"final"\s*:\s*true[\s\S]*\}/, "").trim()}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#00C566", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px" }}>✦</div>
            <div style={{ background: "white", borderRadius: "16px 16px 16px 4px", padding: "12px 16px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
              <div style={{ display: "flex", gap: "4px" }}>
                {[0,1,2].map(i => <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: "#00C566", animation: `bounce 1s ${i*0.2}s infinite` }} />)}
              </div>
            </div>
          </div>
        )}

        {/* JD Final disponível */}
        {jdFinal && (
          <div style={{ background: "#f0faf5", border: "2px solid #00C566", borderRadius: "12px", padding: "20px", marginBottom: "16px" }}>
            <div style={{ fontWeight: "700", color: "#1a1a1a", marginBottom: "8px", fontSize: "15px" }}>✅ JD Atualizada pelo Kickoff</div>
            <p style={{ fontSize: "13px", color: "#555", marginBottom: "16px" }}>As sugestões do kickoff foram incorporadas à Job Description. Você pode baixar a versão final agora.</p>
            <button style={{ ...s.btn, width: "auto", padding: "10px 24px" }} onClick={() => handleBaixarDocx(jdFinal)} disabled={baixando}>
              {baixando ? "Gerando..." : "⬇️ Baixar JD Final .docx"}
            </button>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input fixo no rodapé */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "white", borderTop: "1px solid #e0e0e0", padding: "16px", boxShadow: "0 -4px 20px rgba(0,0,0,0.08)" }}>
        <div style={{ maxWidth: "720px", margin: "0 auto", display: "flex", gap: "10px" }}>
          <textarea
            style={{ ...s.textarea, margin: 0, minHeight: "48px", maxHeight: "120px", flex: 1, resize: "none" }}
            placeholder="Responda as provocações ou peça ajustes na vaga..."
            value={inputMsg}
            onChange={e => setInputMsg(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleEnviarMsg(); } }}
          />
          <button style={{ ...s.btn, width: "auto", padding: "0 20px", minHeight: "48px" }} onClick={handleEnviarMsg} disabled={loading || !inputMsg.trim()}>
            Enviar
          </button>
        </div>
      </div>
      <style>{`@keyframes bounce { 0%,100%{transform:translateY(0);opacity:.4} 50%{transform:translateY(-6px);opacity:1} }`}</style>
    </div>
  );

  return null;
}