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
            const data = response.data;
            loadingElement.style.display = "none";
  
            renderTranscript(data);
        })
        .catch((error) => {
            console.error("Error fetching transcript:", error);
            loadingElement.style.display = "none";
            errorElement.style.display = "block";
        });
  
    function renderTranscript(data) {
        transcriptElement.style.display = "block";
  
        const { guildName, messages } = data;
  
        const ticketInfo = `
            <p><strong>Guild:</strong> ${guildName}</p>
            <h3>Messages:</h3>
            <ul>
                ${messages.map(renderMessage).join("")}
            </ul>
        `;
  
        ticketDetailsElement.innerHTML = marked(ticketInfo);
    }
  
    function formatDiscordMarkdown(text) {
        return text
        .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>')
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/_([^_]+)_/g, '<em>$1</em>')
        .replace(/__(.*?)__/g, '<u>$1</u>')
        .replace(/~~(.*?)~~/, '<s>$1</s>')
        .replace(/\|\|(.*?)\|\|/g, '<span class="spoiler">$1</span>')
        .replace(/\n/g, '<br>');
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
            stickers.length > 0
                ? `
            <div class="sticker">
                <img src="${stickers[0].url}" alt="${stickers[0].name}" title="${stickers[0].name}" style="max-width: 100px;"/>
                <p>${stickers[0].name}</p>
            </div>`
                : "";
  
        const attachmentHtml = attachments
            .map(
                (attachment) => `
            <div class="attachment">
                <p><strong>File:</strong> <a href="${attachment.url}" target="_blank">${attachment.filename}</a></p>
                ${
                    attachment.content_type.startsWith("image/")
                        ? `<img src="${attachment.proxy_url}" alt="${attachment.filename}" style="max-width: 200px;"/>`
                        : ""
                }
            </div>`
            )
            .join("");
  
        return `
            <li>
                ${authorTable}
                <p>${content ? formatDiscordMarkdown(content) : ""}</p>
                ${embedHtml}
                ${stickerHtml}
                ${attachmentHtml}
            </li>
        `;
    }
  
    function renderEmbed(embed) {
        const { title, description, url, fields = [], image, footer } = embed;
  
        const fieldsHtml = fields
            .map(
                (field) => `
            <div class="embed-field">
                <strong>${field.name}</strong>: ${formatDiscordMarkdown(field.value)}
            </div>`
            )
            .join("");
  
        return `
            <div class="embed">
                ${title ? `<h4><a href="${url || '#'}">${title}</a></h4>` : ""}
                ${description ? `<p>${formatDiscordMarkdown(description)}</p>` : ""}
                ${fieldsHtml}
                ${
                    image
                        ? `<div class="embed-image"><img src="${image.url}" alt="Embed Image" style="max-width: 300px;"/></div>`
                        : ""
                }
                ${footer ? `<p class="embed-footer">${formatDiscordMarkdown(footer.text)}</p>` : ""}
            </div>
        `;
    }
  });
