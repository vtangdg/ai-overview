// 定义AI概念的接口
export interface AITerm {
  id: string;
  name: string;
  definition: string;
  relatedTerms: string[];
  category: string;
}

// 示例AI概念数据
export const aiTerms: AITerm[] = [
  {
    id: 'agi',
    name: 'AGI',
    definition: '通用人工智能（Artificial General Intelligence），具备与人类同等智能、或超越人类的人工智能系统。它能够理解、学习并应用知识解决各种不同领域的问题，类似于人类的通用智能。',
    relatedTerms: ['ai', 'asi', 'ml'],
    category: '通识'
  },
  {
    id: 'ai',
    name: 'AI',
    definition: '人工智能（Artificial Intelligence），1956年于Dartmouth学会上提出，一种旨在以类似人类思维方式模拟智能行为的计算机科学分支。它包括机器学习、自然语言处理、计算机视觉等多个子领域。',
    relatedTerms: ['agi', 'ml', 'nlp', 'cv'],
    category: '通识'
  },
  {
    id: 'aigc',
    name: 'AIGC',
    definition: '人工智能生成内容（AI Generated Content），是一种内容生产形式。例如AI文字续写、图像生成、音频生成等。主要应用于创意设计、内容创作、教育培训等领域。',
    relatedTerms: ['ai', 'ml', 'generative-ai'],
    category: '商业'
  },
  {
    id: 'ani',
    name: 'ANI',
    definition: '狭义人工智能（Artificial Narrow Intelligence），指专注于单一任务的AI系统，如下围棋的AlphaGo、推荐系统、语音助手等。这类AI在特定领域表现出色，但无法跨领域应用。',
    relatedTerms: ['ai', 'ml'],
    category: '通识'
  },
  {
    id: 'asi',
    name: 'ASI',
    definition: '人工超级智能（Artificial Super Intelligence），尽管存在争议，但ASI通常被定义为超越人类思维能力的人工智能系统。它能够在所有领域表现出远超过人类专家的智能水平。',
    relatedTerms: ['ai', 'agi'],
    category: '通识'
  },
  {
    id: 'accelerator',
    name: 'Accelerator',
    definition: '加速器，一类旨在加速人工智能应用的微处理器。如GPU、TPU、NPU等，它们通过并行计算架构显著提升AI模型的训练和推理速度。',
    relatedTerms: ['hardware', 'gpu', 'tpu'],
    category: '产品'
  },
  {
    id: 'cnn',
    name: 'CNN',
    definition: '卷积神经网络（Convolutional Neural Network），一种特殊的神经网络架构，特别适合处理图像和视频数据。它通过卷积层自动提取图像特征，广泛应用于图像识别、目标检测等领域。',
    relatedTerms: ['neural-network', 'deep-learning', 'computer-vision'],
    category: '技术'
  },
  {
    id: 'deep-learning',
    name: '深度学习',
    definition: '深度学习是机器学习的一个分支，基于人工神经网络，通过多层非线性变换对数据进行高级抽象。它在图像识别、语音识别、自然语言处理等领域取得了突破性进展。',
    relatedTerms: ['ml', 'neural-network', 'cnn', 'rnn'],
    category: '技术'
  },
  {
    id: 'generative-ai',
    name: '生成式AI',
    definition: '生成式AI是一类能够创造新内容的人工智能系统。它可以生成文本、图像、音频、视频等多种形式的内容，例如ChatGPT、Midjourney、DALL-E等。',
    relatedTerms: ['ai', 'aigc', 'nlp'],
    category: '技术'
  },
  {
    id: 'machine-learning',
    name: '机器学习',
    definition: '机器学习是人工智能的一个分支，它赋予计算机系统从数据中学习的能力，而无需显式编程。主要包括监督学习、无监督学习和强化学习三种范式。',
    relatedTerms: ['ai', 'deep-learning', 'supervised-learning', 'unsupervised-learning'],
    category: '技术'
  },
  {
    id: 'nlp',
    name: 'NLP',
    definition: '自然语言处理（Natural Language Processing），是人工智能的一个分支，研究如何使计算机理解、解释和生成人类语言。主要应用包括机器翻译、文本分类、情感分析、问答系统等。',
    relatedTerms: ['ai', 'ml', 'generative-ai'],
    category: '技术'
  },
  {
    id: 'neural-network',
    name: '神经网络',
    definition: '神经网络是一种模仿生物神经网络结构和功能的计算模型。它由大量的人工神经元通过连接权重相互连接而成，能够通过学习调整权重来解决复杂问题。',
    relatedTerms: ['ai', 'ml', 'deep-learning', 'cnn', 'rnn'],
    category: '技术'
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