
function addNumericalSeparator(val: string): string
{
    let res = ''
    let i = val.length
    const start = val[0] === '-' ? 1 : 0
    for (; i >= start + 4; i -= 3) {
      res = `_${val.slice(i - 3, i)}${res}`
    }
    return `${val.slice(0, i)}${res}`
}

function E(sym: string, getMessage: (...stuff: any[]) => string, Base: { new (): Error } )
{
    return class Uint8ArrayError extends Base {
        constructor(...args: any[]) {
            super()
    
            Object.defineProperty(this, 'message', {
            value: getMessage.apply(this, args as any),
            writable: true,
            configurable: true
            })
    
            // Add the error code to the name to include it in the stack trace.
            this.name = `${this.name} [${sym}]`
            // Access the stack to generate the error message including the error code
            // from the name.
            this.stack // eslint-disable-line no-unused-expressions
        }
    
        get code () {
            return sym
        }
    
        set code (value) {
            Object.defineProperty(this, 'code', {
            configurable: true,
            enumerable: true,
            value,
            writable: true
            })
        }
    
        toString () {
            return `${this.name} [${sym}]: ${this.message}`
        }
    }
}
  
export const ERR_BUFFER_OUT_OF_BOUNDS = E('ERR_BUFFER_OUT_OF_BOUNDS',
    function (name) {
    if (name) {
        return `${name} is outside of buffer bounds`
    }

    return 'Attempt to access memory outside buffer bounds'
    }, RangeError
)

export const ERR_INVALID_ARG_TYPE = E('ERR_INVALID_ARG_TYPE',
    function (name, actual)
    {
        return `The "${name}" argument must be of type number. Received type ${typeof actual}`
    }, 
    TypeError
)

export const ERR_OUT_OF_RANGE = E('ERR_OUT_OF_RANGE',
    function (str, range, input) {
    let msg = `The value of "${str}" is out of range.`
    let received = input
    if (Number.isInteger(input) && Math.abs(input) > 2 ** 32) {
        received = addNumericalSeparator(String(input))
    } else if (typeof input === 'bigint') {
        received = String(input)
        if (input > (BigInt(1) << BigInt(32)) || input < -(BigInt(1) << BigInt(32))) 
        {
            received = addNumericalSeparator(received)
        }
        received += 'n'
    }
    msg += ` It must be ${range}. Received ${received}`
    return msg
    }, 
    RangeError
)