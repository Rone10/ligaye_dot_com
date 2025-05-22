# VSA Workflow Analysis & Optimisation Feedback

## 1. Executive Summary

The current workflow provides a comprehensive, phase-based path from ideation to code generation that strongly echoes Vertical Slice Architecture (VSA) principles.  Its explicit prompts, template-driven approach, and tight coupling with project conventions position it well for repeatable, AI-augmented delivery.

However, the process is **verbose and front-loaded**, which risks cognitive overload and friction for small or fast-moving slices.  Some prompts duplicate effort, testing & non-functional requirements receive limited attention, and there is minimal built-in feedback-loop instrumentation (e.g. lint/test gates, retro steps).  Prompt phrasing is generally clear but can be shortened, made more directive, and refactored into reusable "prompt macros" to avoid drift.  Tool integration could expand to embrace automated CI, design tokens, and storybook-style visual regression.

Key recommendations:
1. Introduce lightweight "fast lane" variants for low-risk slices while retaining the full workflow for complex features.
2. Consolidate overlapping steps (especially between Phases 0 & 1) and shift some research tasks out of the primary path.
3. Tighten prompt syntax, add explicit success criteria & guardrails, and extract common boilerplate into reusable snippets.
4. Extend the workflow to cover testing, accessibility, performance budgets, analytics hooks, and CI/CD integration.

## 2. Strengths Analysis

• **Clear Phase Separation** – Idea clarification (Phase 0) is distinctly separated from technical planning (Phase 1), preventing premature solutioning.

• **Strict VSA Enforcement** – Each slice's queries/actions/components are colocated, reinforcing route-centric boundaries and decoupled evolution.

• **Detailed, Role-oriented Prompts** – Each step assigns an explicit persona (e.g. *Product Analyst*, *Senior Software Architect*) which helps an LLM assume the right framing.

• **Template Usage** – Referencing `feature-planner.md` ensures output uniformity and smoother downstream automation.

• **Context Awareness** – Prompts repeatedly remind the AI about `base-knowledge.md` & `style-guide.md`, reducing architectural drift.

• **Scalability** – The slice-by-slice loop (Step 3 → 5) scales with feature depth and naturally parallelises.

## 3. Areas for Improvement

### 3.1 Process & Structure Issues

1. **Redundant Discovery Work** – Phase 0's market scan often duplicates step-1 summaries; consider caching outputs.
2. **Front-loaded Detail** – Smaller UI tweaks still require the full workflow, which may deter adoption.
3. **Missing Feedback Loops** – No explicit retrospective or metrics collection to refine the process over time.
4. **Testing & QA Gaps** – Unit/integration testing, accessibility, performance & SEO are only briefly referenced.
5. **CI/CD Integration** – Linting/formatting is mentioned, but no automated gate or PR-check flow is defined.

### 3.2 Prompt Engineering Concerns

1. **Length & Cognitive Load** – Long system messages can exceed token budgets, causing truncation.
2. **Ambiguous Placeholders** – Some placeholders (e.g. `<RELEVANT_APP_FLOW_SECTION_FOR_SLICE>`) could benefit from format hints (markdown fencing, expected length).
3. **Lack of Guardrails** – Prompts rarely specify failure modes (e.g. "If no competitors found, say 'None'").
4. **Version Drift** – Copy-pasted prompts evolve independently; centralising in a library prevents divergence.

### 3.3 VSA Implementation Gaps

1. **Cross-Slice Concerns** – Shared UI patterns (e.g. toast notifications) may get duplicated excessively without guidance on when to extract to `components/ui`.
2. **Error Boundaries** – The workflow mentions `error.tsx` but not a strategy for propagating typed errors from actions/queries.
3. **Data Caching** – React Query usage is stated but not reflected in slice planning (e.g. invalidation keys).

### 3.4 Tool Integration Opportunities

1. **Storybook / Chromatic** – Visual review of slice-level components.
2. **Playwright / Cypress** – E2E flow tests per slice.
3. **GitHub Actions / pnpm workspace** – Automate lint, type-check, unit & E2E suites.
4. **Figma Tokens** – Sync design system colours/spacing with Tailwind config.

### 3.5 Coverage Gaps

• **Accessibility (a11y)** – No explicit WCAG checks or prompts for screen-reader labels.
• **Performance Budgets** – No step forces assessment of bundle size or Core Web Vitals per slice.
• **Internationalisation (i18n)** – Potential future need in Gambian context (multiple languages) not addressed.
• **SEO** – Route-level metadata strategy is unstated.

## 4. Specific Recommendations

### 4.1 Process Refinements

1. **Dual Track** – Offer *Full* vs *Light* workflows.  The light path skips Phase 0 & condenses Steps 1–3 into a single *Slice Brief* when making trivial updates.
2. **Merge Phase 0 Outputs** – Automatically persist Phase 0 artefacts to be referenced (not regenerated) in Step 1.
3. **Retro & Metrics Step** – Add a *Step 6: Workflow Retrospective* to collect KPIs (cycle time, defect rate) and adjust templates.

### 4.2 Prompt Enhancements

**Before (excerpt Step 3):**
```
Generate the "Slice Requirements" document for the `<TARGET_ROUTE_SEGMENT>` slice, including the following sections:
1. Slice Goal: ...
```

**After (suggested):**
```
You are an exacting Technical Product Manager.  Produce a Markdown table titled "Slice Requirements – <TARGET_ROUTE_SEGMENT>" with columns `Section`, `Details`.
• **Slice Goal** – Single sentence.
• **Functional Requirements** – Bullet list (≥3).
• **Data Requirements** – Use sub-tables for Fetch, Display, Mutate.
• ...
If information is missing, respond with `❓ <QUESTION>` to request clarification instead of guessing.
```

Benefits: clearer output structure, built-in clarification loop, smaller token footprint.

### 4.3 New Steps / Sub-steps

| Step | Purpose | Prompt Stub |
|------|---------|-------------|
| **Step 1.5: Non-Functional Checklist** | Define a11y, performance, SEO, analytics criteria early. | "List slice-level NFRs using the PAA (Performance, Accessibility, Analytics) mnemonic." |
| **Step 4.5: Test Plan Generation** | Auto-generate Jest/Playwright test skeletons for the slice. | "Produce test file stubs following *tests/unit/<slice>*.test.tsx*." |
| **Step 5.5: CI/CD Hook** | Suggest GitHub Action YAML snippet for lint/test on PR. | "Output a valid GitHub Actions workflow named *ci-checks.yml*." |

### 4.4 Tool Integration Suggestions

1. **nx or Turborepo** – Incremental builds and affected-slice testing.
2. **Lighthouse-CI** – Add automated performance & a11y audits per PR.
3. **Datadog RUM or PostHog** – Insert analytics snippet in the root layout; validate event emission in the test plan step.
4. **Dependabot-PNPM** – Ensure package updates respect the mandated manager.

## 5. Implementation Prioritisation

| Priority | Recommendation | Effort | Impact |
|----------|---------------|--------|--------|
| 1 | Introduce Light vs Full workflow paths | Low | High – boosts adoption & velocity |
| 2 | Add Non-Functional Checklist (Step 1.5) | Low | High – improves quality & compliance |
| 3 | Tighten prompts with structured outputs & guardrails | Medium | High – reduces AI hallucination & rework |
| 4 | Generate automated test & CI templates (Steps 4.5 & 5.5) | Medium | Medium – prevents regressions |
| 5 | Centralise prompt library & versioning | Medium | Medium – maintains consistency |
| 6 | Integrate Storybook & visual regression | High | Medium – enhances UI reliability |
| 7 | Add Retro/metrics feedback loop | Low | Low-Medium – continuous improvement |

---

**Next Steps:** Begin by refactoring the existing prompts into a shared markdown/JSON library with IDs referenced by the workflow.  Then pilot the *Light* workflow on a trivial slice change to collect baseline cycle-time metrics.
