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

// DOM Elements
const homeTeamNameInput = document.getElementById('home-team-name');
const awayTeamNameInput = document.getElementById('away-team-name');
const setTeamNamesBtn = document.getElementById('set-team-names');
const homeTeamScoreEl = document.getElementById('home-team-score');
const awayTeamScoreEl = document.getElementById('away-team-score');
const currentSequenceEl = document.getElementById('current-sequence');
const historyTableBody = document.getElementById('history-body');
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
    updateHistoryHeaders();
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
    updateHistoryHeaders();
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

// Update the history table headers with team names
function updateHistoryHeaders() {
    const homeTeamHeader = document.getElementById('home-team-header');
    const awayTeamHeader = document.getElementById('away-team-header');
    homeTeamHeader.textContent = gameState.homeTeam;
    awayTeamHeader.textContent = gameState.awayTeam;
}

// Update the current sequence display
function updateSequenceDisplay() {
    const currentSequence = gameState.sequences[gameState.sequenceIndex];
    let sequenceText = currentSequence.replace('Home Team', `<strong>${gameState.homeTeam}</strong>`)
                                      .replace('Away Team', `<strong>${gameState.awayTeam}</strong>`);
    currentSequenceEl.innerHTML = sequenceText;
}

// Advance to the next sequence
function advanceSequence() {
    gameState.sequenceIndex = (gameState.sequenceIndex + 1) % gameState.sequences.length;
    updateSequenceDisplay();
}

// Update the history display
function updateHistory() {
    historyTableBody.innerHTML = '';
    // Display history entries
    gameState.sequenceHistory.forEach(entry => {
        const row = document.createElement('tr');

        const ptCell = document.createElement('td');
        ptCell.textContent = entry.pointNumber;
        row.appendChild(ptCell);

        const sequenceStartCell = document.createElement('td');
        sequenceStartCell.textContent = entry.sequenceStart;
        row.appendChild(sequenceStartCell);

        const sequenceResultCell = document.createElement('td');
        sequenceResultCell.textContent = entry.sequenceResult;
        row.appendChild(sequenceResultCell);

        const homeScoreCell = document.createElement('td');
        homeScoreCell.textContent = entry.homeScore;
        row.appendChild(homeScoreCell);

        const awayScoreCell = document.createElement('td');
        awayScoreCell.textContent = entry.awayScore;
        row.appendChild(awayScoreCell);

        historyTableBody.appendChild(row);
    });
}

// Handle scoring
function handleScore(team) {
    const sequenceStartTemplate = gameState.sequences[gameState.sequenceIndex];
    const sequenceStart = sequenceStartTemplate.replace('Home Team', gameState.homeTeam)
                                               .replace('Away Team', gameState.awayTeam);

    const action = {
        type: 'score',
        team: team,
        value: 1,
        sequenceIndex: gameState.sequenceIndex,
        pointNumber: gameState.pointNumber
    };

    gameState.actionHistory.push(action);

    let sequenceResult = '';
    if (team === 'home') {
        gameState.homeScore++;
        sequenceResult = `${gameState.homeTeam} scored`;
    } else if (team === 'away') {
        gameState.awayScore++;
        sequenceResult = `${gameState.awayTeam} scored`;
    }

    // Create the history entry object
    const historyEntry = {
        pointNumber: gameState.pointNumber,
        sequenceStart: sequenceStart,
        sequenceResult: sequenceResult,
        homeScore: gameState.homeScore,
        awayScore: gameState.awayScore
    };
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
    updateHistoryHeaders();
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