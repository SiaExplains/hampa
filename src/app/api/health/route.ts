import { connection } from "next/server";
import { APP_VERSION } from "@/lib/version";

export type HealthResponse = {
  status: "ok";
  version: string;
  // Becomes a real probe when the database arrives in H1.
  database: "not_configured";
};

export async function GET() {
  // A health check must answer from a live function, never a build-time prerender.
  await connection();

  const body: HealthResponse = {
    status: "ok",
    version: APP_VERSION,
    database: "not_configured",
  };
  return Response.json(body, {
    headers: { "cache-control": "no-store" },
  });
}
