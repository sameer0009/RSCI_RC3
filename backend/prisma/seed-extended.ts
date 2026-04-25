import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting extended problem seed...');

  const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
  if (!admin) {
    console.error('❌ Admin user not found. Please run main seed first.');
    return;
  }

  const problemData = [
    // ARRAYS
    {
      title: 'Move Zeroes',
      slug: 'move-zeroes',
      description: 'Given an integer array nums, move all 0\'s to the end of it while maintaining the relative order of the non-zero elements.',
      difficulty: 'Easy',
      topics: ['Array', 'Two Pointers'],
      inputFormat: 'Space-separated integers',
      outputFormat: 'Space-separated integers',
      constraints: '1 <= nums.length <= 10^4',
      testCases: [
        { input: '0 1 0 3 12', expectedOutput: '1 3 12 0 0', isPublic: true },
        { input: '0', expectedOutput: '0', isPublic: true }
      ]
    },
    {
      title: 'Maximum Subarray',
      slug: 'maximum-subarray',
      description: 'Given an integer array nums, find the subarray with the largest sum, and return its sum.',
      difficulty: 'Medium',
      topics: ['Array', 'Divide and Conquer', 'Dynamic Programming'],
      inputFormat: 'Space-separated integers',
      outputFormat: 'Single integer representing the maximum sum',
      constraints: '1 <= nums.length <= 10^5',
      testCases: [
        { input: '-2 1 -3 4 -1 2 1 -5 4', expectedOutput: '6', isPublic: true },
        { input: '1', expectedOutput: '1', isPublic: true },
        { input: '5 4 -1 7 8', expectedOutput: '23', isPublic: false }
      ]
    },
    // STRINGS
    {
      title: 'Valid Anagram',
      slug: 'valid-anagram',
      description: 'Given two strings s and t, return true if t is an anagram of s, and false otherwise.',
      difficulty: 'Easy',
      topics: ['String', 'Hash Table', 'Sorting'],
      inputFormat: 'Two strings on separate lines',
      outputFormat: 'true or false',
      constraints: '1 <= s.length, t.length <= 5 * 10^4',
      testCases: [
        { input: 'anagram\nnagaram', expectedOutput: 'true', isPublic: true },
        { input: 'rat\ncar', expectedOutput: 'false', isPublic: true }
      ]
    },
    // BINARY SEARCH
    {
      title: 'Binary Search',
      slug: 'binary-search',
      description: 'Given an array of integers nums which is sorted in ascending order, and an integer target, write a function to search target in nums. If target exists, then return its index. Otherwise, return -1.',
      difficulty: 'Easy',
      topics: ['Array', 'Binary Search'],
      inputFormat: 'First line: space-separated integers\nSecond line: target',
      outputFormat: 'Index or -1',
      constraints: '1 <= nums.length <= 10^4',
      testCases: [
        { input: '-1 0 3 5 9 12\n9', expectedOutput: '4', isPublic: true },
        { input: '-1 0 3 5 9 12\n2', expectedOutput: '-1', isPublic: true }
      ]
    },
    // DYNAMIC PROGRAMMING
    {
      title: 'Climbing Stairs',
      slug: 'climbing-stairs',
      description: 'You are climbing a staircase. It takes n steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?',
      difficulty: 'Easy',
      topics: ['Dynamic Programming', 'Math', 'Memoization'],
      inputFormat: 'Single integer n',
      outputFormat: 'Number of ways',
      constraints: '1 <= n <= 45',
      testCases: [
        { input: '2', expectedOutput: '2', isPublic: true },
        { input: '3', expectedOutput: '3', isPublic: true },
        { input: '5', expectedOutput: '8', isPublic: false }
      ]
    },
    {
      title: 'Longest Palindromic Substring',
      slug: 'longest-palindromic-substring',
      description: 'Given a string s, return the longest palindromic substring in s.',
      difficulty: 'Medium',
      topics: ['String', 'Dynamic Programming'],
      inputFormat: 'A string s',
      outputFormat: 'The longest palindromic substring',
      constraints: '1 <= s.length <= 1000',
      testCases: [
        { input: 'babad', expectedOutput: 'bab', isPublic: true }, // "aba" is also valid but we check for bab
        { input: 'cbbd', expectedOutput: 'bb', isPublic: true }
      ]
    },
    // TREES
    {
      title: 'Invert Binary Tree',
      slug: 'invert-binary-tree',
      description: 'Given the root of a binary tree, invert the tree, and return its root.',
      difficulty: 'Easy',
      topics: ['Tree', 'Depth-First Search', 'Breadth-First Search', 'Binary Tree'],
      inputFormat: 'Level-order traversal array (space separated)',
      outputFormat: 'Level-order traversal array of inverted tree',
      constraints: 'Number of nodes is in range [0, 100]',
      testCases: [
        { input: '4 2 7 1 3 6 9', expectedOutput: '4 7 2 9 6 3 1', isPublic: true },
        { input: '2 1 3', expectedOutput: '2 3 1', isPublic: true }
      ]
    },
    // GREEDY
    {
      title: 'Jump Game',
      slug: 'jump-game',
      description: 'You are given an integer array nums. You are initially positioned at the first index, and each element in the array represents your maximum jump length at that position. Return true if you can reach the last index, or false otherwise.',
      difficulty: 'Medium',
      topics: ['Array', 'Dynamic Programming', 'Greedy'],
      inputFormat: 'Space-separated integers',
      outputFormat: 'true or false',
      constraints: '1 <= nums.length <= 10^4',
      testCases: [
        { input: '2 3 1 1 4', expectedOutput: 'true', isPublic: true },
        { input: '3 2 1 0 4', expectedOutput: 'false', isPublic: true }
      ]
    }
  ];

  for (const data of problemData) {
    const { testCases, ...problemInfo } = data;
    const problem = await prisma.problem.create({
      data: {
        ...(problemInfo as any),
        createdBy: admin.id,
      },
    });

    await prisma.testCase.createMany({
      data: testCases.map((tc, index) => ({
        ...tc,
        problemId: problem.id,
        orderIndex: index + 1,
        points: 10,
      })),
    });

    console.log(`✅ Seeded problem: ${problem.title}`);
  }

  console.log('🎉 Extended problem seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
