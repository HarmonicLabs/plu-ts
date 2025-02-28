import { TirAliasType } from "../../../tir/types/TirAliasType";
import { TirBytesT, TirOptT } from "../../../tir/types/TirNativeType";
import { Scope } from "../Scope";
import { PebbleConcreteTypeSym, PebbleGenericSym } from "../symbols/PebbleSym";


describe("apply generic", () => {
    
    test("Optional<ScriptHash>", () => {
        const stdScope = new Scope( undefined );
        stdScope.defineType(
            new PebbleGenericSym({
                name: "Optional",
                nTypeParameters: 1,
                getConcreteType( ...typeArgs ) {
                    if( typeArgs.length < 1 )
                        return undefined;
                    return new TirOptT(typeArgs[0]);
                },
            })
        );
        const bytes_t = new TirBytesT();
        const preludeScope = new Scope( stdScope );
        // export type Hash28 = bytes;
        const hash28_t = new TirAliasType(
            "Hash28",
            bytes_t,
            []
        );
        const scriptHash_t = new TirAliasType(
            "ScriptHash",
            hash28_t,
            []
        );
        preludeScope.defineType(
            new PebbleConcreteTypeSym({
                name: "Hash28",
                concreteType: hash28_t
            })
        );
        preludeScope.defineType(
            new PebbleConcreteTypeSym({
                name: "ScriptHash",
                concreteType: scriptHash_t
            })
        );

        const expectedName = "§Optional#ScriptHash";
        const expectedConcreteType = new TirOptT(scriptHash_t);

        expect(
            preludeScope.resolveType( expectedName )
        ).toBeUndefined();

        expect( preludeScope.typeSymbols?.symbols.size ).toEqual( 2 );

        const result = preludeScope.getAppliedGenericType(
            "Optional",
            ["ScriptHash"]
        )!;

        // check we have defined the new type
        expect( preludeScope.typeSymbols?.symbols.size ).toEqual( 3 );

        expect( result ).not.toBeUndefined();
        expect( result.name ).toEqual( expectedName );
        expect( result.concreteType ).toEqual( expectedConcreteType );

        // reproduce
        expect(
            preludeScope.getAppliedGenericType(
                "Optional",
                ["ScriptHash"]
            )
        ).toEqual(
            preludeScope.resolveType( expectedName )
        );

    });
})