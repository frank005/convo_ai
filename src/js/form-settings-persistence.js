/**
 * Persist form field values (except channel + RTC tokens) to localStorage so a refresh restores the UI.
 * Channel name is intentionally not restored so tokens are always regenerated against a deliberate channel.
 */
(function () {
    const STORAGE_KEY = "convo_ai_form_state_v1";

    const SKIP_IDS = new Set([
        "agoraChannelName",
        "agoraRtcToken",
        "clientRtcToken",
        "avatarRtcToken",
        "outboundCallSipRtcToken",
        "customerId",
        "customerSecret",
        "appId",
        "appCertificate",
    ]);

    const state = {
        _restoring: false,
        _saveTimer: null,
    };

    function escapeName(name) {
        return typeof CSS !== "undefined" && CSS.escape ? CSS.escape(name) : String(name).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
    }

    function collectRadioGroups() {
        const out = {};
        const seen = new Set();
        document.querySelectorAll('input[type="radio"][name]').forEach((el) => {
            const name = el.name;
            if (!name || seen.has(name)) return;
            seen.add(name);
            const checked = document.querySelector(`input[type="radio"][name="${escapeName(name)}"]:checked`);
            if (checked) {
                out[`radio:${name}`] = checked.value;
            }
        });
        return out;
    }

    function collect() {
        const data = collectRadioGroups();
        document.querySelectorAll("[id]").forEach((el) => {
            const id = el.id;
            if (!id || SKIP_IDS.has(id)) return;
            const tag = el.tagName;
            if (tag === "INPUT") {
                const type = (el.type || "text").toLowerCase();
                if (type === "button" || type === "submit" || type === "reset" || type === "file") {
                    return;
                }
                if (type === "hidden" && id !== "preset") {
                    return;
                }
                if (type === "radio") return;
                if (type === "checkbox") {
                    data[id] = el.checked;
                    return;
                }
                data[id] = el.value;
                return;
            }
            if (tag === "SELECT" || tag === "TEXTAREA") {
                data[id] = el.value;
            }
        });
        return data;
    }

    function apply(data) {
        if (!data || typeof data !== "object") return;
        state._restoring = true;
        try {
            Object.keys(data).forEach((key) => {
                if (key.startsWith("radio:")) {
                    const name = key.slice(6);
                    const val = data[key];
                    document.querySelectorAll(`input[type="radio"][name="${escapeName(name)}"]`).forEach((r) => {
                        r.checked = r.value === val;
                    });
                    return;
                }
                const el = document.getElementById(key);
                if (!el) return;
                const val = data[key];
                if (el.tagName === "INPUT") {
                    const type = (el.type || "text").toLowerCase();
                    if (type === "checkbox") {
                        el.checked = !!val;
                    } else if (
                        type !== "radio" &&
                        type !== "button" &&
                        type !== "submit" &&
                        type !== "file" &&
                        (type !== "hidden" || key === "preset")
                    ) {
                        el.value = val != null ? String(val) : "";
                    }
                    return;
                }
                if (el.tagName === "SELECT" || el.tagName === "TEXTAREA") {
                    el.value = val != null ? String(val) : "";
                }
            });
        } finally {
            state._restoring = false;
        }
    }

    function save() {
        if (state._restoring) return;
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(collect()));
        } catch (e) {
            console.warn("Form settings save failed:", e);
        }
    }

    function scheduleSave() {
        if (state._restoring) return;
        clearTimeout(state._saveTimer);
        state._saveTimer = setTimeout(save, 500);
    }

    function applyFromStorage() {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        let parsed;
        try {
            parsed = JSON.parse(raw);
        } catch {
            return;
        }
        apply(parsed);
    }

    function attachSaveListeners() {
        document.addEventListener("input", scheduleSave, true);
        document.addEventListener("change", scheduleSave, true);
    }

    window.FormSettingsPersistence = {
        STORAGE_KEY,
        applyFromStorage,
        attachSaveListeners,
        save,
        collect,
        apply,
    };
})();
