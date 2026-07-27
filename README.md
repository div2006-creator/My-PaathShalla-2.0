# 🎓 My PaathShalla 2.0

> A modern, interactive virtual classroom and e-learning platform built with Next.js 14, Prisma, Tailwind CSS, and LiveKit.

---

## ✨ Features

- 🔐 **Role-Based Authentication**: Secure login & registration for **Students** and **Teachers**.
- 🎥 **Live Virtual Classrooms**: Real-time video conferencing, screen sharing, and audio streaming powered by **LiveKit**.
- 💬 **Live Class Chat**: In-class real-time messaging between students and teachers.
- 📝 **Assignments & Grading**: 
  - Teachers can post assignments with due dates and subjects.
  - Students can submit text & file solutions.
  - Teachers can grade submissions and provide detailed feedback.
- 📊 **Automated Attendance Tracking**: Real-time logging of student attendance upon joining live classroom sessions.
- 📹 **Lecture Recordings Library**: Access past class recordings, filter by subject, and view recorded sessions anytime.
- 📅 **Interactive Class Schedule**: Weekly timetable and room schedule for all subjects.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Frontend**: React 18, Tailwind CSS
- **Database & ORM**: SQLite, [Prisma ORM](https://www.prisma.io/)
- **Live Video Streaming**: [LiveKit SDK](https://livekit.io/) (`@livekit/components-react`, `livekit-server-sdk`)
- **Authentication**: Custom JWT session & `bcryptjs` password hashing

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18.x or higher)
- npm or yarn

### Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/div2006-creator/My-PaathShalla-2.0.git
   cd My-PaathShalla-2.0
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="file:./dev.db"
   LIVEKIT_API_KEY="your_livekit_api_key"
   LIVEKIT_API_SECRET="your_livekit_api_secret"
   NEXT_PUBLIC_LIVEKIT_URL="wss://your-livekit-server.livekit.cloud"
   ```

4. **Initialize Database & Seed Data**
   ```bash
   npx prisma db push
   npm run prisma:seed
   ```

5. **Run Development Server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser to view the app.

---

## 📁 Project Structure

```
My-PaathShalla-2.0/
├── prisma/
│   ├── schema.prisma   # Database models (User, Assignment, Submission, ClassSchedule, etc.)
│   └── seed.js         # Initial seed data script
├── src/
│   ├── app/
│   │   ├── api/        # Next.js API Routes (Auth, Assignments, Live Token, Attendance, etc.)
│   │   ├── assignments/ # Assignment submission and grading UI
│   │   ├── dashboard/  # Dashboard for students and teachers
│   │   ├── live/       # Live classroom interface
│   │   ├── login/      # User authentication pages
│   │   ├── recordings/ # Video recordings library
│   │   └── schedule/   # Class timetable page
│   ├── components/     # Layouts & Reusable UI Components
│   └── lib/            # Prisma client & utility functions
├── tailwind.config.js
└── package.json
```

---

## 📜 License

This project is open-source under the MIT License.
