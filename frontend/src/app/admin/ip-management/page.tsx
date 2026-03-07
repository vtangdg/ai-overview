'use client';

import React, { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Edit2,
  Search,
  AlertCircle,
  Check,
  X,
  Shield,
  RefreshCw,
} from 'lucide-react';
import { Modal } from '@/components/ui/modal';

interface FilterIp {
  id: string;
  ip: string;
  description?: string;
  createdAt: string;
}

interface IpFormData {
  ip: string;
  description: string;
}

export default function IpManagementPage() {
  const [ips, setIps] = useState<FilterIp[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIp, setEditingIp] = useState<FilterIp | null>(null);
  const [formData, setFormData] = useState<IpFormData>({
    ip: '',
    description: '',
  });
  const [formErrors, setFormErrors] = useState<Partial<IpFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 获取IP列表
  const fetchIps = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/filter-ips');
      if (!response.ok) {
        throw new Error('获取IP列表失败');
      }
      const data = await response.json();
      setIps(data);
    } catch (error) {
      console.error('获取IP列表失败:', error);
      alert('获取IP列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 初始加载
  useEffect(() => {
    fetchIps();
  }, []);

  // 验证IP格式
  const validateIp = (ip: string): boolean => {
    // 支持单个IP或CIDR格式
    const singleIpRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    const cidrRegex = /^(\d{1,3}\.){3}\d{1,3}\/\d{1,2}$/;
    const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;

    return singleIpRegex.test(ip) || cidrRegex.test(ip) || ipv6Regex.test(ip);
  };

  // 验证表单
  const validateForm = (): boolean => {
    const errors: Partial<IpFormData> = {};

    if (!formData.ip.trim()) {
      errors.ip = '请输入IP地址';
    } else if (!validateIp(formData.ip.trim())) {
      errors.ip = 'IP格式不正确（支持IPv4、CIDR、IPv6）';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // 提交表单
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const url = editingIp
        ? `/api/admin/filter-ips/${editingIp.id}`
        : '/api/admin/filter-ips';
      const method = editingIp ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(editingIp ? '更新失败' : '添加失败');
      }

      setIsModalOpen(false);
      setFormData({ ip: '', description: '' });
      setEditingIp(null);
      fetchIps();
    } catch (error) {
      console.error('保存失败:', error);
      alert(editingIp ? '更新失败' : '添加失败');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 删除IP
  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个IP吗？')) return;

    try {
      const response = await fetch(`/api/admin/filter-ips/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('删除失败');
      }

      fetchIps();
    } catch (error) {
      console.error('删除失败:', error);
      alert('删除失败');
    }
  };

  // 打开编辑弹窗
  const openEditModal = (ip: FilterIp) => {
    setEditingIp(ip);
    setFormData({
      ip: ip.ip,
      description: ip.description || '',
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  // 打开新增弹窗
  const openAddModal = () => {
    setEditingIp(null);
    setFormData({ ip: '', description: '' });
    setFormErrors({});
    setIsModalOpen(true);
  };

  // 过滤IP列表
  const filteredIps = ips.filter(
    (ip) =>
      ip.ip.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ip.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">已过滤IP</p>
              <p className="text-2xl font-bold">{ips.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 操作栏 */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="搜索IP或描述..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-input rounded-lg bg-background focus:ring-2 focus:ring-ring focus:border-primary transition-all"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchIps}
            className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            刷新
          </button>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            新增IP
          </button>
        </div>
      </div>

      {/* IP列表 */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            加载中...
          </div>
        ) : filteredIps.length === 0 ? (
          <div className="p-8 text-center">
            <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {searchQuery ? '没有找到匹配的IP' : '暂无过滤IP，点击"新增IP"添加'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                    IP地址
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                    描述
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                    添加时间
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredIps.map((ip) => (
                  <tr key={ip.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <code className="px-2 py-1 bg-muted rounded text-sm font-mono">
                        {ip.ip}
                      </code>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {ip.description || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {new Date(ip.createdAt).toLocaleString('zh-CN')}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(ip)}
                          className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                          title="编辑"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(ip.id)}
                          className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                          title="删除"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 新增/编辑弹窗 */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingIp ? '编辑IP' : '新增IP'}
        footer={
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  保存中...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  保存
                </>
              )}
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              IP地址 <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              placeholder="例如: 192.168.1.100 或 10.0.0.0/24"
              value={formData.ip}
              onChange={(e) =>
                setFormData({ ...formData, ip: e.target.value })
              }
              className={`w-full px-4 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-ring focus:border-primary transition-all ${
                formErrors.ip ? 'border-destructive' : 'border-input'
              }`}
            />
            {formErrors.ip ? (
              <p className="mt-1 text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {formErrors.ip}
              </p>
            ) : (
              <p className="mt-1 text-xs text-muted-foreground">
                支持IPv4、CIDR格式（如192.168.1.0/24）、IPv6
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">描述</label>
            <input
              type="text"
              placeholder="可选：添加备注说明"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-4 py-2 border border-input rounded-lg bg-background focus:ring-2 focus:ring-ring focus:border-primary transition-all"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
