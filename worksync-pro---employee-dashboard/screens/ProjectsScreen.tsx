import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Clock,
  CheckCircle2,
  ExternalLink,
  Users,
  X,
  Target,
  User,
  Calendar,
  Zap,
  Loader2
} from 'lucide-react';
import { ProjectStatus, Project } from '../types';
import { projectService } from '../services/projectService';

const ProjectsScreen: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const data = await projectService.getMyProjects();
      if (Array.isArray(data)) {
        setProjects(data);
      }
    } catch (error) {
      console.error("Failed to fetch projects", error);
    }
  };

  const filteredProjects = projects.filter(p =>
    (p.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-[900] text-slate-900 tracking-tight leading-none">Project Board</h2>
          <p className="text-slate-500 font-bold text-sm mt-3">Coordinate your team's sprints and deliverables.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative group hidden sm:block">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <input
              type="text"
              placeholder="Quick search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 w-64 shadow-soft transition-all outline-none"
            />
          </div>
          <button className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-500 hover:bg-slate-50 transition-all shadow-soft active-scale">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {filteredProjects.length > 0 ? filteredProjects.map((project, idx) => (
          <div
            key={project.id || project._id}
            className="bg-white rounded-[32px] border border-slate-100 shadow-soft hover:shadow-premium hover:border-indigo-100 transition-all duration-300 group overflow-hidden hover-lift animate-scale-in"
          >
            <div className="p-8 space-y-6">
              <div className="flex justify-between items-start">
                <div className="w-14 h-14 rounded-[20px] bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 group-hover:rotate-6 shadow-soft">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div className="flex gap-2">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${project.status === 'active' ? 'bg-indigo-50 text-indigo-600' :
                    project.status === 'completed' ? 'bg-emerald-50 text-emerald-600' :
                      'bg-slate-50 text-slate-600'
                    }`}>
                    {project.status || 'Active'}
                  </span>
                  <button className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-50 transition-colors">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-[900] text-slate-900 group-hover:text-indigo-600 transition-colors leading-tight mb-2 tracking-tight">{project.name}</h3>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500 border border-slate-200 uppercase">{(project.assignedBy || 'Admin').charAt(0)}</div>
                  <p className="text-xs text-slate-500 font-bold">Manager</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                  <span className="text-slate-400">Velocity</span>
                  <span className="text-indigo-600 tabular-nums">{project.progress || 0}%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-50 rounded-full overflow-hidden shadow-inner ring-1 ring-slate-100">
                  <div
                    className="h-full bg-indigo-600 rounded-full transition-all duration-1000 ease-out group-hover:opacity-80"
                    style={{ width: `${project.progress || 0}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-rose-50 rounded-xl text-rose-600 border border-rose-100/50">
                  <Clock className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-tight">Due {project.deadline ? new Date(project.deadline).toLocaleDateString() : 'N/A'}</span>
                </div>
                <div className="flex -space-x-2.5">
                  {project.assignedTo && Array.isArray(project.assignedTo) && project.assignedTo.map((member: any, i: number) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-indigo-50 border-2 border-white flex items-center justify-center text-[10px] font-black text-indigo-600 shadow-soft cursor-help" title={member.name}>
                      {member.name ? member.name[0] : '?'}
                    </div>
                  ))}
                  {(!project.assignedTo || project.assignedTo.length === 0) && (
                    <div className="w-8 h-8 rounded-full bg-slate-50 border-2 border-white flex items-center justify-center text-[10px] font-black text-slate-400 shadow-soft">0</div>
                  )}
                </div>
              </div>
            </div>
            <div className="px-8 py-5 bg-slate-50/50 border-t border-slate-50 group-hover:bg-indigo-50/30 transition-colors flex items-center justify-center">
              <button className="flex items-center gap-2 text-xs font-black text-slate-600 group-hover:text-indigo-600 transition-all uppercase tracking-widest">
                Full Details
                <ExternalLink className="w-4 h-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
              </button>
            </div>
          </div>
        )) : (
          <div className="col-span-1 md:col-span-2 xl:col-span-3 text-center py-20 bg-slate-50 rounded-[32px] border border-slate-100 border-dashed">
            <p className="text-slate-400 font-bold">No assigned projects found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectsScreen;
