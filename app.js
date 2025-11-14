let compressor = null;
let lastData = null;
let compressionChart = null;
let ratioChart = null;

document.addEventListener('DOMContentLoaded', () => {
    compressor = new SMSTextCompressor();
    document.getElementById('compressBtn').addEventListener('click', compressText);
    document.getElementById('decompressBtn').addEventListener('click', decompressText);
    document.getElementById('sampleBtn').addEventListener('click', loadSample);
});

function compressText() {
    const text = document.getElementById('inputText').value.trim();
    if (!text) {
        alert('Please enter text!');
        return;
    }

    lastData = compressor.compress(text);

    // Stage 1
    document.getElementById('stage1Input').textContent = lastData.original_text;
    document.getElementById('stage1Output').textContent = lastData.lossy_text;
    document.getElementById('s1o').textContent = lastData.original_length;
    document.getElementById('s1l').textContent = lastData.lossy_length;
    const s1Reduction = ((lastData.original_length - lastData.lossy_length) / lastData.original_length * 100).toFixed(1);
    document.getElementById('s1r').textContent = s1Reduction + '%';

    // Stage 2
    document.getElementById('stage2Output').textContent = lastData.bwt_text.substring(0, 80) + (lastData.bwt_text.length > 80 ? '...' : '');
    document.getElementById('stage2Index').textContent = lastData.bwt_index;

    // Stage 3
    document.getElementById('stage3Output').textContent = lastData.rle_text;
    document.getElementById('s3i').textContent = lastData.bwt_length;
    document.getElementById('s3o').textContent = lastData.final_length;
    const s3Reduction = ((lastData.bwt_length - lastData.final_length) / lastData.bwt_length * 100).toFixed(1);
    document.getElementById('s3r').textContent = s3Reduction + '%';

    // Final
    document.getElementById('finalOrig').textContent = lastData.original_length + ' chars';
    document.getElementById('finalComp').textContent = lastData.final_length + ' chars';
    document.getElementById('finalRatio').textContent = lastData.compression_ratio + ':1';
    document.getElementById('finalSave').textContent = lastData.space_savings + '%';

    // Update charts
    updateCharts();

    document.getElementById('decompressBtn').disabled = false;
}

function updateCharts() {
    // Destroy old charts
    if (compressionChart) compressionChart.destroy();
    if (ratioChart) ratioChart.destroy();

    // Chart 1: Stage progression
    const ctx1 = document.getElementById('compressionChart').getContext('2d');
    compressionChart = new Chart(ctx1, {
        type: 'bar',
        data: {
            labels: ['Original', 'After Lossy', 'After BWT', 'After RLE'],
            datasets: [{
                label: 'Text Length (characters)',
                data: [
                    lastData.original_length,
                    lastData.lossy_length,
                    lastData.bwt_length,
                    lastData.final_length
                ],
                backgroundColor: [
                    'rgba(102, 126, 234, 0.6)',
                    'rgba(118, 75, 162, 0.6)',
                    'rgba(56, 239, 125, 0.6)',
                    'rgba(255, 159, 64, 0.6)'
                ],
                borderColor: [
                    'rgba(102, 126, 234, 1)',
                    'rgba(118, 75, 162, 1)',
                    'rgba(56, 239, 125, 1)',
                    'rgba(255, 159, 64, 1)'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Compression Through Stages',
                    font: { size: 14, weight: 'bold' }
                },
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: { display: true, text: 'Characters' }
                }
            }
        }
    });

    // Chart 2: Compression breakdown
    const ctx2 = document.getElementById('ratioChart').getContext('2d');
    ratioChart = new Chart(ctx2, {
        type: 'pie',
        data: {
            labels: ['Compressed', 'Space Saved'],
            datasets: [{
                data: [lastData.final_length, lastData.original_length - lastData.final_length],
                backgroundColor: [
                    'rgba(102, 126, 234, 0.7)',
                    'rgba(56, 239, 125, 0.7)'
                ],
                borderColor: [
                    'rgba(102, 126, 234, 1)',
                    'rgba(56, 239, 125, 1)'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Ratio: ' + lastData.compression_ratio + ':1 | Savings: ' + lastData.space_savings + '%',
                    font: { size: 14, weight: 'bold' }
                },
                legend: { position: 'bottom' }
            }
        }
    });
}

function decompressText() {
    if (!lastData) return;

    const result = compressor.decompress(lastData);
    document.getElementById('decompressedText').textContent = result.lossy_text;

    if (result.match) {
        document.getElementById('decompressStatus').innerHTML = 
            '<span style="color: green;">✓ DECOMPRESSION SUCCESSFUL!</span>';
    } else {
        document.getElementById('decompressStatus').innerHTML = 
            '<span style="color: red;">✗ DECOMPRESSION FAILED</span>';
    }
}

function loadSample() {
    const samples = [
        'I like to go out tomorrow for dinner tonight',
        'Hello! How are you doing today?',
        'Please message me later for a call.'
    ];
    document.getElementById('inputText').value = samples[Math.floor(Math.random() * samples.length)];
}