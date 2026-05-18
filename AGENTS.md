# Documentation System — Instructions

## Overview

This workspace uses a **multi-agent documentation system** to analyze codebases and produce structured documentation. The system is **language-agnostic** — all language-specific analysis is handled through dedicated skills, not hardcoded in agents.

## Agent System

The documentation workflow follows a phased approach orchestrated by specialized agents:

1. **Planning Agent** — Detects language, analyzes structure, creates state file and documentation plan
2. **Discovery Agent** — Analyzes code using the appropriate language skill to discover flows, components, and domain concepts
3. **Business Documenter** — Transforms discoveries into stakeholder-friendly business documentation
4. **Technical Documenter** — Derives functional/technical requirements from business docs using language skills
5. **Doc Coordinator** — Maintains structure, consistency, cross-references, and traceability
6. **Verification Agent** — Cross-checks documentation against source code, produces gap reports
7. **Analyst Agent** — Analyzes flows and generates diagrams on demand
8. **Security Agent** — Enforces secure development policy compliance

## Skill-First Rule

All agents follow a **mandatory skill-first rule**:

- Agents must **never** embed language-specific parsing patterns, syntax examples, or framework heuristics.
- Before performing code analysis, agents must load the appropriate language skill based on the detected language in the state file.
- Language-specific detection, tracing, and extraction rules come exclusively from skills.

## Available Language Skills

| Skill | Use When |
|-------|----------|
| `cobol-analysis` | Analyzing COBOL, JCL, CICS, IMS, or mainframe codebases |
| `java-analysis` | Analyzing Java / Spring Boot projects |
| `typescript-analysis` | Analyzing TypeScript / JavaScript / Node.js / React projects |
| `vbnet-analysis` | Analyzing VB.NET / WinForms projects |

Additional skills (e.g., `python-analysis`, `dotnet-analysis`) can be added by creating a new skill directory under `.github/skills/`.

## State Management

All agents share a single state file (`docs/[MODULE_NAME]-state.json`) managed through the `state-management` skill. This file tracks:

- Detected language
- Current phase and phase history
- Progress counters and task status
- Artifact inventory

## Documentation Output Structure

```
docs/
├── [module]-state.json
├── documentation-plan.md
├── index.md
├── system-overview.md
├── discovery/
├── business/
├── functional/
├── domain/
├── verification/
└── traceability/
```

## Adding Support for a New Language

1. Create a new skill directory: `.github/skills/<language>-analysis/`
2. Add a `SKILL.md` with language-specific detection patterns, file conventions, architectural patterns, and analysis guidance
3. The planning agent will automatically detect the language and downstream agents will load the new skill via their routing tables
