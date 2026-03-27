import fs from "fs";
import path from "path";

const MODEL = "llama3.3:70b";
const OUTPUT_DIR = "./src/pages/blog";

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

const systemPrompt = `You are a senior security researcher writing for a technical security blog called VigilGuard.

VigilGuard's platform includes:
- VigilScan: external attack surface intelligence
- VendorGuard: continuous third-party risk monitoring  
- CrisisReady: operational crisis simulation

Writing style rules:
- Precise, direct, no filler
- Short punchy sentences mixed with longer analytical ones
- No marketing language
- Use bullet points sparingly — only when listing genuinely distinct items
- Italicize key reframes or conclusions (use *text*)
- Use --- as section dividers
- Write for practitioners who have seen real breaches, not compliance officers
- No cheerful openers, no "in today's landscape" clichés
- End with a sharp final thought, not a call to action

Format output as raw markdown frontmatter + body. No extra commentary.`;

async function generatePost(topic) {
  const userPrompt = `Write a security blog post with this exact frontmatter:

---
layout: ../../layouts/Layout.astro
title: "${topic.title}"
date: "${topic.date}"
description: "[write a sharp 1-sentence description, max 160 chars]"
---

Then write the full post body. 600-900 words. Use the VigilGuard writing style.
Topic: ${topic.title}

Output only the markdown. Nothing else.`;

  const response = await fetch("http://localhost:11434/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: MODEL,
      prompt: userPrompt,
      system: systemPrompt,
      stream: false,
      options: {
        temperature: 0.7,
        num_predict: 1200,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama error: ${response.status}`);
  }

  const data = await response.json();
  return data.response;
}

async function main() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const existing = fs.readdirSync(OUTPUT_DIR).map((f) => f.replace(".md", ""));

  let generated = 0;
  let skipped = 0;

  for (const topic of topics) {
    const filename = `${topic.date}-${topic.slug}.md`;
    const filepath = path.join(OUTPUT_DIR, filename);

    if (existing.includes(`${topic.date}-${topic.slug}`)) {
      console.log(`⏭  skip   ${filename}`);
      skipped++;
      continue;
    }

    process.stdout.write(`⏳ generating  ${filename} ...`);

    try {
      const content = await generatePost(topic);
      fs.writeFileSync(filepath, content.trim() + "\n");
      process.stdout.write(` ✓\n`);
      generated++;

      // Pause between requests to avoid overwhelming Ollama
      await new Promise((r) => setTimeout(r, 500));
    } catch (err) {
      process.stdout.write(` ✗ ${err.message}\n`);
    }
  }

  console.log(`\nDone. ${generated} generated, ${skipped} skipped.`);
}

main();
