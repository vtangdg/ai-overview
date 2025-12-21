你的任务是把给定的数据，结合tool.ts文件内容，按照转换示例进行转换后重新构建tool.ts中的相关数据。

以下是原始数据：
<data>
AI对话聊天：DeepSeek,豆包,腾讯元宝,ChatGPT,Kimi,通义千问,文心一言
AI提示词：PromptPilot
AI写作工具：星月写作,讯飞绘文,aibiye
AI图像工具
    插画生成：Midjourney
    背景移除：Remove.bg
AI语音工具：讯飞听见
AI视频工具
    视频生成：Veo3,Sora,即梦AI
AI编程工具：Trae,Cursor,Github Copilot,通义灵码
AI开发平台：Coze,Dify,n8n,阿里云百炼
AI办公：讯飞智文
</data>

以下是转换示例：
其中冒号后面的内容是具体工具，属于冒号前面的分类，工具必须要有一级分类，可以没有二级分类，可以隶属多个二级分类

<conversion_example>
AI写作工具：星月写作
    论文写作：蛙蛙写作
AI图像工具：Midjourney

转换后的数据如下
Category[] =[
  {
    id: 1,
    name: "AI写作工具",
    icon: "✍️",
    subcategories: [
      { id: 101, name: "论文写作" }
    ]
  },
  {
    id: 2,
    name: "AI图像工具",
    icon: "🖼️",
    subcategories: [
    ]
  }
];
AITool[] = [
  // AI写作工具 (categoryId: 1)
  {
    id: 1001,
    name: '星月写作',
    categoryId: 1,
    icon: '✍️',
    breifDesc: '专注于学术论文和英文写作的AI写作助手。'
  },
  {
    id: 1002,
    name: '蛙蛙写作',
    categoryId: 1,
    subcategoryId: 101,
    icon: '✏️',
    breifDesc: '支持多种文体生成的AI写作工具。'
  },
  // AI图像工具 (categoryId: 2)
  {
    id: 2001,
    name: 'Midjourney',
    categoryId: 2,
    icon: '🎨',
    breifDesc: '生成高质量艺术图像的AI创作平台。'
  }
]
</conversion_example>

请按照以下步骤完成任务：
1. 仔细分析原始数据的结构，确定一级分类和可能存在的二级分类。
2. 分析已经存在的工具和分类，确定哪些工具需要更新，哪些分类需要新增。
3. 参考转换示例，为每个分类和工具分配合适的id、图标和简要描述。
4. 结合tool.ts文件的现有结构，将转换后的数据插入到合适的位置，重新构建tool.ts中的相关数据。
5. 读取<data>标签里的内容，解析出具体的工具列表，然后过滤出frontend/public/lib/tools/目录中不存在的工具，根据tool-detail.md文件中的内容，生成对应的工具详情介绍文件