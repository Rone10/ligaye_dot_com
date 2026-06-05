# Ligaye.com 🇬🇲

**Ligaye.com** is an open-source job board platform built specifically to serve and empower the Gambian market. Our mission is to seamlessly connect job seekers with employers, providing a tailored, accessible, and modern platform for the local workforce.

By making this project open-source, we hope to foster a community-driven effort to build better digital infrastructure and improve employment opportunities in The Gambia.

## 🌟 Why Open Source?
We believe that technology built *for* the community should be built *with* the community. Whether you're a local developer looking to contribute to Gambian tech solutions or an international developer wanting to support impactful projects, your contributions are welcome! 

This platform is completely transparent, allowing anyone to suggest improvements, audit the code, or add features that specifically address the unique needs of the Gambian job market.

## ✨ Features
- **Tailored for The Gambia**: Localized locations, industries, and relevant payment/application flows.
- **For Job Seekers**: Create comprehensive candidate profiles, manage skills, and apply for jobs easily.
- **For Employers**: Post roles, search candidate databases, and manage applicants efficiently.

## 🚀 Tech Stack
This project is built using modern web development tools:
- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database & Auth**: [Supabase](https://supabase.com/) (PostgreSQL)
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [Shadcn UI](https://ui.shadcn.com/)
- **State Management**: React Query & `nuqs`
- **Package Manager**: pnpm

## 🛠️ Getting Started

### Prerequisites
- Node.js (v18+)
- `pnpm` installed (`npm install -g pnpm`)
- A [Supabase](https://supabase.com/) project (for local development)

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/your-org/ligaye_dot_com.git
   cd ligaye_dot_com
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Set up environment variables:
   Copy `.env.example` to `.env.local` and fill in your Supabase credentials:
   ```bash
   cp .env.example .env.local
   ```
   
4. Run the development server:
   ```bash
   pnpm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the application in your browser.

## 🤝 Contributing
We welcome all forms of contributions! Whether it's fixing a bug, adding a new feature, improving documentation, or suggesting ideas to better serve Gambian users, your help is appreciated.

If you are a developer looking to contribute, please feel free to browse the open issues or submit a pull request. Let's build something great for The Gambia together!

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
