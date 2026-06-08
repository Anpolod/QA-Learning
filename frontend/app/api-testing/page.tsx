import { ArrowUpRight, Braces, FileJson, FlaskConical, Globe, KeyRound, ListChecks } from "lucide-react";
import { publicApiBase } from "@/lib/api";

export const metadata = {
  title: "API Testing | QA Learning",
  description: "Live API explorer, request reference, and OpenAPI spec for hands-on API testing practice."
};

const httpMethods: { method: string; use: string; idempotent: string }[] = [
  { method: "GET", use: "Read a resource. No body. Safe to repeat.", idempotent: "Yes" },
  { method: "POST", use: "Create a resource or run an action. Sends a body.", idempotent: "No" },
  { method: "PUT", use: "Replace a resource fully with the sent body.", idempotent: "Yes" },
  { method: "PATCH", use: "Update part of a resource.", idempotent: "No" },
  { method: "DELETE", use: "Remove a resource.", idempotent: "Yes" }
];

const statusCodes: { code: string; meaning: string }[] = [
  { code: "200 OK", meaning: "Request succeeded; response has the data." },
  { code: "201 Created", meaning: "Resource created (usually after POST)." },
  { code: "400 Bad Request", meaning: "Invalid input; check the request body/params." },
  { code: "401 Unauthorized", meaning: "Missing or invalid auth token." },
  { code: "403 Forbidden", meaning: "Authenticated but not allowed (e.g. non-admin)." },
  { code: "404 Not Found", meaning: "Resource or route does not exist." },
  { code: "422 Unprocessable", meaning: "Validation failed (FastAPI schema error)." },
  { code: "429 Too Many Requests", meaning: "Rate/usage limit reached." },
  { code: "500 Server Error", meaning: "Bug or unhandled error on the backend." }
];

export default function ApiTestingPage() {
  const apiBase = publicApiBase();
  const swaggerUrl = `${apiBase}/api/docs`;
  const redocUrl = `${apiBase}/api/redoc`;
  const openApiUrl = `${apiBase}/openapi.json`;

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <FlaskConical className="h-6 w-6 text-coral" />
          <h1 className="text-3xl font-bold">API Testing</h1>
        </div>
        <p className="mt-3 max-w-3xl text-slate-600">
          Explore and exercise the live platform API. Use the embedded Swagger UI to send real requests, read the quick
          reference for HTTP methods and status codes, then import the OpenAPI spec into Postman or Insomnia.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <a
            href={swaggerUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-md bg-ink px-4 py-2 text-sm text-white"
          >
            <Globe className="h-4 w-4" /> Open Swagger in new tab <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
          <a
            href={openApiUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-4 py-2 text-sm"
          >
            <FileJson className="h-4 w-4 text-amber" /> openapi.json
          </a>
          <a
            href={redocUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-4 py-2 text-sm"
          >
            <Braces className="h-4 w-4 text-mint" /> ReDoc
          </a>
        </div>
      </section>

      <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-coral" />
          <h2 className="text-lg font-semibold">Live API explorer (Swagger UI)</h2>
        </div>
        <p className="mt-1 text-sm text-slate-600">
          Try endpoints with “Try it out”. If the frame is blocked by your browser, use the Swagger button above.
        </p>
        <div className="mt-4 overflow-hidden rounded-md border border-slate-200">
          <iframe
            src={swaggerUrl}
            title="Swagger UI"
            className="h-[70vh] w-full bg-white"
            sandbox="allow-scripts allow-forms allow-same-origin allow-popups"
          />
        </div>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-2">
            <ListChecks className="h-5 w-5 text-mint" />
            <h2 className="text-lg font-semibold">HTTP methods</h2>
          </div>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b text-slate-500">
                  <th className="py-2 pr-3 font-medium">Method</th>
                  <th className="py-2 pr-3 font-medium">When to use</th>
                  <th className="py-2 font-medium">Idempotent</th>
                </tr>
              </thead>
              <tbody>
                {httpMethods.map((row) => (
                  <tr key={row.method} className="border-b last:border-0 align-top">
                    <td className="py-2 pr-3 font-mono font-semibold text-coral">{row.method}</td>
                    <td className="py-2 pr-3 text-slate-700">{row.use}</td>
                    <td className="py-2 text-slate-700">{row.idempotent}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-2">
            <Braces className="h-5 w-5 text-amber" />
            <h2 className="text-lg font-semibold">Status codes</h2>
          </div>
          <div className="mt-3 grid gap-2">
            {statusCodes.map((row) => (
              <div key={row.code} className="flex gap-3 text-sm">
                <span className="w-36 shrink-0 font-mono font-semibold text-slate-800">{row.code}</span>
                <span className="text-slate-600">{row.meaning}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5">
        <div className="flex items-center gap-2">
          <KeyRound className="h-5 w-5 text-coral" />
          <h2 className="text-lg font-semibold">Auth & testing notes</h2>
        </div>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-700">
          <li>
            Protected and admin endpoints need a JWT. Get one from <span className="font-mono">POST /api/auth/login</span>,
            then send it as <span className="font-mono">Authorization: Bearer &lt;token&gt;</span>.
          </li>
          <li>
            Base URL: <span className="font-mono">{apiBase}</span>. All app routes are under <span className="font-mono">/api</span>.
          </li>
          <li>
            To test in Postman/Insomnia: import <span className="font-mono">{openApiUrl}</span> — every endpoint, schema, and
            example loads automatically.
          </li>
          <li>Validation errors return 422 with a JSON list of the exact fields that failed — read them before retrying.</li>
        </ul>
      </section>
    </main>
  );
}
