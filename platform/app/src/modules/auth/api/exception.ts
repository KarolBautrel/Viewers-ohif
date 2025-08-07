export class HttpError<T> extends Error {
  public readonly status: number;
  public readonly statusText: string;
  public readonly data: T;
  public readonly url: string;

  constructor(status: number, data: T, response: Response) {
    super(`HTTP Error: ${status}`);
    this.name = 'HttpError';
    this.status = status;
    this.statusText = response.statusText;
    this.data = data;
    this.url = response.url;

    Object.setPrototypeOf(this, HttpError.prototype);
  }
}
