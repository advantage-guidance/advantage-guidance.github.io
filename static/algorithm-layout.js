// Fit long algorithm equations after expansion and when the layout changes.
document.addEventListener('DOMContentLoaded', () => {
  const disclosure = document.querySelector('.algorithm-disclosure');
  if (!disclosure) return;

  function fitEquations() {
    if (disclosure.querySelector('#algorithm').hidden) return;
    // Measure wrapping in the original order before moving labels above.
    disclosure.querySelectorAll('.algorithm-annotated .algorithm-comment').forEach((label) => {
      label.style.order = '';
      label.querySelector('[aria-hidden]').textContent = '◀';
    });
    const equations = [...disclosure.querySelectorAll('.algorithm-box .katex')];
    equations.forEach((equation) => { equation.style.fontSize = ''; });

    const measurements = equations.map((equation) => {
      const container = equation.closest('.algorithm-annotated > span, p');
      const style = getComputedStyle(container);
      return {
        equation,
        available: container.clientWidth
          - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight),
        width: Math.max(equation.scrollWidth, equation.getBoundingClientRect().width),
        fontSize: parseFloat(getComputedStyle(equation).fontSize),
      };
    });
    measurements.forEach(({ equation, available, width, fontSize }) => {
      if (available > 4 && width > available - 4) {
        equation.style.fontSize = `${fontSize * (available - 4) / width}px`;
      }
    });

    disclosure.querySelectorAll('.algorithm-annotated').forEach((row) => {
      const formula = row.firstElementChild;
      const label = row.querySelector('.algorithm-comment');
      const arrow = label.querySelector('[aria-hidden]');
      const wrapped = label.getBoundingClientRect().top >= formula.getBoundingClientRect().bottom;
      label.style.order = wrapped ? '-1' : '';
      arrow.textContent = wrapped ? '▼' : '◀';
    });
  }

  let frame;
  function scheduleFit() {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(fitEquations);
  }

  let previousWidth;
  new ResizeObserver(([entry]) => {
    if (entry.contentRect.width !== previousWidth) {
      previousWidth = entry.contentRect.width;
      scheduleFit();
    }
  }).observe(disclosure);
  disclosure.querySelectorAll('.algorithm-toggle').forEach((button) => {
    const panel = document.getElementById(button.getAttribute('aria-controls'));
    button.addEventListener('click', () => {
      const expand = panel.hidden;
      disclosure.querySelectorAll('.algorithm-toggle').forEach((toggle) => {
        const target = document.getElementById(toggle.getAttribute('aria-controls'));
        const active = toggle === button && expand;
        target.hidden = !active;
        toggle.setAttribute('aria-expanded', String(active));
      });
      scheduleFit();
    });
  });
  document.fonts.addEventListener('loadingdone', scheduleFit);
  document.fonts.ready.then(scheduleFit);
  scheduleFit();
});
