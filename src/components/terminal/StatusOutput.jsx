// src/components/terminal/StatusOutput.jsx
import React from 'react';
import { GITHUB_USERNAME } from '../../data/appData';

const StatusOutput = () => {
  // Simple ASCII art - feel free to replace it with your own!
  const asciiArt = `
    ███████╗██╗   ██╗██████╗ ██╗  ██╗
    ██╔════╝██║   ██║██╔══██╗██║  ██║
    ███████╗██║   ██║██████╔╝███████║
    ╚════██║██║   ██║██╔══██╗██╔══██║
    ███████║╚██████╔╝██████║ ██║  ██║
    ╚══════╝ ╚═════╝ ╚═╝ ╚═╝ ╚═╝  ╚═╝
https://www.instagram.com/notthatsubh/
                         ______                     
 _________        .---"""      """---.              
:______.-':      :  .--------------.  :             
| ______  |      | :                : |             
|:______B:|      | |  Little Error: | |             
|:______B:|      | |                | |             
|:______B:|      | |  Instagram     | |             
|         |      | |  bug found.    | |             
|:_____:  |      | |                | |             
|    ==   |      | :                : |             
|       O |      :  '--------------'  :             
|       o |      :'---...______...---'              
|       o |-._.-i___/'             \\._              
|'-.____o_|   '-.   '-...______...-'  \`-._          
:_________:      \`-.____________________   \`-.___.-. 
                 .'.eeeeeeeeeeeeeeeeee.'.      :___:
    fsc        .'.eeeeeeeeeeeeeeeeeeeeee.'.         
              :____________________________:
`;

  const info = {
    name: 'Subhanshu Shekhar',
    title: 'Full-Stack Developer',
    skills: {
      'Frontend': 'React, Next.js, TypeScript',
      'Backend': 'Node.js, Express, Python',
      'Databases': 'PostgreSQL, MongoDB',
      'DevOps': 'Docker, AWS, Vercel',
    },
    socials: {
      'GitHub': `github.com/${GITHUB_USERNAME}`,
      'LinkedIn': 'linkedin.com/in/subhanshu-shekhar/',
      'Email': 'subhanshu.email@gmail.com',
    }
  };

  const InfoLine = ({ label, value }) => (
    <div>
      <span className="text-cyan-300 font-bold">{label.padEnd(10)}:</span>
      <span>{value}</span>
    </div>
  );

  return (
    <div className="flex flex-col md:flex-row gap-4 md:gap-8 font-mono text-sm">
      <pre className="text-blue-400">{asciiArt}</pre>
      <div className="flex-1 space-y-1">
        <div className="text-lg font-bold">{info.name}</div>
        <div>{info.title}</div>
        <br />
        <div className="font-bold text-yellow-300">-- Skills --</div>
        {Object.entries(info.skills).map(([key, value]) => (
          <InfoLine key={key} label={key} value={value} />
        ))}
        <br />
        <div className="font-bold text-yellow-300">-- Contact --</div>
        {Object.entries(info.socials).map(([key, value]) => (
          <InfoLine key={key} label={key} value={value} />
        ))}
      </div>
    </div>
  );
};

export default StatusOutput;