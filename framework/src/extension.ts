// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('WhisperrNote extension is now active');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable = vscode.commands.registerCommand('framework.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from whisperrnote!');
	});

	// Register note commands
	let createNote = vscode.commands.registerCommand('whisperrnote.createNote', async () => {
		const noteContent = await vscode.window.showInputBox({
			placeHolder: 'Enter note content'
		});
		if (noteContent) {
			// TODO: Integrate with backend
			vscode.window.showInformationMessage('Note created!');
		}
	});

	let listNotes = vscode.commands.registerCommand('whisperrnote.listNotes', () => {
		// TODO: Fetch and display notes
		vscode.window.showInformationMessage('Listing notes...');
	});

	context.subscriptions.push(disposable);
	context.subscriptions.push(createNote);
	context.subscriptions.push(listNotes);
}

// This method is called when your extension is deactivated
export function deactivate() {}
