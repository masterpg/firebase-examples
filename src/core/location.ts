import * as qs from 'qs';

namespace locationUtil {

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

      const testedDir = REG_DIR.test(this.path);
      this.dir = testedDir ? decodeURIComponent(testedDir[1]) : '';

      const testedBase = REG_BASE.test(this.path);
      this.base = testedBase ? decodeURIComponent(testedBase[1]) : '';

      const testedExt = REG_EXT.test(this.path);
      this.ext = testedExt ? decodeURIComponent(testedExt[1]) : '';

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

  /**
   * ロケーションを変更します。
   * @param path 変更するパスを指定します。
   * @param query 変更するパスに付与するクエリオブジェクトを指定します。
   */
  export function moveTo(path: string, query = {}): void {
    let url = path;
    if (Object.keys(query).length) {
      url += `?${qs.stringify(query)}`;
    }
    window.history.pushState({}, '', url);
    window.dispatchEvent(new CustomEvent('location-changed'));
  }

  /**
   * 指定されたurlをパースし、その情報を取得します。
   * @param url
   */
  export function parse(url): LocationData {
    let anchor = document.createElement('a') as HTMLAnchorElement;
    anchor.href = url;
    return new LocationData(anchor);
  }

  /**
   * 指定されたパスのベースを取得します。
   * 例: "/foo/bar/index.html"が指定された場合、"index.html"が返されます。
   * @param path パスを指定します。
   */
  export function getBase(path: string): string {
    return parse(path).base;
  }

  /**
   * 指定されたパスから拡張子を取得します。
   * 例: "/foo/bar/index.html"が指定された場合、".html"が返されます。
   * @param path パスを指定します。
   */
  export function getExt(path: string): string {
    return parse(path).ext;
  }

  /**
   * 指定されたパスからディレクトリを取得します。
   * 例: "/foo/bar/index.html"が指定された場合、"/foo/bar"が返されます。
   * @param path パスを指定します。
   */
  export function getDir(path: string): string {
    return parse(path).dir;
  }

  /**
   * 指定されたパスをURLに変換します。
   * @param path
   */
  export function toUrl(path: string): string {
    return parse(path).url;
  }

  /**
   * 指定されたURLをパスに変換します。
   * 例: "http://localhost:5000/foo/bar/index.html"が指定された場合、
   *     "/foo/bar/index.html"が返されます。
   * @param url
   */
  export function toPath(url: string): string {
    return parse(url).path;
  }

  /**
   * 現在のワーキングディレクトリをパスで取得します。
   */
  export function cwd(): string {
    return getDir(parse(location.href).path);
  }

  /**
   * 指定されたパスを連結します。
   * @param args
   */
  export function join(...args: string[]): string {
    if (args.length <= 1) {
      args.unshift(cwd());
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

    return __normalize(path);
  }

  /**
   * 指定されたパスを配列に分割します。
   * @param path
   */
  export function split(path: string): string[] {
    let isAbsolutePath = __isAbsolute(path);
    return __normalizeArray(path.split('/'), !isAbsolutePath);
  }

  //----------------------------------------------------------------------
  //
  //  Internal methods
  //
  //----------------------------------------------------------------------

  /**
   * normalize path
   */
  function __normalize(path: string): string {
    let isAbsolutePath = __isAbsolute(path);
    let trailingSlash = path && path[path.length - 1] === '/';

    path = __normalizeArray(path.split('/'), !isAbsolutePath).join('/');

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
  function __normalizeArray(parts: string[], allowAboveRoot: boolean): string[] {
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
  function __isAbsolute(path) {
    return path.charAt(0) === '/';
  }

}

export default locationUtil;