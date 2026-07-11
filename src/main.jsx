import { LanguageProvider } from './components/LanguageContext.jsx'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

console.log('Main.jsx loading - root element:', document.getElementById('root'));

const root = document.getElementById('root');
if (root) {
  createRoot(root).render(
    <StrictMode>
      {/* 🌟 මෙන්න මේ විදිහට LanguageProvider එක ඇතුළට App එක දාන්න */}
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </StrictMode>,
  );
  console.log('React app rendered successfully');
} else {
  console.error('Root element not found!');
}