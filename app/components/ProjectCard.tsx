import Link from 'next/link';
import { PostSummary } from '@/lib/types';
import { ArrowRight, Calendar, GitCommit } from 'lucide-react';
import { format } from 'date-fns';

interface ProjectCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  tags?: string[]; // Tags to filter logs by
  filterTag: string; // The specific tag to use for "related logs"
  status: 'active' | 'on-hold' | 'completed';
  links?: {
    github?: string;
    demo?: string;
  };
  posts: PostSummary[];
}

export function ProjectCard({ title, description, icon, tags, filterTag, status, links, posts }: ProjectCardProps) {
  // Filter related logs based on the tag
  const relatedLogs = posts
    .filter(post => post.tags?.includes(filterTag))
    .slice(0, 3);

  const statusColors = {
    active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    'on-hold': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
    completed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  };

  const statusLabels = {
    active: '進行中',
    'on-hold': '暫停',
    completed: '已完成'
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-lg overflow-hidden flex flex-col h-full group">
       {/* Card Header with Gradient */}
       <div className="h-24 bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 relative">
         <div className="absolute -bottom-6 left-6 w-12 h-12 rounded-xl bg-white dark:bg-slate-700 shadow-md flex items-center justify-center text-slate-700 dark:text-slate-200">
           {icon}
         </div>
       </div>

       <div className="p-6 pt-8 flex-1 flex flex-col">
         <div className="flex items-center justify-between mb-2">
           <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
             {title}
           </h3>
           <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${statusColors[status]}`}>
             {statusLabels[status]}
           </span>
         </div>
         
         <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 leading-relaxed">
           {description}
         </p>

         {/* Tags */}
         {tags && (
           <div className="flex flex-wrap gap-2 mb-6">
             {tags.map(tag => (
               <span key={tag} className="text-xs px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                 #{tag}
               </span>
             ))}
           </div>
         )}
         
         {/* Related Logs Stream */}
         <div className="mt-auto border-t border-slate-100 dark:border-slate-700/50 pt-4">
           <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
             <GitCommit className="w-3.5 h-3.5" />
             最近開發日誌
           </h4>
           
           {relatedLogs.length > 0 ? (
             <div className="space-y-3 relative">
                {/* Timeline vertical line */}
                <div className="absolute left-[5px] top-2 bottom-2 w-px bg-slate-200 dark:bg-slate-700 pointer-events-none"></div>

                {relatedLogs.map(post => (
                  <Link key={post.slug} href={`/posts/${post.slug}`} className="flex items-start gap-3 group/log relative">
                     <div className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-600 border-2 border-white dark:border-slate-800 group-hover/log:bg-blue-500 transition-colors z-10 shrink-0 mt-1"></div>
                     <div className="min-w-0">
                       <div className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate group-hover/log:text-blue-600 dark:group-hover/log:text-blue-400 transition-colors">
                         {post.title}
                       </div>
                       <div className="text-xs text-slate-400 font-mono">
                         {format(new Date(post.date), 'yyyy-MM-dd')}
                       </div>
                     </div>
                  </Link>
                ))}
             </div>
           ) : (
             <p className="text-sm text-slate-400 italic">暫無相關日誌 (等待實驗數據...)</p>
           )}
         </div>
       </div>

       {/* Actions Footer */}
       <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-700/50 flex gap-2">
         {links?.demo && (
            <Link href={links.demo} target="_blank" className="flex-1 py-2 text-center text-sm font-semibold text-white bg-slate-900 dark:bg-blue-600 rounded-lg hover:opacity-90 transition-opacity">
              Live Demo
            </Link>
         )}
         {links?.github && (
            <Link href={links.github} target="_blank" className="flex-1 py-2 text-center text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors">
              Source Code
            </Link>
         )}
         {!links?.github && !links?.demo && (
            <div className="flex-1 py-2 text-center text-sm text-slate-400 bg-transparent">
              內部開發中
            </div>
         )}
       </div>
    </div>
  );
}
