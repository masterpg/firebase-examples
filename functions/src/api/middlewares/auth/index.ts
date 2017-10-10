import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as express from 'express';

/**
 * このリスナはExpressのミドルウェアで、認証HTTPヘッダーで渡されるFirebase IDトークンを検証します。
 * Firebase IDトークンは次のように、認証HTTPヘッダーでBearerトークンとして渡されなくてはなりません:
 * `Authorization: Bearer <Firebase ID Token>`
 * デコードが成功すると、`req.user`としてIDトークンのコンテンツに追加されます。
 */
export default async function (req: functions.Request, res: functions.Response,
                               next: express.NextFunction) {
  // 認証リクエストがFirebase IDトークンを持っているかチェック
  const authorization = req.headers['authorization'] as string;
  if ((!authorization || !authorization.startsWith('Bearer ')) && !req.cookies.__session) {
    console.error(
      '認証ヘッダーにBearerトークンとしてFirebase IDが渡されませんでした。',
      'HTTPヘッダーの`Authorization: Bearer <Firebase ID Token>`でリクエストを承認するか、',
      'cookieの`__session`で承認を行ってください。'
    );
    res.status(403).send('Unauthorized');
    return;
  }

  let idToken;
  // 認証ヘッダーにBearerトークンがある場合、認証ヘッダーからIDトークンを取得
  if (authorization && authorization.startsWith('Bearer ')) {
    idToken = authorization.split('Bearer ')[1];
  }
  // 認証ヘッダーにBearerトークンがない場合、cookieからIDトークンを取得
  else {
    idToken = req.cookies.__session;
  }

  // IDトークンの検証とデコード
  let decodedIdToken: admin.auth.DecodedIdToken;
  try {
    decodedIdToken = await admin.auth().verifyIdToken(idToken);
  } catch (err) {
    console.error('Firebase IDトークンの検証中にエラーが発生しました:', err);
    res.status(403).send('Unauthorized');
    return;
  }

  (req as any).user = decodedIdToken;

  next();
}
