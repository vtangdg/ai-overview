package com.aioverview.backend.aidemo.model.dto;

/**
 * RAG 回答的引用来源，前端渲染为可点击的来源卡片
 *
 * @param title    笔记标题
 * @param category 笔记分类（目录名）
 * @param heading  命中片段所在章节标题
 * @param url      前端跳转地址（/notes/{slug}）
 * @param snippet  命中片段摘要
 * @param score    相似度得分（0~1）
 */
public record RagSource(String title, String category, String heading, String url, String snippet, double score) {
}
