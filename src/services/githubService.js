// src/services/githubService.js
export const fetchGitHubProjects = async (username) => {
  try {
    const response = await fetch(`https://api.github.com/users/${username}/repos?sort=pushed&per_page=5`);
    if (!response.ok) throw new Error(`GitHub API error: ${response.status}`);
    
    const repos = await response.json();
    const mappedProjects = repos.filter(repo => !repo.fork).map(repo => ({
      id: repo.name,
      title: repo.name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      description: repo.description || 'No description available',
      technologies: repo.topics || [],
      repoUrl: repo.html_url
    }));

    const formattedProjectsCode = `const projects = [\n${mappedProjects.map(p => `  {\n    id: '${p.id}',\n    title: '${p.title}',\n    // ... and more properties\n  }`).join(',\n')}\n];`;
    
    return { projects: mappedProjects, code: formattedProjectsCode };
  } catch (err) {
    console.error("Failed to fetch projects:", err);
    return { projects: [], code: `// Error fetching projects: ${err.message}` };
  }
};