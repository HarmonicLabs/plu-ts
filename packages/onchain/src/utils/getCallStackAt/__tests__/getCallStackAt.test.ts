import { CallStackSiteInfos, getCallStackAt } from "..";

describe.skip("getCallStackAt", function () {

    if( process.platform !== "linux" )
    {
        // mock test
        test("mock", () => {expect(1).toEqual(1)} );
        return;
    }

    test("no eq before", async function () {
        // little trick to assign without equal sign
        await (async function ( result, start ) {
            await new Promise(r => {
                if(result?.inferredName) r( undefined );
                result?.once("inferredName", r );
                setTimeout( r, 1000 );
            });
            expect( Date.now() - start ).toBeGreaterThanOrEqual( 1000 );
            expect( result!.inferredName ).toEqual( undefined );
        })( plam( 0, 0 )(() => {}), Date.now() )
    })

    test("dummy plam",async () => {

        const dummy = plam( 0, 0 )
        (() => {});
        await new Promise( r => {
            if(dummy?.inferredName !== undefined) r( undefined );
            dummy?.once("inferredName", r );
            setTimeout( r, 1000 );
        });

        expect( dummy?.inferredName ).toEqual("dummy");

    });

    test("many constructions", async () => {

        const mkLam = plam( 0, 0 );

        const fst = mkLam(() => {});
        await new Promise( r => {
            fst?.once("inferredName", r )
            if(fst?.inferredName !== undefined) r( undefined )
            setTimeout( r, 1000 );
        });
        expect( fst?.inferredName ).toEqual("fst");

        // file cached; found synchronously
        const snd = mkLam(() => {});
        // await new Promise( r => {
        //     // snd?.on("inferredName", r )
        //     if(snd?.inferredName !== undefined) r( undefined )
        //     setTimeout( r, 1000 );
        // });
        expect( snd?.inferredName ).toEqual("snd");

    });

});

function plam( inT: any, outT: any ): ( lam: ( arg: any ) => any ) => CallStackSiteInfos | undefined
{ 
    return function (lam: any) {
        const res = getCallStackAt( 3, { tryGetNameAsync: true } );
        lam( res );
        return res;
    } as any
}