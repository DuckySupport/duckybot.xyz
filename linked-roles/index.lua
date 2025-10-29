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
	redirect_uri = "https%3A%2F%2Fdev.duckybot.xyz%2Flinked-roles"
else
	redirect_uri = "https%3A%2F%2Fduckybot.xyz%2Flinked-roles"
end

local parameters = utils.parameters()

local agreeButton = document:getElementById("agreeButton")
local denyButton = document:getElementById("denyButton")

if parameters.code and parameters.state then
	agreeButton.parentElement:remove()
	denyButton.parentElement:remove()

	local savedState = utils.cookie("state")
	utils.cookie("state", "delete")

	if not savedState or savedState ~= parameters.state then
		utils.loading("fail", "State Mismatch", "There was an issue verifying your request. Please try again.")
		return
	end

	utils.loading("loading", "Updating...", "Applying linked roles...")
	http.request(function(success, response)
		if success then
			utils.loading("success", "Success", "Your roles have been updated.")
		else
			utils.loading("fail", "API Error", (response and response.message) or "An unknown error occurred.")
		end
	end, "POST", "https://devapi.duckybot.xyz/linked-roles/update", {
		["Discord-Code"] = parameters.code,
	})
else
	agreeButton:addEventListener("click", function()
		agreeButton.parentElement:remove()
		denyButton.parentElement:remove()
		utils.loading("loading", "Redirecting...", "Redirecting you to Discord to link your roles.")
		local state = global.crypto:randomUUID()
		utils.cookie("state", state, 480)
		utils.redirect("https://discord.com/api/oauth2/authorize?client_id=1284586408945647727&redirect_uri=" .. redirect_uri .. "&response_type=code&scope=identify+role_connections.write&state=" .. state)
	end)

	denyButton:addEventListener("click", function()
		utils.redirect("/")
	end)
end