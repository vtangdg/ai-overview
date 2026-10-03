# 文档索引

本目录保存项目全部文档。仓库根目录只保留三份入口文件：`README.md`（项目总览）、`CLAUDE.md`（AI 助手指南）、`TODO.md`（待办）。

## 目录结构

```
doc/
├── README.md                      # 本文件：文档地图与维护约定
├── local-dev.md                   # 本地开发：起前端 / 后端 / 监控栈的正确姿势与踩坑
├── monitoring.md                  # Prometheus + Grafana 监控栈、业务指标清单
├── makefile.md                    # backend/Makefile 全部命令说明与典型工作流
├── model-config.md                # AI 模型配置：场景级切模型、思考模式开关、供应商路由
├── tools-sync.md                  # AI 工具箱半自动同步（脚本 / CI / 智能体三种方式）
├── design/                        # 设计方案（含历史存档）
│   ├── architecture.md            # 整体架构改进方案
│   ├── rag-qa.md                  # 站内知识问答（RAG）详细设计方案 ★
│   ├── rag-qa-agent-draft.md      # 早期 Agent 版问答草案（已被上者取代，存档）
│   ├── prompt-optimizer.md        # 提示词优化器完整技术方案
│   └── prompt-optimizer-simple.md # 提示词优化器快捷版方案（实际落地的版本）
├── deploy/
│   └── frontend-vercel.md         # 前端 Vercel 部署 + 自有域名 / DNS 配置
├── setup/
│   ├── project-init.md            # 前端脚手架初始化命令记录
│   └── tech-choice.md             # 技术选型记录（pnpm 选型分析）
├── prompt/                        # 给 AI 用的提示词模板（工具收录、概念生成等）
├── notes/                         # 零散笔记（工具收录旧流程、图标设计说明）
├── meta/                          # 概念词条数据源（concept.json）
└── techtmp/                       # 私有草稿区（已在 .gitignore 中排除，不入库）
```

## 按场景找文档

| 我要…… | 看这份 |
| --- | --- |
| 把项目跑起来 | [local-dev.md](local-dev.md) |
| 用 make 命令管理容器 | [makefile.md](makefile.md) |
| 改代码后让容器生效 | [makefile.md](makefile.md) 的「代码改动后的正确流程」 |
| 给某个应用换模型 / 关思考模式 | [model-config.md](model-config.md) |
| 查 Prometheus 指标、配 Grafana | [monitoring.md](monitoring.md) |
| 往 AI 工具箱加工具 | [tools-sync.md](tools-sync.md)、[prompt/tool-detail.md](prompt/tool-detail.md) |
| 了解 RAG 问答怎么做的 | [design/rag-qa.md](design/rag-qa.md) |
| 了解提示词优化器怎么做的 | [design/prompt-optimizer-simple.md](design/prompt-optimizer-simple.md) |
| 部署前端 / 绑域名 | [deploy/frontend-vercel.md](deploy/frontend-vercel.md) |

## 维护约定

1. **入口文件不搬家**：`README.md` / `CLAUDE.md` / `TODO.md` 固定在仓库根目录（`CLAUDE.md` 是 AI 助手的约定入口，位置有约定意义）。
2. **新文档按类型归位**：跑得起来的操作手册放 `doc/` 顶层；设计方案放 `doc/design/`；部署放 `doc/deploy/`；初始化与选型放 `doc/setup/`。
3. **过期文档不要静默留着**：被新方案取代的设计方案，在标题下加一行 `> 历史存档：已被 xxx 取代（YYYY-MM-DD），仅作决策留痕`，不要直接删（面试/复盘时要用）。参见 [design/rag-qa-agent-draft.md](design/rag-qa-agent-draft.md) 的标注写法。
4. **改代码顺带改文档**：动到配置项、指标名、命令、端口、目录结构时，同步更新本索引指向的那份文档；`CLAUDE.md` 里的约定与命令同样要跟上。
5. **日期标注**：涉及实测数据、时间敏感结论（模型名、阈值、性能数字）的段落，写明核对日期。

_最后核对：2026-10-03_
