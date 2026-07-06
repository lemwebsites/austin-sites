#!/usr/bin/env node
// Upserts one or more leads into leads.json, then regenerates all sites.
// Called by the build-site GitHub Actions workflow with a payload file:
//
//   node generator/add-lead.js payload.json
//
// payload.json is either a single lead object, {"lead": {...}}, or
// {"leads": [{...}, ...]}. Leads are keyed by slug; existing entries with the
// same slug are replaced. Required fields: slug, name, industry, street,
// city, state, zip.

const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const REQUIRED = ["slug", "name", "industry", "street", "city", "state", "zip"];
const LEADS_PATH = path.join(__dirname, "leads.json");

const payloadPath = process.argv[2];
if (!payloadPath) {
  console.error("Usage: node generator/add-lead.js <payload.json>");
  process.exit(1);
}

const payload = JSON.parse(fs.readFileSync(payloadPath, "utf8"));
const incoming = payload.leads || (payload.lead ? [payload.lead] : [payload]);

const leads = JSON.parse(fs.readFileSync(LEADS_PATH, "utf8"));
let added = 0;
let updated = 0;

for (const lead of incoming) {
  const missing = REQUIRED.filter((f) => !lead[f]);
  if (missing.length) {
    console.error(`✗ Skipping lead (missing ${missing.join(", ")}): ${JSON.stringify(lead).slice(0, 120)}`);
    continue;
  }
  if (!/^[a-z0-9-]+$/.test(lead.slug)) {
    console.error(`✗ Skipping lead with invalid slug: ${lead.slug}`);
    continue;
  }
  const idx = leads.findIndex((l) => l.slug === lead.slug);
  if (idx >= 0) {
    leads[idx] = { ...leads[idx], ...lead };
    updated++;
  } else {
    leads.push(lead);
    added++;
  }
}

fs.writeFileSync(LEADS_PATH, JSON.stringify(leads, null, 2) + "\n");
console.log(`${added} added, ${updated} updated. Regenerating sites...`);

execFileSync(process.execPath, [path.join(__dirname, "generate.js")], { stdio: "inherit" });
