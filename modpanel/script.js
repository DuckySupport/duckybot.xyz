const loadingOverlay = document.getElementById('loadingOverlay');
    const serverGrid = document.getElementById('serverGrid');
    const serverSelectionView = document.getElementById('serverSelectionView');
    const moderationPanelView = document.getElementById('moderationPanelView');
    const backToServersBtn = document.getElementById('backToServersBtn');
    const punishmentsTabBtn = document.getElementById('punishmentsTabBtn');
    const shiftsTabBtn = document.getElementById('shiftsTabBtn');
    const erlcTabBtn = document.getElementById('erlcTabBtn');
    const automationsTabBtn = document.getElementById('automationsTabBtn');
    const punishmentsTab = document.getElementById('punishmentsTab');
    const shiftsTab = document.getElementById('shiftsTab');
    const erlcTab = document.getElementById('erlcTab');
    const automationsTab = document.getElementById('automationsTab');
    const punishmentForm = document.getElementById('punishmentForm');
    const punishmentType = document.getElementById('punishmentType');
    const durationContainer = document.getElementById('durationContainer');
    const punishmentHistory = document.getElementById('punishmentHistory');
    const activeShifts = document.getElementById('activeShifts');
    const recentShifts = document.getElementById('recentShifts');
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    const menuBtn = document.getElementById('menuBtn');
    const closeMenuBtn = document.getElementById('closeMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    const confirmationModal = document.getElementById('confirmationModal');
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
    const confirmationMessage = document.getElementById('confirmationMessage');
    const startShiftBtn = document.getElementById('startShiftBtn');
    const pauseShiftBtn = document.getElementById('pauseShiftBtn');
    const endShiftBtn = document.getElementById('endShiftBtn');
    const shiftType = document.getElementById('shiftType');
    const shiftStatusIndicator = document.getElementById('shiftStatusIndicator');
    const shiftStatusText = document.getElementById('shiftStatusText');
    const shiftTimer = document.getElementById('shiftTimer');
    const recentUserShifts = document.getElementById('recentUserShifts');
    const runDiscordCheckBtn = document.getElementById('runDiscordCheckBtn');
    const discordCheckResults = document.getElementById('discordCheckResults');
    const discordCheckList = document.getElementById('discordCheckList');
    const erlcServerInfo = document.getElementById('erlcServerInfo');
    const erlcPlayersList = document.getElementById('erlcPlayersList');
    const boloForm = document.getElementById('boloForm');
    const activeBOLOs = document.getElementById('activeBOLOs');
    const commandForm = document.getElementById('commandForm');
    
    const punishmentTypeSelected = document.getElementById('punishmentTypeSelected');
    const punishmentTypeOptions = document.getElementById('punishmentTypeOptions');
    const durationUnitSelected = document.getElementById('durationUnitSelected');
    const durationUnitOptions = document.getElementById('durationUnitOptions');
    const durationUnit = document.getElementById('durationUnit');
    const shiftTypeSelected = document.getElementById('shiftTypeSelected');
    const shiftTypeOptions = document.getElementById('shiftTypeOptions');

    const discordCheckCooldown = document.getElementById('discordCheckCooldown');
    const discordCheckCooldownTime = document.getElementById('discordCheckCooldownTime');
    const automationSelected = document.getElementById('automationSelected');
    const automationOptions = document.getElementById('automationOptions');
    const selectedAutomationId = document.getElementById('selectedAutomationId');
    const runAutomationBtn = document.getElementById('runAutomationBtn');
    const automationDetails = document.getElementById('automationDetails');
    const automationTrigger = document.getElementById('automationTrigger');
    const automationActions = document.getElementById('automationActions');
    const automationRole = document.getElementById('automationRole');
    const automationRoleContainer = document.getElementById('automationRoleContainer');
    const automationAuthor = document.getElementById('automationAuthor');

    let selectedServerId = null;
    let selectedServerConfig = null;
    let userCache = new Map();
    let avatarCache = new Map();
    let discordToken = null;
    let discordUser = null;
    let lastPunishmentTime = 0;
    const PUNISHMENT_COOLDOWN = 5000;
    
    let shiftStatus = 'inactive';
    let shiftStartTime = 0;
    let shiftElapsedTime = 0;
    let shiftTimerInterval = null;
    let currentPunishmentToDelete = null;
    let currentUserShift = null;

    let discordCheckCooldowns = {};
    const DISCORD_CHECK_COOLDOWN = 5 * 60 * 1000; 

    let serverAutomations = [];
    let currentTab = 'punishments'; 

    function updateDiscordCheckCooldown() {
        if (!selectedServerId || !discordCheckCooldowns[selectedServerId]) {
            discordCheckCooldown.classList.add('hidden');
            return;
        }
        
        const cooldownEnd = discordCheckCooldowns[selectedServerId];
        const now = Date.now();
        const timeLeft = cooldownEnd - now;
        
        if (timeLeft <= 0) {
            discordCheckCooldown.classList.add('hidden');
            runDiscordCheckBtn.disabled = false;
            return;
        }
        
        const minutes = Math.floor(timeLeft / 60000);
        const seconds = Math.floor((timeLeft % 60000) / 1000);
        discordCheckCooldownTime.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        discordCheckCooldown.classList.remove('hidden');
        runDiscordCheckBtn.disabled = true;
        
        setTimeout(updateDiscordCheckCooldown, 1000);
    }

    function setupAutomationsDropdown(automations) {
        serverAutomations = automations || [];
        automationOptions.innerHTML = '';
        
        if (!automations || automations.length === 0) {
            const option = document.createElement('div');
            option.className = 'dropdown-option';
            option.textContent = 'No automations available';
            automationOptions.appendChild(option);
            runAutomationBtn.disabled = true;
            return;
        }
        
        const manualAutomations = automations.filter(automation => 
            automation.trigger && automation.trigger.value === 'manual'
        );
        
        if (manualAutomations.length === 0) {
            const option = document.createElement('div');
            option.className = 'dropdown-option';
            option.textContent = 'No manual automations available';
            automationOptions.appendChild(option);
            runAutomationBtn.disabled = true;
            return;
        }
        
        manualAutomations.forEach((automation, index) => {
            const option = document.createElement('div');
            option.className = 'dropdown-option';
            const originalIndex = automations.findIndex(a => a.name === automation.name);
            option.dataset.index = originalIndex;
            option.textContent = automation.name;
            
            option.addEventListener('click', () => {
                selectedAutomationId.value = originalIndex;
                automationSelected.querySelector('span').textContent = automation.name;
                
                document.querySelectorAll('#automationOptions .dropdown-option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                option.classList.add('selected');
                
                automationSelected.classList.remove('active');
                automationOptions.classList.remove('active');
                
                showAutomationDetails(automation);
                runAutomationBtn.disabled = false;
            });
            
            automationOptions.appendChild(option);
        });
    }

    function showAutomationDetails(automation) {
        automationTrigger.textContent = automation.trigger ? automation.trigger.name : 'Unknown';
        
        automationActions.innerHTML = '';
        if (automation.actions && automation.actions.length > 0) {
            const actionsList = document.createElement('ul');
            actionsList.className = 'list-disc pl-5';
            
            automation.actions.forEach(action => {
                const actionItem = document.createElement('li');
                actionItem.textContent = action.name;
                actionsList.appendChild(actionItem);
            });
            
            automationActions.appendChild(actionsList);
        } else {
            automationActions.textContent = 'No actions defined';
        }
        
        if (automation.role) {
            automationRole.textContent = `<@&${automation.role}>`;
            automationRoleContainer.classList.remove('hidden');
        } else {
            automationRoleContainer.classList.add('hidden');
        }
        
        if (automation.author) {
            fetchUserData(automation.author).then(userData => {
                automationAuthor.textContent = userData.username || userData.name || automation.author;
            });
        } else {
            automationAuthor.textContent = 'Unknown';
        }
        
        automationDetails.classList.remove('hidden');
    }

    async function runAutomation() {
        if (!discordToken || !selectedServerId || selectedAutomationId.value === '') {
            showToast('Please select an automation to run', 'error');
            return;
        }
        
        const automationIndex = parseInt(selectedAutomationId.value);
        if (isNaN(automationIndex) || automationIndex < 0 || automationIndex >= serverAutomations.length) {
            showToast('Invalid automation selected', 'error');
            return;
        }
        
        const automation = serverAutomations[automationIndex];
        if (!automation) {
            showToast('Invalid automation selected', 'error');
            return;
        }
        
        try {
            runAutomationBtn.disabled = true;
            runAutomationBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Running...';
            
            const response = await fetch(`https://api.duckybot.xyz/guilds/${selectedServerId}/automations/${automationIndex}`, {
                method: 'POST',
                headers: {
                    'Discord-Code': discordToken
                }
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to run automation');
            }
            
            showToast(`Successfully ran automation: ${automation.name}`);
            
        } catch (error) {
            showToast('Failed to run automation: ' + error.message, 'error');
        } finally {
            runAutomationBtn.disabled = false;
            runAutomationBtn.innerHTML = 'Run Automation';
        }
    }

    function initDropdowns() {
        punishmentTypeSelected.addEventListener('click', () => {
            punishmentTypeSelected.classList.toggle('active');
            punishmentTypeOptions.classList.toggle('active');
        });
        
        durationUnitSelected.addEventListener('click', () => {
            durationUnitSelected.classList.toggle('active');
            durationUnitOptions.classList.toggle('active');
        });
        
        document.querySelectorAll('#durationUnitOptions .dropdown-option').forEach(option => {
            option.addEventListener('click', () => {
                const value = option.dataset.value;
                durationUnit.value = value;
                durationUnitSelected.querySelector('span').textContent = option.textContent;
                
                document.querySelectorAll('#durationUnitOptions .dropdown-option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                option.classList.add('selected');
                
                durationUnitSelected.classList.remove('active');
                durationUnitOptions.classList.remove('active');
            });
        });
        
        shiftTypeSelected.addEventListener('click', () => {
            shiftTypeSelected.classList.toggle('active');
            shiftTypeOptions.classList.toggle('active');
        });
        
        automationSelected.addEventListener('click', () => {
            automationSelected.classList.toggle('active');
            automationOptions.classList.toggle('active');
        });
        
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.custom-dropdown')) {
                document.querySelectorAll('.dropdown-options').forEach(dropdown => {
                    dropdown.classList.remove('active');
                });
                document.querySelectorAll('.dropdown-selected').forEach(selected => {
                    selected.classList.remove('active');
                });
            }
        });
    }

    function getCookie(name) {
        let value = `; ${document.cookie}`;
        let parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    }

    function formatDuration(seconds) {
        if (seconds < 60) return `${seconds} second${seconds !== 1 ? 's' : ''}`;
        
        const months = Math.floor(seconds / (30 * 24 * 3600));
        const remainingAfterMonths = seconds % (30 * 24 * 3600);
        const weeks = Math.floor(remainingAfterMonths / (7 * 24 * 3600));
        const remainingAfterWeeks = remainingAfterMonths % (7 * 24 * 3600);
        const hours = Math.floor(remainingAfterWeeks / 3600);
        const remainingAfterHours = remainingAfterWeeks % 3600;
        const minutes = Math.floor(remainingAfterHours / 60);
        const secs = remainingAfterHours % 60;
        
        let durationString = '';
        if (months > 0) durationString += `${months} month${months !== 1 ? 's' : ''}`;
        if (weeks > 0) durationString += `${durationString ? ', ' : ''}${weeks} week${weeks !== 1 ? 's' : ''}`;
        if (hours > 0) durationString += `${durationString ? ', ' : ''}${hours} hour${hours !== 1 ? 's' : ''}`;
        if (minutes > 0) durationString += `${durationString ? ', ' : ''}${minutes} minute${minutes !== 1 ? 's' : ''}`;
        if (secs > 0 || (months === 0 && weeks === 0 && hours === 0 && minutes === 0)) {
            durationString += `${durationString ? ', ' : ''}${secs} second${secs !== 1 ? 's' : ''}`;
        }
        return durationString.trim();
    }

    function formatShiftDuration(ms) {
        const totalSeconds = Math.floor(ms / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    function showToast(message, type = 'success') {
        toastMessage.textContent = message;
        toast.className = `toast show ${type}`;
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    async function fetchUserData(userId) {
        if (userCache.has(userId)) {
            return userCache.get(userId);
        }
        try {
            const response = await fetch(`https://api.duckybot.xyz/users/${userId}`);
            if (!response.ok) throw new Error('User not found');
            const data = await response.json();
            userCache.set(userId, data);
            return data;
        } catch (error) {
            return { name: 'Unknown User', id: userId };
        }
    }

    async function getRobloxAvatar(userId) {
        if (avatarCache.has(userId)) {
            return avatarCache.get(userId);
        }
        try {
            const response = await fetch(`https://api.duckybot.xyz/roblox/avatar/${userId}`);
            if (!response.ok) throw new Error('Avatar not found');
            const data = await response.json();
            const avatarUrl = data.avatarUrl;
            avatarCache.set(userId, avatarUrl);
            return avatarUrl;
        } catch (error) {
            return 'https://duckybot.xyz/images/icons/Ducky.svg';
        }
    }

    async function getRobloxUser(username) {
        try {
            const response = await fetch(`https://api.duckybot.xyz/roblox/user/${username}`);
            if (!response.ok) throw new Error('User not found');
            return await response.json();
        } catch (error) {
            return null;
        }
    }

    function showLoading(view) {
        if (view === 'servers') {
            serverGrid.innerHTML = `
                <div class="col-span-full text-center py-4">
                    <div class="spinner mx-auto mb-2"></div>
                    <p class="text-gray-400">Loading servers...</p>
                </div>
            `;
        } else if (view === 'punishments') {
            punishmentHistory.innerHTML = `
                <div class="text-center py-4">
                    <div class="spinner mx-auto mb-2"></div>
                    <p class="text-gray-400">Loading punishment history...</p>
                </div>
            `;
        } else if (view === 'activeShifts') {
            activeShifts.innerHTML = `
                <div class="text-center py-4 col-span-full">
                    <div class="spinner mx-auto mb-2"></div>
                    <p class="text-gray-400">Loading active shifts...</p>
                </div>
            `;
        } else if (view === 'recentShifts') {
            recentShifts.innerHTML = `
                <div class="text-center py-4">
                    <div class="spinner mx-auto mb-2"></div>
                    <p class="text-gray-400">Loading recent shifts...</p>
                </div>
            `;
        } else if (view === 'userShifts') {
            recentUserShifts.innerHTML = `
                <div class="text-center py-4">
                    <div class="spinner mx-auto mb-2"></div>
                    <p class="text-gray-400">Loading your shifts...</p>
                </div>
            `;
        } else if (view === 'erlcInfo') {
            erlcServerInfo.innerHTML = `
                <div class="text-center py-4 col-span-full">
                    <div class="spinner mx-auto mb-2"></div>
                    <p class="text-gray-400">Loading server information...</p>
                </div>
            `;
        } else if (view === 'erlcPlayers') {
            erlcPlayersList.innerHTML = `
                <div class="text-center py-4 col-span-full">
                    <div class="spinner mx-auto mb-2"></div>
                    <p class="text-gray-400">Loading players...</p>
                </div>
            `;
        }
    }

    function switchTab(tab) {
        currentTab = tab;
        [punishmentsTabBtn, shiftsTabBtn, erlcTabBtn, automationsTabBtn].forEach(btn => btn.classList.remove('active'));
        [punishmentsTab, shiftsTab, erlcTab, automationsTab].forEach(t => t.classList.add('hidden'));

        if (tab === 'punishments') {
            punishmentsTabBtn.classList.add('active');
            punishmentsTab.classList.remove('hidden');
            loadPunishmentHistory();
        } else if (tab === 'shifts') {
            shiftsTabBtn.classList.add('active');
            shiftsTab.classList.remove('hidden');
            loadShiftData();
        } else if (tab === 'erlc') {
            erlcTabBtn.classList.add('active');
            erlcTab.classList.remove('hidden');
            loadErlcData();
        } else if (tab === 'automations') {
            automationsTabBtn.classList.add('active');
            automationsTab.classList.remove('hidden');
            loadAutomations();
        }
    }

    async function loadServers() {
        showLoading('servers');
        try {
            const response = await fetch('https://api.duckybot.xyz/users/@me/guilds', {
                headers: { 'Discord-Code': discordToken }
            });
            if (!response.ok) throw new Error('Failed to fetch servers');
            const servers = await response.json();

            serverGrid.innerHTML = '';
            if (servers.length === 0) {
                serverGrid.innerHTML = '<p class="text-gray-400 col-span-full text-center">No servers found where you have moderation permissions.</p>';
                return;
            }

            servers.forEach(server => {
                const serverCard = document.createElement('div');
                serverCard.className = 'server-card';
                serverCard.onclick = () => selectServer(server.id);
                serverCard.innerHTML = `
                    <img src="${server.icon ? `https://cdn.discordapp.com/icons/${server.id}/${server.icon}.png` : 'https://duckybot.xyz/images/icons/Ducky.svg'}" alt="${server.name}">
                    <span class="text-sm font-medium text-center">${server.name}</span>
                `;
                serverGrid.appendChild(serverCard);
            });
        } catch (error) {
            serverGrid.innerHTML = `<p class="text-red-400 col-span-full text-center">Error: ${error.message}</p>`;
        }
    }

    async function selectServer(serverId) {
        selectedServerId = serverId;
        serverSelectionView.classList.remove('opacity-100');
        serverSelectionView.classList.add('opacity-0');
        setTimeout(() => {
            serverSelectionView.classList.add('hidden');
            moderationPanelView.classList.remove('hidden');
            moderationPanelView.classList.add('opacity-100');
        }, 300);

        try {
            const response = await fetch(`https://api.duckybot.xyz/guilds/${serverId}`,
            {
                headers: { 'Discord-Code': discordToken }
            });
            if (!response.ok) throw new Error('Failed to fetch server config');
            selectedServerConfig = await response.json();

            document.getElementById('serverName').textContent = selectedServerConfig.name;
            document.getElementById('serverIcon').src = selectedServerConfig.icon ? `https://cdn.discordapp.com/icons/${serverId}/${selectedServerConfig.icon}.png` : 'https://duckybot.xyz/images/icons/Ducky.svg';

            setupPunishmentTypes(selectedServerConfig.punishments);
            setupShiftTypes(selectedServerConfig.shifts?.types);
            setupAutomationsDropdown(selectedServerConfig.automations);

            switchTab('punishments');
        } catch (error) {
            showToast('Error loading server configuration: ' + error.message, 'error');
            backToServers();
        }
    }

    function backToServers() {
        selectedServerId = null;
        selectedServerConfig = null;
        moderationPanelView.classList.remove('opacity-100');
        moderationPanelView.classList.add('opacity-0');
        setTimeout(() => {
            moderationPanelView.classList.add('hidden');
            serverSelectionView.classList.remove('hidden');
            serverSelectionView.classList.add('opacity-100');
        }, 300);
    }

    function setupPunishmentTypes(punishments) {
        punishmentTypeOptions.innerHTML = '';
        if (!punishments || punishments.length === 0) {
            const option = document.createElement('div');
            option.className = 'dropdown-option';
            option.textContent = 'No punishment types configured';
            punishmentTypeOptions.appendChild(option);
            return;
        }

        punishments.forEach(p => {
            const option = document.createElement('div');
            option.className = 'dropdown-option';
            option.dataset.value = p.name;
            option.dataset.duration = p.duration > 0;
            option.textContent = p.name;
            option.addEventListener('click', () => {
                punishmentType.value = p.name;
                punishmentTypeSelected.querySelector('span').textContent = p.name;
                durationContainer.classList.toggle('hidden', !p.duration);
                
                document.querySelectorAll('#punishmentTypeOptions .dropdown-option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                option.classList.add('selected');

                punishmentTypeSelected.classList.remove('active');
                punishmentTypeOptions.classList.remove('active');
            });
            punishmentTypeOptions.appendChild(option);
        });
    }

    async function handlePunishmentSubmit(e) {
        e.preventDefault();
        const now = Date.now();
        if (now - lastPunishmentTime < PUNISHMENT_COOLDOWN) {
            showToast('Please wait before issuing another punishment.', 'error');
            return;
        }

        const submitBtn = document.getElementById('submitBtn');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<div class="spinner mx-auto"></div>';

        try {
            const robloxUsername = document.getElementById('robloxUsername').value;
            const type = punishmentType.value;
            const reason = document.getElementById('reason').value;

            if (!robloxUsername || !type || !reason) {
                showToast('Please fill out all fields.', 'error');
                return;
            }

            const robloxUser = await getRobloxUser(robloxUsername);
            if (!robloxUser) {
                showToast('Roblox user not found.', 'error');
                return;
            }

            let duration = 0;
            if (!durationContainer.classList.contains('hidden')) {
                const durationValue = parseInt(document.getElementById('durationValue').value);
                const durationUnit = document.getElementById('durationUnit').value;
                if (isNaN(durationValue) || durationValue <= 0) {
                    showToast('Invalid duration', 'error');
                    return;
                }
                const unitMultipliers = { minutes: 60, hours: 3600, days: 86400, weeks: 604800 };
                duration = durationValue * unitMultipliers[durationUnit];
            }

            const response = await fetch(`https://api.duckybot.xyz/guilds/${selectedServerId}/punishments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Discord-Code': discordToken
                },
                body: JSON.stringify({ 
                    robloxId: robloxUser.id, 
                    robloxUsername: robloxUser.name,
                    type,
                    reason,
                    duration
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to issue punishment');
            }

            showToast('Punishment issued successfully!');
            lastPunishmentTime = now;
            punishmentForm.reset();
            punishmentType.value = '';
            punishmentTypeSelected.querySelector('span').textContent = 'Select type...';
            durationContainer.classList.add('hidden');
            loadPunishmentHistory();

        } catch (error) {
            showToast('Error: ' + error.message, 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Issue Punishment';
        }
    }

    async function loadPunishmentHistory() {
        if (!selectedServerId) return;
        showLoading('punishments');

        try {
            const response = await fetch(`https://api.duckybot.xyz/guilds/${selectedServerId}/punishments`, {
                headers: { 'Discord-Code': discordToken }
            });
            if (!response.ok) throw new Error('Failed to load punishment history');
            const punishments = await response.json();

            punishmentHistory.innerHTML = '';
            if (punishments.length === 0) {
                punishmentHistory.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-gavel"></i>
                        <h4 class="font-semibold">No Punishments Yet</h4>
                        <p>This server's moderation log is empty.</p>
                    </div>
                `;
                return;
            }

            for (const p of punishments.sort((a, b) => b.timestamp - a.timestamp)) {
                const isBolo = p.type.toLowerCase().includes('bolo');
                const isPendingBolo = isBolo && p.status === 'pending';

                const punishmentItem = document.createElement('div');
                punishmentItem.className = `punishment-item ${isPendingBolo ? 'bolo-punishment' : ''}`;
                punishmentItem.id = `punishment-${p.id}`;

                const moderator = await fetchUserData(p.moderator);
                const avatarUrl = await getRobloxAvatar(p.robloxId);

                punishmentItem.innerHTML = `
                    <div class="user-info">
                        <img src="${avatarUrl}" alt="${p.robloxUsername}" class="w-8 h-8 rounded-full">
                        <div>
                            <p class="font-medium">${p.robloxUsername}</p>
                            <p class="text-xs text-gray-400">Moderator: ${moderator.username || moderator.name}</p>
                        </div>
                    </div>
                    <div class="punishment-type">
                        ${p.type}
                        ${isBolo ? '<span class="bolo-tag ml-2"><i class="fas fa-exclamation-triangle"></i>BOLO</span>' : ''}
                    </div>
                    <p class="punishment-reason">${p.reason}</p>
                    <div class="meta-info">
                        <p class="text-sm">${new Date(p.timestamp).toLocaleString()}</p>
                        ${p.duration > 0 ? `<p class="text-xs text-gray-400">Duration: ${formatDuration(p.duration)}</p>` : ''}
                    </div>
                    <button class="delete-btn" onclick="confirmPunishmentDeletion('${p.id}')"><i class="fas fa-trash-alt"></i></button>
                `;
                punishmentHistory.appendChild(punishmentItem);
            }
        } catch (error) {
            punishmentHistory.innerHTML = `<p class="text-red-400 text-center">Error: ${error.message}</p>`;
        }
    }

    window.confirmPunishmentDeletion = (punishmentId) => {
        currentPunishmentToDelete = punishmentId;
        confirmationMessage.textContent = 'Are you sure you want to delete this punishment?';
        confirmationModal.classList.add('active');
    }

    async function deletePunishment() {
        if (!currentPunishmentToDelete) return;

        try {
            const response = await fetch(`https://api.duckybot.xyz/guilds/${selectedServerId}/punishments/${currentPunishmentToDelete}`, {
                method: 'DELETE',
                headers: { 'Discord-Code': discordToken }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete punishment');
            }

            showToast('Punishment deleted successfully!');
            const punishmentElement = document.getElementById(`punishment-${currentPunishmentToDelete}`);
            if (punishmentElement) {
                punishmentElement.classList.add('fade-out');
                setTimeout(() => punishmentElement.remove(), 500);
            }
        } catch (error) {
            showToast('Error: ' + error.message, 'error');
        } finally {
            currentPunishmentToDelete = null;
            confirmationModal.classList.remove('active');
        }
    }

    function setupShiftTypes(types) {
        shiftTypeOptions.innerHTML = '';
        if (!types || types.length === 0) {
            const option = document.createElement('div');
            option.className = 'dropdown-option';
            option.textContent = 'No shift types configured';
            shiftTypeOptions.appendChild(option);
            return;
        }

        types.forEach(t => {
            const option = document.createElement('div');
            option.className = 'dropdown-option';
            option.dataset.value = t.name;
            option.textContent = t.name;
            option.addEventListener('click', () => {
                shiftType.value = t.name;
                shiftTypeSelected.querySelector('span').textContent = t.name;
                document.querySelectorAll('#shiftTypeOptions .dropdown-option').forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
                shiftTypeSelected.classList.remove('active');
                shiftTypeOptions.classList.remove('active');
            });
            shiftTypeOptions.appendChild(option);
        });

        if (types.length > 0) {
            shiftType.value = types[0].name;
            shiftTypeSelected.querySelector('span').textContent = types[0].name;
            shiftTypeOptions.querySelector('.dropdown-option').classList.add('selected');
        }
    }

    function updateShiftControls() {
        startShiftBtn.disabled = shiftStatus !== 'inactive';
        pauseShiftBtn.disabled = shiftStatus === 'inactive' || shiftStatus === 'paused';
        endShiftBtn.disabled = shiftStatus === 'inactive';
        shiftTypeSelected.parentElement.style.pointerEvents = shiftStatus === 'inactive' ? 'auto' : 'none';

        shiftStatusIndicator.className = `shift-status ${shiftStatus}`;
        shiftStatusIndicator.querySelector('.pulse').className = `pulse ${shiftStatus}`;
        if (shiftStatus === 'active') {
            shiftStatusText.textContent = 'On Duty';
        } else if (shiftStatus === 'paused') {
            shiftStatusText.textContent = 'Paused';
        } else {
            shiftStatusText.textContent = 'Off Duty';
        }
    }

    function startShiftTimer() {
        if (shiftTimerInterval) clearInterval(shiftTimerInterval);
        shiftTimerInterval = setInterval(() => {
            const elapsed = shiftElapsedTime + (Date.now() - shiftStartTime);
            shiftTimer.textContent = formatShiftDuration(elapsed);
        }, 1000);
    }

    function stopShiftTimer() {
        if (shiftTimerInterval) {
            clearInterval(shiftTimerInterval);
            shiftTimerInterval = null;
        }
    }

    async function loadShiftData() {
        if (!selectedServerId) return;
        showLoading('activeShifts');
        showLoading('recentShifts');
        showLoading('userShifts');
        loadCurrentUserShift();

        try {
            const response = await fetch(`https://api.duckybot.xyz/guilds/${selectedServerId}/shifts`, {
                headers: { 'Discord-Code': discordToken }
            });
            if (!response.ok) throw new Error('Failed to load shift data');
            const data = await response.json();

            renderActiveShifts(data.active || []);
            renderRecentShifts(data.recent || []);
            renderUserShifts(data.user_recent || []);

        } catch (error) {
            activeShifts.innerHTML = `<p class="text-red-400 text-center">Error: ${error.message}</p>`;
            recentShifts.innerHTML = `<p class="text-red-400 text-center">Error: ${error.message}</p>`;
            recentUserShifts.innerHTML = `<p class="text-red-400 text-center">Error: ${error.message}</p>`;
        }
    }

    async function loadCurrentUserShift() {
        try {
            const response = await fetch(`https://api.duckybot.xyz/guilds/${selectedServerId}/shifts/@me`, {
                headers: { 'Discord-Code': discordToken }
            });
            if (response.status === 404) { // No active shift
                shiftStatus = 'inactive';
                shiftElapsedTime = 0;
                shiftTimer.textContent = '00:00:00';
                updateShiftControls();
                return;
            }
            if (!response.ok) throw new Error('Failed to load current shift');
            currentUserShift = await response.json();

            shiftStatus = currentUserShift.status;
            shiftElapsedTime = currentUserShift.total_duration;
            if (shiftStatus === 'active') {
                shiftStartTime = currentUserShift.last_start_time;
                startShiftTimer();
            } else {
                shiftTimer.textContent = formatShiftDuration(shiftElapsedTime);
            }
            shiftType.value = currentUserShift.type;
            shiftTypeSelected.querySelector('span').textContent = currentUserShift.type;

            updateShiftControls();

        } catch (error) {
            showToast('Error loading your shift status: ' + error.message, 'error');
        }
    }

    async function handleShiftAction(action) {
        try {
            const response = await fetch(`https://api.duckybot.xyz/guilds/${selectedServerId}/shifts/${action}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Discord-Code': discordToken
                },
                body: JSON.stringify({ type: shiftType.value })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Failed to ${action} shift`);
            }

            const data = await response.json();
            shiftStatus = data.shift.status;
            currentUserShift = data.shift;

            if (action === 'start') {
                shiftStartTime = Date.now();
                shiftElapsedTime = 0;
                startShiftTimer();
            } else if (action === 'pause') {
                shiftElapsedTime += (Date.now() - shiftStartTime);
                stopShiftTimer();
            } else if (action === 'resume') {
                shiftStartTime = Date.now();
                startShiftTimer();
            } else if (action === 'end') {
                shiftElapsedTime += (Date.now() - shiftStartTime);
                stopShiftTimer();
                shiftTimer.textContent = '00:00:00';
                shiftStatus = 'inactive';
                shiftElapsedTime = 0;
                loadShiftData();
            }
            
            showToast(data.message);
            updateShiftControls();
            loadActiveShifts();

        } catch (error) {
            showToast('Error: ' + error.message, 'error');
        }
    }

    async function loadActiveShifts() {
        try {
            const response = await fetch(`https://api.duckybot.xyz/guilds/${selectedServerId}/shifts`, {
                headers: { 'Discord-Code': discordToken }
            });
            if (!response.ok) throw new Error('Failed to load active shifts');
            const data = await response.json();
            renderActiveShifts(data.active || []);
        } catch (error) {
            activeShifts.innerHTML = `<p class="text-red-400 text-center">Error: ${error.message}</p>`;
        }
    }

    async function renderActiveShifts(shifts) {
        activeShifts.innerHTML = '';
        if (shifts.length === 0) {
            activeShifts.innerHTML = `
                <div class="empty-state col-span-full">
                    <i class="fas fa-moon"></i>
                    <h4 class="font-semibold">No Active Staff</h4>
                    <p>Everyone is currently off-duty.</p>
                </div>
            `;
            return;
        }

        for (const shift of shifts) {
            const user = await fetchUserData(shift.user_id);
            const shiftCard = document.createElement('div');
            shiftCard.className = 'active-staff-item';
            shiftCard.innerHTML = `
                <div class="avatar-circle">
                    <img src="${user.avatarURL}" alt="${user.username}">
                </div>
                <div class="staff-info">
                    <p class="staff-name">${user.username}</p>
                    <p class="staff-status">Shift Type: ${shift.type}</p>
                </div>
                <div class="${shift.status === 'active' ? 'staff-active-badge' : 'staff-paused-badge'}">
                    ${shift.status === 'active' ? 'Active' : 'Paused'}
                </div>
            `;
            activeShifts.appendChild(shiftCard);
        }
    }

    async function renderRecentShifts(shifts) {
        recentShifts.innerHTML = '';
        if (shifts.length === 0) {
            recentShifts.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-history"></i>
                    <h4 class="font-semibold">No Recent Shifts</h4>
                    <p>No shifts have been logged recently.</p>
                </div>
            `;
            return;
        }

        for (const shift of shifts) {
            const user = await fetchUserData(shift.user_id);
            const shiftCard = document.createElement('div');
            shiftCard.className = 'shift-card';
            shiftCard.innerHTML = `
                <div class="avatar-circle">
                    <img src="${user.avatarURL}" alt="${user.username}">
                </div>
                <div>
                    <p class="font-medium">${user.username}</p>
                    <p class="text-sm text-gray-400">${shift.type} - ${formatDuration(shift.total_duration / 1000)}</p>
                    <p class="text-xs text-gray-500">${new Date(shift.end_time).toLocaleString()}</p>
                </div>
            `;
            recentShifts.appendChild(shiftCard);
        }
    }

    async function renderUserShifts(shifts) {
        recentUserShifts.innerHTML = '';
        if (shifts.length === 0) {
            recentUserShifts.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-user-clock"></i>
                    <h4 class="font-semibold">No Shifts Logged</h4>
                    <p>You haven't logged any shifts in this server yet.</p>
                </div>
            `;
            return;
        }

        for (const shift of shifts) {
            const shiftCard = document.createElement('div');
            shiftCard.className = 'shift-card';
            shiftCard.innerHTML = `
                <div>
                    <p class="font-medium">${shift.type}</p>
                    <p class="text-sm text-gray-400">Duration: ${formatDuration(shift.total_duration / 1000)}</p>
                    <p class="text-xs text-gray-500">Ended: ${new Date(shift.end_time).toLocaleString()}</p>
                </div>
            `;
            recentUserShifts.appendChild(shiftCard);
        }
    }

    async function loadErlcData() {
        if (!selectedServerId) return;
        showLoading('erlcInfo');
        showLoading('erlcPlayers');
        discordCheckResults.classList.add('hidden');
        updateDiscordCheckCooldown();

        try {
            const response = await fetch(`https://api.duckybot.xyz/guilds/${selectedServerId}/erlc`, {
                headers: { 'Discord-Code': discordToken }
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to load ER:LC data');
            }
            const data = await response.json();

            renderErlcServerInfo(data.serverInfo);
            renderErlcPlayers(data.players);

        } catch (error) {
            erlcServerInfo.innerHTML = `<p class="text-red-400 text-center col-span-full">Error: ${error.message}</p>`;
            erlcPlayersList.innerHTML = `<p class="text-red-400 text-center col-span-full">Error: ${error.message}</p>`;
        }
    }

    function renderErlcServerInfo(info) {
        erlcServerInfo.innerHTML = '';
        if (!info) {
            erlcServerInfo.innerHTML = `
                <div class="empty-state col-span-full">
                    <i class="fas fa-server"></i>
                    <h4 class="font-semibold">ER:LC Not Linked</h4>
                    <p>This server does not have ER:LC integration set up.</p>
                </div>
            `;
            return;
        }

        erlcServerInfo.innerHTML = `
            <div class="server-info-item">
                <span class="server-info-label">Status:</span>
                <span class="status-badge ${info.online ? 'online' : 'offline'}">${info.online ? 'Online' : 'Offline'}</span>
            </div>
            <div class="server-info-item">
                <span class="server-info-label">Players:</span>
                <span class="server-info-value">${info.playerCount} / ${info.maxPlayers}</span>
            </div>
            <div class="server-info-item">
                <span class="server-info-label">Join Code:</span>
                <span class="server-info-value font-mono">${info.joinCode}</span>
            </div>
            <div class="server-info-item">
                <span class="server-info-label">Server Owner:</span>
                <span class="server-info-value">${info.owner}</span>
            </div>
            <div class="server-info-item col-span-2">
                <span class="server-info-label">Server Name:</span>
                <span class="server-info-value">${info.serverName}</span>
            </div>
        `;
    }

    async function renderErlcPlayers(players) {
        erlcPlayersList.innerHTML = '';
        if (!players || players.length === 0) {
            erlcPlayersList.innerHTML = `
                <div class="empty-state col-span-full">
                    <i class="fas fa-users"></i>
                    <h4 class="font-semibold">No Players Online</h4>
                    <p>The server is currently empty.</p>
                </div>
            `;
            return;
        }

        for (const player of players) {
            const avatarUrl = await getRobloxAvatar(player.id);
            const playerCard = document.createElement('div');
            playerCard.className = 'shift-card'; // Re-using style
            playerCard.innerHTML = `
                <div class="avatar-circle">
                    <img src="${avatarUrl}" alt="${player.username}">
                </div>
                <div>
                    <p class="font-medium">${player.username}</p>
                    <p class="text-sm text-gray-400">${player.team || 'No Team'}</p>
                </div>
            `;
            erlcPlayersList.appendChild(playerCard);
        }
    }

    async function handleDiscordCheck() {
        runDiscordCheckBtn.disabled = true;
        runDiscordCheckBtn.innerHTML = '<div class="spinner mx-auto"></div>';

        try {
            const response = await fetch(`https://api.duckybot.xyz/guilds/${selectedServerId}/erlc/discord-check`, {
                method: 'POST',
                headers: { 'Discord-Code': discordToken }
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to run Discord check');
            }
            const results = await response.json();

            renderDiscordCheckResults(results);
            discordCheckResults.classList.remove('hidden');
            discordCheckCooldowns[selectedServerId] = Date.now() + DISCORD_CHECK_COOLDOWN;
            updateDiscordCheckCooldown();

        } catch (error) {
            showToast('Error: ' + error.message, 'error');
        } finally {
            runDiscordCheckBtn.disabled = false;
            runDiscordCheckBtn.textContent = 'Run Discord Check';
        }
    }

    async function renderDiscordCheckResults(results) {
        discordCheckList.innerHTML = '';
        if (!results || results.length === 0) {
            discordCheckList.innerHTML = `<p class="text-gray-400 col-span-full">No players in-game are connected to Discord.</p>`;
            return;
        }

        for (const result of results) {
            const user = await fetchUserData(result.discordId);
            const resultCard = document.createElement('div');
            resultCard.className = 'active-staff-item'; // Re-using style
            resultCard.innerHTML = `
                <div class="avatar-circle">
                    <img src="${user.avatarURL}" alt="${user.username}">
                </div>
                <div class="staff-info">
                    <p class="staff-name">${user.username}</p>
                    <p class="staff-status">${result.robloxUsername}</p>
                </div>
                <div class="staff-active-badge">
                    <i class="fas fa-microphone${result.voiceStatus === 'in_vc' ? '' : '-slash'} mr-2"></i>
                    ${result.voiceStatus === 'in_vc' ? 'In VC' : 'Not in VC'}
                </div>
            `;
            discordCheckList.appendChild(resultCard);
        }
    }

    async function handleCommand(e) {
        e.preventDefault();
        const commandInput = document.getElementById('command');
        const command = commandInput.value;
        if (!command) return;

        const executeBtn = document.getElementById('executeCommandBtn');
        executeBtn.disabled = true;
        executeBtn.innerHTML = '<div class="spinner mx-auto"></div>';

        try {
            const response = await fetch(`https://api.duckybot.xyz/guilds/${selectedServerId}/erlc/command`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Discord-Code': discordToken
                },
                body: JSON.stringify({ command })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to execute command');
            }

            const result = await response.json();
            showToast(result.message || 'Command executed successfully!');
            commandInput.value = '';

        } catch (error) {
            showToast('Error: ' + error.message, 'error');
        } finally {
            executeBtn.disabled = false;
            executeBtn.textContent = 'Execute';
        }
    }

    function loadAutomations() {
        if (!selectedServerId) return;
        setupAutomationsDropdown(selectedServerConfig.automations);
        automationDetails.classList.add('hidden');
        runAutomationBtn.disabled = true;
        automationSelected.querySelector('span').textContent = 'Select automation...';
        selectedAutomationId.value = '';
    }

    document.addEventListener('DOMContentLoaded', () => {
        discordToken = getCookie('discord');
        if (!discordToken) {
            window.location.href = '/login?redirect=modpanel';
            return;
        }

        fetch('https://api.duckybot.xyz/users/@me', {
            headers: { 'Discord-Code': discordToken }
        }).then(res => {
            if (!res.ok) throw new Error('Invalid session');
            return res.json();
        }).then(user => {
            discordUser = user;
            document.getElementById('username').textContent = user.username;
            document.getElementById('profilePicture').src = user.avatarURL;
            loadingOverlay.classList.add('fade-out');
            serverSelectionView.classList.remove('opacity-0');
            serverSelectionView.classList.add('opacity-100');
            loadServers();
        }).catch(err => {
            console.error(err);
            document.cookie = 'discord=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
            window.location.href = '/login';
        });

        initDropdowns();

        menuBtn.addEventListener('click', () => mobileMenu.classList.add('active'));
        closeMenuBtn.addEventListener('click', () => mobileMenu.classList.remove('active'));
        backToServersBtn.addEventListener('click', backToServers);

        punishmentsTabBtn.addEventListener('click', () => switchTab('punishments'));
        shiftsTabBtn.addEventListener('click', () => switchTab('shifts'));
        erlcTabBtn.addEventListener('click', () => switchTab('erlc'));
        automationsTabBtn.addEventListener('click', () => switchTab('automations'));

        punishmentForm.addEventListener('submit', handlePunishmentSubmit);
        confirmDeleteBtn.addEventListener('click', deletePunishment);
        cancelDeleteBtn.addEventListener('click', () => confirmationModal.classList.remove('active'));

        startShiftBtn.addEventListener('click', () => {
            if (shiftStatus === 'inactive') handleShiftAction('start');
        });
        pauseShiftBtn.addEventListener('click', () => {
            if (shiftStatus === 'active') handleShiftAction('pause');
            else if (shiftStatus === 'paused') handleShiftAction('resume');
        });
        endShiftBtn.addEventListener('click', () => handleShiftAction('end'));

        runDiscordCheckBtn.addEventListener('click', handleDiscordCheck);
        commandForm.addEventListener('submit', handleCommand);
        runAutomationBtn.addEventListener('click', runAutomation);
    });
