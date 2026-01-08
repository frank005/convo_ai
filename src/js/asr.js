class ASRManager {
    constructor() {
        console.log('ASRManager constructor called');
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        console.log('initializeEventListeners called');
        // ASR vendor selection logic
        const asrVendor = document.getElementById('asrVendor');
        if (asrVendor) {
            asrVendor.addEventListener('change', () => this.updateAsrConfigVisibility());
        }

        // Add event listener for language changes to show/hide phrase list
        const asrLanguage = document.getElementById('asrLanguage');
        if (asrLanguage) {
            asrLanguage.addEventListener('change', () => this.updatePhraseListVisibility());
        }
    }

    // Languages that support phrase lists according to Microsoft docs
    getPhraseListSupportedLanguages() {
        return [
            'ar-SA', 'de-CH', 'de-DE', 'en-AU', 'en-CA', 'en-GB', 'en-IE', 'en-IN', 'en-US', 'en-ZA'
        ];
    }

    updatePhraseListVisibility() {
        const asrVendor = document.getElementById('asrVendor');
        const asrLanguage = document.getElementById('asrLanguage');
        const phraseListContainer = document.getElementById('microsoftAsrPhraseList').parentElement;

        if (asrVendor.value === 'microsoft' && asrLanguage.value) {
            const supportedLanguages = this.getPhraseListSupportedLanguages();
            const isSupported = supportedLanguages.includes(asrLanguage.value);
            
            if (isSupported) {
                phraseListContainer.classList.remove('hidden');
                phraseListContainer.querySelector('.tooltip').textContent = 
                    'A list of words or phrases to improve recognition accuracy. Separate with commas.';
            } else {
                phraseListContainer.classList.add('hidden');
                // Clear the phrase list when language doesn't support it
                document.getElementById('microsoftAsrPhraseList').value = '';
            }
        }
    }

    updateAsrConfigVisibility() {
        const asrVendor = document.getElementById('asrVendor');
        const asrLanguageContainer = document.getElementById('asrLanguage')?.parentElement; // Get the container div
        const microsoftAsrConfig = document.getElementById('microsoftAsrConfig');
        const deepgramAsrConfig = document.getElementById('deepgramAsrConfig');
        const openaiAsrConfig = document.getElementById('openaiAsrConfig');
        const speechmaticsAsrConfig = document.getElementById('speechmaticsAsrConfig');
        const assemblyaiAsrConfig = document.getElementById('assemblyaiAsrConfig');
        const amazonAsrConfig = document.getElementById('amazonAsrConfig');
        const googleAsrConfig = document.getElementById('googleAsrConfig');
        const sarvamAsrConfig = document.getElementById('sarvamAsrConfig');
        const customAsrConfig = document.getElementById('customAsrConfig');

        if (!asrVendor) {
            return;
        }

        const selectedVendor = asrVendor.value;
        console.log('Selected vendor:', selectedVendor);
        
        // Hide all config sections
        if (microsoftAsrConfig) microsoftAsrConfig.classList.add('hidden');
        if (deepgramAsrConfig) deepgramAsrConfig.classList.add('hidden');
        if (openaiAsrConfig) openaiAsrConfig.classList.add('hidden');
        if (speechmaticsAsrConfig) speechmaticsAsrConfig.classList.add('hidden');
        if (assemblyaiAsrConfig) assemblyaiAsrConfig.classList.add('hidden');
        if (amazonAsrConfig) amazonAsrConfig.classList.add('hidden');
        if (googleAsrConfig) googleAsrConfig.classList.add('hidden');
        if (sarvamAsrConfig) sarvamAsrConfig.classList.add('hidden');
        if (customAsrConfig) customAsrConfig.classList.add('hidden');
        
        // Show/hide main language dropdown based on vendor
        // Speechmatics, AssemblyAI, Amazon, Google, Sarvam, and Custom have their own language fields or don't need language selection
        if (asrLanguageContainer) {
            if (selectedVendor === 'speechmatics' || selectedVendor === 'assemblyai' || selectedVendor === 'amazon' || selectedVendor === 'google' || selectedVendor === 'sarvam' || selectedVendor === 'custom') {
                asrLanguageContainer.classList.add('hidden');
            } else {
                asrLanguageContainer.classList.remove('hidden');
            }
        }
        
        // Show the selected config section (ARES doesn't need additional config)
        if (selectedVendor === 'microsoft' && microsoftAsrConfig) {
            microsoftAsrConfig.classList.remove('hidden');
        } else if (selectedVendor === 'deepgram' && deepgramAsrConfig) {
            deepgramAsrConfig.classList.remove('hidden');
        } else if (selectedVendor === 'openai' && openaiAsrConfig) {
            openaiAsrConfig.classList.remove('hidden');
        } else if (selectedVendor === 'speechmatics' && speechmaticsAsrConfig) {
            speechmaticsAsrConfig.classList.remove('hidden');
        } else if (selectedVendor === 'assemblyai' && assemblyaiAsrConfig) {
            assemblyaiAsrConfig.classList.remove('hidden');
        } else if (selectedVendor === 'amazon' && amazonAsrConfig) {
            amazonAsrConfig.classList.remove('hidden');
        } else if (selectedVendor === 'google' && googleAsrConfig) {
            googleAsrConfig.classList.remove('hidden');
        } else if (selectedVendor === 'sarvam' && sarvamAsrConfig) {
            sarvamAsrConfig.classList.remove('hidden');
        } else if (selectedVendor === 'custom' && customAsrConfig) {
            customAsrConfig.classList.remove('hidden');
        }
        // For ARES, no additional config section is shown
        
        // Update language dropdown based on selected vendor (only if it's visible)
        if (selectedVendor !== 'speechmatics' && selectedVendor !== 'assemblyai' && selectedVendor !== 'amazon' && selectedVendor !== 'google' && selectedVendor !== 'sarvam' && selectedVendor !== 'custom') {
            this.updateAsrLanguageDropdown(selectedVendor);
        }
    }

    updateAsrLanguageDropdown(vendor) {
        console.log('updateAsrLanguageDropdown called with vendor:', vendor);
        const langSelect = document.getElementById('asrLanguage');
        if (!langSelect) {
            return;
        }
        
        langSelect.innerHTML = '';
        console.log('Cleared langSelect innerHTML');
        
        if (vendor === 'ares') {
            console.log('Populating ARES languages');
            // ARES languages
            const aresLanguages = [
                { value: 'ar-EG', label: 'Arabic (Egypt) (ar-EG)' },
                { value: 'ar-JO', label: 'Arabic (Jordan) (ar-JO)' },
                { value: 'ar-SA', label: 'Arabic (Saudi Arabia) (ar-SA)' },
                { value: 'ar-AE', label: 'Arabic (UAE) (ar-AE)' },
                { value: 'bn-IN', label: 'Bengali (India) (bn-IN)' },
                { value: 'zh-CN', label: 'Chinese (Simplified) (zh-CN)' },
                { value: 'zh-HK', label: 'Chinese (Hong Kong) (zh-HK)' },
                { value: 'zh-TW', label: 'Chinese (Traditional) (zh-TW)' },
                { value: 'nl-NL', label: 'Dutch (Netherlands) (nl-NL)' },
                { value: 'en-IN', label: 'English (India) (en-IN)' },
                { value: 'en-US', label: 'English (US) (en-US)' },
                { value: 'fil-PH', label: 'Filipino (Philippines) (fil-PH)' },
                { value: 'fr-FR', label: 'French (France) (fr-FR)' },
                { value: 'de-DE', label: 'German (Germany) (de-DE)' },
                { value: 'gu-IN', label: 'Gujarati (India) (gu-IN)' },
                { value: 'he-IL', label: 'Hebrew (Israel) (he-IL)' },
                { value: 'hi-IN', label: 'Hindi (India) (hi-IN)' },
                { value: 'id-ID', label: 'Indonesian (Indonesia) (id-ID)' },
                { value: 'it-IT', label: 'Italian (Italy) (it-IT)' },
                { value: 'ja-JP', label: 'Japanese (Japan) (ja-JP)' },
                { value: 'kn-IN', label: 'Kannada (India) (kn-IN)' },
                { value: 'ko-KR', label: 'Korean (Korea) (ko-KR)' },
                { value: 'ms-MY', label: 'Malay (Malaysia) (ms-MY)' },
                { value: 'fa-IR', label: 'Persian (Iran) (fa-IR)' },
                { value: 'pt-PT', label: 'Portuguese (Portugal) (pt-PT)' },
                { value: 'ru-RU', label: 'Russian (Russia) (ru-RU)' },
                { value: 'es-ES', label: 'Spanish (Spain) (es-ES)' },
                { value: 'ta-IN', label: 'Tamil (India) (ta-IN)' },
                { value: 'te-IN', label: 'Telugu (India) (te-IN)' },
                { value: 'th-TH', label: 'Thai (Thailand) (th-TH)' },
                { value: 'tr-TR', label: 'Turkish (Turkey) (tr-TR)' },
                { value: 'vi-VN', label: 'Vietnamese (Vietnam) (vi-VN)' }
            ];
            
            aresLanguages.forEach(lang => {
                const option = document.createElement('option');
                option.value = lang.value;
                option.textContent = lang.label;
                if (lang.value === 'en-US') option.selected = true;
                langSelect.appendChild(option);
            });
            console.log('Added', aresLanguages.length, 'ARES language options');
            
        } else if (vendor === 'microsoft') {
            console.log('Populating Microsoft languages');
            // Microsoft languages - using the comprehensive list from the documentation
            const microsoftLanguages = [
                { value: 'af-ZA', label: 'Afrikaans (South Africa) (af-ZA)' },
                { value: 'am-ET', label: 'Amharic (Ethiopia) (am-ET)' },
                { value: 'ar-AE', label: 'Arabic (UAE) (ar-AE)' },
                { value: 'ar-BH', label: 'Arabic (Bahrain) (ar-BH)' },
                { value: 'ar-DZ', label: 'Arabic (Algeria) (ar-DZ)' },
                { value: 'ar-EG', label: 'Arabic (Egypt) (ar-EG)' },
                { value: 'ar-IL', label: 'Arabic (Israel) (ar-IL)' },
                { value: 'ar-IQ', label: 'Arabic (Iraq) (ar-IQ)' },
                { value: 'ar-JO', label: 'Arabic (Jordan) (ar-JO)' },
                { value: 'ar-KW', label: 'Arabic (Kuwait) (ar-KW)' },
                { value: 'ar-LB', label: 'Arabic (Lebanon) (ar-LB)' },
                { value: 'ar-LY', label: 'Arabic (Libya) (ar-LY)' },
                { value: 'ar-MA', label: 'Arabic (Morocco) (ar-MA)' },
                { value: 'ar-OM', label: 'Arabic (Oman) (ar-OM)' },
                { value: 'ar-PS', label: 'Arabic (Palestinian Authority) (ar-PS)' },
                { value: 'ar-QA', label: 'Arabic (Qatar) (ar-QA)' },
                { value: 'ar-SA', label: 'Arabic (Saudi Arabia) (ar-SA)' },
                { value: 'ar-SY', label: 'Arabic (Syria) (ar-SY)' },
                { value: 'ar-TN', label: 'Arabic (Tunisia) (ar-TN)' },
                { value: 'ar-YE', label: 'Arabic (Yemen) (ar-YE)' },
                { value: 'as-IN', label: 'Assamese (India) (as-IN)' },
                { value: 'az-AZ', label: 'Azerbaijani (Azerbaijan) (az-AZ)' },
                { value: 'bg-BG', label: 'Bulgarian (Bulgaria) (bg-BG)' },
                { value: 'bn-IN', label: 'Bengali (India) (bn-IN)' },
                { value: 'bs-BA', label: 'Bosnian (Bosnia and Herzegovina) (bs-BA)' },
                { value: 'ca-ES', label: 'Catalan (Spain) (ca-ES)' },
                { value: 'cs-CZ', label: 'Czech (Czech Republic) (cs-CZ)' },
                { value: 'cy-GB', label: 'Welsh (United Kingdom) (cy-GB)' },
                { value: 'da-DK', label: 'Danish (Denmark) (da-DK)' },
                { value: 'de-AT', label: 'German (Austria) (de-AT)' },
                { value: 'de-CH', label: 'German (Switzerland) (de-CH)' },
                { value: 'de-DE', label: 'German (Germany) (de-DE)' },
                { value: 'el-GR', label: 'Greek (Greece) (el-GR)' },
                { value: 'en-AU', label: 'English (Australia) (en-AU)' },
                { value: 'en-CA', label: 'English (Canada) (en-CA)' },
                { value: 'en-GB', label: 'English (United Kingdom) (en-GB)' },
                { value: 'en-GH', label: 'English (Ghana) (en-GH)' },
                { value: 'en-HK', label: 'English (Hong Kong) (en-HK)' },
                { value: 'en-IE', label: 'English (Ireland) (en-IE)' },
                { value: 'en-IN', label: 'English (India) (en-IN)' },
                { value: 'en-KE', label: 'English (Kenya) (en-KE)' },
                { value: 'en-NG', label: 'English (Nigeria) (en-NG)' },
                { value: 'en-NZ', label: 'English (New Zealand) (en-NZ)' },
                { value: 'en-PH', label: 'English (Philippines) (en-PH)' },
                { value: 'en-SG', label: 'English (Singapore) (en-SG)' },
                { value: 'en-TZ', label: 'English (Tanzania) (en-TZ)' },
                { value: 'en-US', label: 'English (United States) (en-US)' },
                { value: 'en-ZA', label: 'English (South Africa) (en-ZA)' },
                { value: 'es-AR', label: 'Spanish (Argentina) (es-AR)' },
                { value: 'es-BO', label: 'Spanish (Bolivia) (es-BO)' },
                { value: 'es-CL', label: 'Spanish (Chile) (es-CL)' },
                { value: 'es-CO', label: 'Spanish (Colombia) (es-CO)' },
                { value: 'es-CR', label: 'Spanish (Costa Rica) (es-CR)' },
                { value: 'es-CU', label: 'Spanish (Cuba) (es-CU)' },
                { value: 'es-DO', label: 'Spanish (Dominican Republic) (es-DO)' },
                { value: 'es-EC', label: 'Spanish (Ecuador) (es-EC)' },
                { value: 'es-ES', label: 'Spanish (Spain) (es-ES)' },
                { value: 'es-GQ', label: 'Spanish (Equatorial Guinea) (es-GQ)' },
                { value: 'es-GT', label: 'Spanish (Guatemala) (es-GT)' },
                { value: 'es-HN', label: 'Spanish (Honduras) (es-HN)' },
                { value: 'es-MX', label: 'Spanish (Mexico) (es-MX)' },
                { value: 'es-NI', label: 'Spanish (Nicaragua) (es-NI)' },
                { value: 'es-PA', label: 'Spanish (Panama) (es-PA)' },
                { value: 'es-PE', label: 'Spanish (Peru) (es-PE)' },
                { value: 'es-PR', label: 'Spanish (Puerto Rico) (es-PR)' },
                { value: 'es-PY', label: 'Spanish (Paraguay) (es-PY)' },
                { value: 'es-SV', label: 'Spanish (El Salvador) (es-SV)' },
                { value: 'es-US', label: 'Spanish (United States) (es-US)' },
                { value: 'es-UY', label: 'Spanish (Uruguay) (es-UY)' },
                { value: 'es-VE', label: 'Spanish (Venezuela) (es-VE)' },
                { value: 'et-EE', label: 'Estonian (Estonia) (et-EE)' },
                { value: 'eu-ES', label: 'Basque (Spain) (eu-ES)' },
                { value: 'fa-IR', label: 'Persian (Iran) (fa-IR)' },
                { value: 'fi-FI', label: 'Finnish (Finland) (fi-FI)' },
                { value: 'fil-PH', label: 'Filipino (Philippines) (fil-PH)' },
                { value: 'fr-BE', label: 'French (Belgium) (fr-BE)' },
                { value: 'fr-CA', label: 'French (Canada) (fr-CA)' },
                { value: 'fr-CH', label: 'French (Switzerland) (fr-CH)' },
                { value: 'fr-FR', label: 'French (France) (fr-FR)' },
                { value: 'ga-IE', label: 'Irish (Ireland) (ga-IE)' },
                { value: 'gl-ES', label: 'Galician (Spain) (gl-ES)' },
                { value: 'gu-IN', label: 'Gujarati (India) (gu-IN)' },
                { value: 'he-IL', label: 'Hebrew (Israel) (he-IL)' },
                { value: 'hi-IN', label: 'Hindi (India) (hi-IN)' },
                { value: 'hr-HR', label: 'Croatian (Croatia) (hr-HR)' },
                { value: 'hu-HU', label: 'Hungarian (Hungary) (hu-HU)' },
                { value: 'hy-AM', label: 'Armenian (Armenia) (hy-AM)' },
                { value: 'id-ID', label: 'Indonesian (Indonesia) (id-ID)' },
                { value: 'is-IS', label: 'Icelandic (Iceland) (is-IS)' },
                { value: 'it-CH', label: 'Italian (Switzerland) (it-CH)' },
                { value: 'it-IT', label: 'Italian (Italy) (it-IT)' },
                { value: 'ja-JP', label: 'Japanese (Japan) (ja-JP)' },
                { value: 'jv-ID', label: 'Javanese (Indonesia) (jv-ID)' },
                { value: 'ka-GE', label: 'Georgian (Georgia) (ka-GE)' },
                { value: 'kk-KZ', label: 'Kazakh (Kazakhstan) (kk-KZ)' },
                { value: 'km-KH', label: 'Khmer (Cambodia) (km-KH)' },
                { value: 'kn-IN', label: 'Kannada (India) (kn-IN)' },
                { value: 'ko-KR', label: 'Korean (Korea) (ko-KR)' },
                { value: 'lo-LA', label: 'Lao (Laos) (lo-LA)' },
                { value: 'lt-LT', label: 'Lithuanian (Lithuania) (lt-LT)' },
                { value: 'lv-LV', label: 'Latvian (Latvia) (lv-LV)' },
                { value: 'mk-MK', label: 'Macedonian (North Macedonia) (mk-MK)' },
                { value: 'ml-IN', label: 'Malayalam (India) (ml-IN)' },
                { value: 'mn-MN', label: 'Mongolian (Mongolia) (mn-MN)' },
                { value: 'mr-IN', label: 'Marathi (India) (mr-IN)' },
                { value: 'ms-MY', label: 'Malay (Malaysia) (ms-MY)' },
                { value: 'mt-MT', label: 'Maltese (Malta) (mt-MT)' },
                { value: 'my-MM', label: 'Burmese (Myanmar) (my-MM)' },
                { value: 'nb-NO', label: 'Norwegian Bokmål (Norway) (nb-NO)' },
                { value: 'ne-NP', label: 'Nepali (Nepal) (ne-NP)' },
                { value: 'nl-BE', label: 'Dutch (Belgium) (nl-BE)' },
                { value: 'nl-NL', label: 'Dutch (Netherlands) (nl-NL)' },
                { value: 'nn-NO', label: 'Norwegian Nynorsk (Norway) (nn-NO)' },
                { value: 'or-IN', label: 'Odia (India) (or-IN)' },
                { value: 'pa-IN', label: 'Punjabi (India) (pa-IN)' },
                { value: 'pl-PL', label: 'Polish (Poland) (pl-PL)' },
                { value: 'ps-AF', label: 'Pashto (Afghanistan) (ps-AF)' },
                { value: 'pt-BR', label: 'Portuguese (Brazil) (pt-BR)' },
                { value: 'pt-PT', label: 'Portuguese (Portugal) (pt-PT)' },
                { value: 'ro-RO', label: 'Romanian (Romania) (ro-RO)' },
                { value: 'ru-RU', label: 'Russian (Russia) (ru-RU)' },
                { value: 'si-LK', label: 'Sinhala (Sri Lanka) (si-LK)' },
                { value: 'sk-SK', label: 'Slovak (Slovakia) (sk-SK)' },
                { value: 'sl-SI', label: 'Slovenian (Slovenia) (sl-SI)' },
                { value: 'so-SO', label: 'Somali (Somalia) (so-SO)' },
                { value: 'sq-AL', label: 'Albanian (Albania) (sq-AL)' },
                { value: 'sr-RS', label: 'Serbian (Serbia) (sr-RS)' },
                { value: 'su-ID', label: 'Sundanese (Indonesia) (su-ID)' },
                { value: 'sv-SE', label: 'Swedish (Sweden) (sv-SE)' },
                { value: 'sw-KE', label: 'Swahili (Kenya) (sw-KE)' },
                { value: 'sw-TZ', label: 'Swahili (Tanzania) (sw-TZ)' },
                { value: 'ta-IN', label: 'Tamil (India) (ta-IN)' },
                { value: 'ta-LK', label: 'Tamil (Sri Lanka) (ta-LK)' },
                { value: 'ta-MY', label: 'Tamil (Malaysia) (ta-MY)' },
                { value: 'ta-SG', label: 'Tamil (Singapore) (ta-SG)' },
                { value: 'te-IN', label: 'Telugu (India) (te-IN)' },
                { value: 'th-TH', label: 'Thai (Thailand) (th-TH)' },
                { value: 'tr-TR', label: 'Turkish (Turkey) (tr-TR)' },
                { value: 'uk-UA', label: 'Ukrainian (Ukraine) (uk-UA)' },
                { value: 'ur-IN', label: 'Urdu (India) (ur-IN)' },
                { value: 'ur-PK', label: 'Urdu (Pakistan) (ur-PK)' },
                { value: 'uz-UZ', label: 'Uzbek (Uzbekistan) (uz-UZ)' },
                { value: 'vi-VN', label: 'Vietnamese (Vietnam) (vi-VN)' },
                { value: 'yue-CN', label: 'Chinese (Cantonese, Simplified) (yue-CN)' },
                { value: 'zh-CN', label: 'Chinese (Simplified) (zh-CN)' },
                { value: 'zh-HK', label: 'Chinese (Hong Kong) (zh-HK)' },
                { value: 'zh-TW', label: 'Chinese (Traditional) (zh-TW)' },
                { value: 'zu-ZA', label: 'Zulu (South Africa) (zu-ZA)' }
            ];
            
            microsoftLanguages.forEach(lang => {
                const option = document.createElement('option');
                option.value = lang.value;
                option.textContent = lang.label;
                if (lang.value === 'en-US') option.selected = true;
                langSelect.appendChild(option);
            });
            console.log('Added', microsoftLanguages.length, 'Microsoft language options');
            
            // Update phrase list visibility after populating languages
            this.updatePhraseListVisibility();
            
        } else if (vendor === 'deepgram') {
            console.log('Populating Deepgram languages');
            // Deepgram languages
            const deepgramLanguages = [
                { value: 'af', label: 'Afrikaans' },
                { value: 'am', label: 'Amharic' },
                { value: 'ar', label: 'Arabic' },
                { value: 'az', label: 'Azerbaijani' },
                { value: 'bg', label: 'Bulgarian' },
                { value: 'bn', label: 'Bengali' },
                { value: 'ca', label: 'Catalan' },
                { value: 'cs', label: 'Czech' },
                { value: 'cy', label: 'Welsh' },
                { value: 'da', label: 'Danish' },
                { value: 'de', label: 'German' },
                { value: 'el', label: 'Greek' },
                { value: 'en', label: 'English' },
                { value: 'es', label: 'Spanish' },
                { value: 'et', label: 'Estonian' },
                { value: 'eu', label: 'Basque' },
                { value: 'fa', label: 'Persian' },
                { value: 'fi', label: 'Finnish' },
                { value: 'fil', label: 'Filipino' },
                { value: 'fr', label: 'French' },
                { value: 'ga', label: 'Irish' },
                { value: 'gl', label: 'Galician' },
                { value: 'gu', label: 'Gujarati' },
                { value: 'he', label: 'Hebrew' },
                { value: 'hi', label: 'Hindi' },
                { value: 'hr', label: 'Croatian' },
                { value: 'hu', label: 'Hungarian' },
                { value: 'hy', label: 'Armenian' },
                { value: 'id', label: 'Indonesian' },
                { value: 'is', label: 'Icelandic' },
                { value: 'it', label: 'Italian' },
                { value: 'ja', label: 'Japanese' },
                { value: 'jv', label: 'Javanese' },
                { value: 'ka', label: 'Georgian' },
                { value: 'kk', label: 'Kazakh' },
                { value: 'km', label: 'Khmer' },
                { value: 'kn', label: 'Kannada' },
                { value: 'ko', label: 'Korean' },
                { value: 'lo', label: 'Lao' },
                { value: 'lt', label: 'Lithuanian' },
                { value: 'lv', label: 'Latvian' },
                { value: 'mk', label: 'Macedonian' },
                { value: 'ml', label: 'Malayalam' },
                { value: 'mn', label: 'Mongolian' },
                { value: 'mr', label: 'Marathi' },
                { value: 'ms', label: 'Malay' },
                { value: 'mt', label: 'Maltese' },
                { value: 'my', label: 'Burmese' },
                { value: 'nb', label: 'Norwegian Bokmål' },
                { value: 'ne', label: 'Nepali' },
                { value: 'nl', label: 'Dutch' },
                { value: 'nn', label: 'Norwegian Nynorsk' },
                { value: 'or', label: 'Odia' },
                { value: 'pa', label: 'Punjabi' },
                { value: 'pl', label: 'Polish' },
                { value: 'ps', label: 'Pashto' },
                { value: 'pt', label: 'Portuguese' },
                { value: 'ro', label: 'Romanian' },
                { value: 'ru', label: 'Russian' },
                { value: 'si', label: 'Sinhala' },
                { value: 'sk', label: 'Slovak' },
                { value: 'sl', label: 'Slovenian' },
                { value: 'so', label: 'Somali' },
                { value: 'sq', label: 'Albanian' },
                { value: 'sr', label: 'Serbian' },
                { value: 'su', label: 'Sundanese' },
                { value: 'sv', label: 'Swedish' },
                { value: 'sw', label: 'Swahili' },
                { value: 'ta', label: 'Tamil' },
                { value: 'te', label: 'Telugu' },
                { value: 'th', label: 'Thai' },
                { value: 'tr', label: 'Turkish' },
                { value: 'uk', label: 'Ukrainian' },
                { value: 'ur', label: 'Urdu' },
                { value: 'uz', label: 'Uzbek' },
                { value: 'vi', label: 'Vietnamese' },
                { value: 'yue', label: 'Chinese (Cantonese)' },
                { value: 'zh', label: 'Chinese' },
                { value: 'zu', label: 'Zulu' }
            ];
            
            deepgramLanguages.forEach(lang => {
                const option = document.createElement('option');
                option.value = lang.value;
                option.textContent = lang.label;
                if (lang.value === 'en') option.selected = true;
                langSelect.appendChild(option);
            });
            console.log('Added', deepgramLanguages.length, 'Deepgram language options');
            
        } else if (vendor === 'openai') {
            console.log('Populating OpenAI languages');
            // OpenAI uses standard language codes - using common ones
            const openaiLanguages = [
                { value: 'en-US', label: 'English (US) (en-US)' },
                { value: 'en-GB', label: 'English (UK) (en-GB)' },
                { value: 'es-ES', label: 'Spanish (Spain) (es-ES)' },
                { value: 'fr-FR', label: 'French (France) (fr-FR)' },
                { value: 'de-DE', label: 'German (Germany) (de-DE)' },
                { value: 'it-IT', label: 'Italian (Italy) (it-IT)' },
                { value: 'pt-BR', label: 'Portuguese (Brazil) (pt-BR)' },
                { value: 'ja-JP', label: 'Japanese (Japan) (ja-JP)' },
                { value: 'ko-KR', label: 'Korean (Korea) (ko-KR)' },
                { value: 'zh-CN', label: 'Chinese (Simplified) (zh-CN)' }
            ];
            
            openaiLanguages.forEach(lang => {
                const option = document.createElement('option');
                option.value = lang.value;
                option.textContent = lang.label;
                if (lang.value === 'en-US') option.selected = true;
                langSelect.appendChild(option);
            });
            console.log('Added', openaiLanguages.length, 'OpenAI language options');
            
        } else if (vendor === 'speechmatics') {
            console.log('Populating Speechmatics languages');
            // Speechmatics uses simple language codes
            const speechmaticsLanguages = [
                { value: 'en', label: 'English (en)' },
                { value: 'es', label: 'Spanish (es)' },
                { value: 'fr', label: 'French (fr)' },
                { value: 'de', label: 'German (de)' },
                { value: 'it', label: 'Italian (it)' },
                { value: 'pt', label: 'Portuguese (pt)' },
                { value: 'ja', label: 'Japanese (ja)' },
                { value: 'ko', label: 'Korean (ko)' },
                { value: 'zh', label: 'Chinese (zh)' }
            ];
            
            speechmaticsLanguages.forEach(lang => {
                const option = document.createElement('option');
                option.value = lang.value;
                option.textContent = lang.label;
                if (lang.value === 'en') option.selected = true;
                langSelect.appendChild(option);
            });
            console.log('Added', speechmaticsLanguages.length, 'Speechmatics language options');
            
        } else if (vendor === 'assemblyai') {
            console.log('Populating AssemblyAI languages');
            // AssemblyAI uses BCP-47 language codes
            const assemblyaiLanguages = [
                { value: 'en-US', label: 'English (US) (en-US)' },
                { value: 'en-GB', label: 'English (UK) (en-GB)' },
                { value: 'es-ES', label: 'Spanish (Spain) (es-ES)' },
                { value: 'fr-FR', label: 'French (France) (fr-FR)' },
                { value: 'de-DE', label: 'German (Germany) (de-DE)' },
                { value: 'it-IT', label: 'Italian (Italy) (it-IT)' },
                { value: 'pt-BR', label: 'Portuguese (Brazil) (pt-BR)' },
                { value: 'ja-JP', label: 'Japanese (Japan) (ja-JP)' },
                { value: 'ko-KR', label: 'Korean (Korea) (ko-KR)' },
                { value: 'zh-CN', label: 'Chinese (Simplified) (zh-CN)' }
            ];
            
            assemblyaiLanguages.forEach(lang => {
                const option = document.createElement('option');
                option.value = lang.value;
                option.textContent = lang.label;
                if (lang.value === 'en-US') option.selected = true;
                langSelect.appendChild(option);
            });
            console.log('Added', assemblyaiLanguages.length, 'AssemblyAI language options');
        }
        console.log('Final langSelect options count:', langSelect.options.length);
    }

    // Initialize ASR configuration when modal is opened
    initializeAsrConfig() {
        console.log('initializeAsrConfig called');
        this.updateAsrConfigVisibility();
    }
}

// Export for use in other modules
window.ASRManager = ASRManager;
