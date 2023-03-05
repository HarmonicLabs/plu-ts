
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
    const { parentPort } = require('node:worker_threads');
    
    master = parentPort;

    const postMessage = parentPort.postMessage.bind( master );

    function rejectNode( reason: any )
    {
        if( !(reason instanceof Event ) )
        {
            const data = reason;
            reason = new Event("error");
            reason.data = data;
        }

        postMessage( reason )
    }

    parentPort.on("message", ( data: TaskHandlerData) => {
        taskHandler(
            data,
            postMessage, 
            rejectNode
        )
    });
}
else
{
    master = self;

    const postMessage = self.postMessage.bind( master );

    function rejectWeb( reason: any )
    {
        if( !(reason instanceof Event ) )
        {
            const data = reason;
            reason = new Event("error");
            reason.data = data;
        }

        master.dispatchEvent( reason )
    }

    self.addEventListener("message", evt => {
        taskHandler(
            evt.data,
            postMessage,
            rejectWeb
        )
    });
}

async function taskHandler(
    data: TaskHandlerData, 
    resolve: ( v: any ) => void, 
    reject: ( reason: any ) => void
)
{
    if( data.method === "sleep" )
    {
    }
    else
    {
        console.log("hello tehre")
        reject( "unknown method: " + data.method );
    }
}
