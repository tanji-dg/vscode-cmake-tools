/**
 * Module for managing CMakeDriver instances and providing access to them
 */

import * as vscode from 'vscode';
import { CMakeDriver } from './cmakeDriver';

// CMakeDrivers のマップ (フォルダパス -> CMakeDriver)
const driverMap = new Map<string, CMakeDriver>();

/**
 * 特定のワークスペースフォルダに関連付けられている CMakeDriver を登録します
 *
 * @param folder ワークスペースフォルダ
 * @param driver CMakeDriver インスタンス
 */
export function registerCMakeDriverForFolder(folder: vscode.WorkspaceFolder, driver: CMakeDriver): void {
    driverMap.set(folder.uri.fsPath, driver);
}

/**
 * 特定のワークスペースフォルダに関連付けられている CMakeDriver を取得します
 *
 * @param folder ワークスペースフォルダ
 * @returns CMakeDriver インスタンス、または undefined (ドライバーが存在しない場合)
 */
export function getCMakeDriverForFolder(folder: vscode.WorkspaceFolder): CMakeDriver | undefined {
    return driverMap.get(folder.uri.fsPath);
}

/**
 * 特定のワークスペースフォルダに関連付けられている CMakeDriver の登録を解除します
 *
 * @param folder ワークスペースフォルダ
 */
export function unregisterCMakeDriverForFolder(folder: vscode.WorkspaceFolder): void {
    driverMap.delete(folder.uri.fsPath);
}
