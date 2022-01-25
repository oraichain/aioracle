# AI Oracle Server

### Mongodb

- n databases, each database name is the aioracle contract address

- 2 collections: Requests & Merkle Roots

    Requests: Each document is an object with a request ID & an array of reports
    Merkle Roots: Each document is an object with a merkle root & its leaves

