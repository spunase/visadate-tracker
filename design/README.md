# Claude Code Design Orchestrator Kit

This kit helps Claude Code run a **sequential, feedback-driven design workflow** using one orchestrator agent and specialized sub-agents.

## What this kit contains

- `00_start_here.md` — how to use the kit
- `01_orchestrator_agent.md` — master agent instructions
- `agents/` — sub-agent specs
- `prompts/` — reusable user-facing prompts and checkpoint prompts
- `templates/` — design system and review templates
- `workflows/` — step-by-step execution flow
- `examples/` — example input package

## Recommended workflow

1. Start with `01_orchestrator_agent.md`
2. Load the reference image and product brief
3. Run the workflow in `workflows/sequential_design_workflow.md`
4. Pause at each checkpoint and ask for user feedback
5. Save approved outputs into the template files
6. Continue to the next phase only after approval

## Intended behavior

The orchestrator should:
- invoke sub-agents **sequentially**
- never skip approval checkpoints
- preserve design consistency
- carry forward approved decisions into later stages
- avoid premature coding before design approval

## Suggested folder usage in your project

Copy this kit into your project root, then ask Claude Code:

> Read `01_orchestrator_agent.md` and execute the workflow in `workflows/sequential_design_workflow.md` using the files in `templates/` and `prompts/`.

## Expected human checkpoints

- Reference/style understanding approved
- Wireframe/layout approved
- Visual system approved
- First UI implementation approved
- Revision pass approved
