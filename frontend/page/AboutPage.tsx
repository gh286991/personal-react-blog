import { Code, Server, Mail } from 'lucide-react';

// React Icon
function ReactIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="12" r="2" fill="#61DAFB" />
      <ellipse cx="12" cy="12" rx="11" ry="4.2" fill="none" stroke="#61DAFB" strokeWidth="1" />
      <ellipse cx="12" cy="12" rx="11" ry="4.2" fill="none" stroke="#61DAFB" strokeWidth="1" transform="rotate(60 12 12)" />
      <ellipse cx="12" cy="12" rx="11" ry="4.2" fill="none" stroke="#61DAFB" strokeWidth="1" transform="rotate(-60 12 12)" />
    </svg>
  );
}

// TypeScript Icon
function TypeScriptIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <rect width="24" height="24" rx="4" fill="#3178C6" />
      <path d="M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.53.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 7.903 7.903 0 0 1-.696-.37 3.087 3.087 0 0 1-.639-.582 2.58 2.58 0 0 1-.422-.8 3.733 3.733 0 0 1-.14-1.02c0-.614.123-1.098.369-1.453.246-.354.58-.632 1.004-.833a4.76 4.76 0 0 1 1.39-.493 6.975 6.975 0 0 1 1.629-.19zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z" fill="#fff" />
    </svg>
  );
}

// Tailwind CSS Icon
function TailwindIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 6c-2.67 0-4.33 1.33-5 4 1-1.33 2.17-1.83 3.5-1.5.76.19 1.31.74 1.91 1.35.98 1 2.12 2.15 4.59 2.15 2.67 0 4.33-1.33 5-4-1 1.33-2.17 1.83-3.5 1.5-.76-.19-1.31-.74-1.91-1.35C15.61 7.15 14.47 6 12 6zm-5 6c-2.67 0-4.33 1.33-5 4 1-1.33 2.17-1.83 3.5-1.5.76.19 1.31.74 1.91 1.35.98 1 2.12 2.15 4.59 2.15 2.67 0 4.33-1.33 5-4-1 1.33-2.17 1.83-3.5 1.5-.76-.19-1.31-.74-1.91-1.35C10.61 13.15 9.47 12 7 12z" fill="#38BDF8" />
    </svg>
  );
}

// Vite Icon
function ViteIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0L1.608 4.8v4.8c0 8.4 5.4 16.2 10.392 19.2L12 24l.008-.192C17.4 21.6 22.8 13.8 22.8 5.4V4.8L12.008 0H12zM9.6 7.2h4.8v9.6H9.6V7.2z" fill="#646CFF" />
      <path d="M12 0L1.608 4.8v4.8c0 8.4 5.4 16.2 10.392 19.2L12 24l.008-.192C17.4 21.6 22.8 13.8 22.8 5.4V4.8L12.008 0H12z" fill="#646CFF" opacity="0.5" />
    </svg>
  );
}

// Node.js Icon
function NodeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.998,24c-0.321,0-0.641-0.084-0.922-0.247l-2.739-1.633c-0.438-0.245-0.224-0.332-0.08-0.383 c0.585-0.203,0.703-0.25,1.328-0.604c0.065-0.037,0.151-0.023,0.218,0.017l2.155,1.278c0.082,0.045,0.197,0.045,0.272,0l8.49-4.907 c0.082-0.047,0.134-0.141,0.134-0.238V6.213c0-0.099-0.053-0.192-0.137-0.242l-8.49-4.907c-0.081-0.047-0.189-0.047-0.271,0 L3.075,5.971C2.99,6.021,2.936,6.118,2.936,6.213v9.555c0,0.097,0.054,0.189,0.139,0.235l2.104,1.233 c1.307,0.654,2.108-0.116,2.108-0.89V6.213c0-0.142,0.114-0.253,0.256-0.253h1.115c0.139,0,0.255,0.112,0.255,0.253v11.16 c0,1.745-0.95,2.745-2.604,2.745c-0.508,0-0.909,0-2.026-0.551L2.28,17.675c-0.57-0.329-0.922-0.945-0.922-1.604V6.213 c0-0.659,0.353-1.275,0.922-1.603l8.495-4.906c0.557-0.315,1.296-0.315,1.848,0l8.49,4.906c0.570,0.329,0.924,0.944,0.924,1.603 v9.859c0,0.659-0.354,1.265-0.924,1.604l-8.49,4.906C12.643,23.916,12.324,24,11.998,24z" fill="#339933" />
      <path d="M18.13,8.152c-0.668,0-1.216,0.221-1.665,0.644c-0.121,0.111-0.175,0.258-0.127,0.408l0.536,1.898 c0.05,0.15,0.186,0.27,0.348,0.295c0.161,0.021,0.34-0.021,0.482-0.129c0.265-0.201,0.567-0.302,0.917-0.302 c0.508,0,0.826,0.229,0.826,0.658c0,0.416-0.211,0.604-0.891,0.819l-1.056,0.33c-1.063,0.333-1.549,0.962-1.549,1.893 c0,1.181,0.896,1.812,2.169,1.812c0.668,0,1.216-0.221,1.665-0.644c0.121-0.111,0.175-0.258,0.127-0.408l-0.536-1.898 c-0.05-0.15-0.186-0.27-0.348-0.295c-0.161-0.021-0.34,0.021-0.482,0.129c-0.265,0.201-0.567,0.302-0.917,0.302 c-0.508,0-0.826-0.229-0.826-0.658c0-0.416,0.211-0.604,0.891-0.819l1.056-0.33c1.063-0.333,1.549-0.962,1.549-1.893 C20.299,8.75,19.403,8.152,18.13,8.152z" fill="#FFFFFF" />
    </svg>
  );
}

// Express Icon
function ExpressIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="2" fill="#000000" />
      <path d="M24 18.588a5.554 5.554 0 0 1-1.527.21c-3.39 0-5.527-2.16-5.527-5.78 0-3.75 2.16-5.96 5.337-5.96 1.5 0 2.76.48 3.697 1.317l-1.44 1.44a3.897 3.897 0 0 0-2.257-.75c-2.16 0-3.6 1.5-3.6 4.05 0 2.55 1.44 4.05 3.6 4.05.81 0 1.5-.21 2.04-.57l1.26 1.2zm-6.12-3.75c0 .48-.03.84-.12 1.2l3.75-3.75c-.39-.06-.84-.09-1.35-.09-1.8 0-3 .9-3 2.64zm-2.97 3.75c-1.2 0-2.1-.6-2.58-1.44l4.2-4.2c.48.84.78 1.92.78 3.12 0 .63-.09 1.2-.27 1.68l-1.89 1.89a4.2 4.2 0 0 1-1.44-.45zm-2.97-1.44c0 .48.03.84.12 1.2l-3.75 3.75c.39.06.84.09 1.35.09 1.8 0 3-.9 3-2.64zm-2.97-3.75c1.2 0 2.1.6 2.58 1.44l-4.2 4.2c-.48-.84-.78-1.92-.78-3.12 0-.63.09-1.2.27-1.68l1.89-1.89a4.2 4.2 0 0 1 1.44.45z" fill="#FFFFFF" />
    </svg>
  );
}

// Markdown Icon
function MarkdownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="2" fill="#000000" />
      <path d="M22.269 19.385H1.731a1.73 1.73 0 0 1-1.73-1.73V6.345a1.73 1.73 0 0 1 1.73-1.73h20.538a1.73 1.73 0 0 1 1.73 1.73v11.308a1.73 1.73 0 0 1-1.73 1.731zm-16.5-11.538v7.692l4.615-4.615 4.615 4.615v-7.692h2.308v9.23h-2.308l-4.615-4.615-4.615 4.615H3.461v-9.23z" fill="#FFFFFF" />
    </svg>
  );
}

export function AboutPage() {
  const frontendTechs = [
    { name: 'React 19', icon: ReactIcon },
    { name: 'TypeScript', icon: TypeScriptIcon },
    { name: 'Tailwind CSS', icon: TailwindIcon },
    { name: 'Vite', icon: ViteIcon },
  ];

  const backendTechs = [
    { name: 'Node.js / Bun', icon: NodeIcon },
    { name: 'Express', icon: ExpressIcon },
    { name: 'SSR', icon: Code },
    { name: 'Markdown', icon: MarkdownIcon },
  ];

  return (
    <article className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700 animate-fade-in-up">
      {/* Gradient Top Border */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-600 via-accent to-primary-600"></div>

      <div className="p-6 md:p-10 lg:p-12">
        {/* Content */}
        <div className="prose-custom max-w-none">
          <div className="space-y-8">
            {/* Introduction */}
            <section>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-4">
                你好，我是 Tom
              </h2>
              <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
                歡迎來到 <strong className="text-primary-600 dark:text-primary-400">湯編驛</strong>！
                這裡是我記錄開發筆記、程式碼實踐與想法的地方。我喜歡把概念快速轉換成可用的產品，
                這個部落格就是一個例子——用 React 打造的可組合 UI，搭配輕量的 SSR 伺服器與 Markdown 文章。
              </p>
            </section>

            {/* What I Do */}
            <section>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-4">
                我在做什麼
              </h2>
              <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                我專注於快速原型開發與產品實作，相信動手做比空想更有價值。
                在這個部落格中，我會分享：
              </p>
              <ul className="list-none space-y-2 text-lg text-slate-700 dark:text-slate-300">
                <li><strong>MVP 專案</strong>：從想法到上線的完整過程與經驗分享</li>
                <li><strong>軟體開發</strong>：實際開發中遇到的問題、解決方案與思考過程</li>
                <li><strong>工具與技術</strong>：新工具的試用心得、優缺點分析與使用建議</li>
                <li><strong>開發筆記</strong>：學習過程中的記錄、踩過的坑與收穫</li>
              </ul>
            </section>

            {/* Tech Stack */}
            <section>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-6">
                使用的技術
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Frontend */}
                <div className="group relative bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-700 hover:border-primary-400 dark:hover:border-primary-500 transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/10 hover:-translate-y-1">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                      <Code className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">前端</h3>
                  </div>
                  <ul className="space-y-4">
                    {frontendTechs.map((tech) => {
                      const Icon = tech.icon;
                      return (
                        <li key={tech.name} className="flex items-center gap-4 group/item">
                          <div className="w-8 h-8 flex items-center justify-center flex-shrink-0 rounded-md bg-white dark:bg-slate-700/50 p-1.5 transition-all duration-200 group-hover/item:scale-110 group-hover/item:shadow-md">
                            <Icon className="w-full h-full" />
                          </div>
                          <span className="text-base font-medium text-slate-700 dark:text-slate-300 flex-1">{tech.name}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                {/* Backend */}
                <div className="group relative bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-700 hover:border-primary-400 dark:hover:border-primary-500 transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/10 hover:-translate-y-1">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                      <Server className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">後端</h3>
                  </div>
                  <ul className="space-y-4">
                    {backendTechs.map((tech) => {
                      const Icon = tech.icon;
                      return (
                        <li key={tech.name} className="flex items-center gap-4 group/item">
                          <div className="w-8 h-8 flex items-center justify-center flex-shrink-0 rounded-md bg-white dark:bg-slate-700/50 p-1.5 transition-all duration-200 group-hover/item:scale-110 group-hover/item:shadow-md">
                            <Icon className="w-full h-full" />
                          </div>
                          <span className="text-base font-medium text-slate-700 dark:text-slate-300 flex-1">{tech.name}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </section>

            {/* Contact */}
            <section>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-4">
                聯絡方式
              </h2>
              <div className="flex flex-wrap gap-4">
                <a
                  href="mailto:gh286991@gmail.com"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold rounded-xl shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 transition-all duration-300 hover:scale-105"
                >
                  <Mail className="w-5 h-5" />
                  <span>gh286991@gmail.com</span>
                </a>
              </div>
            </section>

            {/* Philosophy */}
            <section>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-4">
                為什麼寫這個部落格
              </h2>
              <blockquote className="border-l-4 border-primary-600 dark:border-primary-400 pl-6 py-4 bg-slate-50 dark:bg-slate-700/50 rounded-r-lg italic text-lg text-slate-700 dark:text-slate-300">
                我相信最好的學習方式是動手實作，最好的分享是記錄過程。
                希望透過這個部落格，不僅記錄自己的實踐經驗，也能幫助有類似想法的朋友少走一些彎路。
                讓我們一起把想法變成現實！
              </blockquote>
            </section>
          </div>
        </div>
      </div>
    </article>
  );
}

