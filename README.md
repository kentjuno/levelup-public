# levelup-public


# LevelUp Life - Gamify Your Goals

![LevelUp Life Hero](https://placehold.co/1200x630.png?text=LevelUp+Life)

**LevelUp Life** is a comprehensive web application designed to transform your personal and professional development into an engaging and motivating Role-Playing Game (RPG). By applying principles of gamification, the app helps you deconstruct your ambitions into manageable quests, track your growth through a robust stats and leveling system, and foster a sense of community through collaborative challenges.

---

## 📜 Core Philosophy: Your Life, Your Adventure

The central idea behind LevelUp Life is that the journey of self-improvement is the most epic adventure one can embark on. However, real-world goals often lack the clear feedback, rewards, and sense of progression that make games so captivating. We bridge that gap.

- **Motivation through Progression**: Instead of a static to-do list, you get a dynamic character sheet that reflects your real-world efforts. Every task completed is a small victory that contributes to a larger goal, making the process feel rewarding and tangible.
- **Clarity through Structure**: Large, intimidating goals ("get fit," "learn a new skill") are broken down into **Quests** (the main objective) and **Tasks** (the repeatable actions). This structure, inspired by game design, provides a clear roadmap to success.
- **Community and Collaboration**: The **Weekly Boss Battles** transform the solitary path of self-improvement into a collaborative effort, creating a shared sense of purpose and collective achievement.

---

## ✨ Key Features: An In-Depth Look

### 1. The Quest System: Your Adventure Log

This is the heart of LevelUp Life. The system is designed for maximum flexibility to fit any goal.

-   **Quests**: These are your main objectives (e.g., "Run a Marathon," "Learn Vietnamese," "Build a Website"). Each quest has a title, description, and an optional **bonus XP** reward upon completion.
-   **Tasks**: These are the small, repeatable actions that build up to completing your quest. For the "Run a Marathon" quest, tasks might include "Run 5km," "Do stretching exercises," or "Research running shoes." Each task has its own XP value.
-   **Flexible Recurrence**: Tasks aren't just one-and-done. You can set them to recur:
    -   **Daily**: For building consistent habits.
    -   **Weekly/Bi-weekly/Monthly**: For less frequent but regular activities.
    -   **Specific Days of the Week**: For creating a structured weekly schedule (e.g., "Gym on Mon, Wed, Fri").
    -   **Once**: For one-off tasks within a larger quest.
-   **Due Dates**: Assign deadlines to your quests to create a sense of urgency and time-bound commitment.

### 2. Player Progression: Quantifying Your Growth

Your efforts are translated into meaningful statistics, creating a tangible representation of your progress.

-   **XP & Leveling**: Every task and quest completion grants you Experience Points (XP). Accumulating XP increases your **Level**, with the requirement for the next level growing exponentially. Leveling up is a major milestone that comes with celebratory feedback.
-   **Categorized Stats**: To encourage balanced growth, all XP is funneled into one of three core stats:
    -   ❤️ **Strength**: For physical activities, fitness, and health-related goals.
    -   🧠 **Intelligence**: For learning, skill acquisition, and knowledge-based pursuits.
    -   ✨ **Soul**: For mental wellness, creativity, mindfulness, and personal reflection.
-   **Player Vitality (HP & Energy)**:
    -   **HP (Health Points)**: Represents your discipline and consistency. You start with a full HP bar. Completing tasks restores a small amount of HP, but failing to complete scheduled tasks for a day will result in HP loss. Low HP can affect your XP gain, creating a strategic incentive to stay on track.
    -   **Energy**: A resource used for special actions, primarily attacking the Weekly Boss. Energy regenerates slowly over time, requiring you to think strategically about when to engage in major challenges.

### 3. Weekly Boss Battles: A Collaborative Challenge

Every week, the entire LevelUp Life community faces a common metaphorical enemy, such as "The Procrastination Dragon" or "The Doomscrolling Hydra."

-   **Shared Goal**: The boss has a massive global health pool.
-   **Damage Calculation**: Every point of XP you earn from your personal quests automatically deals 1 point of damage to the boss.
-   **Flavor Quests**: The boss comes with a unique "flavor quest" that reveals its weaknesses. Completing these thematic tasks (e.g., "Meditate for 10 minutes" to weaken the 'Anxiety Spirit') grants you a significant bonus damage multiplier.
-   **Rewards**: If the community defeats the boss by the end of the week, all contributing players can claim a reward, typically in the form of **Credits** used for other in-app features. Top contributors on the leaderboard receive larger rewards.

### 4. AI Goal Coach (Powered by Google's Gemini)

Feeling stuck or unsure how to start? The AI Coach is your personal strategist.

-   **Personalized Suggestions**: Provide the AI with a goal, your current habits, and your time commitment. It will analyze your input and generate a complete, structured **Quest** with actionable tasks, all formatted and ready to be added to your log.
-   **Obstacle & Solution Analysis**: Beyond just creating a quest, the AI also identifies potential obstacles you might face and suggests practical solutions to overcome them, drawing on psychological best practices for habit formation.
-   **Credit System**: This advanced feature costs credits, which are primarily earned by participating in and defeating the Weekly Boss, creating a balanced and rewarding gameplay loop.

### 5. Quest Pack Workshop: Create & Share

The Workshop is a community hub for sharing and discovering pre-made sets of quests.

-   **Create**: Build your own themed "Quest Packs" (e.g., "A 30-Day Digital Detox," "Beginner's Guide to Cooking").
-   **Share**: Publish your packs to the community.
-   **Discover**: Browse, search, and filter packs created by other users. You can sort by newest, most popular (by upvotes), or trending.
-   **Download**: Add an entire pack or individual quests from a pack directly to your adventure log with a single click.

### 6. Achievements, Leaderboards & Tiers

-   **Achievements**: Unlock dozens of unique badges for reaching milestones, such as completing your first 100 tasks, maintaining a long streak, or defeating a boss.
-   **Leaderboard**: See how your damage contribution to the Weekly Boss ranks against other players. You can click on any player to view their public profile.
-   **User Tiers**: As you progress, you can advance through Tiers (Bronze, Silver, Gold, Diamond). Each tier unlocks higher limits for your active quests and tasks, rewarding long-term engagement.

### 7. Admin Dashboard: The Control Room

A comprehensive backend for administrators to manage the application, including:
- User management (view profiles, manage tiers, adjust HP/Energy).
- Sending global announcements.
- Viewing and managing user feedback.
- Generating and setting the Weekly Boss.
- Configuring application settings like Tier limits.

---

## 🚀 Tech Stack & Architecture

LevelUp Life is built on a modern, robust, and scalable technology stack.

-   **Framework**: **[Next.js](https://nextjs.org/) (App Router)** is used for its hybrid rendering capabilities, server components for performance, and a file-based routing system that is both intuitive and powerful.
-   **UI Layer**:
    -   **[React](https://reactjs.org/) & [TypeScript](https://www.typescriptlang.org/)**: For building a type-safe, component-based, and interactive user interface.
    -   **[Tailwind CSS](https://tailwindcss.com/)**: A utility-first CSS framework for rapid and consistent styling.
    -   **[ShadCN UI](https://ui.shadcn.com/)**: A collection of beautifully designed, accessible, and reusable components that form the visual backbone of the app.
-   **Backend & Database**: **[Firebase](https://firebase.google.com/)** provides a comprehensive backend-as-a-service platform.
    -   **Firestore**: A NoSQL, document-based database used for storing all user data, quests, boss information, and more. Its real-time capabilities are leveraged for features like the boss health bar.
    -   **Firebase Authentication**: Handles secure user sign-up, login, and session management.
    -   **Firebase Storage**: Used for storing user-generated content, such as custom boss images.
-   **Generative AI**: **[Google's Genkit](https://firebase.google.com/docs/genkit)** serves as the orchestrator for all AI-powered features.
    -   **Gemini Models**: The state-of-the-art Gemini family of models is used for generating the personalized goal suggestions in the AI Coach and creating the thematic content for the Weekly Boss.

---

## 🛠️ Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later recommended)
- A [Firebase](https://firebase.google.com/) project.

### Installation & Setup

1.  **Clone the repository** (if you're not already in the Firebase Studio environment):
    ```bash
    git clone https://github.com/your-repo/level-up-life.git
    cd level-up-life
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Set up Environment Variables**:
    Create a file named `.env` in the root of your project and add your Firebase project credentials. You can find these in your Firebase project settings.

    ```env
    # Firebase Client SDK Configuration
    NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
    NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

    # Genkit Configuration (if needed for local testing)
    # GOOGLE_API_KEY=your_google_ai_api_key
    ```

4.  **Run the Development Server**:
    ```bash
    npm run dev
    ```

    The application will be available at `http://localhost:9002`.

## 📂 Project Structure

Here's a high-level overview of the key directories in the project:

```
.
├── public/                # Static assets (images, logos, sounds)
├── src/
│   ├── app/               # Next.js App Router pages and layouts
│   ├── ai/                # Genkit flows and AI-related logic
│   ├── components/        # Reusable React components (UI building blocks)
│   ├── context/           # React context providers (e.g., AuthContext)
│   ├── hooks/             # Custom React hooks (e.g., useRequireAuth)
│   ├── i18n/              # Internationalization (i18n) files (en.json, vi.json)
│   ├── lib/               # Core libraries, constants, types, and utils
│   ├── services/          # Backend service functions (interacting with Firestore)
│   └── ...
├── .env.example           # Example environment file
└── ...
```

---

*This project was bootstrapped and developed in Firebase Studio.*
