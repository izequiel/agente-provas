import { useState } from 'react';

type Questao = {
  pergunta: string;
  alternativas: string[];
  respostaCorreta: number;
};

type Props = {
  onQuestoesGeradas: (questoes: Questao[]) => void;
};

export default function UploadForm({ onQuestoesGeradas }: Props) {
  const [carregando, setCarregando] = useState(false);

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setCarregando(true);

    try {
      const resposta = await fetch('/api/gerar', {
        method: 'POST',
        body: formData,
      });

      const dados = await resposta.json();
      const questoes = JSON.parse(dados.questoes);
      onQuestoesGeradas(questoes);
    } catch (erro) {
      console.error('Erro ao enviar arquivo:', erro);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <form onSubmit={handleUpload}>
      <input type="file" name="arquivo" accept=".json" required />
      <br></br>
      <button type="submit" disabled={carregando}>
        {carregando ? 'Gerando...' : 'Enviar'}
      </button>
    </form>
  );
}
