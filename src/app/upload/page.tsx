import { FileUpload } from '@/components/file-upload';
import { ShieldX, Lock, Eye, Server } from 'lucide-react';

export default function UploadPage() {
  return (
    <div className="container py-12">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Analyze a Browser Extension</h1>
        <p className="mt-3 text-muted-foreground">
          Upload a .crx or .zip file, or paste a Chrome Web Store URL. Analysis runs locally — your files never leave your server.
        </p>
      </div>

      <div className="mt-10">
        <FileUpload />
      </div>

      {/* Privacy badges */}
      <div className="mx-auto mt-12 grid max-w-2xl grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { icon: Lock, label: 'Local Processing' },
          { icon: Eye, label: 'No Tracking' },
          { icon: Server, label: 'No Cloud Upload' },
          { icon: ShieldX, label: 'Zero Data Retention' },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="glass flex flex-col items-center gap-2 rounded-xl p-4 text-center">
              <Icon className="h-5 w-5 text-brand-400" />
              <span className="text-xs font-medium text-muted-foreground">{item.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
