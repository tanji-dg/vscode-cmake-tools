# CLAUDE.md

このファイルは、このリポジトリでコードを扱う際のClaude Code (claude.ai/code) へのガイダンスを提供します。

## プロジェクト概要

CMake Toolsは、設定、ビルド、デバッグ、テスト機能を含む包括的なCMakeプロジェクト管理を提供するVS Code拡張機能です。TypeScriptベースのVS Code拡張機能で、CMakeの各種通信モード（Legacy、Server API、File API）と深く統合されています。

## ビルドと開発コマンド

### 初期セットアップ
```bash
yarn install
```

### 開発
```bash
# 開発用コンパイル（watch付き）
yarn compile-watch

# 一度だけコンパイル
yarn compile

# 本番ビルド
yarn compile-production

# 拡張機能のパッケージング
yarn package
```

### テスト
```bash
# リンターの実行
yarn run lint

# すべてのテストスイートを実行
yarn run pretest              # テストのコンパイル
yarn run smokeTests           # スモークテスト
yarn run unitTests            # ユニットテスト
yarn run integrationTests     # インテグレーションテスト
yarn run backendTests         # バックエンドのみのテスト（VS Codeインスタンスなし）

# 特定のエンドツーエンドテストスイートを実行
yarn run endToEndTestsSuccessfulBuild
yarn run endToEndTestsSingleRoot
yarn run endToEndTestsMultiRoot
```

### 開発ワークフロー
- VS CodeでF5を押すと、拡張機能をビルドして新しい拡張機能開発ホストウィンドウで起動
- 拡張機能はwebpackをバンドリングに使用
- デバッグ用にソースマップが有効
- モジュールパスエイリアスを使用：`@cmt/*`は`src/*`に、`@test/*`は`test/*`にマッピング

## アーキテクチャ

### コアコンポーネント

**ExtensionManager** (`src/extension.ts`)
- 拡張機能全体のライフサイクルを管理するシングルトン
- VS Code UIイベントを下位レベルのCMake操作に橋渡し
- ワークスペースフォルダ管理とマルチルートワークスペースのシナリオを処理
- ProjectController、UIコンポーネント、CMakeドライバー間を調整

**ProjectController** (`src/projectController.ts`)
- ワークスペースフォルダ全体で複数のCMakeProjectインスタンスを管理
- プロジェクトのアクティブ化/非アクティブ化を処理
- アクティブなプロジェクト状態を追跡し、変更をUIに伝播
- ワークスペースフォルダの承認と除外を管理

**CMakeProject** (`src/cmakeProject.ts`)
- 単一のCMakeプロジェクトを表現（ソースディレクトリごとに1つ）
- `create()`静的メソッドによる2フェーズ初期化（非同期初期化が必要）
- 実際のCMake通信のためのCMakeDriverインスタンスを所有
- 設定、ビルド、テスト（CTest）、パッケージ（CPack）操作を管理
- プリセット/キット選択とバリアント管理を処理
- IntelliSense統合のためにCppToolsと連携

### CMake通信ドライバー

拡張機能は3つのCMake通信モードをサポート（CMakeバージョンに基づいて自動選択）：

**CMakeLegacyDriver** (`src/drivers/cmakeLegacyDriver.ts`)
- CMake < 3.7用
- コマンドライン呼び出しからのCMake出力を解析
- 限定的なコードモデル機能

**CMakeServerDriver** (`src/drivers/cmakeServerDriver.ts`)
- CMake 3.7 - 3.13用
- CMake Serverモードを使用（CMake 3.15+で非推奨）
- JSONプロトコル経由でより豊富なプロジェクト情報を提供
- クライアント実装は`cmakeServerClient.ts`にあり

**CMakeFileApiDriver** (`src/drivers/cmakeFileApiDriver.ts`)
- CMake 3.14+用（推奨）
- CMake File API（クエリ/応答メカニズム）を使用
- 最良のプロジェクトモデル情報
- `cmakeFileApi.ts`でFile API応答を解析

すべてのドライバーは**CMakeDriver** (`src/drivers/cmakeDriver.ts`)を拡張し、以下を定義：
- 共通の設定/ビルド/テスト操作
- ターゲットとコードモデルの抽象化
- 環境変数と変数展開
- 進捗レポートと診断収集

### プリセットシステム

**PresetsController** (`src/presets/presetsController.ts`)
- CMakePresets.jsonとCMakeUserPresets.jsonを管理
- プリセットの継承と条件評価を処理
- プリセットファイルの変更を監視
- プリセット選択UIを提供

**プリセットタイプ** (`src/presets/preset.ts`)
- Configureプリセット（CMake設定オプション）
- Buildプリセット（ビルド時オプション）
- Testプリセット（CTestオプション）
- Packageプリセット（CPackオプション）
- Workflowプリセット（複数のステップを統合）

### キットシステム（レガシー、プリセットの代替）

**KitsController** (`src/kits/kitsController.ts`)
- コンパイラツールチェーン定義（キット）を管理
- コンパイラのスキャン（GCC、Clang、MSVCなど）
- キットファイルの場所：ユーザーレベルとワークスペースレベル

**Kit** (`src/kits/kit.ts`)
- コンパイラツールチェーン設定を定義
- ツールチェーンの環境変数を処理
- Visual Studioキットの検出をサポート

**Variant** (`src/kits/variant.ts`)
- ビルドタイプの選択（Debug、Releaseなど）
- `cmake-variants.json/yaml`によるユーザー定義バリアント

### UIコンポーネント

**ステータスバー** (`src/status.ts`)
- 現在のキット/プリセット、ビルドターゲット、起動ターゲットを表示
- 一般的な操作への迅速なアクセスを提供
- プロジェクトの状態ごとに設定可能な表示

**プロジェクトステータスビュー** (`src/ui/projectStatus.ts`)
- プロジェクト設定状態を示すツリービュー
- インタラクティブなプリセット/キット選択
- 設定、ビルド、テスト、デバッグ操作へのアクセス

**プロジェクトアウトライン** (`src/ui/projectOutline/projectOutline.ts`)
- CMakeプロジェクト構造のツリービュー
- ターゲット、ソースファイル、ディレクトリ構造を表示
- ターゲットごとのインラインビルド/デバッグ/起動アクション

**ブックマーク** (`src/ui/bookmarks.ts`)
- 頻繁に使用するターゲットのブックマークを許可

**ピン留めされたコマンド** (`src/ui/pinnedCommands.ts`)
- ユーザー定義のコマンドショートカットへの迅速なアクセス

### 主要サブシステム

**設定展開** (`src/expand.ts`)
- 設定内の変数置換（${workspaceFolder}、${buildType}など）
- キットとプリセットの変数展開
- 環境変数の展開

**診断** (`src/diagnostics/`)
- エラー/警告のためのコンパイラ出力を解析
- GCC、MSVC、GHS、IAR、Diabコンパイラをサポート
- VS Codeの問題パネルと統合

**CTest統合** (`src/ctest.ts`)
- CTestテストスイートを実行
- VS Code Test Explorerと統合
- テストフィルタリングと並列実行をサポート

**CPack統合** (`src/cpack.ts`)
- CPackによるパッケージ生成

**ワークフロー** (`src/workflow.ts`)
- CMake Workflowプリセットを実行

**デバッガ統合** (`src/debug/`)
- CMakeターゲット用のデバッグ設定を提供
- CMakeスクリプトデバッガ（CMake 3.27+）
- C/C++デバッガ（gdb、lldb、MSVC）と統合

**CppTools統合** (`src/cpptools.ts`)
- Microsoft C/C++拡張機能用の設定を提供
- CMakeコードモデルからのIntelliSense設定

**コンパイルデータベース** (`src/compilationDatabase.ts`)
- clangdやその他のツール用にcompile_commands.jsonをエクスポート

## 重要な開発ノート

### コードスタイル
- すべての新しい変数にはlowerCamelCaseを使用（歴史的なsnake_caseは段階的に廃止中）
- TypeScriptコーディングガイドラインに従う
- 4スペースのインデント
- すべての変更でCHANGELOG.mdを更新

### パス処理
- 標準パスには`paths`モジュール（`src/paths.ts`）を使用
- Windows上でのパス比較には常に`util.ts`の`lightNormalizePath()`を使用
- クロスプラットフォームのパスの違いに注意

### 非同期パターン
- 多くの操作がPromises/Thenablesを返す
- CMakeProjectは2フェーズ初期化を使用（コンストラクタ + `init()`）
- リアクティブな状態管理には`prop.ts`の`Property<T>`を使用

### 状態管理
- `StateManager`（`src/state.ts`）が拡張機能の状態を永続化
- ワークスペースごとの状態はVS CodeのState APIに保存
- 変更イベント付きの観察可能な状態には`Property<T>`を使用

### エラー処理とテレメトリー
- エラーレポートには`rollbar`を使用（本番環境のみ）
- 使用状況追跡には`telemetry`モジュールを使用
- ユーザーのテレメトリー設定を尊重

### テスト戦略
- ユニットテスト：VS Code APIなしで個々のモジュールをテスト
- インテグレーションテスト：VS Code APIを使用するが最小限のCMake相互作用
- エンドツーエンドテスト：実際のCMakeプロジェクトで完全なワークフローテスト
- バックエンドテスト：Mochaを直接使用する純粋なTypeScriptテスト
- スモークテスト：クイック検証テスト

### テスト用の重要な環境変数
- `CMT_TESTING=1`：テストモードを有効化
- `CMT_QUIET_CONSOLE=1`：コンソール出力を削減
- `CMT_DEVRUN=1`：開発モード
- `TEST_FILTER`：テストをフィルタリングする正規表現

### 依存関係
- package.jsonで依存関係を追加/更新する前にチームと調整する必要がある
- 拡張機能はAzure Artifactsフィードを使用（.npmrcで設定）
- ローカル開発では、.npmrcを削除してデフォルトのNPMフィードを使用可能

## 一般的なワークフロー

### 新しいCMakeコマンドの追加
1. `package.json`のcontributes.commandsにコマンドを登録
2. `ExtensionManager`（`extension.ts`）にハンドラを実装
3. 適切な`CMakeProject`メソッドに委譲
4. 必要に応じてUIコンポーネントを更新（ステータスバー、ツリービュー）

### 新しいプリセットタイプのサポート追加
1. `src/presets/preset.ts`の型を更新
2. `src/presets/presetsParser.ts`のパーサーを更新
3. `src/presets/presetsController.ts`のコントローラーロジックを更新
4. 関連するビューにUI要素を追加

### 新しいコンパイラ診断パーサーの追加
1. `src/diagnostics/`にパーサーを作成
2. `RawDiagnosticParser`インターフェースを拡張
3. `CMakeBuildConsumer`または適切なコンシューマーに登録
4. `enabledOutputParsers`設定に追加

### ドライバーの動作の変更
1. 共通の動作については基底クラス`CMakeDriver`を更新
2. 必要に応じて特定のドライバー実装でオーバーライド
3. ドライバー機能の違いに注意
4. 3つのドライバーモードすべてでテスト

## 理解すべき重要なファイル

- `src/extension.ts` - 拡張機能のエントリーポイントとコマンド登録
- `src/cmakeProject.ts` - コアプロジェクトロジック
- `src/drivers/cmakeDriver.ts` - 基底ドライバー抽象化
- `src/config.ts` - 設定の読み取りと管理
- `src/expand.ts` - 変数展開ロジック
- `src/presets/preset.ts` - プリセット型定義
- `src/util.ts` - コードベース全体で使用される共通ユーティリティ

## 使用されているVS Code拡張機能API

- ファイルシステム監視（chokidar）
- プロジェクト構造用のツリービュー
- ステータスバーアイテム
- CMakeタスク用のタスクプロバイダー
- デバッグ設定プロバイダー
- Test Explorer API統合
- 設定（Settings）API
- ワークスペースフォルダ管理
