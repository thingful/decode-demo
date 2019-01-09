defmodule DecodeDemoWeb.DecodeChannel do
  use DecodeDemoWeb, :channel

  def join("decode:lobby", payload, socket) do
    if authorized?(payload) do
      {:ok, socket}
    else
      {:error, %{reason: "unauthorized"}}
    end
  end

  # Channels can be used in a request/response fashion
  # by sending replies to requests from the client
  def handle_in("ping", payload, socket) do
    {:reply, {:ok, payload}, socket}
  end

  # It is also common to receive messages from the client and
  # broadcast to everyone in the current topic (decode:lobby).
  def handle_in("shout", payload, socket) do
    broadcast(socket, "shout", payload)
    {:noreply, socket}
  end

  def handle_in("create_policy", payload, socket) do
    case DecodeDemo.Policystore.create_policy(payload) do
      {:ok, policy} ->
        push(socket, "new_policy", policy)

      {:error, msg} ->
        push(socket, "error", msg)
    end

    {:noreply, socket}
  end

  def handle_in("delete_policy", payload, socket) do
    case DecodeDemo.Policystore.delete_policy(payload) do
      {:ok, _} ->
        push(socket, "policy_deleted", %{})

      {:error, msg} ->
        push(socket, "error", msg)
    end

    {:noreply, socket}
  end

  def handle_in("load_policies", _payload, socket) do
    case DecodeDemo.Policystore.list_policies() do
      {:ok, policies} ->
        push(socket, "policies_loaded", policies)

      {:error, msg} ->
        push(socket, "error", msg)
    end

    {:noreply, socket}
  end

  def handle_in("create_stream", payload, socket) do
    case DecodeDemo.Encoder.create_stream(payload) do
      {:ok, stream} ->
        push(socket, "new_stream", stream)

      {:error, msg} ->
        push(socket, "error", msg)
    end

    {:noreply, socket}
  end

  def handle_in("delete_stream", payload, socket) do
    case DecodeDemo.Encoder.delete_stream(payload) do
      {:ok, _} ->
        push(socket, "stream_deleted", %{})

      {:error, msg} ->
        push(socket, "error", msg)
    end

    {:noreply, socket}
  end

  def handle_in("read_data", payload, socket) do
    case DecodeDemo.Datastore.read_data(payload) do
      {:ok, events} ->
        push(socket, "data", events)

      {:error, msg} ->
        push(socket, "error", msg)
    end

    {:noreply, socket}
  end

  # Add authorization logic here as required.
  defp authorized?(_payload) do
    true
  end
end
