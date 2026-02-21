/**
 * @file Dashboard.tsx
 * @description Modern dashboard showing all projects with create and manage options.
 */
import { useProjectStore } from '../store/useProjectStore';
import { useNavigate } from 'react-router-dom';
import { Plus, FolderOpen, Trash2, Settings, FileCode, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';

export function Dashboard() {
  const { projects, createProject, deleteProject, setCurrentProject } = useProjectStore();
  const navigate = useNavigate();

  const handleCreateProject = () => {
    const name = prompt('Enter project name:', 'Untitled Deck');
    if (name !== null) {
      const id = createProject(name.trim() || 'Untitled Deck');
      navigate(`/editor/${id}`);
    }
  };

  const handleOpenProject = (id: string) => {
    setCurrentProject(id);
    navigate(`/editor/${id}`);
  };

  const handleDeleteProject = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this project?')) {
      deleteProject(id);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-1.5">OpenSlides</h1>
            <p className="text-muted-foreground">Manage your presentation projects</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => navigate('/settings')}
              className="gap-2"
            >
              <Settings className="h-4 w-4" />
              Settings
            </Button>
            <Button onClick={handleCreateProject} className="gap-2">
              <Plus className="h-4 w-4" />
              New Project
            </Button>
          </div>
        </div>

        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-muted rounded-xl bg-muted/20">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <FolderOpen className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No projects yet</h2>
            <p className="text-muted-foreground mb-4 max-w-sm">
              Create your first presentation project to get started. Your work will be saved automatically.
            </p>
            <Button onClick={handleCreateProject} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Project
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <Card
                key={project.id}
                className="group cursor-pointer hover:shadow-lg transition-all duration-200 hover:border-primary/50 hover:-translate-y-0.5"
                onClick={() => handleOpenProject(project.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                        <FileCode className="h-4.5 w-4.5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base font-semibold">{project.name}</CardTitle>
                        <CardDescription className="text-xs">
                          {project.slides.length} slide{project.slides.length !== 1 ? 's' : ''}
                        </CardDescription>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
                      onClick={(e) => handleDeleteProject(e, project.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pb-3">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="px-2 py-1 rounded-md bg-muted font-medium text-foreground/70">
                      {project.theme}
                    </span>
                  </div>
                </CardContent>
                <CardFooter className="flex items-center justify-between pt-0">
                  <span className="text-xs text-muted-foreground">
                    Updated {formatDate(project.updatedAt)}
                  </span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
