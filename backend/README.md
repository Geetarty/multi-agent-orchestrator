# Multi-Agent Orchestrator Backend

A TypeScript/Node.js HTTP API system for orchestrating multi-agent code compilation, fixing, and validation.

## Overview

This backend implements a four-phase orchestration loop:

1. **Phase 1 — Prompt Construction** — Orchestrator builds targeted instructions for the worker
2. **Phase 2 — Execution** — Worker compiles and runs code, captures structured output
3. **Phase 3 — Error Analysis** — Classify failure type and generate fix prompts
4. **Phase 4 — Validation** — Check output against owner acceptance criteria

Agents cannot modify owner requirements — they are locked after first set (safety rail).

## Quick Start

```bash
npm install
npm run build
npm start
```

Server runs on port 3000 (configurable via `PORT` env var).

## API Endpoints

### Context Setup
- `POST /api/context/owner` — Set owner requirements (locked after first call)
- `GET /api/context/owner` — Retrieve current context

### Orchestration
- `POST /api/orchestrator/phase-1/prompt` — Build instruction prompt
- `POST /api/orchestrator/phase-2/execute` — Compile + run code
- `POST /api/orchestrator/phase-3/analyze` — Classify errors
- `POST /api/orchestrator/phase-4/validate` — Validate against spec
- `POST /api/orchestrator/run` — Full pipeline in one request

### Health
- `GET /health` — Health check

## Architecture

```
services/          Core business logic
  ├── contextStore.ts           Locks owner requirements
  ├── orchestratorService.ts    Builds prompts, retry strategy
  ├── workerService.ts          Compiles + runs code
  ├── validationService.ts      Checks output against spec
  └── errorAnalysisService.ts   Classifies failures

agents/            Thin wrappers extending services
  ├── orchestratorAgent.ts
  ├── workerAgent.ts
  └── validatorAgent.ts

controllers/       HTTP request handlers
  ├── contextController.ts
  └── orchestrationController.ts

routes/            Express routers
  ├── index.ts
  ├── ownerContextRoutes.ts
  └── orchestrationRoutes.ts

types/             Shared TypeScript interfaces
  └── orchestration.ts

utils/             Utilities (logging)
  └── logger.ts

tests/             Unit tests
  └── orchestration.test.ts
```

## Example: Full Run

```bash
# 1. Set owner requirements
curl -X POST http://localhost:3000/api/context/owner \
  -H "Content-Type: application/json" \
  -d '{
    "goals": ["Return correct sum"],
    "constraints": ["must run in Python 3.11"],
    "acceptanceCriteria": ["Matches expected output"],
    "specificationDetails": "Implement add(a, b) that returns the sum.",
    "runtimeRequirements": ["python3.11"],
    "testRequirements": ["include edge cases"],
    "outputFormatExpectations": ["plain text integer"]
  }'

# 2. Run full orchestration
curl -X POST http://localhost:3000/api/orchestrator/run \
  -H "Content-Type: application/json" \
  -d '{
    "code": "def add(a, b):\n    return a + b\nprint(add(2, 3))",
    "currentCodeState": "def add(a, b):\n    return a + b\nprint(add(2, 3))",
    "validationRequest": {
      "expectedOutput": "5",
      "requiredSubstrings": ["5"]
    },
    "retryCount": 0,
    "maxRetries": 3
  }'
```

## Testing

```bash
npm test
```

10 tests cover all services: context locking, orchestration prompts, validation, and error classification.

## Key Design Decisions

- **Spec Lock** — Owner requirements are frozen after first set; agents cannot modify them
- **Retry Strategy** — Escalates from full-solution to targeted fixes across retry attempts
- **Error Classification** — Syntax → Runtime → Logic → Spec Mismatch (priority order)
- **Structured Logging** — All logs are JSON for easy parsing and monitoring
- **Type Safety** — Full TypeScript with strict mode enabled

## License

ISC

A TypeScript/Node.js HTTP API system orchestrating multi-agent code compilation, validation, and patching.

## Overview

This backend implements a four-phase orchestration loop:

1. **Phase 1 — Prompt Construction**: Build targeted instructions for the worker agent
2. **Phase 2 — Worker Execution**: Compile and run code, capture structured output
3. **Phase 3 — Error Analysis**: Classify failures and generate fix prompts
4. **Phase 4 — Validation**: Check output against owner acceptance criteria

The system includes **safety rails**: owner requirements are locked after first set, retry limits prevent infinite loops, and escalation triggers when max retries are exceeded.

## Quick Start

```bash
npm install
npm run build
npm start
```

Server listens on port 3000 (configurable via `PORT` env var).

## API Endpoints

### Owner Context
- `POST /api/context/owner` — Set owner requirements (locked after first call)
- `GET /api/context/owner` — Retrieve current context

### Orchestration (Individual Phases)
- `POST /api/orchestrator/phase-1/prompt` — Build instruction prompt
- `POST /api/orchestrator/phase-2/execute` — Compile and run code
- `POST /api/orchestrator/phase-3/analyze` — Classify error and generate fix prompt
- `POST /api/orchestrator/phase-4/validate` — Validate output vs. spec

### Orchestration (Full Pipeline)
- `POST /api/orchestrator/run` — Execute all four phases in one request

### Health
- `GET /health` — Service health check

## Example Workflow

**Step 1: Set owner requirements**
```bash
curl -X POST http://localhost:3000/api/context/owner \
  -H "Content-Type: application/json" \
  -d '{
    "goals": ["Return the sum of two numbers"],
    "constraints": ["must use Python 3.11"],
    "acceptanceCriteria": ["Output matches expected sum"],
    "specificationDetails": "Implement add(a, b) returning a + b",
    "runtimeRequirements": ["python3"],
    "testRequirements": ["edge cases"],
    "outputFormatExpectations": ["plain text integer"]
  }'
```

**Step 2: Run full orchestration**
```bash
curl -X POST http://localhost:3000/api/orchestrator/run \
  -H "Content-Type: application/json" \
  -d '{
    "code": "def add(a, b):\n  return a + b\n\nprint(add(2, 3))",
    "currentCodeState": "def add(a, b):\n  return a + b\n\nprint(add(2, 3))",
    "validationRequest": {
      "expectedOutput": "5"
    },
    "retryCount": 0,
    "maxRetries": 3
  }'
```

## Testing

```bash
npm test
```

Runs 10 unit tests covering all services and error classifications.

## Structure

```
src/
├── agents/              # Agent classes (thin wrappers over services)
├── controllers/         # Express route handlers
├── models/              # Data models (from original repo)
├── routes/              # Express route definitions
├── services/            # Core business logic
├── types/               # TypeScript interfaces
├── tests/               # Unit tests
├── utils/               # Utilities (logger)
└── server.ts            # Express app entry point
```

## Services

- **ContextStore**: Holds and locks owner requirements
- **OrchestratorService**: Builds prompts, selects retry strategy
- **WorkerService**: Compiles and runs Python code
- **ValidationService**: Checks output against spec
- **ErrorAnalysisService**: Classifies failures and generates fixes

## Environment

Create a `.env` file:
```
PORT=3000
NODE_ENV=development
```

## License

ISC
