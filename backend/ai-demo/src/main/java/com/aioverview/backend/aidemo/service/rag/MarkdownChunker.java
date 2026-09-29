package com.aioverview.backend.aidemo.service.rag;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Markdown 笔记切块器（纯函数，无状态，便于单测）
 * <p>
 * 切块策略：
 * 1. 剥离 YAML front matter，title/tags 提取为元数据，不入正文；
 * 2. 按 1~3 级标题（# ## ###）切分章节，保证每个片段语义完整；
 * 3. 超长章节按空行段落二次切分，控制在 maxChars 以内
 *    （上限需小于 embedding 模型的单条输入限制）；
 * 4. 过短片段（小于 minChars）丢弃。
 */
public final class MarkdownChunker {

    private MarkdownChunker() {
    }

    /** front matter 解析结果 */
    public record ParsedNote(String title, List<String> tags, String body) {
    }

    /** 一个切片：所在章节标题 + 正文 */
    public record NoteSection(String heading, String text) {
    }

    private static final Pattern FRONT_MATTER = Pattern.compile("\\A---\\s*\\n(.*?)\\n---\\s*\\n?", Pattern.DOTALL);
    private static final Pattern TITLE_LINE = Pattern.compile("^title:\\s*\"?(.+?)\"?\\s*$", Pattern.MULTILINE);
    private static final Pattern TAGS_LINE = Pattern.compile("^tags:\\s*\\[(.*?)\\]\\s*$", Pattern.MULTILINE);
    private static final Pattern HEADING = Pattern.compile("^(#{1,3})\\s+(.+)$");

    /**
     * 解析 front matter 与正文
     *
     * @param content       文件全文
     * @param fallbackTitle 文件名兜底标题（去扩展名）
     */
    public static ParsedNote parse(String content, String fallbackTitle) {
        String title = fallbackTitle;
        List<String> tags = new ArrayList<>();
        String body = content;

        Matcher fm = FRONT_MATTER.matcher(content);
        if (fm.find()) {
            String meta = fm.group(1);
            body = content.substring(fm.end());

            Matcher t = TITLE_LINE.matcher(meta);
            if (t.find() && !t.group(1).isBlank()) {
                title = t.group(1);
            }
            Matcher g = TAGS_LINE.matcher(meta);
            if (g.find()) {
                for (String tag : g.group(1).split(",")) {
                    String cleaned = tag.replace("\"", "").replace("'", "").trim();
                    if (!cleaned.isEmpty()) {
                        tags.add(cleaned);
                    }
                }
            }
        }

        // 去掉正文里的 H1 大标题（与 title 重复），避免污染片段
        body = body.replaceFirst("^\\s*#\\s+.+\\n", "").strip();
        return new ParsedNote(title, tags, body);
    }

    /**
     * 按标题切分章节，超长章节再按段落二次切分
     */
    public static List<NoteSection> splitSections(String body, int maxChars, int minChars) {
        List<NoteSection> sections = new ArrayList<>();
        String currentHeading = "";
        StringBuilder current = new StringBuilder();

        for (String line : body.split("\n", -1)) {
            Matcher h = HEADING.matcher(line.strip());
            if (h.matches()) {
                appendSection(sections, currentHeading, current, maxChars, minChars);
                currentHeading = h.group(2).strip();
                current = new StringBuilder();
            } else {
                current.append(line).append('\n');
            }
        }
        appendSection(sections, currentHeading, current, maxChars, minChars);

        return sections;
    }

    /**
     * 把累积的章节文本落入结果；超长时按空行段落切分为多个片段
     */
    private static void appendSection(List<NoteSection> out, String heading,
                                      StringBuilder text, int maxChars, int minChars) {
        String content = text.toString().strip();
        if (content.length() < minChars) {
            return;
        }
        if (content.length() <= maxChars) {
            out.add(new NoteSection(heading, content));
            return;
        }
        // 二次切分：按空行段落累积
        StringBuilder piece = new StringBuilder();
        for (String para : content.split("\n\\s*\n")) {
            if (piece.length() + para.length() + 2 > maxChars && piece.length() >= minChars) {
                out.add(new NoteSection(heading, piece.toString().strip()));
                piece = new StringBuilder();
            }
            piece.append(para).append("\n\n");
        }
        if (piece.toString().strip().length() >= minChars) {
            out.add(new NoteSection(heading, piece.toString().strip()));
        }
    }
}
