import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import { GoogleGenerativeAI } from '@google/generative-ai';

/*
  📦 Instalação necessária
  Antes de rodar, instale o SDK da Gemini:
  npm install @google/generative-ai
*/

// Definição de tipo para o objeto "topico" esperado no JSON de entrada.
type Topico = {
  titulo: string;
  conteudo: string;
};

export const config = {
  api: {
    bodyParser: false,
  },
};

const GEMINI_API_KEY = '';
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY)

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
      console.log('📥 Lendo arquivo JSON...');
      const buffer = fs.readFileSync(arquivo.filepath);
      const json = JSON.parse(buffer.toString('utf-8'));

      if (!json.topicos || !Array.isArray(json.topicos)) {
        return res.status(400).json({ erro: 'Formato inválido. Esperado: { topicos: [...] }' });
      }

      const texto = json.topicos
        // .map((t: JSON) => `${t.titulo}: ${t.conteudo}`) <-- Erro aqui
        .map((t: Topico) => `${t.titulo}: ${t.conteudo}`) // <--- CORRIGIDO
        .join('\n\n');

      const prompt = `
        Com base no conteúdo abaixo, gere 5 questões de múltipla escolha em formato JSON.
        Cada questão deve conter:
        - pergunta (string)
        - alternativas (array de 4 opções)
        - respostaCorreta (índice da alternativa correta, começando em 0)

        Conteúdo:
        ${texto}
        Retorne apenas o JSON, sem explicações, sem comentários, sem Markdown.
      `;
      console.log('🧠 Enviando prompt para Gemini...');
      const model = genAI.getGenerativeModel({ model: 'gemini-pro'} );
      const resposta = await model.generateContent(prompt)
      const conteudo = resposta.response.text();


      if (!conteudo.trim().startsWith('[') && !conteudo.trim().startsWith('{')) {
        console.error('Retorno inesperado da Gemini:', conteudo);
        return res.status(500).json({ erro: 'A IA não retornou um JSON válido. Verifique o prompt ou a chave da API.' });
      }

      try {
        const questoes = JSON.parse(conteudo);
        res.status(200).json({ questoes });
      } catch {
        console.error('Conteúdo inválido retornado pela Gemini API:', conteudo);
        res.status(500).json({ erro: 'A IA retornou um conteúdo inválido. Verifique o prompt.' });
      }

    } catch (erro) {
      console.error('Erro ao processar JSON:', erro);
      res.status(500).json({ erro: 'Erro ao gerar questões.' });
    }
  });
}
