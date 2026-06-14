const errorExplanations = {
  syntax_error: {
    why: "Python code has incorrect syntax that prevents compilation",
    common: ["Missing colons after function/class/loop definitions", "Mismatched parentheses or brackets", "Invalid operator usage"],
    fix: "Claude corrects the syntax according to Python rules"
  },
  indentation_error: {
    why: "Code blocks are not properly indented (Python is indent-sensitive)",
    common: ["Inconsistent spacing for nested blocks", "Missing indentation for function/loop body"],
    fix: "Claude fixes indentation to match Python standards"
  },
  undefined_variable: {
    why: "Variable used before being defined or typo in variable name",
    common: ["Variable name not defined", "Typo in variable name", "Variable out of scope"],
    fix: "Claude defines missing variables or corrects typos"
  },
  type_error: {
    why: "Operation attempted on incompatible data types",
    common: ["String + Integer without conversion", "Calling non-callable objects", "Wrong argument types"],
    fix: "Claude converts types or adds proper type handling"
  },
  logic_error: {
    why: "Code runs but produces wrong output",
    common: ["Wrong algorithm logic", "Incorrect calculations", "Wrong comparison operators"],
    fix: "Claude fixes the algorithm or logic flow"
  },
  no_error: {
    why: "Code executed successfully",
    common: ["Code is correct"],
    fix: "No fix needed"
  }
};

async function fetchServerStatus() {
  try {
    const response = await fetch("http://localhost:3001/health");
    const statusBadge = document.getElementById("statusBadge");
    if (response.ok) {
      statusBadge.textContent = "✓ Online";
      statusBadge.className = "status online";
    } else {
      statusBadge.textContent = "✗ Offline";
      statusBadge.className = "status offline";
    }
  } catch {
    document.getElementById("statusBadge").textContent = "✗ Offline";
    document.getElementById("statusBadge").className = "status offline";
  }
}

async function loadOwnerRequirements() {
  try {
    const response = await fetch("http://localhost:3001/api/context/owner");
    if (response.ok) {
      const data = await response.json();
      displayOwnerRequirements(data.ownerRequirements);
    }
  } catch (error) {
    console.error("Error loading requirements:", error);
  }
}

function displayOwnerRequirements(requirements) {
  const container = document.querySelector(".requirements-display");
  if (!requirements) return;

  let html = `
    <div class="requirement-section">
      <h4>Goals</h4>
      <ul>${requirements.goals.map(g => `<li>→ ${g}</li>`).join("")}</ul>
    </div>
    <div class="requirement-section">
      <h4>Constraints</h4>
      <ul>${requirements.constraints.map(c => `<li>→ ${c}</li>`).join("")}</ul>
    </div>
  `;
  container.innerHTML = html;
}

async function setRequirements() {
  const input = document.getElementById("requirementsInput").value;
  try {
    const requirements = JSON.parse(input);
    const response = await fetch("http://localhost:3001/api/context/owner", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requirements),
    });
    if (response.ok) {
      alert("Requirements set successfully!");
      document.getElementById("setRequirementsForm").style.display = "none";
      loadOwnerRequirements();
    }
  } catch (error) {
    alert("Error: Invalid JSON or server error");
  }
}

async function runOrchestration() {
  const code = document.getElementById("pythonCode").value;
  const validationJson = document.getElementById("validationJson").value;
  
  try {
    const validation = JSON.parse(validationJson);
    const response = await fetch("http://localhost:3001/api/orchestrator/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code,
        validationRequest: validation,
        filename: "solution.py",
      }),
    });

    if (response.ok) {
      const data = await response.json();
      displayResults(data);
      displayErrorAnalysis(data);
      displayGeneratedCode(data);
    } else {
      alert("Error running orchestration");
    }
  } catch (error) {
    alert("Error: Invalid JSON validation or server error");
  }
}

function displayResults(data) {
  const resultsPanel = document.getElementById("resultsPanel");
  
  if (!data.results || data.results.length === 0) {
    resultsPanel.innerHTML = "<p>No results available</p>";
    return;
  }
  
  const lastResult = data.results[data.results.length - 1];
  const compileSuccess = lastResult.execution?.compile?.success ?? false;
  const runSuccess = lastResult.execution?.run?.success ?? false;
  const validationPassed = lastResult.validation?.passed ?? false;
  const strategy = lastResult.prompt?.strategy ?? "N/A";
  
  const output = lastResult.execution?.run?.stdout?.length > 0 
    ? lastResult.execution.run.stdout.map(l => l.line).join("")
    : "No output";
  
  let html = `
    <div class="result-section">
      <h4>Phase 1: Prompt Construction</h4>
      <p>Strategy: ${strategy}</p>
    </div>
    
    <div class="result-section">
      <h4>Phase 2: Execution</h4>
      <p>Compilation: ${compileSuccess ? "✓ Passed" : "✗ Failed"}</p>
      <p>Execution: ${runSuccess ? "✓ Passed" : "✗ Failed"}</p>
      <p>Output: <code>${output}</code></p>
    </div>
    
    <div class="result-section">
      <h4>Phase 4: Validation</h4>
      <p>Status: ${validationPassed ? "✓ PASSED" : "✗ FAILED"}</p>
    </div>
    
    <div class="result-section">
      <h4>Summary</h4>
      <p><strong>Final Status:</strong> ${data.finalStatus}</p>
      <p><strong>Total Attempts:</strong> ${data.results.length}</p>
      ${data.escalatedToOwner ? `<p style="color: orange;"><strong>⚠️ Escalated to Owner</strong></p>` : ""}
    </div>
  `;
  
  resultsPanel.innerHTML = html;
}

function displayErrorAnalysis(data) {
  const panel = document.getElementById("errorAnalysisPanel");
  const content = document.getElementById("errorAnalysisContent");
  
  if (!data.results || data.results.length <= 1) {
    panel.style.display = "none";
    return;
  }
  
  panel.style.display = "block";
  
  const firstResult = data.results[0];
  const analysis = firstResult.analysis;
  const classification = analysis?.classification || "unknown";
  const explanation = errorExplanations[classification] || errorExplanations.no_error;
  
  const errorMessage = firstResult.execution?.compile?.stderr?.[0] || 
                      firstResult.execution?.run?.stderr?.[0] || 
                      "Unknown error";
  
  let html = `
    <div class="error-analysis fixed">
      <h4>✅ Error Detected & Fixed</h4>
      
      <div class="error-label">What Went Wrong:</div>
      <div class="error-details">
        <strong>Error Type:</strong> ${classification.replace(/_/g, ' ').toUpperCase()}
      </div>
      <div class="error-details">
        ${errorMessage}
      </div>
      
      <div class="error-label">Why This Happened:</div>
      <div class="fix-explanation">
        ${explanation.why}
        <br><br>
        <strong>Common causes:</strong>
        <ul style="margin-top: 0.5rem; margin-left: 1rem;">
          ${explanation.common.map(c => `<li>• ${c}</li>`).join("")}
        </ul>
      </div>
      
      <div class="error-label">How Claude Fixed It:</div>
      <div class="fix-explanation" style="background: #f0fdf4; border-left-color: #10b981; color: #166534;">
        ${explanation.fix}
      </div>
      
      <div class="error-label">Correction Applied:</div>
      <div class="code-comparison">
        <div class="code-before">
          <h5>❌ BEFORE (Broken)</h5>
          <code>${escapeHtml(data.results[0].finalCode.substring(0, 100))}...</code>
        </div>
        <div class="code-after">
          <h5>✅ AFTER (Fixed)</h5>
          <code>${escapeHtml(data.results[data.results.length - 1].finalCode.substring(0, 100))}...</code>
        </div>
      </div>
    </div>
  `;
  
  content.innerHTML = html;
}

function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

function displayGeneratedCode(data) {
  const codePanel = document.getElementById("generatedCodePanel");
  const codeLabel = document.getElementById("codeModifiedLabel");
  
  if (!data.results || data.results.length === 0) {
    codePanel.textContent = "// No code generated";
    return;
  }
  
  const lastResult = data.results[data.results.length - 1];
  const finalCode = lastResult.finalCode || "# No final code available";
  const isModified = data.results.length > 1;
  
  codePanel.textContent = finalCode;
  codeLabel.style.display = isModified ? "block" : "none";
  
  if (window.hljs) {
    hljs.highlightElement(codePanel);
  }
}

document.getElementById("setRequirementsBtn").addEventListener("click", () => {
  const form = document.getElementById("setRequirementsForm");
  form.style.display = form.style.display === "none" ? "block" : "none";
});

document.getElementById("submitRequirements").addEventListener("click", setRequirements);
document.getElementById("runBtn").addEventListener("click", runOrchestration);

fetchServerStatus();
loadOwnerRequirements();
setInterval(fetchServerStatus, 5000);
