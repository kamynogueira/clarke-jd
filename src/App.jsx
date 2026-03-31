import { useState } from "react";

const AREAS = [
  "Gente & Gestão",
  "Financeiro",
  "Gestão de Clientes",
  "Comercial",
  "Marketing & Parcerias",
  "Produto & Tecnologia",
];

const BLOCOS = [
  {
    id: "desafios", titulo: "Desafios da Vaga", emoji: "🚀",
    perguntas: [
      { id: "d1", label: "Em uma frase, qual é o grande problema ou oportunidade que essa pessoa vai endereçar na Clarke?" },
      { id: "d2", label: "Quais são os 2 ou 3 principais desafios do dia a dia dessa vaga? Pense em algo que engaje quem está lendo." },
      { id: "d3", label: "O que torna essa vaga única ou especialmente relevante para a Clarke agora?" },
    ],
  },
  {
    id: "responsabilidades", titulo: "Responsabilidades", emoji: "📋",
    perguntas: [
      { id: "r1", label: "Quais são as principais atividades do dia a dia dessa pessoa? Liste pelo menos 4." },
      { id: "r2", label: "Com quais times ou áreas ela vai interagir com mais frequência?" },
      { id: "r3", label: "Quais métricas ou resultados essa pessoa será diretamente responsável por entregar?" },
    ],
  },
  {
    id: "senioridade", titulo: "Nível de Senioridade", emoji: "📊",
    perguntas: [
      { id: "s1", label: "Qual nível você espera para essa vaga? (ex: Júnior, Pleno, Sênior, Especialista, Coordenador...)" },
      { id: "s2", label: "Quantos anos de experiência relevante essa pessoa precisa ter?" },
      { id: "s3", label: "Essa pessoa vai atuar de forma mais autônoma ou com suporte próximo de um gestor?" },
    ],
  },
  {
    id: "requisitos", titulo: "Requisitos", emoji: "🔒",
    perguntas: [
      { id: "req1", label: "Quais conhecimentos ou habilidades técnicas são absolutamente inegociáveis para essa vaga?" },
      { id: "req2", label: "Existe algum requisito de localização, disponibilidade para viagens ou modelo de trabalho?" },
      { id: "req3", label: "Há formação acadêmica ou certificação obrigatória?" },
    ],
  },
  {
    id: "diferenciais", titulo: "Diferenciais", emoji: "⭐",
    perguntas: [
      { id: "dif1", label: "O que faria você preferir um candidato a outro, mesmo que ambos atendam os requisitos mínimos?" },
      { id: "dif2", label: "Existe alguma experiência prévia (setor, tipo de empresa ou projeto) que seria um grande diferencial?" },
      { id: "dif3", label: "Há alguma habilidade comportamental que considera essencial para ter sucesso nessa vaga?" },
    ],
  },
];

const INTRO = `A Clarke nasceu para empoderar os consumidores de energia elétrica. Acreditamos que conhecimento é poder, e queremos oferecer autonomia e liberdade para nossos clientes. Por isso, damos a eles a possibilidade de comprar energia limpa e mais barata no mercado livre de energia elétrica.\n\nOs nossos desafios de produto, processos, ferramentas e comunicação são constantes e precisamos de um time brilhante e comprometido para permitir crescimento acelerado e constante.`;

function buildPrompt(area, nomeVaga, respostas) {
  const r = (b, p) => respostas[b]?.[p] || "";
  return `Você é analista de Gente & Gestão da Clarke Energia. Reescreva as respostas abaixo de forma profissional, atrativa e fiel ao conteúdo informado — não invente, não substitua nem omita nenhuma informação. Tom: humano, direto, sem jargões corporativos, orientado a impacto.

VAGA: ${nomeVaga} | ÁREA: ${area}

DESAFIOS DA VAGA
Problema ou oportunidade central: ${r("desafios","d1")}
Principais desafios do dia a dia: ${r("desafios","d2")}
Por que essa vaga é relevante agora: ${r("desafios","d3")}

RESPONSABILIDADES
Atividades principais: ${r("responsabilidades","r1")}
Times com quem vai interagir: ${r("responsabilidades","r2")}
Métricas e resultados esperados: ${r("responsabilidades","r3")}

SENIORIDADE
Nível: ${r("senioridade","s1")}
Anos de experiência: ${r("senioridade","s2")}
Grau de autonomia: ${r("senioridade","s3")}

REQUISITOS (inclua TODOS os itens, sem omitir nenhum)
Conhecimentos técnicos inegociáveis: ${r("requisitos","req1")}
Localização / modelo de trabalho: ${r("requisitos","req2")}
Formação obrigatória: ${r("requisitos","req3")}

DIFERENCIAIS (inclua TODOS os itens, sem omitir nenhum)
O que diferencia um candidato: ${r("diferenciais","dif1")}
Experiência prévia ideal: ${r("diferenciais","dif2")}
Habilidade comportamental essencial: ${r("diferenciais","dif3")}

Responda APENAS com um JSON válido, sem texto antes ou depois, sem markdown:
{
  "desafios": "texto corrido e inspirador falando diretamente com o candidato",
  "responsabilidades": "- item 1\\n- item 2\\n- item 3\\n- item 4\\n- item 5",
  "senioridade": "Nível — descrição curta do perfil e grau de autonomia esperado",
  "requisitos": "- item 1\\n- item 2\\n- item 3\\n- item 4",
  "diferenciais": "- item 1\\n- item 2\\n- item 3"
}`;
}

export default function App() {
  const [etapa, setEtapa] = useState("selecao");
  const [areaSel, setAreaSel] = useState("");
  const [nomeVaga, setNomeVaga] = useState("");
  const [blocoAtual, setBlocoAtual] = useState(0);
  const [respostas, setRespostas] = useState({});
  const [copiado, setCopiado] = useState(false);
  const [jdGerado, setJdGerado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  const getRespVal = (b, p) => respostas[b]?.[p] || "";
  const handleResp = (b, p, v) => setRespostas(prev => ({ ...prev, [b]: { ...(prev[b] || {}), [p]: v } }));
  const blocoOk = (bloco) => bloco.perguntas.every(p => getRespVal(bloco.id, p.id).trim() !== "");
  const pct = Math.round((blocoAtual / BLOCOS.length) * 100);
  const ultimo = blocoAtual === BLOCOS.length - 1;

  const handleFinalizar = async () => {
    setLoading(true);
    setErro("");
    const prompt = buildPrompt(areaSel, nomeVaga, respostas);

    try {
      const res = await fetch("/api/generate-jd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Erro desconhecido");

      const clean = data.text.replace(/```json|```/g, "").trim();
      const match = clean.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("JSON não encontrado na resposta");

      const parsed = JSON.parse(match[0]);
      setJdGerado(parsed);
      setEtapa("documento");
    } catch (err) {
      setErro(`Erro: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const gerarTextoFinal = () => {
    if (!jdGerado) return "";
    let doc = `${INTRO}\n\n${"─".repeat(48)}\n\n`;
    doc += `Área: ${areaSel}\n\nNome da vaga: ${nomeVaga}\n\n${"─".repeat(48)}\n\n`;
    doc += `Desafios da vaga\n\n${jdGerado.desafios}\n\n${"─".repeat(48)}\n\n`;
    doc += `Responsabilidades\n\n${jdGerado.responsabilidades}\n\n${"─".repeat(48)}\n\n`;
    doc += `Nível de senioridade\n\n${jdGerado.senioridade}\n\n${"─".repeat(48)}\n\n`;
    doc += `Requisitos\n\n${jdGerado.requisitos}\n\n${"─".repeat(48)}\n\n`;
    doc += `Diferenciais\n\n${jdGerado.diferenciais}\n\n${"─".repeat(48)}\n\n`;
    doc += `Perfil referência (LinkedIn): \n\nFaixa salarial: (time de People preenche)\n\nMaterial do desafio técnico: (inserir link)\n\nPerguntas de triagem: (time de People preenche)\n`;
    return doc;
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

  if (etapa === "selecao") return (
    <div style={s.wrap}>
      <div style={s.card}>
        <div style={s.header}>clarke energia</div>
        <p style={{ textAlign: "center", color: "#666", marginBottom: "16px" }}>Selecione a área da vaga:</p>
        {AREAS.map(a => (
          <button key={a} style={{ ...s.btn, background: areaSel === a ? "#00C566" : "#fff", color: areaSel === a ? "#fff" : "#333", border: "1px solid #ddd", marginBottom: "8px" }} onClick={() => setAreaSel(a)}>{a}</button>
        ))}
        {areaSel && <button style={{ ...s.btn, marginTop: "16px" }} onClick={() => setEtapa("nome")}>Continuar →</button>}
      </div>
    </div>
  );

  if (etapa === "nome") return (
    <div style={s.wrap}>
      <div style={s.card}>
        <div style={s.header}>Nome da Vaga</div>
        <p style={{ color: "#666", fontSize: "14px", marginBottom: "12px" }}>Como essa vaga deve aparecer na divulgação?</p>
        <input style={s.input} placeholder="Ex: Desenvolvedor(a) Fullstack Pleno" value={nomeVaga} onChange={e => setNomeVaga(e.target.value)} />
        <div style={{ display: "flex", gap: "10px" }}>
          <button style={s.btnGhost} onClick={() => setEtapa("selecao")}>← Voltar</button>
          <button style={{ ...s.btn, opacity: nomeVaga.trim() ? 1 : 0.4 }} disabled={!nomeVaga.trim()} onClick={() => { setBlocoAtual(0); setEtapa("perguntas"); }}>Começar questionário →</button>
        </div>
      </div>
    </div>
  );

  if (etapa === "perguntas") {
    const bloco = BLOCOS[blocoAtual];
    return (
      <div style={s.wrap}>
        <div style={s.card}>
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
          {erro && <p style={{ color: "#e00", fontSize: "13px", marginBottom: "10px" }}>{erro}</p>}
          <div style={{ display: "flex", gap: "10px" }}>
            <button style={s.btnGhost} onClick={() => blocoAtual === 0 ? setEtapa("nome") : setBlocoAtual(b => b - 1)}>← Voltar</button>
            <button
              style={{ ...s.btn, opacity: blocoOk(bloco) && !loading ? 1 : 0.4, cursor: blocoOk(bloco) && !loading ? "pointer" : "not-allowed" }}
              disabled={!blocoOk(bloco) || loading}
              onClick={ultimo ? handleFinalizar : () => setBlocoAtual(b => b + 1)}>
              {ultimo ? (loading ? "Gerando JD..." : "✨ Revisar e gerar JD") : "Próximo →"}
            </button>
          </div>
          {!blocoOk(bloco) && <p style={{ fontSize: "12px", color: "#aaa", textAlign: "right", marginTop: "8px" }}>Preencha todas as perguntas para avançar.</p>}
        </div>
      </div>
    );
  }

  if (etapa === "documento") return (
    <div style={s.wrap}>
      <div style={s.card}>
        <div style={s.header}>JD Gerada! 🎉</div>
        <p style={{ color: "#666", fontSize: "13px", marginBottom: "16px", lineHeight: "1.6" }}>
          Copie e cole no Google Docs para edição final. Faixa salarial, desafio técnico e perguntas de triagem serão preenchidos pelo time de People.
        </p>
        <pre style={{ background: "#f4f4f4", padding: "16px", borderRadius: "8px", whiteSpace: "pre-wrap", fontSize: "12px", maxHeight: "400px", overflowY: "auto", marginBottom: "16px" }}>
          {gerarTextoFinal()}
        </pre>
        <button style={s.btn} onClick={() => { navigator.clipboard.writeText(gerarTextoFinal()); setCopiado(true); }}>
          {copiado ? "✅ Copiado!" : "📋 Copiar para Google Docs"}
        </button>
        <button style={{ ...s.btnGhost, width: "100%", marginTop: "10px" }} onClick={() => setEtapa("perguntas")}>✏️ Editar respostas</button>
        <button style={{ ...s.btnGhost, width: "100%", marginTop: "8px", borderColor: "#ccc", color: "#999" }}
          onClick={() => { setEtapa("selecao"); setAreaSel(""); setNomeVaga(""); setBlocoAtual(0); setRespostas({}); setJdGerado(null); }}>
          + Nova vaga
        </button>
      </div>
    </div>
  );

  return null;
}
