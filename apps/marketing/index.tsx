import React from 'react';
import ReactDOM from 'react-dom/client';
import { LandingPlannotatorPtBr } from '@obsidian-note-reviewer/ui/components/LandingPlannotatorPtBr';
import { ThemeProvider } from '@obsidian-note-reviewer/ui/components/ThemeProvider';
import '@obsidian-note-reviewer/editor/styles';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="dark">
      <LandingPlannotatorPtBr />
    </ThemeProvider>
  </React.StrictMode>
);
