import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';
import formidable from 'formidable';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const form = new formidable.IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err || !files.arquivo) {
      return res.status(400).json({ erro: 'Arquivo não recebido.' });
    }

    const arquivo = Array.isArray(files.arquivo) ? files.arquivo[0] : files.arquivo;

    if (arquivo.mimetype !== 'application/json') {
      return res.status(400).json({ erro: 'Apenas arquivos JSON são aceitos.' });
    }

    try {
      const buffer = fs.readFileSync(arquivo.filepath);
      const json = JSON.parse(buffer.toString('utf-8'));

      if (!json.topicos || !Array.isArray(json.topicos)) {
        return res.status(400).json({ erro: 'Formato inválido. Esperado: { topicos: [...] }' });
      }

      const texto = json.topicos
        .map((t: JSON) => `${t.titulo}: ${t.conteudo}`)
        .join('\n\n');

      const prompt = `
Com base no conteúdo abaixo, gere 5 questões de múltipla escolha em formato JSON.
Cada questão deve conter:
- pergunta (string)
- alternativas (array de 4 opções)
- respostaCorreta (índice da alternativa correta, começando em 0)

Conteúdo:
${texto}
`;

      const resposta = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
      });

      const questoes = resposta.choices[0]?.message?.content || '[]';
      res.status(200).json({ questoes });
    } catch (erro) {
      console.error('Erro ao processar JSON:', erro);
      res.status(500).json({ erro: 'Erro ao gerar questões.' });
    }
  });
}
