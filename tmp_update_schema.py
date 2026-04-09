import re

file_path = r"d:\Apps\RSCI-RC3\backend\prisma\schema.prisma"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Add to User model
user_relations = """
  contestsCreated     Contest[]
  contestParticipants ContestParticipant[]

  solutions           Solution[]
  comments            Comment[]
  votes               Vote[]
"""
content = re.sub(r'  contestsCreated     Contest\[\]\n  contestParticipants ContestParticipant\[\]', user_relations.strip('\n'), content)

# Add to Problem model
problem_relations = """
  submissions    Submission[]
  contests       Contest[]       @relation("ContestProblems")
  problemTags    ProblemTag[]
  solutions      Solution[]
"""
content = re.sub(r'  submissions    Submission\[\]\n  contests       Contest\[\]       @relation\("ContestProblems"\)', problem_relations.strip('\n'), content)

# Add new models at the end
new_models = """
model Tag {
  id          String       @id @default(uuid())
  name        String       @unique
  description String?
  problems    ProblemTag[]
}

model ProblemTag {
  problemId String
  tagId     String
  problem   Problem @relation(fields: [problemId], references: [id], onDelete: Cascade)
  tag       Tag     @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@id([problemId, tagId])
}

model Solution {
  id          String   @id @default(uuid())
  problemId   String
  authorId    String
  title       String
  content     String   @db.Text
  language    String
  upvotes     Int      @default(0)
  downvotes   Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  problem  Problem   @relation(fields: [problemId], references: [id], onDelete: Cascade)
  author   User      @relation(fields: [authorId], references: [id], onDelete: Cascade)
  comments Comment[]
  votes    Vote[]

  @@index([problemId])
  @@index([authorId])
}

model Comment {
  id         String   @id @default(uuid())
  solutionId String
  authorId   String
  content    String   @db.Text
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  solution Solution @relation(fields: [solutionId], references: [id], onDelete: Cascade)
  author   User     @relation(fields: [authorId], references: [id], onDelete: Cascade)

  @@index([solutionId])
  @@index([authorId])
}

model Vote {
  id         String   @id @default(uuid())
  userId     String
  solutionId String
  value      Int      // 1 for upvote, -1 for downvote

  user     User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  solution Solution @relation(fields: [solutionId], references: [id], onDelete: Cascade)

  @@unique([userId, solutionId])
}
"""

content += new_models

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Updated schema.prisma")
