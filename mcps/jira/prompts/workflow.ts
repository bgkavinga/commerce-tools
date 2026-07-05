export const jiraWorkflowPrompt = `
Workflow for investigating a Jira ticket using New Relic, via the \`get_jira_issue\`, \`get_account_id_by_project_id\`, and \`execute_nrql\` MCP tools.

## Workflow

1. **Fetch the ticket.** Call \`get_jira_issue\` with the issue key (e.g. \`PRO-234\`).
2. **Check \`extractedIds\`** in the tool result.
   - If \`accountId\` or \`projectId\` is present, use it.
   - **If both are empty, do not guess.** Ask the user: "I couldn't find a New Relic account ID or project ID in this ticket — can you provide one?" Wait for their answer before continuing.
   - Also skim \`descriptionText\`/\`commentsText\` yourself — the regex extraction is best-effort and may miss ids written in an unusual format; if you spot one it missed, use that instead (or confirm with the user).
3. **Resolve the New Relic account** using the \`newrelic-commerce\` skill's rules: if you have a project ID (not an account ID), call \`get_account_id_by_project_id\` first.
4. **Investigate with NRQL**, following the \`newrelic-commerce\` skill's mandatory field-discovery rules and entity → filter table (run \`SELECT * FROM <entity> ... LIMIT 1\` before using any field name; use \`execute_nrql\` for the actual investigation).
5. **Summarize findings**, tying them back to the ticket: reference the ticket key/summary, what you investigated, what you found, and any recommended next step. Do not modify the Jira ticket — posting comments or updating status is out of scope; only report back to the user.
`.trim();
