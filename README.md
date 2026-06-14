# Multi-Agent Orchestrator 🤖

A production-ready AI-powered code orchestration system with automated error detection and fixing using Claude AI.

**GitHub:** [https://github.com/Geetarty/multi-agent-orchestrator](https://github.com/Geetarty/multi-agent-orchestrator)

---

## 📋 Overview

The Multi-Agent Orchestrator is a 4-phase system that validates and fixes code against owner specifications:

1. **Phase 1: Prompt Construction** — Orchestrator builds instructions from owner requirements
2. **Phase 2: Execution** — Worker compiles and runs Python code in sandbox
3. **Phase 3: Error Analysis** — System classifies failures (syntax, runtime, logic)
4. **Phase 4: Validation** — Output validated against acceptance criteria

If code fails, **Claude AI automatically generates fixes** and retries (max 3 attempts).

---

## ✨ Features

✅ **Web Dashboard** — Beautiful UI for code submission and results  
✅ **CLI Client** — Command-line interface for automation  
✅ **Claude AI Integration** — Automatic code fixing  
✅ **PostgreSQL Persistence** — Locked owner requirements  
✅ **Syntax Highlighting** — Generated code with proper formatting  
✅ **Error Analysis** — Explains what went wrong & how it was fixed  
✅ **4-Phase Pipeline** — Comprehensive validation workflow  
✅ **Safety Rails** — Max retry limit + spec locking  

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+
- **Python** 3.8+
- **PostgreSQL** (custom setup on port 5433)
- **Claude API Key** from [console.anthropic.com](https://console.anthropic.com)

### Installation

```bash
git clone https://github.com/Geetarty/multi-agent-orchestrator.git
cd multi-agent-orchestrator
```

#### 1. Setup PostgreSQL

```bash
# Create custom data directory
mkdir ~/orchestrator-data

# Start PostgreSQL on port 5433
postgres -D ~/orchestrator-data -p 5433 &
```

#### 2. Setup Backend

```bash
cd backend
npm install

# Create .env file
cat > .env << 'EOF'
ANTHROPIC_API_KEY=sk-ant-your-key-here
DB_HOST=localhost
DB_PORT=5433
DB_NAME=orchestrator
DB_USER=geetarthmeduri
EOF

# Build & start
npm run build
PORT=3001 npm start
```

Server runs on `http://localhost:3001`

#### 3. Setup CLI (Optional)

```bash
cd orchestrator-cli
npm install
npm run build

# Test
node dist/index.js config show
```

---

## 📖 Usage

### Web Dashboard

Open **http://localhost:3001**

1. Set Owner Requirements (JSON)
2. Submit Python Code
3. Set Validation (expected output)
4. Click **Run**
5. View Generated Code & Error Analysis

### CLI Client

```bash
cd orchestrator-cli

# Set requirements
node dist/index.js context set examples/owner-spec.json

# Run orchestration
node dist/index.js run examples/solution.py -v examples/validation.json
```

---

## 🧪 Example

**Owner Requirements:**
```json
{
  "goals": ["Compute sum of two integers"],
  "constraints": ["Must run in Python 3"],
  "acceptanceCriteria": ["Output matches expected sum"],
  "specificationDetails": "Implement add(a, b). Call add(5, 3).",
  "runtimeRequirements": ["Python 3.8+"],
  "testRequirements": ["Test with positive integers"],
  "outputFormatExpectations": ["Plain text integer"]
}
```

**Code:**
```python
def add(a, b):
    return a + b
print(add(5, 3))
```

**Validation:**
```json
{"expectedOutput": "8"}
```

**Result:** ✅ SUCCESS

---

## 🏗️ Architecture
