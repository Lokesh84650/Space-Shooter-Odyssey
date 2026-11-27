# 🚀 Space Shooter Odyssey

### A Full-Stack Space Shooter Game

[🎮 Live Demo](https://space-shooter-odyssey.vercel.app) | [💻 GitHub Repository](https://github.com/Lokesh84650/Space-Shooter-Odyssey)

Space Shooter Odyssey is a full-stack space shooter game developed using React, Phaser, Java Spring Boot, and MySQL. Players can register, log in, select and upgrade spaceships, fight enemies, complete missions, and earn rewards.

## 🌐 Live Application

**Play here:** https://space-shooter-odyssey.vercel.app

## 🛠️ Technologies Used

| Category | Technologies |
|---|---|
| Frontend | React, JavaScript, HTML, CSS |
| Game Engine | Phaser |
| Backend | Java 21, Spring Boot |
| Database | MySQL |
| Authentication | JWT, BCrypt |
| API | REST API |
| Deployment | Vercel, Railway |
| Development Tools | VS Code, Git, GitHub |

## ✨ Key Features

- Player Registration and Login
- JWT-Based Authentication
- Player Dashboard
- Spaceship Selection and Hangar
- Spaceship Upgrades
- Multiple Enemy Types
- Four Normal Gameplay Waves
- Fifth Wave Boss Battle
- Player Shooting and Enemy Collision
- Score and Reward System
- Game Session Management

## 🏗️ Project Architecture

The application uses a full-stack architecture:

1. **Frontend:** React handles the user interface and Phaser handles game mechanics.
2. **Backend:** Java Spring Boot provides REST APIs and handles application logic.
3. **Database:** MySQL stores player and game-related information.
4. **Authentication:** JWT secures authenticated API requests.
5. **Deployment:** Vercel hosts the frontend and Railway hosts the backend.

## 📂 Project Structure

```text
Space-Shooter-Odyssey/
│
├── Backend/
│   └── src/
│
├── Frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── game/
│   │   ├── pages/
│   │   └── services/
│   └── package.json
│
└── database/
```

## ⚙️ Run the Project Locally

### Prerequisites

- Java 21
- Node.js and npm
- MySQL
- Git

### 1. Clone the repository

```bash
git clone https://github.com/Lokesh84650/Space-Shooter-Odyssey.git
cd Space-Shooter-Odyssey
```

### 2. Start the frontend

```bash
cd Frontend
npm install
npm run dev
```

### 3. Start the backend

Open another terminal:

```bash
cd Backend
./mvnw spring-boot:run
```

On Windows PowerShell, use:

```powershell
.\mvnw.cmd spring-boot:run
```

Configure your MySQL database and required environment variables before starting the backend.


## 👨‍💻 Developer

**Lokesh Pallapu**

- 🌐 Portfolio: [Visit My Portfolio](https://lokeshpallapu-portfolio.vercel.app/)
- 💼 LinkedIn: [My LinkedIn Profile](https://www.linkedin.com/in/lokeshpallapu)
- 💻 GitHub: [My GitHub Profile](https://github.com/Lokesh84650)



## 🎯 Project Objective

To develop an interactive full-stack space shooter game while gaining practical experience in frontend development, backend API development, database integration, authentication, and game development.

---

⭐ If you find this project interesting, feel free to explore the repository and try the live demo!
