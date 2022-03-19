import { html, css, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { OembedDomainInterface } from './domains/types.js';
import { LookupOEmbedInteractor } from './interactors/index.js';
import { LookupOEmbedInteractorInterface } from './interactors/types.js';
import { OEmbedRepository, ProviderRepository } from './repositories/index.js';
import { UnitValue } from './types.js';

export class OEmbed extends LitElement {
  static styles = css`
    iframe {
      border: none;
    }
  `;

  @property({ type: String }) src = '';

  @property({ type: Object }) _oembed: OembedDomainInterface | undefined;

  @property({ type: String }) height: UnitValue | undefined;

  @property({ type: String }) width: UnitValue | undefined;

  @property({ type: String }) proxy: string = '';

  @property({ type: Object }) interactor:
    | LookupOEmbedInteractorInterface
    | undefined;

  async connectedCallback() {
    super.connectedCallback();
    if (this.interactor === undefined) {
      this.interactor = new LookupOEmbedInteractor(
        new ProviderRepository(this.proxy),
        new OEmbedRepository(this.proxy)
      );
    }
    this._oembed = await this.interactor.invoke(this.src);
  }

  render() {
    return html`<iframe
      title="content"
      srcdoc="${this._oembed?.html}"
      loading="lazy"
      width="${this.width ? this.width : this._oembed?.width}"
      height="${this.height ? this.height : this._oembed?.height}"
    ></iframe>`;
  }
}
