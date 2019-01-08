use Mix.Config

config :demo, DecodeDemoWeb.Endpoint,
  secret_key_base: System.get_env("SECRET_KEY_BASE"),
  url: [host: System.get_env("HOST"), port: {:system, "PORT"}],
  http: [:inet6, port: System.get_env("PORT") || 4000],
  https: [
    otp_app: :demo,
    port: System.get_env("TLS_PORT"),
    cipher_suite: :strong,
    keyfile: "priv/cert/decodedemo.dev+3-key.pem",
    certfile: "priv/cert/decodedemo.dev+3.pem"
  ]
