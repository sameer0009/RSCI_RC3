import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data (optional - comment out if you want to preserve data)
  console.log('🗑️  Clearing existing data...');
  await prisma.contestParticipant.deleteMany();
  await prisma.submission.deleteMany();
  await prisma.testCase.deleteMany();
  await prisma.contest.deleteMany();
  await prisma.problem.deleteMany();
  await prisma.user.deleteMany();

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      username: 'admin',
      passwordHash: adminPassword,
      role: 'ADMIN',
      rating: 2000,
      rank: 1,
      problemsSolved: 10,
      totalSubmissions: 15,
      acceptedSubmissions: 10,
      fullName: 'Admin User',
      bio: 'Platform administrator with full access to all features.',
      location: 'San Francisco, CA',
      githubUrl: 'https://github.com/admin',
      linkedinUrl: 'https://linkedin.com/in/admin',
    },
  });

  console.log('✅ Created admin user:', admin.username);

  // Create test users
  const testPassword = await bcrypt.hash('test123', 10);
  const users = [];
  
  const sampleBios = [
    'Passionate software developer and problem solver.',
    'Love coding challenges and competitive programming.',
    'Full-stack developer learning algorithms.',
    'Computer science student exploring data structures.',
    'Backend engineer focused on system design.',
  ];

  const locations = ['New York, NY', 'London, UK', 'Tokyo, Japan', 'Berlin, Germany', 'Toronto, Canada'];
  
  for (let i = 1; i <= 10; i++) {
    const problemsSolved = Math.floor(Math.random() * 20);
    const totalSubmissions = Math.floor(Math.random() * 50) + problemsSolved;
    const user = await prisma.user.create({
      data: {
        email: `user${i}@example.com`,
        username: `user${i}`,
        passwordHash: testPassword,
        role: 'USER',
        rating: 1500 - i * 50,
        rank: i + 1,
        problemsSolved,
        totalSubmissions,
        acceptedSubmissions: problemsSolved,
        fullName: `Test User ${i}`,
        bio: sampleBios[i % sampleBios.length],
        location: locations[i % locations.length],
        githubUrl: i % 2 === 0 ? `https://github.com/user${i}` : null,
        linkedinUrl: i % 3 === 0 ? `https://linkedin.com/in/user${i}` : null,
      },
    });
    users.push(user);
  }

  console.log(`✅ Created ${users.length} test users`);

  // Create sample problems
  const problems = [];

  // Problem 1: Two Sum
  const problem1 = await prisma.problem.create({
    data: {
      title: 'Two Sum',
      slug: 'two-sum',
      description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.

**Example 1:**
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].

**Example 2:**
Input: nums = [3,2,4], target = 6
Output: [1,2]`,
      inputFormat: 'First line: space-separated array of integers\nSecond line: target integer',
      outputFormat: 'Two space-separated integers representing the indices',
      constraints: '2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9\nOnly one valid answer exists.',
      difficulty: 'Easy',
      topics: ['Array', 'Hash Table'],
      timeLimit: 2000,
      memoryLimit: 256,
      acceptanceRate: 0.48,
      totalSubmissions: 0,
      acceptedSubmissions: 0,
      createdBy: admin.id,
    },
  });
  problems.push(problem1);

  await prisma.testCase.createMany({
    data: [
      {
        problemId: problem1.id,
        input: '2 7 11 15\n9',
        expectedOutput: '0 1',
        isPublic: true,
        points: 10,
        orderIndex: 1,
      },
      {
        problemId: problem1.id,
        input: '3 2 4\n6',
        expectedOutput: '1 2',
        isPublic: true,
        points: 10,
        orderIndex: 2,
      },
      {
        problemId: problem1.id,
        input: '3 3\n6',
        expectedOutput: '0 1',
        isPublic: false,
        points: 10,
        orderIndex: 3,
      },
      {
        problemId: problem1.id,
        input: '1 5 3 7 9\n12',
        expectedOutput: '2 3',
        isPublic: false,
        points: 10,
        orderIndex: 4,
      },
    ],
  });

  console.log('✅ Created problem: Two Sum');

  // Problem 2: Reverse String
  const problem2 = await prisma.problem.create({
    data: {
      title: 'Reverse String',
      slug: 'reverse-string',
      description: `Write a function that reverses a string. The input string is given as an array of characters s.

You must do this by modifying the input array in-place with O(1) extra memory.

**Example 1:**
Input: s = "hello"
Output: "olleh"

**Example 2:**
Input: s = "Hannah"
Output: "hannaH"`,
      inputFormat: 'A string of characters',
      outputFormat: 'The reversed string',
      constraints: '1 <= s.length <= 10^5\ns[i] is a printable ascii character',
      difficulty: 'Easy',
      topics: ['String', 'Two Pointers'],
      timeLimit: 1000,
      memoryLimit: 128,
      acceptanceRate: 0.75,
      totalSubmissions: 0,
      acceptedSubmissions: 0,
      createdBy: admin.id,
    },
  });
  problems.push(problem2);

  await prisma.testCase.createMany({
    data: [
      {
        problemId: problem2.id,
        input: 'hello',
        expectedOutput: 'olleh',
        isPublic: true,
        points: 10,
        orderIndex: 1,
      },
      {
        problemId: problem2.id,
        input: 'Hannah',
        expectedOutput: 'hannaH',
        isPublic: true,
        points: 10,
        orderIndex: 2,
      },
      {
        problemId: problem2.id,
        input: 'world',
        expectedOutput: 'dlrow',
        isPublic: false,
        points: 10,
        orderIndex: 3,
      },
    ],
  });

  console.log('✅ Created problem: Reverse String');

  // Problem 3: Palindrome Number
  const problem3 = await prisma.problem.create({
    data: {
      title: 'Palindrome Number',
      slug: 'palindrome-number',
      description: `Given an integer x, return true if x is a palindrome, and false otherwise.

**Example 1:**
Input: x = 121
Output: true
Explanation: 121 reads as 121 from left to right and from right to left.

**Example 2:**
Input: x = -121
Output: false
Explanation: From left to right, it reads -121. From right to left, it becomes 121-. Therefore it is not a palindrome.`,
      inputFormat: 'An integer x',
      outputFormat: 'true or false',
      constraints: '-2^31 <= x <= 2^31 - 1',
      difficulty: 'Easy',
      topics: ['Math'],
      timeLimit: 1000,
      memoryLimit: 128,
      acceptanceRate: 0.52,
      totalSubmissions: 0,
      acceptedSubmissions: 0,
      createdBy: admin.id,
    },
  });
  problems.push(problem3);

  await prisma.testCase.createMany({
    data: [
      {
        problemId: problem3.id,
        input: '121',
        expectedOutput: 'true',
        isPublic: true,
        points: 10,
        orderIndex: 1,
      },
      {
        problemId: problem3.id,
        input: '-121',
        expectedOutput: 'false',
        isPublic: true,
        points: 10,
        orderIndex: 2,
      },
      {
        problemId: problem3.id,
        input: '10',
        expectedOutput: 'false',
        isPublic: false,
        points: 10,
        orderIndex: 3,
      },
    ],
  });

  console.log('✅ Created problem: Palindrome Number');

  // Problem 4: Valid Parentheses (Medium)
  const problem4 = await prisma.problem.create({
    data: {
      title: 'Valid Parentheses',
      slug: 'valid-parentheses',
      description: `Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.

**Example 1:**
Input: s = "()"
Output: true

**Example 2:**
Input: s = "()[]{}"
Output: true

**Example 3:**
Input: s = "(]"
Output: false`,
      inputFormat: 'A string s consisting of parentheses only',
      outputFormat: 'true or false',
      constraints: '1 <= s.length <= 10^4\ns consists of parentheses only \'()[]{}\'',
      difficulty: 'Medium',
      topics: ['String', 'Stack'],
      timeLimit: 2000,
      memoryLimit: 256,
      acceptanceRate: 0.40,
      totalSubmissions: 0,
      acceptedSubmissions: 0,
      createdBy: admin.id,
    },
  });
  problems.push(problem4);

  await prisma.testCase.createMany({
    data: [
      {
        problemId: problem4.id,
        input: '()',
        expectedOutput: 'true',
        isPublic: true,
        points: 15,
        orderIndex: 1,
      },
      {
        problemId: problem4.id,
        input: '()[]{}',
        expectedOutput: 'true',
        isPublic: true,
        points: 15,
        orderIndex: 2,
      },
      {
        problemId: problem4.id,
        input: '(]',
        expectedOutput: 'false',
        isPublic: false,
        points: 15,
        orderIndex: 3,
      },
      {
        problemId: problem4.id,
        input: '([)]',
        expectedOutput: 'false',
        isPublic: false,
        points: 15,
        orderIndex: 4,
      },
    ],
  });

  console.log('✅ Created problem: Valid Parentheses');

  // Problem 5: Merge Two Sorted Lists (Medium)
  const problem5 = await prisma.problem.create({
    data: {
      title: 'Merge Two Sorted Lists',
      slug: 'merge-two-sorted-lists',
      description: `You are given the heads of two sorted linked lists list1 and list2.

Merge the two lists into one sorted list. The list should be made by splicing together the nodes of the first two lists.

Return the head of the merged linked list.

**Example 1:**
Input: list1 = [1,2,4], list2 = [1,3,4]
Output: [1,1,2,3,4,4]

**Example 2:**
Input: list1 = [], list2 = []
Output: []`,
      inputFormat: 'Two lines, each containing space-separated integers representing the lists',
      outputFormat: 'Space-separated integers representing the merged list',
      constraints: 'The number of nodes in both lists is in the range [0, 50]\n-100 <= Node.val <= 100\nBoth list1 and list2 are sorted in non-decreasing order',
      difficulty: 'Medium',
      topics: ['Linked List', 'Recursion'],
      timeLimit: 2000,
      memoryLimit: 256,
      acceptanceRate: 0.62,
      totalSubmissions: 0,
      acceptedSubmissions: 0,
      createdBy: admin.id,
    },
  });
  problems.push(problem5);

  await prisma.testCase.createMany({
    data: [
      {
        problemId: problem5.id,
        input: '1 2 4\n1 3 4',
        expectedOutput: '1 1 2 3 4 4',
        isPublic: true,
        points: 15,
        orderIndex: 1,
      },
      {
        problemId: problem5.id,
        input: '\n',
        expectedOutput: '',
        isPublic: true,
        points: 15,
        orderIndex: 2,
      },
      {
        problemId: problem5.id,
        input: '\n0',
        expectedOutput: '0',
        isPublic: false,
        points: 15,
        orderIndex: 3,
      },
    ],
  });

  console.log('✅ Created problem: Merge Two Sorted Lists');

  console.log(`✅ Created ${problems.length} sample problems`);

  // Create sample contests
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Upcoming contest
  const upcomingContest = await prisma.contest.create({
    data: {
      title: 'Weekly Contest 1',
      description: 'A weekly coding contest featuring 4 problems of varying difficulty.',
      startTime: tomorrow,
      endTime: new Date(tomorrow.getTime() + 2 * 60 * 60 * 1000), // 2 hours
      duration: 120,
      status: 'Upcoming',
      createdBy: admin.id,
      problems: {
        connect: [{ id: problem1.id }, { id: problem2.id }, { id: problem4.id }],
      },
    },
  });

  console.log('✅ Created upcoming contest');

  // Active contest
  const activeContest = await prisma.contest.create({
    data: {
      title: 'Beginner Challenge',
      description: 'Perfect for beginners! Solve easy problems and improve your skills.',
      startTime: new Date(now.getTime() - 30 * 60 * 1000), // Started 30 mins ago
      endTime: new Date(now.getTime() + 90 * 60 * 1000), // Ends in 90 mins
      duration: 120,
      status: 'Active',
      createdBy: admin.id,
      problems: {
        connect: [{ id: problem1.id }, { id: problem2.id }, { id: problem3.id }],
      },
    },
  });

  // Register some participants for active contest
  for (let i = 0; i < 5; i++) {
    await prisma.contestParticipant.create({
      data: {
        contestId: activeContest.id,
        userId: users[i].id,
        rank: i + 1,
        totalPoints: Math.floor(Math.random() * 100),
        problemsSolved: Math.floor(Math.random() * 3),
        penalty: Math.floor(Math.random() * 20),
      },
    });
  }

  console.log('✅ Created active contest with participants');

  // Past contest
  const pastContest = await prisma.contest.create({
    data: {
      title: 'Algorithm Mastery Contest',
      description: 'Advanced algorithms and data structures challenge.',
      startTime: lastWeek,
      endTime: new Date(lastWeek.getTime() + 3 * 60 * 60 * 1000),
      duration: 180,
      status: 'Ended',
      createdBy: admin.id,
      problems: {
        connect: [{ id: problem3.id }, { id: problem4.id }, { id: problem5.id }],
      },
    },
  });

  // Register participants for past contest
  for (let i = 0; i < 8; i++) {
    await prisma.contestParticipant.create({
      data: {
        contestId: pastContest.id,
        userId: users[i].id,
        rank: i + 1,
        totalPoints: 100 - i * 10,
        problemsSolved: 3 - Math.floor(i / 3),
        penalty: i * 5,
        lastSubmissionTime: new Date(lastWeek.getTime() + (i + 1) * 15 * 60 * 1000),
      },
    });
  }

  console.log('✅ Created past contest with final rankings');

  // Create some sample submissions
  const submissions = [];
  for (let i = 0; i < 5; i++) {
    const submission = await prisma.submission.create({
      data: {
        userId: users[i].id,
        problemId: problems[i % problems.length].id,
        code: `// Sample solution for ${problems[i % problems.length].title}\nfunction solve() {\n  // Implementation here\n}`,
        language: ['Python', 'JavaScript', 'C++', 'Java', 'Go'][i % 5],
        verdict: ['Accepted', 'WrongAnswer', 'Accepted', 'TimeLimitExceeded', 'Accepted'][i % 5] as any,
        executionTime: Math.floor(Math.random() * 1000),
        memoryUsed: Math.floor(Math.random() * 50000),
        testCasesPassed: i % 2 === 0 ? 4 : 2,
        totalTestCases: 4,
        points: i % 2 === 0 ? 100 : 0,
        evaluatedAt: new Date(),
      },
    });
    submissions.push(submission);
  }

  console.log(`✅ Created ${submissions.length} sample submissions`);

  // Update user statistics based on submissions
  for (const user of users.slice(0, 5)) {
    const userSubmissions = await prisma.submission.count({
      where: { userId: user.id },
    });
    const acceptedSubmissions = await prisma.submission.count({
      where: { userId: user.id, verdict: 'Accepted' },
    });

    await prisma.user.update({
      where: { id: user.id },
      data: {
        totalSubmissions: userSubmissions,
        problemsSolved: acceptedSubmissions,
      },
    });
  }

  console.log('✅ Updated user statistics');

  console.log('\n🎉 Database seeding completed!');
  console.log('\n📊 Summary:');
  console.log(`   - Users: ${users.length + 1} (1 admin, ${users.length} regular users)`);
  console.log(`   - Problems: ${problems.length}`);
  console.log(`   - Contests: 3 (1 upcoming, 1 active, 1 ended)`);
  console.log(`   - Submissions: ${submissions.length}`);
  console.log('\n🔐 Login credentials:');
  console.log('   Admin: admin@example.com / admin123');
  console.log('   Users: user1@example.com / test123 (user1-user10)');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
