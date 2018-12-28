defmodule DecodeDemo.Encoder do
  use HTTPoison.Base

  @default_endpoint "http://localhost:8081"

  @prefix "/twirp/decode.iot.encoder.Encoder/"

  defp endpoint do
    System.get_env("ENCODER_BASE_URL") || @default_endpoint
  end

  def process_request_url(url) do
    endpoint() <> @prefix <> url
  end

  def process_request_headers(headers) do
    [{"content-type", "application/json"} | headers]
  end

  def process_request_body(body) do
    body
    |> Jason.encode!()
  end

  def process_response_body(body) do
    body
    |> Jason.decode!()
  end
end
