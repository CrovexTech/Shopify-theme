/*
 * Crovex Commerce Framework
 * Copyright © 2026 James Boyden. All rights reserved.
 */
(() => {
  'use strict';

  const config = window.CrovexTheme || {};
  const bus = new EventTarget();
  const emit = (name, detail = {}) => bus.dispatchEvent(new CustomEvent(name, { detail }));
  const on = (name, callback) => bus.addEventListener(name, callback);
  const escapeHTML = (value = '') => String(value).replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]));

  const focusable = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

  function formatMoney(cents, format = '${{amount}}') {
    const value = Number(cents || 0) / 100;
    const locale = document.documentElement.lang || 'en-US';
    const replacements = {
      amount: value.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      amount_no_decimals: value.toLocaleString(locale, { maximumFractionDigits: 0 }),
      amount_with_comma_separator: value.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      amount_no_decimals_with_comma_separator: value.toLocaleString('de-DE', { maximumFractionDigits: 0 }),
      amount_with_apostrophe_separator: value.toLocaleString('de-CH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    };
    return format.replace(/\{\{\s*(amount(?:_[a-z_]+)?)\s*\}\}/, (_, token) => replacements[token] ?? replacements.amount);
  }

  async function requestJSON(url, options = {}) {
    const response = await fetch(url, {
      credentials: 'same-origin',
      headers: { 'Accept': 'application/json', ...(typeof options.body === 'string' ? { 'Content-Type': 'application/json' } : {}), ...(options.headers || {}) },
      ...options
    });
    if (!response.ok) {
      let message = config.strings?.cartError || 'Request failed.';
      try { const data = await response.json(); message = data.description || data.message || message; } catch (_) {}
      throw new Error(message);
    }
    return response.json();
  }

  class StickyHeader extends HTMLElement {
    connectedCallback() {
      this.stickyMode = this.dataset.stickyMode || (this.classList.contains('site-header--sticky') ? 'scroll-up' : 'none');
      this.previousY = window.scrollY;
      this.updateHeader = this.updateHeader.bind(this);
      window.addEventListener('scroll', this.updateHeader, { passive: true });
      this.updateHeader();
    }

    disconnectedCallback() {
      window.removeEventListener('scroll', this.updateHeader);
    }

    updateHeader() {
      const currentY = Math.max(0, window.scrollY);
      const scrolled = currentY > 20;
      const movingDown = currentY > this.previousY + 2;
      const shouldHide = this.stickyMode === 'scroll-up' && movingDown && currentY > 140;

      this.classList.toggle('is-scrolled', scrolled);
      this.classList.toggle('is-hidden', shouldHide);

      if (this.stickyMode === 'always' || currentY <= 20) {
        this.classList.remove('is-hidden');
      }

      this.previousY = currentY;
    }
  }


  class AnnouncementBar extends HTMLElement {
    connectedCallback() {
      this.animation = this.dataset.animation || 'none';
      this.pauseOnHover = this.dataset.pauseHover === 'true';
      this.mobileAnimation = this.dataset.mobileAnimation !== 'false';
      this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      this.mobileViewport = window.matchMedia('(max-width: 749px)');
      this.slides = [...this.querySelectorAll('.announcement__slides > .announcement__item')];
      this.index = Math.max(0, this.slides.findIndex((slide) => slide.classList.contains('is-active')));

      this.handleViewportChange = () => this.configureMotion();
      this.mobileViewport.addEventListener?.('change', this.handleViewportChange);

      if (this.pauseOnHover) {
        this.handlePause = () => this.pause();
        this.handleResume = () => this.resume();
        this.addEventListener('mouseenter', this.handlePause);
        this.addEventListener('mouseleave', this.handleResume);
        this.addEventListener('focusin', this.handlePause);
        this.addEventListener('focusout', this.handleResume);
      }

      this.handleVisibility = () => document.hidden ? this.pause() : this.resume();
      document.addEventListener('visibilitychange', this.handleVisibility);

      this.handleBlockSelect = (event) => {
        const blockId = event.detail?.blockId;
        if (!blockId) return;
        const selected = this.querySelector(`[data-announcement-block="${CSS.escape(blockId)}"]`);
        if (!selected) return;
        const selectedIndex = this.slides.indexOf(selected);
        if (selectedIndex >= 0) this.show(selectedIndex);
        this.pause();
      };
      this.handleBlockDeselect = () => this.resume();
      document.addEventListener('shopify:block:select', this.handleBlockSelect);
      document.addEventListener('shopify:block:deselect', this.handleBlockDeselect);

      this.configureMotion();
    }

    disconnectedCallback() {
      this.stop();
      this.mobileViewport?.removeEventListener?.('change', this.handleViewportChange);
      document.removeEventListener('visibilitychange', this.handleVisibility);
      document.removeEventListener('shopify:block:select', this.handleBlockSelect);
      document.removeEventListener('shopify:block:deselect', this.handleBlockDeselect);
      if (this.pauseOnHover) {
        this.removeEventListener('mouseenter', this.handlePause);
        this.removeEventListener('mouseleave', this.handleResume);
        this.removeEventListener('focusin', this.handlePause);
        this.removeEventListener('focusout', this.handleResume);
      }
    }

    configureMotion() {
      const disabled = this.reducedMotion || (this.mobileViewport.matches && !this.mobileAnimation);
      this.dataset.motionDisabled = String(disabled);
      this.stop();

      if (disabled || this.animation === 'none' || this.animation === 'marquee' || this.slides.length < 2) {
        this.show(0);
        return;
      }

      this.start();
    }

    start() {
      this.stop();
      const seconds = Math.max(2, Number(this.dataset.interval || 5));
      this.timer = window.setInterval(() => this.show((this.index + 1) % this.slides.length), seconds * 1000);
    }

    stop() {
      if (this.timer) window.clearInterval(this.timer);
      this.timer = null;
    }

    pause() {
      this.classList.add('is-paused');
      if (this.animation !== 'marquee') this.stop();
    }

    resume() {
      if (this.pauseOnHover && (this.matches(':hover') || this.contains(document.activeElement))) return;
      this.classList.remove('is-paused');
      if (document.hidden || this.dataset.motionDisabled === 'true') return;
      if (!['none', 'marquee'].includes(this.animation) && this.slides.length > 1) this.start();
    }

    show(index) {
      if (!this.slides.length) return;
      this.index = Math.min(Math.max(index, 0), this.slides.length - 1);
      this.slides.forEach((slide, slideIndex) => slide.classList.toggle('is-active', slideIndex === this.index));
    }
  }

  class ProductForm extends HTMLElement {
    connectedCallback() {
      this.form = this.querySelector('form');
      if (!this.form) return;
      this.form.addEventListener('submit', (event) => this.submit(event));
    }

    async submit(event) {
      event.preventDefault();
      const button = this.form.querySelector('[type="submit"]');
      const status = this.closest('[data-product-root]')?.querySelector('[data-product-status]');
      if (button) button.disabled = true;
      if (status) status.textContent = '';
      try {
        const formData = new FormData(this.form);
        await requestJSON(`${config.routes.cartAdd}.js`, { method: 'POST', body: formData });
        emit('cart:changed');
        if (document.body.dataset.cartBehavior === 'page' || this.dataset.cartBehavior === 'page') {
          window.location.assign(config.routes.cart);
        } else {
          emit('cart:open');
        }
      } catch (error) {
        if (status) status.textContent = error.message;
      } finally {
        if (button) button.disabled = false;
      }
    }
  }

  class VariantSelector extends HTMLElement {
    connectedCallback() {
      this.root = this.closest('[data-product-root]');
      this.data = JSON.parse(this.root.querySelector('[data-product-json]').textContent);
      this.selects = [...this.querySelectorAll('select[data-option-position]')];
      this.selects.forEach((select) => select.addEventListener('change', () => this.update()));
    }

    update() {
      const selected = this.selects.map((select) => select.value);
      const variant = this.data.variants.find((candidate) => candidate.options.every((value, index) => value === selected[index]));
      const input = this.root.querySelector('[data-variant-id]');
      const button = this.root.querySelector('[data-add-to-cart]');
      const buttonText = this.root.querySelector('[data-add-to-cart-text]');
      const price = this.root.querySelector('[data-product-price]');
      const compare = this.root.querySelector('[data-product-compare-price]');

      if (!variant) {
        if (button) button.disabled = true;
        if (buttonText) buttonText.textContent = config.strings?.unavailable || 'Unavailable';
        return;
      }

      input.value = variant.id;
      button.disabled = !variant.available;
      buttonText.textContent = variant.available ? config.strings.addToCart : config.strings.soldOut;
      if (price) price.textContent = formatMoney(variant.price, config.moneyFormat);
      if (compare) {
        if (variant.compare_at_price && variant.compare_at_price > variant.price) {
          compare.hidden = false;
          compare.textContent = formatMoney(variant.compare_at_price, config.moneyFormat);
        } else {
          compare.hidden = true;
          compare.textContent = '';
        }
      }
      if (variant.featured_media) this.showMedia(variant.featured_media.id);
      const url = new URL(window.location.href);
      url.searchParams.set('variant', variant.id);
      history.replaceState({}, '', url);
    }

    showMedia(id) {
      this.root.querySelectorAll('[data-media-id]').forEach((node) => { node.hidden = node.dataset.mediaId !== String(id); });
      this.root.querySelectorAll('[data-media-target]').forEach((node) => node.classList.toggle('is-active', node.dataset.mediaTarget === String(id)));
    }
  }

  class CartDrawer extends HTMLElement {
    connectedCallback() {
      this.items = this.querySelector('[data-cart-items]');
      this.footer = this.querySelector('[data-cart-footer]');
      this.subtotal = this.querySelector('[data-cart-subtotal]');
      this.querySelectorAll('[data-cart-close]').forEach((button) => button.addEventListener('click', () => this.close()));
      on('cart:open', () => this.open());
      on('cart:changed', () => this.refresh());
      document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && this.dataset.state === 'open') this.close(); });
      this.addEventListener('click', (event) => {
        const action = event.target.closest('[data-line-action]');
        if (action) this.change(Number(action.dataset.line), Number(action.dataset.quantity));
      });
    }

    async open() {
      await this.refresh();
      this.dataset.state = 'open';
      this.setAttribute('aria-hidden', 'false');
      document.body.classList.add('drawer-open');
      this.lastActive = document.activeElement;
      this.querySelector(this.constructor.focusableSelector)?.focus();
    }

    close() {
      this.dataset.state = 'closed';
      this.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('drawer-open');
      this.lastActive?.focus();
    }

    async refresh() {
      const cart = await requestJSON(`${config.routes.cart}.js`);
      document.querySelectorAll('[data-cart-count]').forEach((count) => { count.textContent = cart.item_count; count.hidden = cart.item_count === 0; });
      if (!cart.items.length) {
        this.items.innerHTML = `<div class="empty-state"><p>${config.strings.emptyCart}</p><a class="button button--primary" href="${config.routes.allProducts}">${config.strings.continueShopping}</a></div>`;
        this.footer.hidden = true;
        return;
      }
      this.items.innerHTML = cart.items.map((item, index) => `
        <article class="drawer-line">
          ${item.image ? `<a href="${item.url}"><img src="${item.image}" alt="" width="96" height="120" loading="lazy"></a>` : ''}
          <div class="drawer-line__content">
            <a href="${item.url}"><strong>${escapeHTML(item.product_title)}</strong></a>
            ${item.variant_title && item.variant_title !== 'Default Title' ? `<span>${escapeHTML(item.variant_title)}</span>` : ''}
            <span>${formatMoney(item.final_price, config.moneyFormat)}</span>
            <div class="quantity-control quantity-control--small">
              <button type="button" data-line-action data-line="${index + 1}" data-quantity="${Math.max(0, item.quantity - 1)}" aria-label="${config.strings.decreaseQuantity}">−</button>
              <span>${item.quantity}</span>
              <button type="button" data-line-action data-line="${index + 1}" data-quantity="${item.quantity + 1}" aria-label="${config.strings.increaseQuantity}">+</button>
            </div>
          </div>
          <strong>${formatMoney(item.final_line_price, config.moneyFormat)}</strong>
        </article>`).join('');
      this.subtotal.textContent = formatMoney(cart.total_price, config.moneyFormat);
      this.footer.hidden = false;
    }

    async change(line, quantity) {
      try {
        await requestJSON(`${config.routes.cartChange}.js`, { method: 'POST', body: JSON.stringify({ line, quantity }) });
        emit('cart:changed');
      } catch (error) {
        this.items.insertAdjacentHTML('afterbegin', `<p class="form-status form-status--error">${error.message}</p>`);
      }
    }
  }
  CartDrawer.focusableSelector = focusable;

  class PredictiveSearch extends HTMLElement {
    connectedCallback() {
      this.input = this.querySelector('[data-predictive-input]');
      this.results = this.querySelector('[data-predictive-results]');
      if (!this.input || !this.results) return;
      this.input.addEventListener('input', () => {
        clearTimeout(this.timer);
        this.timer = setTimeout(() => this.search(), 180);
      });
    }

    async search() {
      const query = this.input.value.trim();
      if (query.length < 2) {
        this.results.hidden = true;
        this.results.innerHTML = '';
        return;
      }
      try {
        const url = `${config.routes.predictiveSearch}?q=${encodeURIComponent(query)}&resources[type]=product,collection,page&resources[limit]=6&section_id=predictive-search`;
        const response = await fetch(url, { credentials: 'same-origin' });
        if (!response.ok) throw new Error('Search failed');
        const html = await response.text();
        const parsed = new DOMParser().parseFromString(html, 'text/html');
        const section = parsed.querySelector('.predictive-results');
        this.results.innerHTML = section ? section.outerHTML : '';
        this.results.hidden = !section;
      } catch (_) {
        this.results.hidden = true;
      }
    }
  }

  class ProductRecommendations extends HTMLElement {
    connectedCallback() {
      if (!this.dataset.url) return;
      const observer = new IntersectionObserver((entries, instance) => {
        if (!entries[0].isIntersecting) return;
        instance.disconnect();
        fetch(this.dataset.url).then((response) => response.text()).then((html) => {
          const parsed = new DOMParser().parseFromString(html, 'text/html');
          const replacement = parsed.querySelector('product-recommendations');
          if (replacement?.innerHTML.trim()) this.innerHTML = replacement.innerHTML;
        });
      }, { rootMargin: '300px' });
      observer.observe(this);
    }
  }

  customElements.define('announcement-bar', AnnouncementBar);
  customElements.define('sticky-header', StickyHeader);
  customElements.define('product-form', ProductForm);
  customElements.define('variant-selector', VariantSelector);
  customElements.define('cart-drawer', CartDrawer);
  customElements.define('predictive-search', PredictiveSearch);
  customElements.define('product-recommendations', ProductRecommendations);

  document.addEventListener('click', (event) => {
    const cartOpen = event.target.closest('[data-cart-open]');
    if (cartOpen) emit('cart:open');

    const searchToggle = event.target.closest('[data-search-toggle]');
    if (searchToggle) {
      const panelId = searchToggle.getAttribute('aria-controls');
      const panel = (panelId && document.getElementById(panelId)) || searchToggle.closest('sticky-header')?.querySelector('[data-search-panel]');
      if (panel) {
        panel.hidden = !panel.hidden;
        searchToggle.setAttribute('aria-expanded', String(!panel.hidden));
        if (!panel.hidden) panel.querySelector('input')?.focus();
      }
    }

    const menuToggle = event.target.closest('[data-menu-toggle]');
    if (menuToggle) {
      const menuId = menuToggle.getAttribute('aria-controls');
      const menu = (menuId && document.getElementById(menuId)) || menuToggle.closest('sticky-header')?.querySelector('[data-mobile-menu]');
      if (menu) {
        menu.hidden = false;
        menu.__trigger = menuToggle;
        requestAnimationFrame(() => {
          menu.classList.add('is-open');
          menu.querySelector('[data-menu-close]')?.focus();
        });
        menuToggle.setAttribute('aria-expanded', 'true');
        document.body.classList.add('drawer-open');
      }
    }

    const menuClose = event.target.closest('[data-menu-close]');
    if (menuClose) {
      const menu = menuClose.closest('[data-mobile-menu]');
      if (menu) {
        menu.classList.remove('is-open');
        const trigger = menu.__trigger || document.querySelector(`[aria-controls="${menu.id}"]`);
        trigger?.setAttribute('aria-expanded', 'false');
        window.setTimeout(() => { menu.hidden = true; }, 280);
        document.body.classList.remove('drawer-open');
        trigger?.focus();
      }
    }

    const filtersToggle = event.target.closest('[data-filters-toggle]');
    if (filtersToggle) {
      const facets = document.querySelector('[data-facets]');
      facets?.classList.toggle('is-open');
      filtersToggle.setAttribute('aria-expanded', String(facets?.classList.contains('is-open')));
    }

    const mediaTarget = event.target.closest('[data-media-target]');
    if (mediaTarget) {
      const root = mediaTarget.closest('[data-product-root]');
      root.querySelectorAll('[data-media-id]').forEach((node) => { node.hidden = node.dataset.mediaId !== mediaTarget.dataset.mediaTarget; });
      root.querySelectorAll('[data-media-target]').forEach((node) => node.classList.toggle('is-active', node === mediaTarget));
    }

    const minus = event.target.closest('[data-quantity-minus]');
    const plus = event.target.closest('[data-quantity-plus]');
    if (minus || plus) {
      const input = event.target.closest('.quantity-control').querySelector('input');
      const next = Number(input.value || 1) + (plus ? 1 : -1);
      input.value = Math.max(Number(input.min || 1), next);
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;

    const openMenu = document.querySelector('[data-mobile-menu].is-open');
    if (openMenu) {
      openMenu.classList.remove('is-open');
      const trigger = openMenu.__trigger || document.querySelector(`[aria-controls="${openMenu.id}"]`);
      trigger?.setAttribute('aria-expanded', 'false');
      window.setTimeout(() => { openMenu.hidden = true; }, 280);
      document.body.classList.remove('drawer-open');
      trigger?.focus();
      return;
    }

    const openSearch = document.querySelector('[data-search-panel]:not([hidden])');
    if (openSearch) {
      openSearch.hidden = true;
      const trigger = document.querySelector(`[aria-controls="${openSearch.id}"]`);
      trigger?.setAttribute('aria-expanded', 'false');
      trigger?.focus();
    }
  });

  document.addEventListener('change', (event) => {
    if (event.target.matches('[data-sort-select]')) event.target.form.submit();
  });

  if (document.body.classList.contains('has-reveal') && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add('is-revealed'); revealObserver.unobserve(entry.target); } });
    }, { threshold: 0.12 });
    document.querySelectorAll('[data-reveal]').forEach((node) => revealObserver.observe(node));
  } else {
    document.querySelectorAll('[data-reveal]').forEach((node) => node.classList.add('is-revealed'));
  }
})();
