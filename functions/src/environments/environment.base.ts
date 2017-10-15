export class Environment {

  constructor(params: {production: boolean}) {
    this.production = params.production;
  }

  production: boolean;

  administrators: Administrator[] = [
    new Administrator({mail: 'hoge@example.com'}),
  ];
}

export class Administrator {

  constructor(params: {mail: string}) {
    this.mail = params.mail;
  }

  mail: string;
}