/*
  Warnings:

  - A unique constraint covering the columns `[socketId]` on the table `Player` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `socketId` to the `Player` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Player" ADD COLUMN     "socketId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Player_socketId_key" ON "Player"("socketId");
