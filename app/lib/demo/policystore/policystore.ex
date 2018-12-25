defmodule DecodeDemo.Policystore do
  use HTTPoison.Base

  @default_endpoint "http://localhost:8082"

  @prefix "/twirp/decode.iot.policystore.PolicyStore/"

  defp endpoint do
    System.get_env("POLICYSTORE_ENDPOINT") || @default_endpoint
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

  def create_policy(request) do
    case post("CreateEntitlementPolicy", request) do
      {:ok, %HTTPoison.Response{status_code: 200, body: body}} ->
        {:ok, body}
      {:ok, %HTTPoison.Response{body: body}} ->
        {:error, body}
      {:error, error} ->
        {:error, error}
    end
  end

  def delete_policy(request) do
    case post("DeleteEntitlementPolicy", request) do
      {:ok, %HTTPoison.Response{status_code: 200, body: body}} ->
        {:ok, body}
      {:ok, %HTTPoison.Response{body: body}} ->
        {:error, body}
      {:error, error} ->
        {:error, error}
    end
  end

  def list_policies() do
    case post("ListEntitlementPolicies", %{}) do
      {:ok, %HTTPoison.Response{status_code: 200, body: body}} ->
        {:ok, body}
      {:ok, %HTTPoison.Response{body: body}} ->
        {:error, body}
      {:error, error} ->
        {:error, error}
    end
  end
end