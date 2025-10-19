Lerni
A Duolingo-style learning platform specifically designed for dyslexic learners, combining adaptive learning technology with evidence-based instructional methods.


## 🎯 Overview

Lerni is a Duolingo-style learning platform that uses mini-games and Orton–Gillingham methods to help people with dyslexia improve reading skills in a fun, interactive, and intelligent way. Unlike traditional apps, Lerni adapts in real time: it tracks mistakes, reaction time, and patterns of confusion (like b/d or “tion/sion”), then uses AI and predictive logic to automatically choose the next best activity, difficulty level, or game type. As the player improves, the games evolve. When they struggle, Lerni slows down and gives targeted practice. Over time, the system learns each user’s unique challenges, stores progress, and builds a personalized path to reading success. It feels like a game—but thinks like a learning specialist.


## 🧠 Adaptive Learning Engine

Lerni continuously analyzes performance metrics such as:

- Error patterns (e.g. *b/d reversals*, *"tion/sion" confusions*)
- Response latency and processing speed
- Struggle and frustration indicators
- Progression velocity and mastery rates

This data powers predictive algorithms that:
- Select optimal learning sequences  
- Adjust difficulty levels in real time  
- Match games to user learning styles  
- Deliver targeted interventions for weak areas  

---

## ✨ Key Features

### 🎮 Game-Based Learning
- Multi-sensory mini-games (visual, auditory, kinesthetic)
- Progressive challenge and reward systems
- Instant feedback and guidance loops

### 🧩 Intelligent Personalization
- AI-driven adaptive learning engine
- Predictive analytics for emerging struggles
- Personalized learning pathways that evolve over time

### 🔤 Evidence-Based Design
- **Orton–Gillingham aligned** methodology
- Structured literacy and multi-sensory integration
- Sequential, cumulative skill development

### 📊 Advanced Analytics
- Real-time performance tracking
- Strengths and weaknesses breakdown
- Forecasting of learning growth and mastery trajectory

---

## 🏗 System Architecture

┌─────────────────────────────────────────────────────────────┐
│ Presentation Layer │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐ │
│ │ React │ │ Phaser │ │ Mobile Adaptive │ │
│ │ Components │ │ Games │ │ Layouts │ │
│ └─────────────┘ └─────────────┘ └─────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│ Application Layer │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐ │
│ │ Routing & │ │ State │ │ API Gateway & │ │
│ │ Navigation │ │ Management │ │ Middleware │ │
│ └─────────────┘ └─────────────┘ └─────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│ Business Layer │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐ │
│ │ Adaptive │ │ Game │ │ Progress & │ │
│ │ Learning │ │ Logic │ │ Analytics │ │
│ │ Engine │ │ Engine │ │ Engine │ │
│ └─────────────┘ └─────────────┘ └─────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│ Data Layer │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐ │
│ │ User & │ │ Learning │ │ Game & Content │ │
│ │ Session │ │ Analytics │ │ Repository │ │
│ │ Database │ │ Database │ │ │ │
│ └─────────────┘ └─────────────┘ └─────────────────────┘ │
└─────────────────────────────────────────────────────────────┘



## 🛠 Technology Stack

### **Frontend**
- **TypeScript** – Type-safe, maintainable development  
- **React** – Modular and scalable UI  
- **Phaser.js** – Interactive game engine  
- **SASS/CSS Modules** – Responsive styling

### **Backend**
- **Node.js** – Runtime environment  
- **Express.js** – API and middleware framework  
- **WebSocket** – Real-time gameplay communication  

### **Data**
- **Supabase (PostgreSQL)** – Real-time database  
- **Redis** – Caching and session management  
- **File Storage** – Cloud-based asset management  

### **AI & Analytics**
- **TensorFlow.js** – Client-side machine learning  
- **Custom Predictive Engine** – Adaptive learning intelligence  
- **Analytics Pipeline** – Progress and pattern tracking  

### **Infrastructure**
- **Vercel** – Frontend deployment  
- **Docker** – Containerization  
- **CI/CD** – Automated testing and deployment  

---

## ⚙️ Installation

### **Prerequisites**
- Node.js ≥ 18  
- npm or yarn  
- Supabase account  
- Git  

### **Setup Instructions**

```bash
# Clone repository
git clone https://github.com/your-org/lerni.git
cd lerni

# Copy and configure environment variables
cp .env.example .env.local
# (Add Supabase and API credentials)

# Install dependencies
npm install

# Setup database
npx supabase migration up
npm run db:seed

# Start development servers
npm run dev           # Frontend
npm run dev:server    # Backend
🚀 Development
Project Structure
bash
Copy code
lerni/
├── apps/
│   ├── web/           # React frontend
│   ├── api/           # Backend API
│   └── admin/         # Admin dashboard
├── packages/
│   ├── ui/            # Shared components
│   ├── utils/         # Utility functions
│   ├── database/      # Schemas and types
│   └── game-engine/   # Phaser game logic
├── docs/              # Documentation
└── tools/             # Dev scripts and config
Common Commands
bash
Copy code
npm run dev          # Start development
npm run build        # Production build
npm run test         # Run tests
npm run test:e2e     # End-to-end tests
npm run lint         # Lint code
npm run type-check   # TypeScript check
📦 Deployment
Production
bash
Copy code
npm run build
vercel --prod
Setup Notes
Configure environment variables in Vercel Dashboard

Use production Supabase credentials

Optimize CDN delivery for assets

🎮 Core Components
Adaptive Learning Engine
Detects dyslexia-related challenges

Calibrates difficulty dynamically

Builds optimized learning sequences

Game Generation System
Reusable templates with dynamic content

Real-time adaptation to learner state

Integrates with overall progress tracking

User Management
Profile and session tracking

Progress analytics dashboard

Personalized recommendations

🐛 Known Issues
Priority	Issue	Impact	Status
🔴 High	Authentication flow inconsistency	Confusing onboarding	Needs unified flow
🔴 High	AI assistant lacks contextual understanding	Reduced personalization	NLP integration planned
🟠 Medium	Header redirects incorrectly	Navigation inconsistency	Conditional routing update
🟠 Medium	Simplistic game variations	Limited engagement	Enhanced game templates in progress

🤝 Contributing
Workflow
Fork the repository

Create a new branch

bash
Copy code
git checkout -b feature/amazing-feature
Commit and push

bash
Copy code
git commit -m "Add amazing feature"
git push origin feature/amazing-feature
Open a Pull Request

Code Guidelines
TypeScript strict mode enforced

ESLint + Prettier configured

Tests required for new features

Accessibility compliance (WCAG 2.1 AA)

📄 License
Licensed under the MIT License.
See LICENSE.md for full details.
