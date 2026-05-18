/* =====================================================================
   DIVINO GELATO — shared client script
   ===================================================================== */
(function () {
  'use strict';

  /* ---------- current year ---------- */
  var yEl = document.getElementById('year');
  if (yEl) yEl.textContent = new Date().getFullYear();

  /* ---------- mark today + update open pill ---------- */
  var hoursList = document.getElementById('hoursList');
  if (hoursList) {
    var day = new Date().getDay();
    var items = hoursList.querySelectorAll('li');
    items.forEach(function (li) {
      if (parseInt(li.getAttribute('data-day'), 10) === day) {
        li.classList.add('today');
        var d = document.createElement('span');
        d.textContent = 'Danas';
        d.className = 'label';
        d.style.color = 'var(--gold)';
        d.style.marginLeft = '12px';
        li.querySelector('.hours-day').appendChild(d);
      }
    });
  }
  (function () {
    var hour = new Date().getHours();
    var openNow = hour >= 9 && hour < 22;
    document.querySelectorAll('.open-pill').forEach(function (pill) {
      var label = pill.lastChild;
      if (label && label.nodeType === 3) {
        label.textContent = openNow ? 'Otvoreno' : 'Zatvoreno';
      }
      if (!openNow) {
        pill.style.background = 'rgba(122,101,80,0.12)';
        pill.style.color = 'var(--mocha)';
        var dot = pill.querySelector('.dot');
        if (dot) { dot.style.background = 'var(--mocha)'; dot.style.animation = 'none'; }
      }
    });
  })();

  /* ---------- reveal on scroll ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- menu chip filter + scroll-spy (meni page) ---------- */
  var chips = document.querySelectorAll('.menu-chip');
  var menuSections = document.querySelectorAll('article.menu-group[id]');

  function setActiveChip(targetId) {
    chips.forEach(function (c) {
      c.classList.toggle('active', c.getAttribute('data-target') === targetId);
    });
  }

  if (chips.length) {
    // click → smooth scroll + temporarily lock active state to clicked chip
    var lockUntil = 0;
    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        var target = chip.getAttribute('data-target');
        setActiveChip(target);
        lockUntil = Date.now() + 800; // ignore scroll-spy briefly during smooth-scroll
        if (target && target !== 'all') {
          var el = document.getElementById(target);
          if (el) {
            var y = el.getBoundingClientRect().top + window.scrollY - 140;
            window.scrollTo({ top: y, behavior: 'smooth' });
          }
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
    });

    // scroll-spy: track which menu-group is currently in upper viewport
    if (menuSections.length && 'IntersectionObserver' in window) {
      var visibleIds = Object.create(null);
      var spy = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) visibleIds[e.target.id] = true;
          else delete visibleIds[e.target.id];
        });
        if (Date.now() < lockUntil) return; // chip click in progress
        // pick the first section in document order that's currently visible
        var firstVisible = null;
        for (var i = 0; i < menuSections.length; i++) {
          if (visibleIds[menuSections[i].id]) { firstVisible = menuSections[i].id; break; }
        }
        setActiveChip(firstVisible || 'all');
      }, {
        // section counts as "active" when its body crosses the band ~140px-50% from top
        rootMargin: '-140px 0px -50% 0px',
        threshold: 0
      });
      menuSections.forEach(function (s) { spy.observe(s); });
    }
  }

  /* ---------- CHARTS (about page) ---------- */
  if (typeof Chart === 'undefined') return;

  // brand colors
  var c = {
    cream:    '#F4EAD8',
    paper:    '#FFFAF0',
    gold:     '#A8784A',
    goldLite: '#C99868',
    goldDeep: '#8A5F37',
    espresso: '#3D2E1F',
    cocoa:    '#5C4530',
    mocha:    '#7A6550',
    line:     '#D9CDB4',
    lineSoft: '#E8DEC8',
  };

  // shared defaults
  Chart.defaults.font.family = 'Inter, system-ui, sans-serif';
  Chart.defaults.font.size = 12;
  Chart.defaults.color = c.cocoa;
  Chart.defaults.animation.duration = 1100;
  Chart.defaults.animation.easing = 'easeOutQuart';

  // ----- revenue bar chart -----
  var revEl = document.getElementById('chartRevenue');
  if (revEl) {
    new Chart(revEl, {
      type: 'bar',
      data: {
        labels: ['2024.', '2025.'],
        datasets: [{
          label: 'Godišnji prihod (€)',
          data: [97368, 197899],
          backgroundColor: function (ctx) {
            var i = ctx.dataIndex;
            var chart = ctx.chart;
            var area = chart.chartArea;
            if (!area) return c.gold;
            var g = chart.ctx.createLinearGradient(0, area.top, 0, area.bottom);
            if (i === 0) { g.addColorStop(0, c.goldLite); g.addColorStop(1, c.gold); }
            else         { g.addColorStop(0, c.gold);     g.addColorStop(1, c.goldDeep); }
            return g;
          },
          borderRadius: 4,
          borderSkipped: false,
          barPercentage: 0.55,
          categoryPercentage: 0.7,
          hoverBackgroundColor: c.goldDeep,
        }]
      },
      options: {
        maintainAspectRatio: false,
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: c.espresso,
            titleFont: { family: 'Fraunces', size: 14, weight: '500' },
            bodyFont: { family: 'Inter', size: 12 },
            padding: 12,
            callbacks: {
              label: function (ctx) { return '€ ' + ctx.parsed.y.toLocaleString('hr-HR'); }
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              font: { family: 'Fraunces', size: 16, weight: '500' },
              color: c.espresso,
            },
            border: { color: c.line }
          },
          y: {
            beginAtZero: true,
            grid: { color: c.lineSoft, drawBorder: false },
            ticks: {
              color: c.mocha,
              callback: function (v) { return '€ ' + (v / 1000) + 'k'; }
            },
            border: { display: false }
          }
        }
      }
    });
  }

  // ----- monthly portions area chart -----
  var monEl = document.getElementById('chartMonthly');
  if (monEl) {
    var months = ['Sij', 'Velj', 'Ožu', 'Tra', 'Svi', 'Lip', 'Srp', 'Kol', 'Ruj', 'Lis', 'Stu', 'Pro'];
    var portions = [3000, 3200, 3500, 12000, 12800, 25000, 28000, 26000, 10000, 9500, 4000, 4200];
    new Chart(monEl, {
      type: 'line',
      data: {
        labels: months,
        datasets: [{
          label: 'Porcija',
          data: portions,
          borderColor: c.gold,
          borderWidth: 2.5,
          tension: 0.4,
          fill: true,
          backgroundColor: function (ctx) {
            var chart = ctx.chart;
            var area = chart.chartArea;
            if (!area) return 'rgba(168,120,74,0.15)';
            var g = chart.ctx.createLinearGradient(0, area.top, 0, area.bottom);
            g.addColorStop(0, 'rgba(201,152,104,0.45)');
            g.addColorStop(1, 'rgba(244,234,216,0.0)');
            return g;
          },
          pointBackgroundColor: c.paper,
          pointBorderColor: c.gold,
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 7,
          pointHoverBackgroundColor: c.gold,
          pointHoverBorderColor: c.paper,
        }]
      },
      options: {
        maintainAspectRatio: false,
        responsive: true,
        interaction: { intersect: false, mode: 'index' },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: c.espresso,
            titleFont: { family: 'Fraunces', size: 14, weight: '500' },
            bodyFont: { family: 'Inter', size: 12 },
            padding: 12,
            callbacks: {
              label: function (ctx) { return ctx.parsed.y.toLocaleString('hr-HR') + ' porcija'; }
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: c.mocha, font: { family: 'Inter', size: 12, weight: '600' } },
            border: { color: c.line }
          },
          y: {
            beginAtZero: true,
            grid: { color: c.lineSoft, drawBorder: false },
            ticks: {
              color: c.mocha,
              callback: function (v) { return (v / 1000) + 'k'; }
            },
            border: { display: false }
          }
        }
      }
    });
  }

  // ----- ingredients doughnut -----
  var ingEl = document.getElementById('chartIngredients');
  if (ingEl) {
    new Chart(ingEl, {
      type: 'doughnut',
      data: {
        labels: ['Svježe voće', 'Mlijeko i baza', 'Prirodni šećeri'],
        datasets: [{
          data: [65, 25, 10],
          backgroundColor: [c.gold, c.goldLite, c.cream],
          borderColor: c.paper,
          borderWidth: 3,
          hoverOffset: 8,
        }]
      },
      options: {
        maintainAspectRatio: false,
        responsive: true,
        cutout: '68%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 16,
              boxWidth: 10,
              boxHeight: 10,
              usePointStyle: true,
              pointStyle: 'circle',
              font: { family: 'Inter', size: 12, weight: '600' },
              color: c.cocoa,
            }
          },
          tooltip: {
            backgroundColor: c.espresso,
            titleFont: { family: 'Fraunces', size: 14, weight: '500' },
            bodyFont: { family: 'Inter', size: 12 },
            padding: 12,
            callbacks: {
              label: function (ctx) { return ctx.label + ': ' + ctx.parsed + '%'; }
            }
          }
        }
      }
    });
  }
})();
