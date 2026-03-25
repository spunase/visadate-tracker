# Master Kickoff Prompt

Use this with Claude Code:

Read `01_orchestrator_agent.md` and run the workflow in `workflows/sequential_design_workflow.md`.

Create all outputs in `design-output/`.

Use the following operating rules:
- invoke sub-agents sequentially
- pause for user feedback at every checkpoint
- do not skip to implementation
- preserve approved decisions between stages
- keep outputs concise, structured, and production-oriented

Start with the files in:
- `inputs/product_brief.md`
- `inputs/reference_images/`
- `inputs/content_requirements.md`
- `inputs/technical_constraints.md`
