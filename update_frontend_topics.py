import os

file_path = r"d:\Apps\RSCI-RC3\frontend\src\app\problems\page.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Add topic to filters
content = content.replace(
    "difficulty: '',\n    search: '',\n  });",
    "difficulty: '',\n    search: '',\n    topic: '',\n  });\n\n  const [availableTopics, setAvailableTopics] = useState<string[]>([]);"
)

# In fetchProblems, fetch available topics or just append topic
# Let's extract unique topics from API response or just append topic to params
fetch_problems_old = """
      const { data } = await api.get(`/problems?${params.toString()}`);
      setProblems(data.data.problems);
"""
fetch_problems_new = """
      if (filters.topic) params.append('topic', filters.topic);
      const { data } = await api.get(`/problems?${params.toString()}`);
      
      const loadedProblems = data.data.problems;
      setProblems(loadedProblems);
      
      // Extract unique topics from problems
      const topics = new Set<string>();
      loadedProblems.forEach((p: any) => {
        p.topics?.forEach((t: string) => topics.add(t));
      });
      if (availableTopics.length === 0) {
          setAvailableTopics(Array.from(topics));
      }
"""
content = content.replace(fetch_problems_old.strip(), fetch_problems_new.strip())

# Update the UI filters
ui_old = """
            <select
              value={filters.difficulty}
              onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-card text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>
"""
ui_new = """
            <select
              value={filters.difficulty}
              onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-card text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
            
            {availableTopics.length > 0 && (
                <select
                  value={filters.topic}
                  onChange={(e) => setFilters({ ...filters, topic: e.target.value })}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-card text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">All Topics</option>
                  {availableTopics.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
            )}
          </div>
          
          {filters.topic && (
              <div className="mt-3 flex gap-2">
                 <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300">
                    Topic: {filters.topic}
                    <button onClick={() => setFilters({...filters, topic: ''})} className="hover:text-primary-900 dark:hover:text-primary-100">×</button>
                 </span>
              </div>
          )}
"""
content = content.replace(ui_old.strip(), ui_new.strip())

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Topics filter added to problems page")
