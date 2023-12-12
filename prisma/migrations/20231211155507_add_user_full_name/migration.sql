/*
  Warnings:

  - Added the required column `full_name` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "full_name" TEXT NOT NULL;
