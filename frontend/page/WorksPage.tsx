import { useState } from 'react';
import { ArrowUpRight, FlaskConical, Sparkles, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';

const projectItems = [
  {
    id: 'vlogo',
    title: 'Vlogo',
    label: 'Chrome 擴充功能',
    description:
      'Vlogo：watch vlog and go! 自動整理 YouTube 旅遊景點與時間點，提供快速筆記與地圖連結。幫你快速整理 YouTube 旅遊 Vlog 的亮點片段，把影片裡的景點、時間點與摘要一次排好，配上 Google 地圖連結，讓你隨時開箱旅遊靈感、直接安排自己的行程。',
    websiteUrl: 'https://vlogo.tomslab.dev/',
    extensionUrl: 'https://chromewebstore.google.com/detail/vlogo/gafjhpljbjkfldgjpdaiokeijelojdgi',
    images: ['/vlogoprmot1.png'],
  },
];

// Lab 項目
const labItems: Array<{
  id: string;
  title: string;
  badge: string;
  description: string;
  demoUrl?: string;
  githubUrl?: string;
  image?: string;
}> = [
  {
    id: 'godot-shmup',
    title: 'Godot-Shmup',
    badge: 'Lab 01',
    description:
      '使用 Godot 引擎開發的 2D 飛機射擊遊戲。玩家控制一架飛機，躲避敵機並射擊得分。包含流暢的飛機控制系統、動態敵機生成、即時分數顯示、精美背景效果和完整的碰撞檢測系統。支援鍵盤和觸控操作，可在瀏覽器中直接遊玩。',
    demoUrl: 'https://gh286991.github.io/Godot-Shmup/',
    githubUrl: 'https://github.com/gh286991/Godot-Shmup',
    image: '/CPT2511151043-359x700.gif',
  },
];

// 圖片輪播組件
function ImageSlider({ images, title }: { images: string[]; title: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  if (!images || images.length === 0) return null;

  return (
    <div className="mb-6 -mx-8 -mt-8 rounded-t-2xl overflow-hidden bg-slate-100 dark:bg-slate-900 relative group">
      <div className="relative h-48 overflow-hidden">
        {images.map((image, index) => (
          <img
            key={index}
            src={image}
            alt={`${title} - 圖片 ${index + 1}`}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
              index === currentIndex ? 'opacity-100' : 'opacity-0'
            }`}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        ))}
      </div>

      {/* 左右切換按鈕 */}
      {images.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            aria-label="上一張"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            aria-label="下一張"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* 指示器 */}
      {images.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'w-8 bg-white'
                  : 'w-2 bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`前往圖片 ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function WorksPage() {
  return (
    <div className="-mx-4 sm:-mx-6 lg:-mx-12">
      <article className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700 max-w-7xl mx-auto">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-600 via-accent to-primary-600" />
        <div className="p-6 md:p-8 lg:p-10">
        {/* Projects Section - 更突出的設計 */}
        <section className="mb-16">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="w-6 h-6 text-primary-600 dark:text-primary-300" />
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 text-sm font-semibold">
                Projects
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2">
              MVP
            </h2>
            <p className="text-slate-600 dark:text-slate-300">
              真實會上線、可能收費的產品，著重敘事與商業節奏
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 w-full">
            {projectItems.map((project) => (
              <div
                key={project.id}
                className="group relative p-8 rounded-2xl bg-gradient-to-br from-white via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:border-primary-400 dark:hover:border-primary-500 transition-all duration-300 hover:shadow-2xl hover:shadow-primary-500/10 hover:-translate-y-1 w-full"
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-600 via-accent to-primary-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                
                {/* 項目圖片輪播 */}
                {project.images && project.images.length > 0 && (
                  <ImageSlider images={project.images} title={project.title} />
                )}
                
                <div className="mb-4">
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    {project.title}
                  </h3>
                  <p className="text-sm font-medium text-primary-600 dark:text-primary-400 uppercase tracking-wider">
                    {project.label}
                  </p>
                </div>

                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6 text-base">
                  {project.description}
                </p>

                {/* 連結按鈕組 */}
                <div className="flex flex-wrap gap-3">
                  {project.websiteUrl && (
                    <a
                      href={project.websiteUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold shadow-lg hover:bg-primary-600 dark:bg-white/10 dark:text-white dark:hover:bg-primary-600 transition-all duration-300 hover:shadow-xl hover:shadow-primary-500/20 hover:-translate-y-0.5"
                    >
                      <span>官網</span>
                      <ArrowUpRight className="w-4 h-4" />
                    </a>
                  )}
                  {project.extensionUrl && (
                    <a
                      href={project.extensionUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-semibold border-2 border-slate-300 dark:border-slate-600 hover:border-primary-400 dark:hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
                    >
                      <span>安裝插件</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Lab Section */}
        <section className="pt-12 border-t-2 border-slate-200 dark:border-slate-700">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <FlaskConical className="w-6 h-6 text-primary-600 dark:text-primary-300" />
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 text-sm font-semibold">
                Lab
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2">
              實驗室
            </h2>
            <p className="text-slate-600 dark:text-slate-300">
              這裡存放還在試驗、尚未商業化的靈感，重點在快速 Prototype 與紀錄
            </p>
          </div>

          {labItems.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-1">
              {labItems.map((lab) => (
                <div
                  key={lab.id}
                  className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 hover:bg-slate-100 dark:hover:bg-slate-900/60 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 overflow-hidden"
                >
                  <div className="flex flex-col md:flex-row">
                    {/* 左側：直向圖片 */}
                    {lab.image && (
                      <div className="md:w-1/3 flex-shrink-0 bg-slate-100 dark:bg-slate-900 flex items-center justify-center p-4">
                        <img
                          src={lab.image}
                          alt={lab.title}
                          className="max-h-96 w-auto object-contain"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    
                    {/* 右側：內容區域 */}
                    <div className="flex-1 p-6 flex flex-col">
                      <div className="flex items-center justify-between mb-3">
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300">
                          {lab.badge}
                        </span>
                      </div>
                      
                      <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                        {lab.title}
                      </h3>
                      
                      <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-6 flex-1">
                        {lab.description}
                      </p>
                      
                      {/* 連結按鈕組 */}
                      <div className="flex flex-wrap gap-3">
                        {lab.demoUrl && (
                          <a
                            href={lab.demoUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-semibold shadow-lg hover:bg-primary-700 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"
                          >
                            <span>試玩遊戲</span>
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                        {lab.githubUrl && (
                          <a
                            href={lab.githubUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-semibold border-2 border-slate-300 dark:border-slate-600 hover:border-primary-400 dark:hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
                          >
                            <span>GitHub</span>
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 px-4">
              <FlaskConical className="w-16 h-16 mx-auto text-slate-400 dark:text-slate-500 mb-4 opacity-50" />
              <p className="text-lg text-slate-600 dark:text-slate-400 font-medium mb-2">
                暫時還沒有
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-500">
                請期待
              </p>
            </div>
          )}
        </section>
        </div>
      </article>
    </div>
  );
}
