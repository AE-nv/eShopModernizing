---
name: cobol-analysis
description: COBOL code analysis patterns for discovering flows, components, and data structures. Use when analyzing COBOL, JCL, CICS, IMS, or mainframe codebases.
license: MIT
---

# COBOL Code Analysis Skill

[Content will be in separate files due to length - see cobol-skill-full.md]

This skill provides specialized knowledge for analyzing COBOL programs, JCL jobs, and mainframe applications including CICS, IMS, DB2, and VSAM.

## When to Use
- Analyzing `.cbl`, `.cob`, `.CBL`, `.COB` source files
- Examining `.lst`, `.LST` compilation listings  
- Processing `.jcl`, `.JCL` job streams
- Understanding copybooks (`.cpy`, `.CPY`)

See the full skill document for complete patterns and examples.

---

## ast-grep Integration (Deterministic Search)

COBOL is supported via ast-grep's custom language feature using [tree-sitter-cobol](https://github.com/yutaro-sakamoto/tree-sitter-cobol). See the `ast-grep` skill for full setup instructions (`sgconfig.yml`, library compilation).

> **Prerequisite**: custom language must be registered in `sgconfig.yml` before these commands work. See `ast-grep` skill → "Custom Language: COBOL" section.

### Quick COBOL Patterns

```bash
# Program inventory — find all PROGRAM-IDs
ast-grep run -p 'PROGRAM-ID. $NAME.' -l cobol --json

# Section inventory
ast-grep scan --inline-rules 'id: sections
language: cobol
rule:
  kind: section_header' --json src/cobol/

# Paragraph inventory
ast-grep scan --inline-rules 'id: paragraphs
language: cobol
rule:
  kind: paragraph_header' --json src/cobol/

# External calls (CALL 'program' USING ...)
ast-grep scan --inline-rules 'id: calls
language: cobol
rule:
  kind: call_statement' --json src/cobol/

# PERFORM calls (intra-program control flow)
ast-grep scan --inline-rules 'id: performs
language: cobol
rule:
  kind: perform_statement_call_proc' --json src/cobol/

# Inline PERFORM loops (PERFORM UNTIL / VARYING)
ast-grep scan --inline-rules 'id: loops
language: cobol
rule:
  kind: perform_statement_loop' --json src/cobol/

# File operations (OPEN/READ/WRITE/CLOSE)
ast-grep scan --inline-rules 'id: file-io
language: cobol
rule:
  any:
    - kind: open_statement
    - kind: read_statement
    - kind: write_statement
    - kind: close_statement' --json src/cobol/

# SELECT ... ASSIGN (file-control mapping)
ast-grep scan --inline-rules 'id: selects
language: cobol
rule:
  kind: select_statement' --json src/cobol/

# COPY statements (copybook dependencies)
ast-grep scan --inline-rules 'id: copies
language: cobol
rule:
  kind: copy_statement' --json src/cobol/

# COPY with REPLACING (parameterized copybooks)
ast-grep scan --inline-rules 'id: copy-replacing
language: cobol
rule:
  kind: copy_statement
  has:
    kind: replacing_clause
    stopBy: end' --json src/cobol/

# EVALUATE (business decision tables)
ast-grep scan --inline-rules 'id: evaluates
language: cobol
rule:
  kind: evaluate_header' --json src/cobol/

# GOTO detection (legacy control flow anti-pattern)
ast-grep scan --inline-rules 'id: gotos
language: cobol
rule:
  kind: goto_statement' --json src/cobol/

# SEARCH / SEARCH ALL (table lookups)
ast-grep scan --inline-rules 'id: searches
language: cobol
rule:
  kind: search_statement' --json src/cobol/

# Data items with OCCURS (tables/arrays)
ast-grep scan --inline-rules 'id: tables
language: cobol
rule:
  kind: data_description
  has:
    kind: occurs_clause
    stopBy: end' --json src/cobol/
```

### COBOL Rule File — Find Programs Calling Subprograms

```yaml
id: external-calls-in-procedure
language: cobol
rule:
  kind: call_statement
  inside:
    kind: procedure_division
    stopBy: end
```

### Limitations

- **COBOL-85 only**: tree-sitter-cobol grammar covers COBOL-85 syntax. COBOL 2002/2014 features may not parse.
- **CICS/IMS/DB2**: `EXEC CICS ... END-EXEC`, `EXEC SQL ... END-EXEC`, and `CALL 'CBLTDLI'` are treated as opaque text. Use `grep_search` for these.
- **Non-standard extensions**: IBM-specific features (reference modification quirks, compiler directives) may cause parse issues.
- For full ast-grep documentation, rule development, and debugging: see the `ast-grep` skill.
