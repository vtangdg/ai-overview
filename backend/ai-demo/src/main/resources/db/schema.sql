-- SQLite数据库初始化脚本
-- 创建访客统计表
CREATE TABLE IF NOT EXISTS visitor_stats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    page_path VARCHAR(255) NOT NULL,
    page_name VARCHAR(100) NOT NULL,
    visit_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    user_agent VARCHAR(500),
    ip_address VARCHAR(50),
    session_id VARCHAR(100),
    referrer VARCHAR(500)
);

-- 创建索引优化查询性能
CREATE INDEX IF NOT EXISTS idx_page_path ON visitor_stats(page_path);
CREATE INDEX IF NOT EXISTS idx_visit_time ON visitor_stats(visit_time);
CREATE INDEX IF NOT EXISTS idx_page_name ON visitor_stats(page_name);