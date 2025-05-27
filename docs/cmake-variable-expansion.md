# CMake キャッシュ変数の展開

CMake Tools 拡張機能は、VSCode の設定や launch.json、tasks.json などで `${cmake:VAR}` 構文を使用して CMake のキャッシュ変数を参照できます。

## 基本的な使い方

```json
{
    "program": "${workspaceFolder}/build/${cmake:CMAKE_BUILD_TYPE}/${cmake:CMAKE_PROJECT_NAME}"
}
```

上記の例では、`${cmake:CMAKE_BUILD_TYPE}` が実際の CMake のビルドタイプ（Debug、Release など）に、`${cmake:CMAKE_PROJECT_NAME}` がプロジェクト名に展開されます。

## デフォルト値の指定

変数が存在しない場合や CMake が configure されていない場合に備えて、デフォルト値を指定できます：

```json
{
    "program": "${workspaceFolder}/${cmake:CMAKE_BINARY_DIR:build}/bin/myapp"
}
```

この例では、`CMAKE_BINARY_DIR` が定義されていない場合、`build` が使用されます。

## 複数のワークスペースでの動作

複数のワークスペースフォルダがある場合、変数はアクティブな CMake プロジェクトから展開されます。特定のワークスペースフォルダを指定するには、タスクやデバッグ構成で `"cwd"` を設定し、その値に応じた変数展開が行われます。

## 利用可能なタイミング

この機能は、CMake キャッシュが生成された後（つまり、configure が成功した後）にのみ動作します。CMake の configure が実行されていない場合、デフォルト値が使用されるか、または `<undefined:VAR>` という形式で展開されます。

## 一般的な使用例

### launch.json での使用

```json
{
    "configurations": [
        {
            "name": "Debug",
            "type": "cppdbg",
            "request": "launch",
            "program": "${workspaceFolder}/${cmake:CMAKE_BINARY_DIR:build}/${cmake:CMAKE_PROJECT_NAME}",
            "args": [],
            "environment": [
                {
                    "name": "LD_LIBRARY_PATH",
                    "value": "${cmake:CMAKE_BINARY_DIR:build}/lib"
                }
            ],
            "cwd": "${workspaceFolder}"
        }
    ]
}
```

### tasks.json での使用

```json
{
    "tasks": [
        {
            "label": "Install",
            "type": "shell",
            "command": "cmake",
            "args": [
                "--install",
                "${cmake:CMAKE_BINARY_DIR:build}",
                "--prefix",
                "${cmake:CMAKE_INSTALL_PREFIX:/usr/local}"
            ]
        }
    ]
}
```

### settings.json での使用

```json
{
    "cmake.configureSettings": {
        "MY_VARIABLE": "${cmake:ANOTHER_VARIABLE:default}"
    }
}
```