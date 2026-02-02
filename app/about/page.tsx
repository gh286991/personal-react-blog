import { Rocket, Code, Server, Wrench, Mail, Github, FileText, Sparkles, Cpu, Layers } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: '關於我 | 湯編驛',
  description: '全棧開發者，專注於 Next.js, React 與現代化網頁技術。',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Page Header */}
        <header className="mb-12 text-center animate-fade-in-up">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">
            關於 <span className="gradient-text">Me & Code</span>
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            寫代碼，做產品，記錄數位花園的園丁。
          </p>
        </header>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(180px,auto)]">
          
          {/* 1. Hero Profile Card - Large (Span 2 cols, 2 rows if content needs) */}
          <div className="md:col-span-2 md:row-span-1 bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-200 dark:border-slate-700 shadow-lg relative overflow-hidden group animate-fade-in-up [animation-delay:100ms]">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-bl-full pointer-events-none -mr-16 -mt-16 transition-transform group-hover:scale-110 duration-700"></div>
            
            <div className="relative z-10 h-full flex flex-col justify-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider w-fit mb-4">
                <Sparkles className="w-3 h-3" />
                Hello World
              </div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
                你好，我是 Tom 👋
              </h2>
              <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed mb-6">
                我是一名全棧開發者，熱愛探索新技術並將其應用於實際產品中。
                <br className="hidden sm:block" />
                這個部落格「湯編驛」是我的數位花園，用來記錄開發筆記、技術實踐與即時的想法。
              </p>
              <div className="flex flex-wrap gap-3">
                 <span className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 text-sm font-medium">
                   📍 Tainan, Taiwan
                 </span>
                 <span className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 text-sm font-medium">
                   💻 Full Stack Dev
                 </span>
              </div>
            </div>
          </div>

          {/* 2. Philosophy Card */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-lg flex flex-col justify-between relative overflow-hidden animate-fade-in-up [animation-delay:200ms]">
            <Layers className="w-32 h-32 absolute -bottom-8 -right-8 text-white/10" />
            
            <div>
              <h3 className="text-xl font-bold mb-2 text-white/90">Blog Philosophy</h3>
              <p className="text-blue-100/80 text-sm">為什麼寫這些？</p>
            </div>
            <p className="text-lg font-medium leading-relaxed mt-4">
              "Compilation of Thoughts."
              <br />
              將想法編譯成現實，
              <br />
              將經驗重構成知識。
            </p>
          </div>

          {/* 3. Focus Areas (4 small cards) */}
          <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in-up [animation-delay:300ms]">
            <FocusCard 
              icon={<Rocket className="w-6 h-6 text-orange-500" />}
              title="MVP 開發"
              desc="快速將想法轉化為可用的原型，專注於核心價值驗證。"
            />
            <FocusCard 
              icon={<Code className="w-6 h-6 text-blue-500" />}
              title="前端工程"
              desc="打造流暢、美觀且響應式的用戶界面與交互體驗。"
            />
            <FocusCard 
              icon={<Server className="w-6 h-6 text-green-500" />}
              title="後端架構"
              desc="設計可擴展的 API、數據庫模型與系統架構。"
            />
            <FocusCard 
              icon={<FileText className="w-6 h-6 text-purple-500" />}
              title="技術筆記"
              desc="整理學習過程中的坑與解法，建立個人知識庫。"
            />
          </div>

          {/* 4. Tech Stack - Wide */}
          <div className="md:col-span-2 bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-200 dark:border-slate-700 shadow-lg animate-fade-in-up [animation-delay:400ms]">
             <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
               <Cpu className="w-5 h-5 text-blue-500" />
               技術棧
             </h3>
             
             <div className="space-y-6">
               <div className="space-y-3">
                 <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Frontend</div>
                 <div className="flex flex-wrap gap-2">
                   {['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Framer Motion', 'Zustand'].map(tech => (
                     <span key={tech} className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 text-sm font-medium border border-slate-200 dark:border-slate-600/50">
                       {tech}
                     </span>
                   ))}
                 </div>
               </div>
               
               <div className="space-y-3">
                 <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Backend & Ops</div>
                 <div className="flex flex-wrap gap-2">
                   {['Node.js', 'Bun', 'Hono', 'Express', 'PostgreSQL', 'Docker', 'Nginx'].map(tech => (
                     <span key={tech} className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 text-sm font-medium border border-slate-200 dark:border-slate-600/50">
                       {tech}
                     </span>
                   ))}
                 </div>
               </div>
             </div>
          </div>

          {/* 5. Contact / Connect */}
          <div className="md:col-span-1 bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-200 dark:border-slate-700 shadow-lg flex flex-col justify-center animate-fade-in-up [animation-delay:500ms]">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Let's Connect</h3>
            <div className="space-y-4">
              <Link 
                href="mailto:gh286991@gmail.com" 
                className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-700/30 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors group"
              >
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Email Me</div>
                  <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">gh286991@gmail.com</div>
                </div>
              </Link>
              
              <Link 
                href="https://github.com/gh286991" 
                target="_blank"
                className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-700/30 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors group"
              >
                 <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 group-hover:scale-110 transition-transform">
                  <Github className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">GitHub</div>
                  <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">@gh286991</div>
                </div>
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function FocusCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
      <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-700/50 flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{title}</h3>
      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
        {desc}
      </p>
    </div>
  );
}
