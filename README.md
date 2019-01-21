# Demo application for DECODE

The demo application is an Elixir/Phoenix application that provides a rough
and ready UI to the server components developed for DECODE to allow for
testing and validation of the component behaviours.

## Requirements

The application is designed to run inside of a Docker/Compose environment, so
the only requirements are to install a recent version of Docker (which will
install Compose) as well.

## Running the application

Locally we use `make` to automate some of the system start/stop and maintenance commands.

To start the application running locally in development mode run:

```bash
$ make start
```

To open a shell inside the container run:

```bash
$ make shell
```

To build the distillery based distribution release run:

```bash
$ make dist
```

To push the release to Docker hub run:

```bash
$ make docker-push
```

## Configuration

The application looks for the following environment variables to control how
it is configured:

| Environment Variable | Description                                                    | Default Value         | Required/Optional |
| -------------------- | -------------------------------------------------------------- | --------------------- | ----------------- |
| SECRET_KEY_BASE      | Cryptographic string used to sign cookies (use phx.gen.secret) | -                     | Required          |
| DATASTORE_BASE_URL   | Base URL for the datastore component                           | http://localhost:8080 | Optional          |
| ENCODER_BASE_URL     | Base URL for the encoder component                             | http://localhost:8081 | Optional          |
| POLICYSTORE_BASE_URL | Base URL for the policy store component                        | http://localhost:8082 | Optional          |
| HOST                 | The host where the application is deployed                     | localhost             | Optional
       |
| PORT                 | The port on which we listen over HTTP                          |                       | Required          |
| TLS_PORT             | The port on which we listen over HTTPS (requires certs)        |                       | Optional          |
