# Orchestrator CLI

A command-line interface for the multi-agent code orchestration backend.

## Installation

```bash
npm install
npm run build
npm start
```

Or globally (after building):

```bash
npm install -g .
orchestrator --help
```

## Quick Start

### 1. Configure the server URL

```bash
orchestrator config set apiBaseUrl http://localhost:3000
```

### 2. Set owner requirements

Create a JSON file with your specification (see `examples/owner-spec.json`):

```bash
orchestrator context set ./owner-spec.json
```

### 3. Run orchestration on your code

```bash
orchestrator run ./solution.py
```

With optional validation:

```bash
orchestrator run ./solution.py -v ./validation.json
```

### 4. Custom retry limit

```bash
orchestrator run ./solution.py -m 5
```

---

## Commands

### config

Manage CLI configuration (server URL, API key).

```bash
orchestrator config set apiBaseUrl <url>
orchestrator config set apiKey <token>
orchestrator config show
orchestrator config reset
```

### context

Manage owner requirements.

```bash
orchestrator context set <file>    # Load from JSON
orchestrator context show          # Display current context
```

### run

Execute orchestration on a code file.

```bash
orchestrator run <codePath> [options]

Options:
  -f, --filename <name>      Filename when executing (default: solution.py)
  -a, --args <args...>       Arguments to pass to the script
  -v, --validation <file>    Validation spec JSON file
  -m, --maxRetries <n>       Max retries (default: 3)
```

---

## Example Files

### Owner Specification (`owner-spec.json`)

```json
{
  "goals": ["Compute sum of two integers"],
  "constraints": ["Must run in Python 3", "No external dependencies"],
  "acceptanceCriteria": ["Output matches expected sum"],
  "specificationDetails": "Implement add(a, b) that returns a + b",
  "runtimeRequirements": ["Python 3.8+"],
  "testRequirements": ["Test with positive, negative, and zero"],
  "outputFormatExpectations": ["Plain text integer, single line"]
}
```

### Validation Spec (`validation.json`)

```json
{
  "expectedOutput": "8",
  "expectedType": "number",
  "testCases": [
    {
      "expectedExitCode": 0,
      "expectedStdoutContains": "8"
    }
  ]
}
```

### Code File (`solution.py`)

```python
def add(a, b):
    return a + b

if __name__ == "__main__":
    result = add(5, 3)
    print(result)
```

---

## Architecture

```
src/
├── index.ts              CLI entry point (commands)
├── config.ts             Config manager (~/.orchestrator/config.json)
├── api.ts                HTTP client (axios wrapper)
├── formatters.ts         Pretty-printing utilities (chalk + table)
├── commands/
│   ├── context.ts        Set/show owner requirements
│   ├── config.ts         Manage CLI configuration
│   └── run.ts            Main orchestration command
└── tests/
    └── formatters.test.ts
```

## Workflow

1. **Configure**: Set the backend URL
2. **Define**: Load owner requirements as JSON
3. **Code**: Write/upload the code file
4. **Validate**: Optionally provide validation criteria
5. **Run**: Execute orchestration with automatic retry and phase display

### Phase Display

Each run displays:

- **Phase 1**: Prompt construction strategy
- **Phase 2**: Compilation + execution (stdout/stderr)
- **Phase 4**: Validation result + test cases
- **Phase 3**: Error classification + fix prompt (if errors)

### Retry Loop

If validation fails:
- Retries up to `maxRetries` (default 3)
- Shows progress and updated error analysis each iteration
- Escalates to owner if max retries exceeded

---

## Development

```bash
npm run build      # Compile TypeScript
npm start          # Run CLI
npm test           # Run tests
```

## Testing

```bash
npm test
```

Tests cover:
- Formatter output functions
- Configuration management
- Command execution (mock-friendly)

---

## Error Handling

All commands have proper error handling:
- File not found → clear error message
- Server unavailable → health check fails
- Invalid JSON → parse error with context
- Max retries hit → escalation message

---

## Configuration Storage

CLI configuration is stored in `~/.orchestrator/config.json`:

```json
{
  "apiBaseUrl": "http://localhost:3000",
  "apiKey": "optional-api-key"
}
```

Reset to defaults anytime:

```bash
orchestrator config reset
```
