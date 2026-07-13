import React, { useState, useEffect } from 'react';
import { Mail, Book, HardDrive, AlertCircle } from 'lucide-react';

interface WorkspacePanelProps {
  accessToken: string | null;
}

export default function WorkspacePanel({ accessToken }: WorkspacePanelProps) {
  const [activeTab, setActiveTab] = useState<'classroom' | 'drive' | 'gmail'>('classroom');
  
  const [courses, setCourses] = useState<any[]>([]);
  const [files, setFiles] = useState<any[]>([]);
  const [emails, setEmails] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken) return;
    
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        if (activeTab === 'classroom') {
          const res = await fetch('https://classroom.googleapis.com/v1/courses', {
            headers: { Authorization: `Bearer ${accessToken}` }
          });
          if (!res.ok) throw new Error('Failed to fetch courses');
          const data = await res.json();
          setCourses(data.courses || []);
        } else if (activeTab === 'drive') {
          const res = await fetch('https://www.googleapis.com/drive/v3/files?pageSize=10&fields=files(id,name,mimeType,modifiedTime)', {
            headers: { Authorization: `Bearer ${accessToken}` }
          });
          if (!res.ok) throw new Error('Failed to fetch files');
          const data = await res.json();
          setFiles(data.files || []);
        } else if (activeTab === 'gmail') {
          const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=5', {
            headers: { Authorization: `Bearer ${accessToken}` }
          });
          if (!res.ok) throw new Error('Failed to fetch emails');
          const data = await res.json();
          
          if (data.messages) {
            const messageDetails = await Promise.all(
              data.messages.map(async (msg: any) => {
                const detailRes = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From`, {
                  headers: { Authorization: `Bearer ${accessToken}` }
                });
                return detailRes.json();
              })
            );
            setEmails(messageDetails);
          } else {
            setEmails([]);
          }
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [activeTab, accessToken]);

  if (!accessToken) {
    return (
      <div className="bg-slate-panel/20 border border-slate-panel p-6 rounded-lg text-center">
        <AlertCircle className="text-amber-neon mx-auto mb-3" size={32} />
        <h3 className="font-bold text-text-main text-lg">Workspace Access Required</h3>
        <p className="text-sm text-text-muted mt-2">Sign in with Google to view your connected Classroom, Drive, and Gmail data.</p>
      </div>
    );
  }

  return (
    <div className="bg-obsidian border border-slate-panel rounded-lg overflow-hidden flex flex-col h-[500px]">
      <header className="flex border-b border-slate-panel bg-slate-base">
        <button 
          onClick={() => setActiveTab('classroom')}
          className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 font-bold text-sm transition-colors border-b-2 ${activeTab === 'classroom' ? 'border-emerald-neon text-emerald-neon' : 'border-transparent text-text-muted hover:text-text-main'}`}
        >
          <Book size={16} /> Classroom
        </button>
        <button 
          onClick={() => setActiveTab('drive')}
          className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 font-bold text-sm transition-colors border-b-2 ${activeTab === 'drive' ? 'border-violet-neon text-violet-neon' : 'border-transparent text-text-muted hover:text-text-main'}`}
        >
          <HardDrive size={16} /> Drive
        </button>
        <button 
          onClick={() => setActiveTab('gmail')}
          className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 font-bold text-sm transition-colors border-b-2 ${activeTab === 'gmail' ? 'border-cyan-neon text-cyan-neon' : 'border-transparent text-text-muted hover:text-text-main'}`}
        >
          <Mail size={16} /> Gmail
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-4 bg-bg-code">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="w-6 h-6 border-2 border-slate-400 border-t-amber-neon rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="text-red-400 text-sm p-4 bg-red-400/10 rounded border border-red-400/20">
            Error: {error}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {activeTab === 'classroom' && (
              courses.length > 0 ? courses.map(course => (
                <div key={course.id} className="bg-slate-panel/30 border border-slate-panel p-3 rounded hover:bg-slate-panel/50 transition-colors">
                  <h4 className="font-bold text-text-main text-sm">{course.name}</h4>
                  <p className="text-xs text-text-muted mt-1">Section: {course.section || 'N/A'}</p>
                </div>
              )) : (
                <p className="text-text-muted text-sm text-center py-8">No courses found.</p>
              )
            )}

            {activeTab === 'drive' && (
              files.length > 0 ? files.map(file => (
                <div key={file.id} className="bg-slate-panel/30 border border-slate-panel p-3 rounded hover:bg-slate-panel/50 transition-colors flex items-center justify-between">
                  <div className="truncate pr-4">
                    <h4 className="font-bold text-text-main text-sm truncate">{file.name}</h4>
                    <p className="text-xs text-text-muted mt-1 truncate">{file.mimeType}</p>
                  </div>
                  <div className="text-[10px] text-text-muted whitespace-nowrap">
                    {new Date(file.modifiedTime).toLocaleDateString()}
                  </div>
                </div>
              )) : (
                <p className="text-text-muted text-sm text-center py-8">No files found.</p>
              )
            )}

            {activeTab === 'gmail' && (
              emails.length > 0 ? emails.map(email => {
                const subject = email.payload.headers.find((h: any) => h.name === 'Subject')?.value || 'No Subject';
                const from = email.payload.headers.find((h: any) => h.name === 'From')?.value || 'Unknown Sender';
                return (
                  <div key={email.id} className="bg-slate-panel/30 border border-slate-panel p-3 rounded hover:bg-slate-panel/50 transition-colors">
                    <h4 className="font-bold text-text-main text-sm truncate">{subject}</h4>
                    <p className="text-xs text-text-muted mt-1 truncate">From: {from}</p>
                  </div>
                )
              }) : (
                <p className="text-text-muted text-sm text-center py-8">No emails found.</p>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}
