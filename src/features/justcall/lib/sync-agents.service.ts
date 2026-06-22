import { listJustCallUsers } from "@/lib/justcall";

interface SyncAgentsOptions {
  maxPages?: number;
}

export async function syncJustCallAgents(options: SyncAgentsOptions = {}) {
  const agents = await listJustCallUsers({ maxPages: options.maxPages });

  return {
    fetched: agents.length,
    processed: agents.length,
    agents: agents.map((agent) => ({
      id: agent.id,
      name: agent.name ?? null,
      email: agent.email ?? null,
      role: agent.role ?? null,
      available: agent.available ?? null,
    })),
  };
}
