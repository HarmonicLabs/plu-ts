import { parseFile } from "../parseFile";


test("parseMain", () => {

    const fileName = "test.pebble";
    const srcText = `
import { MyDatum } from "./MyDatum";

function main( { tx, purpose }: ScriptContext )
{
    const [ a, b, ...rest ] = tx.inputs;

    const Spending{
        utxoRef, 
        maybeDatum: Just{ 
            value: datum // as MyDatum
        }
    } = purpose;

    var sumLove = 0

    for( const { resolved: input } of tx.inputs )
    {
        sumLove += input.value.lovelaces();
    }

    assert tx.outputs.length === 1 else "only one output allowed";
    assert sumLove >= 1000_000_000;
}
`;

    let stmts: any;
    expect(() => stmts = parseFile( fileName, srcText )).not.toThrow();

    console.log( stmts );
})