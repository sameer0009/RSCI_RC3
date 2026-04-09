import os

file_path = r"d:\Apps\RSCI-RC3\frontend\src\app\problems\page.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

daily_challenge_jsx = """
        <div className="mb-8 p-6 bg-gradient-to-r from-primary-600 to-purple-600 rounded-2xl shadow-xl text-white relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl transform group-hover:scale-110 transition-transform duration-700"></div>
          <div className="relative z-10 flex flex-col sm:flex-row justify-between items-center">
            <div className="flex items-center gap-4 mb-4 sm:mb-0">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center text-3xl shadow-inner">
                🔥
              </div>
              <div>
                <span className="text-white/80 text-sm font-bold uppercase tracking-wider block mb-1">Daily Challenge</span>
                <h2 className="text-2xl font-black text-white">Two Sum IV - Input is a BST</h2>
                <div className="flex gap-3 mt-2 text-sm font-medium">
                  <span className="text-green-300">● Easy</span>
                  <span className="text-white/70">Tree, Depth-First Search</span>
                </div>
              </div>
            </div>
            <Link href="/problems/two-sum-iv" className="px-6 py-3 bg-white text-primary-700 font-bold rounded-xl hover:bg-gray-50 hover:shadow-lg transition-all transform hover:-translate-y-1">
              Solve Now
            </Link>
          </div>
        </div>

        <div className="mb-8">
"""

content = content.replace(
    '        <div className="mb-8">\n          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">\n            Problems\n          </h1>',
    daily_challenge_jsx.strip() + '\n          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">\n            Problems\n          </h1>'
)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Daily Challenge widget added to problems page")
