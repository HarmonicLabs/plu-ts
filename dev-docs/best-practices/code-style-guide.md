# Style guide

in this file you find all the conventions adopted in the repository in order to keep the code clean and readable.

## Table of contents
---

- [Indentation](#Indentation)
- [To new-line or not to new-line](#new_line)
- [Comments](#comments)
    - [for documentation](#docs_comments)
    - [as explanations](#explain_comments)
- [Parenthesis](#parenthesis)
- [Control flow](#control_flow)
    - [conditions](#control_flow_conditions)
    - [if](#control_flow_if)
    - [while](#control_flow_while)

----------------------------------- todo ----------------------------------- 

    - [for](#control_flow_for)
    - [switch](#control_flow_switch)
- [functions](#funcitons)
- [classes](#classes)
    - [extends]
    - [interfaces]
        - [implements]
    - [fields]
    - [methods]
- [keep it clean](#clean)
    - [extract functions](#extract_functions)

<a name ="Indentation"></a>

## Indentation
---

we use to indent some code generally when is part of a block (e.g. ```if( true ) {} // <- '{}' here is a block```) or when a _long_ list of parameters are passed to a function call (same for function declarations)

there are of course other cases in which intentation needs to be used and those will be made clear either by examples or explicit documentation.

in order to indent we use **4 spaces**

>in visual studio you can set the Indentation like so by the settings in the bottom-right ( Select indentation > Indent using spaces > 4 ) this way you can use the ```Tab``` key and indent correctly

### examples

```ts
if( true )
{
    console.log("I'm inside a block of code")
}
```

```ts
function lotsOfArgs(
    num : number,
    name: string,
    timestamp: number,
    options?: {
        someOpt: boolean // also indented
    }
)
{
    // inside a block we indent too
}

lotsOfArgs(
    2,
    "foo",
    Date.now,
    options: {
        someOpt: false
    }
);
```

<a name ="new_line"></a>

## To new-line or not to new-line
---

generally we want to new line for every instruction also keeping an empty line if the two instruction are not strictly related, like so:

```ts
let someString: string = "hello world";

let counter: number = 0;
while( counter < someString.length )
{
    counter++;
}
```

the same applies for long lines of code as na example
```ts
throw new BasePluTsError("this is a very long and detailed explanation of what appened and why this error raised; this kind of stuff is really usefull but all written in one line and we don like it!");
```

in these cases try to get creative; as an example you could do something like:
```ts
throw new BasePluTsError(
    // remember to indent
    "this is a very long and detailed explanation " +
    "of what appened and why this error raised; " +
    "this kind of stuff is really usefull " +
    "but all written in one line and we don like it!"
);
```

<a name ="comments"></a>

## Comments
---

comments are a really useful tool to help other developers that are working on the project understand what are the reasons behind a certain piece of code;

for single line comments we generally prefer to add them in the line right abobe the comment is intended to be:
```ts
// here we print hello world
console.log("hello world");
```

the same applies for multi lines comments
```ts
/*
you definitely don't need to add this much explanation
for one line;

often multiline comments are uset to express high-level ideas on more complex pieces of code
*/
console.log("hello world");

```

<a name="docs_comments"></a>

### for documentation

please always consider adding some comments in order to document a new funciton or class or even variables sometimes;

in order to add some comment as documentation please use a multiline comment like so:
```ts
/**
 * THIS IS A COMMENT AS DOCUMENTATION
 * 
 * here is an explanation on what you're using
 */
```

and it should go right above the documented part:
```ts
/**
 * Point
 * 
 * a point is used to keep track of apair of coordinates
 */
class Point
{
    private _x: number;
    private _y: number;

    get x(): numebr { return this._x }
    get y(): numebr { return this._y }

    constructor( x: number, y: number )
    {
        this._x = x;
        this._y = y;
    }
}

/**
 * uses the coordinates of the points to make a ```Pair``` of ```number```s out of it
 * 
 * e.g.:
 * ```ts
 * pointToNumPair( new Point( 1, 2 ) ) // == new Pair( 1, 2 )
 * ```
 */
function pointToNumPair( p: Point ): Pair< number, number >
{
    new Pair( p.x, p.y );
}
```

<a name="explain_comments"></a>

### as explanation

even if we specified to use single lines comments right above the line these are intended for, it is often usefull to use single line comments to explain an entire process;

in these cases please **allign** the comments on the side:
```ts
function forceValidator( someScript: UPLCScript ): Validator
{
    if( canBeValidator( someScript ) )               // if the script takes 3 "Data" instances as input
    {                                                //
        return Validator.formScript( someScript )    // construct a new "Validator" instance with it
    }                                                //
    else                                             // if not
    {                                                //
        throw new BasePlutsError(                    // it is not possible to get a validator from the script
            "the provided script is not a validator" // throw an error since it cannot be forced
        );                                           //
    }
}
```

<a name="parenthesis"></a>

## Parenthesis
---

as you know parenthesis are used in order to access/pass values around.

when inside the parenthesis goes any kind of expression be sure to separate the expression form the parenthesis.

In other words, use a space between the parenthesis and the expression.

> **_NOTE_**: by "parenthesis" are meant all of them:
> - _round brackets_ (```()```)
> - _square brackets_ (```[]```)
> - _curly brackets_ (```{}```)

> **_NOTE_**: use spaces also if between the parenthesis you need commas
> e.g.: ```func( 1, 2, 3 )```

example:
```ts

const numArr: number[] = [ 1, 2, 3 ]
//                        ^  ^  ^ ^ 
// "[ 1"        is hour first space after the square brackets
// ", 2, 3"     here we have two spaces due to the commas
// "3 ]"        an other space due to the closing 

numArr[ 0 ]; // ok
numArr[0];   // please don't

function abs( n: number ) // also in function declaraitons
{
    return n < 0 ? -n : n;
}

abs( -2 ); // ok
abs(-2);   // please don't

```

<a name="control_flow"></a>

## Control flow
---

ofthen contrlo flow statements do require [Parenthesis](#parenthesis); so be sure to keep in mind also that part of the documentation

<a name="control_flow_conditions"></a>

### conditions

when using control flow statements it is not rare to work with condions, which often do use logical operators.

here is a quick guide on ho to use them

#### all _ands_ (```&&```) or all _ors_ (```||```)

in these cases it is often usefull to separate the conditions in multiple lines
```ts
chekProp1( obj ) &&
chekProp2( obj ) &&
chekProp3( obj )
```

```ts
chekProp1( obj ) ||
chekProp2( obj ) ||
chekProp3( obj )
```

#### mixed _ands_ (```&&```) and _ors_ (```||```)

in these cases please try to reconduce sub expression to the "all _ands_ (```&&```) or all _ors_ (```||```)" above; separing sub expression with parentesis

```ts
( 
    chekProp1( obj ) || chekProp2( obj )
) &&
chekProp3( obj )

// due to the precedence of && over || the foolowing works the same
// however please wrap the sub expression in parenthesis anyway for clarity
chekProp1( obj ) || chekProp2( obj ) && chekProp3( obj )
```

```ts
( 
    chekProp1( obj ) && chekProp2( obj )
) ||
chekProp3( obj )

// the parenthesis above are crucial
// otherwhise the expression
chekProp1( obj ) && chekProp2( obj ) || chekProp3( obj )

// is evaluated as
chekProp1( obj ) && (
    chekProp2( obj ) || chekProp3( obj 
)
```

<a name="control_flow_if"></a>

### if

the [```if...else``` statement](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/if...else) executes a statement if a specified condition is [truthy](https://developer.mozilla.org/en-US/docs/Glossary/Truthy). If the condition is [falsy](https://developer.mozilla.org/en-US/docs/Glossary/Falsy), another statement in the optional else clause will be executed.

so we use the if statement like so
```ts
const truthy = true;

if( truthy )
{
    // execute some code
}
```

we se that the ```if``` keyword is folowed by [Parenthesis](#parenthesis) and then a block of code ( see [Indentation](#Indentation) )

when the code to execute is composed by one single expression the block of code can be omitted;

we encourage to do so if the expression fits in one line ad it is still readable:

```ts
let cip30;

// this is ok
if( window !== undefined ) cip30 = window.cardano ?? {};

// this is even better
if( window !== undefined )
    cip30 = window.cardano ?? {};

// maybe takes to much space; better break it down
if( window !== undefined )
{
    cip30 = 
        window.cardano === undefined ?
            {} :
            window.cardano;
}
```

<a name="control_flow_while"></a>

### while

The [while statement](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/while) creates a loop that executes a specified statement as long as the test condition evaluates to true. The condition is evaluated before executing the statement.

ideally is similar to an [if statement](#control_flow_if) that executes untill the expression evalueates to ```true```; so the rules are similar.

the only difference is that omitting blocks is not accepted;

```ts
let counter = 0;

// ok
while( counter < 10 )
{
    counter++;
}

counter = 0;

// correct js syntax but we don't do that here
while( counter < 10 ) counter++;
```