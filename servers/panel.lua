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

        local punishmentList = document:getElementById('punishment-list')
        local guildId = path[2]

        if not punishmentList then return end

        local JSON = js.global.JSON
        local currentUser = nil
        local permissions = nil

        function loadPunishments()
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
                    ]], punishment.player.avatar, punishment.player.name, punishment.player.name, buttons, punishment.type, punishment.reason, punishment.moderator.name, os.date("%Y-%m-%d", punishment.timestamp))
                    end
                    bindPunishmentEventListeners()
                else
                    punishmentList.innerHTML = '<p class="text-white/60 text-center">Failed to load punishments.</p>'
                end
            end, "GET", "https://devapi.duckybot.xyz/guilds/" .. guildId .. "/punishments/", {
                ["Discord-Code"] = cookie
            })
        end

        function bindPunishmentEventListeners()
            local editButtons = punishmentList:querySelectorAll('[data-action="edit"]')
            for i = 0, editButtons.length - 1 do
                local button = editButtons[i]
                button:addEventListener('click', function(event)
                    local punishmentId = event:getAttribute('data-punishment-id')
                    local punishmentElement = button.parentElement.parentElement.parentElement
                    local originalHTML = punishmentElement.innerHTML

                    local editHTML = [[
                        <div class="p-4">
                            <h3 class="text-lg font-medium text-white">Edit punishment reason...</h3>
                            <div class="mt-4">
                                <input type="text" class="w-full bg-dark/50 border border-white/20 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Enter new reason">
                            </div>
                            <div class="mt-4 flex justify-end space-x-2">
                                <button class="p-2 rounded-full hover:bg-white/10" data-action="cancel-edit">
                                    <img src="/images/icons/Fail.svg" class="w-5 h-5">
                                </button>
                                <button class="p-2 rounded-full hover:bg-white/10" data-action="submit-edit">
                                    <img src="/images/icons/Success.svg" class="w-5 h-5">
                                </button>
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
                    http.request(function(success, response)
                        if success then
                            notifications.show('success', 'Punishment successfully deleted.')
                            local punishmentElement = button.parentElement.parentElement.parentElement
                            punishmentElement.classList:add('slide-up')
                            global:setTimeout(function()
                                punishmentElement:remove()
                            end, 500)
                        else
                            notifications.show('error', response.message)
                        end
                    end, "DELETE", "https://devapi.duckybot.xyz/guilds/" .. guildId .. "/punishments/" .. punishmentId, {
                        ["Discord-Code"] = cookie
                    })
                end)
            end
        end

        http.request(function(success, response)
            if success and response and response.data then
                currentUser = response.data
                http.request(function(success, response)
                    if success and response and response.data and response.data.permissions then
                        permissions = response.data.permissions
                        loadPunishments()
                    else
                        punishmentList.innerHTML = '<p class="text-white/60 text-center">Failed to load permissions.</p>'
                    end
                end, "GET", "https://devapi.duckybot.xyz/guilds/" .. guildId .. "/info", {
                    ["Discord-Code"] = cookie
                })
            else
                punishmentList.innerHTML = '<p class="text-white/60 text-center">Failed to load user data.</p>'
            end
        end, "GET", "https://devapi.duckybot.xyz/users/@me", {
            ["Discord-Code"] = cookie
        })
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
