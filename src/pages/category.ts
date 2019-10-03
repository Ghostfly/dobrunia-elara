import { html, TemplateResult } from 'lit-html';
import { repeat } from 'lit-html/directives/repeat';
import { css, property } from 'lit-element';

import Page from '../core/strategies/Page';
import { CSS } from '../core/ui/ui';
import { projectCard, projectLoad, ElementWithProjects, iObserverForCard } from './home';
import Constants from '../constants';

import { WPSearchPost } from '../core/wordpress/interfaces';
import WPBridge from '../core/wordpress/bridge';

class Category extends Page implements ElementWithProjects {
    public static readonly is: string = 'ui-category';

    public static readonly hasRouting: boolean = true;

    @property({type: Object, reflect: false})
    public projects: ReadonlyArray<WPSearchPost> = [];
    
    private _observer = iObserverForCard(.2);

    public get head(){
        return {
            title: null,
            description: null,
            type: 'category',
            image: null,
            slug: '#!category'
        };
    }

    public static get styles(){
        return [
            ... super.styles,
            CSS.cards,
            css`
            .category {
                padding: 2em;
            }
            `
        ];
    }

    public async firstUpdated(){
        window.addEventListener('hashchange', async () => {
            this.loaded = false;
            const requestedHash = location.hash.split('/');
            await this._loadRequested(requestedHash[1]);
            this.loaded = true;
        });

        const requestedHash = location.hash.split('/');
        if(requestedHash.length > 1){
            this._loadRequested(requestedHash[1]);
        }
    }

    private async _loadRequested(hash: string){
        const bridge = new WPBridge(null, null);
        const category = await bridge.loader.single(null, hash).toPromise();

        if(!category || !category[0]){
            return;
        }

        this.projects = [];
        await projectLoad(this, '#cards .card:last-child', category[0].id, this._observer);
        if(this.projects.length === 0){
            setTimeout(() => {
                document.title = this.projects[0].category.name + ' | ' + Constants.title;
            }, 200);
        } else {
            document.title = this.projects[0].category.name + ' | ' + Constants.title;
        }
    }

    public render(): void | TemplateResult {
        return html`
        ${!this.loaded ? html`<paper-spinner active></paper-spinner>` : html``}

        <div id="cards" class="category cards" role="main">
        ${repeat(this.projects, (project) =>  projectCard(project))}
        </div>
        `;
    }
}
customElements.define(Category.is, Category);