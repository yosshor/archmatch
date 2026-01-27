#!/usr/bin/env npx tsx
/**
 * CLI Script: Export groups to file
 * Usage: npm run export [format]
 * Formats: html, json, txt
 */

import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { loadData } from './shared';
import type { AppData } from '../src/types';

const __dirname = dirname(fileURLToPath(import.meta.url));

function exportToHTML(data: AppData): string {
  const allGroups = [...data.existingGroups, ...data.generatedGroups];

  return `<!DOCTYPE html>
<html>
<head>
  <title>Project Groups - ${data.classInfo.courseName}</title>
  <style>
    body { font-family: system-ui; padding: 40px; max-width: 800px; margin: 0 auto; background: #f5f5f5; }
    h1 { color: #1a1a2e; border-bottom: 3px solid #ff6b4a; padding-bottom: 10px; }
    .meta { color: #666; margin-bottom: 30px; }
    .group { background: white; padding: 20px; margin: 15px 0; border-radius: 12px; border-left: 4px solid #ff6b4a; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .group-title { font-weight: bold; font-size: 1.3em; margin-bottom: 15px; color: #1a1a2e; }
    .member { padding: 8px 0; border-bottom: 1px solid #eee; }
    .member:last-child { border-bottom: none; }
    .name { font-weight: 500; }
    .phone { color: #888; font-size: 0.9em; }
    .type { color: #888; font-size: 0.85em; background: #f0f0f0; padding: 2px 8px; border-radius: 4px; }
  </style>
</head>
<body>
  <h1>${data.classInfo.courseName}</h1>
  <div class="meta">
    <p><strong>Teacher:</strong> ${data.classInfo.teacher} | <strong>Semester:</strong> ${data.classInfo.semester}</p>
    <p><strong>Total Groups:</strong> ${allGroups.length} | <strong>Total Students:</strong> ${data.students.length}</p>
  </div>
  ${allGroups.map((group, idx) => {
    const members = group.members.map(id => data.students.find(s => s.id === id)).filter(Boolean);
    return `
  <div class="group">
    <div class="group-title">Group ${idx + 1} <span class="type">${group.isManual ? 'Pre-formed' : 'Auto-matched'}</span></div>
    ${members.map(m => `<div class="member"><span class="name">${m!.name}</span> <span class="phone">${m!.phone}</span></div>`).join('')}
  </div>`;
  }).join('')}
</body>
</html>`;
}

function exportToText(data: AppData): string {
  const allGroups = [...data.existingGroups, ...data.generatedGroups];

  let text = `${data.classInfo.courseName}\n`;
  text += `Teacher: ${data.classInfo.teacher}\n`;
  text += `Semester: ${data.classInfo.semester}\n`;
  text += `${'═'.repeat(50)}\n\n`;

  allGroups.forEach((group, idx) => {
    const members = group.members.map(id => data.students.find(s => s.id === id)).filter(Boolean);
    const type = group.isManual ? 'Pre-formed' : 'Auto-matched';

    text += `Group ${idx + 1} [${type}]\n`;
    text += `${'─'.repeat(30)}\n`;
    members.forEach(m => {
      text += `  • ${m!.name}\n    ${m!.phone}\n`;
    });
    text += '\n';
  });

  return text;
}

type Format = 'html' | 'json' | 'txt';

function exportGroups(format: Format = 'txt'): void {
  const data = loadData();
  const allGroups = [...data.existingGroups, ...data.generatedGroups];

  if (allGroups.length === 0) {
    console.log('✗ No groups to export');
    return;
  }

  const timestamp = new Date().toISOString().split('T')[0];
  let filename: string;
  let content: string;

  switch (format) {
    case 'html':
      filename = `project-groups-${timestamp}.html`;
      content = exportToHTML(data);
      break;
    case 'json':
      filename = `project-groups-${timestamp}.json`;
      content = JSON.stringify(data, null, 2);
      break;
    default:
      filename = `project-groups-${timestamp}.txt`;
      content = exportToText(data);
  }

  const outputPath = join(__dirname, '..', filename);
  writeFileSync(outputPath, content);
  console.log(`✓ Exported ${allGroups.length} groups to ${filename}`);
}

// CLI execution
const format = (process.argv[2] || 'txt') as Format;
const validFormats: Format[] = ['html', 'json', 'txt'];

if (!validFormats.includes(format)) {
  console.log('Usage: npm run export [format]');
  console.log(`Formats: ${validFormats.join(', ')}`);
} else {
  exportGroups(format);
}
