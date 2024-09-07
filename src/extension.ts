import * as vscode from 'vscode';

let statusBarItem: vscode.StatusBarItem;

export function activate(context: vscode.ExtensionContext) {
  statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  context.subscriptions.push(statusBarItem);

  let disposable = vscode.commands.registerCommand('vscode-error-gpt.copyErrorsAndPrompt', async () => {
    const activeEditor = vscode.window.activeTextEditor;
    if (!activeEditor) {
      vscode.window.showErrorMessage('No active editor');
      return;
    }

    const document = activeEditor.document;
    const diagnostics = vscode.languages.getDiagnostics(document.uri);
    
    let errorMessages = diagnostics.map(diag => 
      `Line ${diag.range.start.line + 1}: ${diag.message}`
    ).join('\n');

    if (errorMessages.length === 0) {
      vscode.window.showInformationMessage('No errors found in the current file.');
      return;
    }

    const fileContent = document.getText();
    const fileName = document.fileName.split('/').pop() || document.fileName;

    const prompt = `
I'm working on a file named "${fileName}" with the following errors:

${errorMessages}

Here's the current content of the file:

\`\`\`${document.languageId}
${fileContent}
\`\`\`

Please help me fix these errors and explain the solutions. Important instructions:

1. Only fix the errors mentioned above. Do not make any other changes or improvements to the code.
2. Preserve the original structure and style of the code as much as possible.
3. After fixing the errors, provide the complete updated file content in a code block.
4. The updated content should only contain the necessary fixes and be ready to directly replace the current file content.
5. After the code block, briefly explain what changes were made to fix each error.

Thank you for your assistance!
    `;

    await vscode.env.clipboard.writeText(prompt);

    updateStatusBar("$(check) Copied", "statusBarItem.warningBackground");
    vscode.window.showInformationMessage('Errors and file content copied to clipboard as a prompt');
  });

  context.subscriptions.push(disposable);
}

function updateStatusBar(text: string, color: string) {
  statusBarItem.text = text;
  statusBarItem.backgroundColor = new vscode.ThemeColor(color);
  statusBarItem.show();

  setTimeout(() => {
    statusBarItem.hide();
  }, 2000);
}

export function deactivate() {}