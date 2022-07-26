# Offchain development timeline

estimated 6 to 7 months

- safe primitives datatypes implemetation to overcome javascript limits ( 1 week )
  - examples:
    - ```uint64``` for big integers to overcome 53-bit long javascript numbers
    - ```uint128``` and ```uint256``` for hashes 
    - ```Integer``` class to simulate ```haskell``` variable length integers
    - ```HexString```s
    - etc.

- Plutus-optimized JSON-CBOR interoperability ( 2-3 weeks )
  > **_note:_** "Plutus-optimized" stands for efficent support for plutus specifics tag codes
  - PlutusData implementation ( 1 week )
  - JSON serializable object implementation ( 1-2 weeks )

- protocol-level datatypes implementation ( 4-6 weeks )
  - including:
    - Addresses
    - Keys (private and public)
    - UTxOs
    - Assets and Values
    - algorithm representations (Linear Fee Cost-model etc.)

- transaction-related datatypes implementation ( 6 weeks - 2 months )
  - including:
    - Metadata
    - Witnesses
    - Certificates
    - Transactions
    - etc.

- ```BlockchainQueryier``` common interface ( 2 weeks )
  > a class to help executing query againist the Cardano blockchain
  - general ```BlockchainQueryier``` implementation
  - default implementations:
    - ```koiosQueryier```
    - ```ogmiosQueryier```
    - ```blockfrostQueryier```
    - etc.

- Smart Contract interaction ( 4-6 weeks )
  > **_NOTE:_** we are talking of the offchain code here, you'll need the smart contract bytecode to create instances, 
  > the bytecode is agnostic to the origin, could come from ```plu-ts/onchain``` or not
  - ```SmartContract``` class
  - ```MintingPolicy``` and ```StakeValidator``` classes