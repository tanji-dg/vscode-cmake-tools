import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as vscode from 'vscode';
import * as expand from '../../src/expand';
import { CacheEntry, CacheEntryType } from '../../src/cache';
import { registerCMakeDriverForFolder, unregisterCMakeDriverForFolder } from '../../src/drivers/driver-manager';
import { CMakeDriver } from '../../src/drivers/cmakeDriver';

chai.use(chaiAsPromised);
const expect = chai.expect;

// CMakeDriverのモック
class MockCMakeDriver {
    cmakeCacheEntries = new Map<string, CacheEntry>([
        ['CMAKE_BUILD_TYPE', new CacheEntry('CMAKE_BUILD_TYPE', 'Debug', CacheEntryType.String, 'Type of build', false)],
        ['CMAKE_CXX_COMPILER', new CacheEntry('CMAKE_CXX_COMPILER', '/usr/bin/g++', CacheEntryType.FilePath, 'C++ compiler', false)],
        ['TEST_VARIABLE', new CacheEntry('TEST_VARIABLE', 'test_value', CacheEntryType.String, 'Test variable', false)]
    ]);
}

suite('CMake変数展開テスト', () => {
    const mockFolder = { uri: { fsPath: '/test/path' }, name: 'test', index: 0 } as vscode.WorkspaceFolder;

    setup(() => {
        // モックのCMakeDriverを登録
        registerCMakeDriverForFolder(mockFolder, new MockCMakeDriver() as unknown as CMakeDriver);
    });

    teardown(() => {
        // 登録を解除
        unregisterCMakeDriverForFolder(mockFolder);
    });

    test('基本的な${cmake:VAR}の展開', async () => {
        const result = await expand.expandString('${cmake:CMAKE_BUILD_TYPE}', {
            vars: {
                workspaceFolder: '/test/path',
                workspaceFolderBasename: 'test',
                generator: 'Ninja',
                sourceDir: '/test/path',
                workspaceHash: '1234',
                workspaceRoot: '/test/path',
                workspaceRootFolderName: 'test',
                userHome: '/home/user',
                buildType: 'Debug',
                buildKit: 'test-kit'
            } as expand.KitContextVars,
            cmakeWorkspaceFolder: mockFolder
        });
        expect(result).to.equal('Debug');
    });

    test('未定義の変数の展開', async () => {
        const result = await expand.expandString('${cmake:UNDEFINED_VARIABLE}', {
            vars: {
                workspaceFolder: '/test/path',
                workspaceFolderBasename: 'test',
                generator: 'Ninja',
                sourceDir: '/test/path',
                workspaceHash: '1234',
                workspaceRoot: '/test/path',
                workspaceRootFolderName: 'test',
                userHome: '/home/user',
                buildType: 'Debug',
                buildKit: 'test-kit'
            } as expand.KitContextVars,
            cmakeWorkspaceFolder: mockFolder
        });
        expect(result).to.equal('<undefined:UNDEFINED_VARIABLE>');
    });

    test('デフォルト値を持つ変数の展開', async () => {
        const result = await expand.expandString('${cmake:UNDEFINED_VARIABLE:default_value}', {
            vars: {
                workspaceFolder: '/test/path',
                workspaceFolderBasename: 'test',
                generator: 'Ninja',
                sourceDir: '/test/path',
                workspaceHash: '1234',
                workspaceRoot: '/test/path',
                workspaceRootFolderName: 'test',
                userHome: '/home/user',
                buildType: 'Debug',
                buildKit: 'test-kit'
            } as expand.KitContextVars,
            cmakeWorkspaceFolder: mockFolder
        });
        expect(result).to.equal('default_value');
    });

    test('複数の変数を含む文字列の展開', async () => {
        const result = await expand.expandString('Build type is ${cmake:CMAKE_BUILD_TYPE}, compiler is ${cmake:CMAKE_CXX_COMPILER}', {
            vars: {
                workspaceFolder: '/test/path',
                workspaceFolderBasename: 'test',
                generator: 'Ninja',
                sourceDir: '/test/path',
                workspaceHash: '1234',
                workspaceRoot: '/test/path',
                workspaceRootFolderName: 'test',
                userHome: '/home/user',
                buildType: 'Debug',
                buildKit: 'test-kit'
            } as expand.KitContextVars,
            cmakeWorkspaceFolder: mockFolder
        });
        expect(result).to.equal('Build type is Debug, compiler is /usr/bin/g++');
    });

    test('他の変数展開タイプとの組み合わせ', async () => {
        const result = await expand.expandString('${env:PATH}:${cmake:TEST_VARIABLE}', {
            vars: {
                workspaceFolder: '/test/path',
                workspaceFolderBasename: 'test',
                generator: 'Ninja',
                sourceDir: '/test/path',
                workspaceHash: '1234',
                workspaceRoot: '/test/path',
                workspaceRootFolderName: 'test',
                userHome: '/home/user',
                buildType: 'Debug',
                buildKit: 'test-kit'
            } as expand.KitContextVars,
            envOverride: { PATH: '/usr/bin:/usr/local/bin' },
            cmakeWorkspaceFolder: mockFolder
        });
        expect(result).to.equal('/usr/bin:/usr/local/bin:test_value');
    });
});

