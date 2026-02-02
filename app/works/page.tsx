import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getAllPosts } from '@/lib/content';
import { ArrowRight, Code, Beaker, ExternalLink, Github, Zap } from 'lucide-react';
import clsx from 'clsx';

export const metadata: Metadata = {
  title: '作品集 | 湯編驛',
  description: '我的專案作品、實驗性程式碼與開源貢獻集合。',
};

// Types
interface Project {
  slug: string;
  title: string;
  description: string;
  image?: string;
  tags: string[];
  link?: string;
  github?: string;
  featured?: boolean;
}

interface LabItem {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  link?: string;
  tags: string[]; // Added tags
}

// Data
const projects: Project[] = [
  {
    slug: 'vlogo',
    title: 'Vlogo',
    description: '一個 Chrome 擴充功能，專為 YouTube 旅遊 Vlog 設計。它能自動在地圖上顯示影片中的位置資訊，讓觀眾即時探索影片場景。',
    tags: ['Chrome Extension', 'React', 'Google Maps API'],
    link: 'https://chromewebstore.google.com/detail/vlogo/gafjhpljbjkfldgjpdaiokeijelojdgi',
    image: '/images/vlogoprmot1.png',
    featured: true,
  },
  {
    slug: 'personal-blog',
    title: '個人部落格與作品集',
    description: '使用 Next.js 15 和 Tailwind CSS v4 打造的現代化高效能個人網站。採用 Bento 網格佈局、MDX 支援與自訂設計系統。',
    tags: ['Next.js', 'React', 'Tailwind CSS', 'TypeScript'],
    github: 'https://github.com/tomslab/personal-react-blog',
    image: '/images/personal-blog-cover.png',
    featured: true,
  }
];

const labItems: LabItem[] = [
  {
    id: 'godot-shmup',
    title: 'Lab 01: Godot-Shmup',
    description: '使用 Godot 引擎開發的 2D 彈幕射擊遊戲 (STG) 原型。探索遊戲設計模式與 GDScript 實作。',
    icon: Zap,
    color: 'from-amber-400 to-orange-500',
    link: '/posts/lab-01-godot-shmup', // Assuming this post exists or will exist
    tags: ['Godot', 'Game Dev', 'GDScript'],
  },
  {
    id: 'ramen-button',
    title: '拉麵贊助按鈕',
    description: '帶有微互動與動畫效果的贊助組件，讓讀者能請我吃碗拉麵。在此專案中實際應用於文章頁面。',
    icon: Beaker,
    color: 'from-blue-400 to-indigo-500',
    link: '/posts/welcome-to-my-blog#ramen',
    tags: ['React', 'Animation', 'Component'],
  },
  {
    id: 'tree-view',
    title: '檔案樹視圖',
    description: '用於顯示層級資料結構的遞迴組件，支援展開/收合與檔案圖標。應用於文章列表頁面。',
    icon: Code,
    color: 'from-emerald-400 to-teal-500',
    link: '/posts',
    tags: ['React', 'Recursive', 'UI'],
  }
];

// ... (previous imports)
import { format } from 'date-fns';
import { PostSummary } from '@/lib/content';

// Update Project interface if needed, or just use tags
// We will use existing 'tags' for matching for now, as per user request.

// ... (previous data)

export default async function WorksPage() {
  const posts = await getAllPosts();

  return (
    <div className="min-h-screen pb-20 px-4 sm:px-6 pt-10 sm:pt-16">
      <div className="max-w-5xl mx-auto space-y-24">
        
        {/* ... (Header Section remains same) ... */}
        {/* ... */}
        
        {/* Section 1: Major Projects */}
        <section id="projects" className="space-y-12">
          {/* ... */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {projects.map((project) => (
              <ProjectCard key={project.slug} project={project} allPosts={posts} />
            ))}
          </div>
        </section>

        {/* Section 2: The Lab */}
        <section id="lab" className="space-y-12">
          <div className="flex items-center gap-4">
             <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                <Beaker size={18} />
              </span>
              實驗室
            </h2>
             <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {labItems.map((item) => (
              <LabCard key={item.id} item={item} allPosts={posts} />
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}

// Sub-components

function ProjectCard({ project, allPosts }: { project: Project; allPosts: PostSummary[] }) {
  // Filter related posts: simplistic approach - if post has any tag that matches project tags
  // We prioritize matches.
  const relatedPosts = allPosts
    .filter(post => 
      post.tags && project.tags.some(tag => post.tags.includes(tag) || post.title.toLowerCase().includes(project.title.toLowerCase()))
    )
    .slice(0, 3); // Top 3

  return (
    <article className="group relative flex flex-col h-full bg-white dark:bg-slate-800/50 rounded-3xl border border-slate-200 dark:border-slate-700/50 overflow-hidden hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500">
      
      {/* Decorative Gradient Background */}
      {/* Decorative Gradient Background or Image */}
      <div className="h-48 w-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 relative overflow-hidden flex-shrink-0">
         {project.image ? (
            <Image 
              src={project.image} 
              alt={project.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
         ) : (
           <div className="absolute inset-0 opacity-10 dark:opacity-20 flex items-center justify-center">
              <Code size={64} />
           </div>
         )}
      </div>

      <div className="flex-1 p-8 flex flex-col">
        <div className="mb-6 flex gap-2 flex-wrap">
          {project.tags.map(tag => (
            <span key={tag} className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-700/50 text-xs font-medium text-slate-600 dark:text-slate-300">
              {tag}
            </span>
          ))}
        </div>

        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {project.title}
        </h3>
        
        <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
          {project.description}
        </p>

        {/* Development Logs Section */}
        {relatedPosts.length > 0 && (
          <div className="mt-auto pt-6 border-t border-slate-100 dark:border-slate-700/50 mb-6">
            <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
              開發日誌
            </h4>
            <ul className="space-y-3">
              {relatedPosts.map(post => (
                <li key={post.slug}>
                  <Link href={`/posts/${post.slug}`} className="group/link flex items-start gap-3">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500/50 group-hover/link:bg-blue-500 transition-colors" />
                    <div>
                      <span className="block text-sm font-medium text-slate-700 dark:text-slate-300 group-hover/link:text-blue-600 dark:group-hover/link:text-blue-400 transition-colors line-clamp-1">
                        {post.title}
                      </span>
                      <span className="block text-xs text-slate-400 dark:text-slate-500">
                        {format(new Date(post.date), 'MMM d, yyyy')}
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex items-center gap-4 mt-auto pt-0">
          {project.github && (
            <a href={project.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-black dark:hover:text-white transition-colors">
              <Github size={18} />
              Source
            </a>
          )}
          {project.link && (
             <a href={project.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-black dark:hover:text-white transition-colors">
              <ExternalLink size={18} />
              Visit
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

function LabCard({ item, allPosts }: { item: LabItem; allPosts: PostSummary[] }) {
  const Icon = item.icon;
  
  const relatedPosts = allPosts
    .filter(post => 
      post.tags && item.tags.some(tag => post.tags.includes(tag) || post.title.toLowerCase().includes(item.title.toLowerCase()))
    )
    .slice(0, 2); // Limit to 2 for smaller cards

  return (
    <article className="h-full flex flex-col bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/50 hover:border-blue-500/30 dark:hover:border-blue-500/30 transition-all duration-300 hover:-translate-y-1">
      <Link href={item.link || '#'} className="block group flex-1 p-6">
        <div className={clsx(
          "w-12 h-12 rounded-xl mb-4 flex items-center justify-center text-white bg-gradient-to-br shadow-lg",
          item.color
        )}>
          <Icon size={24} />
        </div>
        
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {item.title}
        </h3>
        
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
          {item.description}
        </p>
      </Link>

       {/* Compact Development Logs */}
       {relatedPosts.length > 0 && (
          <div className="px-6 pb-6 pt-0 mt-auto">
            <div className="border-t border-slate-100 dark:border-slate-700/50 pt-3">
              <h4 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                開發紀錄
              </h4>
              <ul className="space-y-2">
                {relatedPosts.map(post => (
                   <li key={post.slug}>
                    <Link href={`/posts/${post.slug}`} className="group/link flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-blue-500/50 group-hover/link:bg-blue-500 transition-colors" />
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-400 group-hover/link:text-blue-600 dark:group-hover/link:text-blue-400 transition-colors truncate">
                        {post.title}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
    </article>
  );
}
