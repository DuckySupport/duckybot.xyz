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
				icon = document:getElementById("serverGlanceIcon"),
				name = document:getElementById("serverGlanceName"),
				status = document:getElementById("serverGlanceStatusPill")
			},
			statistics = {
				players = {
					label = document:getElementById("serverGlancePlayerCount"),
					tooltip = document:getElementById("serverGlancePlayerTooltip")
				},
				staff = {
					label = document:getElementById("serverGlanceStaffCount"),
					tooltip = document:getElementById("serverGlanceStaffTooltip")
				},
				modcalls = {
					label = document:getElementById("serverGlanceModcallCount"),
					tooltip = document:getElementById("serverGlanceModcallTooltip")
				}
			}
		},
		players = {
			container = document:getElementById("serverPlayersContainer")
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

					if ERLC and ERLC.server then
						ERLC.status = 0

						if ERLC.players then
							print("cycling players")
							table.sort(ERLC.players, function(a, b)
								return a.Name < b.Name
							end)

							ERLC.staff = {}

							for _, player in pairs(ERLC.players) do
								if player.Permission ~= "Normal" then
									ERLC.status = ERLC.status - 1
									table.insert(ERLC.staff, player)
								end
							end

							if #ERLC.players > 0 then
								ERLC.online = true
							end

							elements.panel.glance.statistics.players.label.textContent = #ERLC.players .. "/" .. ERLC.server.MaxPlayers
							elements.panel.glance.statistics.players.tooltip.textContent = #ERLC.players .. "/" .. ERLC.server.MaxPlayers .. " players are in-game"

							elements.panel.glance.statistics.staff.label.textContent = #ERLC.staff
							elements.panel.glance.statistics.staff.tooltip.textContent = #ERLC.staff .. " staff members are in-game"

							coroutine.wrap(function()
								for _, player in pairs(ERLC.players) do
									if player.roblox then
										local card = document:createElement("div")
										card.className = "flex items-center justify-between bg-white/10 rounded-full pl-2 pr-4 py-1 animate-slide-right"

										card.innerHTML = string.format([[
											<div class="flex items-center gap-3 min-w-0">
												<img src="%s" class="h-10 w-10 rounded-full">
												<div class="min-w-0 leading-snug">
													<div class="text-white font-semibold text-[14px] truncate leading-tight">%s</div>
													<div class="text-white/50 text-[11px] truncate leading-tight">%s</div>
												</div>
											</div>
											<div class="flex items-center gap-2 text-white/50">
												<button class="btn-glass rounded-full w-8 h-8 flex items-center justify-center" aria-label="Tools">
													<i class="fa-solid fa-hammer text-sm"></i>
												</button>

												<button class="btn-glass rounded-full w-8 h-8 flex items-center justify-center" aria-label="Settings">
													<i class="fa-solid fa-gear text-sm"></i>
												</button>
											</div>
										]], player.roblox.avatar, player.roblox.displayName, "@" .. player.roblox.name)

										elements.panel.players.container:appendChild(card)
										time.sleep(50)
									end
								end
							end)()
						end

						if ERLC.modcalls then
							print("cycling calls")
							ERLC.pendingModcalls = {}

							for _, modcall in pairs(ERLC.modcalls) do
								if not modcall.Moderator then
									ERLC.status = ERLC.status + 2
									table.insert(ERLC.pendingModcalls, modcall)
								end
							end

							elements.panel.glance.statistics.modcalls.label.textContent = #ERLC.pendingModcalls
							elements.panel.glance.statistics.modcalls.tooltip.textContent = #ERLC.pendingModcalls .. " pending modcalls"
						end

						if ERLC.kills then
							print("cycling kills")
							for _, kill in pairs(ERLC.kills) do
								if (time.now() - kill.Timestamp) < 300 then
									ERLC.status = ERLC.status + 1
									print("    +1")
								end
							end
						end

						if ERLC.online then
							print("status", ERLC.status)
							if ERLC.status <= 2 then
								elements.panel.glance.server.status.classList:add("pill-green")
                        		elements.panel.glance.server.status.innerHTML = '<span class="h-2 w-2 rounded-full"></span> Calm'
							elseif ERLC.status >= 3 and ERLC.status <= 5 then
								elements.panel.glance.server.status.classList:add("pill-yellow")
                        		elements.panel.glance.server.status.innerHTML = '<span class="h-2 w-2 rounded-full"></span> Busy'
							elseif ERLC.status >= 6 then
								elements.panel.glance.server.status.classList:add("pill-red")
                        		elements.panel.glance.server.status.innerHTML = '<span class="h-2 w-2 rounded-full"></span> Chaotic'
							end
						end
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