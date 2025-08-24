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
        local loadMoreButton = document:getElementById('load-more-punishments')
        local currentPage = 1
        local guildId = path[2]

        local function fetchPunishments(id, page)
            if not punishmentList then return end

            http.request(function(success, response)
                if success and response and response.data then
                    if page == 1 then
                        punishmentList.innerHTML = ""
                    end

                    if #response.data == 0 then
                        loadMoreButton.style.display = 'none'
                        if page == 1 then
                            punishmentList.innerHTML = '<p class="text-white/60 text-center">No punishments found.</p>'
                        end
                        return
                    end

                    for i, punishment in ipairs(response.data) do
                        local punishmentHTML = string.format([[
                            <div class="bg-secondary/40 p-4 rounded-lg">
                                <div class="flex justify-between items-center">
                                    <div class="flex items-center">
                                        <img src="%s" alt="%s" class="w-8 h-8 rounded-full mr-3">
                                        <p class="text-white font-semibold">@%s</p>
                                    </div>
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
                        ]], punishment.player.avatar, punishment.player.name, punishment.player.name, punishment.type, punishment.reason, punishment.moderator.name, os.date("%Y-%m-%d", punishment.timestamp))

                        punishmentList.innerHTML = punishmentList.innerHTML .. punishmentHTML
                    end
                else
                    punishmentList.innerHTML = '<p class="text-white/60 text-center">Failed to load punishments.</p>'
                    loadMoreButton.style.display = 'none'
                end
            end, "GET", "https://devapi.duckybot.xyz/guilds/" .. id .. "/punishments/" .. page, {
                ["Discord-Code"] = cookie
            })
        end

        fetchPunishments(guildId, currentPage)

        loadMoreButton:addEventListener('click', function()
            currentPage = currentPage + 1
            fetchPunishments(guildId, currentPage)
        end)
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
