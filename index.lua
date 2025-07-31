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
local console = global.console

local elements = {
	counters = {
		guilds = document:getElementById("guildCount"),
		users = document:getElementById("userCount")
	},
	feedback = document:getElementById("feedbackSlider"),
	version = document:getElementById("duckyVersionText"),
	footer = {
		version = document:getElementById("footerVersion"),
		status = document:getElementById("footerStatus")
	},
	mobile = {
		menu = document:getElementById("mobileMenu"),
		open = document:getElementById("mobileMenuOpen"),
		close = document:getElementById("mobileMenuClose")
	},
	team = {
		dev = document:getElementById("team-dev"),
		mgmt = document:getElementById("team-mgmt"),
		admin = document:getElementById("team-admin"),
		support = document:getElementById("team-support"),
		mod = document:getElementById("team-mod")
	},
	link = {
		icon = document:getElementById("linkIcon"),
		title = document:getElementById("linkTitle"),
		text = document:getElementById("linkText"),
		buttons = document:getElementById("linkButtons")
	},
	login = {
		icon = document:getElementById("loginIcon"),
		title = document:getElementById("loginTitle"),
		text = document:getElementById("loginText"),
		buttons = document:getElementById("loginButtons")
	}
}

if location == "/" or location == "/index.html" then
	http.request(function(success, response)
		if success and response and response.data then
			elements.counters.guilds.textContent = utils.formatNumber(response.data.guilds) .. " communities"
			elements.counters.users.textContent = utils.formatNumber(response.data.users) .. " users"
		end
	end, "GET", "https://api.duckybot.xyz/statistics")

	http.request(function(success, response)
		if success and response and response.data then
			local mobile = utils.mobile()
			local filtered = {}

			for _, review in pairs(response.data) do if review.rating >= 4 then table.insert(filtered, review) end end

			filtered = utils.shuffle(filtered)
			filtered = utils.chop(filtered, mobile and 3 or 5)

			elements.feedback.className = "flex flex-col gap-[10px]"
			elements.feedback.innerHTML = ""

			for i, review in pairs(filtered) do
				local card = document:createElement("div")
				card.className = "glass-card review-card p-4 opacity-0 w-full max-h-100 rounded-full"
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
	end, "GET", "https://api.duckybot.xyz/feedback")
elseif location == "/team/" then
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
elseif location == "/link/" then
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
	local parameters = utils.parameters()

	if cookie then
		update("loading", "Loading...", "Fetching your Discord profile from our API...", false)

		http.request(function(success, response)
			if success and response and response.data then
				local DiscordID = response.data.id

				if parameters.unlink == "true" then
					update("loading", "Loading...", "Unlinking your Roblox account from Ducky...", false)

					http.request(function(success, response)
						if success and response and response.data then
							update("success", "Successfully Unlinked", "Your Roblox account has been successfully unlinked from Ducky.")
							time.sleep(3000)
							utils.redirect("link")
						else
							update("fail", "API Error", response.message)
						end
					end, "DELETE", "https://api.duckybot.xyz/links/" .. DiscordID, {
						["Discord-Code"] = cookie
					})
				else
					update("loading", "Loading...", "Fetching your Roblox profile from our API...", false)

					http.request(function(success, response)
						if success and response and response.data then
							update("success", "Already Linked", 'Your Roblox account, <a href="' .. response.data.roblox.profile .. '" class="text-primary font-semibold">@' .. response.data.roblox.name .. '</a>, is linked with your Discord account, <a href="https://discord.com/users/' .. response.data.discord.id .. '" class="text-primary font-semibold">@' .. response.data.discord.username .. '</a>.', true)

							if parameters.redirect or parameters.state then
								utils.redirect(parameters.redirect or parameters.state)
							end
						elseif parameters.code then
							http.request(function(success, response)
								if success and response and response.data then
									update("success", "Successfully Linked", 'Your Roblox account, <a href="' .. response.data.roblox.profile .. '" class="text-primary font-semibold">@' .. response.data.roblox.name .. '</a>, has been successfully linked with your Discord account, <a href="https://discord.com/users/' .. response.data.discord.id .. '" class="text-primary font-semibold">@' .. response.data.discord.username .. '</a>.', true)
									
									if parameters.redirect or parameters.state then
										utils.redirect(parameters.redirect or parameters.state)
									end
								elseif response and response.code == 409 then
									update("fail", "Already Linked", response.message)
								else
									update("fail", "API Error", response.message)
								end
							end, "POST", "https://api.duckybot.xyz/links", {
								["Discord-Code"] = cookie,
								["Roblox-Code"] = parameters.code
							})
						else
							update("loading", "Redirecting...", "You are being redirected to Roblox.")
							utils.redirect("https://authorize.roblox.com/?client_id=9159621270656797210&response_type=code&redirect_uri=https%3A%2F%2Fduckybot.xyz%2Flink&scope=openid" .. ((parameters.redirect and ("&state=" .. parameters.redirect)) or ""))
						end
					end, "GET", "https://api.duckybot.xyz/links/" .. DiscordID)
				end
			else
				update("fail", "API Error", "Failed to fetch your Discord profile from our API. Please try again later.")
			end
		end, "GET", "https://api.duckybot.xyz/users/@me", {
			["Discord-Code"] = cookie
		})
	else
		update("loading", "Redirecting...", "You are being redirected to Discord.", false)
		utils.redirect("login/?redirect=link")
	end
elseif location == "/login/" then
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

		http.request(function(success, response)
			if success and response and response.data then
				update("success", "Already Logged In", 'You are already logged in as <span class="text-white font-semibold">@' .. response.data.username .. '</span>.', true)

				if parameters.redirect or parameters.state then
					utils.redirect(parameters.redirect or parameters.state)
				end
			else
				update("fail", "API Error", "Failed to fetch your Discord profile from our API. Please try again later.")
			end
		end, "GET", "https://api.duckybot.xyz/users/@me", {
			["Discord-Code"] = cookie
		})
	elseif parameters.access_token then
		update("loading", "Loading...", "Fetching your Discord profile from our API...", false)

		http.request(function(success, response)
			if success and response and response.data then
				utils.cookie("discord", parameters.access_token)
				update("success", "Logged In", 'You have been logged in as <span class="text-white font-semibold">@' .. response.data.username .. '</span>.', true)

				if parameters.redirect or parameters.state then
					utils.redirect(parameters.redirect or parameters.state)
				end
			else
				update("fail", "API Error", "Failed to fetch your Discord profile from our API. Please try again later.")
			end
		end, "GET", "https://api.duckybot.xyz/users/@me", {
			["Discord-Code"] = parameters.access_token
		})
	else
		update("loading", "Redirecting...", "You are being redirected to Discord.", false)
		utils.redirect("https://discord.com/oauth2/authorize/?client_id=1257389588910182411&response_type=token&redirect_uri=https%3A%2F%2Fduckybot.xyz%2Flogin&scope=identify+guilds" .. ((parameters.redirect and ("&state=" .. parameters.redirect)) or ""))
	end
elseif location == "/docs/" then
	utils.redirect("https://docs.duckybot.xyz/")
elseif location == "/status/" then
	utils.redirect("https://status.duckybot.xyz/")
elseif location == "/invite/" then
	utils.redirect("https://discord.com/oauth2/authorize/?client_id=1257389588910182411")
elseif location == "/support/" then
	utils.redirect("https://discord.gg/w2dNr7vuKP")
end

http.request(function(success, response)
	if success and response and response.data then
		if location == "/" then elements.version.textContent = response.data.version end

		elements.footer.version.textContent = response.data.version
		elements.footer.status.innerHTML = '<span class="w-2 h-2 bg-[#66FF66] rounded-full"></span> Status: Operational'
		elements.footer.status.className = "flex items-center gap-1 px-2 py-0.5 bg-[#66FF66]/10 rounded-full text-[#66FF66] text-xs"
	else
		elements.footer.version.textContent = "v1.2.0 Stable"
		elements.footer.status.innerHTML = '<span class="w-2 h-2 bg-[#FF6666] rounded-full"></span> Status: Unavailable'
		elements.footer.status.className = "flex items-center gap-1 px-2 py-0.5 bg-[#FF6666]/10 rounded-full text-[#FF6666] text-xs"
		elements.footer.statusDot.className = "w-2 h-2 bg-[#FF6666] rounded-full"
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
