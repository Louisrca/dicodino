/*
  Warnings:

  - You are about to drop the column `name` on the `Room` table. All the data in the column will be lost.
  - Added the required column `host` to the `Room` table without a default value. This is not possible if the table is not empty.
  - Added the required column `currentAnswer` to the `Round` table without a default value. This is not possible if the table is not empty.
  - Added the required column `currentDefinition` to the `Round` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Room" DROP COLUMN "name",
ADD COLUMN     "host" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Round" ADD COLUMN     "currentAnswer" TEXT NOT NULL,
ADD COLUMN     "currentDefinition" TEXT NOT NULL;
