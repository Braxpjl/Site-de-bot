const { Anthropic } = require('@anthropic-ai/sdk');
const sessoes = {};

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ erro: 'Método não permitido' });

  const { mensagem, sessaoId } = req.body;
  if (!mensagem) return res.status(400).json({ erro: 'Mensagem vazia' });

  const cliente = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  
  if (!sessoes[sessaoId]) sessoes[sessaoId] = [];
  sessoes[sessaoId].push({ role: 'user', content: mensagem });

  try {
    const resposta = await cliente.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: 'Você é um assistente amigável. Responda sempre em português.',
      messages: sessoes[sessaoId]
    });

    const texto = resposta.content[0].text;
    sessoes[sessaoId].push({ role: 'assistant', content: texto });
    res.status(200).json({ resposta: texto });
  } catch (erro) {
    res.status(500).json({ erro: erro.message });
  }
};
