ARG NODE_VERSION=21.6.2
ARG PUBLIC_PROJECT_ID
ARG PUBLIC_METADATA_NAME
ARG PUBLIC_METADATA_DESCRIPTION

################################################################################
# Use node image for base image for all stages.
FROM node:${NODE_VERSION}-alpine as base

################################################################################
# Create a stage for installing production dependencies.
FROM base as deps

# Install build-base.
RUN apk add build-base python3

# Set working directory.
WORKDIR /app

# Download dependencies as a separate step to take advantage of Docker's caching.
COPY ./package.json ./
RUN npm install

################################################################################
# Create a stage for building the application.
FROM deps as build

ENV PUBLIC_PROJECT_ID=$PUBLIC_PROJECT_ID
ENV PUBLIC_METADATA_NAME=$PUBLIC_METADATA_NAME
ENV PUBLIC_METADATA_DESCRIPTION=$PUBLIC_METADATA_DESCRIPTION

# Set working directory.
WORKDIR /app

# Copy the rest of the source files into the image.
COPY . .

# Run the build script.
RUN npm run build

################################################################################
# Create a new stage to run the application with minimal runtime dependencies
# where the necessary files are copied from the build stage.
FROM base as final

# Use production node environment by default.
ENV NODE_ENV production

# Run the application as a non-root user.
USER node

# Set working directory.
WORKDIR /app

# Copy the production dependencies from the deps stage and also
# the built application from the build stage into the image.
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/server ./server

# Run the application.
ENTRYPOINT [ "node", "server/entry.fastify" ]
