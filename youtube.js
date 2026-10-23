#!/usr/bin/env node

// Dependència: npm install youtube-caption-extractor
// Ús: node youtube.js "URL_DEL_VIDEO" [IDIOMA]
// Exemple: node youtube.js "https://youtu.be/VIDEO_ID" en
// Idioma per defecte: es. Admet codis amb regió, com pt-BR.
// Genera únicament un .txt a la carpeta actual, amb una frase per paràgraf.

async function main() {
  const videoUrl = process.argv[2];
  if (!videoUrl) {
    throw new Error('Ús: node youtube.js "URL_DEL_VIDEO" [IDIOMA] (per defecte: es)');
  }
  let lang;
  try {
    [lang] = Intl.getCanonicalLocales((process.argv[3] ?? 'es').trim());
    if (!lang) throw new Error();
  } catch {
    throw new Error("El codi d'idioma no és vàlid. Exemples: es, en, it, pt-BR.");
  }

  let url;
  try {
    url = new URL(videoUrl);
  } catch {
    throw new Error("L'URL introduïda no és vàlida.");
  }

  const host = url.hostname.toLowerCase();
  const youtubeHosts = new Set([
    'youtube.com', 'www.youtube.com', 'm.youtube.com', 'music.youtube.com',
  ]);
  let videoID;
  if (!['https:', 'http:'].includes(url.protocol)) {
    throw new Error("L'URL ha de començar per https:// o http://.");
  }
  if (host === 'youtu.be') {
    videoID = url.pathname.split('/')[1];
  } else if (youtubeHosts.has(host)) {
    const parts = url.pathname.split('/').filter(Boolean);
    videoID = ['shorts', 'embed', 'live'].includes(parts[0])
      ? parts[1]
      : url.pathname === '/watch' ? url.searchParams.get('v') : null;
  }
  if (!videoID || !/^[a-zA-Z0-9_-]{11}$/.test(videoID)) {
    throw new Error("No s'ha pogut obtenir un videoID vàlid d'una URL de YouTube.");
  }

  let getVideoDetails;
  try {
    ({ getVideoDetails } = await import('youtube-caption-extractor'));
  } catch (error) {
    if (error.code === 'ERR_MODULE_NOT_FOUND') {
      throw new Error('Cal instal·lar la dependència: npm install youtube-caption-extractor');
    }
    throw error;
  }
  const { writeFile } = await import('node:fs/promises');
  // La biblioteca pot retornar un altre idioma si el demanat no està disponible.
  const video = await getVideoDetails({ videoID, lang });
  if (!Array.isArray(video.subtitles) || video.subtitles.length === 0) {
    throw new Error(`No s'han obtingut subtítols per a aquest vídeo (idioma demanat: ${lang}).`);
  }

  const fullText = video.subtitles
    .map((subtitle) => String(subtitle.text ?? '').trim())
    .join(' ')
    .replace(/\s+/gu, ' ')
    .trim();
  if (!fullText) {
    throw new Error('Els subtítols obtinguts no contenen text.');
  }

  // Conserva la puntuació i les cometes de tancament de cada frase.
  // Si els subtítols no tenen puntuació, el text forma un sol paràgraf.
  const sentences = (fullText.match(/[^.!?]+[.!?]+(?:["'»”’)]*)|[^.!?]+$/gu) || [])
    .map((sentence) => sentence.trim())
    .filter(Boolean);
  if (sentences.length === 0) {
    throw new Error('Els subtítols no contenen cap frase.');
  }
  const text = sentences.join('\n\n') + '\n';

  const title = String(video.title || videoID)
    .replace(/[<>:"/\\|?*\u0000-\u001f\u007f]/gu, '')
    .replace(/\s+/gu, ' ')
    .trim();
  // Limita el nom en bytes per evitar superar el límit del sistema de fitxers.
  let safeTitle = '';
  for (const character of title) {
    if (Buffer.byteLength(safeTitle + character, 'utf8') > 180) break;
    safeTitle += character;
  }
  const filename = `${safeTitle.trim() || 'Video'} [${videoID}].txt`;
  try {
    await writeFile(filename, text, { encoding: 'utf8', flag: 'wx' });
  } catch (error) {
    if (error.code === 'EEXIST') {
      throw new Error(`El fitxer ja existeix: ${filename}. Canvia-li el nom abans de tornar-ho a executar.`);
    }
    throw error;
  }
  console.log(`Fitxer creat: ${filename}`);
}

main().catch((error) => {
  console.error(`Error: ${error.message || error}`);
  process.exitCode = 1;
});
