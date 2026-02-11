/*
  Warnings:

  - You are about to drop the column `host` on the `Room` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[roomId,username]` on the table `Player` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `hostId` to the `Room` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Room" DROP COLUMN "host",
ADD COLUMN     "hostId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Player_roomId_username_key" ON "Player"("roomId", "username");

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
