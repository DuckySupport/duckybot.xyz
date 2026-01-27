package.path = "/deps/?.lua;" .. package.path
local js = require("js")
local http = require("http")
local time = require("time")
local utils = require("utils")

local global = js.global
local document = global.document
local window = global.window

local redirect_uri
if global.window.location.hostname == "dev.duckybot.xyz" then
	redirect_uri = "https%3A%2F%2Fdev.duckybot.xyz%2Fcareers%2Fsupport"
else
	redirect_uri = "https%3A%2F%2Fduckybot.xyz%2Fcareers%2Fsupport"
end

coroutine.wrap(function()
    local cookie = utils.cookie("token")
    local user = utils.user()
    local parameters = utils.parameters()

    if user or parameters.access_token then
        if parameters.access_token then
            utils.loading("loading", "Loading...", "Validating your request...")

            local providedState = parameters.state
            local savedState = utils.cookie("state")
            utils.cookie("state", "delete")

            if not providedState or not savedState or providedState ~= savedState then
                utils.loading("fail", "State Mismatch", "There was an issue verifying your request. You will be redirected in a moment.")
                coroutine.wrap(function()
                    time.sleep(3000)
                    utils.redirect("careers/support")
                end)()
                return
            end
        end

        utils.loading("loading", "Redirecting...", "Redirecting you to the application...")
        window.location.href = "https://docs.google.com/forms/d/e/1FAIpQLSdg3SQ2-UYdkorBWcOyisYhMtJqoQZPKctN1LeVNNwcQnqFGA/viewform?usp=pp_url&entry.1011316122=" .. (cookie or parameters.access_token)
    else
        utils.loading("loading", "Redirecting...", "Redirecting you to Discord to identify you...")
        local state = utils.crypto()
        utils.cookie("state", state, 480, "None")
        utils.redirect("https://discord.com/oauth2/authorize/?client_id=1257389588910182411&response_type=token&redirect_uri=" .. redirect_uri .. "&scope=identify&state=" .. state)
    end
end)()