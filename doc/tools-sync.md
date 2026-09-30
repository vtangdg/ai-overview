# AI 工具箱自动同步（tools-sync）

"AI工具箱"，支持半自动更新：人工只提供新工具线索，其余（数据、详情、图标）由脚本 + LLM 生成，最终以 PR 形式供人工审核。

## 数据链路

```
frontend/data/tools.json          # 唯一数据源：分类 + 工具列表
frontend/public/lib/tools/*.md    # 工具详情（按工具名命名）
frontend/public/tool-icon/*       # 工具图标
```

前端 `src/lib/tools.ts` 从 JSON 导入数据，展示逻辑不变。

## 方式一：GitHub Actions 自动同步（推荐）

1. 把新工具清单粘贴到 `scripts/tools-sync/input/pending-tools.md`，格式：

   ```
   AI编程工具：Windsurf,新工具B
   AI办公
       演示制作：Gamma
   ```

2. 提交后到 GitHub 仓库 → Actions → **AI Tools Sync** → Run workflow。
3. Action 会调用 DeepSeek API 生成数据/详情/图标，并自动创建 PR。
4. 审核 PR（重点：分类归属、描述准确性、图标效果），合并后自动部署。

前提：仓库 Secrets 中需配置 `DEEPSEEK_API_KEY`。

## 方式二：本地运行

```bash
export DEEPSEEK_API_KEY=sk-xxx   # 或写在仓库根目录 .env 中复用
node scripts/tools-sync/sync.mjs
```

脚本行为：

- 已存在的工具（按名称忽略大小写）自动跳过
- 图标抓取：优先 `icon.horse`，其次 Google favicon；失败回退为 emoji
- 工具 ID 按分类分段自动分配（categoryId * 1000 起段）
- 清单为空时直接退出，不产生任何变更

## 方式三：本地智能体更新（WorkBuddy / Trae 等）

直接对智能体说一句话即可，例如：

> 帮我把 Windsurf、Lovable 这两个工具加进 AI 工具箱

智能体应遵循的标准流程（已写入 `CLAUDE.md`，Trae 见 `.trae/rules/project_rules.md`）：

1. **方式A（智能体本地执行，推荐）**：智能体自带模型能力，直接编辑 `frontend/data/tools.json` + 生成详情 md + 抓图标，无需 API key，也不需要跑脚本
2. **方式B（脚本模式）**：把清单写入 `scripts/tools-sync/input/pending-tools.md` → 从仓库根目录 `.env` 读取 `DEEPSEEK_API_KEY` → 执行 `node scripts/tools-sync/sync.mjs`（脚本自己调 LLM）。适用于 CI 或本地没有智能体的场景

两种方式的收尾都一样：校验通过后由你确认，再提交部署。

## 移除工具

```bash
node scripts/tools-sync/sync.mjs --remove 工具名1 工具名2
```

- 按名称匹配（忽略大小写，支持逗号分隔），无需 API key
- 自动清理三件套：`tools.json` 条目、详情 md、不再被其他工具引用的图标文件
- 名称不存在的会提示跳过；移除后数据自动按 id 排序
- 对智能体说"把 X 从工具箱移除"即可，流程已写入 CLAUDE.md

## 直接手动维护

小改动也可以直接编辑 `frontend/data/tools.json`，注意：

- 详情文件名必须与工具 `name` 字段完全一致（含大小写与空格）
- 图标放入 `frontend/public/tool-icon/`，`icon` 字段填 `/tool-icon/xxx.png` 或直接填 emoji
