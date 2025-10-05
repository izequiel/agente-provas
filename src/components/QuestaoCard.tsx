type Props = {
  pergunta: string;
  alternativas: string[];
  respostaCorreta: number;
};

export default function QuestaoCard({ pergunta, alternativas, respostaCorreta }: Props) {
  return (
    <div className="questao-card">
      <strong>{pergunta}</strong>
      <ul>
        {alternativas.map((alt, idx) => (
          <li key={idx}>
            {alt} {idx === respostaCorreta && <strong>✅</strong>}
          </li>
        ))}
      </ul>
    </div>
  );
}
