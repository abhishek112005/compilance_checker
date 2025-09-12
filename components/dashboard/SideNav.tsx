// app/components/dashboard/SideNav.tsx
'use client';

import { ScanSearch, FileText, Bot } from 'lucide-react';

type View = 'inspector' | 'batch_report';

interface SideNavProps {
  currentView: View;
  setView: (view: View) => void;
}

export function SideNav({ currentView, setView }: SideNavProps) {
  const navItems = [
    { id: 'inspector', label: 'Product Inspector', icon: ScanSearch },
    { id: 'batch_report', label: 'Batch Report', icon: FileText },
  ];

  // This handler now includes a defensive check to prevent runtime errors.
  const handleClick = (view: View) => {
    if (typeof setView === 'function') {
      setView(view);
    } else {
      // This error will appear in the developer console if the prop is missing.
      console.error("SideNav Error: The 'setView' prop is not a function. Please ensure it is passed correctly from the parent component.");
    }
  };

  return (
    <nav className="hidden md:flex flex-col w-64 p-4 space-y-2 bg-gradient-to-b from-slate-900 to-slate-800 border-r border-slate-700">
      <div className="flex items-center space-x-3 p-2 mb-6">
        <div className="p-2 bg-blue-500/20 rounded-lg">
            <Bot className="h-8 w-8 text-blue-300" />
        </div>
        <h1 className="text-xl font-bold text-white">Compliance Checker</h1>
      </div>
      
      <div className="flex flex-col space-y-2">
        {navItems.map(item => (
            <button
            key={item.id}
            onClick={() => handleClick(item.id as View)}
            className={`
                flex items-center space-x-4 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200
                group
                ${currentView === item.id 
                ? 'bg-blue-500/90 text-white shadow-lg' 
                : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
                }
            `}
            >
            <item.icon className={`h-5 w-5 transition-transform duration-200 ${currentView === item.id ? 'scale-110' : 'group-hover:scale-110'}`} />
            <span>{item.label}</span>
            </button>
        ))}
      </div>
    </nav>
  );
}

