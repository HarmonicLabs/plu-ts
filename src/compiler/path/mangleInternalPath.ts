import { extension } from "../../common";

export const fileExtension = ".pebble";

/** Mangles an external to an internal path. */
export function mangleInternalPath(path: string): string {
    if (path.endsWith( extension ))
        path = path.substring( 0, path.length - extension.length );
    if (path.endsWith("/")) {
        path += "index";
    } else if (path.endsWith(fileExtension)) {
        path = path.substring(0, path.length - fileExtension.length);
    }
    return path;
}