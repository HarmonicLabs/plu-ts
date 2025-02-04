import { fromAscii } from "@harmoniclabs/uint8array-utils";
import { V2, PData, PInt, Term, TermFn, TermList, pBSToData, pData, pDataI, pInt, pIntToData, pList, pListToData, pchooseList, pdelay, peqData, perror, pfn, phoist, pif, pisEmpty, plam, plet, pmakeUnit, pmatch, pmatchList, pnilData, precursive, pserialiseData, psha2_256, pstrictIf, pstruct, psub, punBData, punsafeConvertType, PUnit } from "../../..";
import { TxOutRef, UTxO, Value } from "@harmoniclabs/cardano-ledger-ts";
import { int, bs, lam, list, bool, fn, data, unit } from "../../../type_system";

const master_tn = V2.PTokenName.from( fromAscii("itamae") );

const tn = V2.PTokenName.from( fromAscii("TEMPURA") );

const halving_number = pInt( 210_000 );

const epoch_number = pInt( 2016 );

const epoch_target = pInt( 1_209_600_000 );

const initial_payout = pInt( 5_000_000_000 );

const padding = pInt( 16 );


function pListPairInt( arg: Term<PInt>[] | [ number, number ] ): TermList<PInt>
{
    return pList( int )( typeof arg[0] === "number" ? arg.map( pInt as any ) as any : arg);
}


const find_first_nonzero_byte = phoist(
    plam( bs, int )
    ( b =>
        precursive(
            pfn([
                lam( int, int  ),
                int,
            ],  int)
            (( find_first_nonzero_byte, i ) => {

                const curr_byte = plet( b.at( i ) );

                return pif( int )
                .$( curr_byte.eq( 0 ) )
                .then( find_first_nonzero_byte.$( i.add( 1 ) ).add( 2 ) )
                .else(
                    pstrictIf( int )
                    .$( curr_byte.lt( 16 ) )
                    .$( 1 )
                    .$( 0 )
                )
            })
        )
        .$( 0 )
    )
);

const format_found_bytearray = phoist(
    plam( bs, list( int ) )
    ( b => {

        const leading_zeroes = plet(
            find_first_nonzero_byte.$( b )
        );

        const bytearray_position = plet(
            leading_zeroes.div( 2 )
        );

        // inlined
        const even_diff_num = 
            b.at( bytearray_position ).mult( 256 )
            .add( b.at( bytearray_position.add( 1 ) ) );

        // inlined
        const odd_diff_num = 
            b.at( bytearray_position ).mult( 4096 )
            .add(
                b.at( bytearray_position.add( 1 ) ).mult( 16 )
            )
            .add(
                b.at( bytearray_position.add( 2 ) ).div( 16 )
            );

        return pListPairInt([
            pif( int ).$( leading_zeroes.mod( 2 ).eq( 0 ) )
            .then( even_diff_num )
            .else( odd_diff_num ),
            leading_zeroes
        ]);
    })
);

const do_exp2 = phoist(
    precursive(
        pfn([
            lam( int, int ),
            int
        ], int )
        ( ( self, exp ) =>
            pif( int ).$( exp.ltEq(0) )
            .then( 1 )
            .else(
                self.$( exp.sub( 1 ) ).mult( 2 )
            )
        )
    )
);

const exp2 = phoist(
    precursive(
        pfn([
            lam( int, int ),
            int
        ], int )
        ( ( self, exp ) =>
            pif( int ).$( exp.gtEq( 5 ) )
            .then(
                self.$( exp.sub( 5 ) ).mult( 32 )
            )
            .else( do_exp2.$( exp ) )
        )
    )
);

const value_has_only_master_and_lovelaces = phoist(
    pfn([
        V2.PValue.type,
        V2.PCurrencySymbol.type
    ],  bool)
    ( ( value, own_policy ) => {
    
        // inlined
        const onlyTwoEntries = pisEmpty.$( value.tail.tail );
    
        const fstEntry = plet( value.head );
        const sndEntry = plet( value.tail.head );

        const checkMasterAssets = plet(
            plam( V2.PValueEntry.type, bool )
            (({ policy, assets }) => {

                // inlined
                const onlySigleAsset = pisEmpty.$( assets.tail );

                const { tokenName, quantity } = assets.head;

                return onlySigleAsset
                .and(  policy.eq( own_policy ) )
                .and(  tokenName.eq( master_tn ) )
                .and(  quantity.eq(1) );
            })
        )
    
        // inlined
        const correctAmount = pif( bool ).$( fstEntry.fst.eq("") )
        .then( checkMasterAssets.$( sndEntry ) )
        .else( checkMasterAssets.$( fstEntry ) );

        return onlyTwoEntries
        .and(  correctAmount )
    })
);

const value_contains_master = phoist(
    pfn([
        V2.PValue.type,
        V2.PCurrencySymbol.type
    ],  bool)
    ( ( value, own_policy ) => {

        const checkMasterAssets = plet(
            plam( V2.PValueEntry.type, bool )
            (({ policy, assets }) => {

                // inlined
                const onlySigleAsset = pisEmpty.$( assets.tail );

                const { tokenName, quantity } = assets.head;

                return onlySigleAsset
                .and(  policy.eq( own_policy ) )
                .and(  tokenName.eq( master_tn ) )
                .and(  quantity.eq(1) );
            })
        );

        return value.some(({ policy, assets }) => {

            // inlined
            const singleAssetEntry = pisEmpty.$( assets.tail );

            const { tokenName, quantity } = assets.head;

            return policy.eq( own_policy )
            .and( singleAssetEntry )
            .and( tokenName.eq( master_tn ) )
            .and( quantity.eq( 1 ) )
        });
    })
);

const get_difficulty_adjustment = phoist(
    plam( int, list( int ) )
    ( tot_epoch_time =>
        pif( list( int ) )
        .$(
            epoch_target.div( tot_epoch_time ).gtEq( 4 )
            .and(
                tot_epoch_time.mod( epoch_target ).gt( 0 )
            )
        )
        .then(
            pListPairInt([ 1, 4 ])
        )
        .else(

            pif( list( int ) )
            .$(
                tot_epoch_time.div( epoch_target ).gtEq( 4 )
                .and(
                    tot_epoch_time.mod( epoch_target ).gt( 0 )
                )
            )
            .then(
                pListPairInt([ 4, 1 ])
            )
            .else(
                pListPairInt([ tot_epoch_time, epoch_target ])
            )

        )
    )
);

const get_new_difficulty = phoist(
    pfn([ int, int, int, int ], list( int ) )
    ((
        difficulty_num,
        curr_leading_zeros,
        adj_num,
        adj_den
    ) => {

        const new_padded_difficulty = plet(
            difficulty_num.mult( padding ).mult( adj_num ).div( adj_den )
        );

        const new_difficulty = plet(
            new_padded_difficulty.div( padding )
        );

        return pif( list( int ) )
        .$( new_padded_difficulty.div( 65536 ).eq( 0 ) )
        .then(
            pif( list( int ) ).$( curr_leading_zeros.gtEq( 62 ) )
            .then( pListPairInt([ 4096, 62 ]) )
            .else( pListPairInt([ new_padded_difficulty, curr_leading_zeros.add( 1 ) ]) )
        )
        .else(
            pif( list( int ) )
            .$( new_difficulty.div( 65536 ).gt( 0 ) )
            .then(
                pif( list( int ) )
                .$( curr_leading_zeros.ltEq( 2 ) )
                .then( pListPairInt([ 65535, 2 ]) )
                .else(
                    pListPairInt([ 
                        new_difficulty.div( padding ),
                        curr_leading_zeros.sub( 1 ) 
                    ])
                )
            )
            .else(
                pListPairInt([
                    new_difficulty,
                    curr_leading_zeros
                ])
            )
        );
    })
);

const do_calculate_interlink_t = fn([
    list( data ),
    data,
    int,
    int,
    int,
    int
], list( data ));

const do_calculate_interlink = phoist(
    precursive(
        pfn([
            do_calculate_interlink_t,
            list( data ),
            data,
            int,
            int,
            int,
            int
        ], list( data ))
        ((
            do_calculate_interlink,
            interlink,
            curr_hash,
            found_leading_zeros,
            found_difficulty_num,
            difficulty_num,
            leading_zeroes
        ) => {

            const new_diff = plet(
                get_new_difficulty
                .$( difficulty_num )
                .$( leading_zeroes )
                .$( 1 )
                .$( 2 )
            );

            const halved_diff = new_diff.head;
            const halved_leading_zeros = new_diff.tail.head;

            return pif( list( data ) )
            // if 
            // found_leading_zeros > halved_leading_zeroes || 
            // found_leading_zeros == halved_leading_zeroes && 
            // found_difficulty_number < halved_difficulty{
            .$(
                found_leading_zeros.gt( halved_leading_zeros )
                .or(
                    found_leading_zeros.eq( halved_leading_zeros )
                    .and(
                        found_difficulty_num.lt( halved_diff )
                    )
                )
            )
            .then(
                do_calculate_interlink
                .$(
                    pmatchList( list( data ), data )
                    .$( pdelay( pnilData ) )
                    .$( (( _: any , rest: any ) => rest) as any )
                    .$( interlink )
                )
                .$( curr_hash )
                .$( found_leading_zeros )
                .$( found_difficulty_num )
                .$( halved_diff )
                .$( halved_leading_zeros )
                .prepend( curr_hash )
            )
            .else(
                interlink
            );
        })
    )
);

const calculate_interlink = phoist(
    precursive(
        pfn([
            do_calculate_interlink_t,
            list( data ),
            data,
            int,
            int,
            int,
            int
        ], list( data ))
        ((
            calculate_interlink,
            interlink,
            curr_hash,
            found_leading_zeros,
            found_difficulty_num,
            difficulty_num,
            leading_zeroes
        ) => {

            const new_diff = plet(
                get_new_difficulty
                .$( difficulty_num )
                .$( leading_zeroes )
                .$( 1 )
                .$( 4 )
            );

            const quarter_diff = new_diff.head;
            const quarter_leading_zeros = new_diff.tail.head;

            return pif( list( data ) )
            // if 
            // found_leading_zeros > quarter_leading_zeroes || 
            // found_leading_zeros == quarter_leading_zeroes && 
            // found_difficulty_number < quarter_difficulty{
            .$(
                found_leading_zeros.gt( quarter_leading_zeros )
                .or(
                    found_leading_zeros.eq( quarter_leading_zeros )
                    .and(
                        found_difficulty_num.lt( quarter_diff )
                    )
                )
            )
            .then(
                calculate_interlink
                .$(
                    pchooseList( data , list( data ) )
                    .$( interlink )
                    // [] ->
                    .$( pnilData )
                    .$( 
                        plet( interlink.tail ).in( rest => 
                            pchooseList( data , list( data ) )
                            .$( rest )
                            // [_] ->
                            .$( pnilData )
                            // [_, _, ..rest] ->
                            .$( rest.tail )
                        )
                    )
                )
                .$( curr_hash )
                .$( found_leading_zeros )
                .$( found_difficulty_num )
                .$( quarter_diff )
                .$( quarter_leading_zeros )
                .prepend( curr_hash )
                .prepend( curr_hash )
            )
            .else(
                do_calculate_interlink
                .$( interlink )
                .$( curr_hash )
                .$( found_leading_zeros )
                .$( found_difficulty_num )
                .$( difficulty_num )
                .$( leading_zeroes )
            );
        })
    )
);

const MintingState = pstruct({
    Mine: {},
    Genesis: {}
});

const SpendingState = pstruct({
    SpendingState: {
        block_number: int,
        current_hash: bs,
        leading_zeros: int,
        difficulty_number: int,
        epoch_time: int,
        current_posix_time: int,
        extra: data,
        interlink: list( data )
    }
})

const TargetState = pstruct({
    TargetState: {
        nonce: bs,
        block_number: int,
        current_hash: bs,
        leading_zeros: int,
        difficulty_number: int,
        epoch_time: int,
    }
});

const Redeemer = pstruct({
    // must be 0
    CtxLike: {
        tx: V2.PTxInfo.type,
        purpose: V2.PScriptPurpose.type
    },
    InputNonce: {
        nonce: bs
    }
});

const passert = phoist(
    plam( bool, unit )
    ( condition =>
        pif( unit ).$( condition )
        .then( pmakeUnit() )
        .else( perror( unit ) )
    )
);

function accessConstIdx( term: TermList<PData>, idx: number ): Term<PData>
{
    idx = Math.round( Number( idx ) );
    if( !Number.isSafeInteger( idx ) ) return term.head;
    
    for( let i = 0; i < idx; i++ )
    {
        term = term.tail;
    }

    return term.head;
}

const tempura
    // typescript wants us to specify the type if we export
    // this has no effect on the contract
    : TermFn<[
        typeof V2.PTxOutRef,
        PData,
        typeof Redeemer
    ], PUnit>
= pfn([
    V2.PTxOutRef.type,
    data,
    Redeemer.type
],  unit)
(( utxoParam, _state, rdmr ) =>
    pmatch( rdmr )
    // minting policy
    .onCtxLike(({ tx, purpose }) => {

        const state = punsafeConvertType( _state, MintingState.type );

        const own_policy = plet(
            pmatch( purpose )
            .onMinting(({ currencySym }) => currencySym )
            ._( _ => perror( bs ) )
        );

        return pmatch( state )
        .onGenesis( _ => {

            const { inputs: ins, outputs: outs, mint, interval } = tx;

            // inlined
            const upper_range = 
                pmatch( interval.to.bound )
                .onPFinite(({ n }) => n )
                ._ (  _ => perror( int ) )

            const lower_range = plet(
                pmatch( interval.from.bound )
                .onPFinite(({ n }) => n )
                ._ (  _ => perror( int ) )
            );

            const time_diff = plet(
                psub
                .$( upper_range )
                .$( lower_range )
            );

            // inlined
            // Mint(0) Genesis requirement: Time range span is 3 minutes or less and inclusive
            const timerangeIn3Mins = time_diff.lt( 180_000 );

            // inlined
            const averaged_current_time = time_diff.div( 2 ).add( lower_range );

            // inlined 
            // Mint(1) Genesis requirement: Contract has initial entropy hash. No need for difficulty check
            const spendsUtxoParam = ins.some( i => i.utxoRef.eq( utxoParam ) );

            const bootstrap_hash = plet(
                psha2_256.$(
                    psha2_256.$(
                        pserialiseData.$(
                            punsafeConvertType( utxoParam, data )
                        )
                    ) 
                )
            );

            const outsToSelf = plet(
                outs.filter( out => 
                    out.address.credential.eq( 
                        V2.PCredential.PScriptCredential({ 
                            valHash: pBSToData.$( own_policy ) 
                        })
                    )
                )
            );

            // inlined
            // Mint(2) Genesis requirement: Expect one ouput with payment credential matching policy id
            const singleOutToSelf = pisEmpty.$( outsToSelf.tail );

            const outToSelf = plet( outsToSelf.head );

            // inlined
            // Mint(3) Genesis requirement: Mints master token
            const mintsMaster = value_contains_master.$( mint ).$( own_policy );

            // inlined
            // Mint(4) Genesis requirement: Master token goes to only script output
            const outToSelfHasMaster = value_has_only_master_and_lovelaces.$( outToSelf.value ).$( own_policy );

            // inlined
            const outState =
                pmatch( outToSelf.datum )
                .onInlineDatum(({ datum }) => punsafeConvertType( datum, SpendingState.type ) )
                ._( _ => perror( SpendingState.type ) );

            // inlined
            // Mint(5) Genesis requirement: Check initial datum state is set to default
            const correctInitialState = (
                SpendingState.SpendingState({
                    block_number: pDataI( 0 ),
                    current_hash: pBSToData.$( bootstrap_hash ),
                    leading_zeros: pDataI( 5 ),
                    difficulty_number:  pDataI( 65535 ),
                    epoch_time: pDataI( 0 ),
                    current_posix_time: pIntToData.$( averaged_current_time ),
                    extra: pDataI( 0 ),
                    interlink: pListToData.$( pnilData )
                }).eq( outState )
            );

            return passert.$(
                // Mint(0) Genesis requirement: Time range span is 3 minutes or less and inclusive
                timerangeIn3Mins
                // Mint(1) Genesis requirement: Contract has initial entropy hash. No need for difficulty check
                .and( spendsUtxoParam )
                // Mint(2) Genesis requirement: Expect one ouput with payment credential matching policy id
                .and( singleOutToSelf )
                // Mint(3) Genesis requirement: Mints master token
                .and( mintsMaster )
                // Mint(4) Genesis requirement: Master token goes to only script output
                .and( outToSelfHasMaster )
                // Mint(5) Genesis requirement: Check initial datum state is set to default
                .and( correctInitialState )
            );
        })
        .onMine( _ =>
            // forwards to validator
            passert.$(
                tx.inputs.some( i =>
                    i.resolved.address.credential.eq(
                        V2.PCredential.PScriptCredential({
                            valHash: pBSToData.$( own_policy )
                        })
                    )
                )
            )
        );
    })
    // spending validator
    .onInputNonce(({ nonce }) =>
        punsafeConvertType(
            plam( V2.PScriptContext.type, unit )
            (({ tx, purpose }) => {
                
                const state = punsafeConvertType( _state, SpendingState.type );

                const {
                    block_number,
                    current_hash,
                    leading_zeros,
                    difficulty_number,
                    epoch_time,
                    current_posix_time,
                    interlink
                } = state;

                const spendingUtxoRef = plet(
                    pmatch( purpose )
                    .onSpending(({ utxoRef }) => utxoRef )
                    ._( _ => perror( V2.PTxOutRef.type ) )
                );

                const { inputs: ins, outputs: outs, mint, interval } = tx;

                const ownIn = plet(
                    pmatch(
                        ins.find( i => i.utxoRef.eq( spendingUtxoRef ) )
                    )
                    .onJust(({ val }) => val.resolved )
                    .onNothing( _ => perror( V2.PTxOut.type ) )
                );

                const own_validator_hash = plet(
                    punBData.$( ownIn.address.credential.raw.fields.head )
                );

                const ownOuts = plet(
                    outs.filter( out => out.address.eq( ownIn.address ) )
                );

                // inlined
                // Spend(0) requirement: Contract has only one output going back to itself
                const singleOutToSelf = pisEmpty.$( ownOuts.tail );

                const ownOut = plet( ownOuts.head );

                // inlined
                const upper_range = 
                pmatch( interval.to.bound )
                .onPFinite(({ n }) => n )
                ._( _ => perror( int ) )

                const lower_range = plet(
                    pmatch( interval.from.bound )
                    .onPFinite(({ n }) => n )
                    ._ (  _ => perror( int ) )
                );

                const time_diff = plet(
                    psub
                    .$( upper_range )
                    .$( lower_range )
                );

                // inlined
                // Spend(1) requirement: Time range span is 3 minutes or less and inclusive
                const timerangeIn3Mins = time_diff.ltEq( 180_000 );

                // inlined
                const averaged_current_time = time_diff.div( 2 ).add( lower_range );

                /*
                SpendingState: {
                    0: block_number: int,
                    1: current_hash: bs,
                    2: leading_zeros: int,
                    3: difficulty_number: int,
                    4: epoch_time: int,
                    5: current_posix_time: int,
                    6: extra: data,
                    7: interlink: list( data )
                }
                */
               // inlined
                const target_state = // plet(
                    TargetState.TargetState({
                        nonce: rdmr.raw.fields.head,
                        epoch_time: accessConstIdx( state.raw.fields, 4 ),
                        block_number: accessConstIdx( state.raw.fields, 0 ),
                        current_hash: accessConstIdx( state.raw.fields, 1 ),
                        leading_zeros: accessConstIdx( state.raw.fields, 2 ),
                        difficulty_number: accessConstIdx( state.raw.fields, 3 ),
                    })
                // );

                const found_bytearray = plet(
                    psha2_256.$(
                        psha2_256.$(
                            pserialiseData.$(
                                punsafeConvertType( target_state, data )
                            )
                        ) 
                    )
                );

                const formatted = format_found_bytearray.$( found_bytearray );

                const found_difficulty_num = plet( formatted.head );
                const found_leading_zeros = plet( formatted.tail.head );

                // inlined
                // Spend(2) requirement: Found difficulty is less than or equal to the current difficulty
                // We do this by checking the leading zeros and the difficulty number
                const meetsDifficulty = found_leading_zeros.gt( leading_zeros )
                .or(
                    found_leading_zeros.eq( leading_zeros )
                    .and(
                        found_difficulty_num.lt( difficulty_number )
                    )
                );

                // inlined
                // Spend(3) requirement: Input has master token
                const inputHasMasterToken = ownIn.value.amountOf( own_validator_hash as any, master_tn as any ).eq( 1 );

                const ownMints = plet(
                    pmatch(
                        mint.find(({ policy }) => policy.eq( own_validator_hash ) )
                    )
                    .onJust(({ val }) => val.snd )
                    .onNothing( _ => perror( list( V2.PAssetsEntry.type ) ) )
                );

                // inlined
                // Spend(4) requirement: Only one type of token minted under the validator policy
                const singleMintEntry = pisEmpty.$( ownMints.tail );

                const { fst: ownMint_tn, snd: ownMint_qty } = ownMints.head;

                const halving_exponent = plet( block_number.div( halving_number ) );

                // inlined
                const expected_quantity =
                    pif( int ).$( halving_exponent.gt( 29 ) )
                    .then( 0 )
                    .else(
                        initial_payout.div( exp2.$( halving_exponent ) )
                    );

                // inlined
                // Spend(5) requirement: Minted token is the correct name and amount
                const correctMint = ownMint_tn.eq( tn ).and( ownMint_qty.eq( expected_quantity ) )

                // inlined
                // Spend(6) requirement: Output has only master token and ada
                const outHasOnlyMaster = value_has_only_master_and_lovelaces.$( ownOut.value ).$( own_validator_hash );

                // Check output datum contains correct epoch time, block number, hash, and leading zeros
                // Check for every divisible by 2016 block: 
                // - Epoch time resets
                // - leading zeros is adjusted based on percent of hardcoded target time for 2016 blocks vs epoch time
                const out_datum = plet(
                    pmatch( ownOut.datum )
                    .onInlineDatum(({ datum }) => punsafeConvertType( datum, SpendingState.type) )
                    ._( _ => perror( SpendingState.type ) )
                );

                // Spend(7) requirement: Expect Output Datum to be of type State
                // (implicit: fails field extraction if it is not)
                const {
                    block_number: out_block_number,
                    current_hash: out_current_hash,
                    leading_zeros: out_leading_zeros,
                    epoch_time: out_epoch_time,
                    current_posix_time: out_current_posix_time,
                    // interlink: out_interlink,
                    extra,
                    difficulty_number: out_difficulty_number
                } = out_datum;

                // inlined
                const tot_epoch_time =
                    epoch_time
                    .add( averaged_current_time )
                    .sub( current_posix_time );

                const diff_adjustment = plet(
                    get_difficulty_adjustment.$( tot_epoch_time )
                );

                const adjustment_num = diff_adjustment.head;
                const adjustment_den = diff_adjustment.tail.head;

                const new_diff = plet(
                    get_new_difficulty
                    .$( difficulty_number )
                    .$( leading_zeros )
                    .$( adjustment_num )
                    .$( adjustment_den )
                );

                const new_difficulty = new_diff.head;
                const new_leading_zeros = new_diff.tail.head;

                // inlined
                const new_epoch_time = epoch_time.add( averaged_current_time ).sub( current_posix_time );

                // inlined
                // Spend(8) requirement: Check output has correct difficulty number, leading zeros, and epoch time
                const correctOutDatum = 
                new_leading_zeros.eq( out_leading_zeros )
                .and( new_difficulty.eq( out_difficulty_number ) )
                .and(
                    out_epoch_time.eq(
                        pif( int ).$(
                            block_number.mod( epoch_number ).eq( 0 )
                            .and( block_number.gt( 0 ) )
                        )
                        .then( 0 )
                        .else( new_epoch_time )
                    )
                );

                return passert.$(
                    // Spend(0) requirement: Contract has only one output going back to itself
                    singleOutToSelf
                    // Spend(1) requirement: Time range span is 3 minutes or less and inclusive
                    .and( timerangeIn3Mins )
                    // Spend(2) requirement: Found difficulty is less than or equal to the current difficulty
                    .and( meetsDifficulty )
                    // Spend(3) requirement: Input has master token
                    .and( inputHasMasterToken )
                    // Spend(4) requirement: Only one type of token minted under the validator policy
                    .and( singleMintEntry )
                    // Spend(5) requirement: Minted token is the correct name and amount
                    .and( correctMint )
                    // Spend(6) requirement: Output has only master token and ada
                    .and( outHasOnlyMaster )
                    // Spend(7) requirement: Expect Output Datum to be of type State
                    // (implicit: fails field extraction if it is not)
                    // Spend(8) requirement: Check output has correct difficulty number, leading zeros, and epoch time
                    .and( correctOutDatum )
                    // Spend(9) requirement: Output posix time is the averaged current time
                    .and( out_current_posix_time.eq( averaged_current_time ) )
                    // Spend(10) requirement: Output block number is the input block number + 1 
                    .and( out_block_number.eq( block_number.add( 1 ) ) )
                    // Spend(11) requirement: Output current hash is the target hash
                    .and( out_current_hash.eq( found_bytearray ) )
                    //Spend(12) requirement: Check output extra field is within a certain size
                    .and( pserialiseData.$( extra ).length.ltEq( 512 ) )
                    // Spend(13) requirement: Check output interlink is correct
                    .and(
                        peqData
                        .$(
                            // out_interlink
                            accessConstIdx( state.raw.fields, 7 )
                        )
                        .$(
                            pListToData.$(
                                calculate_interlink
                                .$( interlink )
                                .$( pBSToData.$( found_bytearray ) )
                                .$( found_leading_zeros )
                                .$( found_difficulty_num )
                                .$( difficulty_number )
                                .$( leading_zeros )
                            )
                        )
                    )
                );
            }),
            unit
        )
    )
) as any;


function TxOutRef_fromString( str: string ): TxOutRef
{
    str = String( str );
    const [ id, idx ] = str.split("#");

    if( typeof id !== "string" || typeof idx !== "string" )
    throw new Error("TxOutRef.fromScript expects a valid TxOutRefStr as argument");

    let index!: number;

    try {
        index = parseInt( idx );
    }
    catch {
        throw new Error("TxOutRef.fromScript expects a valid TxOutRefStr as argument; index was not a number");
    }

    if(!(
        index >= 0 &&
        Number.isSafeInteger( index )
    ))
    throw new Error("TxOutRef.fromScript expects a valid TxOutRefStr as argument; index was not a valid integer");

    return new TxOutRef({ id, index });
}

const ADA = 1_000_000;

test("applied tempura", () => {
    
    const utxoRefStr = "8df5ef483fb517c8531bae31eed4368af174938a0b6b51ac5b22a6bcc74089b2#0";
    
    const utxoRef = TxOutRef_fromString( utxoRefStr );
    
    const changeAddress = "addr_test1qqgdj25j6pj6ac8pe5khv7l6ge337mmm5eyauaj0nq8skdmxqj6zqxuv7k6lu4m8ll4c9zatlxmr2a9wyluhqkz6grhq84r806"
    
    const inputUtxo = new UTxO({
        utxoRef,
        resolved: {
            address: changeAddress,
            value: Value.lovelaces( 10_000 * ADA )
        }
    });
    
    const appliedTempura = tempura.$(
        V2.PTxOutRef.fromData( pData( utxoRef.toData() ) )
    );

    const uplc = appliedTempura.toUPLC();

    // console.log( showUPLC( uplc ) );
});
