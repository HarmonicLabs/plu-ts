import UPLCFlatUtils from ".."


describe( "UPLCFlatUtils.zigzagBigint", () => {

    it( "0 -> 0" , () => {

        expect(
            UPLCFlatUtils.unzigzagBigint(
                BigInt( 0 )
            )
        ).toEqual( BigInt( 0 ) )

    });

    it( "even -> positive", () => {

        for( let i = 2; i < 0x10000; i += 2 )
        {
            expect(
                UPLCFlatUtils.unzigzagBigint(
                    BigInt( i )
                )
            ).toBeGreaterThan( BigInt( 0 ) )
        }

    })

    it( "odd -> negative", () => {

        for( let i = 1; i < 0x10000; i += 2 )
        {
            expect(
                UPLCFlatUtils.unzigzagBigint(
                    BigInt( i )
                )
            ).toBeLessThan( BigInt( 0 ) )
        }

    })

    it( "throws on negative input", () => {

        for( let i = -1; i < -0xffff; i -= Math.floor( Math.random() * 15 ) )
        {
            expect( () => 
                UPLCFlatUtils.unzigzagBigint(
                    BigInt( i )
                )
            ).toThrow()
        }

    })

})
