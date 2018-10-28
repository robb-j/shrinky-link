# Shrinky Link

An express/mongo programatic url shortener. A restful endpoint to create new links and an express route to redirect visitors.

## Features

* Programatically create short links using a simple API
* Authenticates with unique tokens
* Stores links / click count in a MongoDb

## Setup

An example **docker-compose.yml**
```yml
version: '3'

services:
  mongo:
    image: mongo:latest
    restart: unless-stopped
    ports:
      - 27017:27017
  
  shrinky:
    image: robbj/shrinky-link
    ports:
      - 3000:3000
    environment:
      MONGO_URI: mongodb://mongo:27017/links
      SHRINK_KEY: super_duper_secret
      HOME_URL: https://github.com/robb-j/shrinky-link/
      PUBLIC_URL: https://go.r0b.io
      INIT_TOKEN: my_first_secret_access_token
```

**Steps**

With the above docker-compose file just run:

```bash

# Start up mongo
docker-compose up -d mongo

# Wait a little bit for mongo to start up (~10s)

# Start up shrinky
docker-compose up -d mongo
```

**Adding Links**

To add a link perform a post to your container, e.g. from the host running the docker-compose stack.
Where `YOUR_TOKEN` is the value you set `INIT_TOKEN` to, this is your key for creating short links.

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"token":"YOUR_TOKEN", "url":"https://google.com"}' \
  http://localhost:3000
```

And you will get:

```json
{
  "id": "5b22fc81eb7d7f000f25cf86",
  "createdAt": "2018-06-14T23:38:41.984Z",
  "updatedAt": "2018-06-14T23:38:41.984Z",
  "short": "lEWxaq",
  "long": "https://google.com",
  "public": "https://go.r0b.io/lEWxaq",
  "uses": 0,
  "active": true,
  "creator_id": "5b22f62a67dad80010e54232"
}
```

And then to test it:

```bash
curl -i http://localhost:3000/lEWxaq
# HTTP/1.1 302 Found
# Location: https://google.com
```

## Environment Variables

| Name         | Usage |
| ------------ | ----- |
| `MONGO_URI`  | Where the mongo db is, [more info](https://docs.mongodb.com/manual/reference/connection-string/) |
| `SHRINK_KEY` | A salt for generating unique short links, [more info](https://github.com/ivanakimov/hashids.js#more-options)
| `HOME_URL`   | (optional) A backup url for if no path is passed, i.e. someone visits the root path |
| `PUBLIC_URL` | (optional) The public facing url of the shortener, `public` will be excluded from the output if this is not set |
| `INIT_TOKEN` | (optional) Set this to add a token to the database when the container starts up |

## Database inspection

Two mongo collections are used; `Token` and `Link`. Each document has an `active` value which you can manually set to false if you want disable the token or link.

> Note: logs are saved to /app/logs which is a volume by default, but you can map it out.

## Dev Commands

```bash

# Update version (updates npm version and dockerhub ci builds image)
# > You must run this with no git changes
npm version ... # --help
git push --tags

# Lint the web & test directories
npm run lint

# Run the unit tests
npm test -s

# Generate coverage
npm run coverage          # outputs to coverage/
npm run coverage-summary  # outputs to terminal

# Watch code with nodemon (restarts on file changes)
npm run watch

```

For more info on the setup see [robb-j/node-base](https://github.com/robb-j/node-base/).
