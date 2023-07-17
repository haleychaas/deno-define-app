import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";
import { TermLookupFunction } from "../functions/term_lookup_function.ts";

export const DefinitionWorkflow = DefineWorkflow({
  callback_id: "definition_workflow",
  title: "Definition workflow",
  description:
    "A workflow to show you definitions and add them if they don't exist.",
  input_parameters: {
    properties: {
      interactivity: {
        type: Schema.slack.types.interactivity,
      },
    },
    required: ["interactivity"],
  },
});

DefinitionWorkflow.addStep(TermLookupFunction, {
  interactivity: DefinitionWorkflow.inputs.interactivity,
});

export default DefinitionWorkflow;
