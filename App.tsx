import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import Studio from './components/Studio';
import { Project } from './types';
import { MOCK_PROJECTS } from './constants';
import { loadProjects, saveProject, deleteProject, saveProjects } from './db';
import { Loader2, AlertTriangle } from 'lucide-react';

type View = 'dashboard' | 'studio';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize projects from IndexedDB with strict logic
  useEffect(() => {
    const initData = async () => {
      try {
        const hasInitialized = localStorage.getItem('lumen_initialized');
        let loadedProjects = await loadProjects();
        
        // DEBUG LOGGING
        console.log('[Lumen Debug] Projects loaded from DB:', loadedProjects.length, '| Initialized Flag:', hasInitialized);

        if (!hasInitialized) {
          // --- TRUE FIRST RUN ---
          // Only if the flag is missing do we consider seeding.
          if (loadedProjects.length === 0) {
            console.log('[Lumen Debug] First run detected & DB empty. Seeding mock projects once.');
            await saveProjects(MOCK_PROJECTS);
            loadedProjects = MOCK_PROJECTS;
          }
          // Set the flag so we never enter this block again.
          localStorage.setItem('lumen_initialized', 'true');
        } else {
           // --- RETURNING USER ---
           // We trust the DB completely. If loadedProjects is empty, it stays empty.
           console.log('[Lumen Debug] Returning user. Using DB data exactly as is.');
        }

        setProjects(loadedProjects);

        // RESTORE SESSION: Check if user was in a specific project
        const lastActiveId = localStorage.getItem('lumen_active_project_id');
        if (lastActiveId) {
            const foundProject = loadedProjects.find(p => p.id === lastActiveId);
            if (foundProject) {
                setActiveProject(foundProject);
                setCurrentView('studio');
            } else {
                // Project no longer exists (maybe deleted in another tab)
                localStorage.removeItem('lumen_active_project_id');
            }
        }

      } catch (err) {
        console.error("Failed to initialize data:", err);
        setError("Failed to load project data. Your browser storage might be full or restricted.");
        // CRITICAL: DO NOT LOAD MOCKS HERE. 
        // We leave 'projects' as whatever it is (likely empty array from useState default).
      } finally {
        setIsLoading(false);
      }
    };

    initData();
  }, []);

  const handleOpenProject = (project: Project) => {
    setActiveProject(project);
    setCurrentView('studio');
    localStorage.setItem('lumen_active_project_id', project.id);
  };

  const handleCreateProject = async (name: string) => {
    const newProject: Project = {
      id: Date.now().toString(),
      name: name,
      thumbnailUrl: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=500&q=80', 
      lastEdited: new Date().toISOString(),
      generations: []
    };
    
    try {
      // Optimistic update
      setProjects(prev => [newProject, ...prev]);
      setActiveProject(newProject);
      setCurrentView('studio');
      localStorage.setItem('lumen_active_project_id', newProject.id);
      
      // Persist
      await saveProject(newProject);
    } catch (e) {
      console.error("Save failed", e);
      setError("Could not save new project. Storage quota exceeded.");
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      // Optimistic update
      setProjects(prev => prev.filter(p => p.id !== projectId));
      
      if (activeProject?.id === projectId) {
          setActiveProject(null);
          setCurrentView('dashboard');
          localStorage.removeItem('lumen_active_project_id');
      }

      // Persist
      await deleteProject(projectId);
    } catch (e) {
      console.error("Delete failed", e);
      setError("Failed to delete project.");
    }
  };

  const handleBackToDashboard = () => {
    setActiveProject(null);
    setCurrentView('dashboard');
    localStorage.removeItem('lumen_active_project_id');
    
    // Refresh list sort
    setProjects(prev => [...prev].sort((a, b) => new Date(b.lastEdited).getTime() - new Date(a.lastEdited).getTime()));
  };

  const handleUpdateProject = async (updatedProject: Project) => {
    try {
      // Optimistic update
      setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
      setActiveProject(updatedProject);
      
      // Persist
      await saveProject(updatedProject);
    } catch (e) {
      console.error("Update failed", e);
      setError("Warning: Changes could not be saved to disk. Storage full?");
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen w-screen bg-[#1a1a1a] flex flex-col items-center justify-center text-white">
        <Loader2 className="animate-spin mb-4" size={32} />
        <span className="text-sm font-medium tracking-widest uppercase text-gray-500">Loading Lumen 2.0</span>
      </div>
    );
  }

  return (
    <div className="font-sans antialiased text-white bg-[#1a1a1a] min-h-screen relative">
      {/* Global Error Banner */}
      {error && (
        <div className="fixed top-0 left-0 right-0 bg-red-600/90 text-white text-xs font-medium py-2 px-4 text-center z-[100] backdrop-blur-md flex items-center justify-center gap-2">
           <AlertTriangle size={14} />
           {error}
           <button onClick={() => setError(null)} className="ml-4 underline hover:text-white/80">Dismiss</button>
        </div>
      )}

      {currentView === 'dashboard' ? (
        <Dashboard 
          projects={projects} 
          onOpenProject={handleOpenProject} 
          onCreateProject={handleCreateProject} 
          onDeleteProject={handleDeleteProject}
        />
      ) : (
        activeProject && (
          <Studio 
            project={activeProject} 
            onBack={handleBackToDashboard} 
            onUpdateProject={handleUpdateProject}
          />
        )
      )}
    </div>
  );
};

export default App;