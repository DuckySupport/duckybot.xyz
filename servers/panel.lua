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
	footer = document:getElementById("footer"),
	mobile = {
		menu = document:getElementById("mobileMenu"),
		open = document:getElementById("mobileMenuOpen"),
		close = document:getElementById("mobileMenuClose")
	}
}

http.request(function(success, response)
	if success and response then
		elements.footer.innerHTML = response
		elements.footer = {
			version = document:getElementById("footerVersion"),
			status = document:getElementById("footerStatus")
		}
	end
end, "GET", "/partials/footer.html", nil, nil, "text")

local cookie = utils.cookie("discord")
if cookie then
	if path[1] == "servers" and tonumber(path[2]) and path[3] == "panel" then
        --[[Primary Variables]]--
		elements.panel = {
			loadingScreen = document:getElementById("loading-screen"),
			content = document:getElementById("panel-content"),
			icon = document:getElementById("panelIcon"),
			title = document:getElementById("panelTitle"),
			text = document:getElementById("panelText")
		}

        local guildId = path[2]
        local currentUser
        local guildInfo
        local erlcInfo

        --[[Loading Functions]]--
		local function updatePanel(icon, title, text)
			local key = {
				loading = "/images/icons/Loading.gif",
				fail = "/images/icons/Fail.svg"
			}
			if elements.panel.icon then elements.panel.icon.src = key[icon] or icon end
			if elements.panel.title then elements.panel.title.textContent = title end
			if elements.panel.text then elements.panel.text.innerHTML = text end
		end

        local function loadUserInfo()
            local co = coroutine.running()
            assert(co, "loadUserInfo must be called inside a coroutine")

            http.request(function(success, response)
                coroutine.resume(co, success, response)
            end, "GET", "https://devapi.duckybot.xyz/users/@me", {
                ["Discord-Code"] = cookie
            })

            return coroutine.yield()
        end

        local function loadGuildInfo()
            local co = coroutine.running()
            assert(co, "loadGuildInfo must be called inside a coroutine")

            http.request(function(success, response)
                coroutine.resume(co, success, response)
            end, "GET", "https://devapi.duckybot.xyz/guilds/" .. guildId .. "/info", {
                ["Discord-Code"] = cookie
            })

            return coroutine.yield()
        end

        local function loadERLCInfo()
            local co = coroutine.running()
            assert(co, "loadERLCInfo must be called inside a coroutine")

            http.request(function(success, response)
                coroutine.resume(co, success, response)
            end, "GET", "https://devapi.duckybot.xyz/guilds/" .. guildId .. "/erlc/data", {
                ["Discord-Code"] = cookie
            })

            return coroutine.yield()
        end

        local function startPanel()
            console:log("Starting panel...")

            --[[Secondary Variables]]--
            local permissions = guildInfo.permissions

            --[[Tabs Setup]]--
            elements.tabs = {
                buttons = document:querySelectorAll('button[data-tab-target]'),
                contents = document:querySelectorAll('.tab-content')
            }

            for i = 0, elements.tabs.buttons.length - 1 do
                local button = elements.tabs.buttons[i]
                button:addEventListener('click', function(event)
                    for j = 0, elements.tabs.contents.length - 1 do
                        elements.tabs.contents[j].classList:add('hidden')
                    end

                    for j = 0, elements.tabs.buttons.length - 1 do
                        local btn = elements.tabs.buttons[j]
                        btn.classList:remove('text-primary', 'border-primary')
                        btn.classList:add('text-white/50', 'border-transparent', 'hover:text-white/80', 'hover:border-white/30')
                    end

                    local targetSelector = button:getAttribute('data-tab-target')
                    local target = document:querySelector(targetSelector)
                    if target then
                        target.classList:remove('hidden')
                    else
                        console:error('Tab content not found for selector: ', targetSelector)
                    end

                    button.classList:add('text-primary', 'border-primary')
                    button.classList:remove('text-white/50', 'border-transparent', 'hover:text-white/80', 'hover:border-white/30')
                end)
            end

            --[[Tab: Punishments]]--
            local punishmentList = document:getElementById('punishment-list')
            if not punishmentList then return end

            -- New punishment form elements
            local punishmentUsername = document:getElementById('punishment-username')
            local usernameSuggestions = document:getElementById('username-suggestions')
            local punishmentType = document:getElementById('punishment-type')
            local typeSuggestions = document:getElementById('type-suggestions')
            local punishmentReason = document:getElementById('punishment-reason')
            local punishmentDurationContainer = document:getElementById('punishment-duration-container')
            local punishmentDuration = document:getElementById('punishment-duration')
            local punishmentSubmit = document:getElementById('punishment-submit')

            local loadPunishments
            local bindPunishmentEventListeners

            -- Store player names for suggestions
            local playerNames = {}
            if erlcInfo then
                local uniquePlayerNames = {}
                if erlcInfo.players then
                    for _, player in pairs(erlcInfo.players) do
                        uniquePlayerNames[player.Name] = true
                    end
                end
                if erlcInfo.previousPlayers then
                    for _, player in pairs(erlcInfo.previousPlayers) do
                        uniquePlayerNames[player.Name] = true
                    end
                end
                for name, _ in pairs(uniquePlayerNames) do
                    table.insert(playerNames, name)
                end
                table.sort(playerNames)
            end

            -- Handle username input and suggestions
            local function showUsernameSuggestions()
                local inputValue = punishmentUsername.value:lower()
                usernameSuggestions.innerHTML = ''
                if #inputValue == 0 then
                    usernameSuggestions.classList:add('hidden')
                    return
                end

                local suggestionsCount = 0
                for _, name in pairs(playerNames) do
                    if name:lower():find(inputValue, 1, true) then
                        local li = document:createElement('li')
                        li.className = 'px-3 py-2 text-white/80 hover:bg-white/10 cursor-pointer'
                        li.textContent = name
                        li:addEventListener('click', function()
                            punishmentUsername.value = name
                            usernameSuggestions.classList:add('hidden')
                        end)
                        usernameSuggestions:appendChild(li)
                        suggestionsCount = suggestionsCount + 1
                    end
                end

                if suggestionsCount > 0 then
                    usernameSuggestions.classList:remove('hidden')
                else
                    usernameSuggestions.classList:add('hidden')
                end
            end

            punishmentUsername:addEventListener('input', function()
                showUsernameSuggestions()
            end)

            punishmentUsername:addEventListener('click', function()
                showUsernameSuggestions()
            end)

            -- Store and handle punishment types
            local punishmentTypes = {}
            punishmentType.readOnly = true

            punishmentType:addEventListener('focus', function()
                typeSuggestions.innerHTML = ''
                for _, name in pairs(punishmentTypes) do
                    local li = document:createElement('li')
                    li.className = 'px-3 py-2 text-white/80 hover:bg-white/10 cursor-pointer'
                    li.textContent = name
                    li:addEventListener('click', function()
                        punishmentType.value = name
                        typeSuggestions.classList:add('hidden')
                        if name:lower() == 'tempban' then
                            punishmentDurationContainer.classList:remove('hidden')
                        else
                            punishmentDurationContainer.classList:add('hidden')
                        end
                    end)
                    typeSuggestions:appendChild(li)
                end
                typeSuggestions.classList:remove('hidden')
            end)

            -- Hide suggestions when clicking outside
            punishmentUsername:addEventListener("focusout", function()
                time.after(100, function() usernameSuggestions.classList:add('hidden') end)
            end)

            punishmentType:addEventListener("blur", function()
                time.after(100, function() typeSuggestions.classList:add("hidden") end)
            end)

            -- Handle punishment submission
            punishmentSubmit:addEventListener('click', function()
                local username = punishmentUsername.value
                local pType = punishmentType.value
                local reason = punishmentReason.value
                local duration = punishmentDuration.value

                if not username or #username == 0 then
                    return utils.notify("Username is required.", "warning")
                end

                if not pType or #pType == 0 then
                    return utils.notify("Please select a punishment type.", "warning")
                end

                if not reason or #reason == 0 then
                    return utils.notify("A reason is required.", "warning")
                end

                pType = pType:lower()

                local data = {
                    username = username,
                    type = pType,
                    reason = reason
                }

                -- local body
                if pType == "bolo" then
                    http.request(function(success, response)
                        if success and response then
                            utils.notify(response.message, "success")
                            loadPunishments()
                        else
                            utils.notify((response and response.message) or "Unknown error.", "fail")
                        end
                    end, "POST", "https://devapi.duckybot.xyz/guilds/" .. guildId .. "/bolos", {
                        ["Discord-Code"] = cookie,
                        ["Content-Type"] = "application/json"
                    }, utils.jsonfyBody(data))
                elseif pType == "tempban" then
                    if not duration or #duration == 0 then
                        return utils.notify("Duration is required for a tempban.", "warning")
                    end

                    local convert = utils.convertTimeInput(duration, true)
                    if not convert then
                        return utils.notify("Duration input is invalid, learn more at <a href='https://newdocs.duckybot.xyz/misc/timeinputs' target='_blank' class= text-[#F5FF82] hover:underline'>our docs</a>", "fail")
                    end

                    data.duration = convert

                    http.request(function(success, response)
                        if success and response then
                            utils.notify(response.message, "success")
                            loadPunishments()
                        else
                            utils.notify((response and response.message) or "Unknown error.", "fail")
                        end
                    end, "POST", "https://devapi.duckybot.xyz/guilds/" .. guildId .. "/tempbans", {
                        ["Discord-Code"] = cookie,
                        ["Content-Type"] = "application/json"
                    }, utils.jsonfyBody(data))
                else
                    http.request(function(success, response)
                        console:log(response)
                        if success and response then
                            utils.notify(response.message, "success")
                            loadPunishments()
                        else
                            utils.notify((response and response.message) or "Unknown error.", "fail")
                        end
                    end, "POST", "https://devapi.duckybot.xyz/guilds/" .. guildId .. "/punishments", {
                        ["Discord-Code"] = cookie,
                        ["Content-Type"] = "application/json"
                    }, utils.jsonfyBody(data))
                end
            end)

            bindPunishmentEventListeners = function()
                local editButtons = punishmentList:querySelectorAll('[data-action="edit"]')
                for i = 0, editButtons.length - 1 do
                    local button = editButtons[i]
                    button:addEventListener('click', function(event)
                        local punishmentId = event:getAttribute('data-punishment-id')
                        local punishmentElement = button.parentElement.parentElement.parentElement
                        local originalHTML = punishmentElement.innerHTML

                        local editHTML = [[
                            <div class="p-4">
                                <div class="flex justify-between items-center">
                                    <h3 class="text-lg font-medium text-white">Edit punishment reason...</h3>
                                    <div class="flex items-center space-x-2">
                                        <button class="p-2 rounded-full hover:bg-white/10" data-action="cancel-edit">
                                            <img src="/images/icons/Fail.svg" class="w-5 h-5">
                                        </button>
                                        <button class="p-2 rounded-full hover:bg-white/10" data-action="submit-edit">
                                            <img src="/images/icons/Success.svg" class="w-5 h-5">
                                        </button>
                                    </div>
                                </div>
                                <div class="mt-4">
                                    <input type="text" class="w-full bg-dark/50 border border-white/20 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Enter new reason">
                                </div>
                            </div>
                        ]]

                        punishmentElement.innerHTML = editHTML

                        punishmentElement:querySelector('[data-action="cancel-edit"]'):addEventListener('click', function()
                            punishmentElement.innerHTML = originalHTML
                            bindPunishmentEventListeners()
                        end)

                        punishmentElement:querySelector('[data-action="submit-edit"]'):addEventListener('click', function()
                            local newReason = punishmentElement:querySelector('input').value
                            if newReason and #newReason > 0 then
                                http.request(function(success, response)
                                    if success then
                                        utils.notify("That punishment has been successfully updated.", "success")
                                        loadPunishments()
                                    else
                                        utils.notify(response.message or "An unexpected error occurred while attempting to update that message.", "fail")
                                    end
                                end, "PATCH", "https://devapi.duckybot.xyz/guilds/" .. guildId .. "/punishments/" .. punishmentId, {
                                    ["Discord-Code"] = cookie,
                                    ["Content-Type"] = "application/json"
                                }, utils.jsonfyBody({reason = newReason}))
                            else
                                utils.notify("You did not provide a reason for this punishment.", "warning")
                            end
                        end)
                    end)
                end

                local deleteButtons = punishmentList:querySelectorAll('[data-action="delete"]')
                for i = 0, deleteButtons.length - 1 do
                    local button = deleteButtons[i]
                    button:addEventListener('click', function(event)
                        local punishmentId = event:getAttribute('data-punishment-id')
                        local punishmentElement = button.parentElement.parentElement.parentElement
                        local originalHTML = punishmentElement.innerHTML

                        local deleteHTML = [[
                            <div class="p-4">
                                <div class="flex justify-between items-center">
                                    <h3 class="text-lg font-medium text-white">Are you sure?</h3>
                                    <div class="flex items-center space-x-2">
                                        <button class="p-2 rounded-full hover:bg-white/10" data-action="cancel-delete">
                                            <img src="/images/icons/Fail.svg" class="w-5 h-5">
                                        </button>
                                        <button class="p-2 rounded-full hover:bg-white/10" data-action="submit-delete">
                                            <img src="/images/icons/Success.svg" class="w-5 h-5">
                                        </button>
                                    </div>
                                </div>
                                <p class="text-white/60 mt-2">This action cannot be undone.</p>
                            </div>
                        ]]

                        punishmentElement.innerHTML = deleteHTML

                        punishmentElement:querySelector('[data-action="cancel-delete"]'):addEventListener('click', function()
                            punishmentElement.innerHTML = originalHTML
                            bindPunishmentEventListeners()
                        end)

                        punishmentElement:querySelector('[data-action="submit-delete"]'):addEventListener('click', function()
                            http.request(function(success, response)
                                if success then
                                    utils.notify("That punishment has been successfully deleted.", "success")
                                    punishmentElement.classList:add('slide-up')
                                    global:setTimeout(function()
                                        punishmentElement:remove()
                                    end, 500)
                                else
                                    utils.notify(response.message, "fail")
                                    punishmentElement.innerHTML = originalHTML
                                    bindPunishmentEventListeners()
                                end
                            end, "DELETE", "https://devapi.duckybot.xyz/guilds/" .. guildId .. "/punishments/" .. punishmentId, {
                                ["Discord-Code"] = cookie
                            })
                        end)
                    end)
                end
            end

            loadPunishments = function()
                http.request(function(success, response)
                    if success and response and response.data then
                        -- Populate punishment types table
                        local uniqueTypes = { Tempban = true, BOLO = true }
                        local apiTypes = response.data.types or {}
                        for _, pType in pairs(apiTypes) do
                            uniqueTypes[pType:gsub("^%l", string.upper)] = true
                        end

                        punishmentTypes = {}
                        for name, _ in pairs(uniqueTypes) do
                            table.insert(punishmentTypes, name)
                        end
                        table.sort(punishmentTypes)

                        -- Populate punishment list
                        local punishments = response.data.punishments or {}
                        if #punishments == 0 then
                            punishmentList.innerHTML = '<p class="text-white/60 text-center">No punishments found.</p>'
                            return
                        end
                        punishmentList.innerHTML = ""
                        for _, punishment in pairs(punishments) do
                            local buttons = ""
                            if currentUser and permissions and (currentUser.id == punishment.moderator.id or permissions.ERLC_ADMIN) then
                                buttons = string.format([[
                                    <div class="flex items-center space-x-2">
                                        <i class="fas fa-pencil-alt text-white/60 hover:text-white cursor-pointer" data-punishment-id="%s" data-action="edit"></i>
                                        <i class="fas fa-trash-alt text-white/60 hover:text-white cursor-pointer" data-punishment-id="%s" data-action="delete"></i>
                                    </div>
                                ]], punishment.id, punishment.id)
                            end

                            punishmentList.innerHTML = punishmentList.innerHTML .. string.format([[
                            <div class="bg-secondary/40 p-4 rounded-lg">
                                <div class="flex justify-between items-center">
                                    <div class="flex items-center">
                                        <img src="%s" alt="%s" class="w-8 h-8 rounded-full mr-3">
                                        <p class="text-white font-semibold">@%s</p>
                                    </div>
                                    %s
                                </div>
                                <div class="flex items-center text-xs text-white/60 mt-2 flex-wrap">
                                    <span class="flex items-center"><i class="fas fa-file-alt w-4 mr-1"></i>%s</span>
                                    <span class="text-white/30 mx-2">・</span>
                                    <span class="flex items-center"><i class="fas fa-file-alt w-4 mr-1"></i>%s</span>
                                    <span class="text-white/30 mx-2">・</span>
                                    <span class="flex items-center"><i class="fas fa-gavel w-4 mr-1"></i>%s</span>
                                    <span class="text-white/30 mx-2">・</span>
                                    <span class="flex items-center"><i class="fas fa-calendar-alt w-4 mr-1"></i>%s</span>
                                </div>
                            </div>
                        ]], punishment.player.avatar, punishment.player.name, punishment.player.name, buttons, punishment.type:gsub("^%l", string.upper), utils.truncate(punishment.reason, 25), punishment.moderator.name, os.date("%Y-%m-%d", punishment.timestamp))
                        end
                        bindPunishmentEventListeners()
                    else
                        punishmentList.innerHTML = '<p class="text-white/60 text-center">Failed to load punishments.</p>'
                    end
                end, "GET", "https://devapi.duckybot.xyz/guilds/" .. guildId .. "/punishments/", {
                    ["Discord-Code"] = cookie
                })
            end

            loadPunishments()
        end

        --[[Initial Loading]]--
        coroutine.wrap(function()
            updatePanel("loading", "Loading...", "Fetching user and guild information...")

            local userSuccess, userResponse = loadUserInfo()
            if userSuccess and userResponse then
                currentUser = userResponse.data
            else
                return updatePanel("fail", "API Error", (userResponse and userResponse.message) or "Unknown error.")
            end

            local guildSuccess, guildResponse = loadGuildInfo()
            if guildSuccess and guildResponse then
                guildInfo = guildResponse.data
            else
                return updatePanel("fail", "API Error", (guildResponse and guildResponse.message) or "Unknown error.")
            end

            local erlcSuccess, erlcResponse = loadERLCInfo()
            if erlcSuccess and erlcResponse then
                erlcInfo = erlcResponse.data
            elseif not erlcResponse or erlcResponse.code ~= 404 then
                return updatePanel("fail", "API Error", (erlcResponse and erlcResponse.message) or "Unknown error.")
            end

            if elements.panel.loadingScreen then elements.panel.loadingScreen:remove() end
            if elements.panel.content then elements.panel.content.classList:remove("hidden") end

            startPanel()
            end)()
	else
		utils.redirect("/servers")
	end
else
	utils.redirect("/login/?redirect=" .. location)
end

http.request(function(success, response)
	if success and response and response.data then
		if elements.footer.version then
			elements.footer.version.textContent = response.data.version
		end
		if elements.footer.status then
			elements.footer.status.innerHTML = '<span class="w-2 h-2 bg-[#66FF66] rounded-full"></span> Status: Operational'
			elements.footer.status.className = "flex items-center gap-1 px-2 py-0.5 bg-[#66FF66]/10 rounded-full text-[#66FF66] text-xs"
		end
	else
		if elements.footer.version then
			elements.footer.version.textContent = "v1.3.0 Stable"
		end
		if elements.footer.status then
			elements.footer.status.innerHTML = '<span class="w-2 h-2 bg-[#FF6666] rounded-full"></span> Status: Unavailable'
			elements.footer.status.className = "flex items-center gap-1 px-2 py-0.5 bg-[#FF6666]/10 rounded-full text-[#FF6666] text-xs"
		end
	end
end, "GET", "https://api.duckybot.xyz/")

elements.mobile.open:addEventListener("click", function()
	if not elements.mobile.menu then return end
	elements.mobile.menu.classList:toggle("active")
	if elements.mobile.menu.classList:contains("active") then
		body.style.overflow = "hidden"
	else
		body.style.overflow = ""
	end
end)

elements.mobile.close:addEventListener("click", function()
	if not elements.mobile.menu then return end
	elements.mobile.menu.classList:toggle("active")
	if elements.mobile.menu.classList:contains("active") then
		body.style.overflow = "hidden"
	else
		body.style.overflow = ""
	end
end)