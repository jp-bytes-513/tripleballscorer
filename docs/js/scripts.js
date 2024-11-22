// scripts.js

// Game state
let gameState = {
    homeTeam: 'Home Team',
    awayTeam: 'Away Team',
    homeColor: '#007bff', // Default color for home team (blue)
    awayColor: '#28a745', // Default color for away team (green)
    homeScore: 0,
    awayScore: 0,
    homeSetsWon: 0,
    awaySetsWon: 0,
    currentSet: 1,
    isSetOver: false,
    sequenceIndex: 0,
    sequenceHistory: [],
    actionHistory: [],
    pointNumber: 1,
    homeTimeoutsUsed: 0,
    awayTimeoutsUsed: 0,
    maxTimeoutsPerSet: 2,
    winningTeam: null,
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
const homeTeamColorInput = document.getElementById('home-team-color');
const awayTeamNameInput = document.getElementById('away-team-name');
const awayTeamColorInput = document.getElementById('away-team-color');
const setTeamNamesBtn = document.getElementById('set-team-names');
const homeTeamScoreEl = document.getElementById('home-team-score');
const awayTeamScoreEl = document.getElementById('away-team-score');
const homeTeamSetsEl = document.getElementById('home-team-sets');
const awayTeamSetsEl = document.getElementById('away-team-sets');
const homeTeamTimeoutsEl = document.getElementById('home-team-timeouts');
const awayTeamTimeoutsEl = document.getElementById('away-team-timeouts');
const currentSequenceEl = document.getElementById('current-sequence');
const historyTableBody = document.getElementById('history-body');
const homeScoreBtn = document.getElementById('home-score-btn');
const awayScoreBtn = document.getElementById('away-score-btn');
const homeTimeoutBtn = document.getElementById('home-timeout-btn');
const awayTimeoutBtn = document.getElementById('away-timeout-btn');
const resetGameBtn = document.getElementById('reset-game-btn');
const undoBtn = document.getElementById('undo-btn');
const nextSetBtn = document.getElementById('next-set-btn');
// Elements for serve selection modal
const serveSelectionModal = document.getElementById('serve-selection-modal');
const homeServeBtn = document.getElementById('home-serve-btn');
const awayServeBtn = document.getElementById('away-serve-btn');

// Initialize the app
function init() {
    loadGameState();
    updateScores();
    updateTimeoutDisplay();
    updateSequenceDisplay();
    updateHistory();
    updateScoringButtons();
    updateHistoryHeaders();
}

// Set team names and colors
setTeamNamesBtn.addEventListener('click', () => {
    gameState.homeTeam = homeTeamNameInput.value || 'Home Team';
    gameState.awayTeam = awayTeamNameInput.value || 'Away Team';
    gameState.homeColor = homeTeamColorInput.value || '#007bff';
    gameState.awayColor = awayTeamColorInput.value || '#28a745';
    // Do not clear color inputs to retain the selected colors
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
    homeTeamSetsEl.textContent = `Sets Won: ${gameState.homeSetsWon}`;
    awayTeamSetsEl.textContent = `Sets Won: ${gameState.awaySetsWon}`;
    updateScoringButtons();
    // Update score text colors
    homeTeamScoreEl.style.color = gameState.homeColor;
    awayTeamScoreEl.style.color = gameState.awayColor;
}

// Update time-outs display
function updateTimeoutDisplay() {
    const homeTimeoutsRemaining = gameState.maxTimeoutsPerSet - gameState.homeTimeoutsUsed;
    const awayTimeoutsRemaining = gameState.maxTimeoutsPerSet - gameState.awayTimeoutsUsed;
    homeTeamTimeoutsEl.textContent = `Time-Outs Remaining: ${homeTimeoutsRemaining}`;
    awayTeamTimeoutsEl.textContent = `Time-Outs Remaining: ${awayTimeoutsRemaining}`;

    // Disable time-out buttons if no time-outs remaining or if set is over
    homeTimeoutBtn.disabled = homeTimeoutsRemaining === 0 || gameState.isSetOver;
    awayTimeoutBtn.disabled = awayTimeoutsRemaining === 0 || gameState.isSetOver;
}

// Update scoring buttons with team names
function updateScoringButtons() {
    homeScoreBtn.textContent = `${gameState.homeTeam} Scores`;
    awayScoreBtn.textContent = `${gameState.awayTeam} Scores`;
    homeTimeoutBtn.textContent = `${gameState.homeTeam} Time Out`;
    awayTimeoutBtn.textContent = `${gameState.awayTeam} Time Out`;
}

// Update the history table headers with team names
function updateHistoryHeaders() {
    const homeTeamHeader = document.getElementById('home-team-header');
    const awayTeamHeader = document.getElementById('away-team-header');
    homeTeamHeader.textContent = gameState.homeTeam;
    awayTeamHeader.textContent = gameState.awayTeam;
}

// Function to calculate luminance and determine text color
function getContrastingTextColor(bgColor) {
    // Remove '#' if present
    const color = bgColor.replace('#', '');
    const r = parseInt(color.substr(0, 2), 16) / 255;
    const g = parseInt(color.substr(2, 2), 16) / 255;
    const b = parseInt(color.substr(4, 2), 16) / 255;

    // Calculate relative luminance
    const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;

    // Return black for light backgrounds, white for dark backgrounds
    return luminance > 0.6 ? '#000000' : '#FFFFFF';
}

// Update the current sequence display
function updateSequenceDisplay() {
    if (gameState.isSetOver) {
        currentSequenceEl.textContent = `${gameState.winningTeam} wins set ${gameState.currentSet}!`;
        currentSequenceEl.style.backgroundColor = '#FFD700'; // Gold color for winning
        currentSequenceEl.style.color = '#000000'; // Black text
    } else {
        const currentSequenceTemplate = gameState.sequences[gameState.sequenceIndex];
        let sequenceText = currentSequenceTemplate.replace('Home Team', `${gameState.homeTeam}`)
                                                  .replace('Away Team', `${gameState.awayTeam}`);
        currentSequenceEl.textContent = sequenceText;

        // Determine which team's color to use
        let teamColor = '';
        if (currentSequenceTemplate.includes('Home Team')) {
            teamColor = gameState.homeColor;
        } else if (currentSequenceTemplate.includes('Away Team')) {
            teamColor = gameState.awayColor;
        } else {
            teamColor = '#007bff'; // Default color if no team is specified
        }
        // Update the background color
        currentSequenceEl.style.backgroundColor = teamColor;
        // Determine appropriate text color
        const textColor = getContrastingTextColor(teamColor);
        currentSequenceEl.style.color = textColor;
    }
}

// Advance to the next sequence
function advanceSequence() {
    gameState.sequenceIndex = (gameState.sequenceIndex + 1) % gameState.sequences.length;
    updateSequenceDisplay();
}

// Update the history display
function updateHistory() {
    historyTableBody.innerHTML = '';
    // Reverse the sequenceHistory array for display
    const reversedHistory = [...gameState.sequenceHistory].reverse();
    // Display history entries
    reversedHistory.forEach(entry => {
        const row = document.createElement('tr');

        const setCell = document.createElement('td');
        setCell.textContent = entry.setNumber;
        row.appendChild(setCell);

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
    if (gameState.isSetOver) {
        return;
    }

    const sequenceStartTemplate = gameState.sequences[gameState.sequenceIndex];
    const sequenceStart = sequenceStartTemplate.replace('Home Team', gameState.homeTeam)
                                               .replace('Away Team', gameState.awayTeam);
    let sequenceResult = '';
    if (team === 'home') {
        gameState.homeScore++;
        sequenceResult = `${gameState.homeTeam} scored`;
    } else if (team === 'away') {
        gameState.awayScore++;
        sequenceResult = `${gameState.awayTeam} scored`;
    }

    // Check if set is won
    const setWon = checkSetWin();

    // Create the history entry object for the point
    const historyEntry = {
        setNumber: gameState.currentSet,
        pointNumber: gameState.pointNumber,
        sequenceStart: sequenceStart,
        sequenceResult: sequenceResult,
        homeScore: gameState.homeScore,
        awayScore: gameState.awayScore
    };
    gameState.sequenceHistory.push(historyEntry);

    // If set is won, add set win to history after the point
    if (setWon) {
        gameState.sequenceHistory.push({
            setNumber: gameState.currentSet,
            pointNumber: '',
            sequenceStart: '',
            sequenceResult: `${gameState.winningTeam} wins the set!`,
            homeScore: gameState.homeScore,
            awayScore: gameState.awayScore
        });
    }

    // Save action for undo functionality
    const action = {
        type: 'score',
        team: team,
        value: 1,
        sequenceIndex: gameState.sequenceIndex,
        pointNumber: gameState.pointNumber,
        isSetOver: gameState.isSetOver,
        setWon: setWon
    };
    gameState.actionHistory.push(action);

    // Increment point number
    gameState.pointNumber++;

    updateScores();
    updateHistory();

    if (!gameState.isSetOver) {
        advanceSequence();
    } else {
        // Disable scoring buttons
        homeScoreBtn.disabled = true;
        awayScoreBtn.disabled = true;
        // Disable time-out buttons
        homeTimeoutBtn.disabled = true;
        awayTimeoutBtn.disabled = true;
        // Enable next set button
        nextSetBtn.disabled = false;
    }
    // Update time-outs display (in case set is over)
    updateTimeoutDisplay();
}

// Check if a team has won the set
function checkSetWin() {
    const homeScore = gameState.homeScore;
    const awayScore = gameState.awayScore;

    if (homeScore >= 25 || awayScore >= 25) {
        if (Math.abs(homeScore - awayScore) >= 2) {
            gameState.isSetOver = true;
            if (homeScore > awayScore) {
                gameState.homeSetsWon++;
                gameState.winningTeam = gameState.homeTeam;
            } else {
                gameState.awaySetsWon++;
                gameState.winningTeam = gameState.awayTeam;
            }
            updateSequenceDisplay();
            updateScores();
            return true; // Indicate that a set was won
        }
    }
    return false; // No set won yet
}

// Handle time-outs
function handleTimeout(team) {
    if (gameState.isSetOver) {
        return;
    }

    if (team === 'home') {
        gameState.homeTimeoutsUsed++;
        const timeoutNumber = gameState.homeTimeoutsUsed;
        const sequenceResult = `${gameState.homeTeam} takes time-out (${timeoutNumber}/${gameState.maxTimeoutsPerSet})`;

        // Create history entry
        gameState.sequenceHistory.push({
            setNumber: gameState.currentSet,
            pointNumber: '',
            sequenceStart: '',
            sequenceResult: sequenceResult,
            homeScore: gameState.homeScore,
            awayScore: gameState.awayScore
        });

        // Save action for undo functionality
        gameState.actionHistory.push({
            type: 'timeout',
            team: 'home',
            timeoutNumber: timeoutNumber
        });
    } else if (team === 'away') {
        gameState.awayTimeoutsUsed++;
        const timeoutNumber = gameState.awayTimeoutsUsed;
        const sequenceResult = `${gameState.awayTeam} takes time-out (${timeoutNumber}/${gameState.maxTimeoutsPerSet})`;

        // Create history entry
        gameState.sequenceHistory.push({
            setNumber: gameState.currentSet,
            pointNumber: '',
            sequenceStart: '',
            sequenceResult: sequenceResult,
            homeScore: gameState.homeScore,
            awayScore: gameState.awayScore
        });

        // Save action for undo functionality
        gameState.actionHistory.push({
            type: 'timeout',
            team: 'away',
            timeoutNumber: timeoutNumber
        });
    }

    updateTimeoutDisplay();
    updateHistory();
}

// Event listeners for scoring buttons
homeScoreBtn.addEventListener('click', () => {
    handleScore('home');
});

awayScoreBtn.addEventListener('click', () => {
    handleScore('away');
});

// Event listeners for time-out buttons
homeTimeoutBtn.addEventListener('click', () => {
    handleTimeout('home');
});

awayTimeoutBtn.addEventListener('click', () => {
    handleTimeout('away');
});

// Undo function
function undoLastAction() {
    if (gameState.actionHistory.length === 0) {
        alert('No actions to undo.');
        return;
    }

    const lastAction = gameState.actionHistory.pop();

    if (lastAction.type === 'score') {
        gameState.isSetOver = lastAction.isSetOver;
        if (lastAction.team === 'home') {
            gameState.homeScore -= lastAction.value;
        } else if (lastAction.team === 'away') {
            gameState.awayScore -= lastAction.value;
        }
        // Revert sequence index
        gameState.sequenceIndex = lastAction.sequenceIndex;
        // Remove the last history entry (point)
        gameState.sequenceHistory.pop();
        // Remove set win entry if applicable
        if (lastAction.setWon) {
            gameState.sequenceHistory.pop();
            if (gameState.winningTeam === gameState.homeTeam) {
                gameState.homeSetsWon--;
            } else if (gameState.winningTeam === gameState.awayTeam) {
                gameState.awaySetsWon--;
            }
            gameState.isSetOver = false;
            gameState.winningTeam = null;
            // Re-enable scoring buttons
            homeScoreBtn.disabled = false;
            awayScoreBtn.disabled = false;
            nextSetBtn.disabled = true;
        }
        // Decrement point number
        gameState.pointNumber = lastAction.pointNumber;

        updateScores();
        updateSequenceDisplay();
        updateHistory();
    } else if (lastAction.type === 'timeout') {
        // Remove the last history entry (time-out)
        gameState.sequenceHistory.pop();

        if (lastAction.team === 'home') {
            gameState.homeTimeoutsUsed--;
        } else if (lastAction.team === 'away') {
            gameState.awayTimeoutsUsed--;
        }

        updateTimeoutDisplay();
        updateHistory();
    }
    // Update time-outs display
    updateTimeoutDisplay();
}

// Event listener for Undo Button
undoBtn.addEventListener('click', () => {
    undoLastAction();
});

// Start next set function
function startNextSet() {
    gameState.currentSet++;
    gameState.homeScore = 0;
    gameState.awayScore = 0;
    gameState.isSetOver = false;
    gameState.pointNumber = 1;
    gameState.winningTeam = null;
    gameState.actionHistory = [];
    gameState.homeTimeoutsUsed = 0;
    gameState.awayTimeoutsUsed = 0;

    // Determine starting sequence index based on set number
    if (gameState.currentSet === 2) {
        // Start at "Away Team Serves"
        gameState.sequenceIndex = gameState.sequences.indexOf('Away Team Serves');
        updateSequenceDisplay();
    } else if (gameState.currentSet === 3) {
        // Show serve selection modal
        serveSelectionModal.style.display = 'block';
    } else {
        // For sets beyond 3, default to starting with "Home Team Serves"
        gameState.sequenceIndex = gameState.sequences.indexOf('Home Team Serves');
        updateSequenceDisplay();
    }

    // Update UI
    updateScores();
    updateTimeoutDisplay();
    updateHistory();
    homeScoreBtn.disabled = false;
    awayScoreBtn.disabled = false;
    homeTimeoutBtn.disabled = false;
    awayTimeoutBtn.disabled = false;
    nextSetBtn.disabled = true;
}

// Event listeners for Serve Selection Modal
homeServeBtn.addEventListener('click', () => {
    gameState.sequenceIndex = gameState.sequences.indexOf('Home Team Serves');
    serveSelectionModal.style.display = 'none';
    updateSequenceDisplay();
});

awayServeBtn.addEventListener('click', () => {
    gameState.sequenceIndex = gameState.sequences.indexOf('Away Team Serves');
    serveSelectionModal.style.display = 'none';
    updateSequenceDisplay();
});

// Close the modal if the user clicks outside of it
window.addEventListener('click', (event) => {
    if (event.target === serveSelectionModal) {
        serveSelectionModal.style.display = 'none';
        // Default to Home Team Serves if modal is closed without selection
        gameState.sequenceIndex = gameState.sequences.indexOf('Home Team Serves');
        updateSequenceDisplay();
    }
});

// Event listener for Next Set Button
nextSetBtn.addEventListener('click', () => {
    startNextSet();
});

// Reset game function
function resetGame() {
    // Reset game state to initial values
    gameState = {
        homeTeam: 'Home Team',
        awayTeam: 'Away Team',
        homeColor: '#007bff',
        awayColor: '#28a745',
        homeScore: 0,
        awayScore: 0,
        homeSetsWon: 0,
        awaySetsWon: 0,
        currentSet: 1,
        isSetOver: false,
        sequenceIndex: 0,
        sequenceHistory: [],
        actionHistory: [],
        pointNumber: 1,
        homeTimeoutsUsed: 0,
        awayTimeoutsUsed: 0,
        maxTimeoutsPerSet: 2,
        winningTeam: null,
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
    updateTimeoutDisplay();
    updateSequenceDisplay();
    updateHistory();
    updateScoringButtons();
    updateHistoryHeaders();
    // Reset color inputs to default values
    homeTeamColorInput.value = gameState.homeColor;
    awayTeamColorInput.value = gameState.awayColor;
    // Re-enable buttons
    homeScoreBtn.disabled = false;
    awayScoreBtn.disabled = false;
    homeTimeoutBtn.disabled = false;
    awayTimeoutBtn.disabled = false;
    nextSetBtn.disabled = true;
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
    // Set color inputs to the loaded values
    homeTeamColorInput.value = gameState.homeColor || '#007bff';
    awayTeamColorInput.value = gameState.awayColor || '#28a745';
}

// Save game state to localStorage
function saveGameState() {
    localStorage.setItem('gameState', JSON.stringify(gameState));
}

// Save state on page unload
window.addEventListener('beforeunload', saveGameState);

// Initialize the app
init();