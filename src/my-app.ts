import '@polymer/polymer/polymer';
import {Element as PolymerElement} from '@polymer/polymer/polymer-element';
import '@polymer/app-layout/app-drawer/app-drawer';
import '@polymer/app-layout/app-drawer-layout/app-drawer-layout';
import '@polymer/app-layout/app-header/app-header';
import '@polymer/app-layout/app-header-layout/app-header-layout';
import '@polymer/app-layout/app-scroll-effects/app-scroll-effects';
import '@polymer/app-layout/app-toolbar/app-toolbar';
import '@polymer/iron-location/iron-location';
import '@polymer/iron-pages/iron-pages';
import '@polymer/iron-selector/iron-selector';
import '@polymer/paper-button/paper-button';
import '@polymer/paper-icon-button/paper-icon-button';

import './firebase-config';
import {environment} from './environments/environment';
import locationUtil from './core/location';

import './auth-view';
import './file-upload-view';
import './my-icons';
import './my-view1';
import './my-view2';
import './my-view3';
import './my-view404';
import './shared-styles';

export class MyApp extends PolymerElement {
  static get is() {
    return 'my-app';
  }

  static get template() {
    return `
      <style include="shared-styles">
        :host {
          --app-primary-color: #4285f4;
          --app-secondary-color: black;

          display: block;
        }

        app-drawer-layout:not([narrow]) [drawer-toggle] {
          display: none;
        }

        app-header {
          color: #fff;
          background-color: var(--app-primary-color);
        }

        app-header paper-icon-button {
          --paper-icon-button-ink-color: white;
        }

        iron-pages {
          height: 100%;
        }

        .drawer-list {
          margin: 0 20px;
        }

        .drawer-list a {
          display: block;
          padding: 0 16px;
          text-decoration: none;
          color: var(--app-secondary-color);
          line-height: 40px;
        }

        .drawer-list a.iron-selected {
          color: black;
          font-weight: bold;
        }
      </style>

      <iron-location path="{{__locationPath}}"></iron-location>

      <app-drawer-layout fullbleed narrow="{{narrow}}">
        <!-- Drawer content -->
        <app-drawer id="drawer" slot="drawer" swipe-open="[[narrow]]">
          <app-toolbar>Menu</app-toolbar>
          <iron-selector selected="[[__page]]" attr-for-selected="name" class="drawer-list" role="navigation">
            <a name="auth-view" href="[[rootPath]]auth-view">Authentication</a>
            <a name="file-upload-view" href="[[rootPath]]file-upload-view">File Upload</a>
            <a name="my-view1" href="[[rootPath]]my-view1">View One</a>
            <a name="my-view2" href="[[rootPath]]my-view2">View Two</a>
            <a name="my-view3" href="[[rootPath]]my-view3">View Three</a>
          </iron-selector>
        </app-drawer>

        <!-- Main content -->
        <app-header-layout has-scrolling-region>

          <app-header slot="header" condenses reveals effects="waterfall">
            <app-toolbar>
              <paper-icon-button icon="my-icons:menu" drawer-toggle></paper-icon-button>
              <div main-title>My App</div>
            </app-toolbar>
          </app-header>

          <iron-pages
              selected="[[__page]]"
              attr-for-selected="name"
              fallback-selection="view404"
              role="main">
            <auth-view name="auth-view"></auth-view>
            <file-upload-view name="file-upload-view"></file-upload-view>
            <my-view1 name="my-view1"></my-view1>
            <my-view2 name="my-view2"></my-view2>
            <my-view3 name="my-view3"></my-view3>
            <my-view404 name="my-view404"></my-view404>
          </iron-pages>
        </app-header-layout>
      </app-drawer-layout>
    `;
  }

  constructor() {
    super();
    console.log('production:', environment.production);
  }

  __page: string;

  __locationPath: string;

  static get properties() {
    return {
      // This shouldn't be neccessary, but the Analyzer isn't picking up
      // Polymer.Element#rootPath
      rootPath: String,

      __locationPath: {
        type: String,
        observer: '__locationPathChanged',
      }
    };
  }

  __locationPathChanged(newValue: string, oldValue: string) {
    const location = new locationUtil.LocationData(window.location);
    const paths = locationUtil.split(location.path);
    let page: string;
    if (paths.length === 0) {
      page = 'my-view1';
    } else {
      page = paths[0];
    }
    this.__page = page;

    // Close a non-persistent drawer when the page & route are changed.
    if (!this.$.drawer.persistent) {
      this.$.drawer.close();
    }
  }

  __showPage404() {
    this.__page = 'my-view404';
  }
}

customElements.define(MyApp.is, MyApp);
