/* @flow */

import * as qs from 'qs';

export class LocationData {
  constructor(src?: Location|HTMLAnchorElement) {
    if (!src) {
      return;
    }

    const REG_BASE = /([^/?#]*)$/;
    const REG_DIR = /(?:([^?#]*)\/)*/;
    const REG_EXT = /(?:[^./]+)(\.[^/.]+)$/;

    this.url = src.href;
    this.protocol = src.protocol;
    this.domain = src.hostname;
    this.port = src.port;
    this.path = decodeURIComponent(src.pathname);
    this.hash = decodeURIComponent(src.hash.substring(1));
    this.host = src.host;
    this.dir = REG_DIR.test(this.path) ?
      decodeURIComponent(REG_DIR.exec(this.path)[1]) : '';
    this.base = REG_BASE.test(this.path) ?
      decodeURIComponent(REG_BASE.exec(this.path)[1]) : '';
    this.ext = REG_EXT.test(this.path) ?
      decodeURIComponent(REG_EXT.exec(this.path)[1]) : '';
    this.query = qs.parse(src.search.substring(1));
  }

  url: string;
  protocol: string;
  domain: string;
  port: string;
  host: string;
  path: string;
  hash: string;
  dir: string;
  base: string;
  ext: string;
  query: {};
}

export class LocationUtil {
  /**
   * ロケーションを変更します。
   * @param path 変更するパスを指定します。
   * @param query 変更するパスに付与するクエリオブジェクトを指定します。
   */
  static moveTo(path: string, query = {}): void {
    let url = path;
    if (Object.keys(query).length) {
      url += `?${qs.stringify(query)}`;
    }
    window.history.pushState({}, null, url);
    window.dispatchEvent(new CustomEvent('location-changed'));
  }

  /**
   * 指定されたurlをパースし、その情報を取得します。
   * @param url
   */
  static parse(url): LocationData {
    let anchor = (document.createElement('a'): HTMLAnchorElement);
    anchor.href = url;
    return new LocationData(anchor);
  }

  /**
   * 指定されたパスのベースを取得します。
   * 例: "/foo/bar/index.html"が指定された場合、"index.html"が返されます。
   * @param path パスを指定します。
   */
  static getBase(path: string): string {
    return LocationUtil.parse(path).base;
  }

  /**
   * 指定されたパスから拡張子を取得します。
   * 例: "/foo/bar/index.html"が指定された場合、".html"が返されます。
   * @param path パスを指定します。
   */
  static getExt(path: string): string {
    return LocationUtil.parse(path).ext;
  }

  /**
   * 指定されたパスからディレクトリを取得します。
   * 例: "/foo/bar/index.html"が指定された場合、"/foo/bar"が返されます。
   * @param path パスを指定します。
   */
  static getDir(path: string): string {
    return LocationUtil.parse(path).dir;
  }

  /**
   * 指定されたパスをURLに変換します。
   * @param path
   */
  static toUrl(path: string): string {
    return LocationUtil.parse(path).url;
  }

  /**
   * 指定されたURLをパスに変換します。
   * 例: "http://localhost:5000/foo/bar/index.html"が指定された場合、
   *     "/foo/bar/index.html"が返されます。
   * @param url
   */
  static toPath(url: string): string {
    return LocationUtil.parse(url).path;
  }

  /**
   * 現在のワーキングディレクトリをパスで取得します。
   */
  static cwd(): string {
    return LocationUtil.getDir(LocationUtil.parse(location.href).path);
  }

  /**
   * 指定されたパスを連結します。
   * @param args
   */
  static join(...args: string[]): string {
    if (args.length <= 1) {
      args.unshift(LocationUtil.cwd());
    }

    let path = '';
    for (let i = 0; i < args.length; i += 1) {
      let segment = args[i];
      if (!path) {
        path += segment;
      } else {
        path += '/' + segment;
      }
    }

    return LocationUtil.__normalize(path);
  }

  /**
   * 指定されたパスを配列に分割します。
   * @param path
   */
  static split(path: string): string[] {
    let isAbsolutePath = LocationUtil.__isAbsolute(path);
    return LocationUtil.__normalizeArray(path.split('/'), !isAbsolutePath);
  }

  //----------------------------------------------------------------------
  //
  //  Internal methods
  //
  //----------------------------------------------------------------------

  /**
   * normalize path
   */
  static __normalize(path: string): string {
    let isAbsolutePath = LocationUtil.__isAbsolute(path);
    let trailingSlash = path && path[path.length - 1] === '/';

    path = LocationUtil.__normalizeArray(path.split('/'), !isAbsolutePath).join('/');

    if (!path && !isAbsolutePath) {
      path += '.';
    }
    if (path && trailingSlash) {
      path += '/';
    }
    return (isAbsolutePath ? '/' : '') + path;
  }

  /**
   * normalize array
   * @param parts
   * @param allowAboveRoot
   */
  static __normalizeArray(parts: string[], allowAboveRoot: boolean): string[] {
    let res: string[] = [];

    for (let i = 0; i < parts.length; i += 1) {
      let p = parts[i];
      if (!p || p === '.') continue;
      if (p === '..') {
        if (res.length && res[res.length - 1] !== '..') {
          res.pop();
        } else if (allowAboveRoot) {
          res.push('..');
        }
      } else if (/^http(s)?:/.test(p)) {
        res.push(p + '/');
      } else {
        res.push(p);
      }
    }
    return res;
  }

  /**
   * 指定されたパスが絶対パスかを否かを取得します。
   */
  static __isAbsolute(path) {
    return path.charAt(0) === '/';
  }
}