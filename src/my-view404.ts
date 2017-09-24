import '@polymer/polymer/polymer';
import {Element as PolymerElement} from '@polymer/polymer/polymer-element';
import './shared-styles';

export class MyView404 extends PolymerElement {
  static get is() { return  'my-view404'; }

  static get template() {
    return `
      <style>
        :host {
          display: block;
          padding: 10px 20px;
        }
      </style>

      Oops you hit a 404. <a href="[[rootPath]]">Head back to home.</a>
    `;
  }

  static get properties() {
    return {
      // This shouldn't be neccessary, but the Analyzer isn't picking up
      // Polymer.Element#rootPath
      rootPath: String,
    };
  }
}

customElements.define(MyView404.is, MyView404);
