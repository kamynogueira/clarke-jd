
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { prompt, messages, system } = req.body;

  if (!prompt && !messages) {
    return res.status(400).json({ error: "Prompt ou messages ausente" });
  }

  try {
    const body = messages
      ? {
          model: "gpt-4o",
          max_tokens: 2000,
          messages: [
            { role: "system", content: system || "" },
            ...messages,
          ],
        }
      : {
          model: "gpt-4o",
          max_tokens: 1500,
          messages: [{ role: "user", content: prompt }],
        };

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({ error: data.error?.message || "Erro na API da OpenAI" });
    }

    const text = data.choices?.[0]?.message?.content || "";
    res.status(200).json({ text });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}