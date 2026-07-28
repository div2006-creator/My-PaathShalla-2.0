const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const dbUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/mypaathshalla?schema=public';
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: dbUrl,
    },
  },
});

async function main() {
  console.log('Clearing database and seeding clean state...');

  // Clean all existing data
  await prisma.liveChat.deleteMany();
  await prisma.recording.deleteMany();
  await prisma.classSchedule.deleteMany();
  await prisma.submission.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.user.deleteMany();

  // Create Users
  const studentPassword = bcrypt.hashSync('aarav123', 10);
  const teacherPassword = bcrypt.hashSync('varma123', 10);

  const student = await prisma.user.create({
    data: {
      email: 'aarav@paathshalla.com',
      password: studentPassword,
      name: 'Aarav Mehta',
      role: 'STUDENT',
      avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDRJuoa4ZjJi6DzALX5w9OeEoNtUbctFr7-e0SduAVKfsOoGBRcHudjPIRma1pB2w1MYPrRIp0HADuSy25gUlLi0TzdtpuEPyuDMheP5iYk2qici4koa1Z-m9UotZaX7lvdXzC_0F1k3RmxBreJ5LaBujZV939kfWNmZWui3nGmA5deh4C4-O79NJzzokDcArTkzfZfO8dTnYSi6jNN_DMSWotKCU-DdLjgAMwRJ1_ElLhidits700p6muU1wupLtym0112dSCj740',
    },
  });

  const teacher = await prisma.user.create({
    data: {
      email: 'varma@paathshalla.com',
      password: teacherPassword,
      name: 'Prof. Rajesh Varma',
      role: 'TEACHER',
      avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBEIqpGngz3OzOf8MycyD8ZTLaDZj8xnjPRgVCZo_BCUhWDa3NIwBcaPKmokKyPL3S6SodrJ3k00KCV4brCXT5ZODgYFVbg3X5NVrYVXepnv9EzVEIq5VYzof4V0nQ2U0Kl0Rh5iR1IrGbovbIcR8JIP8VLtCkerslMF_GhMwDxYkiUm3IDBx7uK-3jrrf1ZMr1A5tAG27dHjI1ivlvZL3X2TIWsMvoDSbYK_5eOWi9pld8R8wdqGn2UyFfzFG9BFwb9l6BAqLpWEc',
    },
  });

  console.log('Database successfully cleaned and default users seeded!');
  console.log(`- Student: ${student.email} (password: aarav123)`);
  console.log(`- Teacher: ${teacher.email} (password: varma123)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
