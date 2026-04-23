/* ================================================================
   全球养老金政策动态追踪 — JavaScript
   功能：加载数据、渲染条目、筛选过滤、搜索
   ================================================================ */

// --- 国家标签配色映射（已在CSS中定义）---
// --- 分类中文名 ---

// --- 主应用对象 ---
const App = {
    data: null,
    filteredEntries: [],
    currentFilters: {
        country: 'all',
        category: 'all',
        importance: 'all',
        search: '',
        dateStart: '',
        dateEnd: ''
    },

    // 初始化
    async init() {
        try {
            const res = await fetch('data/entries.json');
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            this.data = await res.json();
            this.filteredEntries = [...this.data.entries];
            this.setDefaultDateRange();
            this.populateFilters();
            this.renderStats();
            this.render();
            this.bindEvents();
            this.updateResultCount();
        } catch (err) {
            console.error('数据加载失败:', err);
            document.getElementById('entries-list').innerHTML = `
                <div class="empty-state">
                    <p>⚠️ 数据加载失败</p>
                    <p style="font-size:0.85rem;color:#999;">请确保 data/entries.json 文件存在且格式正确。</p>
                </div>
            `;
        }
    },

    // 设置默认时间范围
    setDefaultDateRange() {
        const meta = this.data.metadata;
        if (meta.report_period_start) {
            this.currentFilters.dateStart = meta.report_period_start;
            const startInput = document.getElementById('date-start');
            if (startInput) startInput.value = meta.report_period_start;
        }
        if (meta.report_period_end) {
            this.currentFilters.dateEnd = meta.report_period_end;
            const endInput = document.getElementById('date-end');
            if (endInput) endInput.value = meta.report_period_end;
        }
    },

    // 填充筛选器选项
    populateFilters() {
        const countries = [...new Set(this.data.entries.map(e => e.country))];
        const categories = [...new Set(this.data.entries.map(e => e.category))];

        // 按固定顺序排列国家
        const countryOrder = ['美国','英国','加拿大','澳大利亚','日本','德国','法国','意大利','中国','韩国','巴西','印度'];
        const sortedCountries = countryOrder.filter(c => countries.includes(c));

        const countrySelect = document.getElementById('country-filter');
        sortedCountries.forEach(c => {
            const opt = document.createElement('option');
            opt.value = c;
            opt.textContent = c;
            countrySelect.appendChild(opt);
        });

        const categorySelect = document.getElementById('category-filter');
        categories.sort().forEach(c => {
            const opt = document.createElement('option');
            opt.value = c;
            opt.textContent = c;
            categorySelect.appendChild(opt);
        });
    },

    // 渲染统计卡片
    renderStats() {
        const entries = this.data.entries;
        const countries = new Set(entries.map(e => e.country));
        const highImp = entries.filter(e => e.importance >= 5).length;
        const reforms = entries.filter(e => e.category.includes('改革')).length;

        document.getElementById('stats-grid').innerHTML = `
            <div class="stat-card highlight">
                <div class="stat-number">${entries.length}</div>
                <div class="stat-label">动态总数</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${countries.size}</div>
                <div class="stat-label">监测国家</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${highImp}</div>
                <div class="stat-label">重大动态（5分）</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${reforms}</div>
                <div class="stat-label">政策改革</div>
            </div>
        `;
    },

    // 渲染条目
    render() {
        const container = document.getElementById('entries-list');

        if (this.filteredEntries.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>📋 无匹配结果</p>
                    <p style="font-size:0.85rem;color:#999;">尝试调整筛选条件或搜索关键词</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.filteredEntries.map((entry, idx) => this.renderEntry(entry, idx + 1)).join('');
    },

    // 渲染单一条目
    renderEntry(entry, index) {
        const stars = '★'.repeat(entry.importance) + '☆'.repeat(5 - entry.importance);
        const sourceUrl = entry.url || '#';
        const sourceDisplay = entry.source || '未标注来源';

        return `
            <article class="entry-card">
                <div class="entry-header">
                    <div class="entry-tags">
                        <span class="entry-number">#${entry.id}</span>
                        <span class="tag-country ${entry.country}">${entry.country}</span>
                        <span class="tag-category">${entry.category}</span>
                    </div>
                    <div class="entry-importance">
                        <span class="star">${stars}</span>
                    </div>
                </div>
                <h3 class="entry-title">
                    ${entry.title}
                </h3>
                <div class="entry-content">${entry.content}</div>
                <div class="entry-footer">
                    <span class="entry-date">📅 ${entry.date}</span>
                    <span class="entry-source">
                        📚 来源：<a href="${sourceUrl}" target="_blank" rel="noopener noreferrer">${sourceDisplay}</a>
                    </span>
                </div>
            </article>
        `;
    },

    // 筛选与搜索
    filter() {
        const filters = this.currentFilters;

        this.filteredEntries = this.data.entries.filter(entry => {
            // 国家筛选
            if (filters.country !== 'all' && entry.country !== filters.country) return false;
            // 分类筛选
            if (filters.category !== 'all' && entry.category !== filters.category) return false;
            // 重要性筛选
            if (filters.importance !== 'all' && entry.importance !== parseInt(filters.importance)) return false;
            // 时间范围筛选
            if (filters.dateStart && entry.date < filters.dateStart) return false;
            if (filters.dateEnd && entry.date > filters.dateEnd) return false;
            // 搜索
            if (filters.search) {
                const q = filters.search.toLowerCase();
                const matchTitle = entry.title.toLowerCase().includes(q);
                const matchContent = entry.content.toLowerCase().includes(q);
                const matchSource = (entry.source || '').toLowerCase().includes(q);
                if (!matchTitle && !matchContent && !matchSource) return false;
            }
            return true;
        });

        this.render();
        this.updateResultCount();
    },

    // 更新结果数量
    updateResultCount() {
        const el = document.getElementById('result-count');
        if (el) {
            const range = this.currentFilters;
            let rangeText = '';
            if (range.dateStart || range.dateEnd) {
                rangeText = ` (${range.dateStart || '不限'} ~ ${range.dateEnd || '不限'})`;
            }
            el.textContent = `${this.filteredEntries.length} / ${this.data.entries.length} 条动态${rangeText}`;
        }
    },

    // 绑定事件
    bindEvents() {
        const countryFilter = document.getElementById('country-filter');
        const categoryFilter = document.getElementById('category-filter');
        const importanceFilter = document.getElementById('importance-filter');
        const searchInput = document.getElementById('search-input');
        const dateStartInput = document.getElementById('date-start');
        const dateEndInput = document.getElementById('date-end');

        countryFilter.addEventListener('change', (e) => {
            this.currentFilters.country = e.target.value;
            this.filter();
        });

        categoryFilter.addEventListener('change', (e) => {
            this.currentFilters.category = e.target.value;
            this.filter();
        });

        importanceFilter.addEventListener('change', (e) => {
            this.currentFilters.importance = e.target.value;
            this.filter();
        });

        searchInput.addEventListener('input', (e) => {
            this.currentFilters.search = e.target.value.trim();
            this.filter();
        });

        if (dateStartInput) {
            dateStartInput.addEventListener('change', (e) => {
                this.currentFilters.dateStart = e.target.value;
                this.filter();
            });
        }

        if (dateEndInput) {
            dateEndInput.addEventListener('change', (e) => {
                this.currentFilters.dateEnd = e.target.value;
                this.filter();
            });
        }

        // 归档链接滚动到底部
        document.getElementById('archives-link')?.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelector('.site-footer')?.scrollIntoView({ behavior: 'smooth' });
        });
    }
};

// --- 启动 ---
document.addEventListener('DOMContentLoaded', () => App.init());
