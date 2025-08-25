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

local notificationContainer = document:getElementById('notification-container')

local notifications = {}

function notifications.show(type, message)
    local bgColor, textColor, iconHTML, title

    if type == 'success' then
        bgColor = 'bg-green-500/10'
        textColor = 'text-green-400'
        iconHTML = '<img src="/images/icons/Success.svg" class="w-6 h-6">'
    elseif type == 'warning' then
        bgColor = 'bg-yellow-500/10'
        textColor = 'text-yellow-400'
        iconHTML = '<i class="fas fa-exclamation-triangle text-xl"></i>'
    else
        bgColor = 'bg-red-500/10'
        textColor = 'text-red-400'
        iconHTML = '<img src="/images/icons/Fail.svg" class="w-6 h-6">'
    end

    local notification = document:createElement('div')
    notification.className = string.format('flex items-start %s %s p-4 rounded-lg shadow-lg w-80', bgColor, textColor)
    notification.classList:add('slide-in-right')

    notification.innerHTML = string.format([[
        <div class="flex-shrink-0">
            %s
        </div>
        <div class="ml-3">
            <p class="text-sm">%s</p>
        </div>
    ]], iconHTML, message)

    notificationContainer:appendChild(notification)

    global:setTimeout(function()
        notification.classList:remove('slide-in-right')
        notification.classList:add('slide-out-right')
        global:setTimeout(function()
            notification:remove()
        end, 500)
    end, 5000)
end

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

            local loadPunishments
            local bindPunishmentEventListeners

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
                                        notifications.show('success', 'Punishment updated.')
                                        loadPunishments()
                                    else
                                        notifications.show('error', response.message or 'Update failed.')
                                    end
                                end, "PATCH", "https://devapi.duckybot.xyz/guilds/" .. guildId .. "/punishments/" .. punishmentId, {
                                    ["Discord-Code"] = cookie,
                                    ["Content-Type"] = "application/json"
                                }, string.format('{"reason": "%s"}', newReason))
                            else
                                notifications.show('warning', 'Reason cannot be empty.')
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
                                    notifications.show('success', 'Punishment successfully deleted.')
                                    punishmentElement.classList:add('slide-up')
                                    global:setTimeout(function()
                                        punishmentElement:remove()
                                    end, 500)
                                else
                                    notifications.show('error', response.message)
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
                        if #response.data == 0 then
                            punishmentList.innerHTML = '<p class="text-white/60 text-center">No punishments found.</p>'
                            return
                        end
                        punishmentList.innerHTML = ""
                        for _, punishment in pairs(response.data) do
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
                        ]], punishment.player.avatar, punishment.player.name, punishment.player.name, buttons, punishment.type, utils.truncate(punishment.reason, 25), punishment.moderator.name, os.date("%Y-%m-%d", punishment.timestamp))
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
