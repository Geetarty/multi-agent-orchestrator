# multi-agent-orchestrator

TypeScript/Node.js backend implementing a multi-agent orchestration flow with four phases:
1. Prompt construction
2. Worker compile/run
3. Error analysis
4. Validation against owner spec

## Run

```bash
npm install
npm run build
npm start
```

## API

- `POST /api/context/owner` – set immutable owner requirements (spec lock)
- `GET /api/context/owner` – read owner requirements
- `POST /api/orchestrator/phase-1/prompt` – construct worker instructions
- `POST /api/orchestrator/phase-2/execute` – compile and run Python code with structured stdout/stderr and timeout stall detection
- `POST /api/orchestrator/phase-3/analyze` – classify syntax/runtime/logic/spec errors and return targeted fix prompt
- `POST /api/orchestrator/phase-4/validate` – validate output against acceptance criteria and tests
- `POST /api/orchestrator/run` – execute full orchestration cycle with retry handling and escalation after max retries
