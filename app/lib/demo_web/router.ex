defmodule DecodeDemoWeb.Router do
  use DecodeDemoWeb, :router

  pipeline :browser do
    plug :accepts, ["html"]
    plug :fetch_session
    plug :fetch_flash
    plug :protect_from_forgery
    plug :put_secure_browser_headers
  end

  pipeline :api do
    plug :accepts, ["json"]
  end

  scope "/", DecodeDemoWeb do
    pipe_through :browser

    get "/", PageController, :index
    get "/policies", PageController, :policies
    get "/encoder", PageController, :encoder
    get "/datastore", PageController, :datastore
    get "/onboarding", PageController, :onboarding
  end

  # Other scopes may use custom stacks.
  # scope "/api", DecodeDemoWeb do
  #   pipe_through :api
  # end
end
