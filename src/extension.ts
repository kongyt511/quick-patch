import fs = require('fs')
import path = require('path');
import * as vscode from 'vscode';

class CommandRunner {
	private terminal: vscode.Terminal | null;
	constructor() {
		this.terminal = null;
		this.setup();
	}

	public async runTerminalCommand(command: string) {
		if (!this.terminal) {
			this.terminal = vscode.window.createTerminal('QuickPatch');
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

async function quickPatchSendAndroid(context: vscode.ExtensionContext, uri: vscode.Uri) {
	const ext = vscode.workspace.getConfiguration('quick_patch')
	const adbPath = ext.get<string>('adb_path') as string
	const pushPath = ext.get<string>('dest_path_android') as string
	const patchDir = ext.get<string>('patch_dir') as string
	const scriptsDir = ext.get<string>('scripts_dir') as string

	const tmpPath = context.storageUri?.fsPath as string
	const filePath = uri.fsPath
	const fileDir = path.parse(filePath).dir
	const tmpPatchPath = path.join(tmpPath, patchDir)
	const startPos = fileDir.indexOf(scriptsDir)
	if (startPos >= 0) {
		const destPath = fileDir.substring(startPos).replace(scriptsDir, tmpPatchPath)
		const destFile = path.join(destPath, filePath.split(path.sep).slice(-1)[0])
		if (!fs.existsSync(destPath)) {
			fs.mkdirSync(destPath, { recursive: true })
		}
		fs.copyFileSync(filePath, destFile)
		var cmd = adbPath + ' push \"' + tmpPatchPath + '\" ' + pushPath
		commandRunner.runTerminalCommand(cmd)
		vscode.window.showInformationMessage('发送文件到设备:', uri.fsPath)
	} else {
		vscode.window.showErrorMessage('文件不在脚本文件夹中:', uri.fsPath)
	}
}

async function quickPatchClearAndroid(context: vscode.ExtensionContext) {
	const ext = vscode.workspace.getConfiguration('quick_patch')
	const adbPath = ext.get<string>('adb_path') as string
	const pushPath = ext.get<string>('dest_path_android') as string
	const patchDir = ext.get<string>('patch_dir') as string

	const tmpPath = context.storageUri?.fsPath as string
	const tmpPatchPath = path.join(tmpPath, patchDir)
	if (fs.existsSync(tmpPatchPath)) {
		fs.rmdirSync(tmpPatchPath, { recursive: true })
	}
	var cmd = adbPath + ' shell \"rm -rf ' + pushPath + '/' + patchDir + '\"'
	commandRunner.runTerminalCommand(cmd)
	vscode.window.showInformationMessage('清理Patch成功')
}

async function quickPatchSendIOS(context: vscode.ExtensionContext, uri: vscode.Uri) {
	const ext = vscode.workspace.getConfiguration('quick_patch')
	const ifusePath = ext.get<string>('ifuse_path') as string
	const bundleId = ext.get<string>('bundle_id') as string
	const tmpPath = context.storageUri?.fsPath as string
	const pushPath = tmpPath + '/' + bundleId
	const patchDir = ext.get<string>('patch_dir') as string
	const scriptsDir = ext.get<string>('scripts_dir') as string
	
	if (!fs.existsSync(pushPath)) {
		fs.mkdirSync(pushPath, { recursive: true })
	}
	var cmd = ifusePath + ' --documents ' + bundleId + ' \"' + pushPath + '\"';
	commandRunner.runTerminalCommand(cmd)

	const filePath = uri.fsPath
	const fileDir = path.parse(filePath).dir
	const tmpPatchPath = path.join(tmpPath, patchDir)
	const startPos = fileDir.indexOf(scriptsDir)
	if (startPos >= 0) {
		const destPath = fileDir.substring(startPos).replace(scriptsDir, tmpPatchPath)
		const destFile = path.join(destPath, filePath.split(path.sep).slice(-1)[0])
		if (!fs.existsSync(destPath)) {
			fs.mkdirSync(destPath, { recursive: true })
		}
		fs.copyFileSync(filePath, destFile)
		var destPathDir = path.join(pushPath, patchDir)
		commandRunner.runTerminalCommand('rm -rf  \"' + destPathDir + '\"')
		commandRunner.runTerminalCommand('cp -r \"' + tmpPatchPath + '\" \"' + pushPath + '\"')
		commandRunner.runTerminalCommand('umount -f ' + ' \"' + pushPath + '\"')
		vscode.window.showInformationMessage('发送文件到设备:', uri.fsPath)
	} else {
		vscode.window.showErrorMessage('文件不在脚本文件夹中:', uri.fsPath)
	}
}

async function quickPatchClearIOS(context: vscode.ExtensionContext) {
	const ext = vscode.workspace.getConfiguration('quick_patch')
	const ifusePath = ext.get<string>('ifuse_path') as string
	const bundleId = ext.get<string>('bundle_id') as string
	const tmpPath = context.storageUri?.fsPath as string
	const pushPath = tmpPath + '/' + bundleId
	
	if (!fs.existsSync(pushPath)) {
		fs.mkdirSync(pushPath, { recursive: true })
	}
	var cmd = ifusePath + ' --documents ' + bundleId + ' \"' + pushPath + '\"'
	commandRunner.runTerminalCommand(cmd)

	const patchDir = ext.get<string>('patch_dir') as string
	const tmpPatchPath = path.join(tmpPath, patchDir)
	if (fs.existsSync(tmpPatchPath)) {
		fs.rmdirSync(tmpPatchPath, { recursive: true })
	}
	var destPathDir = path.join(pushPath, patchDir)
	commandRunner.runTerminalCommand('rm -rf  \"' + destPathDir + '\"')
	commandRunner.runTerminalCommand('umount -f ' + ' \"' + pushPath + '\"')
	vscode.window.showInformationMessage('清理Patch成功')
}

export function activate(context: vscode.ExtensionContext) {
	let quickPatchSendAndroidCommand = vscode.commands.registerCommand('quick_patch_send_android', (uri: vscode.Uri) => {
		quickPatchSendAndroid(context, uri)
	});

	let quickPatchClearAndroidCommand = vscode.commands.registerCommand('quick_patch_clear_android', () => {
		quickPatchClearAndroid(context)
	});
	
	let quickPatchSendIOSCommand = vscode.commands.registerCommand('quick_patch_send_ios', (uri: vscode.Uri) => {
		quickPatchSendIOS(context, uri)
	});

	let quickPatchClearIOSCommand = vscode.commands.registerCommand('quick_patch_clear_ios', () => {
		quickPatchClearIOS(context)
	});

	context.subscriptions.push(quickPatchSendAndroidCommand);
	context.subscriptions.push(quickPatchClearAndroidCommand);
	
	context.subscriptions.push(quickPatchSendIOSCommand);
	context.subscriptions.push(quickPatchClearIOSCommand);
}

export function deactivate() {}