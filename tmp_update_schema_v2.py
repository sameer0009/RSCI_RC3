import os

file_path = r"d:\Apps\RSCI-RC3\backend\prisma\schema.prisma"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update User model
# Add isEmailVerified, provider, providerId
# Add authTokens, notifications, notificationSetting, instructorClasses, studentClasses
user_replace = """  // Social media links
  linkedinUrl String?
  githubUrl   String?
  twitterUrl  String?
  websiteUrl  String?

  // Auth additions
  isEmailVerified Boolean @default(false)
  provider        String  @default("local") // local, google, github
  providerId      String? // ID from provider if oauth
"""
content = content.replace("  // Social media links\n  linkedinUrl String?\n  githubUrl   String?\n  twitterUrl  String?\n  websiteUrl  String?", user_replace)

user_relations = """  solutions           Solution[]
  comments            Comment[]
  votes               Vote[]

  authTokens          AuthToken[]
  notifications       Notification[]
  notificationSetting NotificationSetting?
  instructorClasses   Classroom[]       @relation("InstructorClassrooms")
  studentClasses      ClassroomMember[] @relation("StudentClassrooms")
"""
content = content.replace("  solutions           Solution[]\n  comments            Comment[]\n  votes               Vote[]", user_relations)

# 2. Update Role Enum
role_old = "enum Role {\n  USER\n  ADMIN\n}"
role_new = "enum Role {\n  USER\n  ADMIN\n  INSTRUCTOR\n  PROBLEM_SETTER\n}"
content = content.replace(role_old, role_new)

# 3. Update Problem model
problem_relations = """  problemTags    ProblemTag[]
  solutions      Solution[]
  assignments    Assignment[]    @relation("AssignmentProblems")"""
content = content.replace("  problemTags    ProblemTag[]\n  solutions      Solution[]", problem_relations)

# 4. Append new models at the bottom
new_models = """

// --- NEW AUTH & SYSTEM MODELS ---

model AuthToken {
  id        String   @id @default(uuid())
  userId    String
  token     String   @unique
  type      TokenType
  expiresAt DateTime
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([token])
}

enum TokenType {
  REFRESH
  VERIFICATION
  PASSWORD_RESET
}

model Notification {
  id        String   @id @default(uuid())
  userId    String
  type      NotificationType
  title     String
  message   String   @db.Text
  link      String?
  isRead    Boolean  @default(false)
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([isRead])
  @@index([createdAt])
}

enum NotificationType {
  SYSTEM
  CONTEST
  SUBMISSION
  COMMUNITY
  ACADEMIC
}

model NotificationSetting {
  userId               String  @id
  emailNotifications   Boolean @default(true)
  pushNotifications    Boolean @default(true)
  contestReminders     Boolean @default(true)
  marketingEmails      Boolean @default(false)

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

// --- NEW ACADEMIC MODELS ---

model Classroom {
  id          String   @id @default(uuid())
  name        String
  description String?  @db.Text
  code        String   @unique // For students to join
  instructorId String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  instructor  User              @relation("InstructorClassrooms", fields: [instructorId], references: [id], onDelete: Cascade)
  members     ClassroomMember[]
  assignments Assignment[]

  @@index([instructorId])
  @@index([code])
}

model ClassroomMember {
  id          String   @id @default(uuid())
  classroomId String
  userId      String
  joinedAt    DateTime @default(now())

  classroom Classroom @relation(fields: [classroomId], references: [id], onDelete: Cascade)
  user      User      @relation("StudentClassrooms", fields: [userId], references: [id], onDelete: Cascade)

  @@unique([classroomId, userId])
  @@index([classroomId])
  @@index([userId])
}

model Assignment {
  id          String   @id @default(uuid())
  classroomId String
  title       String
  description String?  @db.Text
  dueDate     DateTime
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  classroom   Classroom    @relation(fields: [classroomId], references: [id], onDelete: Cascade)
  problems    Problem[]    @relation("AssignmentProblems")

  @@index([classroomId])
}
"""

content += new_models

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Schema updated successfully.")
