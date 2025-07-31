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
						<p class="text-white/60 text-base max-w-full break-words">%s</p>
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
				table.sort(members, function(a, b)
					return a.position > b.position
				end)
				
				for i, member in pairs(members) do
					local container = elements.team[category]

					if container then
						local card = document:createElement("div")
						card.className = "w-64 border-[1px] border-[" .. member.color .. "] aspect-square bg-secondary/40 rounded-xl text-white text-center p-6 flex flex-col items-center justify-center relative hover:shadow-[0_0_5px_" .. member.color .. "] hover:-translate-y-[5px] transform transition duration-300 opacity-0"
						card.style.animation = "fadeInSlide 0.5s ease-out " .. (i * 0.15) .. "s forwards"

						card.innerHTML = string.format([[
							<a href="https://discord.com/users/%s"><img src="%s" alt="%s" class="w-24 h-24 rounded-full object-cover mb-4"></a>
							<a href="https://discord.com/users/%s"><h3 class="text-xl font-semibold">%s</h3></a>
							<p class="text-sm text-white/60">%s</p>
						]], member.discord_id, member.avatar, member.name, member.discord_id, member.name, member.role)

						container:appendChild(card)
					end
				end
			end
		end
	end, "GET", "https://api.duckybot.xyz/team")
end

http.request(function(success, response)
	if success and response and response.data then
		if location == "/" then
			elements.version.textContent = response.data.version
		end

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
