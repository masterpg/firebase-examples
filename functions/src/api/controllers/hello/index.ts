import helpers from '../../helpers';

helpers.router.auth.get('/hello', (req, res) => {
  res.send(`Hello ${(req as any).user.name}`);
});
