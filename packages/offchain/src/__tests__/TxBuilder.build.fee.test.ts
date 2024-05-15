import { fromAscii, fromHex } from "@harmoniclabs/uint8array-utils";
import { Address, Hash28, Script, TxOut, TxOutRef, UTxO, Value, defaultProtocolParameters } from "@harmoniclabs/cardano-ledger-ts";
import { DataConstr, DataI, dataFromCbor } from "@harmoniclabs/plutus-data";
import { PTokenName, PAssetsEntry, PCredential, PCurrencySymbol, PData, PExtended, PInt, PScriptContext, PScriptPurpose, PTxInfo, PTxOut, PTxOutRef, PType, PUnit, PValue, PValueEntry, Term, TermFn, TermList, bool, bs, data, delayed, fn, int, lam, list, pBSToData, pBool, pData, pDataI, pInt, pIntToData, pList, pListToData, pchooseList, pdelay, peqData, perror, pfn, pforce, phoist, pif, pindexBs, pisEmpty, plam, plet, pmakeUnit, pmatch, pmatchList, pnilData, precursive, pserialiseData, psha2_256, pstrictIf, pstruct, psub, ptrace, ptraceError, ptraceVal, punBData, punIData, punsafeConvertType, str, termTypeToString, unit } from "../../../onchain/src/pluts";
import { TxBuilder } from "..";

const master_tn = PTokenName.from( fromAscii("itamae") );

const tn = PTokenName.from( fromAscii("TEMPURA") );

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

                const curr_byte = plet( pindexBs.$( b ).$( i ) );

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

        const pbyteAt = plet( pindexBs.$( b ) );

        const pbyteAtPosition = plet( pbyteAt.$( bytearray_position ) );

        // inlined
        const even_diff_num = 
            pbyteAtPosition.mult( 256 )
            .add( pbyteAt.$( bytearray_position.add( 1 ) ) );

        // inlined
        const odd_diff_num = 
            pbyteAtPosition.mult( 4096 )
            .add(
                pbyteAt.$( bytearray_position.add( 1 ) ).mult( 16 )
            )
            .add(
                pbyteAt.$( bytearray_position.add( 2 ) ).div( 16 )
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
        PValue.type,
        PCurrencySymbol.type
    ],  bool)
    (( value, own_policy ) => {
    
        // inlined
        const onlyTwoEntries = pisEmpty.$( value.tail.tail );
    
        const fstEntry = plet( value.head );
        const sndEntry = plet( value.tail.head );

        const checkMasterAssets = plet(
            plam( PValueEntry.type, bool )
            (({ fst: policy, snd: assets }) => {

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
        PValue.type,
        PCurrencySymbol.type
    ],  bool)
    ( ( value, own_policy ) => {

        return value.some(({ fst: policy, snd: assets }) => {

            // inlined
            const singleAssetEntry = pisEmpty.$( assets.tail );

            const { fst: tokenName, snd: quantity } = assets.head;

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

        // return pListPairInt([16383,5]);
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
                    .$( (( _, rest ) => rest) as any )
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
        tx: PTxInfo.type,
        purpose: PScriptPurpose.type
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

const passertOrTrace = phoist(
    pfn([ bool, str] , unit )
    ( (condition, msg) =>
        pif( unit ).$( condition )
        .then( pmakeUnit() )
        .else( ptraceError( unit ).$( msg ) )
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

function traceThing<Thing extends Term<PType>>( thing: Thing, msg: string ): Thing
{
    return pforce( ptrace( delayed(thing.type) ).$(msg).$(pdelay( thing )) ) as any;
}

const pgetFinite = phoist(
    pfn([
        PExtended.type
    ], int)
    ( extended =>
        pmatch( extended )
        .onPFinite(({ _0 }) => _0)
        ._( _ => perror( int ) )
    )
);

const tempura
= pfn([
    PTxOutRef.type,
    data,
    Redeemer.type
],  unit)
(( utxoParam, _state, rdmr ) =>
    //*
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
                .onPFinite(({ _0 }) => _0 )
                ._ (  _ => perror( int ) )

            const lower_range = plet(
                pmatch( interval.from.bound )
                .onPFinite(({ _0 }) => _0 )
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
                        PCredential.PScriptCredential({ 
                            valHash: pBSToData.$( own_policy ) 
                        })
                    )
                )
            );

            // inlined
            // Mint(2) Genesis requirement: Expect one ouput with payment credential matching policy id
            const singleOutToSelf = pisEmpty.$( outsToSelf.tail );

            const outToSelf = outsToSelf.head;

            // inlined
            // Mint(3) Genesis requirement: Mints master token
            const mintsMaster = value_contains_master.$( mint ).$( own_policy );

            // inlined
            // Mint(4) Genesis requirement: Master token goes to only script output
            const outToSelfHasMaster = value_contains_master.$( outToSelf.value ).$( own_policy );

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
                        PCredential.PScriptCredential({
                            valHash: pBSToData.$( own_policy )
                        })
                    )
                )
            )
        );
    })
    // spending validator
    .onInputNonce(({ nonce }) =>
    //*/
        punsafeConvertType(
            plam( PScriptContext.type, unit )
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
                    ._( _ => perror( PTxOutRef.type ) )
                );

                const { inputs: ins, outputs: outs, mint, interval } = tx;

                const ownIn = plet(
                    pmatch(
                        ins.find( i => i.utxoRef.eq( spendingUtxoRef ) )
                    )
                    .onJust(({ val }) => val.resolved )
                    .onNothing( _ => perror( PTxOut.type ) )
                );

                const ownAddr = plet( ownIn.address );
                const ownValue = plet( ownIn.value );

                const own_validator_hash = plet(
                    punBData.$( ownAddr.credential.raw.fields.head )
                );

                const ownOuts = plet(
                    outs.filter( out => out.address.eq( ownAddr ) )
                );

                // inlined
                // Spend(0) requirement: Contract has only one output going back to itself
                const singleOutToSelf = pisEmpty.$( ownOuts.tail );

                const ownOut = plet( ownOuts.head );

                // inlined
                const upper_range = pgetFinite.$( interval.to.bound );

                const lower_range = pgetFinite.$( interval.from.bound );

                const time_diff =
                // plet(
                    psub
                    .$( upper_range )
                    .$( lower_range )
                // );

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

                const found_difficulty_num = formatted.head;
                const found_leading_zeros  = formatted.tail.head;

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
                const inputHasMasterToken = value_contains_master.$( ownValue ).$( own_validator_hash );
                // ownValue.amountOf( own_validator_hash, master_tn ).eq( 1 );

                const correctMint = plet(
                    pmatch(
                        mint.find(({ fst: policy }) => policy.eq( own_validator_hash ))
                    )
                    .onJust(({ val }) => val.snd )
                    .onNothing( _ => perror( list( PAssetsEntry.type ) ) )
                ).in( ownMints => {

                    // // inlined
                    // // Spend(4) requirement: Only one type of token minted under the validator policy
                    // const singleMintEntry = pisEmpty.$( ownMints.tail );

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
                    const _correctMint = ownMint_tn.eq( tn ).and( ownMint_qty.eq( expected_quantity ) );

                    return ownMint_tn.eq( tn ).and( ownMint_qty.eq( expected_quantity ) );
                })

                const ownMints = plet(
                    pmatch(
                        mint.find(({ fst: policy }) => policy.eq( own_validator_hash ))
                    )
                    .onJust(({ val }) => val.snd )
                    .onNothing( _ => perror( list( PAssetsEntry.type ) ) )
                );

                // inlined
                // Spend(4) requirement: Only one type of token minted under the validator policy
                const singleMintEntry = pisEmpty.$( ownMints.tail );

                // const { fst: ownMint_tn, snd: ownMint_qty } = ownMints.head;

                // const halving_exponent = plet( block_number.div( halving_number ) );

                // // inlined
                // const expected_quantity =
                //     pif( int ).$( halving_exponent.gt( 29 ) )
                //     .then( 0 )
                //     .else(
                //         initial_payout.div( exp2.$( halving_exponent ) )
                //     );
                
                // // inlined
                // // Spend(5) requirement: Minted token is the correct name and amount
                // const _correctMint = ownMint_tn.eq( tn ).and( ownMint_qty.eq( expected_quantity ) )

                // inlined
                // Spend(6) requirement: Output has only master token and ada
                const outHasOnlyMaster = value_contains_master.$( ownOut.value ).$( own_validator_hash );

                // Check output datum contains correct epoch time, block number, hash, and leading zeros
                // Check for every divisible by 2016 block: 
                // - Epoch time resets
                // - leading zeros is adjusted based on percent of hardcoded target time for 2016 blocks vs epoch time
                const out_state = plet(
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
                } = out_state;

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

                // const new_diff = plet(
                //     get_new_difficulty
                //     .$( difficulty_number )
                //     .$( leading_zeros )
                //     .$( adjustment_num )
                //     .$( adjustment_den )
                // );
// 
                // const new_difficulty    = new_diff.head;
                // const new_leading_zeros = new_diff.tail.head;
// 
                // // inlined
                // const new_epoch_time = epoch_time.add( averaged_current_time ).sub( current_posix_time );

                // inlined
                // Spend(8) requirement: Check output has correct difficulty number, leading zeros, and epoch time
                const correctOutDatum = plet(
                    get_new_difficulty
                    .$( difficulty_number )
                    .$( leading_zeros )
                    .$( adjustment_num )
                    .$( adjustment_den )
                ).in( new_diff => {

                    const new_difficulty    = new_diff.head; // 16383
                    const new_leading_zeros = new_diff.tail.head; // 5

                    // inlined
                    const new_epoch_time = epoch_time.add( averaged_current_time ).sub( current_posix_time );

                    return plet( out_state.raw.fields ).in( outStateFields => {

                        const out_leading_zeros = punIData.$(
                            accessConstIdx( outStateFields, 2 )
                        );
                        const out_difficulty_number = punIData.$(
                            accessConstIdx( outStateFields, 3 )
                        );
                        const out_epoch_time = punIData.$(
                            accessConstIdx( outStateFields, 4 )
                        );

                        return new_leading_zeros.eq( out_leading_zeros )
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
                    });
                });
                
                return passert.$(
                    // Spend(0) requirement: Contract has only one output going back to itself
                    singleOutToSelf // OK
                    // Spend(1) requirement: Time range span is 3 minutes or less and inclusive
                    .and( timerangeIn3Mins ) // OK
                    // Spend(2) requirement: Found difficulty is less than or equal to the current difficulty
                    .and( meetsDifficulty ) // OK
                    // Spend(3) requirement: Input has master token
                    .and( inputHasMasterToken ) // OK
                    // Spend(4) requirement: Only one type of token minted under the validator policy
                    .and( singleMintEntry ) // OK
                    // Spend(5) requirement: Minted token is the correct name and amount
                    .and( correctMint )
                    // Spend(6) requirement: Output has only master token and ada
                    .and( outHasOnlyMaster ) // OK
                    // Spend(7) requirement: Expect Output Datum to be of type State
                    // (implicit: fails field extraction if it is not)
                    // Spend(8) requirement: Check output has correct difficulty number, leading zeros, and epoch time
                    .and( correctOutDatum )
                    // Spend(9) requirement: Output posix time is the averaged current time
                    .and( out_current_posix_time.eq( averaged_current_time ) ) // OK
                    // Spend(10) requirement: Output block number is the input block number + 1 
                    .and( out_block_number.eq( block_number.add( 1 ) ) ) // OK
                    // Spend(11) requirement: Output current hash is the target hash
                    .and( out_current_hash.eq( found_bytearray ) ) // OK
                    // Spend(12) requirement: Check output extra field is within a certain size
                    .and( pserialiseData.$( extra ).length.ltEq( 512 ) ) // OK
                    // Spend(13) requirement: Check output interlink is correct
                    .and( // OK
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
                    ) // OK
                );
            }),
            unit
        )
    )
);

const contract = tempura.$(
    PTxOutRef.fromData(
        pData(
            new TxOutRef({
                "id": "1cd30f11c3d774fa1cb43620810a405e6048c8ecea2e85ff43f5c3ad08096e46",
                "index": 1
            }).toData()
        )
    )
);

const datumData = dataFromCbor("d8799f00582071eb1a4896739027745df976a065ded7ffd4e6371a2a9256999f59371b50b36a0519ffff001b0000018a5b512a340080ff");
const rdmrData  = dataFromCbor("d87a9f50842b09bb0f88bf1232901043701534ceff");
const ctxData   = dataFromCbor(
    "D87982D8798C82D87982D87982D87981582012CC3906A43731477E63522A24CBB5EAF74046BF7B44F600D8F062ECAC331B7100D87984D87982D87A81581CC9981006C4ABF1EAB96A0C87B0EE3D40B8007CD4C9B3D0DEA357C278D87A80A240A1401A001898F4581CC9981006C4ABF1EAB96A0C87B0EE3D40B8007CD4C9B3D0DEA357C278A1466974616D616501D87B81D8798800582071EB1A4896739027745DF976A065DED7FFD4E6371A2A9256999F59371B50B36A05193FFF001B0000018A5B512A340080D87A80D87982D87982D879815820FBBCE31D47E45AF499BAFF9446C99CCBC2E80DB613467DBC5FFEA2F3BB10A8A201D87984D87982D87981581C13867B04DB054CAA9655378FE37FEDEE7029924FBE1243887DC35FD8D87A80A140A1401B000000024EFC84FFD87980D87A8082D87982D87982D879815820FBBCE31D47E45AF499BAFF9446C99CCBC2E80DB613467DBC5FFEA2F3BB10A8A200D87984D87982D87A81581CC9981006C4ABF1EAB96A0C87B0EE3D40B8007CD4C9B3D0DEA357C278D87A80A140A1401A0128CCE6D87B8100D87981581CC9981006C4ABF1EAB96A0C87B0EE3D40B8007CD4C9B3D0DEA357C278D87982D87982D879815820FBBCE31D47E45AF499BAFF9446C99CCBC2E80DB613467DBC5FFEA2F3BB10A8A200D87984D87982D87A81581CC9981006C4ABF1EAB96A0C87B0EE3D40B8007CD4C9B3D0DEA357C278D87A80A140A1401A0128CCE6D87B8100D87981581CC9981006C4ABF1EAB96A0C87B0EE3D40B8007CD4C9B3D0DEA357C27882D87984D87982D87A81581CC9981006C4ABF1EAB96A0C87B0EE3D40B8007CD4C9B3D0DEA357C278D87A80A240A1401A001898F4581CC9981006C4ABF1EAB96A0C87B0EE3D40B8007CD4C9B3D0DEA357C278A1466974616D616501D87B81D8798801582000000F3B69E1436D48366F34C2E217CF598DC2F886D7DC5BB56688B8365A748B05193FFF1A000A75BC1B0000018A5B5B9FF00080D87A80D87984D87982D87981581C13867B04DB054CAA9655378FE37FEDEE7029924FBE1243887DC35FD8D87A80A240A1401B000000024EF9AC02581CC9981006C4ABF1EAB96A0C87B0EE3D40B8007CD4C9B3D0DEA357C278A14754454D505552411B000000012A05F200D87980D87A80A140A1401A0002D8FDA240A14000581CC9981006C4ABF1EAB96A0C87B0EE3D40B8007CD4C9B3D0DEA357C278A14754454D505552411B000000012A05F20080A0D87982D87982D87A811B0000018A5B5A4060D87980D87982D87A811B0000018A5B5CFF80D8798080A2D87A81D87982D87981582012CC3906A43731477E63522A24CBB5EAF74046BF7B44F600D8F062ECAC331B7100D87A8150842B09BB0F88BF1232901043701534CED87981581CC9981006C4ABF1EAB96A0C87B0EE3D40B8007CD4C9B3D0DEA357C278D87980A05820198CA261BC2C0F39E64132C19CD2B2E38DFFC4F5594EC195D8750013F73F1B7BD87A81D87982D87981582012CC3906A43731477E63522A24CBB5EAF74046BF7B44F600D8F062ECAC331B7100"
);

describe("fee calculation", () => {

    describe("with script", () => {

        test.only("tempura mint", () => {

            const txBuilder = new TxBuilder(
                defaultProtocolParameters,
                {
                    systemStartPOSIX: 1666656000_000,
                    slotLengthInMilliseconds: 1000
                }
            );

            const parametrizedContractBytes = fromHex("590b06010000323232323232323232323232323232323232323232323232323232322233301e0012232323232323232323232323232323232323232323232323232332253335734002293099299ab9c00116002491046661696c0033038330383303833038330383303833038330383303833038330383303833573892010f73696e676c654f7574546f53656c6600357466ae880384cd5ce2491074696d6572616e6765496e334d696e73003371266e04c0d8048c0d804520c0fc1513357389210f6d65657473446966666963756c747900330353371000200826607066e1c0100044cdc4001801099ab9c49113696e7075744861734d6173746572546f6b656e00330303756605e02e02a266ae7124010f73696e676c654d696e74456e74727900357466ae880504c8cd5ce2490b636f72726563744d696e7400330393371e6eb8d55ce800a4410754454d50555241001323370e6eb4d55cf0012999ab9a33710901d0008a4000266e0d2080c8afa02533036225333573466e25200a001133704600466e04005200a481004cc0e0894ccd5cd19b890014800052002133704600466e04005200248010004004cdc180824141a2326ae840504cd5ce2481106f75744861734f6e6c794d617374657200330303756605e01a02a264646466ae7124010f636f72726563744f7574446174756d00323232323303f3303f3370e6ae84d5d10021bad35742004266e1cc0ccdd69aba1357440026066a666ae68cc0fccdc399b86016483007d2000133710900000b0a4000266e04cdc000399b803370666e04c0f4064c0f40612004303d01800613370e6ae84010dd69aba1001357440026ae88d5d10009aab9e3754020666605c00a0086ae84004d5d09aba200132533357346607666e25200833706904050644084800899b8848000cdc32410141910212002297ac10284054ccd5cd1981d99b8948020cdc1800a410141910212266e2120003370c0029040506440848a5eb042204133574000297ac180a0c8810919b813370000466e00cdc199b813038014303801348010c0e004c004dd698158089bad302901013357389201166f75745f63757272656e745f706f7369785f74696d65003370e6eb4c0a802ccdc019b8333702606c024606c0229002181b008899ab9c4901106f75745f626c6f636b5f6e756d626572003370e6eb4d5d080599b8000f480084cd5ce249106f75745f63757272656e745f68617368003371e6eb8c0bc02c0144cd5ce2490e7073657269616c6973654461746100337126e34dd9991aba1357446ae88d5d11aba2357446ae8800402d20800813375e6ae84d5d11aba23574400c6e9cccccccc0d08888888c8c8c94ccd5cd1981f99b880010071330423370e00e002266e200180084cd5d000419aba000833333300a53335573e0122064264a666aae7c00440cc4d5d10009aba20090080070060020011333333303e2222222323232533357346609266e2000401c4cc130cdc3803800899b88006002133574001066666601466608e20784400201201000e00c00400220126ae84d5d10011aba1001333303c002001480092004009008007006005004357426ae88008d5d08009999819001000a400490041bac3027010375200a0080060040026eb4c09403cdd6991aba1357446ae88d5d10008071aba13021002357426ae88c080004dc91b92376666e9520003357406ae84d55cf1baa0173357406ae84014cd5d01aba10043357406ae8400ccd5d01aba10023357406ae8400408cd5d10009aba2001357440026ae88004d55cf1baa013301800132333302c301b0022357420020020024c602c6ae84004cc0508cdd79aba13016001009375860300146eb4d5d080098098069aba13012357420046ae84c044c074004c040c050014ccc094ccc88c088894ccd5cd1aba30011011132533357346008002266e952000335740600a002032260066ae88008d5d080091ba73357406aae74004cd5d01aab9e00101523371e6eb8d55ce8008011bab301500426237566aae78c8c8cdd81aba1001357426ae88004dd60009aba1001375c6ae84d55cf1baa35742601c0026ae84004c030ccc088ccc88c07c894ccd5cd1aba3001100e132533357346008002266e952000335740600a00202c260066ae88008d5d08009000919baf35742601a0026466666016603400800200246ae8400400498dd61aba10012623019300d3574200260166ae84004c0280048c8c8c8ccc0880188c8c8c8c8c8c038cc09ccc09ccc09ccc09ccc09ccdc4001a4181f82a266040466ebcd5d0980980080700409aba33574400426603e6eacc06002401c4cc07cdd5980f000803899baf3374a900019aba04c10100003357406ea4dc91b92376601a66ae81300101050033574098010319ffff0033574098010100003357406ea0cdc019b8300348010010cd5d02610100003357406e9c05c05cc8cccc09cc0580088d5d08008008009318089aba1001323301023375e6ae84c048d5d098090008011bac30140083374a900119aba0375200a02a66e04c088d5d09807980d80100098109aba1300e35742002601a6022008460126466038466ebcd5d098079aba1300f301b300f0010020043374a900119aba037520040246466666012603000800200200246eb8d5d0800931bac3574200260126ae8400530012bd8799fd8799f5820d7b41d88a7a42a6aeac933ff47ed253919ca339374dc1ff8961dc42ed56762e8ff01ff002533357340022930b11111191992999ab9a300148000400c54ccd5cd1800a400420082a666ae68c005200410051533357346002900308030b1b8735573a0026aae78004dd5002a6103d87a800023322330132100222233005002300300122533357346006004266ae80008004400401c8d55cf1baa00123232335740a666ae68cdc399b8600248011200013370066e08cdc7001800a41000866e3800ccdc0000a4004266e00cdc019b823371c00600290402019b823371c00666e00005200248080cdc199b8e0033370000290022404066ae800092f58066e0c0052004300200123301022325333573466e1c0052000133700600666e000092002480104ccd5cd19b8800148081200248000cdc7001800a400046ae84d5d11aba20012357426ae88d5d11aba2357446ae88d5d11aba200137629311aba1357446ae88d5d11aba20012357426ae88d5d11aba2357446ae880048888c94ccd5cd19b873370600290404004240002a666ae68cdc4a40f8008297ac18040be04cd5d000099aba033700008900125eb004c94ccd5cd19b8848000cdc1800a410100102a666ae68cdc4802a4008297ac1feff078204cd5d019b8300148080cd5d019b81005480092f580266ae80004cd5d0002a5eb00cdc1800a404066e0ccdc119b82004480800080048cd5ce1b99325333573466e25200000113003001133714911012d0030033370290000008008009803912999ab9a33712900a000899b8a300233706002900a180199b86001480504c00c0048cdc599b8000148181221002357426ae8800488cc00c8c8c8cc034cc034cc034cdc79bae35573a00600826ae8cd5d1001099b8f375c6aae74005221066974616d61650013370e6eb4d55cf000a40046ae84004dd59aab9e001002233002214a044466010600800426006002600444446466600c6008002600600200466008006004444a666aae7c00400c4cc008d5d08009aba2001232300223300200200123002233002002001225333573400429440048c8cccc00c0080048dd69aba100100126222232332533357346002900008018a999ab9a300148008401054ccd5cd1800a4008200a2c6e1cd55ce8009aab9e001375400844a666ae68008004528111191992999ab9a300148000400c54ccd5cd1800a400420082c6e1cd55ce8009aab9e00137540061");

            const contract = new Script(
                "PlutusScriptV2",
                parametrizedContractBytes
            );

            const validatorHash = contract.hash;

            const tokenName = fromAscii("TEMPURA");
            
            const deployedScriptRefUtxo = new UTxO({
                utxoRef: {
                    id: "d30c9aa98b37dfe1f8d6430baa2913326b914b9318f6986a73c0d1ffae4aec29",
                    index: 0
                },
                resolved: {
                    address: Address.fromString("addr_test1wrszeg0tfacvayjqc8e0erhxyszvpa7kxcgeuy6kr8elqscytkx4j"),
                    value: Value.lovelaces( 13_438_660 ),
                    datum: new DataI(0),
                    refScript: contract
                }
            });
            
            const minerAddr  = Address.fromString("addr_test1vqfcv7cymvz5e25k25mclcmlahh8q2vjf7lpysug0hp4lkqg65nup");
            const minerInput = new UTxO({
                utxoRef: {
                    id: "d30c9aa98b37dfe1f8d6430baa2913326b914b9318f6986a73c0d1ffae4aec29",
                    index: 1
                },
                resolved: {
                    address: minerAddr,
                    value: Value.lovelaces( 9_767_890_771 )
                }
            });

            const nonce_redeemer = dataFromCbor("d87a9f50a41bf9f630b6910247112d2193cc4ed5ff");

            const validatorAddr = Address.fromString("addr_test1wrszeg0tfacvayjqc8e0erhxyszvpa7kxcgeuy6kr8elqscytkx4j");
            
            const validatorMasterUtxo = new UTxO({
                utxoRef: {
                    id: "a2dcbaf2decc9bccc44fccef89b7357528796e136285f8c4672aff61fa09fcf0",
                    index: 0
                },
                resolved: {
                    address: validatorAddr,
                    value: new Value([
                        Value.lovelaceEntry( 1_612_020 ),
                        Value.singleAssetEntry( validatorHash, fromAscii("itamae"), 1 )
                    ]),
                    datum: dataFromCbor("d8799f0058203ef7ea8cb0917a8c9fde4ab8e74e84016dffa045ba9e431cec92a49cf25c8a340519ffff001b0000018ca82752640080ff")
                }
            });

            const invalidAfterSlot = 36972363;

            const invalidBeforeSlot = txBuilder.posixToSlot( txBuilder.slotToPOSIX( invalidAfterSlot ) - 180_000 );

            // const tx = txBuilder.buildSync({
            //     invalidBefore: txBuilder.posixToSlot( 1693749756000 ),
            //     invalidAfter:  txBuilder.posixToSlot( 1693749936000 )
            // });
            const tx = txBuilder.buildSync({
                inputs: [
                    {
                        utxo: validatorMasterUtxo,
                        referenceScript: {
                            refUtxo: deployedScriptRefUtxo,
                            datum: "inline",
                            redeemer: nonce_redeemer
                        }
                    },
                    { utxo: minerInput }
                ],
                collaterals: [ minerInput ],
                mints: [
                    {
                        value: Value.singleAsset( validatorHash, tokenName, 5_000_000_000 ),
                        script: {
                            ref: deployedScriptRefUtxo,
                            policyId: validatorHash,
                            redeemer: new DataConstr( 0, [] )
                        }
                    }
                ],
                outputs: [
                    {
                        address: validatorAddr,
                        value: new Value([
                            Value.lovelaceEntry( 5034372 ),
                            Value.singleAssetEntry( validatorHash, fromAscii("itamae"), 1 )
                        ]),
                        datum: dataFromCbor("d8799f01582000000c18082d40cefb61d5a131852882cfe1271ace25c226ecf6c627865c80da05193fff1a000123041b0000018ca82875680080ff")
                    }
                ],
                invalidBefore: invalidBeforeSlot,
                invalidAfter: invalidAfterSlot,
                changeAddress: minerAddr
            });

            expect( Number(tx.body.fee) ).toBeLessThan( 10_000_000 );

        });
        
    });

});