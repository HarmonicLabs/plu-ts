import { precursive, pfn, pif } from "../../../pluts"
import { lam, int } from "../../../type_system"

const pfactorial = precursive(
    pfn([
        lam( int, int ), // self
        int
    ], int)
    (( self, n ) => 
        pif( int )
        .$( n.ltEq( 1 ) )
        .then( 1 )
        .else(
            n.mult( self.$( n.sub( 1 ) ) )
        )
    )
)

test("compiles", () => {

    const uplc = pfactorial.toUPLC()

})