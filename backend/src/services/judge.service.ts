import axios from 'axios';

interface ExecutionResult {
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
  status: {
    id: number;
    description: string;
  };
  time: string;
  memory: number;
}

const LANGUAGE_IDS: Record<string, number> = {
  javascript: 63,
  python: 71,
  java: 62,
  cpp: 54,
  c: 50,
  csharp: 51,
  go: 60,
  php: 68,
};

export class JudgeService {
  private apiUrl: string;
  private apiKey: string;

  constructor() {
    this.apiUrl = process.env.JUDGE0_API_URL || 'https://judge0-ce.p.rapidapi.com';
    this.apiKey = process.env.JUDGE0_API_KEY || '';
  }

  async executeCode(
    code: string,
    language: string,
    input: string,
    timeLimit: number = 2000,
    memoryLimit: number = 256000
  ): Promise<ExecutionResult> {
    try {
      const languageId = LANGUAGE_IDS[language.toLowerCase()];
      if (!languageId) {
        throw new Error(`Unsupported language: ${language}`);
      }

      // Create submission
      const submissionResponse = await axios.post(
        `${this.apiUrl}/submissions?base64_encoded=false&wait=true`,
        {
          source_code: code,
          language_id: languageId,
          stdin: input,
          cpu_time_limit: timeLimit / 1000, // Convert to seconds
          memory_limit: memoryLimit,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            ...(this.apiKey ? {
              'X-RapidAPI-Key': this.apiKey,
              'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
            } : {}),
          },
        }
      );

      return submissionResponse.data;
    } catch (error: any) {
      console.error('Judge0 execution error:', error.response?.data || error.message);
      throw new Error('Code execution failed');
    }
  }

  compareOutput(actual: string | null, expected: string): boolean {
    if (!actual) return false;

    // Normalize whitespace and compare
    const normalizeOutput = (str: string) =>
      str
        .trim()
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0)
        .join('\n');

    return normalizeOutput(actual) === normalizeOutput(expected);
  }

  getVerdictFromStatus(statusId: number): string {
    switch (statusId) {
      case 3:
        return 'Accepted';
      case 4:
        return 'WrongAnswer';
      case 5:
        return 'TimeLimitExceeded';
      case 6:
        return 'CompilationError';
      case 7:
      case 8:
      case 9:
      case 10:
      case 11:
      case 12:
        return 'RuntimeError';
      default:
        return 'Pending';
    }
  }
}

export default new JudgeService();
