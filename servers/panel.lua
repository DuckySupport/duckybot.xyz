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
    utils.loading("loading", "Loading Panel...", "Fetching server data...")

    local cookie = utils.cookie("discord")
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
            local punishmentsCache = {}
            local bolosCache = {}
            local lastRefresh = nil

            local currentPanelPlayerID = nil
            local playerPanel = elements.panel.playerPanel
            local function hidePlayerPanel()
                playerPanel.container.classList:add("panel-hidden")
            end

            local function renderBolo(bolo)
                local boloPanel = playerPanel.bolo
                local boloContainer = boloPanel.container
                local boloInfo = boloPanel.info

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

                acceptBtn:addEventListener("click", function()
                    console.log(nil, "BOLO accepted for user " .. tostring(bolo.user.id))
                end)

                denyBtn:addEventListener("click", function()
                    console.log(nil, "BOLO denied for user " .. tostring(bolo.user.id))
                end)
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
                loadBolo(playerData.ID)

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

                    if not quotaText or not quotaBar or not quotaBarExtra then
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
                        extraPercentage = displayPercentage % 100
                        if extraPercentage == 0 and displayPercentage > 0 then
                            extraPercentage = 100
                        end
                    end

                    if quota and quota > 0 then
                        quotaText.innerHTML = math.floor(displayPercentage) .. "% (" .. utils.readable(quota, true) ..
                                                  " quota, " .. utils.readable(totalUserTime, true) .. " complete)"
                    else
                        quotaText.innerHTML = math.floor(displayPercentage) .. "% (No quota)"
                    end

                    quotaBar.style.width = tostring(barPercentage) .. "%"
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
                                <p class="text-xs text-white/50 flex items-center justify-center gap-1"><span class="iconify" data-icon="tabler:clock-hour-4"></span> Time Active</p>
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

                        document:getElementById("shiftActiveTime").textContent = formatTime(Shifts.me.active.elapsed)
                        document:getElementById("shiftPauseTime").textContent = formatTime(Shifts.me.active.pausetime)
                        updateQuotaDisplay(Shifts.me.active.type, Shifts.me.active.elapsed)
                    end)

                    document:getElementById("pauseShiftBtn"):addEventListener("click", function()
                        local pauseBtn = document:getElementById("pauseShiftBtn")
                        local endBtn = document:getElementById("endShiftBtn")
                        pauseBtn.disabled = true
                        pauseBtn.innerHTML = "<img src=\"/images/icons/Loading.gif\" class=\"w-5 h-5\" />"
                        endBtn.disabled = true
                        endBtn.innerHTML = "<img src=\"/images/icons/Loading.gif\" class=\"w-5 h-5\" />"

                        if onPause then
                            utils.startShift(GuildID, Shifts.me.active.type, cookie, function(success, response)
                                if success then
                                    Shifts = response.data
                                    renderShiftPanel()
                                else
                                    utils.notify((response and response.data and response.data.message) or
                                                     "Failed to resume shift. Please try again.", "fail")
                                    renderShiftPanel()
                                end
                            end)
                        else
                            utils.pauseShift(GuildID, cookie, function(success, response)
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

                    document:getElementById("endShiftBtn"):addEventListener("click", function()
                        local pauseBtn = document:getElementById("pauseShiftBtn")
                        local endBtn = document:getElementById("endShiftBtn")
                        pauseBtn.disabled = true
                        pauseBtn.innerHTML = "<img src=\"/images/icons/Loading.gif\" class=\"w-5 h-5\" />"
                        endBtn.disabled = true
                        endBtn.innerHTML = "<img src=\"/images/icons/Loading.gif\" class=\"w-5 h-5\" />"

                        lastShiftType = Shifts.me.active.type
                        utils.endShift(GuildID, cookie, function(success, response)
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
                        dropdownButtonText.textContent = selectedShiftType
                        local function onDropdownChange()
                            updateQuotaDisplay(selectedShiftType, 0)
                        end

                        dropdownButton:addEventListener("click", function()
                            dropdownOptions.classList:toggle("hidden")
                        end)

                        window:addEventListener("click", function()
                            local event = js.global.event
                            if event and not customDropdown:contains(event.target) then
                                dropdownOptions.classList:add("hidden")
                            end
                        end)

                        local optionButtons = dropdownOptions:getElementsByTagName("button")
                        for i = 0, optionButtons.length - 1 do
                            optionButtons[i]:addEventListener("click", function()
                                local event = js.global.event
                                selectedShiftType = event.currentTarget:getAttribute("data-value")
                                dropdownButtonText.textContent = selectedShiftType
                                dropdownOptions.classList:add("hidden")
                                onDropdownChange()
                            end)
                        end

                        if refreshQuota then
                            js.global:setTimeout(onDropdownChange, 50)
                        else
                            onDropdownChange()
                        end

                        document:getElementById("startShiftBtn"):addEventListener("click", function()
                            local btn = document:getElementById("startShiftBtn")
                            btn.disabled = true
                            btn.innerHTML = "<img src=\"/images/icons/Loading.gif\" class=\"w-5 h-5 mx-auto\" />"

                            console.log(nil, selectedShiftType)
                            utils.startShift(GuildID, selectedShiftType, cookie, function(success, response)
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

            local function refresh(initial)
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
                                    elements.panel.players.container.innerHTML = [[
                                        <div class="flex items-center justify-center text-white text-center gap-2 w-full">
                                            <img src="/images/icons/Fail.svg" class="w-5 h-5" />
                                            <p>There are no players in-game.</p>
                                        </div>
                                    ]]
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

                                            card:querySelector("[aria-label=\"Tools\"]"):addEventListener("click",
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
                                        "<span class=\"h-2 w-2 rounded-full\"></span> Calm"
                                elseif ERLC.status >= 3 and ERLC.status <= 5 then
                                    elements.panel.glance.server.status.pill.classList:add("pill-yellow")
                                    elements.panel.glance.server.status.pill.innerHTML =
                                        "<span class=\"h-2 w-2 rounded-full\"></span> Busy"
                                elseif ERLC.status >= 6 then
                                    elements.panel.glance.server.status.pill.classList:add("pill-red")
                                    elements.panel.glance.server.status.pill.innerHTML =
                                        "<span class=\"h-2 w-2 rounded-full\"></span> Chaotic"
                                end

                                if lastUpdatedInterval then
                                    time.clearInterval(lastUpdatedInterval)
                                    lastUpdatedInterval = nil
                                end

                                lastRefresh = time.now()

                                lastUpdatedInterval = time.interval(1000, function()
                                    elements.panel.glance.server.status.tooltip.textContent = "Last updated " ..
                                                                                                  utils.ago(lastRefresh)
                                end)
                            else
                                elements.panel.glance.server.status.pill.classList:add("pill-gray")
                                elements.panel.glance.server.status.pill.innerHTML =
                                    "<span class=\"h-2 w-2 rounded-full\"></span> Offline"
                                elements.panel.glance.server.status.tooltip.textContent =
                                    "The ERLC private server is offline"
                            end
                        else
                            elements.panel.glance.server.status.pill.classList:add("pill-red")
                            elements.panel.glance.server.status.pill.innerHTML =
                                "<span class=\"h-2 w-2 rounded-full\"></span> Not Linked"
                            elements.panel.glance.server.status.tooltip.textContent =
                                "No ERLC private server data was found"

                            elements.panel.players.container.innerHTML = [[
                                <div class="flex items-center justify-center text-white text-center gap-2 w-full">
                                    <img src="/images/icons/Fail.svg" class="w-5 h-5" />
                                    <p>The ERLC private server is offline or not linked.</p>
                                </div>
                            ]]
                        end

                        renderShiftPanel(initial)

                        if initial then
                            utils.loading(nil, nil, nil)
                            elements.panel.container.classList:remove("hidden")
                        end
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
        else
            utils.redirect("servers")
        end
    else
        utils.redirect("login/?redirect=" .. location)
    end
end)()