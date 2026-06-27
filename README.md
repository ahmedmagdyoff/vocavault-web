<div align="center">

# 🌐 VocaVault Web

Modern frontend for the **VocaVault** English vocabulary learning platform.

[🌍 Live Demo](https://vocavault.ahmedmagdy.cloud) •
[⚙️ Backend API](https://github.com/ahmedmagdyoff/vocavault-api) •
[📚 Main Project](https://github.com/ahmedmagdyoff/vocavault)

</div>

---

# 📖 About

VocaVault Web is the frontend application of the VocaVault platform.

Built with **Next.js**, **React**, and **TypeScript**, it provides a fast and responsive experience for learning English vocabulary through categorized words, videos, and interactive lessons.

---

# ✨ Features

- 🔐 Authentication
- 📚 Vocabulary Learning
- 🎥 Video Lessons
- 📝 Word Forms
- 🔍 Search
- 🌙 Dark Mode
- 📱 Responsive Design
- ⚡ Fast Performance

---

# 🛠 Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Axios

---

# 🚀 Getting Started

Clone the repository

```bash
git clone https://github.com/ahmedmagdyoff/vocavault-web.git
```

Install dependencies

```bash
npm install
```

Run the development server

```bash
npm run dev
```

Build for production

```bash
npm run build
```

---

# 🌐 Environment Variables

Create a `.env.local` file.

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

---

# 📁 Project Structure

```text
app/
components/
contexts/
hooks/
lib/
public/
types/
```

---

# 🔗 Related Repositories

| Repository        | Description      |
| ----------------- | ---------------- |
| **VocaVault**     | Main project     |
| **VocaVault API** | Laravel REST API |

---

# 🚀 Deployment

Deployment is fully automated using **GitHub Actions**.

Every push to the `main` branch triggers:

- Build Check
- VPS Deployment
- PM2 Restart

---

# 📄 License

This project is licensed under the MIT License.
