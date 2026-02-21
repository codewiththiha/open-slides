/**
 * @file Settings.tsx
 * @description Modern settings page for managing storage and application preferences.
 */
import { useProjectStore } from '../store/useProjectStore';
import { useNavigate } from 'react-router-dom';
import { Trash2, ArrowLeft, Database, HardDrive, AlertTriangle } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';

export function Settings() {
  const { projects, clearAllProjects } = useProjectStore();
  const navigate = useNavigate();

  const handleClearAll = () => {
    if (confirm('Are you sure you want to delete ALL projects? This action cannot be undone.')) {
      const confirmText = prompt('Type "DELETE ALL" to confirm:');
      if (confirmText === 'DELETE ALL') {
        clearAllProjects();
        localStorage.removeItem('openslides-presentation');
      }
    }
  };

  const getStorageSize = () => {
    let total = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        total += localStorage[key].length * 2;
      }
    }
    return (total / 1024).toFixed(2);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4 max-w-3xl">
        <div className="flex items-center gap-3 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
            className="h-9 w-9"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Settings</h1>
            <p className="text-sm text-muted-foreground">Manage storage and application data</p>
          </div>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Database className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">Storage Information</CardTitle>
                  <CardDescription className="text-xs">View and manage local storage usage</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <HardDrive className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Local Storage Size</span>
                </div>
                <span className="text-lg font-bold font-mono">{getStorageSize()} KB</span>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Total Projects</p>
                  <p className="text-2xl font-bold">{projects.length}</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Presentation Data</p>
                  <p className="text-lg font-bold">
                    {localStorage.getItem('openslides-presentation') ? (
                      <span className="text-green-600 dark:text-green-500">Saved</span>
                    ) : (
                      <span className="text-muted-foreground">None</span>
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-destructive/10 flex items-center justify-center">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                </div>
                <div>
                  <CardTitle className="text-base text-destructive">Danger Zone</CardTitle>
                  <CardDescription className="text-xs">Irreversible actions to manage your data</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <Alert variant="destructive">
                <AlertDescription className="text-xs">
                  These actions cannot be undone. Make sure you want to proceed before deleting any data.
                </AlertDescription>
              </Alert>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <h3 className="text-sm font-medium">Clear All Data</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Delete all {projects.length} project{projects.length !== 1 ? 's' : ''} and reset presentation data
                  </p>
                </div>
                <Button
                  variant="destructive"
                  onClick={handleClearAll}
                  disabled={projects.length === 0 && !localStorage.getItem('openslides-presentation')}
                  className="gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Clear All
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
