import { useEffect, useState, useCallback } from 'react';
import { Cookie, X, Settings } from 'lucide-react';
import './ConsentBanner.scss';

type ConsentStatus = 'granted' | 'denied';

interface ConsentPreferences {
  analytics_storage: ConsentStatus;
  ad_storage: ConsentStatus;
  ad_user_data: ConsentStatus;
  ad_personalization: ConsentStatus;
}

const CONSENT_STORAGE_KEY = 'ga_consent';
const CONSENT_VERSION = '1'; // 版本號，用於未來更新時重新顯示橫幅

export function ConsentBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<ConsentPreferences>({
    analytics_storage: 'granted',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
  });

  const updateConsentMode = useCallback((newPreferences: ConsentPreferences) => {
    // 確保 gtag 已載入
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('consent', 'update', {
        analytics_storage: newPreferences.analytics_storage,
        ad_storage: newPreferences.ad_storage,
        ad_user_data: newPreferences.ad_user_data,
        ad_personalization: newPreferences.ad_personalization,
      });
    } else {
      // 如果 gtag 還沒載入，等待一下再試
      setTimeout(() => {
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('consent', 'update', {
            analytics_storage: newPreferences.analytics_storage,
            ad_storage: newPreferences.ad_storage,
            ad_user_data: newPreferences.ad_user_data,
            ad_personalization: newPreferences.ad_personalization,
          });
        }
      }, 100);
    }
  }, []);

  useEffect(() => {
    // 檢查是否已經有同意記錄
    const savedConsent = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!savedConsent) {
      // 沒有記錄，顯示橫幅
      setIsVisible(true);
    } else {
      try {
        const consent = JSON.parse(savedConsent);
        // 檢查版本號，如果版本不同則重新顯示
        if (consent.version !== CONSENT_VERSION) {
          setIsVisible(true);
        } else {
          // 已有同意記錄，更新 consent mode
          updateConsentMode(consent.preferences);
        }
      } catch {
        // 解析失敗，顯示橫幅
        setIsVisible(true);
      }
    }
  }, [updateConsentMode]);

  const handleAcceptAll = () => {
    const allGranted: ConsentPreferences = {
      analytics_storage: 'granted',
      ad_storage: 'granted',
      ad_user_data: 'granted',
      ad_personalization: 'granted',
    };
    saveConsent(allGranted);
    updateConsentMode(allGranted);
    setIsVisible(false);
  };

  const handleRejectAll = () => {
    const allDenied: ConsentPreferences = {
      analytics_storage: 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
    };
    saveConsent(allDenied);
    updateConsentMode(allDenied);
    setIsVisible(false);
  };

  const handleSavePreferences = () => {
    saveConsent(preferences);
    updateConsentMode(preferences);
    setIsVisible(false);
    setShowSettings(false);
  };

  const saveConsent = (prefs: ConsentPreferences) => {
    const consentData = {
      version: CONSENT_VERSION,
      preferences: prefs,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(consentData));
  };

  const togglePreference = (key: keyof ConsentPreferences) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: prev[key] === 'granted' ? 'denied' : 'granted',
    }));
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Consent Banner */}
      <div className="consent-banner">
        <div className="consent-banner-container">
          {!showSettings ? (
            // 簡化視圖
            <div className="consent-banner-content">
              <div className="consent-banner-header">
                <div className="consent-banner-icon">
                  <Cookie />
                </div>
                <div className="consent-banner-text">
                  <h3>我們使用 Cookie</h3>
                  <p>
                    我們使用 Cookie 和類似技術來改善您的瀏覽體驗、分析網站流量，並提供個人化內容。點擊「接受全部」即表示您同意我們使用這些技術。
                  </p>
                </div>
                <button
                  onClick={() => setIsVisible(false)}
                  className="consent-banner-close"
                  aria-label="關閉"
                >
                  <X />
                </button>
              </div>

              <div className="consent-banner-buttons">
                <button
                  onClick={handleRejectAll}
                  className="consent-button consent-button-reject"
                >
                  拒絕全部
                </button>
                <button
                  onClick={() => setShowSettings(true)}
                  className="consent-button consent-button-settings"
                >
                  <Settings />
                  <span className="settings-text-full">自訂設定</span>
                  <span className="settings-text-short">設定</span>
                </button>
                <button
                  onClick={handleAcceptAll}
                  className="consent-button consent-button-accept"
                >
                  接受全部
                </button>
              </div>
            </div>
          ) : (
            // 詳細設定視圖
            <div className="consent-banner-content">
              <div className="consent-settings-header">
                <h3>
                  <Settings />
                  Cookie 設定
                </h3>
                <button
                  onClick={() => setShowSettings(false)}
                  className="consent-banner-close"
                  aria-label="返回"
                >
                  <X />
                </button>
              </div>

              <div className="consent-settings-list">
                <p className="consent-settings-description">
                  您可以選擇要允許哪些類型的 Cookie。某些 Cookie 對於網站的基本功能是必需的。
                </p>

                {/* Analytics Storage */}
                <div className="consent-setting-item">
                  <div className="consent-setting-content">
                    <div>
                      <h4>分析 Cookie</h4>
                      <p>用於收集和分析網站使用情況的資訊</p>
                    </div>
                    <label className="consent-toggle">
                      <input
                        type="checkbox"
                        checked={preferences.analytics_storage === 'granted'}
                        onChange={() => togglePreference('analytics_storage')}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>

                {/* Ad Storage */}
                <div className="consent-setting-item">
                  <div className="consent-setting-content">
                    <div>
                      <h4>廣告 Cookie</h4>
                      <p>用於顯示個人化廣告</p>
                    </div>
                    <label className="consent-toggle">
                      <input
                        type="checkbox"
                        checked={preferences.ad_storage === 'granted'}
                        onChange={() => togglePreference('ad_storage')}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>

                {/* Ad User Data */}
                <div className="consent-setting-item">
                  <div className="consent-setting-content">
                    <div>
                      <h4>廣告使用者資料</h4>
                      <p>用於廣告目的的使用者資料收集</p>
                    </div>
                    <label className="consent-toggle">
                      <input
                        type="checkbox"
                        checked={preferences.ad_user_data === 'granted'}
                        onChange={() => togglePreference('ad_user_data')}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>

                {/* Ad Personalization */}
                <div className="consent-setting-item">
                  <div className="consent-setting-content">
                    <div>
                      <h4>廣告個人化</h4>
                      <p>用於個人化廣告體驗</p>
                    </div>
                    <label className="consent-toggle">
                      <input
                        type="checkbox"
                        checked={preferences.ad_personalization === 'granted'}
                        onChange={() => togglePreference('ad_personalization')}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="consent-settings-footer">
                <button
                  onClick={handleRejectAll}
                  className="consent-button consent-button-reject"
                >
                  拒絕全部
                </button>
                <button
                  onClick={handleSavePreferences}
                  className="consent-button consent-button-accept"
                >
                  儲存設定
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

