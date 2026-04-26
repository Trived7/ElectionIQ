document.addEventListener('DOMContentLoaded', () => {
    // --- State & Config ---
    let apiKey = localStorage.getItem('electioniq_api_key') || '';
    let chatHistory = [];

    // Tenglish System Instruction
    const systemInstruction = `You are ElectionIQ, a premium civic-tech dashboard assistant. 
    You help Indian users understand the election process (voter registration, EVMs, timelines, counting).
    IMPORTANT: Respond in 'Tenglish' (a mix of Telugu and English) to make it highly relatable to users from Andhra Pradesh and Telangana. Keep it natural, polite, and respectful. Use markdown for formatting. If they ask completely unrelated questions, politely guide them back to elections in Tenglish.`;

    // --- DOM Elements ---

    // Navigation
    const navItems = document.querySelectorAll('.nav-item');
    const panels = document.querySelectorAll('.panel');
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('sidebar');

    // Chat
    const chatForm = document.getElementById('chat-form');
    const userInput = document.getElementById('user-input');
    const messagesArea = document.getElementById('messages-area');
    const welcomeScreen = document.getElementById('welcome-screen');
    const typingIndicator = document.getElementById('typing-indicator');
    const topicChips = document.querySelectorAll('.topic-chip');

    // Settings
    const apiKeyInput = document.getElementById('api-key-input');
    const saveKeyBtn = document.getElementById('save-key-btn');
    const apiStatus = document.getElementById('api-status');

    // Onboarding Elements
    const onboardingOverlay = document.getElementById('onboarding-overlay');
    const mainDashboard = document.getElementById('main-dashboard');
    const onboardingApiKey = document.getElementById('onboarding-api-key');
    const startAppBtn = document.getElementById('start-app-btn');
    const skipOnboardingBtn = document.getElementById('skip-onboarding-btn');
    const onboardingStatus = document.getElementById('onboarding-status');

    // --- Initialization ---
    if (apiKey) {
        apiKeyInput.value = apiKey;
        showDashboard();
    } else {
        // Show onboarding if no key
        onboardingOverlay.style.display = 'flex';
        mainDashboard.style.display = 'none';
    }

    // --- Helper Functions for Onboarding ---
    function showDashboard() {
        onboardingOverlay.style.display = 'none';
        mainDashboard.style.display = 'flex';
    }

    function handleOnboardingSubmit() {
        const newKey = onboardingApiKey.value.trim();
        if (newKey) {
            apiKey = newKey;
            localStorage.setItem('electioniq_api_key', apiKey);
            apiKeyInput.value = apiKey; // Update settings input too
            showDashboard();
        } else {
            onboardingStatus.textContent = 'Please enter a valid key.';
            onboardingStatus.style.color = '#ff3333';
            setTimeout(() => { onboardingStatus.textContent = ''; }, 3000);
        }
    }

    // --- Event Listeners ---

    // Onboarding Events
    startAppBtn.addEventListener('click', handleOnboardingSubmit);

    // Allow enter key in onboarding input
    onboardingApiKey.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleOnboardingSubmit();
        }
    });

    skipOnboardingBtn.addEventListener('click', () => {
        showDashboard();
        // Warn them they still need a key
        document.querySelector('[data-target="about-panel"]').click();
        apiStatus.textContent = 'You skipped setup. Please add a key to use the chat.';
        apiStatus.style.color = '#FF9933'; // Warning color
    });

    // Mobile Menu Toggle
    menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
    });

    // Panel Navigation
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            // Update Active Tab
            navItems.forEach(n => n.classList.remove('active'));
            item.classList.add('active');

            // Switch Panel
            const targetId = item.getAttribute('data-target');
            panels.forEach(p => {
                p.classList.remove('active');
                if (p.id === targetId) {
                    p.classList.add('active');
                }
            });

            // Close mobile menu if open
            sidebar.classList.remove('open');
        });
    });

    // API Key Save
    saveKeyBtn.addEventListener('click', () => {
        const newKey = apiKeyInput.value.trim();
        if (newKey) {
            apiKey = newKey;
            localStorage.setItem('electioniq_api_key', apiKey);
            apiStatus.textContent = 'Key saved successfully!';
            apiStatus.style.color = 'var(--neon-green)';
        } else {
            apiStatus.textContent = 'Please enter a valid key.';
            apiStatus.style.color = '#ff3333';
        }
        setTimeout(() => { apiStatus.textContent = ''; }, 3000);
    });

    // Chat Suggestions
    topicChips.forEach(chip => {
        chip.addEventListener('click', () => {
            userInput.value = chip.textContent;
            userInput.focus();
        });
    });

    // Chat Submit
    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const message = userInput.value.trim();

        if (!message) return;

        if (!apiKey) {
            // Switch to about panel to show settings
            document.querySelector('[data-target="about-panel"]').click();
            apiStatus.textContent = 'Please configure your API key first to use the chat!';
            apiStatus.style.color = '#ff3333';
            return;
        }

        if (welcomeScreen.style.display !== 'none') {
            welcomeScreen.style.display = 'none';
        }

        addMessageToUI(message, 'user');
        userInput.value = '';
        showTypingIndicator();

        try {
            const response = await fetchGeminiResponse(message);
            hideTypingIndicator();
            addMessageToUI(response, 'bot');
        } catch (error) {
            hideTypingIndicator();
            console.error('API Error:', error);
            if (error.message.includes('API key not valid')) {
                addMessageToUI("Meeru ichina API key valid kadu andi. Please check in Settings.", 'bot');
            } else {
                addMessageToUI("Edo technical problem vachindi. Please try again later.", 'bot');
            }
        }
    });

    // --- Chat Helper Functions ---
    function addMessageToUI(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', `${sender}-message`);

        const contentDiv = document.createElement('div');
        contentDiv.classList.add('message-content');

        if (sender === 'bot') {
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
        const chatWrapper = document.querySelector('.chat-wrapper');
        chatWrapper.scrollTop = chatWrapper.scrollHeight;
    }

    async function fetchGeminiResponse(userMessage) {
        chatHistory.push({ role: "user", parts: [{ text: userMessage }] });

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        const payload = {
            system_instruction: { parts: { text: systemInstruction } },
            contents: chatHistory,
            generationConfig: { temperature: 0.3 }
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.error?.message || 'Failed to fetch from Gemini');
        }

        const data = await response.json();
        const botResponseText = data.candidates[0].content.parts[0].text;

        chatHistory.push({ role: "model", parts: [{ text: botResponseText }] });
        return botResponseText;
    }

    // --- Quiz Logic ---
    const quizData = [
        {
            question: "Voter ID card kosam ye form fill cheyali?",
            options: ["Form 6", "Form 7", "Form 8", "Form 9"],
            answer: 0
        },
        {
            question: "India lo minimum voting age entha?",
            options: ["16 years", "18 years", "21 years", "25 years"],
            answer: 1
        },
        {
            question: "EVM ante emiti?",
            options: ["Election Voting Machine", "Electronic Voting Machine", "Electrical Vote Maker", "Electoral Voice Machine"],
            answer: 1
        },
        {
            question: "None of the Above (NOTA) option eppudu introduce chesaru?",
            options: ["2009", "2013", "2014", "2019"],
            answer: 1
        },
        {
            question: "Lok Sabha lo enni elected seats untayi?",
            options: ["543", "545", "550", "250"],
            answer: 0
        }
    ];

    let currentQuestionIndex = 0;
    let score = 0;

    const quizIntro = document.getElementById('quiz-intro');
    const quizActive = document.getElementById('quiz-active');
    const quizResult = document.getElementById('quiz-result');
    const startQuizBtn = document.getElementById('start-quiz-btn');
    const restartQuizBtn = document.getElementById('restart-quiz-btn');
    const questionText = document.getElementById('question-text');
    const optionsGrid = document.getElementById('options-grid');
    const questionCounter = document.getElementById('question-counter');
    const quizProgressFill = document.getElementById('quiz-progress-fill');
    const finalScore = document.getElementById('final-score');
    const scoreMessage = document.getElementById('score-message');

    startQuizBtn.addEventListener('click', startQuiz);
    restartQuizBtn.addEventListener('click', startQuiz);

    function startQuiz() {
        currentQuestionIndex = 0;
        score = 0;
        quizIntro.classList.add('hidden');
        quizResult.classList.add('hidden');
        quizActive.classList.remove('hidden');
        loadQuestion();
    }

    function loadQuestion() {
        const currentQ = quizData[currentQuestionIndex];
        questionText.textContent = currentQ.question;
        questionCounter.textContent = `Question ${currentQuestionIndex + 1}/${quizData.length}`;
        quizProgressFill.style.width = `${((currentQuestionIndex + 1) / quizData.length) * 100}%`;

        optionsGrid.innerHTML = '';
        currentQ.options.forEach((opt, index) => {
            const btn = document.createElement('button');
            btn.classList.add('quiz-option');
            btn.textContent = opt;
            btn.addEventListener('click', () => selectOption(index, btn));
            optionsGrid.appendChild(btn);
        });
    }

    function selectOption(selectedIndex, btnElement) {
        // Disable all options
        const allOptions = optionsGrid.querySelectorAll('.quiz-option');
        allOptions.forEach(opt => opt.style.pointerEvents = 'none');

        const currentQ = quizData[currentQuestionIndex];

        if (selectedIndex === currentQ.answer) {
            btnElement.classList.add('correct');
            score++;
        } else {
            btnElement.classList.add('wrong');
            // Highlight correct answer
            allOptions[currentQ.answer].classList.add('correct');
        }

        setTimeout(() => {
            currentQuestionIndex++;
            if (currentQuestionIndex < quizData.length) {
                loadQuestion();
            } else {
                showResults();
            }
        }, 1500);
    }

    function showResults() {
        quizActive.classList.add('hidden');
        quizResult.classList.remove('hidden');
        finalScore.textContent = score;

        if (score === 5) {
            scoreMessage.textContent = "Excellent! Meekanni telusu! 🎉";
        } else if (score >= 3) {
            scoreMessage.textContent = "Good job! Manchi knowledge undi. 👍";
        } else {
            scoreMessage.textContent = "Parvaledu, inka nerchukovachu! 📚";
        }
    }
});
