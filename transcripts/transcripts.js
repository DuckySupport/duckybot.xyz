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
            // Extract the data from the response
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
            <p><strong>Guild:</strong> ${guild.name}</p>
            <p><strong>Channel:</strong> ${channel.name} (${channel.id})</p>
            <h3>Messages:</h3>
            <ul>
                ${messages.map(renderMessage).join("")}
            </ul>
        `;
  
        ticketDetailsElement.innerHTML = marked.parse(ticketInfo);
        
        // Initialize Prism.js for code highlighting after content is loaded
        Prism.highlightAll();
    }
  
    function formatDiscordMarkdown(text) {
        if (!text) return '';
        
        // Process code blocks first (```code```)
        let formattedText = text.replace(/```(\w+)?\n([\s\S]*?)```/g, function(match, language, code) {
            return `<pre><code class="language-${language || 'plaintext'}">${code.trim()}</code></pre>`;
        });
        
        // Process inline code (`code`)
        formattedText = formattedText.replace(/`([^`]+)`/g, '<code>$1</code>');
        
        // Process bold (**text**)
        formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // Process italic (*text* or _text_)
        formattedText = formattedText.replace(/\*(.*?)\*/g, '<em>$1</em>');
        formattedText = formattedText.replace(/_([^_]+)_/g, '<em>$1</em>');
        
        // Process underline (__text__)
        formattedText = formattedText.replace(/__(.*?)__/g, '<u>$1</u>');
        
        // Process strikethrough (~~text~~)
        formattedText = formattedText.replace(/~~(.*?)~~/g, '<s>$1</s>');
        
        // Process spoilers (||text||)
        formattedText = formattedText.replace(/\|\|(.*?)\|\|/g, '<span class="spoiler">$1</span>');
        
        // Process newlines
        formattedText = formattedText.replace(/\n/g, '<br>');
        
        // Process custom emojis
        formattedText = formattedText.replace(/<:([^:]+):(\d+)>/g, '<img src="https://cdn.discordapp.com/emojis/$2.png" alt="$1" class="emoji" />');
        
        // Process mentions
        formattedText = formattedText.replace(/@([a-zA-Z0-9_]+)/g, '<span class="mention">@$1</span>');
        
        return formattedText;
    }
  
    function renderMessage(msg) {
        const { author, content, pfp, embeds = [], stickers = [], attachments = [] } = msg;
  
        const authorTable = `
            <table class="author-table">
                <tr>
                    <td>
                        <img src="${pfp}" alt="${author}'s avatar" class="author-pfp" />
                    </td>
                    <td>
                        <strong>${author}</strong>
                    </td>
                </tr>
            </table>
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
            <li class="message">
                ${authorTable}
                <div class="message-content">
                    ${content ? formatDiscordMarkdown(content) : ""}
                    ${embedHtml}
                    ${stickerHtml}
                    ${attachmentHtml}
                </div>
            </li>
        `;
    }
  
    function renderEmbed(embed) {
        const { title, description, url, fields = [], image, footer, color, author } = embed;
        
        // Convert Discord color integer to hex
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
