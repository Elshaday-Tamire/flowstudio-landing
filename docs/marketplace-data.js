(function(){
const ICONS = {
  support: 'M4 13a8 8 0 0 1 16 0v5a2 2 0 0 1-2 2h-2v-6h4M4 13v5a2 2 0 0 0 2 2h2v-6H4',
  search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM20 20l-4-4',
  data: 'M4 6c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3zm0 0v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3',
  pen: 'M4 20h4L19 9l-4-4L4 16v4zM13 7l4 4',
  doc: 'M6 3h9l4 4v14H6zM14 3v5h5M9 13h7M9 17h5',
  target: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zm0 5a4 4 0 1 0 0 8 4 4 0 0 0 0-8z',
  code: 'M8 7l-5 5 5 5M16 7l5 5-5 5',
  mail: 'M3 6h18v12H3zM3 6l9 7 9-7',
  shield: 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z',
  flow: 'M5 12h4m6 0h4M9 12a3 3 0 1 0 6 0 3 3 0 0 0-6 0'
};
const TINTS = {
  Support: ['#e6f4ec', '#1a7a4c'], Research: ['#e8eef8', '#2f5fa8'], Data: ['#f1ebf7', '#6a43a0'],
  Marketing: ['#f8ece4', '#a5532a'], Finance: ['#f6f1df', '#86691a'], Sales: ['#e4f2f3', '#1f6f74'], Engineering: ['#ececec', '#3a3c3a']
};
const agents = [
  { id: 'a1', name: 'Refund Resolver', by: 'Northbeam', category: 'Support', icon: 'support', desc: 'Reads a ticket, checks order state, and issues refunds under your threshold. Escalates anything else with a summary.', model: 'claude-sonnet-4-6', tools: ['execute_query', 'refund_order', 'post_slack'], installs: '2.4k', rating: '4.9', price: 'Free',
    prompt: 'Resolve refund requests under $200 automatically. Verify duplicate charges before acting. Escalate with a one-paragraph summary otherwise.', inputs: 'ticket text, order id', outputs: 'resolution, refund amount, escalation note' },
  { id: 'a2', name: 'Research Scout', by: 'FlowStudio AI', category: 'Research', icon: 'search', desc: 'Searches the web and your documents, then returns a sourced brief with every claim linked back to where it came from.', model: 'claude-sonnet-4-6', tools: ['fetch_url', 'search_document'], installs: '5.1k', rating: '4.8', price: 'Free',
    prompt: 'Answer the research question with a short brief. Cite a source for every claim. Say clearly when evidence is thin.', inputs: 'question, optional sources', outputs: 'brief, citations' },
  { id: 'a3', name: 'SQL Analyst', by: 'Quarry Labs', category: 'Data', icon: 'data', desc: 'Turns plain-English questions into read-only SQL against your warehouse and explains the answer in a sentence.', model: 'gpt-4o', tools: ['get_database_schema', 'run_sql'], installs: '3.7k', rating: '4.7', price: '$19',
    prompt: 'Inspect the schema first. Write read-only SQL. Return the result table and one sentence of interpretation.', inputs: 'question', outputs: 'sql, result table, summary' },
  { id: 'a4', name: 'Brand Writer', by: 'Arclight', category: 'Marketing', icon: 'pen', desc: 'Drafts posts, emails and landing copy in your voice, trained on a style guide you upload once.', model: 'claude-sonnet-4-6', tools: ['search_document', 'session_memory'], installs: '1.9k', rating: '4.6', price: '$12',
    prompt: 'Write in the voice described by the style guide. Keep sentences short. Offer two alternatives for every headline.', inputs: 'brief, channel', outputs: 'draft, alternatives' },
  { id: 'a5', name: 'Invoice Extractor', by: 'Ledgerly', category: 'Finance', icon: 'doc', desc: 'Pulls vendor, dates, totals and line items out of any invoice PDF into a clean, validated record.', model: 'gpt-4o', tools: ['parse_pdf', 'schema_check'], installs: '2.8k', rating: '4.8', price: '$9',
    prompt: 'Extract vendor, invoice number, dates, currency, totals and line items. Flag any field below 0.9 confidence.', inputs: 'invoice PDF', outputs: 'invoice record, flags' },
  { id: 'a6', name: 'Code Reviewer', by: 'Patchwork', category: 'Engineering', icon: 'code', desc: 'Reviews pull requests for bugs, security issues and style, and leaves inline comments on GitHub.', model: 'claude-sonnet-4-6', tools: ['github_diff', 'post_comment'], installs: '4.2k', rating: '4.9', price: '$24',
    prompt: 'Review the diff for correctness, security and readability. Comment only where it matters. Approve when clean.', inputs: 'pull request', outputs: 'inline comments, verdict' }
];
const workflows = [
  { id: 'w1', name: 'Support triage & refunds', by: 'Northbeam', category: 'Support', pattern: 'Sequential', desc: 'Classifies every inbound ticket, checks order state, issues threshold refunds, and routes the rest to the right human.', nodes: 11, agents: 4, tools: ['execute_query', 'refund_order', 'post_slack'], installs: '1.6k', rating: '4.9', price: '$29',
    steps: ['Intake parses the ticket', 'Classify scores intent', 'Refund Resolver acts under threshold', 'Route assigns the owner'] },
  { id: 'w2', name: 'Invoice ingestion to ledger', by: 'FlowStudio AI', category: 'Finance', pattern: 'Hybrid', desc: 'Watches a mailbox, extracts line items from invoice PDFs, validates them, and posts to your ledger behind a review gate.', nodes: 8, agents: 3, tools: ['read_inbox', 'parse_pdf', 'post_entry'], installs: '2.2k', rating: '4.8', price: 'Free',
    steps: ['Ingest new mail', 'Extract and validate side by side', 'Merge into one record', 'Post to ledger after review'] },
  { id: 'w3', name: 'Lead enrichment & routing', by: 'Arclight', category: 'Sales', pattern: 'Parallel', desc: 'Enriches inbound leads from six sources at once, scores them against your ICP, and assigns an owner in the CRM.', nodes: 14, agents: 5, tools: ['fetch_url', 'crm_lookup', 'crm_update'], installs: '1.1k', rating: '4.7', price: '$49',
    steps: ['Trigger on new lead', 'Research, firmographics and intent run in parallel', 'Score against ICP', 'Assign owner in CRM'] },
  { id: 'w4', name: 'Weekly executive report', by: 'Quarry Labs', category: 'Data', pattern: 'Hierarchical', desc: 'A coordinator delegates metrics, commentary and charts to specialists, then assembles one report every Monday.', nodes: 9, agents: 4, tools: ['run_sql', 'search_document', 'send_email'], installs: '870', rating: '4.8', price: '$19',
    steps: ['Coordinator plans the report', 'Analyst pulls metrics', 'Writer drafts commentary', 'Report assembled and emailed'] },
  { id: 'w5', name: 'Launch post studio', by: 'Arclight', category: 'Marketing', pattern: 'Collaborative', desc: 'Drafter, critic and editor take turns on one shared post until it passes your brand review.', nodes: 6, agents: 3, tools: ['search_document', 'session_memory'], installs: '640', rating: '4.6', price: '$15',
    steps: ['Drafter writes v1', 'Critic reviews against the brief', 'Editor polishes', 'Repeat until approved'] },
  { id: 'w6', name: 'Failed payment recovery', by: 'Ledgerly', category: 'Finance', pattern: 'Event-driven', desc: 'Reacts to payment webhooks: fulfils paid orders, retries failed charges, and tells the customer what happened.', nodes: 10, agents: 3, tools: ['stripe_webhook', 'retry_charge', 'send_email'], installs: '1.3k', rating: '4.9', price: '$29',
    steps: ['Webhook received', 'Paid orders are fulfilled', 'Failed charges are retried', 'Customer is notified'] }
];
const G = {
  'Sequential': [[[16,36],[72,36],[128,36],[184,36]], [[0,1],[1,2],[2,3]]],
  'Parallel': [[[16,36],[100,12],[100,36],[100,60],[184,36]], [[0,1],[0,2],[0,3],[1,4],[2,4],[3,4]]],
  'Hierarchical': [[[100,10],[40,36],[100,36],[160,36],[100,62]], [[0,1],[0,2],[0,3],[1,4],[2,4],[3,4]]],
  'Hybrid': [[[16,36],[72,14],[72,58],[132,36],[184,36]], [[0,1],[0,2],[1,3],[2,3],[3,4]]],
  'Collaborative': [[[100,36],[36,12],[164,12],[100,62]], [[1,0],[0,2],[0,3]]],
  'Event-driven': [[[16,36],[72,14],[72,58],[128,14],[128,58],[184,36]], [[0,1],[0,2],[1,3],[2,4],[3,5],[4,5]]]
};
function graph(p) {
  const [n, e] = G[p]; let ed = '', nd = '';
  e.forEach(([a, b]) => { const A = n[a], B = n[b];
    if (Math.abs(B[0] - A[0]) < 4) ed += `M${A[0]},${A[1]}L${B[0]},${B[1]}`;
    else { const m = (A[0] + B[0]) / 2; ed += `M${A[0]},${A[1]}C${m},${A[1]} ${m},${B[1]} ${B[0]},${B[1]}`; } });
  n.forEach(([x, y]) => { nd += `M${x - 5},${y}a5,5 0 1,0 10,0a5,5 0 1,0 -10,0`; });
  return { edges: ed, nodes: nd };
}
window.FS_MARKET = { ICONS, TINTS, agents, workflows, graph };
})();
