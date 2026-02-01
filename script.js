// Abacus Configuration
const COLUMNS = 5; // Number of columns (digits)
const EARTH_BEADS = 4; // Number of lower beads per column
const HEAVEN_BEADS = 1; // Number of upper beads per column

// Abacus state
let abacusState = [];

// Initialize abacus
function initializeAbacus() {
    const abacusElement = document.getElementById('abacus');
    abacusElement.innerHTML = '';
    
    // Create abacus frame
    const frame = document.createElement('div');
    frame.className = 'abacus-frame';
    
    // Initialize state and create columns
    abacusState = [];
    for (let col = 0; col < COLUMNS; col++) {
        abacusState[col] = {
            heaven: false, // false = up (inactive), true = down (active)
            earth: 0 // number of active beads (0-4)
        };
        
        const column = createColumn(col);
        frame.appendChild(column);
    }
    
    abacusElement.appendChild(frame);
    updateDisplay();
}

// Create a single column
function createColumn(columnIndex) {
    const column = document.createElement('div');
    column.className = 'column';
    
    // Rod
    const rod = document.createElement('div');
    rod.className = 'rod';
    column.appendChild(rod);
    
    // Divider
    const divider = document.createElement('div');
    divider.className = 'divider';
    column.appendChild(divider);
    
    // Heaven section (upper beads)
    const heavenSection = document.createElement('div');
    heavenSection.className = 'heaven-section';
    
    for (let i = 0; i < HEAVEN_BEADS; i++) {
        const bead = document.createElement('div');
        bead.className = 'bead heaven-bead';
        bead.dataset.column = columnIndex;
        bead.dataset.type = 'heaven';
        bead.dataset.index = i;
        bead.addEventListener('click', () => toggleHeavenBead(columnIndex));
        heavenSection.appendChild(bead);
    }
    
    column.appendChild(heavenSection);
    
    // Earth section (lower beads)
    const earthSection = document.createElement('div');
    earthSection.className = 'earth-section';
    
    for (let i = 0; i < EARTH_BEADS; i++) {
        const bead = document.createElement('div');
        bead.className = 'bead earth-bead';
        bead.dataset.column = columnIndex;
        bead.dataset.type = 'earth';
        bead.dataset.index = i;
        bead.addEventListener('click', () => toggleEarthBead(columnIndex, i));
        earthSection.appendChild(bead);
    }
    
    column.appendChild(earthSection);
    
    // Column label (place value)
    const label = document.createElement('div');
    label.className = 'column-label';
    const placeValue = Math.pow(10, COLUMNS - 1 - columnIndex);
    label.textContent = placeValue >= 1000 ? `${placeValue/1000}k` : placeValue;
    column.appendChild(label);
    
    return column;
}

// Toggle heaven bead
function toggleHeavenBead(columnIndex) {
    abacusState[columnIndex].heaven = !abacusState[columnIndex].heaven;
    updateBeadVisuals();
    updateDisplay();
}

// Toggle earth bead
function toggleEarthBead(columnIndex, beadIndex) {
    const currentActive = abacusState[columnIndex].earth;
    
    // If clicking on an inactive bead, activate up to and including it
    if (beadIndex >= currentActive) {
        abacusState[columnIndex].earth = beadIndex + 1;
    } else {
        // If clicking on an active bead, deactivate it and all above
        abacusState[columnIndex].earth = beadIndex;
    }
    
    updateBeadVisuals();
    updateDisplay();
}

// Update visual representation of beads
function updateBeadVisuals() {
    for (let col = 0; col < COLUMNS; col++) {
        // Update heaven beads
        const heavenBeads = document.querySelectorAll(
            `.bead[data-column="${col}"][data-type="heaven"]`
        );
        heavenBeads.forEach(bead => {
            if (abacusState[col].heaven) {
                bead.classList.add('active');
            } else {
                bead.classList.remove('active');
            }
        });
        
        // Update earth beads
        const earthBeads = document.querySelectorAll(
            `.bead[data-column="${col}"][data-type="earth"]`
        );
        earthBeads.forEach((bead, index) => {
            // Beads are in descending order (0 is bottom)
            // Active beads are the ones from bottom up
            const beadPosition = EARTH_BEADS - 1 - index;
            if (beadPosition < abacusState[col].earth) {
                bead.classList.add('active');
            } else {
                bead.classList.remove('active');
            }
        });
    }
}

// Calculate current value
function calculateValue() {
    let total = 0;
    for (let col = 0; col < COLUMNS; col++) {
        const placeValue = Math.pow(10, COLUMNS - 1 - col);
        const heavenValue = abacusState[col].heaven ? 5 : 0;
        const earthValue = abacusState[col].earth;
        const columnValue = (heavenValue + earthValue) * placeValue;
        total += columnValue;
    }
    return total;
}

// Update display
function updateDisplay() {
    const value = calculateValue();
    document.getElementById('abacus-value').textContent = value;
}

// Reset abacus
function resetAbacus() {
    for (let col = 0; col < COLUMNS; col++) {
        abacusState[col].heaven = false;
        abacusState[col].earth = 0;
    }
    updateBeadVisuals();
    updateDisplay();
}

// Set a specific number on the abacus (for demonstration)
function setNumber(number) {
    resetAbacus();
    
    let remaining = Math.min(number, 99999); // Max value for 5 columns
    
    for (let col = 0; col < COLUMNS; col++) {
        const placeValue = Math.pow(10, COLUMNS - 1 - col);
        const digit = Math.floor(remaining / placeValue);
        remaining = remaining % placeValue;
        
        if (digit >= 5) {
            abacusState[col].heaven = true;
            abacusState[col].earth = digit - 5;
        } else {
            abacusState[col].heaven = false;
            abacusState[col].earth = digit;
        }
    }
    
    updateBeadVisuals();
    updateDisplay();
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initializeAbacus();
    
    // Reset button
    document.getElementById('reset-btn').addEventListener('click', resetAbacus);
    
    // Add some helpful keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'r' || e.key === 'R') {
            resetAbacus();
        }
    });
    
    // Add welcome animation
    setTimeout(() => {
        // Demonstrate the number 12345 briefly then reset
        setNumber(12345);
        setTimeout(() => {
            resetAbacus();
        }, 2000);
    }, 500);
});

// Export functions for potential testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        calculateValue,
        setNumber,
        resetAbacus
    };
}
