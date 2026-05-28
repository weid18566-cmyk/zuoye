import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { exportAllData, downloadBackup, importAllData } from '@/lib/backup';
import { saveLocalBackup, restoreLocalBackup, hasLocalBackup, clearLocalBackup } from '@/lib/backup';

export function DataManagerPage() {
  const { setCurrentPage } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [localHasBackup, setLocalHasBackup] = useState(hasLocalBackup());
  const [confirmAction, setConfirmAction] = useState<string | null>(null);

  const showMsg = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  useEffect(() => {
    const handleStorage = () => setLocalHasBackup(hasLocalBackup());
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const handleExport = async () => {
    setLoading(true);
    try {
      const blob = await exportAllData();
      downloadBackup(blob);
      showMsg('数据导出成功');
    } catch {
      showMsg('导出失败，请重试');
    }
    setLoading(false);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const result = await importAllData(file);
    showMsg(result.message);
    setLoading(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSaveBackup = () => {
    saveLocalBackup();
    setLocalHasBackup(true);
    showMsg('本地备份已保存');
  };

  const handleRestoreBackup = () => {
    if (restoreLocalBackup()) {
      showMsg('备份已恢复，请刷新页面');
    } else {
      showMsg('没有可用的备份');
    }
    setConfirmAction(null);
  };

  const handleClearBackup = () => {
    clearLocalBackup();
    setLocalHasBackup(false);
    showMsg('备份已清除');
    setConfirmAction(null);
  };

  return (
    <div className="min-h-screen bg-kid-bg pb-24">
      <div className="absolute top-0 left-0 right-0 h-40 gradient-top pointer-events-none" />

      <header className="relative z-10 px-5 pt-12 pb-4">
        <div className="flex items-center gap-4">
          <button onClick={() => setCurrentPage('profile')} className="btn-icon">
            <span className="material-symbols-rounded text-kid-primary">arrow_back</span>
          </button>
          <h1 className="font-title text-kid-lg text-kid-text">数据管理</h1>
        </div>
      </header>

      <main className="px-5 space-y-5">
        {/* 数据导入导出 */}
        <section className="bg-white rounded-kid-lg p-6 shadow-kid">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="material-symbols-rounded text-blue-500 text-2xl">folder_open</span>
            </div>
            <div>
              <h2 className="font-title text-kid-md text-kid-text">数据导入导出</h2>
              <p className="text-kid-xs text-kid-text/60">导出完整的JSON备份文件或在另一设备导入</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleExport}
              disabled={loading}
              className="flex-1 btn-primary"
            >
              <span className="material-symbols-rounded">file_export</span>
              <span>导出数据</span>
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              className="flex-1 btn-secondary"
            >
              <span className="material-symbols-rounded">file_import</span>
              <span>导入数据</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </div>

          <p className="text-kid-xs text-kid-text/40 mt-4">
            导入将覆盖当前所有用户和数据，操作前建议先备份
          </p>
        </section>

        {/* 本地备份恢复 */}
        <section className="bg-white rounded-kid-lg p-6 shadow-kid">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <span className="material-symbols-rounded text-green-500 text-2xl">backup</span>
            </div>
            <div>
              <h2 className="font-title text-kid-md text-kid-text">本地备份恢复</h2>
              <p className="text-kid-xs text-kid-text/60">在当前设备上进行数据备份和恢复</p>
            </div>
          </div>

          <div className="flex gap-3 mb-3">
            <button
              onClick={handleSaveBackup}
              className="flex-1 btn-primary"
            >
              <span className="material-symbols-rounded">save</span>
              <span>创建备份</span>
            </button>
            {localHasBackup && (
              <button
                onClick={() => setConfirmAction('restore')}
                className="flex-1 btn-secondary"
              >
                <span className="material-symbols-rounded">history</span>
                <span>恢复备份</span>
              </button>
            )}
          </div>

          {localHasBackup && (
            <button
              onClick={() => setConfirmAction('clear')}
              className="w-full py-3 text-kid-sm text-red-500 hover:bg-red-50 rounded-kid-md transition-colors"
            >
              <span className="material-symbols-rounded align-middle mr-1">delete_forever</span>
              清除本地备份
            </button>
          )}
        </section>

        {/* 自动保存说明 */}
        <section className="bg-white rounded-kid-lg p-6 shadow-kid">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
              <span className="material-symbols-rounded text-purple-500 text-2xl">sync_saved_locally</span>
            </div>
            <div>
              <h2 className="font-title text-kid-md text-kid-text">自动保存</h2>
              <p className="text-kid-xs text-kid-text/60">阅读进度和收藏自动同步</p>
            </div>
          </div>
          <ul className="space-y-2 text-kid-sm text-kid-text/60">
            <li className="flex items-center gap-2">
              <span className="material-symbols-rounded text-kid-primary text-lg">check</span>
              阅读进度 — 每次翻页自动保存
            </li>
            <li className="flex items-center gap-2">
              <span className="material-symbols-rounded text-kid-primary text-lg">check</span>
              收藏列表 — 添加/移除即时保存
            </li>
            <li className="flex items-center gap-2">
              <span className="material-symbols-rounded text-kid-primary text-lg">check</span>
              AI配置 — 修改后立即生效
            </li>
          </ul>
        </section>
      </main>

      {/* 确认弹窗 */}
      {confirmAction && (
        <div className="modal-overlay">
          <div className="modal-content text-center">
            <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-rounded text-3xl text-orange-500">warning</span>
            </div>
            <h3 className="font-title text-kid-md text-kid-text mb-2">
              {confirmAction === 'restore' ? '确认恢复' : '确认清除'}
            </h3>
            <p className="text-kid-xs text-kid-text/60 mb-6">
              {confirmAction === 'restore'
                ? '恢复备份将覆盖当前所有本地数据，确定继续？'
                : '清除备份后无法恢复，确定继续？'}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmAction(null)} className="flex-1 btn-secondary text-kid-sm">
                取消
              </button>
              <button
                onClick={confirmAction === 'restore' ? handleRestoreBackup : handleClearBackup}
                className="flex-1 bg-orange-500 text-white rounded-kid-lg px-6 py-4 text-kid-sm font-medium"
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}

      {message && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-kid-primary text-white px-6 py-3 rounded-full shadow-kid-lg animate-fade-in-up flex items-center gap-2 z-50">
          <span className="material-symbols-rounded">
            {message.includes('失败') ? 'error' : 'check_circle'}
          </span>
          <span className="text-kid-sm">{message}</span>
        </div>
      )}
    </div>
  );
}
