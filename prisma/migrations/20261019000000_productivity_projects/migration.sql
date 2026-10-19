ALTER TABLE "Workspace"
ADD COLUMN "status" TEXT NOT NULL DEFAULT 'active',
ADD COLUMN "techStack" TEXT NOT NULL DEFAULT '',
ADD COLUMN "progress" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "deadline" TIMESTAMP(3),
ADD COLUMN "repositoryUrl" TEXT,
ADD COLUMN "demoUrl" TEXT;

CREATE TABLE "Bookmark" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "description" TEXT,
    "tags" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Bookmark_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Note" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "workspaceId" TEXT,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL DEFAULT '',
    "folder" TEXT NOT NULL DEFAULT 'General',
    "tags" TEXT NOT NULL DEFAULT '',
    "pinned" BOOLEAN NOT NULL DEFAULT false,
    "favorite" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Note_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Todo" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "workspaceId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'todo',
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "dueAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Todo_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Bookmark_userId_updatedAt_idx" ON "Bookmark"("userId", "updatedAt");
CREATE INDEX "Note_userId_updatedAt_idx" ON "Note"("userId", "updatedAt");
CREATE INDEX "Note_workspaceId_idx" ON "Note"("workspaceId");
CREATE INDEX "Todo_userId_status_dueAt_idx" ON "Todo"("userId", "status", "dueAt");
CREATE INDEX "Todo_workspaceId_idx" ON "Todo"("workspaceId");

ALTER TABLE "Bookmark" ADD CONSTRAINT "Bookmark_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Note" ADD CONSTRAINT "Note_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Note" ADD CONSTRAINT "Note_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Todo" ADD CONSTRAINT "Todo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Todo" ADD CONSTRAINT "Todo_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE SET NULL ON UPDATE CASCADE;
