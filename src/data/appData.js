// src/data/appData.js
import { FileText } from 'lucide-react';

export const GITHUB_USERNAME = 'Shekharshubh1';

export const files = [
  { id: 'README.md', name: 'README.md', icon: FileText },
  { id: 'about.md', name: 'about.md', icon: FileText },
  { id: 'projects.js', name: 'projects.js', icon: FileText },
  { id: 'contact.txt', name: 'contact.txt', icon: FileText },
];

export const initialFileContents = {
  'README.md': `Welcome to my portfolio!

This is an interactive, terminal-based portfolio.
Type 'help' to see the list of available commands.`,
  'about.md': `// about.md
Hi, I'm Subhanshu Shekhar.

I'm a full-stack developer passionate about building elegant, scalable applications. My expertise lies in turning ideas into production-ready software.

• Frontend: React, Next.js, TypeScript
• Backend: Node.js, Express, Python
• DevOps: Docker, AWS, Vercel`,
  'contact.txt': `Let's connect! 🚀

📧 Email: subhanshu.email@gmail.com
🔗 LinkedIn: linkedin.com/in/subhanshu-shekhar/
🐙 GitHub: github.com/${GITHUB_USERNAME}`,
  'projects.js': `// Fetching projects...`
};