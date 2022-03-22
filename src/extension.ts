import fs = require('fs')
import path = require('path');
import { send } from 'process';
import * as vscode from 'vscode';

class CommandRunner {
	private terminal: vscode.Terminal | null;
	constructor() {
		this.terminal = null;
		this.setup();
	}

	public async runTerminalCommand(command: string) {
		if (!this.terminal) {
			this.terminal = vscode.window.createTerminal('Command Runner');
			this.terminal.show();
			await vscode.commands.executeCommand('workbench.action.terminal.clear');
		}
		this.terminal.sendText(command);
	}

	private setup() {
		vscode.window.onDidCloseTerminal(() => {
			this.terminal = null;
		});
	}
}

const commandRunner = new CommandRunner();

async function quickPatchSend(context: vscode.ExtensionContext, uri: vscode.Uri) {
	const rootPath = context.storageUri?.fsPath as string
	const filePath = uri.fsPath
	const fileDir = path.parse(filePath).dir
	const destRootPath = path.join(rootPath, 'debug')
	const destPath = fileDir.substring(fileDir.indexOf('Scripts')).replace('Scripts', destRootPath)
	const destFile = path.join(destPath, filePath.split(path.sep).slice(-1)[0])
	if (!fs.existsSync(destPath)) {
		fs.mkdirSync(destPath, { recursive: true })
	}
	fs.copyFileSync(filePath, destFile)
	vscode.window.showInformationMessage('发送文件到设备:', uri.fsPath)
}

async function quickPatchClear(context: vscode.ExtensionContext) {
	const rootPath = context.storageUri?.fsPath as string
	const destRootPath = path.join(rootPath, 'debug')
	// await commandRunner.runTerminalCommand('echo destFile:' + destFile)
	if (fs.existsSync(destRootPath)) {
		fs.rmdirSync(destRootPath, { recursive: true })
	}
	vscode.window.showInformationMessage('清理Patch成功')
}

export function activate(context: vscode.ExtensionContext) {
	let quickPatchSendCommand = vscode.commands.registerCommand('quick_patch_send', (uri: vscode.Uri) => {
		quickPatchSend(context, uri)
	});

	let quickPatchClearCommand = vscode.commands.registerCommand('quick_patch_clear', () => {
		quickPatchClear(context)
	});

	context.subscriptions.push(quickPatchSendCommand);
	context.subscriptions.push(quickPatchClearCommand);
}

export function deactivate() {}
"c:\\Users\\kongy\\AppData\\Roaming\\Code\\User\\workspaceStorage\\acb01a85a2180aed896b6ba6c69711ee\\undefined_publisher.quick-patch\\debug\\Level"