import { DefineDatastore, Schema } from "deno-slack-sdk/mod.ts";

export const TermsDatastore = DefineDatastore({
  name: "terms",
  primary_key: "id",
  attributes: {
    id: { type: Schema.types.string },
    term: { type: Schema.types.string },
    definition: { type: Schema.types.string },
  },
});
