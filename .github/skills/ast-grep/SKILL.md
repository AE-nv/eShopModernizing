---
name: ast-grep
description: Deterministic AST-based code search using ast-grep. Use when you need structural code search, pattern matching, or rule-based analysis across supported languages (Java, TypeScript, JavaScript, C#, Python, Go, Kotlin, etc.) and custom languages (COBOL via tree-sitter-cobol).
license: MIT
---

# ast-grep Skill — Deterministic Structural Code Search

ast-grep is a fast, polyglot AST-based tool for structural code search, linting, and rewriting. It uses tree-sitter grammars to parse code into ASTs and match patterns structurally rather than textually.

**Use ast-grep instead of grep/regex when:**
- You need syntax-aware matching (e.g., find function calls, not comments or strings)
- You need to match code structure regardless of whitespace or formatting
- You need relational queries (e.g., "find X inside Y" or "find X that contains Y")
- You need to extract specific parts of matched code via metavariables

**Do NOT use ast-grep when:**
- The language has no tree-sitter grammar (e.g., VB.NET, proprietary DSLs)
- A simple text search suffices (e.g., searching for a unique string literal)
- The file is not source code (e.g., config files without a tree-sitter grammar)
- CICS/IMS/DB2 embedded commands in COBOL (use `grep_search` instead)

## Supported Languages

| Category | Languages |
|----------|-----------|
| System | C, C++, Rust |
| Server-side | Go, Java, Python, C# |
| Web | JavaScript, JSX, TypeScript, TSX, HTML, CSS |
| Mobile | Kotlin, Swift |
| Config | JSON, YAML, HCL |
| Scripting | Lua, Nix |
| Custom (setup required) | COBOL (via tree-sitter-cobol) |

Full list: https://ast-grep.github.io/reference/languages.html

## Installation

```bash
# npm (recommended for CI/agent use)
npm install -g @ast-grep/cli

# cargo
cargo install ast-grep --locked

# homebrew (macOS/Linux)
brew install ast-grep
```

Verify: `ast-grep --version`

## CLI Commands Reference

### `ast-grep run` — Ad-hoc Pattern Search

The primary command for documentation agents. Search by pattern, optionally with JSON output.

```bash
# Basic pattern search
ast-grep run -p '$PATTERN' -l <lang> [paths...]

# With JSON output (for programmatic consumption)
ast-grep run -p '$PATTERN' -l <lang> --json [paths...]

# With context lines
ast-grep run -p '$PATTERN' -l <lang> -C 3 [paths...]

# Search and rewrite (interactive)
ast-grep run -p '$PATTERN' -r '$REPLACEMENT' -l <lang> --interactive [paths...]

# Apply all rewrites without confirmation
ast-grep run -p '$PATTERN' -r '$REPLACEMENT' -l <lang> -U [paths...]
```

**Key options:**
| Option | Short | Description |
|--------|-------|-------------|
| `--pattern <PAT>` | `-p` | AST pattern to match |
| `--lang <LANG>` | `-l` | Target language (java, typescript, javascript, csharp, python, etc.) |
| `--rewrite <RW>` | `-r` | Replacement pattern using captured metavariables |
| `--json[=STYLE]` | | Output as JSON (`pretty`, `stream`, `compact`) |
| `--interactive` | `-i` | Review matches one by one |
| `--update-all` | `-U` | Apply all rewrites without confirmation |
| `--context <N>` | `-C` | Show N lines of context around matches |
| `--globs <GLOB>` | | Include/exclude file paths |

### `ast-grep scan` — Rule-Based Scanning

Scan with YAML rule files for more complex matching.

```bash
# Scan with a single rule file
ast-grep scan --rule path/to/rule.yml [paths...]

# Scan with inline rule (no file needed)
ast-grep scan --inline-rules '<YAML>' [paths...]

# JSON output for programmatic use
ast-grep scan --rule rule.yml --json [paths...]
```

### `ast-grep run` with `--debug-query`

Debug pattern parsing to understand how ast-grep interprets your pattern:

```bash
ast-grep run -p '$PATTERN' -l <lang> --debug-query
```

## Pattern Syntax

### Metavariables

| Syntax | Meaning | Example |
|--------|---------|---------|
| `$VAR` | Match single named AST node | `console.log($ARG)` |
| `$$VAR` | Match single unnamed node (operators, punctuation) | `a $$OP b` |
| `$$$VAR` | Match zero or more nodes | `function $F($$$ARGS) { $$$ }` |
| `$_VAR` | Non-capturing (performance optimization) | `$_F($_ARG)` |

**Metavariable rules:**
- Must start with `$`, followed by uppercase letters, underscores, or digits
- Valid: `$META`, `$META_VAR`, `$_`, `$META1`
- Invalid: `$invalid`, `$123`, `$kebab-case`
- Reusing the same name enforces equality: `$A == $A` matches `x == x` but not `x == y`

### Pattern Matching Behavior

- Patterns match AST structure, not text — whitespace and formatting are ignored
- Patterns must be valid parseable code for the target language
- A pattern matches any node with the same syntactic structure anywhere in the tree

```bash
# Matches: obj.val && obj.val(), obj.val    &&   obj.val(), multi-line variants
ast-grep run -p '$PROP && $PROP()' -l typescript

# Matches: console.log('hello'), console.log(x), but NOT console.log() or console.log(a, b)
ast-grep run -p 'console.log($ARG)' -l javascript

# Matches: console.log(), console.log(x), console.log(a, b, c)
ast-grep run -p 'console.log($$$ARGS)' -l javascript
```

**IMPORTANT:** Enclose patterns in single quotes to prevent shell `$` expansion.

## Rule YAML Format

For complex matching beyond simple patterns, use YAML rules. Rules compose three categories:

### Atomic Rules — Match Individual Nodes

```yaml
rule:
  # Match by code pattern
  pattern: console.log($ARG)

  # Match by AST node kind (tree-sitter kind name)
  kind: call_expression

  # Match by regex on node text
  regex: "^test_.*"
```

### Relational Rules — Match by Context

```yaml
rule:
  # Target must be inside a matching ancestor
  inside:
    pattern: class $C { $$$ }
    stopBy: end          # ALWAYS use stopBy: end

  # Target must have a matching descendant
  has:
    pattern: await $EXPR
    stopBy: end          # ALWAYS use stopBy: end

  # Target must appear before a matching sibling
  precedes:
    pattern: return $VAL

  # Target must appear after a matching sibling
  follows:
    pattern: import $M from '$P'
```

**CRITICAL: Always use `stopBy: end` for `has` and `inside` rules.** Without it, the search stops at the first non-matching neighbor, causing false negatives.

### Composite Rules — Logical Combination

```yaml
rule:
  # AND: all must match
  all:
    - kind: call_expression
    - pattern: console.log($ARG)

  # OR: any must match
  any:
    - pattern: console.log($ARG)
    - pattern: console.warn($ARG)
    - pattern: console.error($ARG)

  # NOT: must not match
  not:
    pattern: console.log($ARG)

  # Reference a utility rule
  matches: my-utility-rule-id
```

### Pattern Object (for Ambiguous Patterns)

When a simple string pattern is ambiguous, use the object form:

```yaml
rule:
  pattern:
    selector: field_definition        # The AST kind to extract
    context: class A { $FIELD = $INIT } # Surrounding code for parse context
    strictness: smart                  # cst|smart|ast|relaxed|signature
```

### Complete Rule File Example

```yaml
id: find-async-functions-without-try-catch
language: TypeScript
rule:
  all:
    - kind: function_declaration
    - has:
        pattern: await $EXPR
        stopBy: end
    - not:
        has:
          kind: try_statement
          stopBy: end
```

## JSON Output Format

Use `--json` for structured output that agents can parse:

```bash
ast-grep run -p 'console.log($ARG)' -l javascript --json=pretty
```

Output structure:
```json
[
  {
    "text": "console.log('Hello')",
    "range": {
      "byteOffset": { "start": 66, "end": 86 },
      "start": { "line": 3, "column": 2 },
      "end": { "line": 3, "column": 22 }
    },
    "file": "src/app.ts",
    "language": "TypeScript",
    "metaVariables": {
      "single": {
        "ARG": {
          "text": "'Hello'",
          "range": { "start": { "line": 3, "column": 14 }, "end": { "line": 3, "column": 21 } }
        }
      },
      "multi": {}
    }
  }
]
```

**Agent usage pattern — pipe to jq:**
```bash
# Extract matched file paths
ast-grep run -p '$PATTERN' -l java --json | jq -r '.[].file' | sort -u

# Extract metavariable values
ast-grep run -p '$CLASS.$METHOD($$$)' -l java --json | jq '.[].metaVariables.single'

# Count matches per file
ast-grep run -p '$PATTERN' -l java --json | jq 'group_by(.file) | map({file: .[0].file, count: length})'
```

## Rule Development Process for Agents

Follow this systematic process when building ast-grep queries:

1. **Understand the search goal** — What structural pattern are you looking for?
2. **Write example code** — Create a minimal snippet that should match.
3. **Start with a simple pattern** — Use `ast-grep run -p` with the most basic pattern.
4. **Iterate if no matches:**
   - Use `--debug-query` to see how the pattern is parsed.
   - Try using `kind` instead of pattern if the pattern is ambiguous.
   - Add `stopBy: end` to relational rules.
   - Simplify the pattern and add constraints incrementally.
5. **Compose rules** — Combine atomic rules with relational/composite rules for precision.
6. **Use `--json` for output** — Parse results programmatically.

### Debugging Tips

```bash
# See how ast-grep parses your pattern
ast-grep run -p 'your.pattern($HERE)' -l java --debug-query

# Test a rule file against a single file
ast-grep scan --rule my-rule.yml path/to/file.java

# Test inline rule without creating a file
ast-grep scan --inline-rules 'id: test
language: Java
rule:
  pattern: "@Service"' src/
```

## Ready-to-Use Patterns by Language

### Java Patterns

```bash
# Find all Spring REST endpoints
ast-grep run -p '@GetMapping($$$)' -l java --json
ast-grep run -p '@PostMapping($$$)' -l java --json
ast-grep run -p '@RequestMapping($$$)' -l java --json

# Find all @Service classes
ast-grep run -p '@Service' -l java -C 5

# Find all @Autowired injections
ast-grep run -p '@Autowired' -l java -C 2

# Find all JPA repository methods
ast-grep run -p '@Query($QUERY)' -l java --json

# Find all @Transactional methods
ast-grep run -p '@Transactional' -l java -C 3

# Find all exception handlers
ast-grep run -p '@ExceptionHandler($$$)' -l java --json

# Find all Scheduled jobs
ast-grep run -p '@Scheduled($$$)' -l java --json

# Find constructor injection
ast-grep run -p 'public $CLASS($$$PARAMS) { $$$ }' -l java
```

**Java rule file — find services calling repositories:**
```yaml
id: service-calls-repository
language: Java
rule:
  all:
    - pattern: $REPO.$METHOD($$$ARGS)
    - inside:
        kind: class_declaration
        has:
          pattern: "@Service"
          stopBy: end
        stopBy: end
    - has:
        regex: "Repository|Dao"
        stopBy: end
```

### TypeScript/JavaScript Patterns

```bash
# Find all React components using useState
ast-grep run -p 'useState($$$)' -l tsx --json

# Find all useEffect hooks
ast-grep run -p 'useEffect($$$)' -l tsx --json

# Find all async functions
ast-grep run -p 'async function $NAME($$$PARAMS) { $$$ }' -l typescript

# Find all Express route handlers
ast-grep run -p '$APP.get($PATH, $$$HANDLERS)' -l typescript
ast-grep run -p '$APP.post($PATH, $$$HANDLERS)' -l typescript

# Find all NestJS controllers
ast-grep run -p '@Controller($$$)' -l typescript -C 5

# Find all NestJS injectable services
ast-grep run -p '@Injectable()' -l typescript -C 5

# Find all fetch/axios calls
ast-grep run -p 'await fetch($$$)' -l typescript --json
ast-grep run -p 'await axios.$METHOD($$$)' -l typescript --json

# Find all exports
ast-grep run -p 'export function $NAME($$$) { $$$ }' -l typescript
ast-grep run -p 'export class $NAME { $$$ }' -l typescript
ast-grep run -p 'export interface $NAME { $$$ }' -l typescript

# Find Promise.all with await inside (anti-pattern)
ast-grep scan --inline-rules 'id: await-in-promise-all
language: TypeScript
rule:
  pattern: Promise.all($A)
  has:
    pattern: await $_
    stopBy: end' src/
```

**TypeScript rule file — find components without error boundaries:**
```yaml
id: component-missing-error-handling
language: TSX
rule:
  all:
    - kind: function_declaration
    - has:
        pattern: useEffect($$$)
        stopBy: end
    - not:
        has:
          pattern: try { $$$ } catch ($E) { $$$ }
          stopBy: end
```

### C# Patterns

```bash
# Find all controller actions
ast-grep run -p '[HttpGet($$$)]' -l csharp --json
ast-grep run -p '[HttpPost($$$)]' -l csharp --json

# Find all dependency injection registrations
ast-grep run -p 'services.AddScoped<$IFACE, $IMPL>()' -l csharp

# Find all async methods
ast-grep run -p 'async Task<$T> $METHOD($$$PARAMS) { $$$ }' -l csharp

# Find all Entity Framework queries
ast-grep run -p 'await _context.$ENTITY.$METHOD($$$)' -l csharp
```

### Python Patterns

```bash
# Find all Flask/FastAPI endpoints
ast-grep run -p '@app.route($$$)' -l python
ast-grep run -p '@app.get($$$)' -l python
ast-grep run -p '@app.post($$$)' -l python

# Find all class definitions with specific base
ast-grep run -p 'class $NAME($BASE): $$$' -l python

# Find all function definitions with decorators
ast-grep run -p '@$DECORATOR
def $NAME($$$): $$$' -l python
```

## Integration with Documentation Agents

### Discovery Phase

Use ast-grep to deterministically discover entry points, flows, and structures:

```bash
# 1. Find all entry points (REST endpoints, event handlers, scheduled jobs)
ast-grep run -p '@GetMapping($$$)' -l java --json > discovery/endpoints-get.json
ast-grep run -p '@PostMapping($$$)' -l java --json > discovery/endpoints-post.json
ast-grep run -p '@Scheduled($$$)' -l java --json > discovery/scheduled-jobs.json
ast-grep run -p '@KafkaListener($$$)' -l java --json > discovery/kafka-listeners.json

# 2. Find all service classes and their dependencies
ast-grep run -p '@Service' -l java --json > discovery/services.json
ast-grep run -p '@Autowired' -l java --json > discovery/injections.json

# 3. Find all data access patterns
ast-grep run -p '@Repository' -l java --json > discovery/repositories.json
ast-grep run -p '@Query($$$)' -l java --json > discovery/queries.json

# 4. Find business rules (validation, conditions)
ast-grep run -p '@Valid' -l java --json > discovery/validation-points.json
```

### Flow Tracing Phase

Combine patterns to trace call chains:

```bash
# Find where a specific service is injected
ast-grep run -p 'private $TYPE customerService' -l java --json

# Find all calls to that service
ast-grep run -p 'customerService.$METHOD($$$)' -l java --json

# Find what the service calls internally (scan the service file)
ast-grep run -p 'this.$REPO.$METHOD($$$)' -l java --json src/main/java/com/example/service/
```

### Business Rule Extraction

Use rules to find decision points and validations:

```yaml
# rule: find-business-rules.yml
id: find-business-rules
language: Java
rule:
  kind: if_statement
  inside:
    kind: class_declaration
    has:
      pattern: "@Service"
      stopBy: end
    stopBy: end
```

```bash
ast-grep scan --rule find-business-rules.yml --json src/
```

## Tips and Common Pitfalls

1. **Always quote patterns** in shell: use single quotes `'$PATTERN'` to prevent `$` expansion
2. **Always use `stopBy: end`** for `has` and `inside` relational rules
3. **Pattern must be valid code** for the target language's tree-sitter grammar
4. **Use `--debug-query`** when patterns don't match as expected
5. **Start simple, add constraints** — begin with `kind` or a basic pattern, then compose
6. **Rule fields are unordered** — use explicit `all` when order matters (especially with metavariables)
7. **`kind` + `pattern` are independent** — to change how a pattern is parsed, use pattern object with `context`/`selector` instead
8. **JSON output is an array** — empty array `[]` means no matches
9. **Metavariables in node text only** — `$VAR` must be the entire text of an AST node; `prefix$VAR` won't work
10. **Use playground for debugging** — https://ast-grep.github.io/playground.html

## Custom Language: COBOL

COBOL is not built into ast-grep, but is supported via custom tree-sitter grammar loading. This unlocks the same structural search for mainframe codebases.

### Prerequisites

1. **tree-sitter-cobol grammar** — [yutaro-sakamoto/tree-sitter-cobol](https://github.com/yutaro-sakamoto/tree-sitter-cobol) (MIT, COBOL-85 compliant, tested against NIST COBOL85 test suite)
2. **tree-sitter-cli** — needed to compile the grammar as a dynamic library

### Setup

```bash
# 1. Install tree-sitter-cli
npm install -g tree-sitter-cli

# 2. Clone the grammar
git clone https://github.com/yutaro-sakamoto/tree-sitter-cobol.git
cd tree-sitter-cobol

# 3. Compile as dynamic library
#    Linux:
tree-sitter build --output cobol.so
#    macOS:
tree-sitter build --output cobol.dylib
#    Windows:
tree-sitter build --output cobol.dll

# 4. Move the library to your project
cp cobol.so /path/to/project/.ast-grep/
```

### Register in `sgconfig.yml`

Create or update `sgconfig.yml` in the project root:

```yaml
customLanguages:
  cobol:
    libraryPath: .ast-grep/cobol.so      # adjust extension for OS
    extensions: [cbl, cob, CBL, COB]
    expandoChar: "~"                       # replaces $ in patterns since COBOL doesn't use $
```

> **`expandoChar`**: ast-grep patterns use `$VAR` for metavariables. Since COBOL-85 doesn't use `$` in standard syntax, `$` should work as-is. However, some IBM COBOL extensions do use `$`. Set `expandoChar` to `~` (or another unused char) if `$` conflicts with your dialect — then write patterns as `~VAR` instead of `$VAR`.

### Verify

```bash
ast-grep run -p 'PERFORM $PARA' -l cobol src/cobol/
```

### COBOL AST Node Kinds (tree-sitter-cobol)

Key node kinds for rule-based queries:

| Category | Node Kind | Matches |
|----------|-----------|---------|
| **Program structure** | `program_definition` | Entire COBOL program |
| **Divisions** | `identification_division`, `environment_division`, `data_division`, `procedure_division` | Top-level divisions |
| **Sections** | `section_header`, `working_storage_section`, `linkage_section`, `file_section`, `local_storage_section`, `configuration_section`, `input_output_section` | Named sections |
| **Paragraphs** | `paragraph_header` | Named paragraphs |
| **Data items** | `data_description`, `level_number`, `entry_name`, `picture_clause`, `usage_clause`, `value_clause`, `occurs_clause`, `redefines_clause` | WORKING-STORAGE definitions |
| **File I/O** | `select_statement`, `file_description`, `open_statement`, `close_statement`, `read_statement`, `write_statement`, `rewrite_statement`, `delete_statement`, `start_statement` | File operations |
| **Control flow** | `perform_statement_call_proc`, `perform_statement_loop`, `if_header`, `else_header`, `evaluate_header`, `when`, `when_other`, `goto_statement` | Branching and iteration |
| **External calls** | `call_statement`, `cancel_statement` | Subprogram calls |
| **Data movement** | `move_statement`, `compute_statement`, `add_statement`, `subtract_statement`, `multiply_statement`, `divide_statement` | Data manipulation |
| **String handling** | `string_statement`, `unstring_statement`, `inspect_statement` | String operations |
| **Copy/Replace** | `copy_statement`, `replacing_clause` | Copybook inclusion |
| **Search/Sort** | `search_statement`, `sort_statement`, `merge_statement` | Table/file operations |
| **Program end** | `stop_statement`, `goback_statement`, `exit_statement`, `end_program` | Termination |
| **Expressions** | `expr`, `qualified_word` | Conditions and data references |

### Ready-to-Use COBOL Patterns

```bash
# --- Program Structure ---

# Find all PROGRAM-ID names
ast-grep run -p 'PROGRAM-ID. $NAME.' -l cobol --json

# Find all SECTION headers in PROCEDURE DIVISION
ast-grep scan --inline-rules 'id: find-sections
language: cobol
rule:
  kind: section_header' --json src/cobol/

# Find all paragraph headers
ast-grep scan --inline-rules 'id: find-paragraphs
language: cobol
rule:
  kind: paragraph_header' --json src/cobol/

# --- External Calls ---

# Find all CALL statements (subprogram invocations)
ast-grep scan --inline-rules 'id: find-calls
language: cobol
rule:
  kind: call_statement' --json src/cobol/

# Find CALL with USING (parameter passing)
ast-grep run -p 'CALL $PROG USING $$$ARGS' -l cobol --json

# --- PERFORM (Control Flow) ---

# Find all PERFORM ... THRU statements (section/paragraph calls)
ast-grep scan --inline-rules 'id: find-performs
language: cobol
rule:
  kind: perform_statement_call_proc' --json src/cobol/

# Find all inline PERFORM loops (PERFORM UNTIL / VARYING)
ast-grep scan --inline-rules 'id: find-perform-loops
language: cobol
rule:
  kind: perform_statement_loop' --json src/cobol/

# --- File Operations ---

# Find all OPEN statements
ast-grep scan --inline-rules 'id: find-opens
language: cobol
rule:
  kind: open_statement' --json src/cobol/

# Find all READ statements
ast-grep scan --inline-rules 'id: find-reads
language: cobol
rule:
  kind: read_statement' --json src/cobol/

# Find all WRITE statements
ast-grep scan --inline-rules 'id: find-writes
language: cobol
rule:
  kind: write_statement' --json src/cobol/

# Find all CLOSE statements
ast-grep scan --inline-rules 'id: find-closes
language: cobol
rule:
  kind: close_statement' --json src/cobol/

# Find SELECT ... ASSIGN (file-control entries)
ast-grep scan --inline-rules 'id: find-selects
language: cobol
rule:
  kind: select_statement' --json src/cobol/

# --- Data Division ---

# Find all data descriptions (level numbers + PICs)
ast-grep scan --inline-rules 'id: find-data-items
language: cobol
rule:
  kind: data_description' --json src/cobol/

# Find all COPY statements (copybook inclusion)
ast-grep scan --inline-rules 'id: find-copy
language: cobol
rule:
  kind: copy_statement' --json src/cobol/

# Find all COPY with REPLACING
ast-grep scan --inline-rules 'id: find-copy-replacing
language: cobol
rule:
  kind: copy_statement
  has:
    kind: replacing_clause
    stopBy: end' --json src/cobol/

# --- Data Manipulation ---

# Find all MOVE statements
ast-grep scan --inline-rules 'id: find-moves
language: cobol
rule:
  kind: move_statement' --json src/cobol/

# Find all COMPUTE statements
ast-grep scan --inline-rules 'id: find-computes
language: cobol
rule:
  kind: compute_statement' --json src/cobol/

# --- Conditions and Branching ---

# Find all IF statements
ast-grep scan --inline-rules 'id: find-ifs
language: cobol
rule:
  kind: if_header' --json src/cobol/

# Find all EVALUATE (COBOL's CASE/SWITCH)
ast-grep scan --inline-rules 'id: find-evaluates
language: cobol
rule:
  kind: evaluate_header' --json src/cobol/

# Find all GOTO statements (legacy control flow)
ast-grep scan --inline-rules 'id: find-gotos
language: cobol
rule:
  kind: goto_statement' --json src/cobol/

# --- Program Termination ---

# Find STOP RUN / GOBACK
ast-grep scan --inline-rules 'id: find-stops
language: cobol
rule:
  any:
    - kind: stop_statement
    - kind: goback_statement' --json src/cobol/

# Find EXIT PROGRAM
ast-grep scan --inline-rules 'id: find-exits
language: cobol
rule:
  kind: exit_statement' --json src/cobol/

# --- Sorting and Searching ---

# Find all SORT statements
ast-grep scan --inline-rules 'id: find-sorts
language: cobol
rule:
  kind: sort_statement' --json src/cobol/

# Find all SEARCH / SEARCH ALL (table lookups)
ast-grep scan --inline-rules 'id: find-searches
language: cobol
rule:
  kind: search_statement' --json src/cobol/
```

### COBOL Rule File Examples

**Find programs that CALL external subprograms:**
```yaml
id: find-external-calls
language: cobol
rule:
  kind: call_statement
  inside:
    kind: procedure_division
    stopBy: end
```

**Find programs with file I/O (any OPEN/READ/WRITE/CLOSE):**
```yaml
id: find-file-io-programs
language: cobol
rule:
  any:
    - kind: open_statement
    - kind: read_statement
    - kind: write_statement
    - kind: close_statement
  inside:
    kind: procedure_division
    stopBy: end
```

**Find PERFORM that calls a specific section/paragraph:**
```yaml
id: find-perform-target
language: cobol
rule:
  kind: perform_statement_call_proc
  has:
    kind: label
    regex: "BEHANDELING|VERWERKING"
    stopBy: end
```

**Find all data items with OCCURS (arrays/tables):**
```yaml
id: find-table-definitions
language: cobol
rule:
  kind: data_description
  has:
    kind: occurs_clause
    stopBy: end
```

**Find COPY statements with REPLACING (parameterized copybooks):**
```yaml
id: find-parameterized-copies
language: cobol
rule:
  kind: copy_statement
  has:
    kind: replacing_clause
    stopBy: end
```

### COBOL Agent Integration Workflow

1. **Discovery**: Use `kind`-based rules to inventory all programs, sections, paragraphs, and file operations
2. **Call graph**: Combine `call_statement` + `perform_statement_call_proc` findings to build inter- and intra-program flow
3. **Data flow**: Trace `move_statement` and `compute_statement` to understand data transformations
4. **Copybook mapping**: Use `copy_statement` findings to identify shared data structures
5. **File I/O mapping**: Correlate `select_statement` → `open_statement` → `read/write` → `close_statement`

> **Note**: tree-sitter-cobol supports **COBOL-85 syntax only**. CICS commands (`EXEC CICS ... END-EXEC`), IMS calls (`CALL 'CBLTDLI'`), and DB2 embedded SQL (`EXEC SQL ... END-EXEC`) are treated as opaque text or may cause parse errors. For CICS/IMS/DB2-specific analysis, fall back to `grep_search` with targeted regex patterns from the `cobol-analysis` skill.

## Language Not Supported?

If you're working with a language ast-grep doesn't support natively (e.g., VB.NET), fall back to:
- `grep_search` / `grep` for text-based search
- `semantic_search` for meaning-based search
- Language-specific analysis skills for guided manual inspection

ast-grep supports [custom language loading](https://ast-grep.github.io/advanced/custom-language.html) for any language with a tree-sitter grammar. See the COBOL example above for the setup process.
