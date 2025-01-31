/** Mangles an external to an internal path. */
export function mangleInternalPath(path: string): string {
    if (path.endsWith("/")) {
        path += "index";
    } else if (path.endsWith(".ts")) {
        path = path.substring(0, path.length - 3);
    }
    return path;
}