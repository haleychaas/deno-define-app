import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import {
  showConfirmationView,
  showDefinitionSubmissionView,
  showDefinitionView,
} from "./interactivity_handler.ts";

export const TermLookupFunction = DefineFunction({
  callback_id: "term_lookup_function",
  title: "Define a term",
  source_file: "functions/term_lookup_function.ts",
  input_parameters: {
    properties: { interactivity: { type: Schema.slack.types.interactivity } },
    required: ["interactivity"],
  },
  output_parameters: { properties: {}, required: [] },
});

export default SlackFunction(
  TermLookupFunction,
  async ({ inputs, client }) => {
    const response = await client.views.open({
      interactivity_pointer: inputs.interactivity.interactivity_pointer,
      view: {
        "type": "modal",
        "callback_id": "first-page",
        "notify_on_close": false,
        "title": { "type": "plain_text", "text": "Search for a definition" },
        "submit": { "type": "plain_text", "text": "Search" },
        "close": { "type": "plain_text", "text": "Close" },
        "blocks": [
          {
            "type": "input",
            "block_id": "term",
            "element": { "type": "plain_text_input", "action_id": "action" },
            "label": { "type": "plain_text", "text": "Term" },
          },
        ],
      },
    });
    if (response.error) {
      const error =
        `Failed to open a modal in the term lookup workflow. Contact the app maintainers with the following information - (error: ${response.error})`;
      return { error };
    }
    return {
      completed: false,
    };
  },
)
  .addViewSubmissionHandler(
    ["first-page"],
    showDefinitionView,
  )
  .addViewSubmissionHandler(
    ["add-definition"],
    showDefinitionSubmissionView,
  )
  .addViewSubmissionHandler(
    ["definition-submission"],
    showConfirmationView,
  )
  .addViewClosedHandler(
    ["first-page", "add-definition", "definition-submission"],
    ({ view }) => {
      console.log(`view_closed handler called: ${JSON.stringify(view)}`);
      return { completed: true };
    },
  );
