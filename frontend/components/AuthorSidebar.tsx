import { Github } from 'lucide-react';
import { BuyMeACoffeeButton } from './BuyMeACoffeeButton.js';

export function AuthorSidebar() {
  return (
    <aside>
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6 space-y-6">
        {/* Author Header */}
        <div className="text-center pb-6 border-b border-slate-200 dark:border-slate-700">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary-600 to-primary-700 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
            湯
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            湯編驛
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 italic font-serif">
            Tom's lab
          </p>
        </div>

        {/* Author Bio */}
        <div className="space-y-4">
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            開發筆記，記錄程式碼與想法的實踐過程。喜歡把想法快速實作成可用的產品。
          </p>

          {/* Links */}
          <div className="space-y-2">
            <a
              href="https://github.com/gh286991"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 dark:hover:text-primary-400 transition-colors text-sm font-medium"
            >
              <Github className="w-4 h-4" />
              <span>GitHub</span>
            </a>
            <a
              href="/about"
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 dark:hover:text-primary-400 transition-colors text-sm font-medium"
            >
              <span>關於我</span>
            </a>
          </div>

          {/* Support Section */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-3 text-center">
              支持我的創作
            </p>
            <div className="flex justify-center">
              <BuyMeACoffeeButton />
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

