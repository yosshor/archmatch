'use client';

import { useAppStore } from '@/store/useAppStore';
import { exportToHTML, exportToJSON, exportToText } from '@/lib/data';

export function ExportPanel() {
  const { data, showToast } = useAppStore();

  const allGroups = [...data.existingGroups, ...data.generatedGroups];
  const hasGroups = allGroups.length > 0;

  const handleExportHTML = () => {
    const html = exportToHTML(data);
    downloadFile('project-groups.html', html, 'text/html');
    showToast('Exported HTML file');
  };

  const handleExportJSON = () => {
    const json = exportToJSON(data);
    downloadFile('archMatch-data.json', json, 'application/json');
    showToast('Exported JSON backup');
  };

  const handleCopyToClipboard = () => {
    const text = exportToText(data);
    navigator.clipboard.writeText(text).then(() => {
      showToast('Copied to clipboard');
    });
  };

  const handlePresentation = () => {
    const html = generatePresentationHTML(data);
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(html);
      newWindow.document.close();
    }
  };

  const downloadFile = (filename: string, content: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const previewText = exportToText(data);

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h2 className="font-display text-3xl">Export & Share</h2>
      </div>

      {/* Export Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <button
          onClick={handleExportHTML}
          disabled={!hasGroups}
          className="p-6 bg-bg-card border border-border rounded-2xl text-center transition-all hover:-translate-y-0.5 hover:border-accent-primary hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
        >
          <div className="text-4xl mb-4">📄</div>
          <h3 className="font-medium mb-1">Print View</h3>
          <p className="text-sm text-text-muted">Export as printable HTML page</p>
        </button>

        <button
          onClick={handleExportJSON}
          className="p-6 bg-bg-card border border-border rounded-2xl text-center transition-all hover:-translate-y-0.5 hover:border-accent-primary hover:shadow-lg"
        >
          <div className="text-4xl mb-4">{'{ }'}</div>
          <h3 className="font-medium mb-1">JSON Data</h3>
          <p className="text-sm text-text-muted">Full data export for backup</p>
        </button>

        <button
          onClick={handleCopyToClipboard}
          disabled={!hasGroups}
          className="p-6 bg-bg-card border border-border rounded-2xl text-center transition-all hover:-translate-y-0.5 hover:border-accent-primary hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
        >
          <div className="text-4xl mb-4">📋</div>
          <h3 className="font-medium mb-1">Copy List</h3>
          <p className="text-sm text-text-muted">Copy groups as text to clipboard</p>
        </button>

        <button
          onClick={handlePresentation}
          disabled={!hasGroups}
          className="p-6 bg-bg-card border border-border rounded-2xl text-center transition-all hover:-translate-y-0.5 hover:border-accent-primary hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
        >
          <div className="text-4xl mb-4">🎯</div>
          <h3 className="font-medium mb-1">Present</h3>
          <p className="text-sm text-text-muted">Full-screen presentation mode</p>
        </button>
      </div>

      {/* Preview */}
      <div>
        <h3 className="font-display text-xl italic mb-4">Preview</h3>
        <pre className="bg-bg-card border border-border rounded-2xl p-6 text-sm text-text-secondary whitespace-pre-wrap font-mono overflow-auto max-h-96">
          {hasGroups ? previewText : 'No groups to export. Create or generate groups first.'}
        </pre>
      </div>
    </div>
  );
}

function generatePresentationHTML(data: ReturnType<typeof useAppStore.getState>['data']): string {
  const allGroups = [...data.existingGroups, ...data.generatedGroups];

  return `<!DOCTYPE html>
<html>
<head>
  <title>Project Groups - ${data.classInfo.courseName}</title>
  <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@400;500&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'DM Sans', system-ui, sans-serif;
      background: #0a0e14;
      color: #f4f4f5;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px;
    }
    h1 {
      font-family: 'Instrument Serif', serif;
      font-size: 4rem;
      font-style: italic;
      margin-bottom: 20px;
    }
    .subtitle { color: #94a3b8; font-size: 1.5rem; margin-bottom: 40px; }
    .groups {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 20px;
      max-width: 1200px;
    }
    .group {
      background: #151d2b;
      border: 2px solid #ff6b4a;
      border-radius: 16px;
      padding: 30px;
      min-width: 280px;
    }
    .group-num {
      font-family: 'Instrument Serif', serif;
      font-size: 1.5rem;
      font-style: italic;
      color: #ff6b4a;
      margin-bottom: 15px;
    }
    .members { font-size: 1.25rem; line-height: 2; }
  </style>
</head>
<body>
  <h1>${data.classInfo.courseName}</h1>
  <p class="subtitle">Project Groups</p>
  <div class="groups">
    ${allGroups
      .map((group, idx) => {
        const members = group.members
          .map((id) => data.students.find((s) => s.id === id)?.name)
          .filter(Boolean)
          .join('<br>');
        return `
        <div class="group">
          <div class="group-num">Group ${idx + 1}</div>
          <div class="members">${members}</div>
        </div>`;
      })
      .join('')}
  </div>
</body>
</html>`;
}
