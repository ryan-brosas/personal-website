export type DirectoryCategory = Readonly<{
  id: string;
  title: string;
  description: string;
  entries: ReadonlyArray<Readonly<{
    name: string;
    description: string;
    url: `https://${string}`;
  }>>;
}>;

// Neutral official starting points, not rankings or endorsements. Keep claims
// limited to each product's public role and re-check links before publication.
export const AI_DIRECTORY: ReadonlyArray<DirectoryCategory> = [
  {
    id: "model-providers",
    title: "Model providers",
    description: "Organizations that publish hosted foundation-model APIs and model documentation.",
    entries: [
      { name: "Anthropic", description: "Claude models and API documentation.", url: "https://www.anthropic.com/" },
      { name: "Cohere", description: "Language and embedding models for enterprise applications.", url: "https://cohere.com/" },
      { name: "Google AI", description: "Gemini model documentation and developer tools.", url: "https://ai.google.dev/" },
      { name: "Mistral AI", description: "Hosted and open-weight model documentation.", url: "https://mistral.ai/" },
      { name: "OpenAI", description: "GPT models, APIs, and developer documentation.", url: "https://openai.com/" },
    ],
  },
  {
    id: "model-access",
    title: "Model access and routing",
    description: "Platforms that expose or route requests across one or more model providers.",
    entries: [
      { name: "Amazon Bedrock", description: "Managed access to foundation models on AWS.", url: "https://aws.amazon.com/bedrock/" },
      { name: "Azure AI Foundry", description: "Microsoft's platform for model access and AI application development.", url: "https://ai.azure.com/" },
      { name: "OpenRouter", description: "One API surface for routing requests across supported models.", url: "https://openrouter.ai/" },
      { name: "Gemini Enterprise", description: "Google Cloud platform for enterprise AI agents and model-backed workflows.", url: "https://docs.cloud.google.com/gemini-enterprise-agent-platform" },
    ],
  },
  {
    id: "local-runtimes",
    title: "Local model runtimes",
    description: "Tools for running supported models on your own machine or infrastructure.",
    entries: [
      { name: "llama.cpp", description: "Local inference runtime for supported model formats.", url: "https://github.com/ggml-org/llama.cpp" },
      { name: "LM Studio", description: "Desktop application for discovering and running local models.", url: "https://lmstudio.ai/" },
      { name: "Ollama", description: "Local model runtime with a command-line and HTTP interface.", url: "https://ollama.com/" },
    ],
  },
  {
    id: "agent-frameworks",
    title: "Agent and workflow frameworks",
    description: "Libraries and frameworks for composing model calls, tools, state, and workflow steps.",
    entries: [
      { name: "LangGraph", description: "Graph-based orchestration for stateful agent workflows.", url: "https://langchain-ai.github.io/langgraph/" },
      { name: "Mastra", description: "TypeScript framework for agents, workflows, tools, and evaluations.", url: "https://mastra.ai/" },
      { name: "Pydantic AI", description: "Python agent framework built around typed application contracts.", url: "https://pydantic.dev/docs/ai/overview/" },
      { name: "Vercel AI SDK", description: "TypeScript toolkit for model-backed application interfaces.", url: "https://ai-sdk.dev/" },
    ],
  },
  {
    id: "developer-assistants",
    title: "Developer assistants",
    description: "Tools that assist with code navigation, generation, review, and software-development tasks.",
    entries: [
      { name: "Claude Code", description: "Anthropic's command-line coding assistant.", url: "https://claude.com/product/claude-code" },
      { name: "Cursor", description: "Code editor with model-backed development features.", url: "https://cursor.com/" },
      { name: "GitHub Copilot", description: "Coding assistance integrated with GitHub and supported development environments.", url: "https://github.com/features/copilot" },
      { name: "Devin", description: "AI software-development agent with a desktop coding environment.", url: "https://devin.ai/" },
    ],
  },
  {
    id: "evaluation-observability",
    title: "Evaluation and observability",
    description: "Tools for inspecting traces, datasets, evaluations, and model-backed application behavior.",
    entries: [
      { name: "Arize Phoenix", description: "Open-source tracing and evaluation for AI applications.", url: "https://arize.com/docs/phoenix" },
      { name: "Braintrust", description: "Evaluation, logging, and dataset workflows for AI products.", url: "https://www.braintrust.dev/" },
      { name: "Langfuse", description: "Open-source tracing, prompt management, and evaluation tooling.", url: "https://langfuse.com/" },
    ],
  },
  {
    id: "retrieval-vector-data",
    title: "Retrieval and vector data",
    description: "Tools for storing, indexing, and retrieving external context for model-backed applications.",
    entries: [
      { name: "Chroma", description: "Open-source data infrastructure for embeddings and retrieval.", url: "https://www.trychroma.com/" },
      { name: "Pinecone", description: "Managed vector database for similarity search and retrieval.", url: "https://www.pinecone.io/" },
      { name: "Qdrant", description: "Open-source vector database and similarity-search engine.", url: "https://qdrant.tech/" },
      { name: "Weaviate", description: "Open-source vector database with managed deployment options.", url: "https://weaviate.io/" },
    ],
  },
  {
    id: "web-search-research",
    title: "Web search and research",
    description: "APIs for finding, extracting, and grounding work in current public web sources.",
    entries: [
      { name: "Brave Search API", description: "Web and news search APIs backed by Brave's independent index.", url: "https://brave.com/search/api/" },
      { name: "Exa", description: "Search and content-retrieval APIs for model-backed applications.", url: "https://exa.ai/" },
      { name: "Tavily", description: "Search and extraction APIs designed for AI applications.", url: "https://www.tavily.com/" },
    ],
  },
  {
    id: "speech-audio",
    title: "Speech and audio",
    description: "Services for speech recognition, transcription, voice generation, and audio workflows.",
    entries: [
      { name: "AssemblyAI", description: "Speech-to-text and audio-understanding APIs.", url: "https://www.assemblyai.com/" },
      { name: "Deepgram", description: "Speech recognition, text-to-speech, and voice-agent APIs.", url: "https://deepgram.com/" },
      { name: "ElevenLabs", description: "Speech generation, voice, and audio tooling.", url: "https://elevenlabs.io/" },
    ],
  },
  {
    id: "image-media-generation",
    title: "Image and media generation",
    description: "Platforms and model providers for generating images, video, and other media.",
    entries: [
      { name: "fal", description: "Hosted inference APIs for generative image, video, and audio models.", url: "https://fal.ai/" },
      { name: "Replicate", description: "Hosted model inference for image, video, audio, and language models.", url: "https://replicate.com/" },
      { name: "Runway", description: "Video-generation models and creative media tools.", url: "https://runway.com/" },
      { name: "Stability AI", description: "Generative models and tools for image, video, audio, and 3D media.", url: "https://stability.ai/" },
    ],
  },
  {
    id: "workflow-automation",
    title: "Workflow automation",
    description: "General automation platforms that can connect AI steps with existing tools and review points.",
    entries: [
      { name: "n8n", description: "Workflow automation platform with self-hosted and managed options.", url: "https://n8n.io/" },
      { name: "Zapier", description: "Hosted automation platform for connecting applications and workflow steps.", url: "https://zapier.com/" },
    ],
  },
];
