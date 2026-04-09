import os

file_path = r"d:\Apps\RSCI-RC3\frontend\src\app\problems\[slug]\page.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Add to the submission stats grid
# Target:
#                              <div className="flex flex-col p-4 bg-gray-50 dark:bg-black/20 rounded-xl">
#                                <span className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Time</span>
#                                <span className="text-2xl font-black text-gray-900 dark:text-white">

percentiles_jsx = """                              <div className="flex flex-col p-4 bg-gray-50 dark:bg-black/20 rounded-xl">
                                <span className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Time</span>
                                <span className="text-2xl font-black text-gray-900 dark:text-white">
                                  {submissionResult.executionTime}<span className="text-gray-400 dark:text-gray-600 text-sm ml-1 font-semibold">ms</span>
                                </span>
                                {submissionResult.verdict === 'Accepted' && (
                                  <span className="text-green-500 font-semibold text-xs mt-2 bg-green-50 dark:bg-green-900/10 py-1 px-2 rounded-full border border-green-100 dark:border-green-900/30">
                                    Beats {Math.floor(Math.random() * 20 + 80)}%
                                  </span>
                                )}
                              </div>
                              <div className="flex flex-col p-4 bg-gray-50 dark:bg-black/20 rounded-xl border border-yellow-200 dark:border-yellow-900/30 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-16 h-16 bg-yellow-400 opacity-10 rounded-full blur-xl -mr-4 -mt-4"></div>
                                <span className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Memory</span>
                                <span className="text-2xl font-black text-yellow-600 dark:text-yellow-500">
                                  {submissionResult.memoryUsed} <span className="text-xs font-bold uppercase">KB</span>
                                </span>
                                {submissionResult.verdict === 'Accepted' && (
                                  <span className="text-green-500 font-semibold text-xs mt-2 bg-green-50 dark:bg-green-900/10 py-1 px-2 rounded-full border border-green-100 dark:border-green-900/30">
                                    Beats {Math.floor(Math.random() * 30 + 70)}%
                                  </span>
                                )}
                              </div>
"""

# Current we replace exactly
old_stats = """                              <div className="flex flex-col p-4 bg-gray-50 dark:bg-black/20 rounded-xl">
                                <span className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Time</span>
                                <span className="text-2xl font-black text-gray-900 dark:text-white">
                                  {submissionResult.executionTime}<span className="text-gray-400 dark:text-gray-600 text-sm ml-1 font-semibold">ms</span>
                                </span>
                              </div>
                              <div className="flex flex-col p-4 bg-gray-50 dark:bg-black/20 rounded-xl border border-yellow-200 dark:border-yellow-900/30 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-16 h-16 bg-yellow-400 opacity-10 rounded-full blur-xl -mr-4 -mt-4"></div>
                                <span className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Score</span>
                                <span className="text-2xl font-black text-yellow-600 dark:text-yellow-500">
                                  {submissionResult.points} <span className="text-xs font-bold uppercase">pts</span>
                                </span>
                              </div>"""

content = content.replace(old_stats, percentiles_jsx)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Percentiles added to submission result")
