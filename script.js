const counterDisplay = document.getElementById('counter');
const subtractBtn = document.getElementById('subtractBtn');
const addBtn = document.getElementById('addBtn');
const counterTab = document.getElementById('counterTab');
const historyTab = document.getElementById('historyTab');
const chartTab = document.getElementById('chartTab');
const counterView = document.getElementById('counterView');
const historyView = document.getElementById('historyView');
const chartView = document.getElementById('chartView');
const historyList = document.getElementById('historyList');
const chartTypeSelect = document.getElementById('chartType');
const cigaretteChartCanvas = document.getElementById('cigaretteChart').getContext('2d');
const adminPassword = 1234; 

let count = localStorage.getItem('count') ? parseInt(localStorage.getItem('count')) : 0; 
let history = JSON.parse(localStorage.getItem('cigarettesHistory')) || [];
let chart;
let lastAddTime = null;
const subtractionTimeLimit = 3 * 60 * 1000; 

let reason = null; 

counterDisplay.innerText = count; 
updateCounterColor(); 

function updateCounterColor() {
    if (count >= 1 && count <= 3) {
        counterDisplay.className = 'counter-display green';
    } else if (count >= 4 && count <= 5) {
        counterDisplay.className = 'counter-display orange';
    } else if (count >= 6 && count <= 7) {
        counterDisplay.className = 'counter-display red';
    } else if (count >= 8) {
        counterDisplay.className = 'counter-display garnet'; 
    } else {
        counterDisplay.className = 'counter-display';
    }
}


function updateCounter() {
    counterDisplay.textContent = count;
    updateCounterColor();
}


function disableSubtractBtn() {
    subtractBtn.disabled = true;
}


function enableSubtractBtn() {
    subtractBtn.disabled = false;
}


function startSubtractTimer() {
    enableSubtractBtn();
    setTimeout(disableSubtractBtn, subtractionTimeLimit);
}


function showView(view) {
    if (view === 'counter') {
        counterView.classList.add('active');
        historyView.classList.remove('active');
        chartView.classList.remove('active');
    } else if (view === 'history') {
        counterView.classList.remove('active');
        historyView.classList.add('active');
        chartView.classList.remove('active');
        displayHistory();
    } else if (view === 'chart') {
        counterView.classList.remove('active');
        historyView.classList.remove('active');
        chartView.classList.add('active');
        updateChart();
    }
}


function saveToHistory() {
    const now = new Date();
    const entry = { date: now, cigarettes: 1, excess: reason, total: count}; 
    
    history.push(entry);

    localStorage.setItem('cigarettesHistory', JSON.stringify(history));
}


function removeFromHistory() {
    if (history.length > 0) {
        history.pop(); 
        localStorage.setItem('cigarettesHistory', JSON.stringify(history)); 
    }
}


function displayHistory() {
    historyList.innerHTML = ''; 

  
    if (history.length === 0) {
        historyList.innerHTML = '<li>No hay historial disponible</li>';
        return;
    }

   
    history.forEach(item => {
        const listItem = document.createElement('li');
        listItem.textContent = `${new Date(item.date).toLocaleString()}: ${item.cigarettes} cigarro(s). [${item.total}]`;
        /*
        if (reason != null) {
            listItem.textContent.(`{Razón: ${item.excess}}`); 
        }
        */ 
        historyList.appendChild(listItem);
    });
}


function updateChart() {
    const chartType = chartTypeSelect.value;
    const filteredData = filterHistoryData(chartType);
    const labels = filteredData.map(entry => entry.label);
    const data = filteredData.map(entry => entry.cigarettes);

    if (chart) {
        chart.destroy(); 
    }

    chart = new Chart(cigaretteChartCanvas, {
        type: 'bar', 
        data: {
            labels: labels,
            datasets: [{
                label: 'Cigarrillos fumados',
                data: data,
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                x: {
                    beginAtZero: true
                },
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}


function filterHistoryData(chartType) {
    const filtered = [];
    const now = new Date();
    
    history.forEach(entry => {
        const date = new Date(entry.date);
        let label = '';
        
        if (chartType === 'daily') {
            label = `${date.getHours()}:00`;
        } else if (chartType === 'weekly') {
            label = `${date.getFullYear()} Semana ${getWeekNumber(date)}`;
        } else if (chartType === 'monthly') {
            label = `${date.getFullYear()} ${date.toLocaleString('default', { month: 'short' })}`;
        } else if (chartType === 'yearly') {
            label = `${date.getFullYear()}`;
        }
        
        const existing = filtered.find(f => f.label === label);
        
        if (existing) {
            existing.cigarettes += entry.cigarettes;
        } else {
            filtered.push({ label: label, cigarettes: entry.cigarettes });
        }
    });
    
    return filtered;
}


function getWeekNumber(date) {
    const startDate = new Date(date.getFullYear(), 0, 1);
    const days = Math.floor((date - startDate) / (24 * 60 * 60 * 1000));
    return Math.ceil((days + startDate.getDay() + 1) / 7);
}


function resetHistory() {
    const password = prompt('Introduce la contraseña: ');
    if (password == adminPassword) {
        history = [];
        localStorage.removeItem('cigarettesHistory');
        displayHistory();
        updateChart();
    } else {
        alert('Contraseña incorrecta'); 
    }
}


addBtn.addEventListener('click', () => {
    count++;
    reason = null;
    localStorage.setItem('count', count);
    if (count == 8) {
        reason = prompt('Motivo para saltártelo: ')
    }
    updateCounter();
    saveToHistory();
    lastAddTime = new Date();
    startSubtractTimer();
});

subtractBtn.addEventListener('click', () => {
    const now = new Date();
    if (lastAddTime && now - lastAddTime <= subtractionTimeLimit) {
        if (count > 0) {
            count--;
            updateCounter();
            removeFromHistory();
            updateChart();
        }
    }
});


document.getElementById('resetHistoryBtn').addEventListener('click', resetHistory);


counterTab.addEventListener('click', () => showView('counter'));
historyTab.addEventListener('click', () => showView('history'));
chartTab.addEventListener('click', () => showView('chart'));


chartTypeSelect.addEventListener('change', updateChart);


showView('counter');
