import { BrowserRouter } from 'react-router-dom';
import AppShell from './AppShell';
import { redirectLegacyHashUrl } from './lib/legacyHash';

export default function App() {
  redirectLegacyHashUrl();
  return <BrowserRouter><AppShell /></BrowserRouter>;
}
