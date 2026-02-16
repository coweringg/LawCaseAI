import React from 'react';

interface FileGridProps {
    files: any[];
    onFileSelect: (file: any) => void;
    selectedFileId?: string;
}

export default function FileGrid({ files, onFileSelect, selectedFileId }: FileGridProps) {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {files.map((file) => (
                <div
                    key={file.id}
                    onClick={() => onFileSelect(file)}
                    className={`file-grid-item bg-white dark:bg-slate-900 p-4 rounded-xl border shadow-sm transition-all group cursor-pointer relative ${selectedFileId === file.id
                            ? 'border-2 border-primary ring-4 ring-primary/5'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-600'
                        }`}
                >
                    <div className={`aspect-square rounded-lg flex items-center justify-center mb-4 overflow-hidden ${selectedFileId === file.id ? 'bg-slate-100 dark:bg-slate-800' : 'bg-slate-50 dark:bg-slate-800'
                        }`}>
                        {/* Icon Logic based on type */}
                        {file.type === 'pdf' && <span className="material-icons-round text-red-500 text-5xl">description</span>}
                        {file.type === 'docx' && <span className="material-icons-round text-blue-500 text-5xl">article</span>}
                        {file.type === 'xlsx' && <span className="material-icons-round text-emerald-500 text-5xl">table_chart</span>}
                        {file.type === 'image' && <span className="material-icons-round text-amber-500 text-5xl">image</span>}
                        {!['pdf', 'docx', 'xlsx', 'image'].includes(file.type) && <span className="material-icons-round text-slate-400 text-5xl">insert_drive_file</span>}
                    </div>

                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-900 dark:text-white truncate" title={file.name}>{file.name}</span>
                        <span className="text-[10px] text-slate-400 font-medium">{file.date} • {file.size}</span>
                    </div>

                    {selectedFileId === file.id && (
                        <div className="absolute top-2 right-2">
                            <span className="w-2 h-2 bg-primary rounded-full block"></span>
                        </div>
                    )}
                </div>
            ))}

            {/* Upload Placeholder */}
            <div className="border-2 border-dashed border-primary/30 rounded-xl bg-primary/5 flex flex-col items-center justify-center transition-colors hover:bg-primary/10 cursor-pointer aspect-[3/4] min-h-[200px]">
                <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center mb-2 shadow-sm">
                    <span className="material-icons-round text-primary">add</span>
                </div>
                <p className="font-bold text-slate-800 dark:text-white text-xs">Add File</p>
            </div>
        </div>
    );
}
