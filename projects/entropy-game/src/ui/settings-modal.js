/**
 * Settings Modal Component
 * Allows configuration of statistical significance (alpha), warm-up keys, sound effects, and sandbox mode.
 */
export class SettingsModal {
  /**
   * @param {HTMLElement} container
   * @param {Object} options
   */
  constructor(container, options = {}) {
    this.container = container;
    this.onSave = options.onSave || (() => {});
    this.render();
  }

  render() {
    this.container.innerHTML = `
      <div class="modal-backdrop" id="settings-backdrop" style="display: none;">
        <div class="modal-dialog settings-dialog">
          <div class="modal-header">
            <div class="modal-title">⚙️ Engine & Statistical Settings</div>
            <button class="modal-close-btn" id="settings-close-btn">&times;</button>
          </div>
          <div class="modal-body settings-body">
            <!-- Setting 1: Significance Level (Alpha) -->
            <div class="setting-group">
              <label class="setting-label" for="setting-alpha">
                Significance Level (α) & Ville Threshold
              </label>
              <div class="setting-desc">
                Lower α requires stronger proof of non-randomness before halting.
              </div>
              <select class="form-select" id="setting-alpha">
                <option value="0.05">α = 0.05 (Threshold: 20× evidence, Lenient)</option>
                <option value="0.01" selected>α = 0.01 (Threshold: 100× evidence, Standard)</option>
                <option value="0.001">α = 0.001 (Threshold: 1,000× evidence, Highly Strict)</option>
              </select>
            </div>

            <!-- Setting 2: Warm-up keys -->
            <div class="setting-group">
              <label class="setting-label" for="setting-minkeys">
                Minimum Warm-up Keystrokes
              </label>
              <div class="setting-desc">
                Minimum keys before statistical halt can trigger, avoiding tiny sample noise.
              </div>
              <select class="form-select" id="setting-minkeys">
                <option value="15" selected>15 keystrokes (Standard)</option>
                <option value="25">25 keystrokes (Extended warmup)</option>
                <option value="50">50 keystrokes (Large sample)</option>
              </select>
            </div>

            <!-- Setting 3: Audio Feedback -->
            <div class="setting-group">
              <label class="checkbox-label">
                <input type="checkbox" id="setting-sound" checked>
                <span>Enable Web Audio Keystroke Synthesis & Chimes</span>
              </label>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-primary" id="btn-save-settings">Save & Apply</button>
          </div>
        </div>
      </div>
    `;

    this.backdrop = this.container.querySelector('#settings-backdrop');
    this.closeBtn = this.container.querySelector('#settings-close-btn');
    this.saveBtn = this.container.querySelector('#btn-save-settings');
    this.alphaSelect = this.container.querySelector('#setting-alpha');
    this.minKeysSelect = this.container.querySelector('#setting-minkeys');
    this.soundCheckbox = this.container.querySelector('#setting-sound');

    this.closeBtn.addEventListener('click', () => this.hide());
    this.saveBtn.addEventListener('click', () => {
      const alpha = parseFloat(this.alphaSelect.value);
      const minKeys = parseInt(this.minKeysSelect.value, 10);
      const sound = this.soundCheckbox.checked;

      this.onSave({ alpha, minKeys, sound });
      this.hide();
    });
  }

  show(currentSettings) {
    if (currentSettings) {
      this.alphaSelect.value = `${currentSettings.alpha}`;
      this.minKeysSelect.value = `${currentSettings.minKeys}`;
      this.soundCheckbox.checked = currentSettings.sound !== false;
    }
    this.backdrop.style.display = 'flex';
  }

  hide() {
    this.backdrop.style.display = 'none';
  }
}
