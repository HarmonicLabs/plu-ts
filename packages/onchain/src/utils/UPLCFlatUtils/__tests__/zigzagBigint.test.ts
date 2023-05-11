import UPLCFlatUtils from ".."


describe( "UPLCFlatUtils.zigzagBigint", () => {

    it( "0 -> 0" , () => {

        expect(
            UPLCFlatUtils.zigzagBigint(
                BigInt( 0 )
            )
        ).toEqual( BigInt( 0 ) )

    });

    it( "positive -> positive * 2", () => {

        for( let i = 1; i < 0xffff; i++ )
        {
            expect(
                UPLCFlatUtils.zigzagBigint(
                    BigInt( i )
                )
            ).toEqual( BigInt( i * 2 ) )
        }

    })

    it( "negative -> -negative * 2 - 1", () => {

        for( let i = -1; i < -0xffff; i-- )
        {
            expect(
                UPLCFlatUtils.zigzagBigint(
                    BigInt( i )
                )
            ).toEqual( BigInt( -i * 2 - 1 ) )
        }

    })
})
