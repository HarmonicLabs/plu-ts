
export interface ToJson {
    toJson: () => any
}

export function logJson( jsonLike: ToJson ): void
{
    const obj = typeof (jsonLike as any).toJson === "function" ? (jsonLike as any).toJson() : jsonLike

    console.log(
        JSON.stringify( obj, undefined, 2 )
    );
}