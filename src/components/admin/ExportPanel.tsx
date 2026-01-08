/**
 * Export Panel Component
 * Boutons d'export CSV/JSON pour toutes les données
 */

'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { exportUsers, exportSessions, exportUISettings, exportTranslations } from '@/actions/export';
import { Download, Loader2, FileText, Database } from 'lucide-react';

export function ExportPanel() {
  const [isExporting, setIsExporting] = useState<string | null>(null);

  const handleExport = async (
    type: 'users' | 'sessions' | 'settings' | 'translations',
    format: 'csv' | 'json'
  ) => {
    setIsExporting(`${type}-${format}`);

    try {
      let result;
      switch (type) {
        case 'users':
          result = await exportUsers(format);
          break;
        case 'sessions':
          result = await exportSessions(format);
          break;
        case 'settings':
          result = await exportUISettings();
          break;
        case 'translations':
          result = await exportTranslations();
          break;
      }

      if (result.success) {
        // Télécharger le fichier
        const blob = new Blob([result.data], { 
          type: format === 'csv' ? 'text/csv' : 'application/json' 
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = result.filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        toast.success('Export réussi !');
      } else {
        toast.error(result.error || 'Échec de l\'export');
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Erreur lors de l\'export');
    } finally {
      setIsExporting(null);
    }
  };

  const ExportCard = ({
    title,
    description,
    type,
    icon: Icon,
    csvAvailable = true,
  }: {
    title: string;
    description: string;
    type: 'users' | 'sessions' | 'settings' | 'translations';
    icon: any;
    csvAvailable?: boolean;
  }) => (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-blue-600" />
          <CardTitle className="text-lg">{title}</CardTitle>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          {csvAvailable && (
            <Button
              onClick={() => handleExport(type, 'csv')}
              disabled={isExporting === `${type}-csv`}
              data-testid={`export-${type}-csv`}
            >
              {isExporting === `${type}-csv` ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Export CSV
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => handleExport(type, 'json')}
            disabled={isExporting === `${type}-json`}
            data-testid={`export-${type}-json`}
          >
            {isExporting === `${type}-json` ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Export JSON
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <ExportCard
        title="Utilisateurs"
        description="Exporter tous les comptes utilisateurs (sans mots de passe)"
        type="users"
        icon={Database}
      />

      <ExportCard
        title="Sessions"
        description="Exporter toutes les sessions avec statistiques"
        type="sessions"
        icon={FileText}
      />

      <ExportCard
        title="UI Settings"
        description="Exporter la configuration du thème (JSON uniquement)"
        type="settings"
        icon={Database}
        csvAvailable={false}
      />

      <ExportCard
        title="Traductions"
        description="Exporter toutes les traductions FR/EN/DE (JSON uniquement)"
        type="translations"
        icon={FileText}
        csvAvailable={false}
      />
    </div>
  );
}
