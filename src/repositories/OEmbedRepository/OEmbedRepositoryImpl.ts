import { OembedType } from './types.js';
import { OEmbedRepositoryInterface } from './OEmbedRepositoryInterface.js';
import { OembedDomain } from '../../domains/index.js';

export class OEmbedRepositoryImpl implements OEmbedRepositoryInterface {
  proxy: string = '';

  constructor(proxy: string) {
    this.proxy = proxy;
  }

  async _fetch(src: string): Promise<OembedType> {
    const j = await (
      await fetch(`${this.proxy}/${src}`, { headers: { Origin: 'null' } })
    ).json();
    j.providerName = j.provider_name;
    return j;
  }

  async get(src: string): Promise<OembedDomain> {
    const response: OembedType = await this._fetch(src);
    const oembedDomain = new OembedDomain({
      html: response.html,
      height: response.height,
      width: response.width,
      providerName: response.providerName,
    });
    return oembedDomain;
  }
}
