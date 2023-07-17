import { ViewSubmissionHandler } from "deno-slack-sdk/functions/interactivity/types.ts";
import { TermLookupFunction } from "./term_lookup_function.ts";
import { TermsDatastore } from "../datastores/terms.ts";

// This handler is invoked after a user submits a term to be defined
export const showDefinitionView: ViewSubmissionHandler<
  typeof TermLookupFunction.definition
> = async ({ view, client }) => {
  const termEntered = view.state.values.term.action.value;

  if (termEntered.length < 1) {
    return {
      response_action: "errors",
      errors: { term_entered: "Must be 1 character or longer" },
    };
  }

  const queryResult = await client.apps.datastore.query({
    datastore: TermsDatastore.name,
    expression: "#term = :term",
    expression_attributes: { "#term": "term" },
    expression_values: { ":term": termEntered },
  });

  // If the term is not found in the datastore, ask if they'd like to add a definition
  if (queryResult.items.length < 1) {
    return {
      response_action: "update",
      view: {
        "type": "modal",
        "callback_id": "add-definition",
        "notify_on_close": false,
        "title": { "type": "plain_text", "text": termEntered },
        "close": { "type": "plain_text", "text": "Close" },
        "submit": { "type": "plain_text", "text": "Click here to add one" },
        "private_metadata": JSON.stringify({ termEntered }),
        "blocks": [
          {
            "type": "section",
            "text": {
              "type": "plain_text",
              "text": `There is currently no definition for ${termEntered}`,
            },
          },
        ],
      },
    };
  }
  // If the term is found, display the associated definition
  if (queryResult.items.length >= 1) {
    return {
      response_action: "update",
      view: {
        "type": "modal",
        "callback_id": "second-page",
        "notify_on_close": false,
        "title": { "type": "plain_text", "text": termEntered },
        "close": { "type": "plain_text", "text": "Close" },
        "private_metadata": JSON.stringify({ termEntered }),
        "blocks": [
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": queryResult.items[0].definition,
            },
          },
        ],
      },
    };
  }
};

// This handler is invoked after a user elects to add a new definition
export const showDefinitionSubmissionView: ViewSubmissionHandler<
  typeof TermLookupFunction.definition
> = ({ view }) => {
  const { termEntered } = JSON.parse(view.private_metadata!);

  if (termEntered.length < 1) {
    return {
      response_action: "errors",
      errors: { term_entered: "Must be 1 character or longer" },
    };
  }

  return {
    response_action: "update",
    view: {
      "type": "modal",
      "callback_id": "definition-submission",
      "notify_on_close": false,
      "title": { "type": "plain_text", "text": termEntered },
      "submit": { "type": "plain_text", "text": "Submit" },
      "close": { "type": "plain_text", "text": "Close" },
      "private_metadata": JSON.stringify({ termEntered }),
      "blocks": [
        {
          "type": "section",
          "text": {
            "type": "mrkdwn",
            "text": `Add a definition for ${termEntered}`,
          },
        },
        {
          "type": "input",
          "block_id": "definition",
          "element": {
            "type": "plain_text_input",
            "action_id": "action",
            "multiline": true,
          },
          "label": { "type": "plain_text", "text": "Definition" },
        },
        {
          "type": "context",
          "elements": [
            {
              "type": "mrkdwn",
              "text":
                "You can use Slack markdown for this field, like `*bold*` and `_italics_`.",
            },
          ],
        },
      ],
    },
  };
};

// This handler is invoked after a new definition is submitted
export const showConfirmationView: ViewSubmissionHandler<
  typeof TermLookupFunction.definition
> = async ({ view, client }) => {
  const { termEntered } = JSON.parse(view.private_metadata!);
  const definition = view.state.values.definition.action.value;

  let saveSuccess: boolean;

  const uuid = crypto.randomUUID();

  const putResponse = await client.apps.datastore.put({
    datastore: TermsDatastore.name,
    item: {
      id: uuid,
      term: termEntered,
      definition: definition,
    },
  });

  if (!putResponse.ok) {
    console.log("Error calling apps.datastore.put:");
    saveSuccess = false;
    return {
      error: putResponse.error,
    };
  } else {
    saveSuccess = true;
  }

  if (saveSuccess == true) {
    return {
      response_action: "update",
      view: {
        "type": "modal",
        "callback_id": "completion_successful",
        "notify_on_close": false,
        "title": { "type": "plain_text", "text": `${termEntered} added` },
        "close": { "type": "plain_text", "text": "Close" },
        "blocks": [
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": `We've added ${termEntered} to your company definitions.`,
            },
          },
          {
            "type": "divider",
          },
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": `*${termEntered}*\n${definition}`,
            },
          },
        ],
      },
    };
  } else {
    return {
      response_action: "update",
      view: {
        "type": "modal",
        "callback_id": "completion_not_successful",
        "notify_on_close": false,
        "title": { "type": "plain_text", "text": "Add definition" },
        "close": { "type": "plain_text", "text": "Close" },
        "blocks": [
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": "Something went wrong and the save was not successful.",
            },
          },
        ],
      },
    };
  }
};
