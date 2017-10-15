import * as firebase from 'firebase';
import '@polymer/polymer/polymer';
import {Element as PolymerElement} from '@polymer/polymer/polymer-element';
import '@polymer/paper-button/paper-button';
import '@polymer/paper-input/paper-input';
import '@polymer/paper-progress/paper-progress';
import './shared-styles';

export class FileUploadView extends PolymerElement {
  static get is() {
    return 'file-upload-view';
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

        .uploadBox, .loadBox {
          width: 350px;
        }

        .uploadBox > *,
        .loadBox > * {
          margin: 0 0 10px 0;
        }

        #uploadProgress {
          width: 100%;
        }

        #uploadFileInput {
          display: none;
        }

        #imagePathInput {
          width: 100%;
        }

        #uploadedImage {
          width: 100%;
        }

        .downloadUrl {
          width: 100%;
          font-size: 12px;
        }
      </style>

      <div class="wrapper layout vertical center-center">
        <div class="uploadBox layout vertical center">
          <paper-progress id="uploadProgress"></paper-progress>
          <span><paper-button id="uploadButton" on-click="__uploadButtonOnClick">Choose File</paper-button></span>
          <input id="uploadFileInput" type="file" on-change="__uploadFileInputOnChange"/>
        </div>
        <div class="loadBox layout vertical center">
          <paper-input id="imagePathInput"></paper-input>
          <span><paper-button on-click="__loadButtonOnClick">Load</paper-button></span>
          <img id="uploadedImage">
          <div class="downloadUrl">{{__imageUrl}}</div>
        </div>
      </div>
    `;
  }

  constructor() {
    super();
  }

  __imageUrl: string;

  async __loadUploadedImage(imagePath: string): Promise<void> {
    // 画像パス(例: images/space.png)から参照を取得
    const ref = firebase.storage().ref(imagePath);
    // 取得した参照からダウンロード用のURLを取得
    const url = await ref.getDownloadURL();
    this.__imageUrl = url;
    // 取得したURLの画像を表示
    this.$.uploadedImage.src = url;
  }

  __uploadButtonOnClick(e: any) {
    // OSのファイル選択ダイアログを表示
    const event = document.createEvent('MouseEvents');
    event.initEvent('click', true, false);
    this.$.uploadFileInput.dispatchEvent(event);
  }

  __uploadFileInputOnChange(e: any) {
    // アップロードするファイルを取得
    const file: File = e.target.files[0];
    // アップロード先の参照を取得
    const ref = firebase.storage().ref('images/' + file.name);
    // アップロード実行
    const task = ref.put(file);

    this.$.uploadProgress.value = 0;
    task.on(firebase.storage.TaskEvent.STATE_CHANGED,
      (snapshot: any) => {
        // アップロードのプログレスバーを更新
        const percentage = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        this.$.uploadProgress.value = percentage;
      },
      (err) => {
        // アップロードエラー時の処理
        console.error(err);
      },
      () => {
        // アップロードのプログレスバーを100%に更新
        this.$.uploadProgress.value = 100;
        // アップロードされた画像を画面に表示
        this.$.imagePathInput.value = ref.fullPath;
        this.__loadUploadedImage(ref.fullPath);
      }
    );
  }

  __loadButtonOnClick(e: any) {
    this.__loadUploadedImage(this.$.imagePathInput.value);
  }
}

window.customElements.define(FileUploadView.is, FileUploadView);

