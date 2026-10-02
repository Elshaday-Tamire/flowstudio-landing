(function(){
const P = {
  sequential: { name: 'Sequential', tagline: 'Each agent hands its output to the next — one clear line from input to result.', bestFor: 'Processes with a fixed order: intake, review, approve.',
    steps: [{ t: 'Trigger', b: 'A ticket, file, or schedule starts the run.' }, { t: 'Hand off', b: 'Each agent receives the previous output as a typed payload.' }, { t: 'Validate', b: 'Contracts are checked at design time, so broken hand-offs never ship.' }, { t: 'Deliver', b: 'The last agent posts the result where your team works.' }],
    useCases: [{ industry: 'Support', title: 'Ticket triage', body: 'Parse, classify, enrich and route every ticket the same way, every time.', agents: ['Intake', 'Classify', 'Enrich', 'Route'] },
      { industry: 'Finance', title: 'Expense approval', body: 'Extract the receipt, check it against policy, approve it or flag it for a manager.', agents: ['Extract', 'Policy check', 'Approve'] },
      { industry: 'Engineering', title: 'Release notes', body: 'Read merged PRs, group the changes, write the notes and post them to Slack.', agents: ['Collect', 'Group', 'Write', 'Publish'] }],
    whenUse: ['Every step depends on the one before it', 'You need an audit trail in a fixed order', 'Predictable cost and latency matter'],
    whenNot: [{ t: 'Steps are independent and could run at once', alt: 'parallel' }, { t: 'Work needs several rounds of revision', alt: 'collaborative' }] },
  parallel: { name: 'Parallel', tagline: 'Independent agents run at the same time, then their results are merged into one.', bestFor: 'Research and enrichment where sources don’t depend on each other.',
    steps: [{ t: 'Fan out', b: 'One trigger starts several agents at once.' }, { t: 'Run together', b: 'Each agent works its own source with its own tools.' }, { t: 'Collect', b: 'The merge waits for the last agent to finish.' }, { t: 'Merge', b: 'Results combine into one typed output.' }],
    useCases: [{ industry: 'Sales', title: 'Lead enrichment', body: 'Firmographics, intent and social signals gathered at once, then scored.', agents: ['Firmographics', 'Intent', 'Social', 'Score'] },
      { industry: 'Research', title: 'Competitive scan', body: 'One agent per competitor, merged into a single side-by-side comparison.', agents: ['Scout ×5', 'Compare'] },
      { industry: 'Data', title: 'Multi-source QA', body: 'Check the same metric in three systems and flag any drift.', agents: ['Warehouse', 'CRM', 'Billing', 'Reconcile'] }],
    whenUse: ['Sub-tasks don’t need each other’s output', 'Wall-clock time matters more than order', 'You want several independent opinions'],
    whenNot: [{ t: 'One step needs another’s result', alt: 'sequential' }, { t: 'You need a planner to split the work', alt: 'hierarchical' }] },
  hierarchical: { name: 'Hierarchical', tagline: 'A coordinator plans the work, delegates to specialists, and assembles the answer.', bestFor: 'Open-ended requests that have to be broken down first.',
    steps: [{ t: 'Plan', b: 'The coordinator reads the request and splits it into parts.' }, { t: 'Delegate', b: 'Each part goes to the specialist best suited to it.' }, { t: 'Work', b: 'Specialists run with only the tools they’ve been granted.' }, { t: 'Assemble', b: 'The coordinator checks and combines everything into one answer.' }],
    useCases: [{ industry: 'Data', title: 'Weekly exec report', body: 'Metrics, commentary and charts delegated to specialists, assembled every Monday.', agents: ['Coordinator', 'Analyst', 'Writer'] },
      { industry: 'Research', title: 'Due diligence pack', body: 'Market, legal and financial research split up, then merged into one memo.', agents: ['Lead', 'Market', 'Legal', 'Finance'] },
      { industry: 'Support', title: 'Complex escalations', body: 'Billing, product and account specialists contribute to one clear reply.', agents: ['Coordinator', 'Billing', 'Product'] }],
    whenUse: ['The request has to be broken down before work starts', 'Different parts need different expertise', 'One agent should own the final answer'],
    whenNot: [{ t: 'The steps are always the same', alt: 'sequential' }, { t: 'Work is triggered by outside events', alt: 'event' }] },
  hybrid: { name: 'Hybrid', tagline: 'Ordered stages with concurrent groups inside them — order where it matters, speed where it doesn’t.', bestFor: 'Pipelines with a few slow, independent steps in the middle.',
    steps: [{ t: 'Ingest', b: 'The first stage runs in order and prepares the input.' }, { t: 'Split', b: 'Independent steps run side by side as a group.' }, { t: 'Merge', b: 'The group’s results are reconciled into one record.' }, { t: 'Continue', b: 'Later stages pick up in order with a clean payload.' }],
    useCases: [{ industry: 'Finance', title: 'Invoice to ledger', body: 'Ingest mail, extract and validate side by side, then post behind a review gate.', agents: ['Ingest', 'Extract', 'Validate', 'Post'] },
      { industry: 'Marketing', title: 'Campaign launch', body: 'Brief first; copy, images and audience built together; then a final review.', agents: ['Brief', 'Copy', 'Visuals', 'Review'] },
      { industry: 'Engineering', title: 'PR checks', body: 'Lint, tests and security review run together before a merge decision.', agents: ['Lint', 'Tests', 'Security', 'Decide'] }],
    whenUse: ['Most steps are ordered, a few are independent', 'You want speed without losing the audit trail', 'Stages have clear checkpoints'],
    whenNot: [{ t: 'Everything happens in order', alt: 'sequential' }, { t: 'Everything is independent', alt: 'parallel' }] },
  collaborative: { name: 'Collaborative', tagline: 'Agents take turns improving one shared artifact until it passes review.', bestFor: 'Writing, design and planning where quality comes from iteration.',
    steps: [{ t: 'Draft', b: 'A drafter writes the first version of the shared artifact.' }, { t: 'Critique', b: 'A critic reviews it against the brief and your rules.' }, { t: 'Revise', b: 'An editor applies the feedback to the same artifact.' }, { t: 'Approve', b: 'Rounds repeat until it passes — or a round limit is hit.' }],
    useCases: [{ industry: 'Marketing', title: 'Launch post', body: 'Drafter, critic and editor iterate until the post passes brand review.', agents: ['Drafter', 'Critic', 'Editor'] },
      { industry: 'Engineering', title: 'Spec writing', body: 'Author, reviewer and architect refine one design doc together.', agents: ['Author', 'Reviewer', 'Architect'] },
      { industry: 'Sales', title: 'Proposal drafting', body: 'Pricing, legal and solution agents converge on one client proposal.', agents: ['Solution', 'Pricing', 'Legal'] }],
    whenUse: ['Quality improves with feedback rounds', 'There’s one shared output', 'You can define what “done” looks like'],
    whenNot: [{ t: 'One pass is good enough', alt: 'sequential' }, { t: 'One owner should plan and split the work', alt: 'hierarchical' }] },
  event: { name: 'Event-driven', tagline: 'Named events wake only the agents subscribed to them. Nothing runs until it’s needed.', bestFor: 'Systems reacting to webhooks, status changes and schedules.',
    steps: [{ t: 'Listen', b: 'A webhook, schedule or status change arrives.' }, { t: 'Emit', b: 'It becomes a named event, like order.paid.' }, { t: 'React', b: 'Only the agents subscribed to that event wake up.' }, { t: 'Chain', b: 'Agents can emit new events for others to pick up.' }],
    useCases: [{ industry: 'Finance', title: 'Payment recovery', body: 'Paid orders are fulfilled, failed charges retried, customers told what happened.', agents: ['Fulfil', 'Recover', 'Notify'] },
      { industry: 'Support', title: 'SLA watchdog', body: 'When a ticket nears its SLA, an agent drafts a reply and pings the owner.', agents: ['Watch', 'Draft', 'Ping'] },
      { industry: 'Engineering', title: 'Incident response', body: 'An alert wakes a triage agent, which pages on-call and opens an incident doc.', agents: ['Triage', 'Page', 'Document'] }],
    whenUse: ['Work starts from outside signals', 'Different events need different handling', 'Agents should sit idle — and free — until needed'],
    whenNot: [{ t: 'You run the same job on a schedule', alt: 'sequential' }, { t: 'All the work arrives at once', alt: 'parallel' }] }
};
const G = {
  sequential: [[[18,40],[73,40],[128,40],[182,40]], [[0,1,0],[1,2,1],[2,3,2]]],
  parallel: [[[18,40],[100,14],[100,40],[100,66],[182,40]], [[0,1,0],[0,2,0],[0,3,0],[1,4,1],[2,4,1],[3,4,1]]],
  hierarchical: [[[100,10],[38,40],[100,40],[162,40],[100,70]], [[0,1,0],[0,2,0],[0,3,0],[1,4,1],[2,4,1],[3,4,1]]],
  hybrid: [[[18,40],[72,16],[72,64],[132,40],[182,40]], [[0,1,0],[0,2,0],[1,3,1],[2,3,1],[3,4,2]]],
  collaborative: [[[100,40],[36,14],[164,14],[100,70]], [[1,0,0],[0,2,1],[2,0,2],[0,3,3],[3,0,4]]],
  event: [[[18,40],[72,16],[72,64],[128,16],[128,64],[182,40]], [[0,1,0],[1,3,1],[3,5,2],[0,2,3],[2,4,4],[4,5,5]]]
};
function mini(React, key) {
  const h = React.createElement, [n, e] = G[key];
  const paths = e.map(([a, b, s], i) => { const A = n[a], B = n[b];
    let d; if (Math.abs(B[0] - A[0]) < 4) { const off = (key === 'collaborative' && A[1] > B[1]) ? 8 : (key === 'collaborative' ? -8 : 0); d = `M${A[0] + off},${A[1]}L${B[0] + off},${B[1]}`; }
    else { const m = (A[0] + B[0]) / 2; d = `M${A[0]},${A[1]}C${m},${A[1]} ${m},${B[1]} ${B[0]},${B[1]}`; }
    return { d, s, i }; });
  const maxS = Math.max(...e.map(x => x[2])), dur = (maxS + 1) * 0.55 + 0.8;
  return h('svg', { viewBox: '0 0 200 80', width: '100%', style: { display: 'block', overflow: 'visible' } },
    paths.map(p => h('path', { key: 'e' + p.i, d: p.d, fill: 'none', stroke: '#33372f', strokeWidth: 1.4 })),
    paths.map(p => h('circle', { key: 'k' + p.i, r: 2.6, fill: '#8fdcb0', opacity: 0 },
      h('animateMotion', { path: p.d, dur: dur + 's', begin: (p.s * 0.55) + 's', repeatCount: 'indefinite', keyPoints: '0;1;1', keyTimes: '0;' + (0.5 / dur).toFixed(3) + ';1', calcMode: 'linear' }),
      h('animate', { attributeName: 'opacity', values: '1;1;0;0', keyTimes: '0;' + (0.5 / dur).toFixed(3) + ';' + (0.52 / dur).toFixed(3) + ';1', dur: dur + 's', begin: (p.s * 0.55) + 's', repeatCount: 'indefinite' }))),
    n.map(([x, y], i) => h('g', { key: 'n' + i },
      h('rect', { x: x - 9, y: y - 7, width: 18, height: 14, rx: 4, fill: '#171918', stroke: '#8fdcb0', strokeWidth: 1.2 }),
      h('circle', { cx: x - 3, cy: y - 0.5, r: 1.2, fill: '#8fdcb0' }), h('circle', { cx: x + 3, cy: y - 0.5, r: 1.2, fill: '#8fdcb0' }))));
}
window.FS_PATTERNS = { P, mini, ICON_FOR: { Support: 'support', Finance: 'doc', Engineering: 'code', Sales: 'target', Research: 'search', Data: 'data', Marketing: 'pen' } };
})();
