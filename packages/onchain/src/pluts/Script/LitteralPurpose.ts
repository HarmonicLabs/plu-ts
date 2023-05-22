
export type LitteralPurpose = "spend" | "mint" | "withdraw" | "certify";

export function isLitteralPurpose( stuff: any ): stuff is LitteralPurpose
{
    return (
        typeof stuff === "string" &&
        (
            stuff === "spend" ||
            stuff === "mint" ||
            stuff === "withdraw" ||
            stuff === "certify"
        )
    )
}