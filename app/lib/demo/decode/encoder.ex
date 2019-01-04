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

  def create_stream(request) do
    case post("CreateStream", request) do
      {:ok, %HTTPoison.Response{status_code: 200, body: body}} ->
        {:ok, body}

      {:ok, %HTTPoison.Response{body: body}} ->
        {:error, body}

      {:error, error} ->
        {:error, error}
    end
  end

  def delete_stream(request) do
    case post("DeleteStream", request) do
      {:ok, %HTTPoison.Response{status_code: 200, body: body}} ->
        {:ok, body}

      {:ok, %HTTPoison.Response{body: body}} ->
        {:error, body}

      {:error, error} ->
        {:error, error}
    end
  end
end
