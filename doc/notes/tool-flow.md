# 新增工具（旧流程，已废弃）

> **已废弃**：下面这套「改 `doc/prompt/tool.md` 的 `<data>` 标签 → 让 AI 执行 → 更新工具页面」的流程已被 [tools-sync](../tools-sync.md) 取代（数据源不再是 `tool.ts`，而是 `frontend/data/tools.json`）。保留仅为记录演进过程。

1. 修改 doc/prompt/tool.md 文件，在 `<data>` 标签中添加新的工具信息
2. 让 AI 执行 tool.md 文件，去更新工具页面，生成新的工具文档介绍
3. 核实工具文档内容的正确性，特别是官网地址
4. 获取新增工具的图标，进行替换

**现在的做法**：见 [tools-sync.md](../tools-sync.md)（脚本 / CI / 智能体三种方式）。