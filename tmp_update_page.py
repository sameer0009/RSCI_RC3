import os

file_path = r"d:\Apps\RSCI-RC3\frontend\src\app\problems\[slug]\page.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Add imports
content = content.replace(
    "import api from '@/lib/api';",
    "import api from '@/lib/api';\nimport { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';\nimport { Terminal, Play, CheckCircle, Settings, GripVertical, GripHorizontal } from 'lucide-react';"
)

# New return structure
old_return = content[content.find("  return ("):content.rfind("  );\n}") + 4]

new_return = """  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-dark-bg p-2 overflow-hidden">
      <PanelGroup direction="horizontal" className="flex-1 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-bg shadow-sm">
        {/* Left Panel - Problem Description */}
        <Panel defaultSize={45} minSize={30} className="bg-white dark:bg-dark-card flex flex-col">
          <div className="p-6 overflow-y-auto flex-1">
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
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Description</h3>
              <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap mb-6">{problem.description}</div>

              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Input Format</h3>
              <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap mb-6">{problem.inputFormat}</div>

              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Output Format</h3>
              <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap mb-6">{problem.outputFormat}</div>

              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Constraints</h3>
              <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap mb-6">{problem.constraints}</div>

              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Sample Test Cases</h3>
              {problem.testCases.filter(tc => tc.visibility === 'SAMPLE' || tc.isPublic).map((testCase, index) => (
                <div key={testCase.id} className="mb-4 p-4 bg-gray-50 dark:bg-[rgba(255,255,255,0.05)] rounded-lg border border-gray-100 dark:border-gray-800">
                  <div className="flex justify-between items-center mb-2">
                    <p className="font-semibold text-gray-900 dark:text-white">Example {index + 1}</p>
                    <span className="text-xs text-gray-600 dark:text-gray-400">{testCase.points} points</span>
                  </div>
                  <div className="mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Input:</span>
                    <pre className="mt-1 p-2 bg-white dark:bg-black/40 rounded text-sm font-mono">{testCase.input}</pre>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Output:</span>
                    <pre className="mt-1 p-2 bg-white dark:bg-black/40 rounded text-sm font-mono">{testCase.expectedOutput}</pre>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Panel>

        <PanelResizeHandle className="w-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-primary-500/50 transition-colors flex flex-col items-center justify-center cursor-col-resize group z-10">
          <GripVertical className="h-4 w-4 text-gray-400 group-hover:text-primary-500 transition-colors" />
        </PanelResizeHandle>

        {/* Right Panel - Code Editor */}
        <Panel defaultSize={55} minSize={30} className="flex flex-col bg-white dark:bg-[#1e1e1e]">
          <PanelGroup direction="vertical">
            <Panel defaultSize={showOutput ? 60 : 100} minSize={20} className="flex flex-col relative">
              
              {/* Editor Header */}
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
                  </select>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleRunCode}
                    disabled={running || submitting || testingSamples}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-gray-200 dark:bg-[#2d2d2d] text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-[#3d3d3d] disabled:opacity-50 transition-colors"
                  >
                    <Terminal size={14} />
                    {running ? 'Running...' : 'Run'}
                  </button>
                  <button
                    onClick={handleTestSamples}
                    disabled={running || submitting || testingSamples}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-gray-200 dark:bg-[#2d2d2d] text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-[#3d3d3d] disabled:opacity-50 transition-colors"
                  >
                    <Play size={14} className="text-green-500" />
                    {testingSamples ? 'Testing...' : 'Test'}
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={running || submitting || testingSamples}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 transition-colors"
                  >
                    <CheckCircle size={14} />
                    {submitting ? 'Submitting...' : 'Submit'}
                  </button>
                </div>
              </div>

              {/* Editor */}
              <div className="flex-1 w-full bg-[#1e1e1e]">
                <Editor
                  height="100%"
                  language={language}
                  value={code}
                  onChange={(value) => setCode(value || '')}
                  theme="vs-dark"
                  loading={<div className="flex h-full items-center justify-center text-gray-400">Loading editor...</div>}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: 'on',
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    padding: { top: 16, bottom: 16 },
                    fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
                    fontLigatures: true,
                    renderWhitespace: "selection",
                  }}
                />
              </div>
            </Panel>

            {/* Console / Output */}
            {showOutput && (
              <>
                <PanelResizeHandle className="h-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-primary-500/50 transition-colors flex items-center justify-center cursor-row-resize group z-10">
                  <GripHorizontal className="h-4 w-4 text-gray-400 group-hover:text-primary-500 transition-colors" />
                </PanelResizeHandle>
                
                <Panel defaultSize={40} minSize={10} className="flex flex-col bg-gray-50 dark:bg-[#1a1a1a]">
                  {/* Console Header/Tabs */}
                  <div className="flex border-b border-gray-200 dark:border-[#2d2d2d] bg-gray-100 dark:bg-[#1a1a1a]">
                    <button
                      onClick={() => setActiveTab('custom')}
                      className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === 'custom'
                          ? 'border-primary-500 text-primary-500 dark:text-primary-400'
                          : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                      }`}
                    >
                      Custom Run
                    </button>
                    <button
                      onClick={() => setActiveTab('samples')}
                      className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === 'samples'
                          ? 'border-primary-500 text-primary-500 dark:text-primary-400'
                          : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                      }`}
                    >
                      Sample Tests
                    </button>
                    <button
                      onClick={() => setActiveTab('submission')}
                      className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === 'submission'
                          ? 'border-primary-500 text-primary-500 dark:text-primary-400'
                          : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                      }`}
                    >
                      Submission
                    </button>
                    
                    <div className="flex-1"></div>
                    <button 
                      onClick={() => setShowOutput(false)}
                      className="px-3 py-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                      title="Close Output"
                    >
                      ×
                    </button>
                  </div>

                  {/* Console Content */}
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
                            {output || <span className="text-gray-400 dark:text-gray-600">No output yet. Run your code to see results.</span>}
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === 'samples' && (
                      <div className="space-y-4">
                        {sampleResults.length === 0 && !testingSamples && (
                          <div className="h-32 flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm border-2 border-dashed border-gray-200 dark:border-[#333] rounded-xl">
                            Click "Test" to evaluate your code against the samples.
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
                            className={`p-4 border rounded-xl overflow-hidden transition-colors ${
                              result.verdict === 'Accepted'
                                ? 'bg-green-50/50 border-green-200 dark:bg-green-900/10 dark:border-green-900/30'
                                : 'bg-red-50/50 border-red-200 dark:bg-red-900/10 dark:border-red-900/30'
                            }`}
                          >
                            <div className="flex justify-between items-center mb-3">
                              <span className="font-semibold text-gray-900 dark:text-white">
                                Example {index + 1}
                              </span>
                              <div className="flex items-center gap-3">
                                <span className={`text-sm font-bold tracking-wide ${getVerdictColor(result.verdict)}`}>
                                  {result.verdict.toUpperCase()}
                                </span>
                                <span className="px-2 py-1 bg-white/50 dark:bg-black/20 rounded text-xs text-gray-600 dark:text-gray-400 font-medium">
                                  {result.points}/{result.maxPoints} pts
                                </span>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              {/* Output Comparison */}
                              <div className="col-span-2">
                                {result.verdict !== 'Accepted' && result.output !== undefined && (
                                  <div className="mb-3">
                                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Your Output</span>
                                    <pre className="mt-1 p-2 bg-white dark:bg-black/40 rounded border border-red-100 dark:border-red-900/30 text-sm font-mono break-all whitespace-pre-wrap text-red-600 dark:text-red-400 font-medium">
                                      {result.output || '<Empty>'}
                                    </pre>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex gap-4 text-xs font-medium text-gray-500 dark:text-gray-400 mt-2 p-2 bg-white/50 dark:bg-black/20 rounded-md inline-flex">
                              <span className="flex items-center gap-1">⏱ {result.executionTime.toFixed(1)} ms</span>
                              <span className="flex items-center gap-1">💾 {(result.memoryUsed / 1024).toFixed(1)} MB</span>
                            </div>
                            
                            {result.errorMessage && (
                              <div className="mt-3">
                                <span className="text-xs font-medium text-red-600 dark:text-red-400">Error Detail</span>
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
                            <span className="font-semibold text-lg animate-pulse">Running full test suite...</span>
                          </div>
                        )}
                        {submissionResult && (
                          <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl border border-gray-200 dark:border-[#333] shadow-md overflow-hidden">
                            <div className={`p-6 border-b ${
                              submissionResult.verdict === 'Accepted'
                                ? 'bg-green-50 border-green-100 dark:bg-green-900/20 dark:border-green-900/30'
                                : 'bg-red-50 border-red-100 dark:bg-red-900/20 dark:border-red-900/30'
                            }`}>
                              <h2 className={`text-3xl font-black tracking-tight ${getVerdictColor(submissionResult.verdict)}`}>
                                {submissionResult.verdict}
                              </h2>
                              <p className="mt-1 text-sm font-medium text-gray-500 dark:text-gray-400">
                                Submitted just now
                              </p>
                            </div>
                            
                            <div className="p-6 grid grid-cols-3 gap-6 text-center">
                              <div className="flex flex-col p-4 bg-gray-50 dark:bg-black/20 rounded-xl">
                                <span className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Test Cases</span>
                                <span className="text-2xl font-black text-gray-900 dark:text-white">
                                  {submissionResult.testCasesPassed}<span className="text-gray-400 dark:text-gray-600 text-xl font-bold">/{submissionResult.totalTestCases}</span>
                                </span>
                              </div>
                              <div className="flex flex-col p-4 bg-gray-50 dark:bg-black/20 rounded-xl">
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
                              </div>
                            </div>

                            {submissionResult.error && (
                              <div className="mx-6 mb-6 p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-xl">
                                <span className="block text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400 mb-2">Error Log</span>
                                <pre className="text-xs text-red-700 dark:text-red-300 font-mono break-all whitespace-pre-wrap">
                                  {submissionResult.error}
                                </pre>
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
  );"""

content = content.replace(old_return, new_return)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Updated page.tsx")
