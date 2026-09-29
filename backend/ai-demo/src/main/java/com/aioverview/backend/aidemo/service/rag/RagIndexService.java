package com.aioverview.backend.aidemo.service.rag;

import com.aioverview.backend.aidemo.config.RagProperties;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.SimpleVectorStore;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.stream.Stream;

/**
 * RAG 索引服务：扫描站内笔记 → 切块 → 向量化 → 写入向量库并持久化
 * <p>
 * 触发时机：
 * 1. 启动时若本地索引文件不存在则全量重建（ApplicationReadyEvent）；
 * 2. 手动 POST /api/rag/index/rebuild 强制重建。
 */
@Slf4j
@Service
public class RagIndexService {

    private final SimpleVectorStore vectorStore;
    private final RagProperties props;
    private final ObjectMapper objectMapper;
    private final AtomicBoolean indexing = new AtomicBoolean(false);

    /** 最近一次索引结果统计 */
    public record IndexStats(int files, int chunks, LocalDateTime indexedAt) {
    }

    private volatile IndexStats lastStats;

    public RagIndexService(SimpleVectorStore vectorStore, RagProperties props, ObjectMapper objectMapper) {
        this.vectorStore = vectorStore;
        this.props = props;
        this.objectMapper = objectMapper;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void initOnStartup() {
        File storeFile = new File(props.getStorePath());
        if (storeFile.exists()) {
            // 索引文件已存在：RagConfig 已在建 Bean 时 load 进内存，这里只回填状态，绝不调用 embedding
            IndexStats cached = readCachedStats();
            lastStats = cached != null
                    ? cached
                    : new IndexStats(countFiles(), 0, null);
            log.info("复用本地向量索引 {}，未调用 embedding 服务（当前笔记 {} 篇）",
                    storeFile.getAbsolutePath(), lastStats.files());
            return;
        }

        log.info("本地向量索引不存在，开始全量构建: {}", props.getNotesPaths());
        try {
            rebuild();
        } catch (Exception e) {
            // 索引失败不阻断启动，问答接口会走"未命中→拒答"兜底
            log.error("启动时构建 RAG 索引失败，知识问答将不可用，请检查 embedding 配置", e);
        }
    }

    /**
     * 全量重建索引。同一时刻只允许一个重建任务。
     */
    public synchronized IndexStats rebuild() {
        if (!indexing.compareAndSet(false, true)) {
            throw new IllegalStateException("索引重建进行中，请稍后再试");
        }
        try {
            long start = System.currentTimeMillis();
            List<Document> documents = scanAndChunk();
            if (documents.isEmpty()) {
                throw new IllegalStateException("未扫描到任何笔记内容，请检查 rag.notes-paths 配置");
            }
            vectorStore.add(documents);
            try {
                persist();
            } catch (IOException e) {
                throw new IllegalStateException("向量索引持久化失败: " + e.getMessage(), e);
            }
            IndexStats stats = new IndexStats(countFiles(), documents.size(), LocalDateTime.now());
            lastStats = stats;
            writeCachedStats(stats);
            log.info("RAG 索引重建完成: {} 篇笔记 / {} 个片段, 耗时 {} ms",
                    stats.files(), stats.chunks(), System.currentTimeMillis() - start);
            return stats;
        } finally {
            indexing.set(false);
        }
    }

    public IndexStats getLastStats() {
        return lastStats;
    }

    public boolean isIndexing() {
        return indexing.get();
    }

    /**
     * 扫描全部笔记并切块为 Document 列表
     */
    private List<Document> scanAndChunk() {
        List<Document> documents = new ArrayList<>();
        for (String root : props.getNotesPaths()) {
            Path rootPath = Path.of(root);
            if (!Files.isDirectory(rootPath)) {
                log.warn("笔记目录不存在，跳过: {}", rootPath.toAbsolutePath());
                continue;
            }
            try (Stream<Path> paths = Files.walk(rootPath)) {
                paths.filter(p -> p.toString().endsWith(".md"))
                        .sorted()
                        .forEach(file -> indexOneFile(rootPath, file, documents));
            } catch (IOException e) {
                log.error("扫描笔记目录失败: {}", rootPath, e);
            }
        }
        return documents;
    }

    private void indexOneFile(Path rootPath, Path file, List<Document> out) {
        try {
            String content = Files.readString(file);
            String fileName = file.getFileName().toString();
            String slug = fileName.substring(0, fileName.length() - 3); // 去掉 .md
            String category = rootPath.relativize(file).getName(0).toString();

            MarkdownChunker.ParsedNote note = MarkdownChunker.parse(content, slug);
            List<MarkdownChunker.NoteSection> sections =
                    MarkdownChunker.splitSections(note.body(), props.getMaxSectionChars(), props.getMinChunkChars());

            // 与前端路由保持一致：/notes/{文件名去.md}
            String url = "/notes/" + slug;
            String tags = String.join(",", note.tags());

            int seq = 0;
            for (MarkdownChunker.NoteSection section : sections) {
                // 片段文本带上《标题》与章节上下文，提升向量语义辨识度
                String contextPrefix = note.title().equals(section.heading())
                        ? "《" + note.title() + "》：\n"
                        : "《" + note.title() + "》之" + section.heading() + "：\n";
                Map<String, Object> metadata = new HashMap<>();
                metadata.put("title", note.title());
                metadata.put("category", category);
                metadata.put("heading", section.heading());
                metadata.put("tags", tags);
                metadata.put("source", url);
                metadata.put("seq", seq++);

                out.add(Document.builder()
                        .id(url + "#" + (seq - 1))
                        .text(contextPrefix + section.text())
                        .metadata(metadata)
                        .build());
            }
        } catch (IOException e) {
            log.error("读取笔记失败: {}", file, e);
        }
    }

    private int countFiles() {
        int count = 0;
        for (String root : props.getNotesPaths()) {
            Path rootPath = Path.of(root);
            if (!Files.isDirectory(rootPath)) {
                continue;
            }
            try (Stream<Path> paths = Files.walk(rootPath)) {
                count += paths.filter(p -> p.toString().endsWith(".md")).count();
            } catch (IOException e) {
                log.warn("统计笔记数量失败: {}", rootPath);
            }
        }
        return count;
    }

    private void persist() throws IOException {
        File storeFile = new File(props.getStorePath());
        File parent = storeFile.getParentFile();
        if (parent != null && !parent.exists()) {
            parent.mkdirs();
        }
        vectorStore.save(storeFile);
    }

    /**
     * 索引元数据文件，随向量库一起持久化。
     * 作用是让服务重启后（复用磁盘索引、不再调用 embedding）仍能对外报告真实的索引规模与构建时间。
     */
    private File metaFile() {
        return new File(props.getStorePath() + ".meta.json");
    }

    private void writeCachedStats(IndexStats stats) {
        try {
            Map<String, Object> meta = new HashMap<>();
            meta.put("files", stats.files());
            meta.put("chunks", stats.chunks());
            meta.put("indexedAt", stats.indexedAt() == null ? "" : stats.indexedAt().toString());
            objectMapper.writeValue(metaFile(), meta);
        } catch (Exception e) {
            log.warn("索引元数据写入失败（不影响检索）: {}", e.getMessage());
        }
    }

    private IndexStats readCachedStats() {
        File meta = metaFile();
        if (!meta.exists()) {
            return null;
        }
        try {
            Map<String, Object> map = objectMapper.readValue(meta, new TypeReference<>() {
            });
            int files = map.get("files") instanceof Number n ? n.intValue() : 0;
            int chunks = map.get("chunks") instanceof Number n ? n.intValue() : 0;
            String indexedAt = String.valueOf(map.getOrDefault("indexedAt", ""));
            return new IndexStats(files, chunks, indexedAt.isEmpty() ? null : LocalDateTime.parse(indexedAt));
        } catch (Exception e) {
            log.warn("索引元数据读取失败，状态信息暂缺: {}", e.getMessage());
            return null;
        }
    }
}
