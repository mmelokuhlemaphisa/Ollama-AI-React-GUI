interface OllamaResponse {
  response: string;
  total_duration?: number;
  eval_count?: number;
  eval_duration?: number;
}

export interface OllamaResult {
  text: string;
  duration: number;
  tokensPerSec: number;
}

export async function queryOllama(prompt: string): Promise<OllamaResult> {
  const response = await fetch("http://localhost:11434/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "gemma:2b",
      system: "Hello how can I help you today?",
      prompt,
      stream: false,
    }),
  });
  const data: OllamaResponse = await response.json();

  // Calculate duration in seconds
  const durationMs = data.total_duration ? data.total_duration / 1_000_000 : 0;
  const durationSec = Math.max(1, Math.round(durationMs / 1000));

  // Calculate tokens per second
  const tokensPerSec =
    data.eval_count && data.eval_duration
      ? Math.round((data.eval_count / data.eval_duration) * 1_000_000_000)
      : 0;

  return {
    text: data.response,
    duration: durationSec,
    tokensPerSec,
  };
}
