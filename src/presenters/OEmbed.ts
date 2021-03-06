import { html, css, LitElement, PropertyValues } from 'lit';
import { property } from 'lit/decorators.js';
import { OembedDomainInterface } from '../domains/types.js';
import { LookupOEmbedInteractor } from '../interactors/index.js';
import { LookupOEmbedInteractorInterface } from '../interactors/types.js';
import { OEmbedRepository, ProviderRepository } from '../repositories/index.js';
import { UnitValue } from '../utils/types.js';
import { Status } from './types.js';

export class OEmbed extends LitElement {
  static styles = css`
    iframe {
      max-width: 100%;
      border: none;
    }
  `;

  @property({ type: String }) src = '';

  @property({ type: String }) height: UnitValue | undefined;

  @property({ type: String }) width: UnitValue | undefined;

  @property({ type: String }) proxy: string = '';

  @property({ type: String }) provider: string = '';

  @property({ type: Object }) _oembed: OembedDomainInterface | undefined;

  @property({ type: String }) _status: Status = 'loading';

  @property({ type: String }) _view: String = 'opacity:0;';

  _interactor: LookupOEmbedInteractorInterface | undefined;

  async connectedCallback() {
    super.connectedCallback();
    if (!this.proxy || !this.src) {
      this.remove();
      return;
    }
    this._onLoadHandler = this._onLoadHandler.bind(this);
    if (this._interactor === undefined) {
      this._interactor = new LookupOEmbedInteractor(
        new ProviderRepository(this.proxy, this.provider),
        new OEmbedRepository(this.proxy)
      );
    }
    await this._updateOEmbed();
  }

  async willUpdate(changedProperties: PropertyValues) {
    if (changedProperties.has('src') || changedProperties.has('proxy'))
      await this._updateOEmbed();
  }

  async _updateOEmbed() {
    this._status = 'loading';
    this._interactor
      ?.invoke(this.src)
      .then(oembed => {
        if (oembed.html === '') {
          this._status = 'notFound';
          return;
        }
        this._oembed = oembed;
        this._status = 'loaded';
        this.shadowRoot
          ?.querySelector('iframe')
          ?.addEventListener('load', this._onLoadHandler);
      })
      .catch(() => {
        this._status = 'error';
      });
  }

  _onLoadHandler() {
    switch (this._oembed?.providerName) {
      case 'Twitter':
        //@ts-ignore
        this.shadowRoot
          ?.querySelector('iframe')
          //@ts-ignore
          ?.contentWindow.twttr.events.bind('rendered', () => {
            this._view = 'opacity:1.0;';
          });
        break;
      default:
        this._view = 'opacity:1.0;';
        break;
    }
  }

  switchRender() {
    const width = this.width ? this.width : this._oembed?.width;
    const height = this.height ? this.height : this._oembed?.height;

    switch (this._status) {
      case 'loading':
        return html` <slot name="loading"></slot>`;
      case 'notFound':
        return html` <slot name="notFound"></slot>`;
      case 'error':
        return html` <slot name="error"></slot>`;
      default:
        return html`<iframe
          title="content"
          srcdoc="${this._oembed?.html}"
          loading="lazy"
          width="${width}"
          height="${height}"
          style="${this._view}"
        ></iframe>`;
    }
  }

  containerRender() {
    return html`<div>${this.switchRender()}</div>`;
  }

  render() {
    return this.containerRender();
  }
}
