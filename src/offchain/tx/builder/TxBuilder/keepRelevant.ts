import { CanBeUInteger, forceBigUInt } from "../../../../types/ints/Integer";
import { Value, ValueUnits } from "../../../ledger";
import { ITxBuildInput, cloneITxBuildInput } from "../txBuild";


export function keepRelevant(
    requestedOutputSet: ValueUnits | Value,
    initialUTxOSet: ITxBuildInput[],
    minimumLovelaceRequired: CanBeUInteger = 5_000_000,
): ITxBuildInput[]
{
    if( requestedOutputSet instanceof Value )
    {
        requestedOutputSet = requestedOutputSet.toUnits();
    }

    const reqOutputKeys = Object.keys( requestedOutputSet );

    const requestedLovelace = reqOutputKeys.includes("lovelace")
        ? forceBigUInt( BigInt( ( requestedOutputSet as any )["lovelace"] ) ) + forceBigUInt( minimumLovelaceRequired )
        : forceBigUInt( minimumLovelaceRequired );

    const multiAssetIns = initialUTxOSet.filter((input) =>
        input.utxo.resolved.value.toUnits()
            .filter(( asset ) => asset.unit !== "lovelace")
            .some(( asset ) => reqOutputKeys.includes( asset.unit ))
    );

    const totLovelaces = getTotLovelaces( multiAssetIns );

    const lovelaceIns = totLovelaces < requestedLovelace ?
        remainingLovelace(
            requestedLovelace - totLovelaces,
            // filter out initial utxos already included trough multi asset selection
            initialUTxOSet.filter(( initialUtxo ) => {

                const idStr = initialUtxo.utxo.utxoRef.id.toString();

                return !multiAssetIns.some(( selectedUtxo ) =>
                    selectedUtxo.utxo.utxoRef.id.toString() === idStr
                );
            })
        )
        : [];

        
    return lovelaceIns.concat( multiAssetIns )
        .map( cloneITxBuildInput );
}

function getTotLovelaces(multiAsset: ITxBuildInput[])
{
    return multiAsset.reduce(
        (sum, input) => sum + input.utxo.resolved.value.lovelaces, 
        BigInt(0)
    );
};

function remainingLovelace(quantity: bigint, initialUTxOSet: ITxBuildInput[]): ITxBuildInput[]
{
    const sortedUTxOs = initialUTxOSet.sort(
        (a, b) => parseInt(
            BigInt(
                a.utxo.resolved.value.lovelaces - b.utxo.resolved.value.lovelaces
            ).toString()
        )
    );

    const requestedOutputSet = {
        lovelace: quantity
    };

    const selection = selectValue(
        sortedUTxOs, requestedOutputSet,
    );

    return selection;
}

function enoughValueHasBeenSelected(
    selection: ITxBuildInput[], assets: { [ unit: string ]: bigint },
): boolean {
    return Object.keys( assets )
        .every((unit) => {

            return selection
                .filter(( input ) => {
                    return input.utxo.resolved.value.toUnits()
                        .some((a) => a.unit === unit );
                })
                .reduce(
                    (selectedQuantity, input) => {
                        const utxoQuantity = input.utxo.resolved.value.toUnits()
                            .reduce(
                                (quantity, a) => quantity + unit === a.unit ? BigInt( a.quantity ) : BigInt(0),
                                BigInt(0),
                            );

                        return selectedQuantity + utxoQuantity;
                    },
                    BigInt(0)
                ) < BigInt( assets[unit] ) === false;
        });
}

function selectValue(
    inputUTxO: ITxBuildInput[],
    outputSet: { [ unit: string ]: bigint },
    selection: ITxBuildInput[] = []
): ITxBuildInput[] {
    if (
        inputUTxO.length === 0 || 
        enoughValueHasBeenSelected(selection, outputSet)
    )
    {
        return selection;
    }

    if( canValueBeSelected( inputUTxO[0], outputSet ) )
    {
        return selectValue(
            inputUTxO.slice(1), outputSet,
            selection.concat( inputUTxO[0] )
        );
    }

    return selectValue(
        inputUTxO.slice(1),
        outputSet, selection,
    );
}

function canValueBeSelected(
    input: ITxBuildInput,
    assets: { [ unit: string ]: bigint }
): boolean
{
    return Object.keys( assets ).some(( unit ) => {
        return input.utxo.resolved.value.toUnits()
            .some(( asset ) => asset.unit === unit );
    });
}