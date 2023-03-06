import { Queque } from "./Queque";
import { DeferredPromise } from "./DeferredPromise";
import { BasePlutsError } from "../errors/BasePlutsError";

const defaultMaxWorkers = 4;

type EventCallBack  =( ...stuff: any[] ) => void;

// add Event Interface if we are in node
const Event = window?.Event ?? class Event {

    type: string
    timeStamp: number
    target: any
    currentTarget: any
    data: any

    constructor( type: string, target: any = undefined )
    {
        this.type = type;
        this.timeStamp = Date.now();
        this.target = this.currentTarget = target;
        this.data = undefined
    }
};

let __WorkerCtor__: typeof Worker | undefined = undefined;
async function getWorkerCtor(): Promise<typeof Worker>
{
    if( __WorkerCtor__ !== undefined ) return __WorkerCtor__;

    if( // isNode
        typeof process !== "undefined" &&
        process.versions != null &&
        process.versions.node != null
    )
    {
        __WorkerCtor__ = (await import("node:worker_threads")).Worker as any as (typeof Worker);

        __WorkerCtor__ = new Proxy(
            __WorkerCtor__,
            {
                construct( target, args )
                {
                    const self: any = new target(
                        // @ts-ignore A spread argument must either have a tuple type or be passed to a rest parameter.
                        ...args
                    );

                    // add browser API functions

                    // `EventTarget` interface
                    const EVENTS = Symbol("events");
                    Object.defineProperties(
                        self,
                        {
                            [EVENTS]: {
                                value: new Map(),
                                writable: false,
                                enumerable: false,
                                configurable: false
                            },
                            dispatchEvent: {
                                value: ( evt: Event ) => {
                                    const event = {
                                        ...evt,
                                        type: evt.type,
                                    };
                                    Object.setPrototypeOf( event, Event.prototype );

                                    const callbacks: EventCallBack[] = (self as any)[EVENTS].get(event.type);
                                    if (callbacks == null) return;
                                    callbacks.forEach(handler => {
                                        handler.call(self, event);
                                    });
                                },
                                writable: false,
                                enumerable: false,
                                configurable: false
                            },
                            addEventListener: {
                                value: ( type: string, fn: EventCallBack ) => {
                                    let events = (self as any)[EVENTS].get(type);
                                    if (!events) (self as any)[EVENTS].set(type, events = []);
                                    events.push(fn);
                                },
                                writable: false,
                                enumerable: false,
                                configurable: false
                            },
                            removeEventListener: {
                                value: ( type: string, fn: EventCallBack ) => {
                                    let events = (self as any)[EVENTS].get(type);
                                    if (events) {
                                        const index = events.indexOf(fn);
                                        if (index !== -1) events.splice(index, 1);
                                    }
                                },
                                writable: false,
                                enumerable: false,
                                configurable: false
                            },
                        }
                    );

                    // auto add listeners
                    self.on('message', (response =>
                        {
                            const event = new Event(response.type ?? 'message');
                            (event as any).data = response.data;
                            self.dispatchEvent(event);
                        }) as EventCallBack
                    );

                    self.on('error', (data =>
                        {
                            const error = new Error("error");
                            (error as any).data = data;
                            (error as any).type = "error"
                            self.dispatchEvent(error);
                        }) as EventCallBack
                    );

                    self.on('exit', (() =>
                        {
                            self.dispatchEvent(new Event('close'));
                        }) as EventCallBack
                    );

                    return self;
                },
                apply( fn, _thisArg, args )
                {
                    return Reflect.apply( fn, self, args )
                }
            }
        )

    }
    else {
        // window.Worker
        __WorkerCtor__ = Worker;
    }
    return  __WorkerCtor__;
}

export const enum WorkerState {
    idle = 0,
    busy = 1
};

export interface WorkerCallArgs {
    method: string,
    args: any[],
    transfers?: Transferable[]
}

export class WorkerPool
{
    run!: ( args: WorkerCallArgs ) => Promise<any>
    terminateAll!: () => Promise<void>

    constructor( workerFile: string | URL, options?: WorkerOptions, _maxWorkers?: number )
    {
        /**
         * min 2 workers; max 32
         * 
         * If you need more than 32 workers at the same time you might as well consider GPUs
         */
        const maxWorkers =
            typeof _maxWorkers === "number" && Number.isSafeInteger( _maxWorkers ) ?
                Math.max( 2, Math.min( 32, _maxWorkers ) ) :
                defaultMaxWorkers;

        const _workers: (Worker | undefined)[] = new Array( maxWorkers ).fill( 0 ).map( _=> (void 0) );
        const workerStates: WorkerState[] = new Array( maxWorkers ).fill( WorkerState.idle );

        /**
         * @param idx index assumed to be in bound `0 <= idx <= maxWorkers`
         * @returns worker at that index
         */
        async function _getWorker( idx: number ): Promise<Worker>
        {
            let myWorker = _workers[idx];
            if( myWorker === (void 0) )
            {
                myWorker = _workers[idx] = new (await getWorkerCtor())( workerFile, options );
            }
            return myWorker;
        }

        const tasks: Queque<{
            resolver: DeferredPromise<any>,
            args: WorkerCallArgs
        }> = new Queque();

        const self = this;

        Object.defineProperty(
            this, "terminateAll",
            {
                value: async () => {

                    let task;
                    while( !tasks.isEmpty() )
                    {
                        task = tasks.dequeue();
                        (task?.resolver.promise.state === "pending" &&
                        task?.resolver.reject("thread killed by worker pool 'terminateAll' method call"));
                        await task?.resolver.promise;
                    }
                    for(let i = 0; i < _workers.length; i++)
                    {
                        const w = _workers[i];
                        if(
                            w !== undefined &&
                            typeof w.terminate === "function"
                        )
                        {
                            w.terminate()
                        }
                        // !!! IMPORTANT !!!
                        // all exsisting workers, now terminated, MUST be deleted
                        // so that if ever the worker pool is reused it can generate new workers
                        delete _workers[i];
                        workerStates[i] = WorkerState.idle;
                    }
                },
                writable: false,
                enumerable: true,
                configurable: false
            }
        );

        async function _next( freeWorkerIdx: number ): Promise<any>
        {
            const task = tasks.dequeue();
            // there are no actual tasks anymore
            if( task === undefined )
            {
                workerStates[ freeWorkerIdx ] = WorkerState.idle;
                return;
            }
            
            const myWorker = await _getWorker( freeWorkerIdx );

            function resolve(response: any )
            {
                cleanListeners();

                // trigger next promise with this same worker
                _next( freeWorkerIdx );

                task?.resolver.resolve( response.data );
            }

            function reject( reason: any )
            {
                // mark as free thread before next task
                workerStates[ freeWorkerIdx ] = WorkerState.idle;

                cleanListeners();
                
                task?.resolver.reject( reason.data );
            }

            myWorker.addEventListener("message", resolve );
            myWorker.addEventListener("error", reject );
            myWorker.addEventListener("messageerror", reject );

            function cleanListeners(): void
            {
                myWorker.addEventListener("message", resolve );
                myWorker.addEventListener("error", reject );
                myWorker.addEventListener("messageerror", reject );
            }

            myWorker.postMessage(
                {
                    method: task.args.method,
                    args: task.args.args
                }
            );
        }

        Object.defineProperty(
            this, "run", {
                value: ( args: WorkerCallArgs ): Promise<any> => {

                    const resolver = new DeferredPromise();
                    tasks.enqueue({ resolver, args });

                    const freeWorkerIdx =  workerStates.indexOf( WorkerState.idle );
                    // everything buisy
                    if( freeWorkerIdx < 0 )
                    {
                        return resolver.promise; // next will be called at some thread end
                    }

                    workerStates[ freeWorkerIdx ] = WorkerState.busy;

                    // trigger Promise call
                    _next( freeWorkerIdx );

                    return resolver.promise;
                },
                writable: false,
                enumerable: true,
                configurable: false
            }
        )
    }
}