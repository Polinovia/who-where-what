-- CreateEnum
CREATE TYPE "LobbyStatus" AS ENUM ('LOBBY', 'IN_PROGRESS', 'FINISHED');

-- CreateEnum
CREATE TYPE "RoundStatus" AS ENUM ('ANSWERING', 'REVEAL');

-- CreateEnum
CREATE TYPE "AnswerType" AS ENUM ('WHO', 'WHERE', 'WHAT');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lobby" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "status" "LobbyStatus" NOT NULL DEFAULT 'LOBBY',
    "maxPlayers" INTEGER NOT NULL DEFAULT 12,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Lobby_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Player" (
    "id" TEXT NOT NULL,
    "pseudo" TEXT NOT NULL,
    "isHost" BOOLEAN NOT NULL DEFAULT false,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lobbyId" TEXT NOT NULL,
    "userId" TEXT,

    CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Round" (
    "id" TEXT NOT NULL,
    "index" INTEGER NOT NULL,
    "status" "RoundStatus" NOT NULL DEFAULT 'ANSWERING',
    "lobbyId" TEXT NOT NULL,

    CONSTRAINT "Round_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Answer" (
    "id" TEXT NOT NULL,
    "type" "AnswerType" NOT NULL,
    "text" TEXT NOT NULL,
    "roundId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,

    CONSTRAINT "Answer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Story" (
    "id" TEXT NOT NULL,
    "roundId" TEXT NOT NULL,
    "whoAnswerId" TEXT NOT NULL,
    "whereAnswerId" TEXT NOT NULL,
    "whatAnswerId" TEXT NOT NULL,

    CONSTRAINT "Story_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Lobby_code_key" ON "Lobby"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Player_lobbyId_pseudo_key" ON "Player"("lobbyId", "pseudo");

-- CreateIndex
CREATE UNIQUE INDEX "Answer_roundId_playerId_type_key" ON "Answer"("roundId", "playerId", "type");

-- AddForeignKey
ALTER TABLE "Player" ADD CONSTRAINT "Player_lobbyId_fkey" FOREIGN KEY ("lobbyId") REFERENCES "Lobby"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Player" ADD CONSTRAINT "Player_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Round" ADD CONSTRAINT "Round_lobbyId_fkey" FOREIGN KEY ("lobbyId") REFERENCES "Lobby"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "Round"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Story" ADD CONSTRAINT "Story_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "Round"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Story" ADD CONSTRAINT "Story_whoAnswerId_fkey" FOREIGN KEY ("whoAnswerId") REFERENCES "Answer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Story" ADD CONSTRAINT "Story_whereAnswerId_fkey" FOREIGN KEY ("whereAnswerId") REFERENCES "Answer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Story" ADD CONSTRAINT "Story_whatAnswerId_fkey" FOREIGN KEY ("whatAnswerId") REFERENCES "Answer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
