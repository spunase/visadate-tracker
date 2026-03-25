# Sequential Design Workflow

This workflow is intended for Claude Code operating with one orchestrator and several sub-agents.

## Step 0 — Setup

Confirm these inputs exist:
- `inputs/product_brief.md`
- `inputs/reference_images/`
- `inputs/content_requirements.md` (optional)
- `inputs/technical_constraints.md` (optional)

Create:
- `design-output/`

## Step 1 — Intake and normalization

Use `agents/agent_intake_analyst.md`.

Produce:
- `design-output/normalized-brief.md`

Checkpoint question:
- Is the product brief accurate and complete enough to proceed?

## Step 2 — Reference deconstruction

Use `agents/agent_reference_analyst.md`.

Produce:
- `design-output/design-extraction.md`

Checkpoint question:
- Does this correctly capture the intended look and feel from the reference?

## Step 3 — Wireframe blueprint

Use `agents/agent_wireframe_architect.md`.

Produce:
- `design-output/wireframe-blueprint.md`

Checkpoint question:
- Does the structure and hierarchy feel right before visual styling?

## Step 4 — Visual system

Use `agents/agent_visual_system_designer.md`.

Produce:
- `design-output/design-system.md`

Checkpoint question:
- Is this the visual language you want applied to the product?

## Step 5 — UI implementation

Use `agents/agent_ui_implementer.md`.

Produce:
- implementation files
- `design-output/ui-implementation-notes.md`

Checkpoint question:
- Is this implementation close enough for refinement rather than redesign?

## Step 6 — Critique and refinement

Use `agents/agent_ui_critic.md`.

Produce:
- `design-output/review-log.md`
- updated implementation

Checkpoint question:
- Approve, revise again, or branch into an alternative direction?

## Step 7 — Packaging and handoff

Use `agents/agent_documentarian.md`.

Produce:
- `design-output/handoff-summary.md`

Checkpoint question:
- Final approval for handoff?

## Important orchestration behavior

At each checkpoint, the orchestrator must present:
1. what changed
2. what remains risky
3. what exact approval is needed
4. available next actions
