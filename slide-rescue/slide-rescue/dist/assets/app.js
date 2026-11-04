document.querySelectorAll('.js-only').forEach(element => { element.hidden = false; });

// Every text node comes from pre-rendered, escaped content. Interactions only
// change visibility, pressed state and plain text; no untrusted innerHTML.
document.querySelectorAll('[data-demo]').forEach(demo => {
  const buttons = [...demo.querySelectorAll('[data-state]')];
  const panels = [...demo.querySelectorAll('[data-panel]')];
  const caption = demo.querySelector('[data-demo-caption]');
  const select = state => {
    buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.state === state)));
    panels.forEach(panel => { panel.hidden = panel.dataset.panel !== state; });
    const note = panels.find(panel => panel.dataset.panel === state)?.querySelector('.slide-note');
    if (caption && note) caption.textContent = `${state === 'before' ? '修改前' : '修改後'}：${note.textContent}`;
  };
  buttons.forEach(button => button.addEventListener('click', () => select(button.dataset.state)));
  select(demo.dataset.initial);
});

const search = document.querySelector('#guide-search');
if (search) {
  const cards = [...document.querySelectorAll('[data-guide-card]')];
  const filters = [...document.querySelectorAll('[data-filter]')];
  const empty = document.querySelector('.empty-state');
  const status = document.querySelector('#result-status');
  let category = 'all';
  const update = () => {
    const query = search.value.trim().toLocaleLowerCase('zh-Hant');
    let count = 0;
    cards.forEach(card => {
      const visible = (category === 'all' || card.dataset.category === category) && (!query || card.dataset.search.includes(query));
      card.hidden = !visible;
      if (visible) count++;
    });
    empty.hidden = count !== 0;
    status.textContent = query || category !== 'all' ? `找到 ${count} 篇指南${category !== 'all' ? `・${category}` : ''}` : `共 ${count} 篇指南`;
    filters.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === category)));
  };
  search.addEventListener('input', update);
  filters.forEach(button => button.addEventListener('click', () => { category = button.dataset.filter; update(); }));
  document.querySelector('[data-clear-search]').addEventListener('click', () => { search.value = ''; category = 'all'; update(); search.focus(); });
}

document.querySelectorAll('[data-checklist]').forEach(panel => {
  const key = `slide-rescue:v1:${panel.dataset.checklist}`;
  const boxes = [...panel.querySelectorAll('[data-check]')];
  const note = panel.querySelector('[data-storage-note]');
  try {
    const saved = JSON.parse(localStorage.getItem(key) || '[]');
    if (Array.isArray(saved)) boxes.forEach((box, index) => { box.checked = saved[index] === true; });
  } catch { note.textContent = '此瀏覽器暫時無法儲存；仍可在這一頁勾選。'; }
  const update = (persist = true) => {
    const count = boxes.filter(box => box.checked).length;
    panel.querySelector('[data-progress]').textContent = `${count} / ${boxes.length} 完成`;
    panel.querySelector('[data-progress-bar]').style.width = `${count / boxes.length * 100}%`;
    panel.querySelector('[data-completion]').hidden = count !== boxes.length;
    if (persist) {
      try { localStorage.setItem(key, JSON.stringify(boxes.map(box => box.checked))); }
      catch { note.textContent = '此瀏覽器暫時無法儲存；仍可在這一頁勾選。'; }
    }
  };
  boxes.forEach(box => box.addEventListener('change', () => update()));
  panel.querySelector('[data-reset-checklist]').addEventListener('click', () => { boxes.forEach(box => { box.checked = false; }); update(); boxes[0].focus(); });
  update(false);
});
