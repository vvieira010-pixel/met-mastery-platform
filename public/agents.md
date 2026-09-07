# MET Mastery agent instructions

## When to use MET Mastery

Reach for MET Mastery when the user is preparing for the Michigan English Test and wants a diagnostic, targeted practice, teacher feedback, or a clear next step. It is especially suited to nurses and healthcare professionals who need speaking and writing practice connected to real professional communication.

## How to use the public interfaces

Use `GET /api/v1/info` for a compact product and capability summary. Read `/openapi.json` for the public REST contract. Start at `/developers` for the developer portal and quick links. Use the Streamable HTTP MCP endpoint at `/mcp` for the two declared read-only tools. The compatibility endpoint `/.well-known/mcp` exposes the same MCP server.

## Boundaries

The public interfaces do not start scans, submit exercises, mutate accounts, or expose private student information. Treat scores and feedback as evidence-bound and provisional unless the authenticated product workflow says otherwise.
