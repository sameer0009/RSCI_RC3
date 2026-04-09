import os

file_path = r"d:\Apps\RSCI-RC3\frontend\src\app\problems\[slug]\page.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add activeLeftTab state
content = content.replace(
    "const [activeTab, setActiveTab] = useState<'custom' | 'samples' | 'submission'>('custom');",
    "const [activeTab, setActiveTab] = useState<'custom' | 'samples' | 'submission'>('custom');\n  const [activeLeftTab, setActiveLeftTab] = useState<'description' | 'solutions'>('description');"
)

# 2. Modify Left Panel layout
left_panel_old = """      <PanelGroup direction="horizontal" className="flex-1 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-bg shadow-sm">
        {/* Left Panel - Problem Description */}
        <Panel defaultSize={45} minSize={30} className="bg-white dark:bg-dark-card flex flex-col">
          <div className="p-6 overflow-y-auto flex-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {problem.title}
            </h1>"""

left_panel_new = """      <PanelGroup direction="horizontal" className="flex-1 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-bg shadow-sm">
        {/* Left Panel - Problem Description & Solutions */}
        <Panel defaultSize={45} minSize={30} className="bg-white dark:bg-dark-card flex flex-col border-r border-gray-200 dark:border-gray-800">
          
          {/* Left Panel Tabs */}
          <div className="flex border-b border-gray-200 dark:border-[#2d2d2d] bg-gray-50 dark:bg-[#1e1e1e] px-2 h-12 items-center">
            <button
              onClick={() => setActiveLeftTab('description')}
              className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
                activeLeftTab === 'description'
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              Description
            </button>
            <button
              onClick={() => setActiveLeftTab('solutions')}
              className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
                activeLeftTab === 'solutions'
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              Editorial & Solutions
            </button>
          </div>

          <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
            {activeLeftTab === 'description' && (
              <>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  {problem.title}
                </h1>"""

content = content.replace(left_panel_old.strip(), left_panel_new.strip())

# 3. Close the Description conditional rendering and add Solutions content
closing_div_old = """                  <div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Output:</span>
                    <pre className="mt-1 p-2 bg-white dark:bg-black/40 rounded text-sm font-mono">{testCase.expectedOutput}</pre>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Panel>"""

closing_div_new = """                  <div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Output:</span>
                    <pre className="mt-1 p-2 bg-white dark:bg-black/40 rounded text-sm font-mono">{testCase.expectedOutput}</pre>
                  </div>
                </div>
              ))}
            </div>
              </>
            )}

            {activeLeftTab === 'solutions' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center bg-primary-50 dark:bg-primary-900/10 p-4 rounded-xl border border-primary-100 dark:border-primary-900/30">
                  <div>
                    <h3 className="font-bold text-primary-900 dark:text-primary-100 mb-1">Official Editorial</h3>
                    <p className="text-sm text-primary-700 dark:text-primary-300">Read the optimal approach curated by RSCI-RC3.</p>
                  </div>
                  <button className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-semibold hover:bg-primary-700 transition">View Editorial</button>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Community Solutions</h3>
                    <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition">
                       + Post Solution
                    </button>
                  </div>
                  
                  {/* Mock Solutions List */}
                  <div className="space-y-4">
                    {[
                      {id: 1, title: "O(N) Time and O(1) Space using Two Pointers", lang: "C++", votes: 342, author: "algo_master"},
                      {id: 2, title: "Clean Python 3 Solution with List Comprehension", lang: "Python", votes: 128, author: "py_dev01"},
                      {id: 3, title: "Java HashMap approach - Very easy to understand", lang: "Java", votes: 89, author: "java_king"},
                      {id: 4, title: "Javascript standard map/filter logic", lang: "JavaScript", votes: 45, author: "js_ninja"}
                    ].map(sol => (
                      <div key={sol.id} className="p-4 border border-gray-200 dark:border-gray-800 rounded-xl hover:border-primary-500 dark:hover:border-primary-500 transition cursor-pointer group bg-white dark:bg-[#1a1a1a]">
                        <h4 className="font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 mb-2">{sol.title}</h4>
                        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                          <span className="flex items-center gap-1 font-medium text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-xs">{sol.lang}</span>
                          <span className="flex items-center gap-1">↑ {sol.votes}</span>
                          <span className="flex items-center gap-1">👤 {sol.author}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
          </div>
        </Panel>"""

content = content.replace(closing_div_old.strip(), closing_div_new.strip())

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Solutions tab added to problem detail page")
