import os

file_path = r"d:\Apps\RSCI-RC3\frontend\src\app\problems\[slug]\page.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Add socket.io import
content = content.replace(
    "import api from '@/lib/api';",
    "import api from '@/lib/api';\nimport { io } from 'socket.io-client';"
)

poll_logic = """  const pollSubmissionResult = async (submissionId: string) => {
    let attempts = 0;
    const maxAttempts = 30;
    
    const poll = async () => {
      try {
        const { data } = await api.get(`/submissions/${submissionId}`);
        const submission = data.data.submission;
        
        if (submission.verdict !== 'Pending' || attempts >= maxAttempts) {
          setSubmissionResult(submission);
          setSubmitting(false);
          return;
        }
        
        attempts++;
        setTimeout(poll, 1000);
      } catch (error) {
        setSubmissionResult({
          verdict: 'Error',
          error: 'Failed to fetch submission result',
        });
        setSubmitting(false);
      }
    };
    
    poll();
  };"""

ws_logic = """  const pollSubmissionResult = async (submissionId: string) => {
    // Upgraded to WebSockets for real-time execution feedback
    const socket = io('http://localhost:5000');
    
    socket.emit('subscribeToSubmission', submissionId);
    
    socket.on('submissionUpdate', (submission) => {
      if (submission.verdict !== 'Pending') {
        setSubmissionResult(submission);
        setSubmitting(false);
        socket.disconnect();
      }
    });

    // Fallback polling just in case WS fails
    let attempts = 0;
    const poll = async () => {
      try {
        if (!submitting) return; // WS already handled it
        const { data } = await api.get(`/submissions/${submissionId}`);
        const submission = data.data.submission;
        
        if (submission.verdict !== 'Pending' || attempts >= 30) {
          setSubmissionResult(submission);
          setSubmitting(false);
          socket.disconnect();
          return;
        }
        attempts++;
        setTimeout(poll, 2000); // Slower fallback
      } catch (error) {
        console.error('Polling fallback error', error);
      }
    };
    setTimeout(poll, 2000);
  };"""

content = content.replace(poll_logic.strip(), ws_logic.strip())

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("WebSockets logic added to submission evaluation")
