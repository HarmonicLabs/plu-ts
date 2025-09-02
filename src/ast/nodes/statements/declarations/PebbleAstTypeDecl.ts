import { EnumDecl } from "./EnumDecl";
import { StructDecl } from "./StructDecl";
import { TypeAliasDecl } from "./TypeAliasDecl";
import { ContractDecl } from "./ContractDecl";

export type PebbleAstTypeDecl
    = StructDecl
    | EnumDecl
    | TypeAliasDecl
    | ContractDecl
    ;

export function isPebbleAstTypeDecl( thing: any ): thing is PebbleAstTypeDecl
{
    return (
        thing instanceof StructDecl
        || thing instanceof EnumDecl
        || thing instanceof TypeAliasDecl
        || thing instanceof ContractDecl
    );
}