# YouTube Subtitle Extractor

A lightweight JavaScript command-line tool that extracts available YouTube subtitles and saves them as a UTF-8 text file, with a blank line between sentences.

## Features

- Extract subtitles using a video URL and an optional language code.
- Support standard YouTube URLs, shortened links, Shorts, live video links, and embed URLs.
- Combine subtitle segments into plain text without timestamps.
- Separate sentences at periods, exclamation marks, and question marks.
- Name the output file using the video title and ID.
- Prevent accidental overwriting of existing files.

## Requirements

- Node.js 18 or later, as required by the installed extraction library.
- npm.
- An internet connection and a YouTube video with accessible subtitles.

No API key or account configuration is required by the script.

## Installation

From the project directory, install the versions recorded in `package-lock.json`:

```bash
npm ci --ignore-scripts
```

The project pins `youtube-caption-extractor` to version `1.10.3`. The lockfile also records its runtime dependencies, `he` and `striptags`. The `--ignore-scripts` option disables dependency lifecycle scripts during installation; it does not provide a security guarantee for code executed later.

## Usage

```bash
node youtube.js "VIDEO_URL" [LANGUAGE]
```

| Argument | Required | Description | Default |
| --- | --- | --- | --- |
| `VIDEO_URL` | Yes | A supported YouTube video URL, including `https://` or `http://`. | — |
| `LANGUAGE` | No | A language tag such as `en`, `es`, `it`, or `pt-BR`. | `es` |

Quote the URL so the shell treats query parameters as part of the same argument.

### Examples

Request English subtitles:

```bash
node youtube.js "https://www.youtube.com/watch?v=yErXXXXX" en
```

Request Italian subtitles using a shortened URL:

```bash
node youtube.js "https://youtu.be/yErXXXXXXX" it
```

Use the default language, English:

```bash
node youtube.js "https://www.youtube.com/watch?v=yErXXXXXXX"
```

These examples demonstrate the command syntax; subtitle availability depends on the video.

### Supported URL formats

```text
https://www.youtube.com/watch?v=VIDEO_ID
https://youtu.be/VIDEO_ID
https://www.youtube.com/shorts/VIDEO_ID
https://www.youtube.com/live/VIDEO_ID
https://www.youtube.com/embed/VIDEO_ID
```

The script also accepts `youtube.com`, `m.youtube.com`, and `music.youtube.com` hosts. `VIDEO_ID` is a placeholder for an 11-character video ID. Playlist-only URLs and bare video IDs are not supported.

## Output

Each successful run creates one `.txt` file in the **current working directory**:

```text
Video title [VIDEO_ID].txt
```

Characters unsuitable for filenames are removed from the title, whitespace is normalized, and the title portion is limited to 180 UTF-8 bytes.

Example file contents:

```text
This is the first sentence.

This is the second sentence!

Is this the third sentence?
```

The file contains subtitle text only, without timestamps or a metadata header. A successful run prints:

```text
Fitxer creat: Video title [VIDEO_ID].txt
```

Console messages are currently in Catalan. Errors are written to standard error and return exit code `1`.

Existing files are never overwritten. Rename or move the existing file before extracting the same video again. The filename does not include the requested language, so this also applies when extracting another language for the same video title and ID.

## Language selection and limitations

- **Language is a preference.** The extraction library may return another available language when the requested one is unavailable. The script does not verify the language returned.
- **No translation or speech recognition.** The script retrieves existing subtitle tracks; it does not translate text or transcribe audio itself.
- **Punctuation determines paragraphs.** Sentence splitting uses `.`, `!`, and `?`. Abbreviations and decimal numbers may therefore be split incorrectly. Text without these punctuation marks remains in a single paragraph.
- **Subtitle quality is preserved.** Automatic captions may contain transcription errors, repetitions, or missing punctuation; the script does not correct them.
- **Availability depends on YouTube.** Missing tracks, access restrictions, network failures, or changes to YouTube can prevent extraction. In the pinned library version, some subtitle retrieval errors can result in an empty subtitle list.

## Troubleshooting

| Problem | What to check |
| --- | --- |
| Usage message appears | Supply a video URL as the first argument. |
| Invalid URL or video ID | Use one of the supported URL formats with a valid 11-character video ID. |
| Invalid language code | Use a language tag such as `en`, `it`, or `pt-BR`; use hyphens instead of underscores. |
| Missing dependency | Run `npm ci --ignore-scripts` from the project directory. |
| No subtitles returned | Check that the video has accessible subtitle tracks. Retrieval failures may also produce this message. |
| Unexpected language | The library may have fallen back to an available track. |
| File already exists | Rename or move the existing `.txt` file, then run the command again. |
| Cannot write the output file | Check write permissions in the current working directory. |

## Project structure

```text
.
├── youtube.js         # CLI, URL validation, text formatting, and file output
├── package.json       # Pinned extraction dependency
├── package-lock.json  # Exact dependency versions and integrity hashes
└── README.md
```

`node_modules/` is created during installation. Extracted `.txt` files are generated when the script runs successfully.

## Development

Check JavaScript syntax without making network requests:

```bash
node --check youtube.js
```

There is currently no automated test suite. An end-to-end check requires a real video with accessible subtitles and network access.

## Dependency

Subtitle retrieval is provided by [youtube-caption-extractor](https://github.com/devhims/youtube-caption-extractor). This project handles command-line input, paragraph formatting, and text-file output.
