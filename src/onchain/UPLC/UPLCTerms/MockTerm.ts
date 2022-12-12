import Cloneable from "../../../types/interfaces/Cloneable";
import JsRuntime from "../../../utils/JsRuntime";
import ObjectUtils from "../../../utils/ObjectUtils";

export default class MockTerm
    implements Cloneable<MockTerm>
{
    readonly sym!: symbol;
    readonly dbn!: bigint;

    constructor( sym: symbol, dbn: bigint )
    {
        JsRuntime.assert(
            typeof sym === "symbol",
            "invalid 'sym' argument instatiating 'MockTerm'"
        );
        ObjectUtils.defineReadOnlyProperty( this, "sym", sym );
        JsRuntime.assert(
            typeof dbn === "bigint",
            "invalid 'dbn' argument instatiating 'MockTerm'"
        );
        ObjectUtils.defineReadOnlyProperty( this, "dbn", dbn );
    }

    clone(): MockTerm
    {
        return new MockTerm( this.sym, this.dbn );
    }
}