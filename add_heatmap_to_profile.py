import os

file_path = r"d:\Apps\RSCI-RC3\frontend\src\app\profile\[username]\page.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Add import
content = content.replace(
    "import { useAuth } from '@/contexts/AuthContext';",
    "import { useAuth } from '@/contexts/AuthContext';\nimport ActivityCalendar from 'react-activity-calendar';"
)

# Mock data generation for heatmap
js_mock_data = """
  // Generate mock data for the ActivityCalendar
  const [activityData, setActivityData] = useState<Array<{date: string; count: number; level: number}>>([]);
  
  useEffect(() => {
    // Generate past 365 days of mock activity
    const data = [];
    const today = new Date();
    for (let i = 365; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      
      // Random activity
      const isActive = Math.random() > 0.6;
      const count = isActive ? Math.floor(Math.random() * 10) + 1 : 0;
      let level = 0;
      if (count > 0) level = 1;
      if (count > 3) level = 2;
      if (count > 6) level = 3;
      if (count > 8) level = 4;
      
      data.push({ date: dateString, count, level });
    }
    setActivityData(data);
  }, []);
"""

content = content.replace(
    "  const [uploadingPicture, setUploadingPicture] = useState(false);",
    "  const [uploadingPicture, setUploadingPicture] = useState(false);\n" + js_mock_data
)

# Render Heatmap
heatmap_jsx = """
          {/* Submission Heatmap */}
          <div className="bg-white dark:bg-dark-card rounded-lg shadow p-6 mb-6 overflow-hidden">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              Submission Activity
            </h2>
            <div className="flex justify-center w-full overflow-x-auto pb-4 custom-scrollbar">
              {activityData.length > 0 && (
                <ActivityCalendar 
                  data={activityData} 
                  theme={{
                    light: ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'],
                    dark: ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'],
                  }}
                  colorScheme="dark"
                  labels={{
                    legend: {
                      less: 'Less',
                      more: 'More'
                    },
                    months: [
                      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
                    ],
                    weekdays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
                  }}
                />
              )}
            </div>
          </div>
"""

content = content.replace(
    "          {/* Recent Submissions */}",
    heatmap_jsx.strip() + "\n\n          {/* Recent Submissions */}"
)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Heatmap added to profile page")
