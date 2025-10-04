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
                status = {
                    pill = document:getElementById("serverGlanceStatusPill"),
                    tooltip = document:getElementById("serverGlanceStatusTooltip")
                }
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
            container = document:getElementById("serverPlayersContainer"),
            search = document:getElementById("serverPlayersSearch"),
            searchBtn = document:getElementById("serverPlayerSearchBtn"),
            internal = {
                container = document:getElementById("serverPlayersInternal"),
                icon = document:getElementById("serverPlayersInternalIcon"),
                text = document:getElementById("serverPlayersInternalText")
            }
        },
        playerPanel = {
            container = document:getElementById("playerPanel"),
            dialog = document:getElementById("playerPanelDialog"),
            avatar = document:getElementById("playerPanelAvatar"),
            displayName = document:getElementById("playerPanelDisplayName"),
            username = document:getElementById("playerPanelUsername"),
            permission = document:getElementById("playerPanelPermission"),
            team = document:getElementById("playerPanelTeam"),
            content = document:getElementById("playerPanelContent"),
            close = document:getElementById("playerPanelClose"),
            punishments = {
                list = document:getElementById("punishmentsList"),
                status = document:getElementById("punishmentsStatus"),
                reload = document:getElementById("punishmentsReloadBtn")
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
            local ERLC = nil
            local lastRefresh = nil

            local punishmentsCache = {}
            local currentPanelPlayerID = nil
            local playerPanel = elements.panel.playerPanel
            local function hidePlayerPanel()
                playerPanel.container.classList:add("panel-hidden")
            end

            local function renderPunishments(punishments)
                console.log(nil, "rendering punishments")
                local list = playerPanel.punishments.list
                local status = playerPanel.punishments.status
                list.innerHTML = ""
                status.innerHTML = ""

                console.log(nil, #punishments)
                if #punishments == 0 then
                    console.log(nil, "clean record")
                    status.innerHTML = [[
						<div class="flex items-center">
							<img src="/images/icons/Success.svg" class="w-[30px]" />
							<span class="text-sm pl-[5px]">This player has a clean record.</span>
						</div>
					]]
                    return
                end

                for _, punishment in ipairs(punishments) do
                    local card = document:createElement("div")
                    card.className = "bg-white/5 p-3 rounded-lg"
                    card.innerHTML = string.format([[
						<div class="text-xs text-white/50 mt-2 flex items-center gap-1">
							<img src="%s" class="h-4 w-4 rounded-full">
							<span>@%s</span>
						</div>
						<div class="flex justify-between items-center gap-1">
							<span class="font-semibold text-sm pill-%s">%s</span>
							<span class="text-xs text-white/50">%s</span>
						</div>
						<p class="text-sm text-white/80 mt-1">Reason: %s</p>
					]], punishment.moderator.avatar, punishment.moderator.name, punishment.type:lower(), punishment.type,
                        utils.ago(punishment.timestamp), punishment.reason)
                    list:appendChild(card)
                end
            end

            local function loadPunishments(playerID, force)
                coroutine.wrap(function()
                    local punishmentsPanel = playerPanel.punishments
                    if force then
                        punishmentsCache[playerID] = nil
                    end

                    if punishmentsCache[playerID] then
                        renderPunishments(punishmentsCache[playerID])
                        return
                    end

                    punishmentsPanel.list.innerHTML = ""
                    punishmentsPanel.status.innerHTML = [[
						<div class="flex items-center">
							<img src="/images/icons/Loading.gif" class="w-[30px]" />
							<span class="text-sm pl-[5px]">Loading punishments...</span>
						</div>
					]]

                    local punishments = utils.punishments(GuildID, playerID)
                    if punishments then
                        punishmentsCache[playerID] = punishments
                        renderPunishments(punishments)
                    else
                        punishmentsCache[playerID] = {}
                        renderPunishments(punishmentsCache[playerID])
                    end
                end)()
            end

            local function openPlayerPanel(playerData)
                playerPanel.avatar.src = playerData.avatar
                playerPanel.displayName.textContent = playerData.displayName
                playerPanel.username.textContent = "@" .. playerData.name .. " (" ..
                                                       string.format("%.0f", playerData.ID) .. ")"
                playerPanel.permission.textContent = playerData.Permission or "N/A"
                playerPanel.team.textContent = playerData.Team or "N/A"

                currentPanelPlayerID = playerData.ID
                loadPunishments(playerData.ID)

                playerPanel.container.classList:remove("panel-hidden")
            end

            local function searchPlayer()
                local query = utils.input(elements.panel.players.search)
                if not query or query == "" then
                    return
                end

                if ERLC and ERLC.players then
                    local queryLower = query:lower()
                    for _, player in pairs(ERLC.players) do
                        if player.roblox and
                            (player.roblox.name:lower() == queryLower or player.roblox.displayName:lower() == queryLower or
                                tostring(player.ID) == query) then
                            openPlayerPanel({
                                avatar = player.roblox.avatar,
                                displayName = player.roblox.displayName,
                                name = player.roblox.name,
                                ID = player.ID,
                                Permission = player.Permission,
                                Team = player.Team
                            })
                            return
                        end
                    end
                end

                local searchBtn = elements.panel.players.searchBtn
                local originalIcon = searchBtn.innerHTML
                searchBtn.innerHTML = '<img src="/images/icons/Loading.gif" class="w-5 h-5" />'
                searchBtn.disabled = true

                coroutine.wrap(function()
                    local user = utils.queryUser(query)

                    searchBtn.innerHTML = originalIcon
                    searchBtn.disabled = false

                    if user then
                        openPlayerPanel({
                            avatar = user.avatar,
                            displayName = user.displayName,
                            name = user.name,
                            ID = user.id,
                            Permission = "Offline",
                            Team = "Offline"
                        })
                    else
                        utils.notify("Could not find a Roblox user with that name or ID.", "fail")
                    end
                end)()
            end
            elements.panel.players.searchBtn:addEventListener("click", searchPlayer)
            elements.panel.players.search:addEventListener("keydown", function()
                local event = js.global.event
                if event.key == "Enter" then
                    event:preventDefault()
                    searchPlayer()
                end
            end)

            playerPanel.close:addEventListener("click", hidePlayerPanel)
            playerPanel.container:addEventListener("click", function(e)
                local target = js.global.event and js.global.event.target
                if target == playerPanel.container then
                    hidePlayerPanel()
                end
            end)

            local function refresh(initial)
                ERLC = Guild and utils.erlc(GuildID)

                if User then
                    if Guild then
                        elements.panel.glance.server.icon.src = Guild.icon
                        elements.panel.glance.server.name.textContent = Guild.name

                        if ERLC and ERLC.server then
                            ERLC.status = 0

                            if ERLC.players then
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

                                elements.panel.players.container.innerHTML = ""

                                if #ERLC.players > 0 then
                                    ERLC.online = true
                                    elements.panel.players.internal.container.classList:add("hidden")
                                else
                                    elements.panel.players.internal.container.classList:remove("hidden")
                                    elements.panel.players.internal.icon.src = "/images/icons/Fail.svg"
                                    elements.panel.players.internal.text.textContent = "There are no players in-game."
                                end

                                elements.panel.glance.statistics.players.label.textContent = #ERLC.players .. "/" ..
                                                                                                 ERLC.server.MaxPlayers
                                elements.panel.glance.statistics.players.tooltip.textContent = #ERLC.players .. "/" ..
                                                                                                   ERLC.server
                                                                                                       .MaxPlayers ..
                                                                                                   " players are in-game"

                                elements.panel.glance.statistics.staff.label.textContent = #ERLC.staff
                                elements.panel.glance.statistics.staff.tooltip.textContent = utils.plural(#ERLC.staff,
                                    "staff member is", "staff members are") .. " in-game"

                                coroutine.wrap(function()
                                    for _, player in pairs(ERLC.players) do
                                        if player.roblox then
                                            local query = utils.input(elements.panel.players.search, true)
                                            local show = (query and
                                                             (player.roblox.displayName:lower():find(query) or
                                                                 player.roblox.name:lower():find(query))) or not query
                                            local card = document:createElement("div")
                                            card.className =
                                                "player-card flex items-center justify-between bg-white/10 rounded-full pl-2 pr-4 py-1 hidden" ..
                                                    ((initial and " animate-slide-right") or "")
                                            card:setAttribute("data-name", player.roblox.name)
                                            card:setAttribute("data-displayName", player.roblox.displayName)
                                            card:setAttribute("data-id", player.ID)

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
														<i class="iconify text-sm" data-icon="ion:hammer"></i>
													</button>

													<button class="btn-glass rounded-full w-8 h-8 flex items-center justify-center" aria-label="Settings">
														<i class="iconify text-sm" data-icon="mdi:gear"></i>
													</button>
												</div>
											]], player.roblox.avatar, player.roblox.displayName, "@" .. player.roblox.name)

                                            elements.panel.players.container:appendChild(card)

                                            card:querySelector('[aria-label="Tools"]'):addEventListener("click",
                                                function()
                                                    openPlayerPanel({
                                                        avatar = player.roblox.avatar,
                                                        displayName = player.roblox.displayName,
                                                        name = player.roblox.name,
                                                        ID = player.ID,
                                                        Permission = player.Permission,
                                                        Team = player.Team
                                                    })
                                                end)

                                            if show then
                                                card.classList:remove("hidden")
                                                if initial then
                                                    time.sleep(50)
                                                end
                                            end
                                        end
                                    end
                                    playerPanel.punishments.reload:addEventListener("click", function()
                                        if currentPanelPlayerID then
                                            loadPunishments(currentPanelPlayerID, true)
                                        end
                                    end)
                                end)()
                            end

                            if ERLC.modcalls then
                                ERLC.pendingModcalls = {}

                                for _, modcall in pairs(ERLC.modcalls) do
                                    if not modcall.Moderator and time.now() - modcall.Timestamp < 600 then
                                        ERLC.status = ERLC.status + 2
                                        table.insert(ERLC.pendingModcalls, modcall)
                                    end
                                end

                                elements.panel.glance.statistics.modcalls.label.textContent = #ERLC.pendingModcalls
                                elements.panel.glance.statistics.modcalls.tooltip.textContent = utils.plural(
                                    #ERLC.pendingModcalls, "pending modcall")
                            end

                            if ERLC.kills then
                                for _, kill in pairs(ERLC.kills) do
                                    if (time.now() - kill.Timestamp) < 200 then
                                        ERLC.status = ERLC.status + 1
                                    end
                                end
                            end

                            elements.panel.glance.server.status.pill.classList:remove("pill-green", "pill-yellow",
                                "pill-red", "pill-gray")

                            if ERLC.online then
                                if ERLC.status <= 2 then
                                    elements.panel.glance.server.status.pill.classList:add("pill-green")
                                    elements.panel.glance.server.status.pill.innerHTML =
                                        '<span class="h-2 w-2 rounded-full"></span> Calm'
                                elseif ERLC.status >= 3 and ERLC.status <= 5 then
                                    elements.panel.glance.server.status.pill.classList:add("pill-yellow")
                                    elements.panel.glance.server.status.pill.innerHTML =
                                        '<span class="h-2 w-2 rounded-full"></span> Busy'
                                elseif ERLC.status >= 6 then
                                    elements.panel.glance.server.status.pill.classList:add("pill-red")
                                    elements.panel.glance.server.status.pill.innerHTML =
                                        '<span class="h-2 w-2 rounded-full"></span> Chaotic'
                                end
                            else
                                elements.panel.glance.server.status.pill.classList:add("pill-gray")
                                elements.panel.glance.server.status.pill.innerHTML =
                                    '<span class="h-2 w-2 rounded-full"></span> Offline'
                            end
                        end

                        lastRefresh = time.now()
                    else
                        utils.redirect("servers")
                    end
                end
            end

            elements.panel.players.search:addEventListener("input", function()
                local query = utils.input(elements.panel.players.search, true)
                local cards = elements.panel.players.container:getElementsByClassName("player-card")

                for _, card in pairs(cards) do
                    local name = card:getAttribute("data-name"):lower()
                    local displayName = card:getAttribute("data-displayName"):lower()
                    local id = card:getAttribute("data-id")

                    if (not query) or (name:find(query) or displayName:find(query) or (id and id:find(query))) then
                        card.classList:remove("hidden")
                    else
                        card.classList:add("hidden")
                    end
                end
            end)

            refresh(true)

            time.interval(30000, function()
                coroutine.wrap(function()
                    refresh()
                end)()
            end)

            time.interval(1000, function()
                if lastRefresh then
                    elements.panel.glance.server.status.tooltip.textContent = "Last updated " .. utils.ago(lastRefresh)
                else
                    elements.panel.glance.server.status.tooltip.textContent = "This server is offline"
                end
            end)
        else
            utils.redirect("servers")
        end
    else
        utils.redirect("login/?redirect=" .. location)
    end
end)()