#!/bin/bash

# 定义输出文件名
OUTPUT_FILE="n8n-trigger-extension-v0.1.0.zip"

# 清理旧的构建文件
rm -f "$OUTPUT_FILE"

echo "📦 开始打包插件..."

# 打包文件，排除敏感文件和开发文件
# -x 排除列表：
# env.json        -> 绝对不能包含 API Key
# .git*           -> git 版本控制文件
# .DS_Store       -> macOS 系统文件
# *.zip           -> 避免把旧的压缩包打包进去
# pack_extension.sh -> 打包脚本本身
# *.md            -> 文档可以排除也可以保留，这里保留 README/LICENSE
zip -r "$OUTPUT_FILE" . \
    -x "env.json" \
    -x "*.git*" \
    -x ".DS_Store" \
    -x "*.zip" \
    -x "pack_extension.sh" \
    -x "env.example.json"

echo "✅ 打包完成！"
echo "📁 输出文件: $OUTPUT_FILE"
echo "⚠️  注意: env.json 已被自动排除，以防止 API Key 泄露。"
