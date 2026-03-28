import fs from "fs";
import path from "path";

const MODEL = "mistral-large:latest";
const OUTPUT_DIR = "./src/pages/blog";
const MAX_RETRIES = 3;

const topics = [
  // External Attack Surface
  { slug: "dns-as-attack-surface", title: "DNS Is Not Infrastructure. It Is an Attack Surface.", date: "2024-01-08" },
  { slug: "certificate-transparency-attacker-view", title: "Certificate Transparency Logs: What Attackers See Before You Do", date: "2024-01-22" },
  { slug: "shadow-it-external-risk", title: "Shadow IT Does Not Stay Internal", date: "2024-02-05" },
  { slug: "cloud-asset-sprawl", title: "Cloud Asset Sprawl and the Exposure You Did Not Create", date: "2024-02-19" },
  { slug: "api-surface-inference", title: "API Surface Inference: What Traffic Patterns Reveal", date: "2024-03-04" },
  { slug: "subdomain-takeover-mechanics", title: "Subdomain Takeover: The Mechanics and the Blind Spot", date: "2024-03-18" },
  { slug: "legacy-infrastructure-exposure", title: "Legacy Infrastructure Does Not Retire. It Exposes.", date: "2024-04-01" },
  { slug: "temporary-environments-permanent-risk", title: "Temporary Environments, Permanent Risk", date: "2024-04-15" },
  { slug: "email-misconfiguration-trust", title: "Email Misconfiguration as a Trust Manipulation Vector", date: "2024-04-29" },
  { slug: "osint-attack-preposition", title: "OSINT Is Not Reconnaissance. It Is Attack Pre-Positioning.", date: "2024-05-13" },

  // Vendor & Third-Party Risk
  { slug: "vendor-questionnaires-are-broken", title: "Vendor Questionnaires Measure Paperwork, Not Risk", date: "2024-05-27" },
  { slug: "fourth-party-risk-blind-spot", title: "Fourth-Party Risk: The Vendor Your Vendor Trusts", date: "2024-06-10" },
  { slug: "vendor-access-creep", title: "Vendor Access Creep and the Permissions Nobody Removed", date: "2024-06-24" },
  { slug: "supply-chain-as-attack-vector", title: "The Software Supply Chain Is an Attack Vector, Not a Process", date: "2024-07-08" },
  { slug: "continuous-vendor-monitoring", title: "Point-in-Time Assessments Cannot Measure a Moving Target", date: "2024-07-22" },
  { slug: "vendor-breach-notification-gap", title: "The Vendor Breach Notification Gap", date: "2024-08-05" },
  { slug: "saas-sprawl-risk", title: "SaaS Sprawl: Every Integration Is a Risk Assumption", date: "2024-08-19" },
  { slug: "vendor-posture-vs-attestation", title: "What Vendors Expose vs What They Attest", date: "2024-09-02" },
  { slug: "shared-infrastructure-risk", title: "Shared Infrastructure and the Risk You Inherit", date: "2024-09-16" },
  { slug: "third-party-authentication-flows", title: "Third-Party Authentication Flows as Entry Points", date: "2024-09-30" },

  // Incident Response & Crisis
  { slug: "tabletop-exercises-are-not-enough", title: "Tabletop Exercises Simulate Plans. Attacks Simulate Nothing.", date: "2024-10-14" },
  { slug: "decision-making-under-pressure", title: "Security Decisions Under Pressure Are Different Decisions", date: "2024-10-28" },
  { slug: "cross-functional-breakdown-incidents", title: "Where Incidents Actually Break Down: Cross-Functional Gaps", date: "2024-11-11" },
  { slug: "runbooks-vs-reality", title: "Runbooks Describe the Incident You Planned For", date: "2024-11-25" },
  { slug: "communication-failure-in-crisis", title: "Communication Failure Is the Second Incident", date: "2024-12-09" },
  { slug: "post-incident-review-gaps", title: "Post-Incident Reviews That Miss the Point", date: "2024-12-23" },
  { slug: "crisis-simulation-design", title: "How to Design a Crisis Simulation That Actually Tests You", date: "2025-01-06" },
  { slug: "detection-to-response-gap", title: "The Gap Between Detection and Response Is Where Damage Happens", date: "2025-01-20" },
  { slug: "ransomware-decision-pressure", title: "Ransomware Response Is a Decision Problem, Not a Technical One", date: "2025-02-03" },
  { slug: "containment-vs-eradication-tradeoff", title: "Containment vs Eradication: The Tradeoff Nobody Talks About", date: "2025-02-17" },

  // Adversarial Tactics & Threat Intel
  { slug: "attackers-think-in-pathways", title: "Attackers Think in Pathways. Defenders Think in Controls.", date: "2025-03-03" },
  { slug: "reconnaissance-before-exploitation", title: "Reconnaissance Is Not the Prelude. It Is the Attack.", date: "2025-03-17" },
  { slug: "living-off-the-land-techniques", title: "Living Off the Land: When Legitimate Tools Become Weapons", date: "2025-03-31" },
  { slug: "social-engineering-at-scale", title: "Social Engineering at Scale Does Not Require Sophistication", date: "2025-04-14" },
  { slug: "initial-access-broker-economy", title: "The Initial Access Broker Economy and What It Means for Defense", date: "2025-04-28" },
  { slug: "threat-intel-operationalization", title: "Threat Intelligence That Cannot Be Acted On Is Not Intelligence", date: "2025-05-12" },
  { slug: "adversarial-timing-and-opportunity", title: "Timing and Opportunity: The Dimensions of Attack Nobody Models", date: "2025-05-26" },
  { slug: "identity-as-primary-attack-vector", title: "Identity Is Now the Primary Attack Vector", date: "2025-06-09" },
  { slug: "persistence-mechanisms-overlooked", title: "Persistence Mechanisms That Survive Incident Response", date: "2025-06-23" },
  { slug: "attacker-economics-and-targeting", title: "Attacker Economics: Why You Are a Target", date: "2025-07-07" },
  { slug: "defense-in-depth-is-dead", title: "Defense in Depth Is Dead. Adversarial Modeling Is What Replaced It.", date: "2025-07-21" },
  { slug: "zero-trust-misunderstood", title: "Zero Trust Is an Architecture. Not a Product. Not a Posture.", date: "2025-08-04" },
];

// Phrases that disqualify a post — checked after generation
const BANNED = [
  "treasure map",
  "treasure trove",
  "double-edged sword",
  "necessary evil",
  "in conclusion",
  "it is important to",
  "organizations should",
  "in today's landscape",
  "threat actors",
  "malicious actors",
  "cyber threats",
  "stay ahead of",
  "crucial to defending",
  "robust ",
  "holistic",
  " leverage ",
  "leveraging",
  "utilize",
  "proactive approach",
  "understanding x is",
  "security posture",
];

// Structural checks
function validate(content) {
  const violations = [];
  const lower = content.toLowerCase();

  for (const phrase of BANNED) {
    if (lower.includes(phrase.toLowerCase())) {
      violations.push(`banned phrase: "${phrase}"`);
    }
  }

  // Must have exactly one H1
  const h1matches = content.match(/^# .+$/gm) || [];
  if (h1matches.length !== 1) {
    violations.push(`H1 count: ${h1matches.length} (must be exactly 1)`);
  }

  // Description must be >40 chars (catches "Attackers see certs first" level garbage)
  const descMatch = content.match(/^description:\s*"(.+)"$/m);
  if (descMatch && descMatch[1].length < 60) {
    violations.push(`description too short: "${descMatch[1]}" (${descMatch[1].length} chars, needs 60+)`);
  }

  // Must not end with "understanding X is crucial" style
  if (/understanding .{0,40} is (crucial|key|essential|critical)/i.test(content)) {
    violations.push("weak ending: 'understanding X is crucial' pattern");
  }

  return violations;
}

function buildPrompt(topic, attempt, previousViolations) {
  const violationWarning = previousViolations.length > 0
    ? `\n\nPREVIOUS ATTEMPT FAILED VALIDATION. Fix these specific violations:\n${previousViolations.map(v => `- ${v}`).join("\n")}\n`
    : "";

  return `Write a VigilGuard security blog post. Match the voice of this reference post exactly.
${violationWarning}
---
REFERENCE POST:

---
layout: ../../layouts/Layout.astro
title: "External Presence Is the Attack Surface"
date: "2026-03-26"
description: "External presence is not just footprint. It is the system attackers model, map, and exploit."
---

# External Presence Is the Attack Surface

Most security programs are built around what they control.

- Identity
- Endpoints
- Access

That is not where attacks start.
Attackers begin with what they can observe without permission.
Your external presence is not a perimeter. It is a dataset.

---

## Enumeration Is Not Scanning

Security teams talk about scanning. Attackers perform enumeration. There is a difference.

Scanning answers: *What is open?*
Enumeration answers: *What exists, how it connects, and what it implies.*

That includes DNS expansion and historical records, certificate transparency logs, cloud asset discovery across accounts and regions, and API surface inference from traffic patterns.

*By the time a scanner runs, the attacker already has a map.*

---

## Risk Emerges from Relationships

A misconfigured endpoint rarely causes a breach on its own. What matters is how it connects.

A forgotten subdomain tied to an old S3 bucket naming pattern. A vendor with broad access exposing predictable authentication flows. TLS misconfigurations that enable trust manipulation.

These are not isolated issues. They are entry points that align.
Attackers do not exploit vulnerabilities.

*They exploit relationships between them.*

---

## Time Works Against You

External presence is not static. Assets appear and disappear constantly. CI/CD pipelines create temporary infrastructure. Vendors expand integration scope. DNS records persist long after systems are gone.

The longer something exists, the more likely it is to become misaligned.
Attackers benefit from that drift.

*Most defenses do not account for it.*

---

## Final Thought

You do not defend what you own.
You defend what can be observed, mapped, and combined against you.

**And that is where the attack begins.**

---
END REFERENCE

HARD RULES:
1. Exactly one H1 — the post title. Never use H1 again after the opening.
2. All sections use H2. Separate sections with ---.
3. Last section must be "## Final Thought" — 2-4 sentences max, sharp, no call to action.
4. Prose is the default. Bullets only when items are genuinely discrete. One list per section max.
5. Vary sentence length. Short sentences for claims. Longer sentences for analysis.
6. Open with a direct claim or sharp contrast. Never scene-setting.
7. Italics only for a reframe that hits differently when isolated.

ABSOLUTELY FORBIDDEN — if any of these appear, the post fails:
"treasure map", "treasure trove", "double-edged sword", "necessary evil",
"in conclusion", "it is important", "organizations should", "in today's landscape",
"threat actors", "malicious actors", "cyber threats", "stay ahead of",
"robust", "holistic", "leverage", "leveraging", "utilize", "proactive",
"security posture", "understanding X is crucial", "crucial to defending"

DESCRIPTION: Must be a specific sharp claim, 60-155 characters.
- FAIL: "Attackers see certs first" (too vague, too short)
- FAIL: "Attackers know your TLS config" (says nothing)
- PASS: "Certificate transparency logs are public by design. Attackers use them to map domains, infer infrastructure, and find drift before you do."

Now write:
Title: "${topic.title}"
Date: "${topic.date}"

Output raw markdown only. Start with ---. No preamble. No code fences.`;
}

async function callAPI(prompt) {
  const response = await fetch("http://localhost:11434/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: MODEL,
      stream: false,
      options: { temperature: 0.7, num_predict: 2000, repeat_penalty: 1.15 },
      messages: [
        {
          role: "system",
          content: "You are a precise technical writer. Follow all formatting and banned-phrase instructions exactly. Output only raw markdown starting with ---. No preamble. No commentary.",
        },
        { role: "user", content: prompt },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Ollama error ${response.status}: ${err}`);
  }

  const data = await response.json();
  let content = data.message?.content?.trim() ?? "";
  content = content.replace(/^```(?:markdown|md)?\n?/i, "").replace(/\n?```$/i, "").trim();

  if (!content.startsWith("---")) {
    throw new Error("Output missing frontmatter");
  }

  return content;
}

async function generatePost(topic) {
  let violations = [];

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    if (attempt > 1) {
      process.stdout.write(` retry ${attempt}...`);
      await new Promise((r) => setTimeout(r, 600));
    }

    const prompt = buildPrompt(topic, attempt, violations);
    const content = await callAPI(prompt);
    violations = validate(content);

    if (violations.length === 0) {
      return content;
    }

    process.stdout.write(`\n    ⚠ violations: ${violations.join(" | ")}`);
  }

  throw new Error(`Failed after ${MAX_RETRIES} attempts. Last violations: ${violations.join(", ")}`);
}

async function main() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const existing = fs.readdirSync(OUTPUT_DIR).map((f) => f.replace(".md", ""));

  const forceRegen = process.argv.includes("--regen");
  const onlyIdx = process.argv.indexOf("--only");
  const onlySlug = onlyIdx !== -1 ? process.argv[onlyIdx + 1] : null;

  const queue = onlySlug ? topics.filter((t) => t.slug === onlySlug) : topics;

  let generated = 0;
  let skipped = 0;
  let failed = 0;

  for (const topic of queue) {
    const filename = `${topic.date}-${topic.slug}.md`;
    const filepath = path.join(OUTPUT_DIR, filename);

    if (!forceRegen && existing.includes(`${topic.date}-${topic.slug}`)) {
      console.log(`⏭  skip     ${filename}`);
      skipped++;
      continue;
    }

    process.stdout.write(`⏳ generating  ${filename} ...`);

    try {
      const content = await generatePost(topic);
      fs.writeFileSync(filepath, content + "\n");
      process.stdout.write(` ✓\n`);
      generated++;
      await new Promise((r) => setTimeout(r, 400));
    } catch (err) {
      process.stdout.write(` ✗  ${err.message}\n`);
      failed++;
    }
  }

  console.log(`\nDone. ${generated} generated, ${skipped} skipped, ${failed} failed.`);
}

main();
