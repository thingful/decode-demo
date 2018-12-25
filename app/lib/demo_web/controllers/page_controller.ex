defmodule DecodeDemoWeb.PageController do
  use DecodeDemoWeb, :controller

  def index(conn, _params) do
    render(conn, "index.html", title: "Web Demo")
  end

  def policies(conn, _params) do
    render(conn, "policies.html", title: "Policy Store")
  end
end
