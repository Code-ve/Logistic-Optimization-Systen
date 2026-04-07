/**
 * OptiGuide Dashboard — Main App Logic v2
 * Full structured-API integration, live map, what-if panel
 */
document.addEventListener('DOMContentLoaded', () => {

    /* ═══ CONSTANTS ══════════════════════════════════════════ */
    const API = 'http://localhost:8000';

    const NODES = {
        supplier1: { coords: [28.6139, 77.2090], type: 'supplier', label: 'Supplier 1 (Delhi)' },
        supplier2: { coords: [19.0760, 72.8777], type: 'supplier', label: 'Supplier 2 (Mumbai)' },
        supplier3: { coords: [22.5726, 88.3639], type: 'supplier', label: 'Supplier 3 (Kolkata)' },
        roastery1: { coords: [12.9716, 77.5946],  type: 'roastery', label: 'Roastery 1 (Bengaluru)' },
        roastery2: { coords: [17.3850, 78.4867], type: 'roastery', label: 'Roastery 2 (Hyderabad)' },
        cafe1:     { coords: [13.0827, 80.2707],  type: 'cafe',     label: 'Cafe 1 (Chennai)' },
        cafe2:     { coords: [18.5204, 73.8567],  type: 'cafe',     label: 'Cafe 2 (Pune)' },
        cafe3:     { coords: [23.0225, 72.5714],  type: 'cafe',     label: 'Cafe 3 (Ahmedabad)' },
    };

    const NODE_COLORS = { supplier: '#3b82f6', roastery: '#06b6d4', cafe: '#f59e0b' };

    /* ═══ STATE ══════════════════════════════════════════════ */
    let map, costChart;
    let activeFlowLayers = [];   // polylines for current result
    let ghostLayers = [];        // dim background lines
    let baseCost = 0;
    let scenarioCount = 0;

    /* ═══ MAP INIT ═══════════════════════════════════════════ */
    function initMap() {
        map = L.map('map', { zoomControl: true }).setView([22.0, 79.0], 5);

        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '© OpenStreetMap © CARTO',
            subdomains: 'abcd', maxZoom: 20
        }).addTo(map);

        // Node markers
        Object.entries(NODES).forEach(([id, node]) => {
            const color = NODE_COLORS[node.type];
            L.circleMarker(node.coords, {
                radius: node.type === 'roastery' ? 9 : 8,
                fillColor: color, color: '#fff', weight: 2,
                opacity: 1, fillOpacity: 0.9
            }).addTo(map)
              .bindPopup(`<strong style="color:${color}">${node.label}</strong><br><small style="color:#94a3b8">${node.type.toUpperCase()}</small>`);
        });

        // Ghost (background) all-possible routes
        drawGhostRoutes();
    }

    function drawGhostRoutes() {
        const allPairs = [
            ['supplier1','roastery1'],['supplier1','roastery2'],
            ['supplier2','roastery1'],['supplier2','roastery2'],
            ['supplier3','roastery1'],['supplier3','roastery2'],
            ['roastery1','cafe1'],   ['roastery1','cafe2'],   ['roastery1','cafe3'],
            ['roastery2','cafe1'],   ['roastery2','cafe2'],   ['roastery2','cafe3'],
        ];
        allPairs.forEach(([a, b]) => {
            const layer = L.polyline([NODES[a].coords, NODES[b].coords], {
                color: '#334155', weight: 1, opacity: 0.35, dashArray: '4,8'
            }).addTo(map);
            ghostLayers.push(layer);
        });
    }

    function updateMapRoutes(routes) {
        // Remove old active layers
        activeFlowLayers.forEach(l => map.removeLayer(l));
        activeFlowLayers = [];

        // Make ghost lines dimmer
        ghostLayers.forEach(l => l.setStyle({ opacity: 0.15 }));

        if (!routes || routes.length === 0) return;

        // Colour scale: low cost = green, mid = orange, high = red
        const costs  = routes.map(r => r.cost);
        const minC   = Math.min(...costs);
        const maxC   = Math.max(...costs);
        const range  = maxC - minC || 1;

        routes.forEach(route => {
            const startNode = NODES[route.from];
            const endNode   = NODES[route.to];
            if (!startNode || !endNode) return;

            const t     = (route.cost - minC) / range;         // 0=cheap, 1=expensive
            const color = t < 0.35 ? '#22c55e' : t < 0.7 ? '#f59e0b' : '#ef4444';
            const weight = Math.max(2, Math.min(7, (route.volume || 30) / 18));

            const line = L.polyline([startNode.coords, endNode.coords], {
                color, weight, opacity: 0.85,
                className: 'active-route'
            }).addTo(map)
              .bindPopup(`
                <strong style="color:${color}">${startNode.label} → ${endNode.label}</strong><br>
                Volume: <strong>${route.volume}</strong> units<br>
                Cost: <strong style="color:#f59e0b">₹${route.cost}</strong>
              `);

            activeFlowLayers.push(line);
        });

        // Update subtitle
        document.getElementById('map-subtitle').textContent =
            `${routes.length} active routes optimized · Click a line for details`;
    }

    /* ═══ CHART INIT ═════════════════════════════════════════ */
    function initChart() {
        const ctx = document.getElementById('cost-chart').getContext('2d');
        costChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Shipping', 'Roasting', 'Management'],
                datasets: [{
                    data: [1, 1, 1],
                    backgroundColor: ['#3b82f6', '#06b6d4', '#f59e0b'],
                    borderWidth: 0,
                    hoverOffset: 16,
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: ctx => ` ₹${ctx.parsed.toLocaleString(undefined, {minimumFractionDigits:1,maximumFractionDigits:1})}`
                        }
                    }
                },
                cutout: '68%',
                animation: { duration: 600 }
            }
        });
    }

    function updateChart(breakdown) {
        if (!breakdown) return;
        const s = breakdown.shipping   || 0;
        const r = breakdown.roasting   || 0;
        const m = breakdown.management || 0;
        costChart.data.datasets[0].data = [s, r, m];
        costChart.update();
        document.getElementById('bv-ship').textContent  = `₹${s.toLocaleString(undefined,{minimumFractionDigits:1,maximumFractionDigits:1})}`;
        document.getElementById('bv-roast').textContent = `₹${r.toLocaleString(undefined,{minimumFractionDigits:1,maximumFractionDigits:1})}`;
        document.getElementById('bv-mgmt').textContent  = `₹${m.toLocaleString(undefined,{minimumFractionDigits:1,maximumFractionDigits:1})}`;
    }

    /* ═══ ROUTES TABLE ═══════════════════════════════════════ */
    function updateRoutesTable(routes) {
        const tbody = document.getElementById('routes-tbody');
        if (!routes || routes.length === 0) {
            tbody.innerHTML = '<tr class="empty-tr"><td colspan="4">No routes returned</td></tr>';
            return;
        }
        tbody.innerHTML = routes.map(r => UI.routeRow(r)).join('');
        lucide.createIcons();
    }

    /* ═══ KPI UPDATES ════════════════════════════════════════ */
    function updateKPIs(data) {
        const cost = data.cost ?? 0;
        document.getElementById('val-cost').textContent =
            `₹${cost.toLocaleString(undefined, {minimumFractionDigits:1, maximumFractionDigits:1})}`;

        if (baseCost === 0 && cost > 0) {
            baseCost = cost;
            document.getElementById('val-gain').textContent = 'Baseline set';
        } else if (baseCost > 0 && cost > 0) {
            const pct = ((baseCost - cost) / baseCost * 100);
            const sign = pct >= 0 ? '↓' : '↑';
            document.getElementById('val-gain').textContent = `${sign}${Math.abs(pct).toFixed(1)}%`;
        }

        document.getElementById('val-routes').textContent = (data.routes || []).length;
    }

    /* ═══ SCENARIO PANEL ════════════════════════════════════ */
    function addScenarioCard(question, data) {
        scenarioCount++;
        document.getElementById('val-scenarios').textContent = scenarioCount;
        document.getElementById('sc-count').textContent = `${scenarioCount} run${scenarioCount > 1 ? 's' : ''}`;
        document.getElementById('sc-empty').style.display = 'none';

        const html = UI.scenarioCard(scenarioCount, question, data, baseCost);
        document.getElementById('sc-list').insertAdjacentHTML('afterbegin', html);
        lucide.createIcons();

        // Keep max 10 cards
        const cards = document.querySelectorAll('.sc-card');
        if (cards.length > 10) cards[cards.length - 1].remove();
    }

    /* ═══ MAIN OPTIMIZE CALL ════════════════════════════════ */
    async function runOptimization(question, showLoading = true) {
        if (showLoading) {
            UI.showLoading('Running OptiGuide optimization…');
            document.getElementById('optimize-btn').classList.add('loading');
            document.getElementById('scenario-btn').classList.add('loading');
        }

        // Gather params from form
        const params = {
            capacity: {
                supplier1: parseInt(document.getElementById('cap-s1').value),
                supplier2: parseInt(document.getElementById('cap-s2').value),
                supplier3: parseInt(document.getElementById('cap-s3').value),
            },
            demand: {
                cafe1: { light: parseInt(document.getElementById('d-c1l').value), dark: parseInt(document.getElementById('d-c1d').value) },
                cafe2: { light: parseInt(document.getElementById('d-c2l').value), dark: parseInt(document.getElementById('d-c2d').value) },
                cafe3: { light: parseInt(document.getElementById('d-c3l').value), dark: parseInt(document.getElementById('d-c3d').value) },
            },
            multipliers: {
                shipping: parseFloat(document.getElementById('mult-ship').value),
                roasting: parseFloat(document.getElementById('mult-roast').value),
            }
        };

        try {
            const res = await fetch(`${API}/optimize`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question, params })
            });
            const data = await res.json();

            if (data.error) {
                alert('Optimization error: ' + data.error);
                return;
            }

            // Update all UI sections
            updateKPIs(data);
            updateChart(data.breakdown);
            updateMapRoutes(data.routes);
            updateRoutesTable(data.routes);
            addScenarioCard(question, data);

        } catch (err) {
            console.error('API error:', err);
            alert('Cannot connect to backend. Is the server running on port 8000?');
        } finally {
            UI.hideLoading();
            document.getElementById('optimize-btn').classList.remove('loading');
            document.getElementById('scenario-btn').classList.remove('loading');
        }
    }

    /* ═══ HEALTH CHECK ═══════════════════════════════════════ */
    async function checkHealth() {
        try {
            const res  = await fetch(`${API}/health`);
            const data = await res.json();
            const dot  = document.getElementById('dot-backend');
            const txt  = document.getElementById('pill-backend-text');

            if (res.ok) {
                dot.className = 'dot green';
                txt.textContent = data.mode === 'mock' ? 'Online · Mock' : 'Online · Live';
            }
        } catch {
            document.getElementById('dot-backend').className = 'dot red';
            document.getElementById('pill-backend-text').textContent = 'Offline';
        }
    }

    /* ═══ API KEY CHECK ══════════════════════════════════════ */
    async function checkApiKey() {
        const pill = document.getElementById('pill-apikey');
        const txt  = document.getElementById('pill-apikey-text');
        try {
            const res  = await fetch(`${API}/api-check`);
            const data = await res.json();

            if (data.valid) {
                pill.style.borderColor = 'rgba(34,197,94,.4)';
                txt.textContent = data.mode === 'mock' ? 'Key · Mock Mode' : 'Key ✓ Valid';
            } else {
                pill.style.borderColor = 'rgba(239,68,68,.4)';
                txt.textContent = 'Key ✗ Invalid';
                pill.title = data.error || 'API key issue';
            }
        } catch {
            txt.textContent = 'Key · Offline';
        }
    }

    /* ═══ SERVICES ═══════════════════════════════════════════ */
    async function loadServices() {
        try {
            const res  = await fetch(`${API}/services`);
            const data = await res.json();
            const list = document.getElementById('services-list');
            list.innerHTML = (data.services || []).map(s => UI.serviceItem(s)).join('');
            lucide.createIcons();
        } catch {
            document.getElementById('services-list').innerHTML =
                '<div class="loading-svc">Services unavailable (backend offline)</div>';
        }
    }

    /* ═══ PRESETS ════════════════════════════════════════════ */
    const PRESETS = {
        baseline: {
            's1': 150, 's2': 50, 's3': 100,
            'c1l': 20, 'c1d': 20, 'c2l': 30, 'c2d': 20, 'c3l': 40, 'c3d': 100,
            'ship': 1.0, 'roast': 1.0,
            q: 'Baseline logistics optimization — current state'
        },
        high: {
            's1': 150, 's2': 50, 's3': 100,
            'c1l': 20, 'c1d': 20, 'c2l': 30, 'c2d': 20, 'c3l': 80, 'c3d': 200,
            'ship': 1.0, 'roast': 1.0,
            q: 'What if cafe 3 demand doubles to 280 units?'
        },
        shock: {
            's1': 150, 's2': 50, 's3': 100,
            'c1l': 20, 'c1d': 20, 'c2l': 30, 'c2d': 20, 'c3l': 40, 'c3d': 100,
            'ship': 2.0, 'roast': 1.0,
            q: 'What if shipping costs doubled due to fuel surcharge?'
        },
        cut: {
            's1': 80, 's2': 30, 's3': 60,
            'c1l': 20, 'c1d': 20, 'c2l': 30, 'c2d': 20, 'c3l': 40, 'c3d': 100,
            'ship': 1.0, 'roast': 1.0,
            q: 'What if supplier capacity is cut by 40% across the board?'
        }
    };

    function applyPreset(key) {
        const p = PRESETS[key];
        if (!p) return;
        document.getElementById('cap-s1').value = p['s1'];   document.getElementById('lbl-s1').textContent  = p['s1'];
        document.getElementById('cap-s2').value = p['s2'];   document.getElementById('lbl-s2').textContent  = p['s2'];
        document.getElementById('cap-s3').value = p['s3'];   document.getElementById('lbl-s3').textContent  = p['s3'];
        document.getElementById('d-c1l').value  = p['c1l'];
        document.getElementById('d-c1d').value  = p['c1d'];
        document.getElementById('d-c2l').value  = p['c2l'];
        document.getElementById('d-c2d').value  = p['c2d'];
        document.getElementById('d-c3l').value  = p['c3l'];
        document.getElementById('d-c3d').value  = p['c3d'];
        document.getElementById('mult-ship').value  = p['ship'];  document.getElementById('lbl-ship').textContent  = p['ship'].toFixed(1) + '×';
        document.getElementById('mult-roast').value = p['roast']; document.getElementById('lbl-roast').textContent = p['roast'].toFixed(1) + '×';

        // Highlight active preset
        document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
        document.getElementById('pre-' + key).classList.add('active');

        // Auto-run
        runOptimization(p.q);
    }

    /* ═══ EVENT LISTENERS ════════════════════════════════════ */

    // Main optimize button
    document.getElementById('optimize-btn').addEventListener('click', () => {
        const q = document.getElementById('scenario-input').value.trim()
                  || 'Run baseline optimization of the coffee supply chain';
        runOptimization(q);
    });

    // Preset buttons
    document.getElementById('pre-baseline').addEventListener('click', () => applyPreset('baseline'));
    document.getElementById('pre-high').addEventListener('click',     () => applyPreset('high'));
    document.getElementById('pre-shock').addEventListener('click',    () => applyPreset('shock'));
    document.getElementById('pre-cut').addEventListener('click',      () => applyPreset('cut'));

    // Scenario / AI query button
    document.getElementById('scenario-btn').addEventListener('click', () => {
        const q = document.getElementById('scenario-input').value.trim();
        if (!q) return;
        runOptimization(q);
        document.getElementById('scenario-input').value = '';
    });

    // Ad-hoc Routing calculation
    document.getElementById('calc-route-btn').addEventListener('click', () => {
        const fromCity = document.getElementById('route-from').value;
        const toCity = document.getElementById('route-to').value;
        const volume = document.getElementById('route-vol').value || 50;

        if (!fromCity || !toCity) {
            alert('Please select both a "From" and "To" location.');
            return;
        }

        const q = `What is the total cost and logistics impact if we strictly mandate shipping exactly ${volume} units from ${fromCity} to ${toCity}?`;
        document.getElementById('scenario-input').value = q; // Populate so user sees it
        runOptimization(q);
    });

    // Template chips
    document.getElementById('tpl1').addEventListener('click', () => {
        document.getElementById('scenario-input').value = 'What if Supplier 1 capacity increases by 50%?';
    });
    document.getElementById('tpl2').addEventListener('click', () => {
        document.getElementById('scenario-input').value = 'What if shipping costs are doubled due to fuel surcharge?';
    });
    document.getElementById('tpl3').addEventListener('click', () => {
        document.getElementById('scenario-input').value = 'What if Cafe 3 demand doubles?';
    });
    document.getElementById('tpl4').addEventListener('click', () => {
        document.getElementById('scenario-input').value = 'What if we consolidate all roasting at Roastery 1 in Bengaluru?';
    });

    // Enter key in textarea
    document.getElementById('scenario-input').addEventListener('keydown', e => {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            document.getElementById('scenario-btn').click();
        }
    });

    // Clear scenarios
    document.getElementById('clear-btn').addEventListener('click', () => {
        document.getElementById('sc-list').innerHTML = '';
        document.getElementById('sc-empty').style.display = 'flex';
        document.getElementById('sc-list').appendChild(document.getElementById('sc-empty'));
        scenarioCount = 0;
        document.getElementById('val-scenarios').textContent = '0';
        document.getElementById('sc-count').textContent = '0 runs';
        baseCost = 0;
    });

    /* ═══ INIT ═══════════════════════════════════════════════ */
    initMap();
    initChart();
    checkHealth();
    checkApiKey();
    loadServices();

    // Periodic checks
    setInterval(checkHealth, 30000);
    setInterval(checkApiKey, 60000);

    // Auto-run baseline on start
    setTimeout(() => applyPreset('baseline'), 800);
});
