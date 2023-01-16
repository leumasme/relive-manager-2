# ReLive Manager
A studio/manager for Radeon ReLive replays.

Based on [electron-svelte-typescript](https://github.com/fuzzc0re/electron-svelte-typescript).

Under the hood, it uses Electron, Svelte and FFmpeg.
Electron is intentionally set to insecure/unisolated mode so I dont have to separate fs/ffmpeg stuff into the electron side.
This application never loads content from the internet so I dont believe the isolation features are useful here.

This project in its current state is usable but not complete or stable (or pretty). I designed it primarily for my personal use. The UX is somewhat inspired by [ShareX](https://getsharex.com/).
*The color choices will likely get me sent to UI hell, please help.*

If anyone is interested in the project anyway, suggestions (and pull requests) are welcome.

## Features
As this project is not finished or stable, I will likely not bother updating this list often.
- List all replays
  - Highlight unwatched replays
- Add Tags to replays
  - With ugly autocompletion :)
- Edit Replays
  - Editing creates a "Variation". Variations may be further edited.
  - This allows for keeping different edited versions of a replay in an organized fashion.
  - This will not become a full-on video editor/studio. Currently possible edits are:
    - Extract Sound
    - Trim
- Search through replays and variations
  - Searches Name, Variations, Tags
- Yeah that's it.