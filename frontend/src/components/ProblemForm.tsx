import { useState, FormEvent } from 'react';

export interface TestCase {
  input: string;
  expectedOutput: string;
  isPublic: boolean;
  points: number;
}

export interface ProblemFormData {
  title: string;
  description: string;
  inputFormat: string;
  outputFormat: string;
  constraints: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  topics: string;
  timeLimit: number;
  memoryLimit: number;
  isGlobal: boolean;
}

interface ProblemFormProps {
  initialData?: Partial<ProblemFormData>;
  initialTestCases?: TestCase[];
  onSubmit: (data: ProblemFormData, testCases: TestCase[]) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
  submitButtonText?: string;
  showIsGlobalToggle?: boolean;
}

export default function ProblemForm({
  initialData,
  initialTestCases,
  onSubmit,
  onCancel,
  loading,
  submitButtonText = 'Submit',
  showIsGlobalToggle = true,
}: ProblemFormProps) {
  const [formData, setFormData] = useState<ProblemFormData>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    inputFormat: initialData?.inputFormat || '',
    outputFormat: initialData?.outputFormat || '',
    constraints: initialData?.constraints || '',
    difficulty: initialData?.difficulty || 'Easy',
    topics: initialData?.topics || '',
    timeLimit: initialData?.timeLimit || 2000,
    memoryLimit: initialData?.memoryLimit || 256,
    isGlobal: initialData?.isGlobal !== undefined ? initialData.isGlobal : true,
  });

  const [testCases, setTestCases] = useState<TestCase[]>(
    initialTestCases || [{ input: '', expectedOutput: '', isPublic: true, points: 10 }]
  );

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await onSubmit(formData, testCases);
  };

  const addTestCase = () => {
    setTestCases([...testCases, { input: '', expectedOutput: '', isPublic: false, points: 10 }]);
  };

  const removeTestCase = (index: number) => {
    setTestCases(testCases.filter((_, i) => i !== index));
  };

  const updateTestCase = (index: number, field: keyof TestCase, value: string | boolean | number) => {
    const updated = [...testCases];
    updated[index] = { ...updated[index], [field]: value };
    setTestCases(updated);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section aria-labelledby="author-guide-title" className="rounded-xl border border-primary-200 bg-primary-50 p-5 sm:p-6 dark:border-primary-800 dark:bg-primary-950/30">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-primary-700 dark:text-primary-300">Instructor guide</p>
        <h2 id="author-guide-title" className="text-xl font-semibold text-gray-900 dark:text-white">Turn a learning objective into a coding problem</h2>
        <p className="mt-2 text-sm leading-6 text-gray-700 dark:text-gray-300">Students read your instructions, write a program, and submit it. The judge runs their program with your test inputs and compares its output with the answers you provide. Fields marked * are required.</p>
        <ol className="mt-4 grid gap-4 text-sm sm:grid-cols-3">
          {[
            ['1. Explain the task', 'Describe what students must calculate and exactly how they should read and print data.'],
            ['2. Check the answers', 'Add a visible sample, then hidden tests for ordinary values and boundary cases.'],
            ['3. Review and create', 'Check visibility and expected answers. After creation, try a known correct solution before sharing.'],
          ].map(([title, text]) => <li key={title}><h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3><p className="mt-1 leading-6 text-gray-700 dark:text-gray-300">{text}</p></li>)}
        </ol>
        <details className="mt-4 border-t border-primary-200 pt-3 dark:border-primary-800">
          <summary className="cursor-pointer rounded py-2 text-sm font-semibold text-primary-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 dark:text-primary-200">See a complete example: Add Two Numbers</summary>
          <div className="mt-3 space-y-3 text-sm leading-6 text-gray-700 dark:text-gray-300">
            <p>This example is a reference only; it does not fill in or save your form.</p>
            <dl className="grid gap-3 sm:grid-cols-2">
              {[
                ['Title', 'Add Two Numbers'], ['Description', 'Given two integers a and b, calculate and print their sum.'],
                ['Difficulty and topics', 'Easy · math, basic-input-output'], ['Input format', 'One line containing two space-separated integers a and b.'],
                ['Output format', 'Print one integer: the sum of a and b.'], ['Constraints', '-1,000,000 ≤ a, b ≤ 1,000,000.'],
              ].map(([label, text]) => <div key={label}><dt className="font-semibold text-gray-900 dark:text-white">{label}</dt><dd>{text}</dd></div>)}
            </dl>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-primary-200 bg-white p-3 dark:border-primary-800 dark:bg-dark-card"><h3 className="font-semibold">Public sample</h3><p>Input: <code className="font-mono">2 3</code></p><p>Expected output: <code className="font-mono">5</code></p></div>
              <div className="rounded-lg border border-primary-200 bg-white p-3 dark:border-primary-800 dark:bg-dark-card"><h3 className="font-semibold">Hidden check</h3><p>Input: <code className="font-mono">-7 12</code></p><p>Expected output: <code className="font-mono">5</code></p></div>
            </div>
            <p>Also test zero, negative numbers, and the largest allowed values. Enter only the actual input and answer in each test case, without labels such as “Input:” or “Output:”.</p>
          </div>
        </details>
      </section>

      <div className="bg-white dark:bg-dark-card rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Basic Information</h2>

        <div className="space-y-4">
          <div>
            <label htmlFor="problem-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Title *
            </label>
            <input
              type="text"
              required
              id="problem-title"
              aria-describedby="problem-title-help"
              placeholder="e.g. Add Two Numbers"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
            <p id="problem-title-help" className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-400">Choose a short, specific name that tells students what the task is.</p>
          </div>

          <div>
            <label htmlFor="problem-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description *
            </label>
            <textarea
              required
              rows={6}
              id="problem-description"
              aria-describedby="problem-description-help"
              placeholder="Given two integers a and b, calculate and print their sum."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
            <p id="problem-description-help" className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-400">Explain the goal, what is given, and what students must produce. Keep the solution and hidden test answers out of the statement.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="problem-difficulty" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Difficulty *
            </label>
              <select
                id="problem-difficulty"
              aria-describedby="problem-difficulty-help"
              value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            <p id="problem-difficulty-help" className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-400">Match your students’ level: Easy for basic concepts, Medium for combining ideas, Hard for advanced reasoning.</p>
            </div>

            <div>
              <label htmlFor="problem-topics" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Topics (comma-separated)
            </label>
              <input
                type="text"
                id="problem-topics"
              aria-describedby="problem-topics-help"
              value={formData.topics}
                onChange={(e) => setFormData({ ...formData, topics: e.target.value })}
                placeholder="arrays, strings, dynamic-programming"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            <p id="problem-topics-help" className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-400">Add the concepts being assessed, separated by commas, so students can find relevant practice.</p>
            </div>
          </div>

          <div>
            <label htmlFor="problem-inputFormat" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Input Format *
            </label>
            <textarea
              required
              rows={3}
              id="problem-inputFormat"
              aria-describedby="problem-inputFormat-help"
              placeholder="One line containing two space-separated integers a and b."
              value={formData.inputFormat}
              onChange={(e) => setFormData({ ...formData, inputFormat: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
            <p id="problem-inputFormat-help" className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-400">Describe the data types, order, spacing, and number of lines the program receives. This is the input structure, not one test case.</p>
          </div>

          <div>
            <label htmlFor="problem-outputFormat" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Output Format *
            </label>
            <textarea
              required
              rows={3}
              id="problem-outputFormat"
              aria-describedby="problem-outputFormat-help"
              placeholder="Print one integer: the sum of a and b."
              value={formData.outputFormat}
              onChange={(e) => setFormData({ ...formData, outputFormat: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
            <p id="problem-outputFormat-help" className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-400">State exactly what the program should print, including spaces and line breaks. Avoid asking for extra prompts or labels unless they are part of the answer.</p>
          </div>

          <div>
            <label htmlFor="problem-constraints" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Constraints *
            </label>
            <textarea
              required
              rows={3}
              id="problem-constraints"
              aria-describedby="problem-constraints-help"
              placeholder="-1,000,000 <= a, b <= 1,000,000"
              value={formData.constraints}
              onChange={(e) => setFormData({ ...formData, constraints: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
            <p id="problem-constraints-help" className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-400">Set valid input ranges and sizes. Mention whether zero, negative values, or duplicates are allowed; use these limits to design your hidden tests.</p>
          </div>
          
          {showIsGlobalToggle && (
            <div className="space-y-2 pt-2">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  aria-describedby="problem-visibility-help"
                  checked={formData.isGlobal}
                  onChange={(e) => setFormData({ ...formData, isGlobal: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Global Problem (visible in public problem bank)
                </span>
              </label>
              <p id="problem-visibility-help" className="text-sm leading-6 text-gray-600 dark:text-gray-400">Checked: the problem appears in the public practice bank. Unchecked: it stays out of that bank; access depends on the classroom or contest where you use it. Use private problems for assessments you have not released.</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-dark-card rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Test Cases</h2>
          <button
            type="button"
            onClick={addTestCase}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            + Add Test Case
          </button>
        </div>

        <p className="mb-4 text-sm leading-6 text-gray-600 dark:text-gray-400">A test case is one program run: you supply its input and the correct output. Add at least one completed test case so the judge can evaluate submissions. Include a public sample and hidden cases for typical inputs and boundary values.</p>
        <div className="space-y-4">
          {testCases.map((tc, index) => (
            <div key={index} className="border border-gray-300 dark:border-gray-600 rounded-lg p-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-medium text-gray-900 dark:text-white">Test Case {index + 1}</h3>
                {testCases.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeTestCase(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="space-y-3">
                <div>
                  <label htmlFor={`test-${index}-input`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Input
                  </label>
                  <textarea
                    rows={3}
                    id={`test-${index}-input`}
                    aria-describedby={`test-${index}-input-help`}
                    placeholder="2 3"
                    value={tc.input}
                    onChange={(e) => updateTestCase(index, 'input', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm"
                  />
                  <p id={`test-${index}-input-help`} className="mt-1 text-sm leading-6 text-gray-600 dark:text-gray-400">Enter the exact data sent to the program. Preserve spaces and line breaks. Leave this blank only for a program that needs no input.</p>
                </div>

                <div>
                  <label htmlFor={`test-${index}-expectedOutput`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Expected Output
                  </label>
                  <textarea
                    rows={3}
                    id={`test-${index}-expectedOutput`}
                    aria-describedby={`test-${index}-expectedOutput-help`}
                    placeholder="5"
                    value={tc.expectedOutput}
                    onChange={(e) => updateTestCase(index, 'expectedOutput', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm"
                  />
                  <p id={`test-${index}-expectedOutput-help`} className="mt-1 text-sm leading-6 text-gray-600 dark:text-gray-400">Enter the exact correct answer for this input. Check it with a reference solution; do not include explanations or extra prompts.</p>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      aria-describedby={`test-${index}-visibility-help`}
                      checked={tc.isPublic}
                      onChange={(e) => updateTestCase(index, 'isPublic', e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Public (visible to users)
                    </span>
                  </label>

                  <div className="flex items-center gap-2">
                    <label htmlFor={`test-${index}-points`} className="text-sm text-gray-700 dark:text-gray-300">Points:</label>
                    <input
                      type="number"
                      id={`test-${index}-points`}
                      aria-describedby="test-points-help"
                      value={tc.points}
                      onChange={(e) => updateTestCase(index, 'points', parseInt(e.target.value) || 10)}
                      className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
                <p id={`test-${index}-visibility-help`} className="text-sm leading-6 text-gray-600 dark:text-gray-400">{tc.isPublic ? 'Public sample: students can see this input and expected output. It also counts during grading.' : 'Hidden test: students cannot see its input or expected output. Use it to check correctness beyond the samples.'}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <p id="test-points-help" className="text-sm leading-6 text-gray-600 dark:text-gray-400">Test-case points determine relative weights when partial scoring is enabled. By default, all scoring tests must pass to earn a score; changing points alone does not enable partial credit.</p>
      <aside aria-labelledby="review-problem-title" className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-dark-card">
        <h2 id="review-problem-title" className="font-semibold text-gray-900 dark:text-white">Before you {submitButtonText.toLowerCase().includes('create') ? 'create' : 'save'} this problem</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-gray-600 dark:text-gray-400">
          <li>The statement, input format, output format, and constraints agree with each other.</li>
          <li>Every expected output has been checked, and hidden tests cover boundary cases.</li>
          <li>Problem visibility and public samples reveal only what students should see.</li>
        </ul>
        <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">Current execution limits: {formData.timeLimit} ms ({formData.timeLimit / 1000} seconds) and {formData.memoryLimit} MB. After saving, review the problem and test a correct solution before assigning it.</p>
      </aside>
      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
        >
          {loading ? 'Processing...' : submitButtonText}
        </button>
      </div>
    </form>
  );
}
