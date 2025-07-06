"use client";
import { useEffect } from "react";

export default function PWAScript() {
  useEffect(() => {
    // Register service worker
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("SW registered: ", registration);

            // Check for updates
            registration.addEventListener("updatefound", () => {
              const newWorker = registration.installing;
              if (newWorker) {
                newWorker.addEventListener("statechange", () => {
                  if (
                    newWorker.state === "installed" &&
                    navigator.serviceWorker.controller
                  ) {
                    // New content is available, show update prompt
                    showUpdatePrompt(registration);
                  }
                });
              }
            });
          })
          .catch((registrationError) => {
            console.log("SW registration failed: ", registrationError);
          });
      });

      // Handle service worker updates
      let refreshing = false;
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });
    }

    // Request notification permission
    if ("Notification" in window) {
      Notification.requestPermission();
    }

    // Handle beforeinstallprompt event
    let deferredPrompt: any;
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      deferredPrompt = e;
      showInstallPrompt();
    });

    // Handle appinstalled event
    window.addEventListener("appinstalled", () => {
      console.log("PWA was installed");
      // Hide install prompt if it exists
      hideInstallPrompt();
    });
  }, []);

  const showUpdatePrompt = (registration: ServiceWorkerRegistration) => {
    // Create update notification
    const updateNotification = document.createElement("div");
    updateNotification.id = "pwa-update-notification";
    updateNotification.innerHTML = `
      <div style="
        position: fixed;
        top: 20px;
        right: 20px;
        background: #23232a;
        border: 2px solid #f97316;
        border-radius: 12px;
        padding: 16px;
        color: white;
        z-index: 9999;
        max-width: 300px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      ">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
          <div style="
            width: 24px;
            height: 24px;
            background: #f97316;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
          ">🔄</div>
          <strong>Update Available</strong>
        </div>
        <p style="margin: 0 0 12px 0; color: #a1a1aa; font-size: 14px;">
          A new version is available. Refresh to update.
        </p>
        <div style="display: flex; gap: 8px;">
          <button id="pwa-update-refresh" style="
            background: #f97316;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 600;
          ">Refresh</button>
          <button id="pwa-update-dismiss" style="
            background: transparent;
            color: #a1a1aa;
            border: 1px solid #374151;
            padding: 8px 16px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
          ">Dismiss</button>
        </div>
      </div>
    `;

    document.body.appendChild(updateNotification);

    // Add event listeners
    document
      .getElementById("pwa-update-refresh")
      ?.addEventListener("click", () => {
        registration.waiting?.postMessage({ type: "SKIP_WAITING" });
        updateNotification.remove();
      });

    document
      .getElementById("pwa-update-dismiss")
      ?.addEventListener("click", () => {
        updateNotification.remove();
      });
  };

  const showInstallPrompt = () => {
    // Create install notification
    const installNotification = document.createElement("div");
    installNotification.id = "pwa-install-notification";
    installNotification.innerHTML = `
      <div style="
        position: fixed;
        bottom: 20px;
        left: 20px;
        background: #23232a;
        border: 2px solid #f97316;
        border-radius: 12px;
        padding: 16px;
        color: white;
        z-index: 9999;
        max-width: 300px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      ">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
          <div style="
            width: 24px;
            height: 24px;
            background: #f97316;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
          ">📱</div>
          <strong>Install App</strong>
        </div>
        <p style="margin: 0 0 12px 0; color: #a1a1aa; font-size: 14px;">
          Install this app for a better experience.
        </p>
        <div style="display: flex; gap: 8px;">
          <button id="pwa-install-button" style="
            background: #f97316;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 600;
          ">Install</button>
          <button id="pwa-install-dismiss" style="
            background: transparent;
            color: #a1a1aa;
            border: 1px solid #374151;
            padding: 8px 16px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
          ">Dismiss</button>
        </div>
      </div>
    `;

    document.body.appendChild(installNotification);

    // Add event listeners
    document
      .getElementById("pwa-install-button")
      ?.addEventListener("click", () => {
        // Trigger install prompt
        if (window.deferredPrompt) {
          window.deferredPrompt.prompt();
          window.deferredPrompt.userChoice.then((choiceResult: any) => {
            if (choiceResult.outcome === "accepted") {
              console.log("User accepted the install prompt");
            } else {
              console.log("User dismissed the install prompt");
            }
            window.deferredPrompt = null;
          });
        }
        installNotification.remove();
      });

    document
      .getElementById("pwa-install-dismiss")
      ?.addEventListener("click", () => {
        installNotification.remove();
      });
  };

  const hideInstallPrompt = () => {
    const installNotification = document.getElementById(
      "pwa-install-notification"
    );
    if (installNotification) {
      installNotification.remove();
    }
  };

  return null;
}

// Extend Window interface for PWA functionality
declare global {
  interface Window {
    deferredPrompt: any;
  }
}
