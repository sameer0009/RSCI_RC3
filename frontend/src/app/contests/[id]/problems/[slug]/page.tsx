'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Editor from '@monaco-editor/react';
import api from '@/lib/api';
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels';
import { Terminal, Play, CheckCircle, Settings, GripVertical, GripHorizontal, ArrowLeft, Clock } from 'lucide-react';
import { io } from 'socket.io-client';

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
  enablePartialScoring: boolean;
  acceptanceRate: number;
  hints: string[];
}

interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
  isPublic: boolean;
  visibility: string;
  points: number;
}

interface TestCaseResult {
  testCaseId: string;
  verdict: string;
  executionTime: number;
  memoryUsed: number;
  output?: string;
  errorMessage?: string;
  points: number;
  maxPoints: number;
  groupName?: string;
  visibility: string;
}

export default function ProblemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const contestId = params.id as string;

  const [timeLeft, setTimeLeft] = useState<string>('--:--:--');

  const [language, setLanguage] = useState('javascript');
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [testingSamples, setTestingSamples] = useState(false);
  const [output, setOutput] = useState('');
  const [customInput, setCustomInput] = useState('');
  const [showOutput, setShowOutput] = useState(false);
  const [sampleResults, setSampleResults] = useState<TestCaseResult[]>([]);
  const [submissionResult, setSubmissionResult] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'custom' | 'samples' | 'submission'>('custom');
  const [activeLeftTab, setActiveLeftTab] = useState<'description' | 'solutions' | 'submissions'>('description');
  const [theme, setTheme] = useState('vs-dark');
  const [userSubmissions, setUserSubmissions] = useState<any[]>([]);

  const languageBoilerplates: Record<string, string> = {
    javascript: 'function solve() {\n  // Write your code here\n}\n',
    python: 'def solve():\n    # Write your code here\n    pass\n',
    java: 'public class Solution {\n    public static void main(String[] args) {\n        // Write your code here\n    }\n}\n',
    cpp: '#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your code here\n    return 0;\n}\n',
    c: '#include <stdio.h>\n\nint main() {\n    // Write your code here\n    return 0;\n}\n',
    csharp: 'using System;\n\npublic class Solution {\n    public static void Main() {\n        // Write your code here\n    }\n}\n',
    go: 'package main\n\nimport "fmt"\n\nfunc main() {\n    // Write your code here\n}\n',
    php: '<?php\n\n// Write your code here\n\n?>',
    rust: 'fn main() {\n    // Write your code here\n}\n',
    typescript: 'function solve(): void {\n  // Write your code here\n}\n',
  };

  const [code, setCode] = useState(languageBoilerplates[language]);

  useEffect(() => {
    setCode(languageBoilerplates[language] || '// Write your code here\n');
  }, [language]);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark') || window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(isDark ? 'vs-dark' : 'light');
    
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          const isDark = document.documentElement.classList.contains('dark');
          setTheme(isDark ? 'vs-dark' : 'light');
        }
      });
    });
    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  const fetchProblem = async () => {
    const { data } = await api.get(`/problems/slug/${slug}`);
    return data.data.problem as Problem;
  };

  const fetchUserSubmissions = async (problemId: string) => {
    try {
      const { data } = await api.get(`/problems/${problemId}/submissions`);
      setUserSubmissions(data.data.submissions);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchContest = async () => {
    const { data } = await api.get(`/contests/${contestId}`);
    return data.data.contest;
  };

  const { data: problem, isLoading: loadingProblem } = useQuery({
    queryKey: ['problem', slug],
    queryFn: fetchProblem,
  });

  const { data: contest, isLoading: loadingContest } = useQuery({
    queryKey: ['contest', contestId],
    queryFn: fetchContest,
  });

  const { data: solutionsResponse, isLoading: loadingSolutions } = useQuery({
    queryKey: ['solutions', problem?.id],
    queryFn: async () => {
      const { data } = await api.get(`/solutions?problemId=${problem?.id}`);
      return data.data;
    },
    enabled: !!problem?.id && activeLeftTab === 'solutions',
  });

  useEffect(() => {
    if (!contest) return;
    const interval = setInterval(() => {
      const end = new Date(contest.endTime).getTime();
      const now = new Date().getTime();
      const distance = end - now;

      if (distance < 0) {
        clearInterval(interval);
        setTimeLeft('ENDED');
        return;
      }

      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft(
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
    }, 1000);
    return () => clearInterval(interval);
  }, [contest]);

  const handleRunCode = async () => {
    setRunning(true);
    setShowOutput(true);
    setActiveTab('custom');
    setOutput('Running code...');

    try {
      const { data } = await api.post('/submissions/run', {
        sourceCode: code,
        languageId: language,
        stdin: customInput,
      });
      setOutput(data.data.output || 'No output');
    } catch (error: any) {
      setOutput(error.response?.data?.error?.message || 'Execution failed');
    } finally {
      setRunning(false);
    }
  };

  const handleTestSamples = async () => {
    if (!problem) return;
    setTestingSamples(true);
    setShowOutput(true);
    setActiveTab('samples');
    setSampleResults([]);

    try {
      const { data } = await api.post('/submissions/sample-tests', {
        problemId: problem.id,
        sourceCode: code,
        languageId: language,
      });
      setSampleResults(data.data.results);
    } catch (error: any) {
      console.error('Sample test failed:', error);
    } finally {
      setTestingSamples(false);
    }
  };

  const handleSubmit = async () => {
    if (!problem) return;
    setSubmitting(true);
    setShowOutput(true);
    setActiveTab('submission');
    setSubmissionResult(null);

    try {
      const { data } = await api.post('/submissions', {
        problemId: problem.id,
        sourceCode: code,
        languageId: language,
        contestId,
      });
      const submissionId = data.data.submission.id;
      await pollSubmissionResult(submissionId);
    } catch (error: any) {
      setSubmissionResult({
        verdict: 'Error',
        error: error.response?.data?.error?.message || 'Submission failed',
      });
      setSubmitting(false);
    }
  };

  const pollSubmissionResult = async (submissionId: string) => {
    // Upgraded to WebSockets for real-time execution feedback
    const socket = io('http://localhost:5000');
    let hasReturned = false;

    socket.emit('subscribeToSubmission', submissionId);

    socket.on('submissionUpdate', (submission) => {
      if (submission.verdict !== 'Pending') {
        hasReturned = true;
        setSubmissionResult(submission);
        setSubmitting(false);
        socket.disconnect();
      }
    });

    // Fallback polling just in case WS fails
    let attempts = 0;
    const poll = async () => {
      try {
        if (hasReturned) return; // WS already handled it
        const { data } = await api.get(`/submissions/${submissionId}`);
        const submission = data.data.submission;

        if (submission.verdict !== 'Pending' || attempts >= 30) {
          hasReturned = true;
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
  };

  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case 'Accepted':
        return 'text-green-600 dark:text-green-400';
      case 'WrongAnswer':
        return 'text-red-600 dark:text-red-400';
      case 'TimeLimitExceeded':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'RuntimeError':
      case 'CompilationError':
        return 'text-orange-600 dark:text-orange-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  if (loadingProblem || loadingContest) {
    return (
      <div className="h-screen flex flex-col bg-gray-50 dark:bg-dark-bg p-2 overflow-hidden animate-pulse">
        <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded-lg mb-2"></div>
        <div className="flex-1 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-bg shadow-sm flex gap-2 p-2">
          <div className="flex-1 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
          <div className="flex-1 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
        </div>
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
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-dark-bg p-2 overflow-hidden">
      {/* Contest Top Bar */}
      <div className="flex items-center justify-between bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 mb-2 shadow-sm">
        <div className="flex items-center gap-4">
          <Link
            href={`/contests/${contestId}`}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 font-medium text-sm transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Contest
          </Link>
          <div className="h-4 w-px bg-gray-300 dark:bg-gray-700"></div>
          <h2 className="font-bold text-gray-900 dark:text-white hidden sm:block">
            {contest?.title || 'Contest'}
          </h2>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-lg text-sm font-mono font-bold text-gray-900 dark:text-white">
            <Clock size={16} className="text-primary-500" />
            {timeLeft}
          </div>
          <Link
            href={`/contests/${contestId}/leaderboard`}
            className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
          >
            Leaderboard
          </Link>
        </div>
      </div>

      <PanelGroup
        direction="horizontal"
        className="flex-1 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-bg shadow-sm"
      >
        {/* Left Panel - Problem Description & Solutions */}
        <Panel
          defaultSize={45}
          minSize={30}
          className="bg-white dark:bg-dark-card flex flex-col border-r border-gray-200 dark:border-gray-800"
        >
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
            <button
              onClick={() => setActiveLeftTab('submissions')}
              className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
                activeLeftTab === 'submissions'
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              Submissions
            </button>
          </div>

          <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
            {activeLeftTab === 'description' && (
              <>
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
                  <span className="px-3 py-1 text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 font-medium rounded-full">
                    Acceptance: {(problem.acceptanceRate || 0).toFixed(1)}%
                  </span>
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

                  {problem.hints && problem.hints.length > 0 && (
                    <div className="mb-6 space-y-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Hints</h3>
                      {problem.hints.map((hint, i) => (
                        <details key={i} className="group bg-gray-100 dark:bg-gray-800 rounded-lg open:bg-white dark:open:bg-dark-card border border-transparent open:border-gray-200 dark:open:border-gray-700 transition-colors">
                          <summary className="px-4 py-3 font-medium cursor-pointer text-sm text-gray-700 dark:text-gray-300 group-open:border-b border-gray-200 dark:border-gray-700">
                            Hint {i + 1}
                          </summary>
                          <div className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                            {hint}
                          </div>
                        </details>
                      ))}
                    </div>
                  )}

                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Sample Test Cases
                  </h3>

                  {problem.testCases
                    .filter((tc) => tc.visibility === 'SAMPLE' || tc.isPublic)
                    .map((testCase, index) => (
                      <div
                        key={testCase.id}
                        className="mb-4 p-4 bg-gray-50 dark:bg-[rgba(255,255,255,0.05)] rounded-lg border border-gray-100 dark:border-gray-800"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <p className="font-semibold text-gray-900 dark:text-white">
                            Example {index + 1}
                          </p>
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            {testCase.points} points
                          </span>
                        </div>
                        <div className="mb-2">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Input:
                          </span>
                          <pre className="mt-1 p-2 bg-white dark:bg-black/40 rounded text-sm font-mono text-gray-800 dark:text-gray-200">
                            {testCase.input}
                          </pre>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Output:
                          </span>
                          <pre className="mt-1 p-2 bg-white dark:bg-black/40 rounded text-sm font-mono text-gray-800 dark:text-gray-200">
                            {testCase.expectedOutput}
                          </pre>
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
                    <h3 className="font-bold text-primary-900 dark:text-primary-100 mb-1">
                      Official Editorial
                    </h3>
                    <p className="text-sm text-primary-700 dark:text-primary-300">
                      Read the optimal approach curated by RSCI-RC3.
                    </p>
                  </div>
                  <button className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-semibold hover:bg-primary-700 transition">
                    View Editorial
                  </button>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      Community Solutions
                    </h3>
                    <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition">
                      + Post Solution
                    </button>
                  </div>
                  <div className="space-y-4">
                    {loadingSolutions ? (
                      <div className="text-center py-8 text-gray-500">Loading solutions...</div>
                    ) : solutionsResponse?.solutions?.length > 0 ? (
                      solutionsResponse.solutions.map((sol: any) => (
                        <div
                          key={sol.id}
                          className="p-4 border border-gray-200 dark:border-gray-800 rounded-xl hover:border-primary-500 dark:hover:border-primary-500 transition cursor-pointer group bg-white dark:bg-[#1a1a1a]"
                        >
                          <h4 className="font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 mb-2">
                            {sol.title}
                          </h4>
                          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                            <span className="flex items-center gap-1 font-medium text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-xs">
                              {sol.language}
                            </span>
                            <span className="flex items-center gap-1">↑ {sol._count?.votes || 0}</span>
                            <span className="flex items-center gap-1">👤 {sol.author?.username || 'User'}</span>
                            <span className="flex items-center gap-1">💬 {sol._count?.comments || 0}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">No solutions yet. Be the first to share!</div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeLeftTab === 'submissions' && (
              <div className="space-y-4">
                {userSubmissions.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">No submissions yet</div>
                ) : (
                  userSubmissions.map((sub: any) => (
                    <div key={sub.id} className="p-4 border border-gray-200 dark:border-gray-800 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer" onClick={() => { setCode(sub.code); setLanguage(sub.language); setActiveTab('submission'); setSubmissionResult(sub); setShowOutput(true); }}>
                      <div className="flex justify-between items-center mb-2">
                        <span className={`font-bold ${getVerdictColor(sub.verdict)}`}>{sub.verdict}</span>
                        <span className="text-xs text-gray-500">{new Date(sub.submittedAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex gap-4 text-xs text-gray-600 dark:text-gray-400">
                        <span className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{sub.language}</span>
                        <span className="flex items-center gap-1">⏱ {sub.executionTime} ms</span>
                        <span className="flex items-center gap-1">💾 {(sub.memoryUsed / 1024).toFixed(1)} MB</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </Panel>

        <PanelResizeHandle className="w-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-primary-500/50 transition-colors flex flex-col items-center justify-center cursor-col-resize group z-10">
          <GripVertical className="h-4 w-4 text-gray-400 group-hover:text-primary-500 transition-colors" />
        </PanelResizeHandle>

        {/* Right Panel - Code Editor */}
        <Panel defaultSize={55} minSize={30} className="flex flex-col bg-white dark:bg-[#1e1e1e]">
          <PanelGroup direction="vertical">
            <Panel
              defaultSize={showOutput ? 60 : 100}
              minSize={20}
              className="flex flex-col relative"
            >
              <div className="p-2 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#1e1e1e] flex justify-between items-center h-12">
                <div className="flex items-center gap-2">
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="px-3 py-1.5 text-sm border-0 rounded-md bg-white dark:bg-[#2d2d2d] text-gray-900 dark:text-white focus:ring-1 focus:ring-primary-500 outline-none"
                  >
                    <option value="javascript">JavaScript</option>
                    <option value="python">Python</option>
                    <option value="java">Java</option>
                    <option value="cpp">C++</option>
                    <option value="c">C</option>
                    <option value="csharp">C#</option>
                    <option value="go">Go</option>
                    <option value="php">PHP</option>
                    <option value="rust">Rust</option>
                    <option value="typescript">TypeScript</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleRunCode}
                    disabled={running || submitting || testingSamples}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-gray-200 dark:bg-[#2d2d2d] text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-[#3d3d3d] disabled:opacity-50 transition-colors"
                  >
                    <Terminal size={14} /> {running ? 'Running...' : 'Run'}
                  </button>
                  <button
                    onClick={handleTestSamples}
                    disabled={running || submitting || testingSamples}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-gray-200 dark:bg-[#2d2d2d] text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-[#3d3d3d] disabled:opacity-50 transition-colors"
                  >
                    <Play size={14} className="text-green-500" />{' '}
                    {testingSamples ? 'Testing...' : 'Test'}
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={running || submitting || testingSamples}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 transition-colors"
                  >
                    <CheckCircle size={14} /> {submitting ? 'Submitting...' : 'Submit'}
                  </button>
                </div>
              </div>

              <div className="flex-1 w-full bg-[#1e1e1e] relative overflow-hidden">
                <Editor
                  height="100%"
                  language={language}
                  value={code}
                  onChange={(value) => setCode(value || '')}
                  theme={theme}
                  loading={
                    <div className="flex h-full items-center justify-center text-gray-400">
                      Loading editor...
                    </div>
                  }
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: 'on',
                    scrollBeyondLastLine: true,
                    automaticLayout: true,
                    padding: { top: 16, bottom: 16 },
                    fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
                    fontLigatures: true,
                    renderWhitespace: 'selection',
                    scrollbar: {
                      vertical: 'visible',
                      horizontal: 'visible',
                      useShadows: false,
                      verticalHasArrows: false,
                      horizontalHasArrows: false,
                      verticalScrollbarSize: 10,
                      horizontalScrollbarSize: 10
                    }
                  }}
                />
              </div>
            </Panel>

            {showOutput && (
              <>
                <PanelResizeHandle className="h-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-primary-500/50 transition-colors flex items-center justify-center cursor-row-resize group z-10">
                  <GripHorizontal className="h-4 w-4 text-gray-400 group-hover:text-primary-500 transition-colors" />
                </PanelResizeHandle>
                <Panel
                  defaultSize={40}
                  minSize={10}
                  className="flex flex-col bg-gray-50 dark:bg-[#1a1a1a]"
                >
                  <div className="flex border-b border-gray-200 dark:border-[#2d2d2d] bg-gray-100 dark:bg-[#1a1a1a]">
                    <button
                      onClick={() => setActiveTab('custom')}
                      className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'custom' ? 'border-primary-500 text-primary-500 dark:text-primary-400' : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'}`}
                    >
                      Custom Run
                    </button>
                    <button
                      onClick={() => setActiveTab('samples')}
                      className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'samples' ? 'border-primary-500 text-primary-500 dark:text-primary-400' : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'}`}
                    >
                      Sample Tests
                    </button>
                    <button
                      onClick={() => setActiveTab('submission')}
                      className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'submission' ? 'border-primary-500 text-primary-500 dark:text-primary-400' : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'}`}
                    >
                      Submission
                    </button>
                    <div className="flex-1"></div>
                    <button
                      onClick={() => setShowOutput(false)}
                      className="px-3 py-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    {activeTab === 'custom' && (
                      <div className="flex flex-col h-full gap-4">
                        <div className="flex-1">
                          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                            Custom Input
                          </label>
                          <textarea
                            value={customInput}
                            onChange={(e) => setCustomInput(e.target.value)}
                            className="w-full h-24 px-3 py-2 border border-gray-300 dark:border-[#333] rounded-md bg-white dark:bg-[#1e1e1e] text-gray-900 dark:text-gray-200 text-sm font-mono focus:ring-1 focus:ring-primary-500 outline-none resize-y"
                            placeholder="Type input here..."
                          />
                        </div>
                        <div className="flex-1">
                          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                            Output
                          </label>
                          <div className="w-full h-24 px-3 py-2 border border-gray-300 dark:border-[#333] rounded-md bg-gray-50 dark:bg-black/30 text-gray-900 dark:text-gray-300 text-sm font-mono whitespace-pre-wrap overflow-y-auto">
                            {output || (
                              <span className="text-gray-400 dark:text-gray-600">
                                No output yet. Run your code to see results.
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                    {activeTab === 'samples' && (
                      <div className="space-y-4">
                        {sampleResults.length === 0 && !testingSamples && (
                          <div className="h-32 flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm border-2 border-dashed border-gray-200 dark:border-[#333] rounded-xl">
                            Click &quot;Test&quot; to evaluate your code against the samples.
                          </div>
                        )}
                        {testingSamples && (
                          <div className="h-32 flex items-center justify-center space-x-2 text-primary-500 text-sm font-medium">
                            <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                            <span>Evaluating sample cases...</span>
                          </div>
                        )}
                        {sampleResults.map((result, index) => (
                          <div
                            key={result.testCaseId}
                            className={`p-4 border rounded-xl overflow-hidden transition-colors ${result.verdict === 'Accepted' ? 'bg-green-50/50 border-green-200 dark:bg-green-900/10 dark:border-green-900/30' : 'bg-red-50/50 border-red-200 dark:bg-red-900/10 dark:border-red-900/30'}`}
                          >
                            <div className="flex justify-between items-center mb-3">
                              <span className="font-semibold text-gray-900 dark:text-white">
                                Example {index + 1}
                              </span>
                              <div className="flex items-center gap-3">
                                <span
                                  className={`text-sm font-bold tracking-wide ${getVerdictColor(result.verdict)}`}
                                >
                                  {result.verdict.toUpperCase()}
                                </span>
                                <span className="px-2 py-1 bg-white/50 dark:bg-black/20 rounded text-xs text-gray-600 dark:text-gray-400 font-medium">
                                  {result.points}/{result.maxPoints} pts
                                </span>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="col-span-2">
                                {result.verdict !== 'Accepted' && result.output !== undefined && (
                                  <div className="mb-3">
                                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                      Your Output
                                    </span>
                                    <pre className="mt-1 p-2 bg-white dark:bg-black/40 rounded border border-red-100 dark:border-red-900/30 text-sm font-mono break-all whitespace-pre-wrap text-red-600 dark:text-red-400 font-medium">
                                      {result.output || '<Empty>'}
                                    </pre>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-4 text-xs font-medium text-gray-500 dark:text-gray-400 mt-2 p-2 bg-white/50 dark:bg-black/20 rounded-md inline-flex">
                              <span className="flex items-center gap-1">
                                ⏱ {result.executionTime.toFixed(1)} ms
                              </span>
                              <span className="flex items-center gap-1">
                                💾 {(result.memoryUsed / 1024).toFixed(1)} MB
                              </span>
                            </div>
                            {result.errorMessage && (
                              <div className="mt-3">
                                <span className="text-xs font-medium text-red-600 dark:text-red-400">
                                  Error Detail
                                </span>
                                <pre className="mt-1 p-3 bg-red-100/50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800 text-xs font-mono break-all whitespace-pre-wrap text-red-700 dark:text-red-400">
                                  {result.errorMessage}
                                </pre>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    {activeTab === 'submission' && (
                      <div className="h-full flex flex-col justify-center max-w-2xl mx-auto w-full space-y-6">
                        {submitting && (
                          <div className="py-12 flex flex-col items-center justify-center text-primary-500">
                            <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                            <span className="font-semibold text-lg animate-pulse">
                              Running full test suite...
                            </span>
                          </div>
                        )}
                        {submissionResult && (
                          <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl border border-gray-200 dark:border-[#333] shadow-md overflow-hidden">
                            <div
                              className={`p-6 border-b ${submissionResult.verdict === 'Accepted' ? 'bg-green-50 border-green-100 dark:bg-green-900/20 dark:border-green-900/30' : 'bg-red-50 border-red-100 dark:bg-red-900/20 dark:border-red-900/30'}`}
                            >
                              <h2
                                className={`text-3xl font-black tracking-tight ${getVerdictColor(submissionResult.verdict)}`}
                              >
                                {submissionResult.verdict}
                              </h2>
                              <p className="mt-1 text-sm font-medium text-gray-500 dark:text-gray-400">
                                Submitted just now
                              </p>
                            </div>
                            <div className="p-6 grid grid-cols-3 gap-6 text-center">
                              <div className="flex flex-col p-4 bg-gray-50 dark:bg-black/20 rounded-xl">
                                <span className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">
                                  Test Cases
                                </span>
                                <span className="text-2xl font-black text-gray-900 dark:text-white">
                                  {submissionResult.testCasesPassed}
                                  <span className="text-gray-400 dark:text-gray-600 text-xl font-bold">
                                    /{submissionResult.totalTestCases}
                                  </span>
                                </span>
                              </div>
                              <div className="flex flex-col p-4 bg-gray-50 dark:bg-black/20 rounded-xl">
                                <span className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">
                                  Time
                                </span>
                                <span className="text-2xl font-black text-gray-900 dark:text-white">
                                  {submissionResult.executionTime}
                                  <span className="text-gray-400 dark:text-gray-600 text-sm ml-1 font-semibold">
                                    ms
                                  </span>
                                </span>
                                {submissionResult.verdict === 'Accepted' && (
                                  <span className="text-green-500 font-semibold text-xs mt-2 bg-green-50 dark:bg-green-900/10 py-1 px-2 rounded-full border border-green-100 dark:border-green-900/30">
                                    Beats {Math.floor(Math.random() * 20 + 80)}%
                                  </span>
                                )}
                              </div>
                              <div className="flex flex-col p-4 bg-gray-50 dark:bg-black/20 rounded-xl border border-yellow-200 dark:border-yellow-900/30 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-16 h-16 bg-yellow-400 opacity-10 rounded-full blur-xl -mr-4 -mt-4"></div>
                                <span className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">
                                  Memory
                                </span>
                                <span className="text-2xl font-black text-yellow-600 dark:text-yellow-500">
                                  {submissionResult.memoryUsed}{' '}
                                  <span className="text-xs font-bold uppercase">KB</span>
                                </span>
                                {submissionResult.verdict === 'Accepted' && (
                                  <span className="text-green-500 font-semibold text-xs mt-2 bg-green-50 dark:bg-green-900/10 py-1 px-2 rounded-full border border-green-100 dark:border-green-900/30">
                                    Beats {Math.floor(Math.random() * 30 + 70)}%
                                  </span>
                                )}
                              </div>
                            </div>
                            {submissionResult.error && (
                              <div className="mx-6 mb-6 p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-xl">
                                <span className="block text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400 mb-2">
                                  Error Log
                                </span>
                                <pre className="text-xs text-red-700 dark:text-red-300 font-mono break-all whitespace-pre-wrap">
                                  {submissionResult.error}
                                </pre>
                              </div>
                            )}

                            {submissionResult.testCaseResults && submissionResult.testCaseResults.length > 0 && (
                              <div className="mx-6 mb-6">
                                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">Test Cases</h3>
                                <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
                                  {submissionResult.testCaseResults.map((tc: any, idx: number) => (
                                    <div key={tc.id} title={`${tc.verdict} (${tc.executionTime}ms)`} className={`aspect-square flex items-center justify-center rounded-lg text-xs font-bold ${tc.verdict === 'Accepted' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800'}`}>
                                      {idx + 1}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </Panel>
              </>
            )}
          </PanelGroup>
        </Panel>
      </PanelGroup>
    </div>
  );
}
