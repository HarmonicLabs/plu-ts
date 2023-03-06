
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
let master = undefined;

const workerListener/*: (this: Window, evt: MessageEvent<any>) => any*/ = async ( data, resolve, reject ) => {
    if( data.method === "sleep" )
    {
        await sleep( data.args[0] );
        resolve.call( master, "slept " + data.args[0] + " milliseconds" )
    }
    else
    {
        reject.call( master, "unknown method: " + data.method );
    }
}

if( // isNode
    typeof process !== "undefined" &&
    process.versions != null &&
    process.versions.node != null
)
{
    const { parentPort } = require('node:worker_threads');
    
    master = parentPort

    const postMessage = parentPort.postMessage.bind( master );

    const resolve = ( result ) => {
        postMessage({
            type: "message",
            data: result
        })
    }

    const reject = ( reason ) => {
        postMessage({
            type: "error",
            data: reason
        })
    }

    parentPort.on("message", (infos) => {
        workerListener(
            infos,
            resolve, 
            reject
        )
    });
}
else
{
    master = self;

    const postMessage = self.postMessage.bind( master );

    const resolve = ( result ) => {
        postMessage({
            type: "message",
            data: result
        })
    }

    const reject = ( reason ) => {
        postMessage({
            type: "error",
            data: reason
        })
    }

    self.addEventListener("message", evt => {
        workerListener(
            evt,
            resolve, 
            reject
        )
    });
}

function sleep(n)
{
    return new Promise(res => setTimeout(res,n));
}
// this is blocking
function _sleep(milliSeconds){
    var startTime = new Date().getTime();                    // get the current time
    while (new Date().getTime() < startTime + milliSeconds); // hog cpu until time's up
}