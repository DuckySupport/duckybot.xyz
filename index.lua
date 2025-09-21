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
	counters = {
		guilds = document:getElementById("guildCount"),
		users = document:getElementById("userCount")
	},
	feedback = document:getElementById("feedbackSlider"),
	version = document:getElementById("duckyVersion"),
	navbar = document:getElementById("navbar"),
	footer = document:getElementById("footer"),
	team = {
		dev = document:getElementById("teamDev"),
		mgmt = document:getElementById("teamMgmt"),
		admin = document:getElementById("teamAdmin"),
		support = document:getElementById("teamSupport"),
		mod = document:getElementById("teamMod")
	},
	link = {
		icon = document:getElementById("linkIcon"),
		title = document:getElementById("linkTitle"),
		text = document:getElementById("linkText"),
		buttons = document:getElementById("linkButtons"),
		forceUnlinkContainer = document:getElementById("forceUnlinkContainer"),
		forceUnlinkButton = document:getElementById("forceUnlinkButton"),
		linkAgainContainer = document:getElementById("linkAgainContainer")
	},
	login = {
		icon = document:getElementById("loginIcon"),
		title = document:getElementById("loginTitle"),
		text = document:getElementById("loginText"),
		buttons = document:getElementById("loginButtons")
	},
	servers = {
		container = document:getElementById("servers"),
		ducky = document:getElementById("serversDucky"),
		refresh = document:getElementById("serversRefresh")
	},
	plus = {
		purchase = document:getElementById("purchase")
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

		if path[1] == "plus" then
			elements.navbar.addDucky.classList:add("btn-glass")

			for _, link in pairs(elements.navbar.links) do link.classList:add("white") end
		else
			elements.navbar.addDucky.classList:add("btn-primary")
		end

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
	if location:find("/index%.html") then
		location = location:gsub("/index%.html", "")
		utils.redirect(location)
	elseif path[1] == "" then
		http.request(function(success, response)
			if success and response and response.data then
				elements.counters.guilds.textContent = utils.formatNumber(response.data.guilds) .. " communities"
				elements.counters.users.textContent = utils.formatNumber(response.data.users) .. " users"
			end
		end, "GET", "https://api.duckybot.xyz/statistics")

		http.request(function(success, response)
			if success and response and response.data then
				local mobile = utils.mobile()

				if mobile then response.data = utils.chop(response.data, 3) end

				elements.feedback.className = "flex flex-col gap-[10px]"
				elements.feedback.innerHTML = ""

				for i, review in pairs(response.data) do
					local card = document:createElement("div")
					card.className = "glass-card dark review-card p-4 opacity-0 w-full max-h-100 rounded-full"
					card.style.animation = "fadeInSlide 0.5s ease-out " .. ((mobile and i * 0.15) or i * 0.2) .. "s forwards"

					local filledStar = '<img src="/images/icons/starfill.svg" class="' .. (mobile and "w-5 h-5" or "w-6 h-6") .. ' inline-block mx-[2px]">'
					local emptyStar = '<img src="/images/icons/star.svg" class="' .. (mobile and "w-5 h-5" or "w-6 h-6") .. ' inline-block mx-[2px]">'

					local filledStars = filledStar:rep(review.rating)
					local emptyStars = emptyStar:rep(5 - review.rating)

					card.innerHTML = string.format([[
						<div class="flex items-center gap-4">
							<img src="%s" alt="%s" class="%s rounded-full flex-shrink-0">
							<div class="flex flex-col flex-grow">
							<div class="flex items-center gap-2 mb-1">
								<h4 class="font-semibold text-lg truncate">%s</h4>
								<div class="text-primary flex gap-1">
								%s%s
								</div>
							</div>
							<p class="text-white/60 text-base overflow-hidden" style="-webkit-line-clamp: 2; display: -webkit-box; -webkit-box-orient: vertical;">%s</p>
							</div>
						</div>
						]], review.submitter.avatar, review.submitter.username, mobile and "w-16 h-16" or "w-20 h-20", review.submitter.username, filledStars, emptyStars, review.feedback)

					elements.feedback:appendChild(card)
				end
			end
		end
	end, "GET", "https://api.duckybot.xyz/team")
elseif path[1] == "link" then
	local redirect_uri
	if global.window.location.hostname == "dev.duckybot.xyz" then
		redirect_uri = "https%3A%2F%2Fdev.duckybot.xyz%2Flink"
	else
		redirect_uri = "https%3A%2F%2Fduckybot.xyz%2Flink"
	end

	local function update(icon, title, text, showButtons)
		local key = {
			loading = "/images/icons/loading.gif",
			success = "/images/icons/success.svg",
			fail = "/images/icons/fail.svg"
		}

		elements.link.icon.src = key[icon] or icon
		elements.link.title.textContent = title
		elements.link.text.innerHTML = text

		if showButtons then
			elements.link.buttons.classList:remove("hidden")
		else
			elements.link.buttons.classList:add("hidden")
		end
	end

	update("loading", "Loading...", "Checking if you're logged in...", false)

	local cookie = utils.cookie("discord")
	local user = utils.user()
	local parameters = utils.parameters()

	if user then
		if parameters.code and parameters.state == "force-unlink" then
			update("loading", "Unlinking...", "Attempting to unlink your Roblox account from another user...", false)
			http.request(function(success, response)
				if success then
					update("success", "Successfully Unlinked", "Your Roblox account has been unlinked. You can now try linking it again.")
					elements.link.linkAgainContainer.classList:remove("hidden")
				else
					update("fail", "API Error", response.message or "Failed to unlink your account. Please try again or contact support.")
				end
			end, "DELETE", "https://api.duckybot.xyz/links", {
				["Roblox-Code"] = parameters.code
			})
		elseif user then
			local DiscordID = user.id
			if parameters.unlink == "true" then
				update("loading", "Loading...", "Unlinking your Roblox account from Ducky...", false)
				http.request(function(success, response)
					if success then
						update("success", "Successfully Unlinked", "Your Roblox account has been successfully unlinked from Ducky.")
						time.after(3000, function()
							utils.redirect("link")
						end)
					else
						update("fail", "API Error", response.message)
					end
				end, "DELETE", "https://api.duckybot.xyz/links/" .. DiscordID, {
					["Discord-Code"] = cookie
				})
			else
				update("loading", "Loading...", "Fetching your Roblox profile from our API...", false)
				http.request(function(success, response)
					if success and response and response.data and response.data.roblox then
						update("success", "Already Linked", 'Your Roblox account, <a href="' .. response.data.roblox.profile .. '" class="text-white font-semibold">@' .. response.data.roblox.name .. '</a>, is linked with your Discord account, <a href="https://discord.com/users/' .. response.data.discord.id .. '" class="text-white font-semibold">@' .. response.data.discord.username .. '</a>.', true)
						if parameters.redirect or parameters.state then utils.redirect(parameters.redirect or parameters.state) end
					elseif parameters.code then
						http.request(function(success, response)
							if success and response and response.data then
								update("success", "Successfully Linked", 'Your Roblox account, <a href="' .. response.data.roblox.profile .. '" class="text-white font-semibold">@' .. response.data.roblox.name .. '</a>, has been successfully linked with your Discord account, <a href="https://discord.com/users/' .. response.data.discord.id .. '" class="text-white font-semibold">@' .. response.data.discord.username .. '</a>.', true)
								if parameters.redirect or parameters.state then utils.redirect(parameters.redirect or parameters.state) end
							elseif response and response.code == 409 then
								update("fail", "Already Linked", response.message, false)
								local roblox_auth_url = "https://authorize.roblox.com/?client_id=9159621270656797210&response_type=code&redirect_uri=" .. redirect_uri .. "&scope=openid&state=force-unlink"
								elements.link.forceUnlinkButton.href = roblox_auth_url
								elements.link.forceUnlinkContainer.classList:remove("hidden")
							else
								update("fail", "API Error", response.message)
							end
						end, "POST", "https://api.duckybot.xyz/links", {
							["Discord-Code"] = cookie,
							["Roblox-Code"] = parameters.code
						})
					else
						update("loading", "Redirecting...", "You are being redirected to Roblox.")
						utils.redirect("https://authorize.roblox.com/?client_id=9159621270656797210&response_type=code&redirect_uri=" .. redirect_uri .. "&scope=openid" .. ((parameters.redirect and ("&state=" .. parameters.redirect)) or ""))
					end
				end, "GET", "https://api.duckybot.xyz/links/" .. DiscordID)
			end
		end
	else
		update("loading", "Redirecting...", "You are being redirected to Discord.", false)
		utils.redirect("login/?redirect=link")
	end
elseif path[1] == "login" then
	local redirect_uri
	if global.window.location.hostname == "dev.duckybot.xyz" then
		redirect_uri = "https%3A%2F%2Fdev.duckybot.xyz%2Flogin"
	else
		redirect_uri = "https%3A%2F%2Fduckybot.xyz%2Flogin"
	end

	local function update(icon, title, text, showButtons)
		local key = {
			loading = "/images/icons/loading.gif",
			success = "/images/icons/success.svg",
			fail = "/images/icons/fail.svg"
		}

		elements.login.icon.src = key[icon] or icon
		elements.login.title.textContent = title
		elements.login.text.innerHTML = text

		if showButtons then
			elements.login.buttons.classList:remove("hidden")
		else
			elements.login.buttons.classList:add("hidden")
		end
	end

	update("loading", "Loading...", "Checking if you're logged in...", false)

	local cookie = utils.cookie("discord")
	local user = utils.user()
	local parameters = utils.parameters()

	if parameters.logout == "true" then
		if cookie then
			utils.cookie("discord", "delete")
			update("success", "Logged Out", "You have been successfully logged out.")
			coroutine.wrap(function()
				time.sleep(3000)
				utils.redirect("login")
			end)()
		else
			update("fail", "Not Logged In", "You are not logged in.")
			utils.redirect("login")
		end
	elseif cookie then
		update("loading", "Loading...", "Fetching your Discord profile from our API...", false)

		if user then
			update("success", "Already Logged In", 'You are already logged in as <a href="https://discord.com/users/' .. user.id .. '" class="text-white font-semibold">@' .. user.username .. '</a>.', true)

			if parameters.redirect or parameters.state then utils.redirect(parameters.redirect or parameters.state) end
		else
			update("fail", "API Error", "Failed to fetch your Discord profile from our API. Please try again later.")
		end
	elseif parameters.access_token then
		update("loading", "Loading...", "Fetching your Discord profile from our API...", false)

		user = utils.user(parameters.access_token)

		if user then
			utils.cookie("discord", parameters.access_token)
			update("success", "Logged In", 'You have been logged in as <a href="https://discord.com/users/' .. user.id .. '" class="text-white font-semibold">@' .. user.username .. '</a>.', true)
			if parameters.redirect or parameters.state then utils.redirect(parameters.redirect or parameters.state) end
		else
			update("fail", "API Error", "Failed to fetch your Discord profile from our API. Please try again later.")
		end
	else
		update("loading", "Redirecting...", "You are being redirected to Discord.", false)
		utils.redirect("https://discord.com/oauth2/authorize/?client_id=1257389588910182411&response_type=token&redirect_uri=" .. redirect_uri .. "&scope=identify+guilds" .. ((parameters.redirect and ("&state=" .. parameters.redirect)) or ""))
	end
elseif path[1] == "servers" then
	local cookie = utils.cookie("discord")

	if cookie then
		if (not path[2]) or (path[2] == "") then
			local function updateLoading(icon, title, text)
				local key = {
					loading = "/images/icons/Loading.gif",
					fail = "/images/icons/Fail.svg"
				}
				if elements.servers.loadingIcon then elements.servers.loadingIcon.src = key[icon] or icon end
				if elements.servers.loadingTitle then elements.servers.loadingTitle.textContent = title end
				if elements.servers.loadingText then elements.servers.loadingText.textContent = text end
			end

			local function loadServers()
				updateLoading("loading", "Loading...", "Fetching guilds information...")

				http.request(function(success, response)
					if success and response and response.data then
						elements.servers.ducky.innerHTML = ""

						table.sort(response.data, function(a, b) return (a and a.members or 0) > b.members end)

						for _, guild in ipairs(response.data) do
							if guild.role then
								local container = elements.servers.ducky

								local card = document:createElement("div")
								card.className = "glass-card dark p-4 rounded-lg flex flex-col"

								local plusBadge = (guild.plus and guild.plus.active and [[
									<span class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold text-white whitespace-nowrap"
										style="background: linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('/images/misc/rainbow.webp') no-repeat center center; background-size: cover; backdrop-filter: blur(4px); flex-shrink: 0; min-width: max-content;">
										<img src="/images/icons/Plus.svg" alt="Plus" class="w-4 h-4">
										Ducky Plus+
									</span>
								]]) or ""

								card.innerHTML = string.format([[
									<div class="flex items-start gap-3 flex-grow">
										<img src="%s" alt="%s" class="w-[60px] h-[60px] rounded-full object-contain">

										<div class="flex flex-col w-full">
										<div class="flex items-center justify-between">
											<p class="font-semibold leading-tight truncate-multiline">
											%s
											</p>
											%s
										</div>

										<p class="text-sm text-white/50 mt-1 flex items-center">
											<i class="fa-solid fa-users mr-[5px]"></i> %s・<i class="fa-solid fa-shield-halved mr-[5px]"></i> %s
										</p>
										</div>
									</div>

									<div class="pt-2 mt-auto">
										<a href="/servers/%s/panel" class="group btn-glass w-full h-[38px] px-5 py-2 rounded-full text-sm inline-flex justify-center items-center">
										Moderate
										<i class="fas fa-chevron-right text-xs transition-transform group-hover:translate-x-1 ml-2"></i>
										</a>
									</div>
								]], guild.icon, guild.name, guild.name, plusBadge, utils.formatNumber(guild.members), guild.role, guild.id)

								container:appendChild(card)
							end
						end

						if elements.servers.ducky.childElementCount <= 0 then elements.servers.ducky.innerHTML = '<span class="text-white/50">There are no servers to show here.</span>' end

						if elements.servers.loadingScreen then elements.servers.loadingScreen:remove() end
						if elements.servers.container then elements.servers.container.classList:remove("hidden") end
					else
						updateLoading("fail", "API Error", response and response.message or "Unknown Error.")
					end
				end, "GET", "https://devapi.duckybot.xyz/guilds", {
					["Discord-Code"] = cookie
				})
			end)
		end
	elseif path[1] == "team" then
		http.request(function(success, response)
			if success and response and response.data then
				local categories = {}

				for i, member in pairs(response.data) do
					categories[member.category] = categories[member.category] or {}
					table.insert(categories[member.category], member)
				end

				for category, members in pairs(categories) do
					table.sort(members, function(a, b) return a.position > b.position end)
					for i, member in pairs(members) do
						local container = elements.team[category]

						if container then
							local card = document:createElement("div")
							card.className = "team-card w-64 aspect-square text-white text-center p-6 flex flex-col items-center justify-center relative transform transition duration-300 opacity-0"
							card.style.animation = "fadeInSlide 0.5s ease-out " .. (i * 0.15) .. "s forwards"
							card.style:setProperty("--member-color", utils.hexToRGBA(member.color, 0.5))
							card.style:setProperty("--member-color-nuh", utils.hexToRGBA(member.color, 0.2))

							card.innerHTML = string.format([[
							<a href="https://discord.com/users/%s" class="z-10"><img src="%s" alt="%s" class="w-24 h-24 rounded-full object-cover mb-4"></a>
							<a href="https://discord.com/users/%s" class="z-10"><h3 class="text-xl font-semibold">%s</h3></a>
							<p class="text-sm text-white/60 z-10">%s</p>
							]], member.discord_id, member.avatar, member.name, member.discord_id, member.name, member.role)

							container:appendChild(card)
						end
					end
				end
			end
		end, "GET", "https://api.duckybot.xyz/team")
	elseif path[1] == "link" then
		local redirect_uri
		if global.window.location.hostname == "dev.duckybot.xyz" then
			redirect_uri = "https%3A%2F%2Fdev.duckybot.xyz%2Flink"
		else
			redirect_uri = "https%3A%2F%2Fduckybot.xyz%2Flink"
		end

		local function update(icon, title, text, showButtons)
			local key = {
				loading = "/images/icons/loading.gif",
				success = "/images/icons/success.svg",
				fail = "/images/icons/fail.svg"
			}

			elements.link.icon.src = key[icon] or icon
			elements.link.title.textContent = title
			elements.link.text.innerHTML = text

			if showButtons then
				elements.link.buttons.classList:remove("hidden")
			else
				elements.link.buttons.classList:add("hidden")
			end
		end

		update("loading", "Loading...", "Checking if you're logged in...", false)

		local cookie = utils.cookie("discord")
		local user = utils.user()
		local parameters = utils.parameters()

		if user then
			if parameters.code and parameters.state == "force-unlink" then
				update("loading", "Unlinking...", "Attempting to unlink your Roblox account from another user...", false)
				http.request(function(success, response)
					if success then
						update("success", "Successfully Unlinked", "Your Roblox account has been unlinked. You can now try linking it again.")
						elements.link.linkAgainContainer.classList:remove("hidden")
					else
						update("fail", "API Error", response.message or "Failed to unlink your account. Please try again or contact support.")
					end
				end, "DELETE", "https://api.duckybot.xyz/links", {
					["Roblox-Code"] = parameters.code
				})
			elseif user then
				local DiscordID = user.id
				if parameters.unlink == "true" then
					update("loading", "Loading...", "Unlinking your Roblox account from Ducky...", false)
					http.request(function(success, response)
						if success then
							update("success", "Successfully Unlinked", "Your Roblox account has been successfully unlinked from Ducky.")
							time.after(3000, function()
								utils.redirect("link")
							end)
						else
							update("fail", "API Error", response.message)
						end
					end, "DELETE", "https://api.duckybot.xyz/links/" .. DiscordID, {
						["Discord-Code"] = cookie
					})
				else
					update("loading", "Loading...", "Fetching your Roblox profile from our API...", false)
					http.request(function(success, response)
						if success and response and response.data and response.data.roblox then
							update("success", "Already Linked", 'Your Roblox account, <a href="' .. response.data.roblox.profile .. '" class="text-white font-semibold">@' .. response.data.roblox.name .. '</a>, is linked with your Discord account, <a href="https://discord.com/users/' .. response.data.discord.id .. '" class="text-white font-semibold">@' .. response.data.discord.username .. '</a>.', true)
							if parameters.redirect or parameters.state then utils.redirect(parameters.redirect or parameters.state) end
						elseif parameters.code then
							http.request(function(success, response)
								if success and response and response.data then
									update("success", "Successfully Linked", 'Your Roblox account, <a href="' .. response.data.roblox.profile .. '" class="text-white font-semibold">@' .. response.data.roblox.name .. '</a>, has been successfully linked with your Discord account, <a href="https://discord.com/users/' .. response.data.discord.id .. '" class="text-white font-semibold">@' .. response.data.discord.username .. '</a>.', true)
									if parameters.redirect or parameters.state then utils.redirect(parameters.redirect or parameters.state) end
								elseif response and response.code == 409 then
									update("fail", "Already Linked", response.message, false)
									local roblox_auth_url = "https://authorize.roblox.com/?client_id=9159621270656797210&response_type=code&redirect_uri=" .. redirect_uri .. "&scope=openid&state=force-unlink"
									elements.link.forceUnlinkButton.href = roblox_auth_url
									elements.link.forceUnlinkContainer.classList:remove("hidden")
								else
									update("fail", "API Error", response.message)
								end
							end, "POST", "https://api.duckybot.xyz/links", {
								["Discord-Code"] = cookie,
								["Roblox-Code"] = parameters.code
							})
						else
							update("loading", "Redirecting...", "You are being redirected to Roblox.")
							utils.redirect("https://authorize.roblox.com/?client_id=9159621270656797210&response_type=code&redirect_uri=" .. redirect_uri .. "&scope=openid" .. ((parameters.redirect and ("&state=" .. parameters.redirect)) or ""))
						end
					end, "GET", "https://api.duckybot.xyz/links/" .. DiscordID)
				end
			end
		else
			update("loading", "Redirecting...", "You are being redirected to Discord.", false)
			utils.redirect("login/?redirect=link")
		end
	
	elseif path[1] == "login" then
		local redirect_uri
		if global.window.location.hostname == "dev.duckybot.xyz" then
			redirect_uri = "https%3A%2F%2Fdev.duckybot.xyz%2Flogin"
		else
			redirect_uri = "https%3A%2F%2Fduckybot.xyz%2Flogin"
		end

		local function update(icon, title, text, showButtons)
			local key = {
				loading = "/images/icons/loading.gif",
				success = "/images/icons/success.svg",
				fail = "/images/icons/fail.svg"
			}

			elements.login.icon.src = key[icon] or icon
			elements.login.title.textContent = title
			elements.login.text.innerHTML = text

			if showButtons then
				elements.login.buttons.classList:remove("hidden")
			else
				elements.login.buttons.classList:add("hidden")
			end
		end

		update("loading", "Loading...", "Checking if you're logged in...", false)

		local cookie = utils.cookie("discord")
		local user = utils.user()
		local parameters = utils.parameters()

		if parameters.logout == "true" then
			if cookie then
				utils.cookie("discord", "delete")
				update("success", "Logged Out", "You have been successfully logged out.")
				coroutine.wrap(function()
					time.sleep(3000)
					utils.redirect("/")
				end)()
			else
				update("fail", "Not Logged In", "You are not logged in. You will be redirected in a moment.")
				coroutine.wrap(function()
					time.sleep(3000)
					utils.redirect("login")
				end)()
			end
		elseif cookie then
			update("loading", "Loading...", "Fetching your Discord profile from our API...", false)

			if user then
				update("success", "Already Logged In", 'You are already logged in as <a href="https://discord.com/users/' .. user.id .. '" class="text-white font-semibold">@' .. user.username .. '</a>.', true)

				local redirectAfter = utils.cookie("redirectAfter")

				if redirectAfter then
					utils.cookie("redirectAfter", "delete")
					utils.redirect(redirectAfter)
				end
			else
				update("fail", "API Error", "Failed to fetch your Discord profile from our API. Please try again later.")
			end
		elseif parameters.access_token then
			update("loading", "Loading...", "Validating your request...", false)

			local providedState = parameters.state
			local savedState = utils.cookie("state")

			if not providedState or not savedState or providedState ~= savedState then
				update("fail", "State Mismatch", "There was an issue verifying your request. You will be redirected in a moment.")
				coroutine.wrap(function()
					time.sleep(3000)
					utils.redirect("login")
				end)()
				return
			end

			utils.cookie("state", "delete")

			update("loading", "Loading...", "Fetching your Discord profile from our API...", false)

			user = utils.user(parameters.access_token)

			if user then
				utils.cookie("discord", parameters.access_token)
				update("success", "Logged In", 'You have been logged in as <a href="https://discord.com/users/' .. user.id .. '" class="text-white font-semibold">@' .. user.username .. '</a>.', true)

				local redirectAfter = utils.cookie("redirectAfter")

				if redirectAfter then
					utils.cookie("redirectAfter", "delete")
					utils.redirect(redirectAfter)
				end
			else
				update("fail", "API Error", "Failed to fetch your Discord profile from our API. Please try again later.")
			end
		else
			update("loading", "Redirecting...", "You are being redirected to Discord.", false)

			if parameters.redirect then
				utils.cookie("redirectAfter", parameters.redirect, 480)
			end

			local state = utils.crypto()
			utils.cookie("state", state, 480, "None")

			utils.redirect("https://discord.com/oauth2/authorize/?client_id=1257389588910182411&response_type=token&redirect_uri=" .. redirect_uri .. "&scope=identify+guilds&state=" .. state)
		end
	elseif path[1] == "servers" then
		local cookie = utils.cookie("discord")

		if cookie then
			if (not path[2]) or (path[2] == "") then
				local function loadServers()
					utils.loading("loading", "Loading...", "Fetching guilds information...")

					http.request(function(success, response)
						if success and response and response.data then
							elements.servers.ducky.innerHTML = ""

							table.sort(response.data, function(a, b) return (a and a.members or 0) > b.members end)

							for _, guild in ipairs(response.data) do
								if guild.role then
									local container = elements.servers.ducky

									local card = document:createElement("div")
									card.className = "glass-card dark p-4 rounded-lg flex flex-col"

									local plusBadge = (guild.plus and guild.plus.active and [[
										<span class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold text-white whitespace-nowrap"
											style="background: linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('/images/misc/rainbow.webp') no-repeat center center; background-size: cover; backdrop-filter: blur(4px); flex-shrink: 0; min-width: max-content;">
											<img src="/images/icons/Plus.svg" alt="Plus" class="w-4 h-4">
											Ducky Plus+
										</span>
									]]) or ""

									card.innerHTML = string.format([[
										<div class="flex items-start gap-3 flex-grow">
											<img src="%s" alt="%s" class="w-[60px] h-[60px] rounded-full object-contain">

											<div class="flex flex-col w-full">
											<div class="flex items-center justify-between">
												<p class="font-semibold leading-tight truncate-multiline">
												%s
												</p>
												%s
											</div>

											<p class="text-sm text-white/50 mt-1 flex items-center">
												<i class="iconify mr-[5px]" data-icon="bi:people-fill"></i> %s・<i class="iconify mr-[5px]" data-icon="stash:shield-duotone"></i> %s
											</p>
											</div>
										</div>

										<div class="pt-2 mt-auto">
											<a href="/servers/%s/panel" class="group btn-glass w-full h-[38px] px-5 py-2 rounded-full text-sm inline-flex justify-center items-center">
											Moderate
											<i class="iconify text-xl transition-transform group-hover:translate-x-1 ml-2" data-icon="lsicon:right-outline"></i>
											</a>
										</div>
									]], guild.icon, guild.name, guild.name, plusBadge, utils.formatNumber(guild.members), guild.role, guild.id)

									container:appendChild(card)
								end
							end

							if elements.servers.ducky.childElementCount <= 0 then elements.servers.ducky.innerHTML = '<span class="text-white/50">There are no servers to show here.</span>' end

							utils.loading()
							if elements.servers.container then elements.servers.container.classList:remove("hidden") end
						else
							utils.loading("fail", "API Error", (response and response.data and response.data.message) or "An unknown error occurred. Please try again later.")
						end
					end, "GET", "https://devapi.duckybot.xyz/guilds", {
						["Discord-Code"] = cookie
					})
				end

				loadServers()
				elements.servers.refresh:addEventListener("click", loadServers)
			else
				utils.redirect("servers")
			end
		else
			utils.redirect("login/?redirect=servers")
		end
	elseif path[1] == "docs" then
		utils.redirect("https://docs.duckybot.xyz/")
	elseif path[1] == "status" then
		utils.redirect("https://status.duckybot.xyz/")
	elseif path[1] == "invite" then
		utils.redirect("https://discord.com/oauth2/authorize/?client_id=1257389588910182411")
	elseif path[1] == "support" then
		utils.redirect("https://discord.gg/w2dNr7vuKP")
	end
end)()

http.request(function(success, response)
	if success and response and response.data and response.data.version then
		if location == "/" then
			elements.version.innerHTML = string.format('Ducky %s is now live! <i class="fas fa-chevron-right ml-2 text-xs transition-transform group-hover:translate-x-1"></i>', response.data.version)
		end

		elements.footer.version.textContent = response.data.version
		elements.footer.status.innerHTML = '<span class="w-2 h-2 bg-[#66FF66] rounded-full"></span> Status: Operational'
		elements.footer.status.className = "flex items-center gap-1 px-2 py-0.5 bg-[#66FF66]/10 rounded-full text-[#66FF66] text-xs"
	else
		if location == "/" then
			elements.version.className = "group inline-flex items-center px-4 sm:px-6 py-1.5 sm:py-2 rounded-full bg-[#FF6666]/10 border border-[#FF6666]/10 text-white/90 text-xs sm:text-sm font-medium mb-6 sm:mb-8 hover:bg-primary/10 transition"
			elements.version.innerHTML = 'Ducky is currently experiencing an outage. <i class="fas fa-chevron-right ml-2 text-xs transition-transform group-hover:translate-x-1"></i>'
		end

		elements.footer.version.textContent = "v1.5.1 Stable"
		elements.footer.status.innerHTML = '<span class="w-2 h-2 bg-[#FF6666] rounded-full"></span> Status: Unavailable'
		elements.footer.status.className = "flex items-center gap-1 px-2 py-0.5 bg-[#FF6666]/10 rounded-full text-[#FF6666] text-xs"
	end
end, "GET", "https://api.duckybot.xyz/")
