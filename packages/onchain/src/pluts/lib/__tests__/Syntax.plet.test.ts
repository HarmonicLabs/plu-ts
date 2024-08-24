import { DataI } from "@harmoniclabs/plutus-data";
import { compile, int, passert, pData, perror, pfn, plet, pmatch, PScriptContext, PTxOut, punIData, PValue, Term, termTypeToString, unit } from "../.."

test("plet keeps utility", () => {

    const contract = pfn([
        PTxOut.type
    ], unit)
    ((input) => {
    
        const ownValue = plet( input.value );

        expect( ownValue.lovelaces instanceof Term ).toBe( true );
        expect( typeof ownValue.amountOf === "function" ).toBe( true );

        const isValueLocked = (
            ownValue.lovelaces.lt( 100 )
        );

        return passert.$( isValueLocked );
    })
    
    const compiled = compile( contract );

})
