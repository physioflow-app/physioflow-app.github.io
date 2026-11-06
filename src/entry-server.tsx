import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import AppShell from './AppShell';

export function render() {
  return renderToString(<StaticRouter location="/"><AppShell /></StaticRouter>);
}
