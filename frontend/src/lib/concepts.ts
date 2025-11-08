// 定义AI概念的接口
export interface AITerm {
  id: string;
  name: string;
  definition: string;
  relatedTerms: string[];
  category: string;
  baiduWiki?: string; // 百度百科链接
  wikiPedia?: string; // 维基百科链接
}

// 根据concept.json生成的AI概念数据
export const aiTerms: AITerm[] = [
  // 通识类别
  {
    id: 'ai',
    name: 'AI',
    definition: '人工智能（Artificial Intelligence），1956年于Dartmouth学会上提出，一种旨在以类似人类思维方式模拟智能行为的计算机科学分支。它包括机器学习、自然语言处理、计算机视觉等多个子领域。',
    relatedTerms: ['agi', 'ani', 'machine-learning', 'nlp', 'cv'],
    category: '通识',
    baiduWiki: 'https://baike.baidu.com/item/人工智能/9180',
    wikiPedia: 'https://zh.wikipedia.org/wiki/人工智能'
  },
  {
    id: 'agi',
    name: 'AGI',
    definition: '通用人工智能（Artificial General Intelligence），具备与人类同等智能、或超越人类的人工智能系统。它能够理解、学习并应用知识解决各种不同领域的问题，类似于人类的通用智能。',
    relatedTerms: ['ai', 'ani', 'machine-learning'],
    category: '通识',
    baiduWiki: 'https://baike.baidu.com/item/通用人工智能/63076479',
    wikiPedia: 'https://zh.wikipedia.org/wiki/通用人工智能'
  },
  {
    id: 'ani',
    name: 'ANI',
    definition: '狭义人工智能（Artificial Narrow Intelligence），指专注于单一任务的AI系统，如下围棋的AlphaGo、推荐系统、语音助手等。这类AI在特定领域表现出色，但无法跨领域应用。',
    relatedTerms: ['ai', 'agi', 'machine-learning'],
    category: '通识'
  },
  {
    id: 'chatbot',
    name: 'Chatbot',
    definition: '聊天机器人，一种能够通过文本或语音与人类进行对话的AI系统。它可以用于客户服务、信息查询、虚拟助手等场景。',
    relatedTerms: ['ai', 'nlp', 'llm'],
    category: '通识'
  },
  
  // 技术类别
  {
    id: 'agents',
    name: 'Agents',
    definition: '智能体，具有自主性、社会性、反应性和预动性的AI系统。它能够感知环境、做出决策并执行动作，以实现特定目标。',
    relatedTerms: ['ai', 'machine-learning', 'reinforcement-learning'],
    category: '技术'
  },
  {
    id: 'machine-learning',
    name: 'Machine Learning',
    definition: '机器学习是人工智能的一个分支，它赋予计算机系统从数据中学习的能力，而无需显式编程。主要包括监督学习、无监督学习和强化学习三种范式。',
    relatedTerms: ['ai', 'deep-learning', 'supervised-learning', 'unsupervised-learning', 'reinforcement-learning'],
    category: '技术'
  },
  {
    id: 'cnn',
    name: 'CNN',
    definition: '卷积神经网络（Convolutional Neural Network），一种特殊的神经网络架构，特别适合处理图像和视频数据。它通过卷积层自动提取图像特征，广泛应用于图像识别、目标检测等领域。',
    relatedTerms: ['neural-network', 'deep-learning', 'cv'],
    category: '技术'
  },
  {
    id: 'nlp',
    name: 'NLP',
    definition: '自然语言处理（Natural Language Processing），是人工智能的一个分支，研究如何使计算机理解、解释和生成人类语言。主要应用包括机器翻译、文本分类、情感分析、问答系统等。',
    relatedTerms: ['ai', 'machine-learning', 'llm', 'chatbot'],
    category: '技术'
  },
  {
    id: 'llm',
    name: 'LLM',
    definition: '大型语言模型（Large Language Model），一种参数规模庞大的语言模型，通过海量文本训练获得。它能够理解和生成人类语言，例如ChatGPT、GPT-4等。',
    relatedTerms: ['nlp', 'ai', 'chatbot', 'token'],
    category: '技术'
  },
  {
    id: 'cv',
    name: 'CV',
    definition: '计算机视觉（Computer Vision），人工智能的一个分支，研究如何使计算机理解和分析图像和视频数据。主要应用包括图像识别、目标检测、图像分割等。',
    relatedTerms: ['ai', 'machine-learning', 'cnn', 'neural-network'],
    category: '技术'
  },
  {
    id: 'rag',
    name: 'RAG',
    definition: '检索增强生成（Retrieval-Augmented Generation），一种结合检索和生成的AI技术。它通过从外部知识库检索相关信息，增强大语言模型的生成内容准确性和可靠性。',
    relatedTerms: ['llm', 'nlp', 'vector'],
    category: '技术'
  },
  {
    id: 'cot',
    name: 'CoT',
    definition: '思维链（Chain-of-Thought），一种提示工程技术，通过引导模型逐步展示推理过程，提高复杂问题解决能力。',
    relatedTerms: ['llm', 'nlp'],
    category: '技术'
  },
  {
    id: 'deep-learning',
    name: 'Deep Learning',
    definition: '深度学习是机器学习的一个分支，基于人工神经网络，通过多层非线性变换对数据进行高级抽象。它在图像识别、语音识别、自然语言处理等领域取得了突破性进展。',
    relatedTerms: ['machine-learning', 'neural-network', 'cnn', 'transformer'],
    category: '技术'
  },
  {
    id: 'diffusion-models',
    name: 'Diffusion Models',
    definition: '扩散模型，一种生成式AI模型，通过逐步去噪过程生成高质量图像、音频等内容。例如DALL-E、Stable Diffusion等。',
    relatedTerms: ['ai'],
    category: '技术'
  },
  {
    id: 'distillation',
    name: 'Distillation',
    definition: '模型蒸馏，一种将大型模型的知识转移到小型模型的技术，旨在保持性能的同时减少模型大小和计算需求。',
    relatedTerms: ['machine-learning', 'llm'],
    category: '技术'
  },
  {
    id: 'hallucination',
    name: 'Hallucination',
    definition: '幻觉，指AI模型生成的内容与事实不符或无依据的现象。在大语言模型中尤为常见，是当前AI技术的一个主要挑战。',
    relatedTerms: ['llm', 'nlp'],
    category: '技术'
  },
  {
    id: 'inference',
    name: 'Inference',
    definition: '推理，指AI模型使用训练好的参数对新数据进行预测或生成输出的过程。与模型训练阶段相对。',
    relatedTerms: ['machine-learning', 'llm'],
    category: '技术'
  },
  {
    id: 'multimodal',
    name: 'Multimodal',
    definition: '多模态，指能够同时处理和理解多种数据类型（如图像、文本、音频等）的AI系统。它能够整合不同模态的信息，实现更全面的理解。',
    relatedTerms: ['ai', 'nlp', 'cv'],
    category: '技术'
  },
  {
    id: 'neural-network',
    name: 'Neural Network',
    definition: '神经网络，一种模仿生物神经网络结构和功能的计算模型。它由大量的人工神经元通过连接权重相互连接而成，能够通过学习调整权重来解决复杂问题。',
    relatedTerms: ['ai', 'machine-learning', 'deep-learning', 'cnn', 'transformer'],
    category: '技术'
  },
  {
    id: 'reinforcement-learning',
    name: 'Reinforcement Learning',
    definition: '强化学习，一种机器学习范式，智能体通过与环境交互获得奖励或惩罚，学习最优策略以最大化累积奖励。',
    relatedTerms: ['machine-learning', 'ai', 'agents'],
    category: '技术'
  },
  {
    id: 'supervised-learning',
    name: 'Supervised Learning',
    definition: '监督学习，一种机器学习范式，使用带标签的训练数据来训练模型。模型学习输入特征与输出标签之间的映射关系。',
    relatedTerms: ['machine-learning', 'ai', 'unsupervised-learning', 'reinforcement-learning'],
    category: '技术'
  },
  {
    id: 'unsupervised-learning',
    name: 'Unsupervised Learning',
    definition: '无监督学习，一种机器学习范式，使用无标签的数据进行训练。模型旨在发现数据中的模式、结构或分布。',
    relatedTerms: ['machine-learning', 'ai', 'supervised-learning', 'reinforcement-learning'],
    category: '技术'
  },
  {
    id: 'token',
    name: 'Token',
    definition: 'token，在自然语言处理中，指将文本分割成的基本单位。可以是单词、字符或子词，是语言模型处理文本的基础。',
    relatedTerms: ['nlp', 'llm'],
    category: '技术'
  },
  {
    id: 'transformer',
    name: 'Transformer',
    definition: 'Transformer，一种基于自注意力机制的神经网络架构，广泛应用于自然语言处理任务。它通过并行计算提高了训练效率和模型性能。',
    relatedTerms: ['neural-network', 'deep-learning', 'nlp', 'llm'],
    category: '技术'
  },
  {
    id: 'vector',
    name: 'Vector',
    definition: '向量，在AI中特指嵌入向量（Embedding Vector），将文本、图像等数据转换为数值向量表示，便于计算机处理和计算相似度。',
    relatedTerms: ['nlp', 'cv', 'rag'],
    category: '技术'
  },
  
  // 商业类别
  {
    id: 'aigc',
    name: 'AIGC',
    definition: '人工智能生成内容（AI Generated Content），是一种内容生产形式。例如AI文字续写、图像生成、音频生成等。主要应用于创意设计、内容创作、教育培训等领域。',
    relatedTerms: ['ai', 'machine-learning'],
    category: '商业',
    baiduWiki: 'https://baike.baidu.com/item/人工智能生成内容'
  },
  
  // 产品类别
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    definition: 'ChatGPT，由OpenAI开发的基于大型语言模型的聊天机器人。它能够进行自然语言对话、回答问题、生成文本等多种任务。',
    relatedTerms: ['llm', 'nlp', 'chatbot', 'ai'],
    category: '产品',
    baiduWiki: 'https://baike.baidu.com/item/ChatGPT/64584355',
    wikiPedia: 'https://zh.wikipedia.org/wiki/ChatGPT'
  }
];

// 获取所有概念类别
export const getCategories = (): string[] => {
  const categories = [...new Set(aiTerms.map((term) => term.category))];
  return categories.sort();
};

// 根据ID获取概念
export const getTermById = (id: string): AITerm | undefined => {
  return aiTerms.find((term) => term.id === id);
};

// 根据类别筛选概念
export const getTermsByCategory = (category: string): AITerm[] => {
  return aiTerms.filter((term) => term.category === category);
};

// 搜索概念
export const searchTerms = (query: string): AITerm[] => {
  const lowercaseQuery = query.toLowerCase();
  return aiTerms.filter(
    (term) =>
      term.name.toLowerCase().includes(lowercaseQuery) ||
      term.definition.toLowerCase().includes(lowercaseQuery) ||
      term.id.toLowerCase().includes(lowercaseQuery)
  );
};

// 按类别获取所有术语名称分组
export const getTermsByCategoryNames = (): Record<string, string[]> => {
  const result: Record<string, string[]> = {};
  
  aiTerms.forEach(term => {
    if (!result[term.category]) {
      result[term.category] = [];
    }
    result[term.category].push(term.name);
  });
  
  // 对每个分类中的名称进行排序
  Object.keys(result).forEach(category => {
    result[category].sort();
  });
  
  return result;
};