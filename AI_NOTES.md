\# AI Collaboration Notes



\## How I Used AI in This Project



I built DocuMind with Claude (Anthropic) as my primary development partner throughout the entire project.



\## Key Problems Solved with AI Assistance



\### 1. PDF Parsing Compatibility

\- \*\*Problem:\*\* `pdf-parse` package crashed on Node 22 due to a test file path bug

\- \*\*Solution:\*\* Switched to `pdf2json`, which parses PDFs buffer-first without filesystem access

\- \*\*How AI helped:\*\* Identified the root cause and suggested the alternative library



\### 2. Embedding Dimension Mismatch

\- \*\*Problem:\*\* Gemini embeddings API key was invalid; Supabase vector column was set to wrong dimensions

\- \*\*Solution:\*\* Switched to Cohere `embed-english-v3.0` (1024 dimensions), updated the pgvector column and recreated the `match\_chunks` SQL function

\- \*\*How AI helped:\*\* Diagnosed the mismatch, wrote the migration SQL, updated all affected code



\### 3. Citation Metadata Bug

\- \*\*Problem:\*\* RAG responses showed `\[Source: undefined, chunk undefined]` because the Supabase `match\_chunks` RPC function only returned `content` and `similarity` — not `document\_name` or `chunk\_index`

\- \*\*Root cause:\*\* The `RETURNS TABLE` definition was missing those columns

\- \*\*Solution:\*\* Recreated the function to include `document\_name` and `chunk\_index` in both the return signature and SELECT statement

\- \*\*How AI helped:\*\* Traced the bug through the full pipeline (upload → chunk → embed → store → retrieve → render) and pinpointed the SQL function as the source



\### 4. Deployment Configuration

\- \*\*Problem:\*\* CORS errors between Vercel frontend and Render backend; React Router 404s on Vercel

\- \*\*Solution:\*\* Added `FRONTEND\_URL` env var to Render, created `vercel.json` with rewrite rules

\- \*\*How AI helped:\*\* Identified both issues and provided exact config fixes



\## My Debugging Process

I used AI as a thought partner — sharing screenshots of errors, pasting log outputs, and working through each layer of the stack systematically. Rather than accepting workarounds, I pushed to find root causes (e.g., the citation bug was in the SQL function, not the JS code).



\## Stack Decisions

\- \*\*Cohere over Gemini\*\* for embeddings — more reliable API, better free tier

\- \*\*Groq LLaMA-3.3-70b\*\* for generation — fast inference, good instruction following

\- \*\*Supabase pgvector\*\* for vector storage — integrated auth, no separate vector DB needed

\- \*\*pdf2json\*\* over pdf-parse — Node 22 compatible, buffer-based parsing

