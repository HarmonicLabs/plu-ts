import { IRTerm, IRVar, prettyIRInline } from "../../../..";
import { IRApp, IRConst, IRFunc } from "../../../../IRNodes"
import { groupIndipendentLets } from "..";

/*
assuming a pattern like: 
[(lam a [(lam b [(lam c ... ))) c] b] a]

assuming the arguments are indipendent by each other

which means that `c` does not depend on `a` or `b`
and `b` does not depend on `a`

the steps to get the arguments are:

[(lam a [(lam b [(lam c ... ))) c] b] a] :: []
[(lam b [(lam c ... ))) c] b] :: [a]
[(lam c ... ) c] :: [a, b]
... :: [a, b, c]


finally expand:
(lam a (lam b (lam c ... ))) :: [a, b, c]

so the result is:
args = [a, b, c]
body = (lam a (lam b (lam c ... )))

if either `c` or `b` depend on `a` then the result is:
args = [a]
body = (lam a [(lam b (lam c ... ) c]) b])

if `c` depends on `b` then the result is:
args = [a, b]
body = (lam a (lam b [(lam c ... ) c]))
*/

function introduceVars( term: IRTerm, nVars: number ): IRTerm
{
    let result = term;
    for( let i = 0; i < nVars; i++ )
    {
        result = new IRFunc( 1, result );
    }
    return result;
}

function letTerms( a: IRTerm, b: IRTerm, c: IRTerm, body: IRTerm ): IRTerm
{
    return new IRApp(
        new IRFunc( 1,
            new IRApp(
                new IRFunc( 1,
                    new IRApp(
                        new IRFunc( 1,
                            body
                        ),
                        c
                    )
                ),
                b
            )
        ),
        a
    );
}

test("closed vars", () => {

    const a = IRConst.int( 0 );
    const b = IRConst.int( 1 );
    const c = IRConst.int( 2 );
    const initBody = new IRVar( 0 );

    const term = letTerms( a, b, c, initBody );

    const [ args, body ] = groupIndipendentLets( term, 0 );

    expect( args ).toEqual([ a, b, c ]);
    expect( body ).toEqual( introduceVars( initBody, 3 ) );
});

test("c depends on a", () => {

    const a = IRConst.int( 0 );
    const b = IRConst.int( 1 );
    const c = new IRVar( 1 );
    const initBody = IRConst.int( 3 );
 
    const term = letTerms( a, b, c, initBody );

    const [ args, body  ] = groupIndipendentLets( term, 0 );

    expect( args.length ).toEqual( 2 );
    expect( args ).toEqual([ a, b ]);
    expect(prettyIRInline(body))
    .toEqual(
        prettyIRInline(
            introduceVars(
                // `c` depends on `a`
                // so it is not grouped and stays in the resulting body
                new IRApp(
                    new IRFunc( 1,
                        initBody
                    ),
                    c
                )
            , 2)
        )
    );
});