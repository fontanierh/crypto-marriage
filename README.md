# crypto-marriage

crypto-marriage is a smart contract that implements the ERC721 interface and is built to represent marriages on the blockchain.

The metadata of the tokens evolve over time: creating a token requires passing a marriage date (`_referenceTIme`, unix timestamp), a list of URIs ( `_uris`, each pointing to JSON files in ERC721 Metadata JSON schema) and a list of milestones (`_dayOffsets`, expressed in number of days from the `_referenceTime`).

Every time a milestone is reached, the token's URI becomes the next element of the `_uris` array.

The contract is currently deployed on Polygon mainnet [here](https://polygonscan.com/address/0x45B807EeD14A85A31534238DB52985eC3555e01D).

You can view an example of a `CryptoMarriage` token I have minted [here](https://showtime.io/t/polygon/0x45b807eed14a85a31534238db52985ec3555e01d/0). The NFT is represented by a metal from the periodic table of elements and becomes a denser metal over time.
