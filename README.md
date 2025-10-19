Lerni
A Duolingo-style learning platform specifically designed for dyslexic learners, combining adaptive learning technology with evidence-based instructional methods.


🎯 Overview
Lerni is a Duolingo-style learning platform that uses mini-games and Orton–Gillingham methods to help people with dyslexia improve reading skills in a fun, interactive, and intelligent way. Unlike traditional apps, Lerni adapts in real time: it tracks mistakes, reaction time, and patterns of confusion (like b/d or “tion/sion”), then uses AI and predictive logic to automatically choose the next best activity, difficulty level, or game type. As the player improves, the games evolve. When they struggle, Lerni slows down and gives targeted practice. Over time, the system learns each user’s unique challenges, stores progress, and builds a personalized path to reading success. It feels like a game—but thinks like a learning specialist.

Adaptive Learning Engine
The system employs sophisticated tracking mechanisms that monitor:

Error patterns (b/d reversals, "tion/sion" confusions)

Response latency and processing speed

Struggle indicators and frustration signals

Progression velocity and mastery rates

This data fuels predictive algorithms that automatically:

Select optimal activity sequences

Adjust difficulty gradients in real-time

Match game types to learning modalities

Provide targeted intervention for specific challenge areas

✨ Key Features
🎮 Game-Based Learning Infrastructure
Multi-sensory mini-games combining visual, auditory, and kinesthetic elements

Progressive challenge structures that maintain engagement

Immediate feedback mechanisms with constructive guidance

🧠 Intelligent Personalization
AI-driven content adaptation based on learner profiles

Predictive analytics for identifying emerging challenges

Dynamic difficulty adjustment algorithms

Personalized learning pathways that evolve with user progress

🔤 Evidence-Based Methodology
Orton–Gillingham aligned instructional design

Structured literacy principles implementation

Multi-sensory integration techniques

Sequential, cumulative skill building

📊 Advanced Analytics
Comprehensive progress monitoring

Strength and weakness identification

Learning pattern analysis

Growth trajectory forecasting

🏗 Architecture
System Layers
text
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   React     │  │   Phaser    │  │   Mobile Adaptive   │  │
│  │ Components  │  │   Games     │  │     Layouts         │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                    Application Layer                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │  Routing &  │  │   State     │  │   API Gateway &     │  │
│  │ Navigation  │  │ Management  │  │   Middleware        │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                     Business Layer                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ Adaptive    │  │  Game       │  │   Progress &        │  │
│  │ Learning    │  │  Logic      │  │   Analytics         │  │
│  │ Engine      │  │  Engine     │  │   Engine            │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                     Data Layer                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │  User &     │  │  Learning   │  │   Game & Content    │  │
│  │  Session    │  │  Analytics  │  │   Repository        │  │
│  │  Database   │  │  Database   │  │                     │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
🛠 Technology Stack
Frontend Layer
TypeScript - Type-safe development and enhanced maintainability

React - Component-based UI architecture

Phaser.js - Game engine for interactive learning experiences

Custom CSS/SASS - Responsive design system

Backend Layer
Node.js - Runtime environment

Express.js - API framework and middleware

WebSocket - Real-time communication for game interactions

Data Layer
Supabase - PostgreSQL database with real-time capabilities

Redis - Session management and caching

File Storage - Asset management for game content

AI & Analytics Layer
TensorFlow.js - Client-side machine learning

Custom Predictive Engine - Adaptive learning algorithms

Analytics Pipeline - Learning pattern analysis

Infrastructure & Deployment
Vercel - Frontend deployment platform

Docker - Containerization

CI/CD Pipeline - Automated testing and deployment

⚙️ Installation
Prerequisites
Node.js 18+

npm or yarn

Supabase account

Git

Local Development Setup
Clone Repository

bash
git clone https://github.com/your-org/lerni.git
cd lerni
Environment Configuration

bash
cp .env.example .env.local
# Configure environment variables for Supabase, API keys, etc.
Install Dependencies

bash
npm install
# or
yarn install
Database Setup

bash
# Run database migrations
npx supabase migration up

# Seed initial data
npm run db:seed
Start Development Servers

bash
# Frontend development
npm run dev

# Backend API (if separate)
npm run dev:server
🚀 Development
Project Structure
text
lerni/
├── apps/
│   ├── web/                 # Main React application
│   ├── api/                 # Backend API server
│   └── admin/               # Admin dashboard
├── packages/
│   ├── ui/                  # Shared UI components
│   ├── utils/               # Utility functions
│   ├── database/            # Database schema and types
│   └── game-engine/         # Phaser game logic
├── docs/                    # Documentation
└── tools/                   # Development tools and scripts
Key Development Scripts
bash
npm run dev          # Start development server
npm run build        # Build for production
npm run test         # Run test suite
npm run test:e2e     # Run end-to-end tests
npm run lint         # Code linting
npm run type-check   # TypeScript type checking
📦 Deployment
Production Deployment
bash
# Build and deploy to Vercel
npm run build
vercel --prod
Environment Setup
Production Environment Variables must be configured in Vercel dashboard

Database Connections require production Supabase credentials

CDN Configuration for asset optimization

🎮 Core Components
Adaptive Learning Engine
Pattern Recognition - Identifies specific dyslexia-related challenges

Difficulty Calibration - Dynamic adjustment based on performance metrics

Content Sequencing - Optimized learning path generation

Game Generation System
Template-Based Games - Reusable game mechanics with customizable content

Dynamic Content Injection - Real-time adaptation of game elements

Progress Integration - Seamless connection to learning objectives

User Management
Profile System - Comprehensive learner profiles

Session Tracking - Detailed activity monitoring

Progress Analytics - Multi-dimensional progress measurement

🐛 Outstanding Issues
High Priority
Authentication Flow Inconsistency

Issue: 'I already have an account' button redirects to login page but displays 'Get Started' button

Impact: User experience confusion during onboarding

Required: Unified authentication flow with consistent labeling

AI Assistant Limitations

Issue: Current AI bot lacks rich contextual understanding and response capabilities

Impact: Reduced effectiveness of personalized guidance

Required: Enhanced API integration with advanced NLP capabilities

Medium Priority
Navigation Logic Error

Issue: Header icon redirects to home instead of dashboard when logged in

Impact: Navigation inconsistency for authenticated users

Required: Conditional routing based on authentication state

Game Generation Enhancement

Issue: Dynamic game generation produces overly simplistic game variations

Impact: Limited engagement and learning depth

Required: Advanced game template system with richer mechanics and content variety

🤝 Contributing
Development Workflow
Fork the repository

Create a feature branch (git checkout -b feature/amazing-feature)

Commit changes (git commit -m 'Add amazing feature')

Push to branch (git push origin feature/amazing-feature)

Open a Pull Request

Code Standards
TypeScript strict mode enabled

ESLint and Prettier configuration provided

Comprehensive testing required for new features

Accessibility compliance (WCAG 2.1 AA)

📄 License
This project is licensed under the MIT License - see the LICENSE.md file for details.
