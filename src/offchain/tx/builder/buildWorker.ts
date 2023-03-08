import { Machine } from '../../../onchain/CEK/Machine';
import { UPLCDecoder } from '../../../onchain/UPLC/UPLCDecoder';
import { UPLCTerm } from '../../../onchain/UPLC/UPLCTerm';
import { Application } from '../../../onchain/UPLC/UPLCTerms/Application';
import { UPLCConst } from '../../../onchain/UPLC/UPLCTerms/UPLCConst';
import { dataFromCbor } from '../../../types/Data';
import { costModelsFromCbor, isCostModelsV2, toCostModelV2 } from '../../ledger/CostModels';
import { ScriptType } from '../../script/Script';

/**
 * when the thread is terminated is possible (very likely if something is asyncronous) that something is still running
 * 
 * if that is the case firing an event on the main thread (things like `parentPort.on`)
 * will result in `TypeError: Illegal invocaiton` being called
 * 
 * that means that we are calling a method (`on`) of an object no loger exsistent (`parentPort` aka the main thread)
 * 
 * to prevent the object from being garbage colleted we store a copy of the pointer with `master`
 * 
 * @type {MessagePort}
 */
let master: MessagePort | (Window & typeof globalThis) = undefined as any;

type TaskHandlerData = {
    method: string,
    args: any[]
}

if( // isNode
    typeof process !== "undefined" &&
    process.versions != null &&
    process.versions.node != null
)
{
    (async () => {

        const { parentPort } = require('worker_threads');
        
        master = parentPort as any;

        const postMessage = (parentPort as any).postMessage.bind( master );

        const rejectNode = ( reason: any, transfers?: Transferable[]  ) =>
        {
            postMessage.call( master, {
                data: reason,
                type: "error"
            }, transfers)
        }

        const resolveNode = ( data: any, transfers?: Transferable[] ) => 
        {
            postMessage.call( master, {
                data: data,
                type: "message"
            });
        }

        (parentPort as any).on("message", ( data: TaskHandlerData ) => {
            taskHandler(
                data,
                resolveNode, 
                rejectNode
            )
        });
    })()
}
else
{
    master = self;

    const postMessage = ( data: any, transfers?: Transferable[] ) => 
        self.postMessage.bind( master )( data, "*", transfers );

    const rejectWeb = ( reason: any, transfers?: Transferable[]  ) =>
    {
        postMessage.call( master, {
            data: reason,
            type: "error"
        }, transfers)
    }

    const resolveWeb = ( data: any, transfers?: Transferable[] ) => 
    {
        postMessage.call( master,{
            data: data,
            type: "message"
        }, transfers );
    }

    self.addEventListener("message", evt => {
        taskHandler(
            evt.data,
            resolveWeb,
            rejectWeb
        )
    });
}

let cek: Machine = undefined as any;

type ScriptLike = {
    hash: string,
    bytes: Uint8Array
}

const scriptCache: { [x: string]: UPLCTerm } = {};

function getScriptLikeUplc( scriptLike: ScriptLike ): UPLCTerm
{
    let script: UPLCTerm;
    if(
        (script = scriptCache[scriptLike.hash]) === undefined
    )
    {
        script = UPLCDecoder.parse(
            scriptLike.bytes,
            "flat"
        ).body;
        Object.defineProperty(
            scriptCache, scriptLike.hash, {
                value: script,
                writable: false,
                enumerable: true,
                configurable: false
            }
        )
    }
    
    return script;
}

async function taskHandler(
    { method, args }: TaskHandlerData, 
    resolve: (message: any, transfer?: Transferable[] | undefined ) => void,
    reject: ( reason: any , transfer?: Transferable[] | undefined ) => void
)
{
    try {

        if( method === "prepareCEK" )
        {
            // already present
            if(cek instanceof Machine)
            {
                resolve( false );
                return;
            }

            if(
                args.length < 1 ||
                !( args[0] instanceof Uint8Array )
            )
            {
                reject("prepareCEK :: missing machine costs");
                return;
            }
            const costmodel = costModelsFromCbor( args[0] ).PlutusScriptV2;
            const isV2 = isCostModelsV2( costmodel );
            if( !isV2 )
            {
                reject("prepareCEK :: invalid machine costs");
                return;
            }
            const costs = toCostModelV2( costmodel );

            cek = new Machine(
                ScriptType.PlutusV2,
                costs
            )
            resolve( true )
            return;
        }
        else if( method === "evalScript" )
        {
            if( !(cek instanceof Machine) )
            {
                reject({
                    message: "evalScript :: missing CEK machine, make sure to call \"prepareCEK\" frist",
                    code: 0
                });
                return;
            }

            if( !Array.isArray(args) || args.length < 2 )
            {
                reject({
                    message: "evalScript :: required at least 2 arguments",
                    code: 1
                });
                return;
            }

            if(!(
                typeof args[0] === "object" &&
                args[0] !== null &&
                !Array.isArray( args[0] ) &&
                typeof args[0].hash === "string" &&
                args[0].bytes instanceof Uint8Array 
            ))
            {
                reject({
                    message: "evalScript :: first argument (scriptLike) was not a ScriptLike",
                    code: 2
                });
                return;
            }

            if(!(
                typeof args[1] === "object" &&
                args[1] !== null &&
                Array.isArray( args[1] ) &&
                args[1].every( thing => thing instanceof Uint8Array )
            ))
            {
                reject({
                    message: "evalScript :: second argument (scriptArgs) was not a Uint8Array[]",
                    code: 3
                });
                return;
            }

            const scriptLike: ScriptLike = args[0];
            const scriptArgs = args[1];

            let script: UPLCTerm = getScriptLikeUplc( scriptLike );

            scriptArgs.forEach( (arg: Uint8Array) => {
                script = new Application(
                    script,
                    UPLCConst.data( dataFromCbor( arg ) )
                )
            });

            const { result, budgetSpent, logs } = cek.eval( script );
            resolve({
                result,
                budgetSpent: budgetSpent.toJson(),
                logs
            });
            return;
        }
        else
        {
            reject({
                message: "unknown method: " + method,
                code: -1
            });
        }

    } catch (e) {
        reject( e )
    }
}
