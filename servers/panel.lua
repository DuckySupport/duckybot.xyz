package.path = "/deps/?.lua;" .. package.path
local js = require("js")
local http = require("http")
local time = require("time")
local utils = require("utils")

local global = js.global
local document = global.document
local body = document.body
local window = global.window
local location = window.location.pathname
local path = utils.split(location, "/")
table.remove(path, 1)
local console = global.console

local elements = {
	navbar = document:getElementById("navbar"),
	panel = {
		glance = {
			server = {
				icon = document:getElementById("serverIcon"),
				name = document:getElementById("serverName"),
				status = {
					pill = document:getElementById("serverStatusPill"),
					dot = document:getElementById("serverStatusDot")	
				}
			},
			statistics = {
				players = {
					label = document:getElementById("serverPlayerCount"),
					tooltip = document:getElementById("serverPlayerTooltip")
				},
				vehicles = {
					label = document:getElementById("serverVehicleCount"),
					tooltip = document:getElementById("serverVehicleTooltip")
				},
				modcalls = {
					label = document:getElementById("serverModcallTooltip"),
					tooltip = document:getElementById("serverModcallTooltip")
				}
			}
		}
	}
}

http.request(function(success, response)
	if success and response then
		elements.navbar.innerHTML = response
		elements.navbar = {
			profileButton = document:getElementById("profileButton"),
			profileImage = document:getElementById("profileImage"),
			profileMenu = document:getElementById("profileMenu"),
			addDucky = document:getElementById("addDucky"),
			links = document:getElementsByClassName("nav-link")
		}

		elements.mobile = {
			menu = document:getElementById("mobileMenu"),
			open = document:getElementById("mobileMenuOpen"),
			close = document:getElementById("mobileMenuClose")
		}

		elements.navbar.addDucky.classList:add("btn-primary")

		local user = utils.user()
		if user then
			elements.navbar.profileImage.src = user.avatar
		end

		elements.navbar.profileButton:addEventListener("click", function(event)
			if user then
    			elements.navbar.profileMenu.classList:toggle("hidden")
			else
				utils.redirect("login")
			end
		end)

		elements.mobile.open:addEventListener("click", function()
			elements.mobile.menu.classList:toggle("active")

			if elements.mobile.menu.classList:contains("active") then
				body.style.overflow = "hidden"
			else
				body.style.overflow = ""
			end
		end)

		elements.mobile.close:addEventListener("click", function()
			elements.mobile.menu.classList:toggle("active")

			if elements.mobile.menu.classList:contains("active") then
				body.style.overflow = "hidden"
			else
				body.style.overflow = ""
			end
		end)
	end
end, "GET", "/partials/navbar.html", nil, nil, "text")

coroutine.wrap(function()
	local cookie = utils.cookie("discord")
	if cookie then
		if path[1] == "servers" and tonumber(path[2]) and path[3] == "panel" then
			local GuildID = path[2]
			local User = utils.user()
			local Guild = utils.guild(GuildID, cookie)
			local ERLC = Guild and utils.erlc(GuildID)

			if User then
				if Guild then
					elements.panel.glance.server.icon.src = Guild.icon
					elements.panel.glance.server.name.textContent = Guild.name

					if ERLC and ERLC.players and #ERLC.players > 0 then
						-- continue here gotta push smth else
					end
				else
					utils.redirect("servers")
				end
			end
		else
			utils.redirect("servers")
		end
	else
		utils.redirect("login/?redirect=" .. location)
	end
end)()