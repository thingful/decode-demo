use Mix.Config

config :demo, DecodeDemoWeb.Endpoint,
  secret_key_base: System.get_env("SECRET_KEY_BASE"),
  url: [host: System.get_env("HOST"), port: {:system, "PORT"}],
  https: [
    otp_app: :demo,
    port: 4001,
    cipher_suite: :strong,
    keyfile: "priv/cert/decodedemo.dev+3-key.pem",
    certfile: "priv/cert/decodedemo.dev+3.pem"
  ]
