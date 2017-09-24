import '../node_modules/@polymer/polymer/polymer';
import {Element as PolymerElement} from '@polymer/polymer/polymer-element';
import '../node_modules/@polymer/paper-button/paper-button';
import '../node_modules/@polymer/paper-input/paper-input';
import '../node_modules/@polymer/paper-radio-button/paper-radio-button';
import '../node_modules/@polymer/paper-radio-group/paper-radio-group';

import axios from 'axios';

export class AuthView extends PolymerElement {
  static get is() {
    return 'auth-view';
  }

  static get template() {
    return `
      <style include="shared-styles">
        :host {
          display: block;
          height: 100%;
        }

        .wrapper {
          height: 100%;
          padding: 24px;
        }

        paper-button {
          font-size: 14px;
          color: var(--paper-indigo-500);
        }

        .user-info {
          border: 1px solid #CCC;
          clear: both;
          margin: 0 auto 20px;
          max-width: 400px;
          padding: 10px;
          text-align: left;
        }

        .photo-container {
          background-color: #EEE;
          border: 1px solid #CCC;
          float: left;
          height: 80px;
          margin-right: 10px;
        }

        #photo {
          height: 80px;
          margin: 0;
        }

        .signIn-mode-area {
          margin: 20px 0;
        }
      </style>

      <div class="wrapper layout vertical center">

        <div id="userSignedIn" class="hidden">
          <div class="layout horizontal user-info">
            <div class="photo-container">
              <img id="photo">
            </div>
            <div class="layout vertical">
              <div id="name"></div>
              <div id="email"></div>
              <div id="phone"></div>
            </div>
          </div>
          <p class="layout horizontal center-justified">
            <button on-click="__signOutButtonOnClick">Sign Out</button>
            <button on-click="__deleteAccountButtonOnClick">Delete account</button>
          </p>
        </div>

        <div id="userSignedOut" class="hidden">
          <h4>You are signed out.</h4>
          <div class="signIn-mode-area">
            <paper-radio-group id="signInModeGroup" selected="popup">
              <paper-radio-button name="popup">Popup</paper-radio-button>
              <paper-radio-button name="redirect">Redirect</paper-radio-button>
            </paper-radio-group>
          </div>
          <div class="layout vertical center">
            <span><paper-button id="googleLoginButton" on-click="__loginButtonOnClick">Googleでログイン</paper-button></span>
            <span><paper-button id="facebookLoginButton" on-click="__loginButtonOnClick">Facebookでログイン</paper-button></span>
          </div>
        </div>

      </div>
    `;
  }

  //----------------------------------------------------------------------
  //
  //  Constructors
  //
  //----------------------------------------------------------------------

  constructor() {
    super();
  }

  //----------------------------------------------------------------------
  //
  //  Lifecycle callbacks
  //
  //----------------------------------------------------------------------

  ready() {
    super.ready();

    firebase.auth().onAuthStateChanged(this.__firebaseOnAuthStateChanged.bind(this));

    this.__googleProvider = new firebase.auth.GoogleAuthProvider();
    this.__googleProvider.addScope('https://www.googleapis.com/auth/contacts.readonly');

    this.__facebookProvider = new firebase.auth.FacebookAuthProvider();
    this.__facebookProvider.addScope('user_birthday');
  }

  //----------------------------------------------------------------------
  //
  //  Variables
  //
  //----------------------------------------------------------------------

  __googleProvider: firebase.auth.GoogleAuthProvider;

  __facebookProvider: firebase.auth.FacebookAuthProvider;

  //----------------------------------------------------------------------
  //
  //  Internal methods
  //
  //----------------------------------------------------------------------

  /**
   * ユーザーがサインインした状態のUI表示を行います。
   * @param user
   */
  __handleSignedInUser(user: firebase.User) {
    this.$.userSignedIn.style.display = 'block';
    this.$.userSignedOut.style.display = 'none';
    this.$.name.textContent = user ? user.displayName : '';
    this.$.email.textContent = user ? user.email : '';
    this.$.phone.textContent = user ? user.phoneNumber : '';
    if (user && user.photoURL) {
      this.$.photo.src = user.photoURL;
      this.$.photo.style.display = 'block';
    } else {
      this.$.photo.style.display = 'none';
    }
  }

  /**
   * ユーザーがサインアウトした状態のUI表示を行います。
   */
  __handleSignedOutUser() {
    this.$.userSignedIn.style.display = 'none';
    this.$.userSignedOut.style.display = 'block';
  }

  /**
   * ユーザーアカウントを削除します。
   */
  __deleteAccount(): Promise<void> {
    return new Promise((reject) => {
      const currentUser = firebase.auth().currentUser;
      if (!currentUser) return;
      currentUser.delete()
        .catch((err: any) => {
          // ユーザーの認証情報が古すぎる場合、再度サインインが必要
          if (err.code == 'auth/requires-recent-login') {
            firebase.auth().signOut().then(() => {
              // UIがサインアウト状態に変化した後にメッセージが表示されるようsetTimeout()している
              setTimeout(() => {
                alert('Please sign in again to delete your account.');
                reject(err);
              }, 1);
            });
          }
          // 上記以外のエラーの場合、そのままreject()
          else {
            reject(err);
          }
        });
    });
  }

  /**
   * `hello`HTTP APIをコールします。
   */
  __callHello(): Promise<void> {
    const currentUser = firebase.auth().currentUser;
    if (!currentUser) return Promise.resolve();
    return currentUser.getIdToken().then((token) => {
      const options: any = firebase.app().options || {};
      const domain = options.authDomain || '';
      if (!domain) throw new Error('Domain could not be acquired.');

      const url = `https://${domain}/api/hello`;
      return axios.get(url, {
        headers: {'Authorization': `Bearer ${token}`},
      }).then((response) => {
        console.log(response);
      }).catch(function (err) {
        console.error(err);
      });
    }) as Promise<void>;
  }

  /**
   * ポップアップ形式でサインインを行います。
   */
  __signInWithPopup(provider: firebase.auth.AuthProvider): Promise<void> {
    return firebase.auth().signInWithPopup(provider).then((result) => {
      if (result.credential) {
        // Googleのアクセストークンを取得。このトークンはGoogle APIにアクセスする際に使用する
        const token = result.credential.accessToken;
      }
      // サインインしたユーザー情報の取得
      const user = result.user;
      // ...
    }).catch((err: any) => {
      const errorCode = err.code;
      const errorMessage = err.message;
      const email = err.email;
      const credential = err.credential;
      console.error(err);
    }) as Promise<void>;
  }

  /**
   * リダイレクト形式でサインインを行います。
   */
  __signInWithRedirect(provider: firebase.auth.AuthProvider): Promise<void> {
    firebase.auth().signInWithRedirect(provider);

    return firebase.auth().getRedirectResult().then((result) => {
      if (result.credential) {
        // Googleのアクセストークンを取得。このトークンはGoogle APIにアクセスする際に使用する
        const token = result.credential.accessToken;
      }
      // サインインしたユーザー情報の取得
      const user = result.user;
    }).catch(function (err: any) {
      const errorCode = err.code;
      const errorMessage = err.message;
      const email = err.email;
      const credential = err.credential;
      console.error(err);
    }) as Promise<void>;
  }

  //----------------------------------------------------------------------
  //
  //  Event handlers
  //
  //----------------------------------------------------------------------

  /**
   * Firebaseの認証状態が変化した際のハンドラです。
   * @param user
   */
  __firebaseOnAuthStateChanged(user: firebase.User) {
    user ? this.__handleSignedInUser(user) : this.__handleSignedOutUser();
  }

  __loginButtonOnClick(e: any) {
    let provider: firebase.auth.AuthProvider;
    if (e.target === this.$.googleLoginButton) {
      provider = this.__googleProvider;
    } else if (e.target === this.$.facebookLoginButton) {
      provider = this.__facebookProvider;
    } else {
      return;
    }

    let signedIn = Promise.resolve();
    let mode = this.$.signInModeGroup.selected;
    if (mode === 'popup') {
      signedIn = this.__signInWithPopup(provider);
    } else if (mode === 'redirect') {
      signedIn = this.__signInWithRedirect(provider);
    }
    signedIn.then(() => {
      this.__callHello();
    });
  }

  /**
   * サインアウトボタンがクリックされた際のハンドラです。
   * @param e
   */
  __signOutButtonOnClick(e: any) {
    firebase.auth().signOut();
  }

  /**
   * アカウント削除ボタンがクリックされた際のハンドラです。
   * @param e
   */
  __deleteAccountButtonOnClick(e: any) {
    this.__deleteAccount();
  }
}

window.customElements.define(AuthView.is, AuthView);

