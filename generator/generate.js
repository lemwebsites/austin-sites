#!/usr/bin/env node
// Regenerates all demo sites and the root index.html from leads.json.
//
//   node generator/generate.js            # all sites + root index
//   node generator/generate.js <slug>     # one site (root index still rebuilt)
//
// The Base44 pipeline calls the same render functions with leads coming from
// the Google Places API instead of this file.

const fs = require("fs");
const path = require("path");
const { renderHtml, renderCss, industries } = require("./render");

const ROOT = path.join(__dirname, "..");
const leads = JSON.parse(fs.readFileSync(path.join(__dirname, "leads.json"), "utf8"));

const esc = (s) =>
  String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function renderRootIndex(allLeads) {
  const card = (l) => {
    const ind = industries[l.industry] || industries.generic;
    return `
        <div class="site-card">
            <div class="site-info">
                <span class="tag">${esc(ind.tag)}</span>
                <h2>${esc(l.name)}</h2>
                <p>${esc(l.street)}, ${esc(l.city)}, ${esc(l.state)} ${esc(l.zip)}${l.phone ? " &middot; " + esc(l.phone) : ""}</p>
            </div>
            <a href="${esc(l.slug)}/index.html" class="btn">View Site</a>
        </div>`;
  };

  const sorted = [...allLeads].sort((a, b) => a.industry.localeCompare(b.industry) || a.name.localeCompare(b.name));

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Austin Website Mockups - LEMWebsites</title>
    <meta name="robots" content="noindex">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f5f5f5;
            padding: 40px 20px;
        }
        .container { max-width: 800px; margin: 0 auto; }
        h1 { font-size: 2.5rem; margin-bottom: 10px; color: #1a1a2e; }
        .subtitle { color: #666; font-size: 1.1rem; margin-bottom: 40px; }
        .brand { color: #e94560; font-weight: bold; }
        .count { color: #999; font-size: 0.95rem; margin-bottom: 24px; }
        .site-card {
            background: white;
            border-radius: 12px;
            padding: 30px;
            margin-bottom: 20px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.05);
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 20px;
            transition: transform 0.2s, box-shadow 0.2s;
        }
        .site-card:hover { transform: translateY(-2px); box-shadow: 0 5px 20px rgba(0,0,0,0.1); }
        .site-info h2 { font-size: 1.5rem; color: #1a1a2e; margin-bottom: 5px; }
        .site-info p { color: #666; }
        .tag {
            display: inline-block;
            background: #e94560;
            color: white;
            padding: 4px 12px;
            border-radius: 50px;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 8px;
        }
        .btn {
            display: inline-block;
            padding: 12px 24px;
            background: #e94560;
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            transition: all 0.2s;
        }
        .btn:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(233, 69, 96, 0.3); }
        .footer { margin-top: 40px; text-align: center; color: #999; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Austin Website Mockups</h1>
        <p class="subtitle">Free website demos for local businesses by <span class="brand">LEMWebsites.com</span></p>
        <p class="count">${allLeads.length} demo sites</p>
${sorted.map(card).join("\n")}

        <div class="footer">
            <p>Built by LEMWebsites.com</p>
        </div>
    </div>
</body>
</html>
`;
}

const only = process.argv[2];
let written = 0;

for (const lead of leads) {
  if (only && lead.slug !== only) continue;
  if (!industries[lead.industry]) {
    console.warn(`! ${lead.slug}: unknown industry "${lead.industry}", using generic template`);
  }
  const dir = path.join(ROOT, lead.slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), renderHtml(lead));
  fs.writeFileSync(path.join(dir, "style.css"), renderCss(lead));
  console.log(`✓ ${lead.slug} (${lead.industry}${lead.phone ? "" : ", no phone"})`);
  written++;
}

fs.writeFileSync(path.join(ROOT, "index.html"), renderRootIndex(leads));
console.log(`\n${written} site(s) + root index.html written.`);
