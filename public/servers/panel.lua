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

local function isPresent(o)
    return o ~= nil and o ~= js.null
end

local elements = {
    navbar = document:getElementById("navbar"),
    panel = {
        container = document:getElementById("panelContainer"),
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
            permissionIcon = document:getElementById("playerPanelPermissionIconContainer"),
            team = document:getElementById("playerPanelTeam"),
            content = document:getElementById("playerPanelContent"),
            close = document:getElementById("playerPanelClose"),
            punishments = {
                list = document:getElementById("punishmentsList"),
                status = document:getElementById("punishmentsStatus"),
                reload = document:getElementById("punishmentsReloadBtn")
            },
            bolo = {
                container = document:getElementById("boloContainer"),
                info = document:getElementById("boloInfo")
            }
        },
        boloManagement = {
            container = document:getElementById("boloManagementPanel"),
            list = document:getElementById("boloListContainer")
        },
        shift = document:getElementById("userShiftPanel")
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

        if isPresent(elements.navbar.addDucky) then
            elements.navbar.addDucky.classList:add("btn-primary")
        end

        local user = utils.user()
        if user then
            if isPresent(elements.navbar.profileImage) then
                elements.navbar.profileImage.src = user.avatar
            end
        end

        if isPresent(elements.navbar.profileButton) then
            elements.navbar.profileButton:addEventListener("click", function(event)
                if user then
                    if isPresent(elements.navbar.profileMenu) then
                        elements.navbar.profileMenu.classList:toggle("hidden")
                    end
                else
                    utils.redirect("login")
                end
            end)
        end

        if isPresent(elements.mobile.open) then
            elements.mobile.open:addEventListener("click", function()
                if isPresent(elements.mobile.menu) then
                    elements.mobile.menu.classList:toggle("active")
                    body.style.overflow = elements.mobile.menu.classList:contains("active") and "hidden" or ""
                end
            end)
        end

        if isPresent(elements.mobile.close) then
            elements.mobile.close:addEventListener("click", function()
                if isPresent(elements.mobile.menu) then
                    elements.mobile.menu.classList:toggle("active")
                    body.style.overflow = elements.mobile.menu.classList:contains("active") and "hidden" or ""
                end
            end)
        end
    end
end, "GET", "/partials/navbar.html", nil, nil, "text")

coroutine.wrap(function()
    utils.loading("loading", "Loading Panel...", "Fetching server data...")

    local cookie = utils.cookie("token")
    if cookie then
        if path[1] == "servers" and tonumber(path[2]) and path[3] == "panel" then
            local GuildID = path[2]
            local User = utils.user()
            if not User then
                utils.loading("fail", "API Error", "Failed to fetch user data. Please log in again.")
                return
            end
            local success, Guild = utils.guild(GuildID, cookie)
            if not success then
                utils.loading("fail", "API Error",
                    (Guild and Guild.message) or "Failed to load server data. Unknown error.")
                return
            end
            local ERLC
            local Shifts
            local PunishmentTypes
            local Bolos
            local punishmentsCache = {}
            local bolosCache = {}
            local lastRefresh = nil
            local canManageBolos = false
            local boloActionPending = {}
            
            local refresh -- Forward declaration

            local function renderBoloManagementPanel()
                if not canManageBolos then
                    if isPresent(elements.panel.boloManagement.container) then
                        elements.panel.boloManagement.container.classList:add("hidden")
                    end
                    return
                end

                if isPresent(elements.panel.boloManagement.container) then
                    elements.panel.boloManagement.container.classList:remove("hidden")
                end
                
                local list = elements.panel.boloManagement.list
                if not isPresent(list) then return end
                
                list.innerHTML = ""

                if not Bolos or #Bolos == 0 then
                    list.innerHTML = [[
                        <div class="mt-3 flex items-center">
                            <img src="/images/icons/Success.svg" class="w-[30px]">
                            <span class="text-sm pl-[5px]">No active BOLOs.</span>
                        </div>
                    ]]
                    return
                end

                for _, bolo in pairs(Bolos) do
                    local card = document:createElement("div")
                    card.className = "bg-white/5 p-5 rounded-xl border border-white/5"

                    local buttonsHTML
                    if not boloActionPending[bolo.id] then
                        buttonsHTML = string.format([[
                            <button id="bolo-accept-%s" class="btn-success flex-1 py-2.5 rounded-lg text-sm font-medium transition-transform hover:scale-[1.02] active:scale-[0.98]">Accept</button>
                            <button id="bolo-deny-%s" class="btn-fail flex-1 py-2.5 rounded-lg text-sm font-medium transition-transform hover:scale-[1.02] active:scale-[0.98]">Deny</button>
                        ]], bolo.id, bolo.id)
                    else
                        buttonsHTML = [[<button class="btn-glass w-full py-2.5 rounded-lg text-sm" disabled><img src="/images/icons/Loading.gif" class="w-5 h-5 mx-auto"></button>]]
                    end

                    card.innerHTML = string.format([[
                        <div class="flex justify-between items-start mb-4">
                            <div class="flex items-center gap-4">
                                <img src="%s" class="h-12 w-12 rounded-full object-cover ring-2 ring-white/10">
                                <div>
                                    <a href="%s" target="_blank" class="text-white font-bold text-lg hover:underline leading-tight block">%s</a>
                                    <div class="text-white/50 text-xs mt-1 flex items-center gap-1">
                                        by @%s
                                    </div>
                                </div>
                            </div>
                            <div class="text-xs font-medium text-white/40 bg-white/5 px-2.5 py-1 rounded-md whitespace-nowrap border border-white/5">%s</div>
                        </div>
                        
                        <div class="bg-black/30 rounded-lg p-3 border border-white/5 mb-5">
                            <div class="text-[10px] uppercase font-bold text-white/30 tracking-wider mb-1.5 flex items-center gap-1"> Reason</div>
                            <div class="text-sm text-white/90 leading-relaxed break-words">%s</div>
                        </div>

                        <div class="flex gap-3" id="bolo-actions-%s">
                            %s
                        </div>
                    ]], bolo.user.avatar, bolo.user.profile, bolo.user.displayName, bolo.moderator.username, utils.ago(bolo.created), bolo.reason, bolo.id, buttonsHTML)

                    list:appendChild(card)

                    if not boloActionPending[bolo.id] then
                        local acceptBtn = document:getElementById("bolo-accept-" .. bolo.id)
                        local denyBtn = document:getElementById("bolo-deny-" .. bolo.id)

                        local function handleBoloAction(actionType)
                            if boloActionPending[bolo.id] then return end
                            boloActionPending[bolo.id] = true

                            local actionContainer = document:getElementById("bolo-actions-" .. bolo.id)
                            if isPresent(actionContainer) then
                                actionContainer.innerHTML = [[<button class="btn-glass w-full py-2.5 rounded-lg text-sm" disabled><img src="/images/icons/Loading.gif" class="w-5 h-5 mx-auto"></button>]]
                            end

                            local endpoint
                            local method
                            if actionType == "accept" then
                                endpoint = "https://api.duckybot.xyz/guilds/" .. GuildID .. "/bolos/" .. bolo.user.id
                                method = "POST"
                            else -- deny
                                endpoint = "https://api.duckybot.xyz/guilds/" .. GuildID .. "/bolos/" .. bolo.user.id
                                method = "DELETE"
                            end

                            http.request(function (success, response)
                                boloActionPending[bolo.id] = nil
                                if success then
                                    utils.notify("BOLO actioned successfully.", "success")
                                    refresh()
                                else
                                    utils.notify(response and response.message or "Failed to action BOLO.", "fail")
                                    renderBoloManagementPanel()
                                end
                            end, method, endpoint, {["Token"] = cookie})
                        end
                        if isPresent(acceptBtn) then acceptBtn:addEventListener("click", function () handleBoloAction("accept") end) end
                        if isPresent(denyBtn) then denyBtn:addEventListener("click", function () handleBoloAction("deny") end) end
                    end
                end
            end


            local currentPanelPlayerID = nil
            local playerPanel = elements.panel.playerPanel
            
            playerPanel.tools = document:getElementById("playerPanelTools")
            playerPanel.punish = {
                 dialog = document:getElementById("punishPanelDialog"),
                 close = document:getElementById("punishPanelClose"),
                 form = document:getElementById("punishFormContent"),
                 error = document:getElementById("punishError"),
                 type = {
                     container = document:getElementById("punishTypeDropdownContainer"),
                     button = document:getElementById("punishTypeButton"),
                     text = document:getElementById("punishTypeButtonText"),
                     options = document:getElementById("punishTypeOptions")
                 },
                 reason = document:getElementById("punishReason"),
                 submit = document:getElementById("submitPunishBtn")
            }
            
            playerPanel.createBolo = {
                dialog = document:getElementById("boloPanelDialog"),
                close = document:getElementById("boloPanelClose"),
                reason = document:getElementById("boloPanelReason"),
                submit = document:getElementById("submitBoloBtn")
            }
            
            local function hidePlayerPanel()
                if isPresent(playerPanel.container) then playerPanel.container.classList:add("panel-hidden") end
                if isPresent(playerPanel.punish.dialog) then playerPanel.punish.dialog.classList:add("punish-hidden") end
                if playerPanel.createBolo and isPresent(playerPanel.createBolo.dialog) then
                    playerPanel.createBolo.dialog.classList:add("punish-hidden")
                end
            end

            local function renderBolo(bolo)
                local boloPanel = playerPanel.bolo
                local boloContainer = boloPanel.container
                local boloInfo = boloPanel.info

                if not isPresent(boloContainer) then return end

                if not bolo then
                    boloContainer.classList:add("hidden")
                    boloInfo.innerHTML = ""
                    return
                end

                boloContainer.classList:remove("hidden")
                boloInfo.innerHTML = string.format([[
                    <div class="bg-white/5 p-3 rounded-lg">
                        <div class="flex justify-between items-center">
                            <div class="text-xs text-white/50 flex items-center gap-1">
                                <img src="%s" class="h-4 w-4 rounded-full">
                                <span>@%s</span>
                            </div>
                            <span class="text-xs text-white/50">%s</span>
                        </div>
                        <div class="flex justify-between items-center gap-1 mt-2">
							<span class="font-semibold text-sm">BOLO</span>
                            <div class="flex items-center gap-2">
                                <button id="boloAcceptBtn" class="btn-glass rounded-full w-8 h-8 flex items-center justify-center" aria-label="Accept BOLO">
                                    <img src="/images/icons/Success.svg" class="w-5 h-5" />
                                </button>
                                <button id="boloDenyBtn" class="btn-glass rounded-full w-8 h-8 flex items-center justify-center" aria-label="Deny BOLO">
                                    <img src="/images/icons/Fail.svg" class="w-5 h-5" />
                                </button>
                            </div>
						</div>
                        <p class="text-sm text-white/80 mt-1">Reason: %s</p>
                    </div>
                ]], bolo.moderator.avatar, bolo.moderator.username, utils.ago(bolo.created), bolo.reason)

                local acceptBtn = document:getElementById("boloAcceptBtn")
                local denyBtn = document:getElementById("boloDenyBtn")

                if isPresent(acceptBtn) then
                    acceptBtn:addEventListener("click", function()
                        console.log(nil, "BOLO accepted for user " .. tostring(bolo.user.id))
                    end)
                end

                if isPresent(denyBtn) then
                    denyBtn:addEventListener("click", function()
                        console.log(nil, "BOLO denied for user " .. tostring(bolo.user.id))
                    end)
                end
            end

            local function loadBolo(playerID, force)
                coroutine.wrap(function()
                    if force then
                        bolosCache[playerID] = nil
                    end

                    if bolosCache[playerID] then
                        renderBolo(bolosCache[playerID])
                        return
                    end

                    local bolo = utils.bolos(GuildID, playerID)
                    if bolo and next(bolo) then
                        bolosCache[playerID] = bolo
                        renderBolo(bolo)
                    else
                        bolosCache[playerID] = nil
                        renderBolo(nil)
                    end
                end)()
            end

            local function renderPunishments(punishments)
                local list = playerPanel.punishments.list
                local status = playerPanel.punishments.status
                if not isPresent(list) or not isPresent(status) then return end
                
                list.innerHTML = ""
                status.innerHTML = ""

                if #punishments == 0 then
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
                        <div class="flex justify-between items-center">
                            <div class="text-xs text-white/50 flex items-center gap-1">
                                <img src="%s" class="h-4 w-4 rounded-full">
                                <span>@%s</span>
                            </div>
                            <span class="text-xs text-white/50">%s</span>
                        </div>
						<div class="flex justify-between items-center gap-1 mt-2">
							<span class="font-semibold text-sm pill-%s">%s</span>
						</div>
						<p class="text-sm text-white/80 mt-1">Reason: %s</p>
					]], punishment.moderator.avatar, punishment.moderator.username, utils.ago(punishment.timestamp),
                        punishment.type:lower(), punishment.type, punishment.reason)
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

                    if isPresent(punishmentsPanel.list) then punishmentsPanel.list.innerHTML = "" end
                    if isPresent(punishmentsPanel.status) then
                        punishmentsPanel.status.innerHTML = [[
                            <div class="flex items-center">
                                <img src="/images/icons/Loading.gif" class="w-[30px]" />
                                <span class="text-sm pl-[5px]">Loading punishments...</span>
                            </div>
                        ]]
                    end

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
                if isPresent(playerPanel.avatar) then playerPanel.avatar.src = playerData.avatar end
                if isPresent(playerPanel.displayName) then playerPanel.displayName.textContent = playerData.displayName end
                if isPresent(playerPanel.username) then
                    playerPanel.username.textContent = "@" .. playerData.name .. " (" ..
                                                       string.format("%.0f", playerData.ID) .. ")"
                end
                if isPresent(playerPanel.permission) then playerPanel.permission.textContent = playerData.Permission or "N/A" end
                
                local pIcon = "ph:user-bold"
                local pName = playerData.Permission
                if pName == "Server Moderator" then
                    pIcon = "ion:hammer"
                elseif pName == "Server Administrator" then
                    pIcon = "stash:shield-duotone"
                elseif pName == "Server Owner" or pName == "Server Co-Owner" then
                    pIcon = "ph:crown-fill"
                end
                if isPresent(playerPanel.permissionIcon) then
                    playerPanel.permissionIcon.innerHTML = string.format('<span class="iconify text-base" data-icon="%s"></span>', pIcon)
                end

                if isPresent(playerPanel.team) then playerPanel.team.textContent = playerData.Team or "N/A" end

                currentPanelPlayerID = playerData.ID
                loadPunishments(playerData.ID)
                loadBolo(playerData.ID)
                
                -- Tools Setup
                if isPresent(playerPanel.tools) then
                    playerPanel.tools.innerHTML = ""
                    if isPresent(playerPanel.punish.dialog) then playerPanel.punish.dialog.classList:add("punish-hidden") end

                    local tools = {
                        {
                            name = "Punish",
                            icon = "ion:hammer",
                            callback = function()
                                local punishPanel = playerPanel.punish
                                if not isPresent(punishPanel.dialog) then return end
                                
                                if not punishPanel.dialog.classList:contains("punish-hidden") then
                                    punishPanel.dialog.classList:add("punish-hidden")
                                    return
                                end
                                punishPanel.dialog.classList:remove("punish-hidden")
                                
                                punishPanel.reason.value = ""
                                punishPanel.type.text.textContent = "Select Type"
                                local selectedType = nil
                                
                                if PunishmentTypes and #PunishmentTypes > 0 then
                                    punishPanel.form.classList:remove("hidden")
                                    punishPanel.error.classList:add("hidden")
                                    
                                    punishPanel.type.options.innerHTML = ""
                                    for _, pType in ipairs(PunishmentTypes) do
                                        local btn = document:createElement("button")
                                        btn.className = "w-full text-left px-4 py-2 text-sm text-white hover:bg-white/10"
                                        btn.innerHTML = "<p>" .. pType:gsub("^%l", string.upper) .. "</p>"
                                        btn:addEventListener("click", function()
                                            selectedType = pType
                                            punishPanel.type.text.textContent = pType:gsub("^%l", string.upper)
                                            punishPanel.type.options.classList:add("hidden")
                                        end)
                                        punishPanel.type.options:appendChild(btn)
                                    end
                                    
                                    local newTypeBtn = punishPanel.type.button:cloneNode(true)
                                    punishPanel.type.button.parentNode:replaceChild(newTypeBtn, punishPanel.type.button)
                                    punishPanel.type.button = newTypeBtn
                                    punishPanel.type.text = newTypeBtn:querySelector("#punishTypeButtonText")
                                    
                                    punishPanel.type.button:addEventListener("click", function()
                                        punishPanel.type.options.classList:toggle("hidden")
                                    end)
                                    
                                    local newSubmitBtn = punishPanel.submit:cloneNode(true)
                                    punishPanel.submit.parentNode:replaceChild(newSubmitBtn, punishPanel.submit)
                                    punishPanel.submit = newSubmitBtn
                                    
                                    punishPanel.submit:addEventListener("click", function()
                                        if not selectedType then
                                            utils.notify("Please select a punishment type.", "fail")
                                            return
                                        end
                                        
                                        local reason = punishPanel.reason.value
                                        if not reason or reason == "" then
                                            utils.notify("Please enter a reason.", "fail")
                                            return
                                        end
                                        
                                        local btn = punishPanel.submit
                                        local originalText = btn.innerHTML
                                        btn.disabled = true
                                        btn.innerHTML = "<img src=\"/images/icons/Loading.gif\" class=\"w-5 h-5 mx-auto\" />"
                                        
                                        coroutine.wrap(function()
                                            local success, response = utils.punishmentCreate(GuildID, currentPanelPlayerID, selectedType, reason)
                                            
                                            btn.disabled = false
                                            btn.innerHTML = originalText
                                            
                                            if success then
                                                utils.notify("Successfully punished player.", "success")
                                                punishPanel.dialog.classList:add("punish-hidden")
                                                loadPunishments(currentPanelPlayerID, true)
                                            else
                                                utils.notify((response and response.message) or "Failed to punish player.", "fail")
                                            end
                                        end)()
                                    end)
                                    
                                else
                                    punishPanel.form.classList:add("hidden")
                                    punishPanel.error.classList:remove("hidden")
                                end
                            end
                        }
                    }

                    if canManageBolos then
                        table.insert(tools, {
                            name = "Create BOLO",
                            icon = "mdi:account-alert",
                            callback = function()
                                local createBoloPanel = playerPanel.createBolo
                                if not isPresent(createBoloPanel.dialog) then return end
                                
                                -- Close punish panel if open
                                if isPresent(playerPanel.punish.dialog) and not playerPanel.punish.dialog.classList:contains("punish-hidden") then
                                    playerPanel.punish.dialog.classList:add("punish-hidden")
                                end

                                if not createBoloPanel.dialog.classList:contains("punish-hidden") then
                                    createBoloPanel.dialog.classList:add("punish-hidden")
                                    return
                                end
                                createBoloPanel.dialog.classList:remove("punish-hidden")
                                createBoloPanel.reason.value = ""
                                
                                local newSubmitBtn = createBoloPanel.submit:cloneNode(true)
                                createBoloPanel.submit.parentNode:replaceChild(newSubmitBtn, createBoloPanel.submit)
                                createBoloPanel.submit = newSubmitBtn
                                
                                if isPresent(createBoloPanel.reason) then
                                    createBoloPanel.reason:addEventListener("keydown", function()
                                        local event = js.global.event
                                        if event.key == "Enter" and not event.shiftKey then
                                            event:preventDefault()
                                            createBoloPanel.submit:click()
                                        end
                                    end)
                                end
                                
                                createBoloPanel.submit:addEventListener("click", function()
                                    local reason = createBoloPanel.reason.value
                                    if not reason or reason == "" then
                                        utils.notify("Please enter a reason.", "fail")
                                        return
                                    end
                                    
                                    local btn = createBoloPanel.submit
                                    local originalText = btn.innerHTML
                                    btn.disabled = true
                                    btn.innerHTML = "<img src=\"/images/icons/Loading.gif\" class=\"w-5 h-5 mx-auto\" />"
                                    
                                    coroutine.wrap(function()
                                        local success, response = utils.boloCreate(GuildID, currentPanelPlayerID, reason)
                                        
                                        btn.disabled = false
                                        btn.innerHTML = originalText
                                        
                                        if success then
                                            utils.notify("BOLO created successfully.", "success")
                                            createBoloPanel.dialog.classList:add("punish-hidden")
                                            loadBolo(currentPanelPlayerID, true)
                                            refresh()
                                        else
                                            utils.notify((response and response.message) or "Failed to create BOLO.", "fail")
                                        end
                                    end)()
                                end)
                            end
                        })
                    end
                    
                    local toolsTitle = document:createElement("h3")
                    toolsTitle.className = "text-lg font-semibold"
                    toolsTitle.textContent = "Tools"
                    playerPanel.tools:appendChild(toolsTitle)
                    
                    local toolsGrid = document:createElement("div")
                    toolsGrid.className = "flex flex-col gap-2 mt-2"
                    playerPanel.tools:appendChild(toolsGrid)
                    
                    for _, tool in ipairs(tools) do
                        local btn = document:createElement("button")
                        btn.className = "btn-glass px-4 py-2.5 rounded-lg flex items-center gap-3 hover:bg-white/10 transition-colors w-full"
                        btn.innerHTML = string.format([[
                            <span class="iconify text-xl" data-icon="%s"></span>
                            <span class="text-sm font-medium">%s</span>
                        ]], tool.icon, tool.name)
                        btn:addEventListener("click", tool.callback)
                        toolsGrid:appendChild(btn)
                    end
                end

                if isPresent(playerPanel.container) then playerPanel.container.classList:remove("panel-hidden") end
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
                if isPresent(searchBtn) then
                    local originalIcon = searchBtn.innerHTML
                    searchBtn.innerHTML = "<img src=\"/images/icons/Loading.gif\" class=\"w-5 h-5\" />"
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
            end

            if isPresent(playerPanel.punishments.reload) then
                playerPanel.punishments.reload:addEventListener("click", function()
                    if currentPanelPlayerID then
                        loadPunishments(currentPanelPlayerID, true)
                    end
                end)
            end

            if isPresent(elements.panel.players.searchBtn) then
                elements.panel.players.searchBtn:addEventListener("click", searchPlayer)
            end
            
            if isPresent(elements.panel.players.search) then
                elements.panel.players.search:addEventListener("keydown", function()
                    local event = js.global.event
                    if event.key == "Enter" then
                        event:preventDefault()
                        searchPlayer()
                    end
                end)
            end

            if isPresent(playerPanel.close) then
                playerPanel.close:addEventListener("click", hidePlayerPanel)
            end
            
            if isPresent(playerPanel.container) then
                playerPanel.container:addEventListener("click", function()
                    local target = js.global.event and js.global.event.target
                    if target == playerPanel.container then
                        hidePlayerPanel()
                    end
                end)
            end

            if isPresent(playerPanel.punish.close) then
                playerPanel.punish.close:addEventListener("click", function()
                    playerPanel.punish.dialog.classList:add("punish-hidden")
                end)
            end

            if playerPanel.createBolo and isPresent(playerPanel.createBolo.close) then
                playerPanel.createBolo.close:addEventListener("click", function()
                    playerPanel.createBolo.dialog.classList:add("punish-hidden")
                end)
            end

            window:addEventListener("click", function()
                local event = js.global.event
                local punishPanel = elements.panel.playerPanel.punish
                if not punishPanel or not isPresent(punishPanel.type.container) then return end
                
                local container = punishPanel.type.container
                local options = punishPanel.type.options
                if event and container and not container:contains(event.target) then
                     if isPresent(options) then options.classList:add("hidden") end
                end
            end)

            if isPresent(playerPanel.punish.dialog) then
                playerPanel.punish.dialog:addEventListener("click", function()
                    local event = js.global.event
                    local punishPanel = elements.panel.playerPanel.punish
                    if not punishPanel or not isPresent(punishPanel.type.container) then return end
                    
                    local container = punishPanel.type.container
                    local options = punishPanel.type.options
                    if event and container and not container:contains(event.target) then
                        if isPresent(options) then options.classList:add("hidden") end
                    end
                end)
            end

            local shiftUpdateInterval = nil
            local lastUpdatedInterval = nil
            local lastShiftType = nil

            local function renderShiftPanel(refreshQuota)
                local shiftPanel = elements.panel.shift
                if not shiftPanel then
                    return
                end

                if shiftUpdateInterval then
                    time.clearInterval(shiftUpdateInterval)
                    shiftUpdateInterval = nil
                end

                if not Shifts then
                    shiftPanel.innerHTML = [[
                        <div class="flex items-center justify-center text-white text-center gap-2 w-full">
                            <img src="/images/icons/Fail.svg" class="w-5 h-5" />
                            <p>Shifts are not configured in this server.</p>
                        </div>
                    ]]
                    return
                end

                Shifts.me = Shifts.me or {}

                local quotaBarHTML = [[
                    <div class="mt-4">
                        <div class="flex items-center gap-2 text-sm">
                            <span class="font-medium text-white/70">Quota Progress</span>
                            <span class="opacity-50">•</span>
                            <span id="shiftQuotaText" class="text-white/50"></span>
                        </div>
                        <div class="w-full bg-white/10 rounded-full h-2.5 mt-2 relative">
                            <div id="shiftQuotaBar" class="bg-primary h-2.5 rounded-full" style="width: 0%; transition: width 0.5s ease-in-out;"></div>
                            <div id="shiftQuotaBarExtra" class="absolute top-0 left-0 bg-yellow-500 h-2.5 rounded-full" style="width: 0%; transition: width 0.5s ease-in-out;"></div>
                        </div>
                    </div>
                ]]

                local function updateQuotaDisplay(shiftType, currentShiftElapsed)
                    currentShiftElapsed = currentShiftElapsed or 0
                    local quotaText = document:getElementById("shiftQuotaText")
                    local quotaBar = document:getElementById("shiftQuotaBar")
                    local quotaBarExtra = document:getElementById("shiftQuotaBarExtra")

                    if not isPresent(quotaText) or not isPresent(quotaBar) or not isPresent(quotaBarExtra) then
                        return
                    end

                    local historicalTime = 0
                    if Shifts.me and Shifts.me.history then
                        for _, shift in ipairs(Shifts.me.history) do
                            if shift.type == shiftType and shift.elapsed and
                                (not Shifts.me.active or shift.id ~= Shifts.me.active.id) then
                                historicalTime = historicalTime + shift.elapsed
                            end
                        end
                    end

                    local quota = 0
                    for _, typeData in ipairs(Shifts.types) do
                        if typeData.name == shiftType then
                            quota = typeData.quota
                            break
                        end
                    end

                    local totalUserTime = historicalTime + currentShiftElapsed

                    local displayPercentage = 0
                    if quota and quota > 0 then
                        displayPercentage = (totalUserTime / quota) * 100
                    else
                        displayPercentage = 100
                    end

                    local barPercentage = math.min(100, displayPercentage)

                    local extraPercentage = 0
                    if displayPercentage > 100 then
                        extraPercentage = math.min(100, displayPercentage - 100)
                        if extraPercentage == 0 and displayPercentage > 0 then
                            extraPercentage = 100
                        end
                    end

                    if quota and quota > 0 then
                        quotaText.innerHTML = math.floor(displayPercentage) .. "% (" .. utils.readable(quota) .. " quota)"
                    else
                        quotaText.innerHTML = math.floor(displayPercentage) .. "% (No quota)"
                    end

                    quotaBar.style.width = tostring(barPercentage) .. "%"
                    quotaBarExtra.style.height = "50%"
                    quotaBarExtra.style.width = tostring(extraPercentage) .. "%"
                end

                if Shifts.me.active then
                    local active = Shifts.me.active
                    local totalPauseTime = active.pausetime
                    local onPause = active.paused
                    local activeTime = active.elapsed

                    local function formatTime(seconds)
                        local hours = math.floor(seconds / 3600)
                        local minutes = math.floor((seconds % 3600) / 60)
                        local secs = math.floor(seconds % 60)
                        return string.format("%02i:%02i:%02i", hours, minutes, secs)
                    end

                    shiftPanel.innerHTML = string.format([[
                        <div class="grid grid-cols-2 gap-4 text-center">
                            <div>
                                <p class="text-xs text-white/50 flex items-center justify-center gap-1"><span class="iconify" data-icon="tabler:clock-filled"></span> Time Active</p>
                                <p id="shiftActiveTime" class="text-lg font-semibold">%s</p>
                            </div>
                            <div>
                                <p class="text-xs text-white/50 flex items-center justify-center gap-1"><span class="iconify text-xl" data-icon="f7:pause-fill"></span> Pause Time</p>
                                <p id="shiftPauseTime" class="text-lg font-semibold">%s</p>
                            </div>
                        </div>
                        %s
                        <div class="flex gap-3 mt-4">
                            <button id="pauseShiftBtn" class="btn-glass w-full py-2.5 rounded-lg text-sm flex items-center justify-center gap-2">%s</button>
                            <button id="endShiftBtn" class="btn-fail w-full py-2.5 rounded-lg text-sm flex items-center justify-center gap-2"><span class="iconify text-xl" data-icon="gravity-ui:stop-fill"></span> End Shift</button>
                        </div>
                    ]], formatTime(activeTime), formatTime(totalPauseTime), quotaBarHTML,
                        onPause and "<span class=\"iconify text-xl\" data-icon=\"ion:play\"></span> Resume" or
                            "<span class=\"iconify text-xl\" data-icon=\"f7:pause-fill\"></span> Pause")

                    if refreshQuota then
                        time.after(50, function()
                            updateQuotaDisplay(active.type, active.elapsed)
                        end)
                    else
                        updateQuotaDisplay(active.type, active.elapsed)
                    end

                    shiftUpdateInterval = time.interval(1000, function()
                        if not Shifts or not Shifts.me or not Shifts.me.active then
                            return
                        end

                        if Shifts.me.active.paused then
                            Shifts.me.active.pausetime = time.now() - Shifts.me.active.paused.started
                        else
                            Shifts.me.active.elapsed = (time.now() - Shifts.me.active.started) -
                                                           Shifts.me.active.pausetime
                        end

                        local activeText = document:getElementById("shiftActiveTime")
                        local pauseText = document:getElementById("shiftPauseTime")
                        if isPresent(activeText) then activeText.textContent = formatTime(Shifts.me.active.elapsed) end
                        if isPresent(pauseText) then pauseText.textContent = formatTime(Shifts.me.active.pausetime) end
                        updateQuotaDisplay(Shifts.me.active.type, Shifts.me.active.elapsed)
                    end)

                    local pauseBtn = document:getElementById("pauseShiftBtn")
                    local endBtn = document:getElementById("endShiftBtn")

                    if isPresent(pauseBtn) then
                        pauseBtn:addEventListener("click", function()
                            pauseBtn.disabled = true
                            pauseBtn.innerHTML = "<img src=\"/images/icons/Loading.gif\" class=\"w-5 h-5\" />"
                            if isPresent(endBtn) then
                                endBtn.disabled = true
                                endBtn.innerHTML = "<img src=\"/images/icons/Loading.gif\" class=\"w-5 h-5\" />"
                            end

                            if onPause then
                                utils.shiftStart(GuildID, Shifts.me.active.type, cookie, function(success, response)
                                    if success then
                                        Shifts = response.data
                                        renderShiftPanel()
                                    else
                                        utils.notify((response and response.data and response.data.message) or "Failed to resume shift. Please try again.", "fail")
                                        renderShiftPanel()
                                    end
                                end)
                            else
                                utils.shiftPause(GuildID, cookie, function(success, response)
                                    if success then
                                        Shifts = response.data
                                        renderShiftPanel()
                                    else
                                        utils.notify((response and response.data and response.data.message) or
                                                        "Failed to pause shift. Please try again.", "fail")
                                        renderShiftPanel()
                                    end
                                end)
                            end
                        end)
                    end

                    if isPresent(endBtn) then
                        endBtn:addEventListener("click", function()
                            if isPresent(pauseBtn) then
                                pauseBtn.disabled = true
                                pauseBtn.innerHTML = "<img src=\"/images/icons/Loading.gif\" class=\"w-5 h-5\" />"
                            end
                            endBtn.disabled = true
                            endBtn.innerHTML = "<img src=\"/images/icons/Loading.gif\" class=\"w-5 h-5\" />"

                            lastShiftType = Shifts.me.active.type
                            utils.shiftEnd(GuildID, cookie, function(success, response)
                                if success then
                                    Shifts = response.data
                                    renderShiftPanel(true)
                                else
                                    utils.notify((response and response.data and response.data.message) or
                                                    "Failed to end shift. Please try again.", "fail")
                                    renderShiftPanel()
                                end
                            end)
                        end)
                    end
                else
                    if type(Shifts.types) == "table" and next(Shifts.types) then
                        local optionsHTML = ""
                        for _, shiftType in ipairs(Shifts.types) do
                            optionsHTML = optionsHTML .. string.format(
                                "<button type=\"button\" data-value=\"%s\" class=\"w-full text-left px-4 py-2 text-sm text-white hover:bg-white/10\"><p>%s</p></button>",
                                shiftType.name, shiftType.name)
                        end

                        shiftPanel.innerHTML = string.format([[
                                            <div class="space-y-4">
                                                <div>
                                                    <label for="shiftTypeDropdown" class="text-sm font-medium text-white/70">Shift Type</label>
                                                    <div id="customShiftDropdown" class="relative mt-1">
                                                        <button id="shiftTypeButton" type="button" class="w-full bg-white/5 border border-white/10 rounded-lg h-10 px-4 text-sm text-white text-left flex justify-between items-center">
                                                            <span id="shiftTypeButtonText"></span>
                                                            <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
                                                        </button>
                                                        <div id="shiftTypeOptions" class="hidden absolute z-10 w-full mt-1 bg-black/80 backdrop-blur-sm border border-white/10 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                                            %s
                                                        </div>
                                                    </div>
                                                </div>
                                                %s
                                            </div>
                                            <button id="startShiftBtn" class="btn-primary w-full py-2.5 rounded-lg text-sm flex items-center justify-center gap-2 mt-6"><span class="iconify text-xl" data-icon="ion:play"></span> Start Shift</button>
                                        ]], optionsHTML, quotaBarHTML)

                        local dropdownButton = document:getElementById("shiftTypeButton")
                        local dropdownButtonText = document:getElementById("shiftTypeButtonText")
                        local dropdownOptions = document:getElementById("shiftTypeOptions")
                        local customDropdown = document:getElementById("customShiftDropdown")

                        local selectedShiftType = Shifts.types[1].name

                        if lastShiftType and utils.find(Shifts.types, "name", lastShiftType) then
                            selectedShiftType = lastShiftType
                            lastShiftType = nil
                        end

                        if isPresent(dropdownButtonText) then dropdownButtonText.textContent = selectedShiftType end
                        local function onDropdownChange()
                            updateQuotaDisplay(selectedShiftType, 0)
                        end

                        if isPresent(dropdownButton) then
                            dropdownButton:addEventListener("click", function()
                                if isPresent(dropdownOptions) then dropdownOptions.classList:toggle("hidden") end
                            end)
                        end

                        window:addEventListener("click", function()
                            local event = js.global.event
                            if event and isPresent(customDropdown) and not customDropdown:contains(event.target) then
                                if isPresent(dropdownOptions) then dropdownOptions.classList:add("hidden") end
                            end
                        end)

                        if isPresent(dropdownOptions) then
                            local optionButtons = dropdownOptions:getElementsByTagName("button")
                            for i = 0, optionButtons.length - 1 do
                                optionButtons[i]:addEventListener("click", function()
                                    local event = js.global.event
                                    selectedShiftType = event.currentTarget:getAttribute("data-value")
                                    if isPresent(dropdownButtonText) then dropdownButtonText.textContent = selectedShiftType end
                                    dropdownOptions.classList:add("hidden")
                                    onDropdownChange()
                                end)
                            end
                        end

                        if refreshQuota then
							time.after(50, onDropdownChange)
                        else
                            onDropdownChange()
                        end

                        local startBtn = document:getElementById("startShiftBtn")
                        if isPresent(startBtn) then
                            startBtn:addEventListener("click", function()
                                startBtn.disabled = true
                                startBtn.innerHTML = "<img src=\"/images/icons/Loading.gif\" class=\"w-5 h-5 mx-auto\" />"

                                utils.shiftStart(GuildID, selectedShiftType, cookie, function(success, response)
                                    if success then
                                        Shifts = response.data
                                        renderShiftPanel(true)
                                    else
                                        utils.notify((response and response.message) or
                                                        "Failed to start shift. Please try again.", "fail")
                                        renderShiftPanel()
                                    end
                                end)
                            end)
                        end
                    else
                        shiftPanel.innerHTML = [[
                                            <div class="flex items-center justify-center text-white text-center gap-2 w-full">
                                                <img src="/images/icons/Fail.svg" class="w-5 h-5" />
                                                <p>You don't have access to any shift types.</p>
                                            </div>
                                        ]]
                    end
                end
            end

            refresh = function(initial)
                local status, err = pcall(function()
                    if lastUpdatedInterval then
                        time.clearInterval(lastUpdatedInterval)
                        lastUpdatedInterval = nil
                    end
                    if User then
                        if Guild then
                            local success, data = utils.panel(GuildID)

                            if not success then
                                if initial then
                                    return utils.loading("fail", "API Error", "Failed to fetch panel data.")
                                else
                                    return utils.notify("Failed to fetch panel data.", "fail")
                                end
                            end

                            ERLC = data.erlc
                            Shifts = data.shifts
                            PunishmentTypes = data.punishmentTypes
                            Bolos = data.bolos

                            if isPresent(Guild) and Guild.permissions then
                                if Guild.permissions.ERLC_ADMIN or Guild.permissions.ERLC_MANAGER or Guild.permissions.ADMIN then
                                    canManageBolos = true
                                else
                                    canManageBolos = false
                                end
                            else
                                canManageBolos = false
                            end

                            if isPresent(elements.panel.glance.server.icon) then elements.panel.glance.server.icon.src = Guild.icon end
                            if isPresent(elements.panel.glance.server.name) then elements.panel.glance.server.name.textContent = Guild.name end

                            if ERLC and isPresent(ERLC.server) then
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

                                    if currentPanelPlayerID and isPresent(playerPanel.container) and not playerPanel.container.classList:contains("panel-hidden") then
                                        local foundPlayer = nil
                                        for _, player in pairs(ERLC.players) do
                                            if player.ID == currentPanelPlayerID then
                                                foundPlayer = player
                                                break
                                            end
                                        end

                                        if foundPlayer then
                                            if isPresent(playerPanel.permission) then playerPanel.permission.textContent = foundPlayer.Permission or "N/A" end
                                            
                                            local pIcon = "ph:user-bold"
                                            local pName = foundPlayer.Permission
                                            if pName == "Server Moderator" then
                                                pIcon = "ion:hammer"
                                            elseif pName == "Server Administrator" then
                                                pIcon = "stash:shield-duotone"
                                            elseif pName == "Server Owner" or pName == "Server Co-Owner" then
                                                pIcon = "ph:crown-fill"
                                            end
                                            if isPresent(playerPanel.permissionIcon) then
                                                playerPanel.permissionIcon.innerHTML = string.format('<span class="iconify text-base" data-icon="%s"></span>', pIcon)
                                            end

                                            if isPresent(playerPanel.team) then playerPanel.team.textContent = foundPlayer.Team or "N/A" end
                                        end

                                        loadPunishments(currentPanelPlayerID, true)
                                        loadBolo(currentPanelPlayerID, true)
                                    end

                                    if isPresent(elements.panel.players.container) then
                                        elements.panel.players.container.innerHTML = ""

                                        if #ERLC.players > 0 then
                                            ERLC.online = true
                                            if isPresent(elements.panel.players.internal.container) then
                                                elements.panel.players.internal.container.classList:add("hidden")
                                            end
                                        else
                                            elements.panel.players.container.innerHTML = [[
                                                <div class="flex items-center justify-center text-white text-sm text-center gap-2 w-full">
                                                    <img src="/images/icons/Fail.svg" class="w-5 h-5" />
                                                    <p>There are no players in-game.</p>
                                                </div>
                                            ]]
                                        end
                                    end

                                    if isPresent(elements.panel.glance.statistics.players.label) then
                                        elements.panel.glance.statistics.players.label.textContent = #ERLC.players .. "/" .. ERLC.server.MaxPlayers
                                    end
                                    if isPresent(elements.panel.glance.statistics.players.tooltip) then
                                        elements.panel.glance.statistics.players.tooltip.textContent = #ERLC.players .. "/" .. ERLC.server.MaxPlayers .. " players are in-game"
                                    end

                                    if isPresent(elements.panel.glance.statistics.staff.label) then
                                        elements.panel.glance.statistics.staff.label.textContent = #ERLC.staff
                                    end
                                    if isPresent(elements.panel.glance.statistics.staff.tooltip) then
                                        elements.panel.glance.statistics.staff.tooltip.textContent = utils.plural(#ERLC.staff, "staff member is", "staff members are") .. " in-game"
                                    end

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

                                                local icon = ""
                                                local pName = player.Permission
                                                local pIcon = nil

                                                if pName == "Server Moderator" then
                                                    pIcon = "ion:hammer"
                                                elseif pName == "Server Administrator" then
                                                    pIcon = "stash:shield-duotone"
                                                elseif pName == "Server Owner" or pName == "Server Co-Owner" then
                                                    pIcon = "ph:crown-fill"
                                                end

                                                if pIcon then
                                                    icon = string.format([[
                                                        <div class="relative group inline-flex items-center ml-1.5">
                                                            <span class="opacity-50 mr-1.5">•</span>
                                                            <span class="iconify text-white" data-icon="%s"></span>
                                                            <div class="pointer-events-none absolute bottom-[125%%] inset-x-0 hidden group-hover:flex justify-center animate-fade-in quick z-50">
                                                                <div class="relative flex flex-col items-center">
                                                                    <div class="whitespace-nowrap rounded-full bg-[#0f0f0f] border border-white/10 px-3 py-1.5 text-xs text-white shadow-xl">
                                                                        %s
                                                                    </div>
                                                                    <span class="absolute left-1/2 top-full -translate-x-1/2 -mt-1 block h-2 w-2 rotate-45 bg-[#0f0f0f] border-r border-b border-white/10"></span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ]], pIcon, pName)
                                                end

                                                card.innerHTML = string.format([[
                                                    <div class="flex items-center gap-3 min-w-0">
                                                        <img src="%s" class="h-10 w-10 rounded-full">
                                                        <div class="min-w-0 leading-snug">
                                                            <div class="text-white font-semibold text-[14px] leading-tight flex items-center">%s%s</div>
                                                            <div class="text-white/50 text-[11px] truncate leading-tight">%s</div>
                                                        </div>
                                                    </div>
                                                    <div class="flex items-center gap-2 text-white/50">
                                                        <button class="btn-glass rounded-full w-8 h-8 flex items-center justify-center" aria-label="Panel">
                                                            <i class="iconify text-sm" data-icon="ion:hammer"></i>
                                                        </button>
                                                    </div>
                                                ]], player.roblox.avatar, player.roblox.displayName, icon, "@" .. player.roblox.name)

                                                if isPresent(elements.panel.players.container) then
                                                    elements.panel.players.container:appendChild(card)
                                                end

                                                local panelBtn = card:querySelector("[aria-label=\"Panel\"]")
                                                if isPresent(panelBtn) then
                                                    panelBtn:addEventListener("click",
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
                                                end

                                                if show then
                                                    card.classList:remove("hidden")
                                                    if initial then
                                                        time.sleep(50)
                                                    end
                                                end
                                            end
                                        end
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

                                    if isPresent(elements.panel.glance.statistics.modcalls.label) then
                                        elements.panel.glance.statistics.modcalls.label.textContent = #ERLC.pendingModcalls
                                    end
                                    if isPresent(elements.panel.glance.statistics.modcalls.tooltip) then
                                        elements.panel.glance.statistics.modcalls.tooltip.textContent = utils.plural(#ERLC.pendingModcalls, "pending modcall")
                                    end
                                end

                                if ERLC.kills then
                                    for _, kill in pairs(ERLC.kills) do
                                        if (time.now() - kill.Timestamp) < 200 then
                                            ERLC.status = ERLC.status + 1
                                        end
                                    end
                                end

                                if isPresent(elements.panel.glance.server.status.pill) then
                                    elements.panel.glance.server.status.pill.classList:remove("pill-green", "pill-yellow",
                                        "pill-red", "pill-gray")
                                end

                                if ERLC.online then
                                    if ERLC.status <= 2 then
                                        if isPresent(elements.panel.glance.server.status.pill) then
                                            elements.panel.glance.server.status.pill.classList:add("pill-green")
                                            elements.panel.glance.server.status.pill.innerHTML =
                                                "<span class=\"h-2 w-2 rounded-full\"></span> Calm"
                                        end
                                    elseif ERLC.status >= 3 and ERLC.status <= 5 then
                                        if isPresent(elements.panel.glance.server.status.pill) then
                                            elements.panel.glance.server.status.pill.classList:add("pill-yellow")
                                            elements.panel.glance.server.status.pill.innerHTML =
                                                "<span class=\"h-2 w-2 rounded-full\"></span> Busy"
                                        end
                                    elseif ERLC.status >= 6 then
                                        if isPresent(elements.panel.glance.server.status.pill) then
                                            elements.panel.glance.server.status.pill.classList:add("pill-red")
                                            elements.panel.glance.server.status.pill.innerHTML =
                                                "<span class=\"h-2 w-2 rounded-full\"></span> Chaotic"
                                        end
                                    end

                                    if lastUpdatedInterval then
                                        time.clearInterval(lastUpdatedInterval)
                                        lastUpdatedInterval = nil
                                    end

                                    lastRefresh = time.now()

                                    lastUpdatedInterval = time.interval(1000, function()
                                        if isPresent(elements.panel.glance.server.status.tooltip) then
                                            elements.panel.glance.server.status.tooltip.textContent = "Last updated " .. utils.ago(lastRefresh)
                                        end
                                    end)
                                else
                                    if isPresent(elements.panel.glance.server.status.pill) then
                                        elements.panel.glance.server.status.pill.classList:add("pill-gray")
                                        elements.panel.glance.server.status.pill.innerHTML =
                                            "<span class=\"h-2 w-2 rounded-full\"></span> Offline"
                                    end
                                    if isPresent(elements.panel.glance.server.status.tooltip) then
                                        elements.panel.glance.server.status.tooltip.textContent = "The ERLC private server is offline"
                                    end
                                end
                            else
                                if isPresent(elements.panel.glance.server.status.pill) then
                                    elements.panel.glance.server.status.pill.classList:add("pill-red")
                                    elements.panel.glance.server.status.pill.innerHTML =
                                        "<span class=\"h-2 w-2 rounded-full\"></span> Not Linked"
                                end
                                if isPresent(elements.panel.glance.server.status.tooltip) then
                                    elements.panel.glance.server.status.tooltip.textContent = "No ERLC private server data was found"
                                end

                                if isPresent(elements.panel.players.container) then
                                    elements.panel.players.container.innerHTML = [[
                                        <div class="flex items-center justify-center text-white text-center text-sm gap-2 w-full">
                                            <img src="/images/icons/Fail.svg" class="w-5 h-5" />
                                            <p>There is no ERLC private server linked.</p>
                                        </div>
                                    ]]
                                end
                            end

                            renderShiftPanel(initial)
                            renderBoloManagementPanel()

                            if initial then
                                utils.loading(nil, nil, nil)
                                if isPresent(elements.panel.container) then
                                    elements.panel.container.classList:remove("hidden")
                                end
                            end
                        end
                    end
                end)
                if not status then
                    console.error(nil, "Refresh error: " .. tostring(err))
                    if initial then
                        utils.loading("fail", "Panel Error", "An internal error occurred while loading the panel.")
                    end
                end
            end

            if isPresent(elements.panel.players.search) then
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
            end

            refresh(true)

            time.interval(30000, function()
                coroutine.wrap(function()
                    refresh()
                end)()
            end)
        else
            utils.redirect("servers")
        end
    else
        utils.redirect("login/?redirect=" .. location)
    end
end)()
