'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Editor from '@monaco-editor/react';
import api from '@/lib/api';

interface Problem {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  topics: string[];
  inputFormat: string;
  outputFormat: string;
  constraints: string;
  testCases: TestCase[];
}

interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
  isPublic: boolean;
}

export default function ProblemDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [problem, setProblem] = useState<Problem | null>(null);
  const [code, setCode] = useState('// Write your solution here\n');
  const [language, setLanguage] = useState('javascript');
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [output, setOutput] = useState('');
  const [customInput, setCustomInput] = useState('');
  const [showOutput, setShowOutput] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<any>(null);

  useEffect(() => {
    fetchProblem();
  }, [slug]);

  const fetchProblem = async () => {
    try {
      const { data } = await api.get(`/problems/slug/${slug}`);
      setProblem(data.data.problem);
    } catch (error) {
      console.error('Failed to fetch problem:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRunCode = async () => {
    setRunning(true);
    setShowOutput(true);
    setOutput('Running code...');
    
    try {
      const { data } = await api.post('/submissions/run', {
        code,
        language,
        input: customInput,
      });
      
      setOutput(data.data.output || 'No output');
    } catch (error: any) {
      setOutput(error.response?.data?.error?.message || 'Execution failed');
    } finally {
      setRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (!problem) return;
    
    setSubmitting(true);
    setShowOutput(true);
    setOutput('Submitting and evaluating...');
    
    try {
      const { data } = await api.post('/submissions', {
        problemId: problem.id,
        code,
        language,
      });
      
      // Poll for result
      const submissionId = data.data.submission.id;
      await pollSubmissionResult(submissionId);
    } catch (error: any) {
      setOutput(error.response?.data?.error?.message || 'Submission failed');
      setSubmitting(false);
    }
  };

  const pollSubmissionResult = async (submissionId: string) => {
    let attempts = 0;
    const maxAttempts = 20;
    
    const poll = async () => {
      try {
        const { data } = await api.get(`/submissions/${submissionId}`);
        const submission = data.data.submission;
        
        if (submission.verdict !== 'Pending' || attempts >= maxAttempts) {
          setSubmissionResult(submission);
          setOutput(
            `Verdict: ${submission.verdict}\n` +
            `Test Cases: ${submission.testCasesPassed}/${submission.totalTestCases}\n` +
            `Execution Time: ${submission.executionTime}ms\n` +
            `Memory: ${submission.memoryUsed}KB\n` +
            `Points: ${submission.points}`
          );
          setSubmitting(false);
          return;
        }
        
        attempts++;
        setTimeout(poll, 1000);
      } catch (error) {
        setOutput('Failed to fetch submission result');
        setSubmitting(false);
      }
    };
    
    poll();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-bg">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-bg">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Problem not found</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-dark-bg">
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Problem Description */}
        <div className="w-1/2 overflow-y-auto border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-card">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {problem.title}
            </h1>

            <div className="flex gap-2 mb-6">
              <span
                className={`px-3 py-1 text-xs font-semibold rounded-full ${
                  problem.difficulty === 'Easy'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                    : problem.difficulty === 'Medium'
                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                    : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                }`}
              >
                {problem.difficulty}
              </span>
              {problem.topics.map((topic) => (
                <span
                  key={topic}
                  className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full"
                >
                  {topic}
                </span>
              ))}
            </div>

            <div className="prose dark:prose-invert max-w-none">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Description
              </h3>
              <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap mb-6">
                {problem.description}
              </div>

              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Input Format
              </h3>
              <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap mb-6">
                {problem.inputFormat}
              </div>

              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Output Format
              </h3>
              <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap mb-6">
                {problem.outputFormat}
              </div>

              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Constraints
              </h3>
              <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap mb-6">
                {problem.constraints}
              </div>

              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Sample Test Cases
              </h3>
              {problem.testCases.map((testCase, index) => (
                <div key={testCase.id} className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="font-semibold text-gray-900 dark:text-white mb-2">
                    Example {index + 1}:
                  </p>
                  <div className="mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Input:
                    </span>
                    <pre className="mt-1 p-2 bg-white dark:bg-gray-900 rounded text-sm">
                      {testCase.input}
                    </pre>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Output:
                    </span>
                    <pre className="mt-1 p-2 bg-white dark:bg-gray-900 rounded text-sm">
                      {testCase.expectedOutput}
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel - Code Editor */}
        <div className="w-1/2 flex flex-col bg-white dark:bg-dark-card">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-card text-gray-900 dark:text-white"
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
              <option value="c">C</option>
              <option value="csharp">C#</option>
              <option value="go">Go</option>
              <option value="php">PHP</option>
            </select>

            <div className="flex gap-2">
              <button
                onClick={handleRunCode}
                disabled={running || submitting}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {running ? 'Running...' : 'Run Code'}
              </button>
              <button
                onClick={handleSubmit}
                disabled={running || submitting}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </div>

          <div className="flex-1 flex flex-col">
            <div className="flex-1">
              <Editor
                height="100%"
                language={language}
                value={code}
                onChange={(value) => setCode(value || '')}
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: 'on',
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                }}
              />
            </div>

            {/* Custom Input & Output Section */}
            {showOutput && (
              <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900">
                <div className="mb-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Custom Input (optional)
                  </label>
                  <textarea
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-dark-card text-gray-900 dark:text-white text-sm font-mono"
                    placeholder="Enter custom input..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Output
                  </label>
                  <pre className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-dark-card text-gray-900 dark:text-white text-sm font-mono whitespace-pre-wrap max-h-40 overflow-y-auto">
                    {output}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
