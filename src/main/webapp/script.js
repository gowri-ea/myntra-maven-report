document.addEventListener('DOMContentLoaded', () => {

    // --- 1. Sidebar Active Link Switching (No Change) ---
    const navItems = document.querySelectorAll('.nav-item');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            navItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
        });
    });

    // --- 2. Real-time Stat Card Updates ---
    // Make sure all these IDs match your HTML
    const cpuPercentEl = document.getElementById('cpu-percent');
    const cpuChangeEl = document.getElementById('cpu-change');
    const memUsageEl = document.getElementById('mem-usage');
    const memChangeEl = document.getElementById('mem-change');
    const netSpeedEl = document.getElementById('net-speed');
    const netChangeEl = document.getElementById('net-change');
    const storagePercentEl = document.getElementById('storage-percent');
    const storageChangeEl = document.getElementById('storage-change'); // Added storage change element


    function getRandom(min, max, decimals = 0) {
        const factor = Math.pow(10, decimals);
        return (Math.random() * (max - min) + min).toFixed(decimals);
    }

    function updateChange(element, value, unit) {
        let sign = value >= 0 ? '+' : '';
        element.textContent = `${sign}${value}${unit}`;
        
        element.classList.remove('positive', 'negative');
        if (value > 0) {
            element.classList.add('positive');
        } else if (value < 0) {
            element.classList.add('negative');
        }
    }

    // --- 3. Chart.js Setup and Real-time Chart Update ---
    
    // This is the line that probably failed before
    const ctx = document.getElementById('performanceChart').getContext('2d');
    
    const MAX_DATA_POINTS = 20; // How many data points to show on the chart

    const performanceChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: Array.from({ length: MAX_DATA_POINTS }, (_, i) => ''), // Empty labels initially
            datasets: [
                {
                    label: 'CPU Usage',
                    data: Array.from({ length: MAX_DATA_POINTS }, () => 0), // Initialize with zeros
                    borderColor: 'rgb(0, 191, 255)', // Accent Blue
                    backgroundColor: 'rgba(0, 191, 255, 0.1)',
                    borderWidth: 2,
                    pointRadius: 0, // No points on the line
                    tension: 0.4, // Smooth line
                    fill: true
                },
                {
                    label: 'Memory Usage',
                    data: Array.from({ length: MAX_DATA_POINTS }, () => 0),
                    borderColor: 'rgb(0, 255, 127)', // Accent Green
                    backgroundColor: 'rgba(0, 255, 127, 0.1)',
                    borderWidth: 2,
                    pointRadius: 0,
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Network Usage',
                    data: Array.from({ length: MAX_DATA_POINTS }, () => 0),
                    borderColor: 'rgb(255, 165, 0)', // Accent Orange
                    backgroundColor: 'rgba(255, 165, 0, 0.1)',
                    borderWidth: 2,
                    pointRadius: 0,
                    tension: 0.4,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false, // Allow chart to fill its container
            animation: {
                duration: 0 // No animation for real-time smoothness
            },
            scales: {
                x: {
                    // Removed 'type: time' for simplicity, using dynamic labels
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)' // Lighter grid lines
                    },
                    ticks: {
                        color: '#aaa', // Tick label color
                        maxRotation: 0,
                        autoSkip: true,
                        maxTicksLimit: 7 // Limit number of time labels shown
                    }
                },
                y: {
                    beginAtZero: true,
                    max: 100, // Max for percentage usage
                    title: {
                        display: true,
                        text: 'Usage (%)',
                        color: '#aaa'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: '#aaa',
                        callback: function(value) {
                            return value + '%'; // Add % sign to y-axis ticks
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    display: false // We're using a custom HTML legend
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: '#444',
                    borderWidth: 1,
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                label += context.parsed.y.toFixed(0) + '%';
                            }
                            return label;
                        }
                    }
                }
            }
        }
    });

    // Function to add new data to the chart
    function addData(chart, label, cpu, memory, network) {
        chart.data.labels.push(label);
        chart.data.datasets[0].data.push(cpu);
        chart.data.datasets[1].data.push(memory);
        chart.data.datasets[2].data.push(network);

        // Remove old data if we exceed MAX_DATA_POINTS
        if (chart.data.labels.length > MAX_DATA_POINTS) {
            chart.data.labels.shift();
            chart.data.datasets[0].data.shift();
            chart.data.datasets[1].data.shift();
            chart.data.datasets[2].data.shift();
        }
        chart.update('none'); // Update without animation
    }

    // Combined update function for both stats and chart
    function updateDashboard() {
        // Generate new random data for stats
        let cpuPercent = getRandom(10, 90, 0);
        let cpuChange = getRandom(-5, 5, 1);
        cpuPercentEl.textContent = `${cpuPercent}%`;
        updateChange(cpuChangeEl, cpuChange, '%');

        let memUsageVal = getRandom(1, 12, 2);
        let memChange = getRandom(-1, 1, 1);
        let memPercent = ((memUsageVal / 16) * 100).toFixed(0); // Assuming 16GB total RAM
        memUsageEl.textContent = `${memUsageVal}GB`;
        updateChange(memChangeEl, memChange, 'GB');

        let netSpeed = getRandom(50, 500, 0);
        let netChange = getRandom(-50, 50, 0);
        let netPercent = ((netSpeed / 600) * 100).toFixed(0); // Assuming 600MB/s max for percentage
        netSpeedEl.textContent = `${netSpeed}MB/s`;
        updateChange(netChangeEl, netChange, 'MB/s');
        
        let storagePercent = getRandom(25, 60, 0);
        let storageChange = getRandom(-0.5, 0.5, 1);
        storagePercentEl.textContent = `${storagePercent}%`;
        updateChange(storageChangeEl, storageChange, '%'); // Update storage change

        // Add new data to the chart
        const now = new Date();
        const timeLabel = now.toLocaleTimeString(); // e.g., "1:30:15 PM"
        
        addData(performanceChart, timeLabel, cpuPercent, memPercent, netPercent);
    }

    // Update dashboard every 1 second (1000 milliseconds)
    setInterval(updateDashboard, 1000);

    // Initial update to populate everything
    updateDashboard();
});