/**
 * UI Component Helpers — OptiGuide v2
 */
const UI = {

    /** Scenario card HTML */
    scenarioCard(id, question, data, baseline) {
        const cost    = data.cost ?? 0;
        const savings = baseline > 0 ? ((baseline - cost) / baseline * 100).toFixed(1) : null;
        const isBetter = savings !== null && parseFloat(savings) > 0;
        const tagClass = savings === null ? 'neutral' : (isBetter ? 'good' : 'bad');
        const tagLabel = savings === null ? 'First run' : (isBetter ? `↓ ${savings}% savings` : `↑ ${Math.abs(savings)}% higher`);
        const routeCount = (data.routes || []).length;
        const shortQ = question.length > 60 ? question.slice(0, 57) + '…' : question;
        const modeTag = data.mode === 'mock' ? '🔵 Mock' : '🟢 Live';

        return `
        <div class="sc-card" id="sc-${id}">
            <div class="sc-card-head">
                <span class="sc-card-q">${shortQ}</span>
                <span class="sc-card-cost">₹${cost.toLocaleString(undefined, {minimumFractionDigits:1, maximumFractionDigits:1})}</span>
            </div>
            <div class="sc-card-body">
                <div style="margin-bottom:6px;line-height:1.5;color:#8fa3bf;">${data.explanation ? data.explanation.slice(0, 120) + '…' : 'Optimization complete.'}</div>
                <div class="sc-card-meta">
                    <span class="sc-tag ${tagClass}">${tagLabel}</span>
                    <span class="sc-tag neutral">${routeCount} routes</span>
                    <span class="sc-tag neutral">${modeTag}</span>
                </div>
            </div>
        </div>`;
    },

    /** Route table row HTML */
    routeRow(route) {
        const nodeLabel = {
            supplier1:'Supplier 1 (Delhi)', supplier2:'Supplier 2 (Mumbai)',
            supplier3:'Supplier 3 (Kolkata)',roastery1:'Roastery 1 (Bengaluru)',
            roastery2:'Roastery 2 (Hyderabad)', cafe1:'Cafe 1 (Chennai)',
            cafe2:'Cafe 2 (Pune)', cafe3:'Cafe 3 (Ahmedabad)'
        };
        const from = nodeLabel[route.from] || route.from;
        const to   = nodeLabel[route.to]   || route.to;
        return `<tr>
            <td>${from}</td>
            <td>${to}</td>
            <td><span class="vol-badge">${route.volume}</span></td>
            <td><span class="cost-tag">₹${route.cost}</span></td>
        </tr>`;
    },

    /** Service item HTML */
    serviceItem(svc) {
        return `
        <div class="svc-item">
            <div class="svc-icon"><i data-lucide="${svc.icon || 'box'}"></i></div>
            <div class="svc-info">
                <div class="svc-name">${svc.name}</div>
                <div class="svc-desc">${svc.description}</div>
            </div>
            <span class="svc-dot" title="Available"></span>
        </div>`;
    },

    /** Show loading overlay */
    showLoading(text = 'Running optimization…') {
        document.getElementById('loading-text').textContent = text;
        document.getElementById('loading-overlay').classList.add('active');
    },

    /** Hide loading overlay */
    hideLoading() {
        document.getElementById('loading-overlay').classList.remove('active');
    }
};

window.UI = UI;
