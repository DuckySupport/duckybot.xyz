package.path = "/deps/?.lua;" .. package.path
local js = require("js")
local http = require("http")
local utils = require("utils")

local global = js.global
local document = global.document
local window = global.window
local console = global.console

local elements = {
    loading = document:getElementById("loading"),
    transcript = document:getElementById("transcript"),
    messages = document:getElementById("messages"),
    guildIcon = document:getElementById("guild-icon"),
    guildName = document:getElementById("guild-name"),
    channelName = document:getElementById("channel-name"),
    error = document:getElementById("error"),
    transcriptDate = document:getElementById("transcript-date"),
    navbar = document:getElementById("navbar"),
    footer = document:getElementById("footer"),
    mobile = {
        menu = document:getElementById("mobileMenu"),
        open = document:getElementById("mobileMenuOpen"),
        close = document:getElementById("mobileMenuClose")
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

        if elements.navbar.addDucky then
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
            document.body.style.overflow = elements.mobile.menu.classList:contains("active") and "hidden" or ""
        end)

        elements.mobile.close:addEventListener("click", function()
            elements.mobile.menu.classList:toggle("active")
            document.body.style.overflow = elements.mobile.menu.classList:contains("active") and "hidden" or ""
        end)
    end
end, "GET", "/partials/navbar.html", nil, nil, "text")

http.request(function(success, response)
    if success and response then
        elements.footer.innerHTML = response
        elements.footer = {
            version = document:getElementById("footerVersion"),
            status = document:getElementById("footerStatus")
        }

        http.request(function(s, r) 
             if s and r and r.data and r.data.version then
                elements.footer.version.textContent = r.data.version.name
                elements.footer.status.innerHTML = '<span class="w-2 h-2 bg-[#66FF66] rounded-full"></span> Status: Operational'
                elements.footer.status.className = "flex items-center gap-1 px-2 py-0.5 bg-[#66FF66]/10 rounded-full text-[#66FF66] text-xs"
             end
        end, "GET", "https://api.duckybot.xyz/")
    end
end, "GET", "/partials/footer.html", nil, nil, "text")


local function escapeHTML(text)
    if not text then return "" end
    text = tostring(text)
    text = text:gsub("&", "&amp;")
    text = text:gsub("<", "&lt;")
    text = text:gsub(">", "&gt;")
    text = text:gsub('"', "&quot;")
    text = text:gsub("'", "&#039;")
    return text
end

local function formatFileSize(bytes)
    if not bytes then return "0 Bytes" end
    bytes = tonumber(bytes)
    local k = 1024
    local sizes = {"Bytes", "KB", "MB", "GB"}
    if bytes == 0 then return "0 Bytes" end
    local i = math.floor(math.log(bytes) / math.log(k)) + 1
    return string.format("%.2f %s", bytes / (k ^ (i - 1)), sizes[i])
end

local function getRelativeTime(date)
    local now = js.new(global.Date)
    local diffInSeconds = math.floor((now:getTime() - date:getTime()) / 1000)

    if diffInSeconds < 60 then
        return diffInSeconds .. " second" .. (diffInSeconds ~= 1 and "s" or "") .. " ago"
    end

    local diffInMinutes = math.floor(diffInSeconds / 60)
    if diffInMinutes < 60 then
        return diffInMinutes .. " minute" .. (diffInMinutes ~= 1 and "s" or "") .. " ago"
    end

    local diffInHours = math.floor(diffInMinutes / 60)
    if diffInHours < 24 then
        return diffInHours .. " hour" .. (diffInHours ~= 1 and "s" or "") .. " ago"
    end

    local diffInDays = math.floor(diffInHours / 24)
    if diffInDays < 30 then
        return diffInDays .. " day" .. (diffInDays ~= 1 and "s" or "") .. " ago"
    end

    local diffInMonths = math.floor(diffInDays / 30)
    if diffInMonths < 12 then
        return diffInMonths .. " month" .. (diffInMonths ~= 1 and "s" or "") .. " ago"
    end

    local diffInYears = math.floor(diffInMonths / 12)
    return diffInYears .. " year" .. (diffInYears ~= 1 and "s" or "") .. " ago"
end

local function formatDiscordTimestamp(date, format)
    local options = js.new(global.Object)

    if format == "t" then
        options.hour = "numeric"; options.minute = "numeric"; options.hour12 = true
    elseif format == "T" then
        options.hour = "numeric"; options.minute = "numeric"; options.second = "numeric"; options.hour12 = true
    elseif format == "d" then
        options.month = "2-digit"; options.day = "2-digit"; options.year = "numeric"
    elseif format == "D" then
        options.month = "long"; options.day = "numeric"; options.year = "numeric"
    elseif format == "f" then
        options.month = "long"; options.day = "numeric"; options.year = "numeric"
        options.hour = "numeric"; options.minute = "numeric"; options.hour12 = true
    elseif format == "F" then
        options.weekday = "long"; options.month = "long"; options.day = "numeric"; options.year = "numeric"
        options.hour = "numeric"; options.minute = "numeric"; options.hour12 = true
    elseif format == "R" then
        return getRelativeTime(date)
    else
        options.month = "long"; options.day = "numeric"; options.year = "numeric"
        options.hour = "numeric"; options.minute = "numeric"; options.hour12 = true
    end

    return date:toLocaleDateString("en-US", options)
end

local function formatDiscordMarkdown(text)
    if not text then return "" end

    text = text:gsub("<:(%w+):(%d+)>", ":%1:")

    text = text:gsub("<@!?(%d+)>", "@%1")
    text = text:gsub("<@&(%d+)>", "@&%1")
    text = text:gsub("<#(%d+)>", "#%1")

    local jsText = js.new(global.String, text)

    local function replace(pattern, replacement)
        local regex = js.new(global.RegExp, pattern, "g")
        local result = global.String.prototype.replace:call(jsText, regex, replacement)
        jsText = result
    end

    replace("```(\\w+)\\n([\\s\\S]*?)```", function(match, lang, content)
        return '<pre><code class="language-' .. lang .. ' break-words whitespace-pre-wrap">' .. escapeHTML(content) .. '</code></pre>'
    end)
    replace("```([\\s\\S]*?)```", function(match, content)
        return '<pre><code class="break-words whitespace-pre-wrap">' .. escapeHTML(content) .. '</code></pre>'
    end)
    replace("`([^`]+)`", function(match, content)
        return '<code class="break-words whitespace-pre-wrap">' .. escapeHTML(content) .. '</code>'
    end)

    replace("\\*\\*\\*([^*]+)\\*\\*\\*", "<strong><em>$1</em></strong>")
    replace("\\*\\*([^*]+)\\*\\*", "<strong>$1</strong>")
    replace("\\*([^*]+)\\*", "<em>$1</em>")
    replace("_([^_]+)_", "<em>$1</em>")
    replace("__(.*?)__", "<u>$1</u>")
    replace("~~(.*?)~~", "<s>$1</s>")
    replace("\\|\\|(.*?)\\|\\|", '<span class="spoiler">$1</span>')

    replace(">>>([\\s\\S]*)", '<blockquote class="break-words whitespace-pre-wrap">$1</blockquote>')
    replace("^> (.+)", '<blockquote class="break-words whitespace-pre-wrap">$1</blockquote>') 

    replace("^# (.*?)$", "<h1>$1</h1>")
    replace("^## (.*?)$", "<h2>$1</h2>")
    replace("^### (.*?)$", "<h3>$1</h3>")

    replace("^(?:- |\\* )(.*)", "<li>$1</li>")

    replace("(https?:\\/\\/[^\\s]+)", '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>')

    replace("\\n", "<br>")

    text = tostring(jsText)

    text = text:gsub("<t:(%d+):?(%w?)>", function(timestamp, format) 
        local date = js.new(global.Date, tonumber(timestamp) * 1000)
        return string.format('<span class="timestamp" title="%s">%s</span>', tostring(date:toISOString()), formatDiscordTimestamp(date, format))
    end)

    return text
end

local function formatTimestamp(timestamp)
    if not timestamp then return "Today at 00:00" end

    local date = js.new(global.Date, timestamp * 1000)
    local now = js.new(global.Date)

    local dateStr = date:toDateString()
    local nowStr = now:toDateString()
    local yesterday = js.new(global.Date, now:getTime() - 86400000)
    local yesterdayStr = yesterday:toDateString()

    local options = js.new(global.Object)
    options.hour = "2-digit"
    options.minute = "2-digit"
    options.hour12 = true
    local timeStr = date:toLocaleTimeString("en-US", options)

    if dateStr == nowStr then
        return "Today at " .. timeStr
    elseif dateStr == yesterdayStr then
        return "Yesterday at " .. timeStr
    else
         options = js.new(global.Object)
         options.month = "short"
         options.day = "numeric"
         local dayStr = date:toLocaleDateString("en-US", options)
         return dayStr .. " at " .. timeStr
    end
end

local function renderEmbed(embed)
    local borderColor = embed.color and string.format("#%06x", embed.color) or "#4f545c"

    local authorHtml = ""
    if embed.author then
        authorHtml = string.format([[
            <div class="embed-author">
                %s
                <span class="embed-author-name">%s</span>
            </div>
        ]], embed.author.icon_url and string.format('<img src="%s" class="embed-author-icon" />', embed.author.icon_url) or "", escapeHTML(embed.author.name))
    end

    local titleHtml = ""
    if embed.title then
        local content = escapeHTML(embed.title)
        if embed.url then
            content = string.format('<a href="%s" target="_blank" rel="noopener noreferrer" class="text-[#00aff4] hover:underline">%s</a>', embed.url, content)
        end
        titleHtml = string.format('<div class="embed-title">%s</div>', content)
    end

    local descriptionHtml = embed.description and string.format('<div class="embed-description">%s</div>', formatDiscordMarkdown(embed.description)) or ""

    local thumbnailHtml = embed.thumbnail and string.format('<div class="embed-thumbnail"><img src="%s" alt="Thumbnail" /></div>', embed.thumbnail.url) or ""

    local fieldsHtml = ""
    if embed.fields and #embed.fields > 0 then
        local fieldsContent = ""
        for _, field in ipairs(embed.fields) do
            fieldsContent = fieldsContent .. string.format([[
                <div class="embed-field %s">
                    <div class="embed-field-name">%s</div>
                    <div class="embed-field-value">%s</div>
                </div>
            ]], field.inline and "inline" or "", escapeHTML(field.name), formatDiscordMarkdown(field.value))
        end
        fieldsHtml = string.format('<div class="embed-fields">%s</div>', fieldsContent)
    end

    local imageHtml = embed.image and string.format('<div class="embed-image"><img src="%s" alt="Embed Image" /></div>', embed.image.url) or ""

    local footerHtml = ""
    if embed.footer then
        footerHtml = string.format([[
            <div class="embed-footer">
                %s
                <span>%s</span>
            </div>
        ]], embed.footer.icon_url and string.format('<img src="%s" class="embed-footer-icon" />', embed.footer.icon_url) or "", escapeHTML(embed.footer.text))
    end

    return string.format([[
        <div class="embed" style="border-left-color: %s">
            %s%s%s%s%s%s%s
        </div>
    ]], borderColor, authorHtml, titleHtml, descriptionHtml, fieldsHtml, imageHtml, thumbnailHtml, footerHtml)
end

local function renderAttachment(attachment)
    local contentType = attachment.content_type

    if contentType and contentType:find("image/") == 1 then
        return string.format([[
            <div class="attachment">
                <img src="%s" alt="%s" />
            </div>
        ]], attachment.proxy_url or attachment.url, escapeHTML(attachment.filename))
    elseif contentType and (contentType:find("video/mp4") == 1 or contentType:find("video/webm") == 1) then
        return string.format([[
             <div class="attachment">
                <video controls src="%s" class="max-w-full rounded-md"></video>
             </div>
        ]], attachment.proxy_url or attachment.url)
    elseif contentType and contentType:find("audio/") == 1 then
        return string.format([[
            <div class="attachment">
                <audio controls src="%s" class="w-full"></audio>
            </div>
        ]], attachment.proxy_url or attachment.url)
    end

    return string.format([[
        <div class="attachment-file">
            <div class="attachment-icon">
                <i class="fas fa-file"></i>
            </div>
            <div class="attachment-details">
                <div class="attachment-filename">%s</div>
                <div class="attachment-filesize">%s</div>
            </div>
            <a href="%s" target="_blank" rel="noopener noreferrer" class="attachment-download">
                <i class="fas fa-download"></i>
            </a>
        </div>
    ]], escapeHTML(attachment.filename), formatFileSize(attachment.size), attachment.url)
end

local function renderSticker(sticker)
    return string.format([[
        <div class="sticker">
            <img src="%s" alt="%s" title="%s" />
            <div class="sticker-name">%s</div>
        </div>
    ]], sticker.url, escapeHTML(sticker.name), escapeHTML(sticker.name), escapeHTML(sticker.name))
end

local function renderMessageGroup(group)
    local msgs = group.messages
    local first = msgs[1]

    local pfp = group.pfp or "https://cdn.discordapp.com/embed/avatars/0.png"

    local header = string.format([[
        <div class="message-header">
            <img src="%s" alt="%s's avatar" class="message-avatar" />
            <div class="flex items-center">
                <span class="message-author">%s</span>
                %s
                <span class="message-timestamp">%s</span>
            </div>
        </div>
    ]], pfp, group.author, escapeHTML(group.author), group.bot and '<span class="bot-tag">BOT</span>' or '', formatTimestamp(first.timestamp))

    local messagesHtml = ""
    for _, msg in ipairs(msgs) do
        local content = ""
        if msg.content then
            content = string.format('<div class="message-content">%s</div>', formatDiscordMarkdown(msg.content))
        end

        local embeds = ""
        if msg.embeds then
            for _, embed in ipairs(msg.embeds) do
                embeds = embeds .. renderEmbed(embed)
            end
        end

        local stickers = ""
        if msg.stickers then
            for _, sticker in ipairs(msg.stickers) do
                stickers = stickers .. renderSticker(sticker)
            end
        end

        local attachments = ""
        if msg.attachments then
            for _, att in ipairs(msg.attachments) do
                attachments = attachments .. renderAttachment(att)
            end
        end

        messagesHtml = messagesHtml .. content .. embeds .. stickers .. attachments
    end

    return string.format('<div class="message">%s%s</div>', header, messagesHtml)
end

local function renderDateDivider(dateObj)
    local options = js.new(global.Object)
    options.weekday = "long"
    options.month = "long"
    options.day = "numeric"
    options.year = "numeric"
    local dateStr = dateObj:toLocaleDateString("en-US", options)

    return string.format([[
      <div class="system-message">
        <div class="flex items-center justify-center">
          <div class="h-px bg-[#4f545c] flex-grow mr-4"></div>
          <span>%s</span>
          <div class="h-px bg-[#4f545c] flex-grow ml-4"></div>
        </div>
      </div>
    ]], dateStr)
end


local function renderTranscript(data)
    elements.guildIcon.src = data.guild.icon or "/images/icons/Ducky.svg"
    elements.guildName.textContent = data.guild.name
    elements.channelName.textContent = data.channel.name

    local messageGroups = {}
    local currentGroup = nil
    local currentAuthor = nil
    local currentDate = nil

    for _, msg in ipairs(data.messages) do
        local timestamp = msg.timestamp or (js.new(global.Date):getTime() / 1000)
        local msgDate = js.new(global.Date, timestamp * 1000)
        local dateStr = msgDate:toDateString()

        if dateStr ~= currentDate then
            table.insert(messageGroups, {type = "divider", date = msgDate})
            currentDate = dateStr
            currentAuthor = nil
        end

        if msg.author ~= currentAuthor then
            currentGroup = {
                type = "messages",
                author = msg.author,
                pfp = msg.pfp,
                bot = msg.bot,
                messages = {msg}
            }
            table.insert(messageGroups, currentGroup)
            currentAuthor = msg.author
        else
            table.insert(currentGroup.messages, msg)
        end
    end

    local html = ""
    for _, group in ipairs(messageGroups) do
        if group.type == "divider" then
            html = html .. renderDateDivider(group.date)
        else
            html = html .. renderMessageGroup(group)
        end
    end

    elements.messages.innerHTML = html
end

local currentDate = js.new(global.Date)
local options = js.new(global.Object)
options.weekday = "long"; options.year = "numeric"; options.month = "long"; options.day = "numeric"; 
options.hour = "2-digit"; options.minute = "2-digit"; options.timeZoneName = "short"
elements.transcriptDate.textContent = currentDate:toLocaleString("en-US", options)

local hash = window.location.hash
if hash and #hash > 1 then hash = hash:sub(2) end

local guildId, ticketId = nil, nil
if hash and hash ~= "" then
    local parts = utils.split(hash, "-")
    guildId = parts[1]
    ticketId = parts[2]
end

if not guildId or not ticketId then
    local saved = utils.cookie("lastTicket")
    if saved then
        local parts = utils.split(saved, "-")
        if not guildId then guildId = parts[1] end
        if not ticketId then ticketId = parts[2] end
    end
end

if not guildId or not ticketId then
    elements.loading.style.display = "none"
    elements.error.style.display = "block"
else
    utils.cookie("lastTicket", guildId .. "-" .. ticketId, 120)
    local token = utils.cookie("token")

    if not token or token == "" or token == "null" then
        utils.redirect("login?redirect=transcripts")
    else
        http.request(function(success, response)
            if success and response and response.data then
                elements.loading.style.display = "none"
                elements.transcript.style.display = "flex"
                renderTranscript(response.data)

                local blocks = document:querySelectorAll("pre code")
                for i=0, blocks.length-1 do
                    global.hljs:highlightElement(blocks[i])
                end

                local spoilers = document:querySelectorAll(".spoiler")
                for i=0, spoilers.length-1 do
                    spoilers[i]:addEventListener("click", function(e)
                        local target = e.target
                        target.classList:toggle("revealed")
                    end)
                end
            else
                console.error("Error fetching transcript:", response)
                elements.loading.style.display = "none"
                elements.error.style.display = "block"
            end
        end, "GET", string.format("https://api.duckybot.xyz/guilds/%s/transcripts/%s", guildId, ticketId), {["Token"] = token})
    end
end