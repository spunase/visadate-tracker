# Start Here

Use this kit when you have:
- one or more reference images
- a clear product idea
- a need for strong design fidelity
- a desire to keep Claude Code structured and review-driven

## How to invoke

Tell Claude Code something like:

> Read `01_orchestrator_agent.md`. Use the workflow in `workflows/sequential_design_workflow.md`. Create outputs inside a `design-output/` folder. Pause for my feedback at each checkpoint.

## Best practice inputs

Create a folder such as:

- `inputs/product_brief.md`
- `inputs/reference_images/`
- `inputs/content_requirements.md`
- `inputs/technical_constraints.md`

## Minimal input brief

Include:
- product name
- target users
- main job to be done
- key screens
- technical stack
- constraints
- reference image intent

## Important rule

Do not ask the model to jump straight to final code.
Run the phases in order:
1. design extraction
2. wireframe
3. visual system
4. implementation
5. critique and revision
