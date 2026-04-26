document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const chatForm = document.getElementById('chat-form');
    const userInput = document.getElementById('user-input');
    const messagesArea = document.getElementById('messages-area');
    const welcomeScreen = document.getElementById('welcome-screen');
    const typingIndicator = document.getElementById('typing-indicator');
    const topicChips = document.querySelectorAll('.topic-chip');

    // Local Knowledge Base
    const knowledgeBase = [
        {
            keywords: ["register", "voter id", "apply", "eligible", "registration", "document", "online", "offline"],
            response: "**Voter Registration Process:**\n- **Eligibility:** You must be an Indian citizen and 18 years or older.\n- **How to register:** You can apply **online** via the Voter Helpline App or the ECI's NVSP portal, or **offline** by submitting Form 6 to your local Electoral Registration Officer (ERO).\n- **Documents needed:** Proof of Identity, Proof of Address, and Proof of Age (e.g., Aadhaar card, PAN card, Passport, or 10th standard certificate)."
        },
        {
            keywords: ["evm", "machine", "electronic voting", "voter verifiable", "vvpat", "how do evm machines work?"],
            response: "**EVM Machines & VVPAT:**\n- **What they are:** EVMs (Electronic Voting Machines) are used to cast votes securely.\n- **How they work:** They consist of a Control Unit (with the polling officer) and a Balloting Unit (where you press the button next to your candidate's symbol).\n- **VVPAT:** The Voter Verifiable Paper Audit Trail machine sits next to the EVM. When you vote, it prints a slip showing the candidate you voted for, which is visible for 7 seconds before falling into a sealed box, ensuring transparency."
        },
        {
            keywords: ["timeline", "date", "schedule", "when", "phases", "campaign"],
            response: "**Election Timeline:**\n1. **Announcement:** The Election Commission of India (ECI) announces the schedule, bringing the Model Code of Conduct into effect.\n2. **Nominations:** Candidates file their nomination papers.\n3. **Campaigning:** Political parties campaign. This strictly ends 48 hours before polling begins.\n4. **Voting:** Held in single or multiple phases depending on the region's size.\n5. **Results:** Counting is done on a pre-scheduled day, and winners are declared."
        },
        {
            keywords: ["voting day", "polling", "steps", "what to do", "ink", "what happens on voting day?", "carry"],
            response: "**Voting Day Steps:**\n1. **What to carry:** Your Voter ID (EPIC) or another ECI-approved valid photo ID (like Aadhaar or PAN card).\n2. **Check-in:** The polling official checks your name on the voter list.\n3. **Verification:** Your identity is verified, and your finger is marked with indelible ink.\n4. **Sign:** You sign the register.\n5. **Vote:** You proceed to the voting compartment, press the button on the EVM, and verify your choice on the VVPAT slip."
        },
        {
            keywords: ["result", "count", "winner", "counting", "how are results counted?", "declaration"],
            response: "**How Results are Counted:**\n- **EVM Counting:** On the scheduled counting day, EVMs are brought to counting centers under heavy security. They are unsealed in the presence of candidates or their agents.\n- **Tallying:** Votes are tallied electronically from the Control Unit.\n- **Declaration:** The candidate with the highest number of votes in a constituency is declared the winner by the Returning Officer."
        },
        {
            keywords: ["eci", "election commission", "role", "function", "who conducts"],
            response: "**Election Commission of India (ECI):**\n- **Role:** The ECI is an autonomous constitutional authority responsible for administering election processes in India at the national and state levels.\n- **Functions:** It prepares the electoral rolls, schedules elections, enforces the Model Code of Conduct, registers political parties, and ensures free and fair elections."
        },
        {
            keywords: ["hello", "hi", "namaste", "hey"],
            response: "Namaste! I'm ElectionIQ. I can answer questions about voter registration, EVMs, election timelines, voting day steps, result counting, and the Election Commission of India. How can I help you today?"
        }
    ];

    const defaultResponse = "I'm focusing specifically on Indian elections right now (registration, EVMs, timelines, voting, counting, and the ECI). Could you ask something related to those topics?";

    // Event Listeners
    chatForm.addEventListener('submit', handleSubmit);

    topicChips.forEach(chip => {
        chip.addEventListener('click', () => {
            userInput.value = chip.textContent;
            userInput.focus();
        });
    });

    async function handleSubmit(e) {
        e.preventDefault();
        const message = userInput.value.trim();

        if (!message) return;

        // Hide welcome screen on first message
        if (welcomeScreen.style.display !== 'none') {
            welcomeScreen.style.display = 'none';
        }

        // Add user message to UI
        addMessageToUI(message, 'user');
        userInput.value = '';

        // Show typing indicator
        showTypingIndicator();

        // Simulate network delay to feel like AI
        setTimeout(() => {
            const response = generateLocalResponse(message);
            hideTypingIndicator();
            addMessageToUI(response, 'bot');
        }, 800 + Math.random() * 600); // 0.8s to 1.4s delay
    }

    function generateLocalResponse(userMessage) {
        const lowerMessage = userMessage.toLowerCase();

        // Find best matching category based on keywords
        for (const entry of knowledgeBase) {
            for (const keyword of entry.keywords) {
                if (lowerMessage.includes(keyword)) {
                    return entry.response;
                }
            }
        }

        return defaultResponse;
    }

    function addMessageToUI(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', `${sender}-message`);

        const contentDiv = document.createElement('div');
        contentDiv.classList.add('message-content');

        if (sender === 'bot') {
            // Use marked.js to parse markdown
            contentDiv.innerHTML = marked.parse(text);
        } else {
            contentDiv.textContent = text;
        }

        messageDiv.appendChild(contentDiv);
        messagesArea.appendChild(messageDiv);
        scrollToBottom();
    }

    function showTypingIndicator() {
        messagesArea.appendChild(typingIndicator);
        typingIndicator.classList.remove('hidden');
        scrollToBottom();
    }

    function hideTypingIndicator() {
        typingIndicator.classList.add('hidden');
    }

    function scrollToBottom() {
        const chatContainer = document.getElementById('chat-container');
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }
});
