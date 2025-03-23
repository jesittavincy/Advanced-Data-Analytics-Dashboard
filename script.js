document.addEventListener("DOMContentLoaded", function () {
    const ctx = document.getElementById("financeChart").getContext("2d");

    let chart; // Holds our Chart.js instance

    // Generate random financial data
    function generateRandomData(size = 30) {
        return Array.from({ length: size }, () => Math.floor(Math.random() * 100) + 50);
    }

    // Moving Average Calculation
    function movingAverage(data, period = 5) {
        return data.map((_, i, arr) =>
            i < period - 1 ? null : arr.slice(i - period + 1, i + 1).reduce((sum, val) => sum + val, 0) / period
        );
    }

    // Volatility Calculation (Standard Deviation over a period)
    function volatility(data, period = 5) {
        return data.map((_, i, arr) => {
            if (i < period - 1) return null;
            let subset = arr.slice(i - period + 1, i + 1);
            let avg = subset.reduce((sum, val) => sum + val, 0) / period;
            let variance = subset.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / period;
            return Math.sqrt(variance);
        });
    }

    // RSI Calculation
    function rsi(data, period = 14) {
        let gains = [];
        let losses = [];
        for (let i = 1; i < data.length; i++) {
            let diff = data[i] - data[i - 1];
            gains.push(diff > 0 ? diff : 0);
            losses.push(diff < 0 ? -diff : 0);
        }

        return data.map((_, i) => {
            if (i < period) return null;
            let avgGain = gains.slice(i - period, i).reduce((sum, val) => sum + val, 0) / period;
            let avgLoss = losses.slice(i - period, i).reduce((sum, val) => sum + val, 0) / period;
            let rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
            return 100 - 100 / (1 + rs);
        });
    }

    // Create Chart
    function createChart(data, selectedMetrics) {
        if (chart) chart.destroy(); // Destroy previous chart

        let datasets = [
            {
                label: "Stock Price",
                data: data,
                borderColor: "blue",
                borderWidth: 2,
                fill: false,
            }
        ];

        if (selectedMetrics.includes("movingAvg")) {
            datasets.push({
                label: "Moving Avg",
                data: movingAverage(data),
                borderColor: "green",
                borderWidth: 2,
                borderDash: [5, 5],
                fill: false,
            });
        }

        if (selectedMetrics.includes("volatility")) {
            datasets.push({
                label: "Volatility",
                data: volatility(data),
                borderColor: "orange",
                borderWidth: 2,
                borderDash: [5, 5],
                fill: false,
            });
        }

        if (selectedMetrics.includes("rsi")) {
            datasets.push({
                label: "RSI",
                data: rsi(data),
                borderColor: "red",
                borderWidth: 2,
                borderDash: [5, 5],
                fill: false,
            });
        }

        chart = new Chart(ctx, {
            type: "line",
            data: {
                labels: Array.from({ length: data.length }, (_, i) => i + 1),
                datasets: datasets,
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: false,
                    },
                },
            },
        });
    }

    // Load initial data
    let data = generateRandomData();
    createChart(data, []);

    // Handle Metric Selection
    document.getElementById("updateMetrics").addEventListener("click", () => {
        let selectedMetrics = Array.from(document.getElementById("metrics").selectedOptions).map(
            (option) => option.value
        );
        createChart(data, selectedMetrics);
    });
});
