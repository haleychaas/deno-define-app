import { Manifest } from "deno-slack-sdk/mod.ts";
import { DefinitionWorkflow } from "./workflows/definition_workflow.ts";
import { TermsDatastore } from "./datastores/terms.ts";

export default Manifest({
  name: "dreamy-manatee-147",
  description:
    "This project allows users to look up and add new definitions of company acronyms and terms.",
  icon: "assets/dictionary.png",
  workflows: [DefinitionWorkflow],
  datastores: [TermsDatastore],
  outgoingDomains: [],
  botScopes: [
    "commands",
    "chat:write",
    "chat:write.public",
    "datastore:read",
    "datastore:write",
  ],
});
