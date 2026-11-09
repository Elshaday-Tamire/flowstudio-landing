(function(){
// The page runtime can execute this file twice; keep the first copy, which may already be loading.
if (window.FS_MARKET) return;
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
// Workflows come from the public marketplace catalog; see load() below.
const workflows = [];
const API = 'https://api.flowstudio-ai.com/marketplace/workflows/public/catalog';
const PATTERNS = { sequential: 'Sequential', parallel: 'Parallel', hierarchical: 'Hierarchical', hybrid: 'Hybrid', collaborative: 'Collaborative', event_driven: 'Event-driven' };
const CATEGORIES = { messaging: 'Messaging', productivity: 'Productivity', data: 'Data', ai: 'AI', crm: 'CRM', utilities: 'Utilities', other: 'Other' };
const count = n => n >= 1000 ? (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k' : String(n);
function toWorkflow(it) {
  return { id: it.marketplace_template_id, name: it.title, by: it.submitter_name || '', category: CATEGORIES[it.category] || it.category,
    pattern: PATTERNS[it.pattern] || 'Sequential', desc: it.description, nodes: it.node_count || 0, agents: it.agent_count || 0,
    tools: it.needs ? (it.needs.tools || []).map(t => t.name) : (it.requirements || []).filter(r => r.kind === 'tool').map(r => r.name),
    installs: count(it.acquired_count || 0), rating: it.rating_avg == null ? '' : it.rating_avg.toFixed(1), ratingCount: it.rating_count || 0,
    price: 'Free', steps: it.steps || [], links: it.edges, positions: it.positions, featured: !!it.is_featured, rank: it.featured_rank };
}
// Placeholder agents have no rating count, so they keep the plain "★ 4.9".
function ratingLabel(it) {
  if (it.ratingCount === undefined) return { main: '★ ' + it.rating, sub: '' };
  if (!it.ratingCount) return { main: 'Not rated yet', sub: '' };
  return { main: '★ ' + it.rating, sub: ' · ' + it.ratingCount + (it.ratingCount === 1 ? ' rating' : ' ratings') };
}
async function fetchAll() {
  const out = [];
  for (let offset = 0; ; offset += 50) {
    const r = await fetch(`${API}?limit=50&offset=${offset}`);
    if (!r.ok) throw new Error('catalog ' + r.status);
    const page = await r.json();
    out.push(...page.items);
    if (!page.items.length || out.length >= page.count) return out;
  }
}
// Featured first (ranked, then unranked), then the API's newest-first order.
function load() {
  if (M.status !== 'idle') return;
  M.status = 'loading';
  fetchAll().then(items => {
    const ws = items.map(toWorkflow).map((w, i) => ({ w, i }))
      .sort((a, b) => (b.w.featured - a.w.featured) || ((a.w.rank ?? Infinity) - (b.w.rank ?? Infinity)) || (a.i - b.i)).map(x => x.w);
    workflows.push(...ws);
    M.status = 'ready';
  }).catch(() => { M.status = 'error'; })
    .finally(() => window.dispatchEvent(new Event('fs-market')));
}
const G = {
  'Sequential': [[[16,36],[72,36],[128,36],[184,36]], [[0,1],[1,2],[2,3]]],
  'Parallel': [[[16,36],[100,12],[100,36],[100,60],[184,36]], [[0,1],[0,2],[0,3],[1,4],[2,4],[3,4]]],
  'Hierarchical': [[[100,10],[40,36],[100,36],[160,36],[100,62]], [[0,1],[0,2],[0,3],[1,4],[2,4],[3,4]]],
  'Hybrid': [[[16,36],[72,14],[72,58],[132,36],[184,36]], [[0,1],[0,2],[1,3],[2,3],[3,4]]],
  'Collaborative': [[[100,36],[36,12],[164,12],[100,62]], [[1,0],[0,2],[0,3]]],
  'Event-driven': [[[16,36],[72,14],[72,58],[128,14],[128,58],[184,36]], [[0,1],[0,2],[1,3],[2,4],[3,5],[4,5]]]
};
// Places a workflow's nodes where they sit on the editor canvas (card centers;
// cards are 200x80 there), scaled uniformly into the same 200x72 box as G.
// Edges run horizontally or vertically by the angle between nodes, like the
// canvas's autoSides.
function canvasLayout(positions, links) {
  const c = positions.map(([x, y]) => [x + 100, y + 40]);
  const xs = c.map(p => p[0]), ys = c.map(p => p[1]);
  const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  const k = Math.min(168 / Math.max(x1 - x0, 1), 52 / Math.max(y1 - y0, 1));
  const pos = c.map(([x, y]) => [100 + (x - (x0 + x1) / 2) * k, 36 + (y - (y0 + y1) / 2) * k]);
  const horiz = [], vert = [];
  links.forEach(([a, b]) => {
    if (!c[a] || !c[b]) return;
    const ang = Math.atan2(c[b][1] - c[a][1], c[b][0] - c[a][0]) * 180 / Math.PI;
    (Math.abs(ang) <= 45 || Math.abs(ang) >= 135 ? horiz : vert).push([a, b]);
  });
  return [pos, horiz, vert];
}
// `w` is a pattern name (fixed illustration) or a workflow with its canvas `positions`.
function graph(w) {
  const real = typeof w === 'object' && w.positions && w.nodes > 0 && w.positions.length === w.nodes;
  const [n, e, vert] = real ? canvasLayout(w.positions, w.links || []) : [...G[typeof w === 'object' ? w.pattern : w], []];
  let ed = '', nd = '';
  vert.forEach(([a, b]) => { const A = n[a], B = n[b], m = (A[1] + B[1]) / 2;
    ed += `M${A[0]},${A[1]}C${A[0]},${m} ${B[0]},${m} ${B[0]},${B[1]}`; });
  e.forEach(([a, b]) => { const A = n[a], B = n[b];
    if (Math.abs(B[0] - A[0]) < 4) ed += `M${A[0]},${A[1]}L${B[0]},${B[1]}`;
    else { const m = (A[0] + B[0]) / 2; ed += `M${A[0]},${A[1]}C${m},${A[1]} ${m},${B[1]} ${B[0]},${B[1]}`; } });
  n.forEach(([x, y]) => { nd += `M${x - 5},${y}a5,5 0 1,0 10,0a5,5 0 1,0 -10,0`; });
  return { edges: ed, nodes: nd };
}
const M = window.FS_MARKET = { ICONS, TINTS, agents, workflows, graph, ratingLabel, load, status: 'idle' };
})();
