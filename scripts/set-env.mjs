/**
 * Genera `src/environments/environment.ts` a partir de las API keys.
 *
 * Orden de prioridad para cada clave:
 *   1. Variables de entorno del sistema (útil en CI/CD).
 *   2. Archivo `.env` en la raíz del proyecto.
 *
 * Si no se encuentra ninguna clave y ya existe un `environment.ts` (editado a mano),
 * se respeta y no se sobrescribe. Ambos archivos están en `.gitignore`.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const envFilePath = resolve(projectRoot, '.env');
const targetPath = resolve(projectRoot, 'src/environments/environment.ts');

/** Parser mínimo de archivos .env (KEY=VALUE, comentarios con #, comillas opcionales). */
function parseEnvFile(filePath) {
  if (!existsSync(filePath)) {
    return {};
  }

  return readFileSync(filePath, 'utf8')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#') && line.includes('='))
    .reduce((variables, line) => {
      const separatorIndex = line.indexOf('=');
      const key = line.slice(0, separatorIndex).trim();
      const value = line
        .slice(separatorIndex + 1)
        .trim()
        .replace(/^['"]|['"]$/g, '');
      return { ...variables, [key]: value };
    }, {});
}

const fileVariables = parseEnvFile(envFilePath);
const readVariable = (name) => process.env[name] ?? fileVariables[name] ?? '';

const tmdbApiKey = readVariable('TMDB_API_KEY');
const openWeatherApiKey = readVariable('OPENWEATHER_API_KEY');
const hasAnyKey = Boolean(tmdbApiKey || openWeatherApiKey);

if (!hasAnyKey && existsSync(targetPath)) {
  console.log('[set-env] No se encontraron API keys en .env ni en el entorno; se conserva environment.ts existente.');
  process.exit(0);
}

if (!tmdbApiKey) {
  console.warn('[set-env] ADVERTENCIA: TMDB_API_KEY no está definida. La pestaña Películas mostrará un error 401.');
}
if (!openWeatherApiKey) {
  console.warn('[set-env] ADVERTENCIA: OPENWEATHER_API_KEY no está definida. La pestaña Clima mostrará un error 401.');
}

const fileContent = `// ARCHIVO GENERADO AUTOMÁTICAMENTE por scripts/set-env.mjs. No versionar (está en .gitignore).
import { Environment } from './environment.model';

export const environment: Environment = {
  tmdb: {
    apiKey: ${JSON.stringify(tmdbApiKey)},
    baseUrl: 'https://api.themoviedb.org/3',
    imageBaseUrl: 'https://image.tmdb.org/t/p',
  },
  openWeather: {
    apiKey: ${JSON.stringify(openWeatherApiKey)},
    baseUrl: 'https://api.openweathermap.org/data/2.5',
    iconBaseUrl: 'https://openweathermap.org/img/wn',
  },
};
`;

mkdirSync(dirname(targetPath), { recursive: true });
writeFileSync(targetPath, fileContent, 'utf8');
console.log('[set-env] src/environments/environment.ts generado correctamente.');
