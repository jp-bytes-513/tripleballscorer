// scripts.js

// Game state
let gameState = {
    homeTeam: 'Home Team',
    awayTeam: 'Away Team',
    homeScore: 0,
    awayScore: 0,
    sequenceIndex: 0,
    sequenceHistory: [],
    actionHistory: [],
    pointNumber: 1, // Added point number
    sequences: [
        'Home Team Serves',
        'Away Team Tosses',
        'Home Team Tosses',
        'Away Team Serves',
        'Home Team Tosses',
        'Away Team Tosses'
    ]
};

// DOM Elements
const homeTeamNameInput = document.getElementById('home-team-name');
const awayTeamNameInput = document.getElementById('away-team-name');
const setTeamNamesBtn = document.getElementById('set-team-names');
const homeTeamScoreEl = document.getElementById('home-team-score');
const awayTeamScoreEl = document.getElementById('away-team-score');
const currentSequenceEl = document.getElementById('current-sequence');
const historyListEl = document.getElementById('history-list');
const homeScoreBtn = document.getElementById('home-score-btn');
const awayScoreBtn = document.getElementById('away-score-btn');
const resetGameBtn = document.getElementById('reset-game-btn');
const undoBtn = document.getElementById('undo-btn');

// Initialize the app
function init() {
    updateScores();
    updateSequenceDisplay();
    updateHistory();
    updateScoringButtons();
}

// Set team names
setTeamNamesBtn.addEventListener('click', () => {
    gameState.homeTeam = homeTeamNameInput.value || 'Home Team';
    gameState.awayTeam = awayTeamNameInput.value || 'Away Team';
    homeTeamNameInput.value = '';
    awayTeamNameInput.value = '';
    updateScores();
    updateSequenceDisplay();
    updateScoringButtons();
});

// Update scores on the UI
function updateScores() {
    homeTeamScoreEl.textContent = `${gameState.homeTeam}: ${gameState.homeScore}`;
    awayTeamScoreEl.textContent = `${gameState.awayTeam}: ${gameState.awayScore}`;
    updateScoringButtons();
}

// Update scoring buttons with team names
function updateScoringButtons() {
    homeScoreBtn.textContent = `${gameState.homeTeam} Scores`;
    awayScoreBtn.textContent = `${gameState.awayTeam} Scores`;
}

// Update the current sequence display
function updateSequenceDisplay() {
    const currentSequence = gameState.sequences[gameState.sequenceIndex];
    const sequenceText = currentSequence.replace('Home Team', gameState.homeTeam).replace('Away Team', gameState.awayTeam);
    currentSequenceEl.textContent = sequenceText;
}

// Advance to the next sequence
function advanceSequence() {
    gameState.sequenceIndex = (gameState.sequenceIndex + 1) % gameState.sequences.length;
    updateSequenceDisplay();
}

// Update the history display
function updateHistory() {
    historyListEl.innerHTML = '';
    // Display history entries
    gameState.sequenceHistory.slice().reverse().forEach(entry => {
        const li = document.createElement('li');
        li.textContent = entry;
        historyListEl.appendChild(li);
    });
}

// Handle scoring
function handleScore(team) {
    const sequenceStart = gameState.sequences[gameState.sequenceIndex];
    const sequenceText = sequenceStart.replace('Home Team', gameState.homeTeam).replace('Away Team', gameState.awayTeam);

    const action = {
        type: 'score',
        team: team,
        value: 1,
        sequenceIndex: gameState.sequenceIndex,
        pointNumber: gameState.pointNumber
    };

    gameState.actionHistory.push(action);

    if (team === 'home') {
        gameState.homeScore++;
        var sequenceResult = `${gameState.homeTeam} scored`;
    } else if (team === 'away') {
        gameState.awayScore++;
        var sequenceResult = `${gameState.awayTeam} scored`;
    }

    // Create the history entry
    const historyEntry = `Pt ${gameState.pointNumber} | ${sequenceText} | ${sequenceResult} | ${gameState.homeTeam}:${gameState.homeScore} | ${gameState.awayTeam}:${gameState.awayScore}`;
    gameState.sequenceHistory.push(historyEntry);

    // Increment point number
    gameState.pointNumber++;

    updateScores();
    updateHistory();
    advanceSequence();
}

// Event listeners for scoring buttons
homeScoreBtn.addEventListener('click', () => {
    handleScore('home');
});

awayScoreBtn.addEventListener('click', () => {
    handleScore('away');
});

// Undo function
function undoLastAction() {
    if (gameState.actionHistory.length === 0) {
        alert('No actions to undo.');
        return;
    }

    const lastAction = gameState.actionHistory.pop();

    if (lastAction.type === 'score') {
        if (lastAction.team === 'home') {
            gameState.homeScore -= lastAction.value;
        } else if (lastAction.team === 'away') {
            gameState.awayScore -= lastAction.value;
        }
        // Revert sequence index
        gameState.sequenceIndex = lastAction.sequenceIndex;
        // Remove the last history entry
        gameState.sequenceHistory.pop();
        // Decrement point number
        gameState.pointNumber = lastAction.pointNumber;
        updateScores();
        updateSequenceDisplay();
        updateHistory();
    }
}

// Event listener for Undo Button
undoBtn.addEventListener('click', () => {
    undoLastAction();
});

// Reset game function
function resetGame() {
    // Reset game state to initial values
    gameState = {
        homeTeam: 'Home Team',
        awayTeam: 'Away Team',
        homeScore: 0,
        awayScore: 0,
        sequenceIndex: 0,
        sequenceHistory: [],
        actionHistory: [],
        pointNumber: 1,
        sequences: [
            'Home Team Serves',
            'Away Team Tosses',
            'Home Team Tosses',
            'Away Team Serves',
            'Home Team Tosses',
            'Away Team Tosses'
        ]
    };
    // Clear localStorage
    localStorage.removeItem('gameState');
    // Update UI
    updateScores();
    updateSequenceDisplay();
    updateHistory();
    updateScoringButtons();
}

// Event listener for Reset Button
resetGameBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to reset the game?')) {
        resetGame();
    }
});

// Load game state from localStorage if available
function loadGameState() {
    const savedState = localStorage.getItem('gameState');
    if (savedState) {
        gameState = JSON.parse(savedState);
    }
}

// Save game state to localStorage
function saveGameState() {
    localStorage.setItem('gameState', JSON.stringify(gameState));
}

// Save state on page unload
window.addEventListener('beforeunload', saveGameState);

// Initialize the app
loadGameState();
init();