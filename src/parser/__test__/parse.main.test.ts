import { Source } from "../../ast/Source/Source";
import { DiagnosticMessage } from "../../diagnostics/DiagnosticMessage";
import { parseFile } from "../parseFile";


describe("parseMain", () => {

    test("parseMain", () => {
    
        const fileName = "test.pebble";
        const srcText = `
    import { MyDatum } from "./MyDatum";
    import { MyAction } from "./MyAction";
    
    function main({ tx, purpose }: ScriptContext )
    {
        const [ a, b, ...rest ] = tx.inputs;
    
        const Spending{
            utxoRef, 
            maybeDatum: Just{ 
                value: datum as MyDatum
            }
        } = purpose;
    
        let sumLove = 0;
    
        assert tx.outputs.length() === 1 else "only one output allowed";
        assert sumLove >= 1000_000_000;

        let a = 0;
        let b = 1;
        let c = 2;
        for( let i = 0; i < 10; i++ )
        {
            a += 1;
        }

        match( purpose ) {
            Spending{ utxoRef, maybeDatum: Just{ value: datum as MyDatum } } => {}
            Minting{ } => {}
            Certify{ } => {}
            _ => {}
        }

        trace a;
    }
    `;
    
        let src!: Source;
        let diagnosticMessages!: DiagnosticMessage[];
        expect(() => [ src, diagnosticMessages ] = parseFile( fileName, srcText )).not.toThrow();
    
        // console.log( src.statements );
    });
    
    test.only("parseMain as MyDataum", () => {
    
        const fileName = "test.pebble";
        const srcText = `
function main()
{
    const Just{ 
        value: [ myDatum as MyDatum ] as List<data>
    } = maybeDatum;
}
`;
    
        let src!: Source;
        let diagnosticMessages!: DiagnosticMessage[];
        expect(() => [ src, diagnosticMessages ] = parseFile( fileName, srcText )).not.toThrow();

        if( diagnosticMessages.length > 0 )
        {
            console.log( diagnosticMessages.map( msg => msg.toString() ) );
        }
        expect( diagnosticMessages.length ).toBe( 0 );
    
        const deconstructedJustFields = (
            (src as any)
            .statements[0] // function main
            .body // block stmt
            .stmts[0] // const Just{ ... } = maybeDatum;
            .declarations[0] // Just{ ... } = maybeDatum;
            .fields // { ... }
        ) as Map<string, any>;

        expect( deconstructedJustFields.size ).toBe( 1 );

        expect( deconstructedJustFields.get( "value" ).type )
        .not.toBe( undefined );
    });

});