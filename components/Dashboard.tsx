import React, { useState } from 'react';
import { Plus, FolderOpen, Clock, Edit2, ArrowRight, Trash2, AlertTriangle, ImageOff } from 'lucide-react';
import { Project } from '../types';

interface DashboardProps {
  projects: Project[];
  onOpenProject: (project: Project) => void;
  onCreateProject: (name: string) => void;
  onDeleteProject: (projectId: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ projects, onOpenProject, onCreateProject, onDeleteProject }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProjectName.trim()) {
      onCreateProject(newProjectName);
      setIsModalOpen(false);
      setNewProjectName('');
    }
  };

  const confirmDelete = () => {
    if (projectToDelete) {
      onDeleteProject(projectToDelete);
      setProjectToDelete(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] p-8 md:p-16">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-3xl font-light tracking-tight text-white">Lumen 2.0<span className="text-blue-500">.</span></h1>
            <p className="text-gray-500 mt-1 text-sm">Professional AI photo Studio for Industrial Design</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-white text-black px-6 py-3 rounded-full font-medium hover:bg-gray-200 transition-colors flex items-center gap-2"
          >
            <Plus size={18} />
            New Project
          </button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project) => (
            <div 
              key={project.id}
              onClick={() => onOpenProject(project)}
              className="group bg-[#222] border border-neutral-800 rounded-xl overflow-hidden hover:border-neutral-600 cursor-pointer transition-all hover:shadow-2xl hover:shadow-black/50"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-black flex items-center justify-center">
                 <img 
                   src={project.thumbnailUrl} 
                   alt={project.name}
                   className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                   onError={(e) => {
                     // Hide image and show fallback
                     const target = e.target as HTMLImageElement;
                     target.style.display = 'none';
                     target.nextElementSibling?.classList.remove('hidden');
                   }}
                 />
                 {/* Fallback displayed if img fails */}
                 <div className="hidden absolute inset-0 bg-neutral-900 flex flex-col items-center justify-center text-neutral-700">
                    <ImageOff size={32} className="mb-2 opacity-50"/>
                    <span className="text-xs font-medium">Preview Unavailable</span>
                 </div>
                 
                 <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-60 pointer-events-none"></div>
              </div>
              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-medium text-white group-hover:text-blue-400 transition-colors truncate pr-4 flex-1">
                    {project.name}
                  </h3>
                  <div className="flex gap-1">
                    <button 
                      onClick={(e) => { e.stopPropagation(); }}
                      className="text-gray-600 hover:text-white transition-colors p-1"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button 
                      onClick={(e) => { 
                        e.stopPropagation();
                        e.preventDefault();
                        setProjectToDelete(project.id);
                      }}
                      className="text-gray-600 hover:text-red-500 transition-colors p-1"
                      title="Delete Project"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <div className="flex items-center text-xs text-gray-500 gap-1">
                  <Clock size={12} />
                  <span>Last edited {new Date(project.lastEdited).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
          
          {/* Create New Card Placeholder */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="group border border-dashed border-neutral-800 rounded-xl flex flex-col items-center justify-center text-gray-500 hover:text-white hover:border-neutral-600 hover:bg-neutral-900/50 transition-all aspect-[4/3] lg:aspect-auto"
          >
            <div className="w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Plus size={24} />
            </div>
            <span className="font-medium">Create New Project</span>
          </button>
        </div>
      </div>

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#222] border border-neutral-700 rounded-2xl w-full max-w-md p-8 shadow-2xl">
            <h2 className="text-xl font-semibold text-white mb-6">Start a New Project</h2>
            <form onSubmit={handleCreateSubmit}>
              <div className="mb-6">
                <label className="block text-xs font-medium text-gray-400 mb-2 uppercase">Project Name</label>
                <input
                  type="text"
                  autoFocus
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="e.g. Modular Headphones Concept"
                  className="w-full bg-black border border-neutral-700 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 text-sm font-medium text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newProjectName.trim()}
                  className="px-5 py-2.5 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                >
                  Enter Studio <ArrowRight size={16} />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {projectToDelete && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#222] border border-neutral-700 rounded-2xl w-full max-w-sm p-8 shadow-2xl">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mb-4">
                <AlertTriangle size={24} />
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">Delete Project?</h2>
              <p className="text-gray-400 text-sm mb-6">
                Are you sure you want to delete this project? This action cannot be undone and all generations will be lost.
              </p>
              
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setProjectToDelete(null)}
                  className="flex-1 px-5 py-2.5 text-sm font-medium text-gray-400 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-5 py-2.5 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-500 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;