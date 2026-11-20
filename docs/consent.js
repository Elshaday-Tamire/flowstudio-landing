/*
 * FlowStudio cookie consent: one file used by every page.
 *
 * Order matters. This file must load in <head>, after vendor/cookieconsent/cookieconsent.umd.js
 * and BEFORE Google Tag Manager or any other tag.
 *
 * What it does
 *  1. Tells Google Consent Mode that everything is denied, before any tag runs.
 *  2. Shows the banner (Accept all / Reject all / Manage preferences).
 *  3. Sends the visitor's choice to Google (consent update), to GTM (dataLayer event)
 *     and to PostHog (full tracking on Accept, anonymous cookieless counting on Reject).
 *  4. Any link to "#cookie-settings" reopens the preferences window.
 */
(function () {
  'use strict';

  /* ---------- Settings ---------- */
  // Public PostHog project key (safe to publish). Empty = PostHog is not loaded at all.
  var POSTHOG_KEY = window.FS_POSTHOG_KEY || '';
  var POSTHOG_HOST = 'https://eu.i.posthog.com';
  // Bump when the privacy policy or the cookie list changes: everyone is asked again.
  var CONSENT_REVISION = 1;
  // Share the choice with app.flowstudio-ai.com; fall back to the current host when testing locally.
  var COOKIE_DOMAIN = /(^|\.)flowstudio-ai\.com$/.test(location.hostname) ? '.flowstudio-ai.com' : location.hostname;

  /* ---------- 1. Google Consent Mode v2: denied by default ---------- */
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = window.gtag || gtag;
  window.gtag('consent', 'default', {
    analytics_storage: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    functionality_storage: 'granted',
    security_storage: 'granted',
    wait_for_update: 500
  });

  /* ---------- PostHog: loaded once, captures nothing until the visitor answers ---------- */
  function loadPostHog() {
    if (!POSTHOG_KEY || window.posthog) return;
    /* eslint-disable */
    !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="init capture register register_once register_for_session unregister unregister_for_session getFeatureFlag getFeatureFlagPayload isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSessionId getSurveys getActiveMatchingSurveys renderSurvey canRenderSurvey getNextSurveyStep identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException loadToolbar get_property getSessionProperty createPersonProfile opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing clear_opt_in_out_capturing debug".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
    /* eslint-enable */
    window.posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,
      person_profiles: 'identified_only',
      // Accept: normal tracking with a cookie. Reject: anonymous, cookieless counting.
      // Before an answer: nothing is captured and nothing is stored.
      cookieless_mode: 'on_reject',
      cross_subdomain_cookie: true,
      disable_session_recording: true,
      // We don't use feature flags; skip that call so nothing is sent before the visitor answers.
      advanced_disable_flags: true
    });
  }

  /* ---------- 3. Send the choice to Google, GTM and PostHog ---------- */
  // Runs on every page load once the visitor has answered ('load'), and when they change it ('change').
  function sendChoice(source) {
    var analytics = window.CookieConsent.acceptedCategory('analytics');
    var key = analytics ? 'granted' : 'denied';

    window.gtag('consent', 'update', { analytics_storage: key });
    window.dataLayer.push({ event: 'consent_update', consent_analytics: key, consent_source: source });

    if (window.posthog) {
      if (analytics) window.posthog.opt_in_capturing();
      else window.posthog.opt_out_capturing();
    }
  }

  /* ---------- 2. The banner ---------- */
  function start() {
    if (!window.CookieConsent) return;
    loadPostHog();

    window.CookieConsent.run({
      revision: CONSENT_REVISION,
      cookie: {
        name: 'fs_consent',
        domain: COOKIE_DOMAIN,
        sameSite: 'Lax',
        expiresAfterDays: 182
      },
      guiOptions: {
        consentModal: { layout: 'box wide', position: 'bottom left', equalWeightButtons: true, flipButtons: false },
        preferencesModal: { layout: 'box', equalWeightButtons: true, flipButtons: false }
      },
      categories: {
        necessary: { enabled: true, readOnly: true },
        analytics: {
          autoClear: { cookies: [{ name: /^ph_/ }] }
        }
      },
      onConsent: function () { sendChoice('load'); },
      onChange: function () { sendChoice('change'); },
      language: {
        default: 'en',
        translations: {
          en: {
            consentModal: {
              title: 'Cookies, your call.',
              description: 'We use analytics cookies to see which pages help people and to improve FlowStudio. If you reject them, we only count visits anonymously, with no cookies. <a href="Legal.dc.html#privacy">Privacy Policy</a>',
              acceptAllBtn: 'Accept all',
              acceptNecessaryBtn: 'Reject all',
              showPreferencesBtn: 'Manage preferences'
            },
            preferencesModal: {
              title: 'Cookie settings',
              acceptAllBtn: 'Accept all',
              acceptNecessaryBtn: 'Reject all',
              savePreferencesBtn: 'Save my choice',
              closeIconLabel: 'Close',
              sections: [
                { description: 'Choose which cookies we may use. You can change this at any time from the "Cookie settings" link at the bottom of every page.' },
                {
                  title: 'Strictly necessary <span class="pm__badge">Always on</span>',
                  description: 'Needed for the site to work and to remember your cookie choice.',
                  linkedCategory: 'necessary'
                },
                {
                  title: 'Analytics',
                  description: 'Helps us understand how visitors use the site and which campaigns bring them (PostHog, hosted in the EU). If you turn this off, we still count visits anonymously, with no cookies or stored IDs.',
                  linkedCategory: 'analytics',
                  cookieTable: {
                    headers: { name: 'Cookie', domain: 'Domain', desc: 'Purpose' },
                    body: [
                      { name: 'ph_*_posthog', domain: 'flowstudio-ai.com', desc: 'Remembers an anonymous visitor ID so repeat visits are counted once.' }
                    ]
                  }
                },
                {
                  title: 'More information',
                  description: 'Questions about cookies or your data? See our <a href="Legal.dc.html#privacy">Privacy Policy</a>.'
                }
              ]
            }
          }
        }
      }
    });
  }

  /* ---------- 4. "Cookie settings" links ---------- */
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest && e.target.closest('a[href="#cookie-settings"]');
    if (!a || !window.CookieConsent) return;
    e.preventDefault();
    window.CookieConsent.showPreferences();
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
