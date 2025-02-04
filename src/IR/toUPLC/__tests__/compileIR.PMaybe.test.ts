import { PMaybe, PPubKeyHash, V2, compile, pBool, pfn, plet, pmatch, pstruct } from "../../../pluts"
import { bool, bs } from "../../../type_system";
import { unit } from "../../../type_system";

describe("compile PMaybe func", () => {

    test("simple", () => {
        const func = pfn([
            PMaybe( bs ).type
        ],  bool )
        ( mbs => {
    
            return pmatch( mbs )
            .onJust( just => just.val.length.eq( 28 ) )
            .onNothing( _ => pBool( true ) )
        });
    
        compile( func );
    });


    test("with useless vars", () => {
        const func = pfn([
            PMaybe( bs ).type,
            unit,
            unit,
            unit,
        ],  bool)
        ( (mbs, a, b, c ) => {
    
            return pmatch( mbs )
            .onJust( just => just.val.length.eq( 28 ) )
            .onNothing( _ => pBool( true ) )
        });
    
        compile( func );
    });

    test("with ctx", () => {
        const func = pfn([
            PMaybe( bs ).type,
            unit,
            unit,
            V2.PScriptContext.type
        ],  bool)
        ( (mbs, a, b, ctx ) => {
    
            return pmatch( mbs )
            .onJust( just => just.val.length.eq( 28 ) )
            .onNothing( _ => pBool( true ) )
        });
    
        compile( func );
    });

    test("with simple tx.some", () => {
        const func = pfn([
            PMaybe( bs ).type,
            unit,
            unit,
            V2.PScriptContext.type
        ],  bool)
        ( (mbs, a, b, ctx ) => {
    
            return pmatch( mbs )
            .onJust( just =>
                ctx.tx.outputs.some( out => just.val.length.eq( 28 ) ) 
            )
            .onNothing( _ => pBool( true ) )
        });
    
        compile( func );
    });

    test("with tx.some", () => {
        const func = pfn([
            PMaybe( PPubKeyHash.type ).type,
            unit,
            unit,
            V2.PScriptContext.type
        ],  bool)
        ( (mbs, a, b, ctx ) => {
    
            const { tx } = ctx;

            return pmatch( mbs )
            .onJust(({ val: protocolPkh }) =>
                tx.outputs.some( out =>
                    pmatch( out.address.credential )
                    .onPPubKeyCredential(({ pkh }) => pkh.eq( protocolPkh ))
                    ._( _ => pBool( false )) 
                )
            )
            .onNothing( _ => pBool( true ) );
        });
    
        compile( func );
    });

    const FakeDat = pstruct({
        New: {},
        Build: {}
    });

    test("with 1 pmatch", () => {
        const func = pfn([
            PMaybe( PPubKeyHash.type ).type,
            FakeDat.type,
            unit,
            V2.PScriptContext.type
        ],  bool)
        ( (mbs, dat, b, ctx ) => {
    
            const { tx } = ctx;

            const paidProtocol = plet(
                pmatch( mbs )
                .onJust(({ val: protocolPkh }) =>
                    tx.outputs.some( out =>
                        pmatch( out.address.credential )
                        .onPPubKeyCredential(({ pkh }) => pkh.eq( protocolPkh ))
                        ._( _ => pBool( false )) 
                    )
                )
                .onNothing( _ => pBool( true ) )
            );

            return pmatch( dat )
            .onNew( _ => paidProtocol )
            .onBuild( _ => paidProtocol );
        });
    
        compile( func );
    });

    const FakeRdmr = pstruct({
        NewR: {},
        BuildR: {}
    });

    test("with 2 pmatch", () => {
        const func = pfn([
            PMaybe( PPubKeyHash.type ).type,
            FakeDat.type,
            FakeRdmr.type,
            V2.PScriptContext.type
        ],  bool)
        ( (mbs, dat, rdmr, ctx ) => {
    
            const { tx } = ctx;

            const paidProtocol = plet(
                pmatch( mbs )
                .onJust(({ val: protocolPkh }) =>
                    tx.outputs.some( out =>
                        pmatch( out.address.credential )
                        .onPPubKeyCredential(({ pkh }) => pkh.eq( protocolPkh ))
                        ._( _ => pBool( false )) 
                    )
                )
                .onNothing( _ => pBool( true ) )
            );

            return pmatch( dat )
            .onNew( _ =>
                pmatch( rdmr )
                .onNewR( _ => paidProtocol )
                .onBuildR( _ => paidProtocol ) 
            )
            .onBuild( _ =>
                pmatch( rdmr )
                .onNewR( _ => paidProtocol )
                .onBuildR( _ => paidProtocol ) 
            );
        });
    
        compile( func );
    });
})