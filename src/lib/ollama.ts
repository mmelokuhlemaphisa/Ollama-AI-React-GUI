export async function queryOllama(prompt: string): Promise<string> {
  const response = await fetch("http://localhost:11434/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "gemma:2b",
      prompt,
      stream: false,
    }),
  });
  const data = await response.json();
  return data.response as string;
}
