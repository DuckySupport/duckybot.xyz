document.addEventListener("DOMContentLoaded", () => {
    const loadingElement = document.getElementById("loading");
    const transcriptElement = document.getElementById("transcript");
    const ticketDetailsElement = document.getElementById("ticket-details");
    const errorElement = document.getElementById("error");
  
    const hash = window.location.hash.substring(1); 
    const [guildId, ticketId] = hash.split("-");
  
    if (!guildId || !ticketId) {
        loadingElement.style.display = "none";
        errorElement.style.display = "block";
        return;
    }
  
    const apiUrl = `https://api.duckybot.xyz/transcripts/${guildId}/${ticketId}`;
  
    fetch(apiUrl, {
        method: "GET",
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then((response) => {
            loadingElement.style.display = "none";
            const data = response.data;
            renderTranscript(data);
        })
        .catch((error) => {
            console.error("Error fetching transcript:", error);
            loadingElement.style.display = "none";
            errorElement.style.display = "block";
        });
  
    function renderTranscript(data) {
        transcriptElement.style.display = "block";
  
        const { guild, channel, messages } = data;
  
        const ticketInfo = `
            <div class="ticket-header">
                <p><strong>Guild:</strong> ${guild.name}</p>
                <p><strong>Channel:</strong> ${channel.name} (${channel.id})</p>
            </div>
            <h3>Messages:</h3>
            <div class="messages-container">
                ${messages.map(renderMessage).join("")}
            </div>
        `;
  
        ticketDetailsElement.innerHTML = ticketInfo;
        
        Prism.highlightAll();
    }
  
    function formatDiscordMarkdown(text) {
        if (!text) return '';
        
        // codeblock (```code```)
        let formattedText = text.replace(/```(\w+)?\n([\s\S]*?)```/g, function(match, language, code) {
            return `<pre><code class="language-${language || 'plaintext'}">${code.trim()}</code></pre>`;
        });
        
        // code (`code`)
        formattedText = formattedText.replace(/`([^`]+)`/g, '<code>$1</code>');
        
        // bold (**text**)
        formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // Process italic (*text* or _text_)
        formattedText = formattedText.replace(/\*(.*?)\*/g, '<em>$1</em>');
        formattedText = formattedText.replace(/_([^_]+)_/g, '<em>$1</em>');
        
        // underline (__text__)
        formattedText = formattedText.replace(/__(.*?)__/g, '<u>$1</u>');
        
        // strikethrough (~~text~~)
        formattedText = formattedText.replace(/~~(.*?)~~/g, '<s>$1</s>');
        
        // spoilers (||text||)
        formattedText = formattedText.replace(/\|\|(.*?)\|\|/g, '<span class="spoiler">$1</span>');
        
        // newlines
        formattedText = formattedText.replace(/\n/g, '<br>');
        
        // emojis
        formattedText = formattedText.replace(/<:([^:]+):(\d+)>/g, '<img src="https://cdn.discordapp.com/emojis/$2.png" alt="$1" class="emoji" />');
        
        // mentions
        formattedText = formattedText.replace(/@([a-zA-Z0-9_]+)/g, '<span class="mention">@$1</span>');
        
        return formattedText;
    }
  
    function renderMessage(msg) {
        const { author, content, pfp, embeds = [], stickers = [], attachments = [] } = msg;
  
        const authorTable = `
            <div class="message-header">
                <img src="${pfp}" alt="${author}'s avatar" class="author-pfp" />
                <strong class="author-name">${author}</strong>
            </div>
        `;
  
        const embedHtml = embeds.map((embed) => renderEmbed(embed)).join("");
  
        const stickerHtml =
            stickers && stickers.length > 0
                ? `
            <div class="sticker">
                <img src="${stickers[0].url}" alt="${stickers[0].name}" title="${stickers[0].name}" style="max-width: 100px;"/>
                <p>${stickers[0].name}</p>
            </div>`
                : "";
  
        const attachmentHtml = attachments && attachments.length > 0
            ? attachments
                .map(
                    (attachment) => `
                <div class="attachment">
                    <p><strong>File:</strong> <a href="${attachment.url}" target="_blank">${attachment.filename}</a></p>
                    ${
                        attachment.content_type?.startsWith("image/")
                            ? `<img src="${attachment.proxy_url}" alt="${attachment.filename}" style="max-width: 300px;"/>`
                            : ""
                    }
                </div>`
                )
                .join("")
            : "";
  
        return `
            <div class="message">
                ${authorTable}
                <div class="message-content">
                    ${content ? formatDiscordMarkdown(content) : ""}
                    ${embedHtml}
                    ${stickerHtml}
                    ${attachmentHtml}
                </div>
            </div>
        `;
    }
  
    function renderEmbed(embed) {
        const { title, description, url, fields = [], image, footer, color, author } = embed;
        
        // discord color --> hex
        const colorHex = color ? `#${color.toString(16).padStart(6, '0')}` : '#2f3136';
        
        const authorHtml = author ? `
            <div class="embed-author">
                ${author.icon_url ? `<img src="${author.icon_url}" alt="${author.name}" class="embed-author-icon" />` : ''}
                <span>${author.name}</span>
            </div>
        ` : '';

        const fieldsHtml = fields
            .map(
                (field) => `
            <div class="embed-field">
                <strong>${formatDiscordMarkdown(field.name)}</strong>
                <div>${formatDiscordMarkdown(field.value)}</div>
            </div>`
            )
            .join("");
  
        return `
            <div class="embed" style="border-left: 4px solid ${colorHex}">
                ${authorHtml}
                ${title ? `<h4>${url ? `<a href="${url}">${formatDiscordMarkdown(title)}</a>` : formatDiscordMarkdown(title)}</h4>` : ""}
                ${description ? `<div class="embed-description">${formatDiscordMarkdown(description)}</div>` : ""}
                ${fieldsHtml}
                ${
                    image
                        ? `<div class="embed-image"><img src="${image.url}" alt="Embed Image" style="max-width: 100%; max-height: 300px;"/></div>`
                        : ""
                }
                ${footer ? `<p class="embed-footer">${formatDiscordMarkdown(footer.text)}</p>` : ""}
            </div>
        `;
    }
});
