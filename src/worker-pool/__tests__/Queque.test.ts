import { Queque } from "../Queque"

describe("Queque", () => {

    describe("isEmpty", () => {

        test("new is empty", () => {
            expect( new Queque().isEmpty() ).toBe( true )
        });

    });

    describe("enqueque", () => {
        
        test("single enqueque", () => {
            const myQueque = new Queque;
            myQueque.enqueue( 1 );
            expect( myQueque.isEmpty() ).toBe( false )
        });

    });

    describe("dequeque", () => {

        const myQueque = new Queque;
        
        test("dequeque empty is undefined", () => {
            expect( myQueque.dequeue() ).toBe( undefined )
            expect( myQueque.isEmpty() ).toBe( true )
        });

        test("dequeque something", () => {
            expect( myQueque.isEmpty() ).toBe( true )
            myQueque.enqueue(1);
            expect( myQueque.dequeue() ).toBe( 1 );
            expect( myQueque.isEmpty() ).toBe( true )
        });

        test("dequeque something twice (FIFO)", () => {
            expect( myQueque.isEmpty() ).toBe( true )
            myQueque.enqueue(1);
            myQueque.enqueue(2);
            expect( myQueque.dequeue() ).toBe( 1 );
            expect( myQueque.isEmpty() ).toBe( false );
            expect( myQueque.dequeue() ).toBe( 2 );
            expect( myQueque.isEmpty() ).toBe( true );
        });

        test("dequeque nothing multiple times", () => {
            expect( myQueque.dequeue() ).toBe( undefined );
            expect( myQueque.dequeue() ).toBe( undefined );
            expect( myQueque.dequeue() ).toBe( undefined );
            expect( myQueque.dequeue() ).toBe( undefined );
            expect( myQueque.dequeue() ).toBe( undefined );
            expect( myQueque.dequeue() ).toBe( undefined );
            
            myQueque.enqueue("hello");
            expect( myQueque.dequeue() ).toBe( "hello" );

            expect( myQueque.dequeue() ).toBe( undefined );
            expect( myQueque.dequeue() ).toBe( undefined );
            expect( myQueque.dequeue() ).toBe( undefined );
            expect( myQueque.dequeue() ).toBe( undefined );
            expect( myQueque.isEmpty() ).toBe( true );
        })

    });

    describe("bulk", () => {

        test("bulk enqueque", () => {
            const myQueque = new Queque;
            const n = 24;
            for( let i = 0; i < n; i++ )
            {
                myQueque.enqueue(i);
            }
            for( let i = 0; i < n; i++ )
            {
                expect( myQueque.dequeue() ).toBe( i );
                i !== n - 1 && expect( myQueque.isEmpty() ).toBe( false );
            }
            expect( myQueque.isEmpty() ).toBe( true );
        });

        test("repeated (en|de)queque", () => {

            const myQueque = new Queque;

            let toEnqueque = 0;
            let expected = 0;
            for( let i = 0; i < 4; i++ )
            {
                for( let j = 0; j < 6; j++ )
                {
                    myQueque.enqueue( toEnqueque++ )
                }
                for( let j = 0; j < 4; j++ )
                {
                    expect( myQueque.dequeue() ).toBe( expected++ )
                    expect( myQueque.isEmpty() ).toBe( false )
                }
            }

            while( !myQueque.isEmpty() )
            {
                expect( myQueque.dequeue() ).not.toBe( undefined )
            }
        })
    })


})