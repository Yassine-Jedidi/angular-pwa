import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'angular-pwa';
  deferredInstall: any = null;
  isIOS: boolean = false;

  ngOnInit() {
    this.isIOS = this.detectIOS();
    this.init();
  }

  detectIOS(): boolean {
    const userAgent = window.navigator.userAgent.toLowerCase();
    return /iphone|ipad|ipod/.test(userAgent);
  }

  init() {
    if ('serviceWorker' in navigator) {
      // Register the service worker
      navigator.serviceWorker
        .register('/ngsw-worker.js', {
          updateViaCache: 'none',
          scope: '/',
        })
        .then((registration) => {
          console.log('Service Worker registered with scope:', registration.scope);
        })
        .catch((err) => {
          console.warn('Failed to register Service Worker', err.message);
        });

      // Listen for messages
      navigator.serviceWorker.addEventListener('message', ({ data }) => {
        console.log('Message from Service Worker:', data);
      });

      // Listen for `appinstalled` event
      window.addEventListener('appinstalled', (evt) => {
        console.log('PWA was installed.');
      });

      // Listen for `beforeinstallprompt` event
      window.addEventListener('beforeinstallprompt', (ev) => {
        console.log('beforeinstallprompt event fired');
        ev.preventDefault();
        this.deferredInstall = ev;
        console.log('Deferred Install event saved');
      });

      const btn = document.getElementById('btnInstall');
      if (btn) {
        btn.addEventListener('click', this.startChromeInstall.bind(this));
      } else {
        console.warn('Install button not found');
      }
    }
  }

  startChromeInstall() {
    if (this.deferredInstall) {
      console.log('Prompting user for installation:', this.deferredInstall);
      this.deferredInstall.prompt();
      this.deferredInstall.userChoice.then((choice: any) => {
        if (choice.outcome === 'accepted') {
          console.log('User accepted the install prompt');
        } else {
          console.log('User dismissed the install prompt');
        }
        this.deferredInstall = null; // Reset the deferred install prompt
      });
    } else {
      console.warn('Deferred install prompt is not available');
    }
  }
}
