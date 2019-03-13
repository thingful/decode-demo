defmodule DecodeDemoWeb.PageController do
  use DecodeDemoWeb, :controller

  def index(conn, _params) do
    render(conn, "index.html", title: "Web Demo")
  end

  def policies(conn, _params) do
    render(conn, "policies.html", title: "Policy Store")
  end

  def encoder(conn, _params) do
    render(conn, "encoder.html", title: "Encoder")
  end

  def datastore(conn, _params) do
    render(conn, "datastore.html", title: "Datastore")
  end

  def onboarding(conn, _params) do
    render(conn, "onboarding.html", title: "Onboarding")
  end

  def coconut(conn, _params) do
    render(conn, "coconut.html", title: "Coconut")
  end
end
