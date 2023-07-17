import { Trigger } from "deno-slack-sdk/types.ts";
import { TriggerContextData, TriggerTypes } from "deno-slack-api/mod.ts";
import { DefinitionWorkflow } from "../workflows/definition_workflow.ts";

const termDefinitionTrigger: Trigger<typeof DefinitionWorkflow.definition> = {
  type: TriggerTypes.Shortcut,
  name: "Term Definition Trigger",
  description:
    "A trigger that starts the workflow to define a user-entered term",
  workflow: `#/workflows/${DefinitionWorkflow.definition.callback_id}`,
  inputs: {
    interactivity: {
      value: TriggerContextData.Shortcut.interactivity,
    },
  },
};

export default termDefinitionTrigger;
