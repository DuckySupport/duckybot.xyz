document.addEventListener("DOMContentLoaded", () => {
    const loadingElement = document.getElementById("loading");
    const transcriptElement = document.getElementById("transcript");
    const messagesElement = document.getElementById("messages");
    const guildIconElement = document.getElementById("guild-icon");
    const guildNameElement = document.getElementById("guild-name");
    const channelNameElement = document.getElementById("channel-name");
    const errorElement = document.getElementById("error");
  
    const hash = window.location.hash.substring(1); 
    const [guildId, ticketId] = hash.split("-");

    const token = document.cookie.match(/discord=([^;]+)/)?.[1];
    
    if (!token) {
        window.location.href = `/login?redirect=${window.location.pathname}/${window.location.hash}`;
        return;
    }
    
    if (!guildId || !ticketId) {
        loadingElement.style.display = "none";
        errorElement.style.display = "block";
        return;
    }
  
    fetch(`https://api.duckybot.xyz/guilds/${guildId}/transcripts/${ticketId}`, {
        method: "GET",
        headers: {
            "Discord-Code": token
        }
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then((response) => {
            const data = response.data;
            loadingElement.style.display = "none";
            renderTranscript(data);
        })
        .catch((error) => {
            console.error("Error fetching transcript:", error);
            loadingElement.style.display = "none";
            errorElement.style.display = "block";
            errorElement.textContent = error.message;
        });
  
    function renderTranscript(data) {
        transcriptElement.style.display = "block";
  
        const { guild, channel, messages } = data;
        
        guildIconElement.src = guild.icon;
        guildNameElement.textContent = guild.name;
        channelNameElement.textContent = `#${channel.name}`;
  
        messagesElement.innerHTML = messages.map(renderMessage).join("");
    }
  
    function formatDiscordMarkdown(text) {
        if (!text) return text ? text.replace(/\u00A0/g, ' ').replace(/&nbsp;/g, ' ').trim()
            .replace(/(\w+)?\n([\s\S]*?)/g, '<pre><code class="language-$1 break-words whitespace-pre-wrap">$2</code></pre>')
            .replace(/`([^`]+)`/g, '<code class="break-words whitespace-pre-wrap">$1</code>')
            .replace(/\*\*\*([^*]+)\*\*\*/g, '<strong><em>$1</em></strong>')
            .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
            .replace(/\*([^*]+)\*/g, '<em>$1</em>')
            .replace(/_([^_]+)_/g, '<em>$1</em>')
            .replace(/__(.*?)__/g, '<u>$1</u>')
            .replace(/~~(.*?)~~/, '<s>$1</s>')
            .replace(/\|\|(.*?)\|\|/g, '<span class="spoiler">$1</span>')
            .replace(/^# (.*?)$/gm, '<h1>$1</h1>')
            .replace(/^## (.*?)$/gm, '<h2>$1</h2>')
            .replace(/^### (.*?)$/gm, '<h3>$1</h3>')
            .replace(/<:(\w+):(\d+)>/g, '<img src="https://cdn.discordapp.com/emojis/$2.png" alt="$1" class="discord-emoji">')
            .replace(/^(?:>|- |)-# (.*)$/gm, '<span style="opacity: 0.6; font-size: small;">$1</span>')
            .replace(/^(?:- |\* )(.*)/gm, '<li>$1</li>')
            .replace(/^(?:&nbsp; - |&nbsp; \* )(.*)/gm, '<li class="indent">$1</li>')
            .replace(/^(?:\d+\. )(.*)/gm, '<li class="numbered">$1</li>')
            .replace(/^> (.+)/gm, '<blockquote class="break-words whitespace-pre-wrap">$1</blockquote>')
            .replace(/\n/g, '<br>') : "";
    }
  
    function renderMessage(msg) {
        const { author, content, pfp, embeds = [], stickers = [], attachments = [] } = msg;
  
        const messageHeader = `
            <div class="flex items-center gap-2 mb-2">
                <img src="${pfp}" alt="${author}'s avatar" class="w-8 h-8 rounded-full" />
                <strong class="text-[#F5FF82]">${author}</strong>
            </div>
        `;
  
        const embedHtml = embeds.map((embed) => renderEmbed(embed)).join("");
  
        const stickerHtml = stickers.map(sticker => `
            <div class="sticker mt-2">
                <img src="${sticker.url}" alt="${sticker.name}" title="${sticker.name}" class="max-w-[100px]"/>
                <p class="text-sm text-gray-400">${sticker.name}</p>
            </div>
        `).join("");
  
        const attachmentHtml = attachments.map(attachment => `
            <div class="attachment">
                ${
                    attachment.content_type?.startsWith("image/")
                        ? `<img src="${attachment.proxy_url}" alt="${attachment.filename}" />`
                        : `<p><strong>File:</strong> <a href="${attachment.url}" target="_blank" class="text-[#F5FF82]">${attachment.filename}</a></p>`
                }
            </div>
        `).join("");
  
        return `
            <div class="message">
                ${messageHeader}
                ${content ? `<p class="mb-2 break-words whitespace-pre-wrap">${formatDiscordMarkdown(content)}</p>` : ""}
                ${embedHtml}
                ${stickerHtml}
                ${attachmentHtml}
            </div>
        `;
    }
  
    function renderEmbed(embed) {
        const { title, description, url, fields = [], image, footer, color, author } = embed;
  
        const authorHtml = author ? `
            <div class="flex items-center gap-2 mb-2">
                ${author.icon_url ? `<img src="${author.icon_url}" class="w-6 h-6 rounded-full" />` : ''}
                <span class="font-semibold">${author.name}</span>
            </div>
        ` : '';
  
        const fieldsHtml = fields.map(field => `
            <div class="embed-field mb-2">
                <strong>${field.name}</strong>
                <div class="break-words whitespace-pre-wrap">${formatDiscordMarkdown(field.value)}</div>
            </div>
        `).join("");
  
        return `
            <div class="embed" style="${color ? `border-color: #${color.toString(16).padStart(6, '0')}` : ''}">
                ${authorHtml}
                ${title ? `<h4 class="font-bold mb-2">${title}</h4>` : ""}
                ${description ? `<div class="mb-2 break-words whitespace-pre-wrap">${formatDiscordMarkdown(description)}</div>` : ""}
                ${fieldsHtml}
                ${image ? `<div class="embed-image mt-2"><img src="${image.url}" alt="Embed Image" /></div>` : ""}
                ${footer ? `<p class="text-sm text-gray-400 mt-2 break-words whitespace-pre-wrap">${formatDiscordMarkdown(footer.text)}</p>` : ""}
            </div>
        `;
    }
});
