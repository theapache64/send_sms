export class FormData {

  private formBody: string;

  constructor(params: any) {
    const formBodyArr: string[] = [];
    for (const property in params) {
      const encodedKey = encodeURIComponent(property);
      const encodedValue = encodeURIComponent(params[property]);
      formBodyArr.push(encodedKey + '=' + encodedValue);
    }
    this.formBody = formBodyArr.join('&');
  }

  public getFormBody() {
    return this.formBody;
  }

}
