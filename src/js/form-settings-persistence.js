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

    /** IDs whose `change` handlers show/hide panels or lock modalities (must run after listeners exist). */
    const SYNC_CHANGE_IDS = [
        "deprecatedFeatures",
        "enableMllm",
        "enableAvatar",
        "avatarVendor",
        "enableSubtitles",
        "subtitleModeRTM",
        "subtitleModeDataStream",
        "enableRtm",
        "enableSal",
        "parametersEnabled",
        "overrideLlm",
        "overrideTts",
        "overrideAsr",
        "showGeofenceSettings",
        "showRtcEncryptionSettings",
        "showBackendPipelineSettings",
        "ttsVendor",
        "llmVendor",
        "asrVendor",
        "asrLanguage",
        "mllmVendor",
        "asrPreset",
        "llmPreset",
        "ttsPreset",
        "rtcEncryptionMode",
        "turnDetectionEnabled",
        "interruptMode",
        "turnDetectionType",
        "turnV24StartOfSpeechMode",
        "turnV24EndOfSpeechMode",
        "farewellGracefulEnabled",
        "enableTools",
        "fillerWordsEnable",
        "inputImage",
        "outputAudio",
        "turnsFetchAllPages",
    ];

    /** "Set" checkbox → linked field `disabled` state (no `change` handlers on these sets). */
    const LINKED_SET_FIELD_PAIRS = [
        ["transcriptEnableSet", "transcriptEnable"],
        ["transcriptProtocolVersionSet", "transcriptProtocolVersion"],
        ["transcriptEnableWordsSet", "transcriptEnableWords"],
        ["transcriptRedundantSet", "transcriptRedundant"],
        ["expSetBaseUrl", "expBaseUrl"],
        ["expSetRtcCodec", "expRtcCodec"],
        ["expSetRtcScenario", "expRtcScenario"],
        ["expSetRtcSdkParams", "expRtcSdkParams"],
        ["expSetAudioPassthrough", "expAudioPassthrough"],
        ["expSetAudioAec", "expAudioAec"],
        ["expSetAudioAgc", "expAudioAgc"],
        ["expSetAudioAns", "expAudioAns"],
        ["expSetAudioAnsModeType", "expAudioAnsModeType"],
        ["expSetAudioAnsSuppressionMode", "expAudioAnsSuppressionMode"],
        ["expSetAivadForceThreshold", "expAivadForceThreshold"],
        ["expSetLlmInterruptFlag", "expLlmInterruptFlag"],
        ["expSetLlmIgnoreEmpty", "expLlmIgnoreEmpty"],
        ["expSetLlmNonFinalForEmpty", "expLlmNonFinalForEmpty"],
        ["expSetLlmEmptyFlag", "expLlmEmptyFlag"],
        ["expSetLlmAutoMerge", "expLlmAutoMerge"],
        ["expSetLlmGreetingInterruptable", "expLlmGreetingInterruptable"],
        ["expSetAsrHotwords", "expAsrHotwords"],
        ["expSetTurnEosTimeout", "expTurnEosTimeout"],
        ["expSetTurnStrategy", "expTurnStrategy"],
        ["expSetTurnStrictTimestamp", "expTurnStrictTimestamp"],
        ["expSetTranscriptEnable", "expTranscriptEnable"],
        ["expSetTranscriptEnableWords", "expTranscriptEnableWords"],
        ["expSetTranscriptRedundant", "expTranscriptRedundant"],
        ["expSetTranscriptProtocolVersion", "expTranscriptProtocolVersion"],
    ];

    function syncLinkedSetFields() {
        LINKED_SET_FIELD_PAIRS.forEach(([setId, fieldId]) => {
            const setEl = document.getElementById(setId);
            const fieldEl = document.getElementById(fieldId);
            if (setEl && fieldEl) {
                fieldEl.disabled = !setEl.checked;
            }
        });
    }

    function syncTurnDetectionV24Panel() {
        const enableMllm = document.getElementById("enableMllm");
        if (enableMllm && enableMllm.checked) return;

        const v24Enabled = document.getElementById("turnDetectionV24Enabled");
        const v24Config = document.getElementById("turnDetectionV24Config");
        if (!v24Enabled || !v24Config) return;

        if (v24Enabled.checked) {
            v24Config.classList.remove("hidden");
        } else {
            v24Config.classList.add("hidden");
        }
    }

    function dispatchInputOrChange(id, type) {
        const el = document.getElementById(id);
        if (!el) return;
        el.dispatchEvent(new Event(type, { bubbles: true }));
    }

    /**
     * Re-run dependent UI after restoring checkbox/select values (panels, modalities, subtitles mode).
     * Call once at the end of DOMContentLoaded, after all change listeners are registered.
     */
    function syncDependentUI() {
        window.__formSettingRestoreSync = true;
        try {
            dispatchInputOrChange("pipelineId", "input");

            SYNC_CHANGE_IDS.forEach((id) => dispatchInputOrChange(id, "change"));

            syncLinkedSetFields();

            if (typeof window.applyAllPresetState === "function") {
                window.applyAllPresetState();
            }
            if (typeof window.updateTurnV24SubVisibility === "function") {
                window.updateTurnV24SubVisibility();
            }
            if (typeof window.syncTurnsPaginationUi === "function") {
                window.syncTurnsPaginationUi();
            }
            syncTurnDetectionV24Panel();

            if (typeof window.syncOptionalAgentSettingsPanels === "function") {
                window.syncOptionalAgentSettingsPanels();
            }
            if (typeof window.syncTurnDetectionUi === "function") {
                window.syncTurnDetectionUi();
            }
            if (typeof window.applyMllmTurnDetectionUiLayout === "function") {
                window.applyMllmTurnDetectionUiLayout();
            }
            if (window.ui && typeof window.ui.syncRestoredFormDependents === "function") {
                window.ui.syncRestoredFormDependents();
            }
        } finally {
            window.__formSettingRestoreSync = false;
        }
    }

    function attachSaveListeners() {
        document.addEventListener("input", scheduleSave, true);
        document.addEventListener("change", scheduleSave, true);
    }

    window.FormSettingsPersistence = {
        STORAGE_KEY,
        applyFromStorage,
        syncDependentUI,
        attachSaveListeners,
        save,
        collect,
        apply,
    };
})();
