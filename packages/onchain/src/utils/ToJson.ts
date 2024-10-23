import { stringify } from "./stringify";

export interface ToJson {
    toJson: () => any
}

export function logJson( jsonLike: ToJson, indent: number = 4 ): void
{
    const obj = typeof jsonLike !== "undefined" && typeof (jsonLike as any).toJson === "function" ? (jsonLike as any).toJson() : jsonLike

    console.log(
        stringify( obj, undefined, indent ),
        Error().stack?.split("\n")[2]
    );
}