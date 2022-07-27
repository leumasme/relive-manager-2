// Recursively get all files in a directory
const fs = require("fs/promises") as typeof import("fs/promises");
const { resolve } = require("path") as typeof import("path");
export async function getFiles(dir: string): Promise<string[]> {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const files = await Promise.all(
        entries.map((dirent) => {
            const res = resolve(dir, dirent.name);
            return dirent.isDirectory() ? getFiles(res) : res;
        })
    );
    return Array.prototype.concat(...files);
}

// Parse duration like "00:00:53.424958" to seconds
export function parseDuration(duration: string): number {
    const [hours, minutes, seconds] = duration.split(":").map(Number);
    return hours * 3600 + minutes * 60 + seconds;
}