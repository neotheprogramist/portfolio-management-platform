# portfolio-management-platform

## Setup

Install dependencies:

```bash
npm install
```

Create `.env` (public values, used by client) and `.env.local` (secret values, used by API) files in root directory with templates below:

```
# .env file

PUBLIC_PROJECT_ID=
PUBLIC_METADATA_NAME=emeth
PUBLIC_METADATA_DESCRIPTION=emeth
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
