# portfolio-management-platform

## Setup

Install dependencies:

```bash
npm install
```

Create account on [Moralis](https://moralis.io/) and create new app. You will need to get `MORALIS_API_KEY` from there.

Create account on [Ngrok](https://ngrok.com/) and install it. You will need to run it and get https webhook url from there for `NGROK_WEBHOOK_URL` (you'll need to have it running during app operating).

```bash
npm run ngrok
```

Create `.env` (public values, used by client) and `.env.local` (secret values, used by API) files in root directory with templates below:

```
# .env file

PUBLIC_PROJECT_ID=
PUBLIC_METADATA_NAME=emeth
PUBLIC_METADATA_DESCRIPTION=emeth
PUBLIC_EMETH_CONTRACT_ADDRESS=0x075FbeB3802AfdCDe6DDEB1d807E4805ed719eca
PUBLIC_EMETH_CONTRACT_ADDRESS_SEPOLIA=0x9B2985a026c243A5133AaE819544ADb213366D7F

PW_BASE_URL=
```

```
# .env.local file

SURREALDB_URL=
SURREALDB_USER=
SURREALDB_PASS=
SURREALDB_NS=
SURREALDB_DB=

ACCESS_TOKEN_SECRET=
REFRESH_TOKEN_SECRET=

UNISWAP_SUBGRAPH_URL=https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3
UNIV3_OPTIMIST_SUBGRAPH_URL=https://api.thegraph.com/subgraphs/name/graph-buildersdao/univ3-optimism

# Generated from your personal account.
MORALIS_API_KEY=
# Every time you run `npm run ngrok`, it will generated new one url,
# so you need to update it here accordingly.
NGROK_WEBHOOK_URL=https://1111-11-111-11-111.ngrok-free.app/webhook/

PUBLIC_EMETH_CONTRACT_ADDRESS=
PUBLIC_EMETH_CONTRACT_ADDRESS_SEPOLIA=
```

Install `podman`:

```bash
brew install podman
```

Install `surreal`:

```bash
brew install surrealdb/tap/surreal
```

## Run

Firstly, you need to run database:

```bash
./scripts/database-setup.sh
```

After that, you need to provision db:

```bash
./scripts/database-provision.sh
```

Run ngrok tunnel (and copy https url to `.env.local` into `NGROK_WEBHOOK_URL`):

```bash
npm run ngrok
```

Last step is run the app (in dev mode):

```bash
npm run dev
```

## Build

Start database and provision it with data (as above) - `production` build require database up and running.

Build `production` mode:

```bash
npm run build
```

Serve `production` mode:

```bash
npm run serve
```

## Test

#### Setup

You need to install extra dependencies (like browser drivers):

```bash
npm run test.e2e.setup
```

#### Run

Run e2e scenarios:

```bash
npm run test.e2e
```

After every run you can serve report to your browser:

```bash
npm run test.e2e.report
```

## Wallet

#### Development setup

You need to install [`Metamask` extension](https://metamask.io/) in your browser adn create dev wallet account. After that, please add `Sepolia` from test networks.

As a next step, import created tokens from `fixtures/tokens.surql` file:

```bash
0x054E1324CF61fe915cca47C48625C07400F1B587 # GLM
0xD418937d10c9CeC9d20736b2701E506867fFD85f # USDC
0x9D16475f4d36dD8FC5fE41F74c9F44c7EcCd0709 # USDT
```

After that, please add second rich wallet account to your Metamask wallet (ask one of the core members to get private key).

As next step, you need to install [`SubWallet` extension](https://www.subwallet.app/) in your browser and create new wallet account.

Please select `EVM` network account, turn off all enabled networks and turn on `Sepolia` network.
