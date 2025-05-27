## CMake キャッシュ変数の展開

VSCode 設定、タスク、デバッグ設定などで `${cmake:VAR}` 構文を使用して CMake のキャッシュ変数を参照できるようになりました。

例:
```json
{
    "program": "${workspaceFolder}/build/${cmake:CMAKE_BUILD_TYPE}/${cmake:CMAKE_PROJECT_NAME}"
}
```

デフォルト値の指定もサポートしています:
```json
{
    "args": ["--output", "${cmake:OUTPUT_DIR:build/output}"]
}
```

詳細は[ドキュメント](docs/cmake-variable-expansion.md)を参照してください。