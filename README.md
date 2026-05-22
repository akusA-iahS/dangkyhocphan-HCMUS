<div align="center">
  <br />
  <h1>🎓 HCMUS Course Registration Bot</h1>
  <p>
    <strong>An automated, high-performance course registration bot with an advanced Next.js display.</strong>
  </p>
  <p>
    <a href="https://github.com/akusA-iahS/dangkyhocphan-HCMUS/blob/main/LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License: MIT" /></a>
    <a href="https://nextjs.org/"><img src="https://img.shields.io/badge/Built_with-Next.js-black?logo=next.js" alt="Built with Next.js" /></a>
    <a href="https://bun.sh/"><img src="https://img.shields.io/badge/Powered_by-Bun-fbf0df?logo=bun" alt="Powered by Bun" /></a>
    <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/Styled_with-Tailwind_CSS-38B2AC?logo=tailwind-css" alt="Tailwind CSS" /></a>
  </p>
</div>

<br />

## 🌟 Overview
Registration nightmares are a thing of the past. This project acts as an automated registration bot designed to ease the course registration process for students. It continuously polls the portal API until a successful registration is confirmed.

## ✨ Features
- ⚡ **Auto-Polling Mechanism**: Never stops trying until you are successfully registered for the targeted course.
- 🎨 **Sleek Interface**: Built with Framer Motion, Tailwind CSS, and Lucide Icons for a beautiful, terminal-like dashboard experience.
- 🚀 **High Performance**: Powered by Next.js and Bun for ultra-fast startup and reactivity.
- 🛡️ **Fail-safe Backend Logic**: Ready for robust retry strategies (`p-retry`) and elegant logging (`winston`).
- 📊 **Real-time Logs**: Watch the bot's decisions, pings, and API statuses right from the UI control panel.

## 🛠️ Tech Stack
* **Framework**: [Next.js (App Router)](https://nextjs.org/)
* **Language**: TypeScript
* **Styling**: Tailwind CSS & Framer Motion
* **State Management**: [Zustand](https://github.com/pmndrs/zustand)
* **Package Manager / Runtime**: [Bun](https://bun.sh)
* **HTTP Client**: Axios

## 🚀 Quick Start

### Prerequisites
Make sure you have [Bun](https://bun.sh/) installed.

### Installation

```bash
# Clone the repository
git clone https://github.com/akusA-iahS/dangkyhocphan-HCMUS.git

# Navigate into the project
cd dangkyhocphan-HCMUS

# Install dependencies
bun install

# Start the development server
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application!

## 🎮 Usage
1. Open the application in your browser.
2. Use the mock credentials to log securely into the **Portal Gateway**:
   - **Student ID**: `23127676`
   - **Password**: `sixseven67`
3. Select an available course from the dashboard list.
4. Hit **Commence Attack** to start the sniper bot!
5. Monitor the terminal output panel for real-time status.

---

## ⚠️ Disclaimer
This project is created for **educational purposes only**. Please respect the university's portal guidelines and APIs. The creator assumes no responsibility for any restrictions or actions resulting from its use.