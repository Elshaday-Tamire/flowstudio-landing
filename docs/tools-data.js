(function(){
const I = {
  data: 'M4 6c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3zm0 0v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3',
  sql: 'M8 7l-5 5 5 5M16 7l5 5-5 5M13.5 5l-3 14',
  doc: 'M6 3h9l4 4v14H6zM14 3v5h5M9 13h7M9 17h5',
  memory: 'M7 4h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM9 9h6M9 13h6M9 17h3',
  globe: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z',
  spark: 'M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M6 18l2.5-2.5M15.5 8.5L18 6',
  code: 'M8 7l-5 5 5 5M16 7l5 5-5 5'
};
const TYPES = {
  'Built-in': { bg: '#e6f4ec', fg: '#1a7a4c', blurb: 'Ready on every agent from the first run. Nothing to install, nothing to configure.' },
  'Custom': { bg: '#f6f1df', fg: '#86691a', blurb: 'Describe the API call in plain language and the coding agent writes the tool, schema and auth — or open the built-in IDE and write it yourself.' },
  'Community': { bg: '#e8eef8', fg: '#2f5fa8', blurb: 'Built by the community, reviewed, and approved for everyone. Connect once, grant per agent.' },
  'MCP': { bg: '#16171a', fg: '#f2f1ec', blurb: 'Point an agent at any MCP endpoint. Every tool it exposes appears automatically — you choose which ones the agent may use.' }
};
const tools = [
  { name: 'get_database_schema', vendor: 'FlowStudio', type: 'Built-in', icon: 'data', desc: 'Lets an agent inspect tables, columns and relationships before it writes a query.', actions: ['list_tables', 'describe'], auth: 'Uses your connection', access: 'Read-only' },
  { name: 'run_sql', vendor: 'FlowStudio', type: 'Built-in', icon: 'sql', desc: 'Runs read-only SQL against a database you connect and returns the result table.', actions: ['query'], auth: 'Uses your connection', access: 'Read-only' },
  { name: 'search_document', vendor: 'FlowStudio', type: 'Built-in', icon: 'doc', desc: 'Semantic search over documents you upload and sites you configure to crawl.', actions: ['search', 'cite'], auth: 'None', access: 'Read-only' },
  { name: 'session_memory', vendor: 'FlowStudio', type: 'Built-in', icon: 'memory', desc: 'Gives an agent memory that carries across turns and runs in the same session.', actions: ['remember', 'recall'], auth: 'None', access: 'Read & write' },
  { name: 'fetch_url', vendor: 'FlowStudio', type: 'Built-in', icon: 'globe', desc: 'Fetches a web page and returns clean, readable text for the agent to work with.', actions: ['get'], auth: 'None', access: 'Read-only' },
  { name: 'xero_invoices', vendor: 'Generated from a prompt', type: 'Custom', icon: 'spark', desc: '“Fetch open invoices from Xero.” The coding agent wrote the tool, its schema and OAuth handling.', actions: ['list_open', 'get_invoice'], auth: 'OAuth', access: 'Read-only' },
  { name: 'refund_order', vendor: 'Written in the IDE', type: 'Custom', icon: 'code', desc: 'Your own Python, run in an isolated, single-use sandbox with CPU, memory and network limits.', actions: ['refund'], auth: 'API key', access: 'Write' },
  { name: 'Slack', vendor: 'Community', type: 'Community', mono: 'Sl', desc: 'Post messages, reply in threads, and run a bot your agents speak through.', actions: ['post_message', 'reply', 'bot'], auth: 'OAuth', access: 'Read & write' },
  { name: 'Notion', vendor: 'Community', type: 'Community', mono: 'N', desc: 'Search pages, read databases, and create or update entries.', actions: ['search', 'create_page'], auth: 'OAuth', access: 'Read & write' },
  { name: 'Salesforce', vendor: 'Community', type: 'Community', mono: 'Sf', desc: 'Look up accounts and contacts, and update opportunities from a workflow.', actions: ['query', 'update_record'], auth: 'OAuth', access: 'Read & write' },
  { name: 'HubSpot', vendor: 'Community', type: 'Community', mono: 'H', desc: 'Create contacts, log activity, and move deals through stages.', actions: ['create_contact', 'update_deal'], auth: 'OAuth', access: 'Read & write' },
  { name: 'Google Sheets', vendor: 'Community', type: 'Community', mono: 'Gs', desc: 'Read ranges, append rows, and keep a sheet in sync with a workflow.', actions: ['read_range', 'append_row'], auth: 'OAuth', access: 'Read & write' },
  { name: 'Discord', vendor: 'Community', type: 'Community', mono: 'D', desc: 'Run a bot in your server that routes messages into a workflow.', actions: ['bot', 'post_message'], auth: 'Bot token', access: 'Read & write' },
  { name: 'Telegram', vendor: 'Community', type: 'Community', mono: 'T', desc: 'Let people talk to your agents through a Telegram bot.', actions: ['bot', 'send_message'], auth: 'Bot token', access: 'Read & write' },
  { name: 'HTTP request', vendor: 'Community', type: 'Community', mono: '{ }', desc: 'Call any REST endpoint with headers, auth and a typed response.', actions: ['get', 'post'], auth: 'Any', access: 'Read & write' },
  { name: 'internal.acme.dev', vendor: 'Your MCP server', type: 'MCP', mono: 'M', desc: 'Every tool your server exposes is discovered automatically. Grant only the ones you trust.', actions: ['list_orders', 'refund_order'], auth: 'Token', access: 'You decide' },
  { name: 'GitHub MCP', vendor: 'MCP endpoint', type: 'MCP', mono: 'Gh', desc: 'Read diffs, open issues, and comment on pull requests through MCP.', actions: ['get_diff', 'comment'], auth: 'OAuth', access: 'You decide' },
  { name: 'Linear MCP', vendor: 'MCP endpoint', type: 'MCP', mono: 'L', desc: 'Create, triage and update issues from any agent in a workflow.', actions: ['create_issue', 'update'], auth: 'OAuth', access: 'You decide' }
];
window.FS_TOOLS = { I, TYPES, tools };
})();
