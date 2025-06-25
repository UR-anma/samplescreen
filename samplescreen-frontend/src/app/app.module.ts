import { DoBootstrap, Injector, NgModule } from '@angular/core';
import { SamplescreenComponent } from './components/samplescreen/samplescreen.component';
import { UIAngularComponentsModule } from '@universal-robots/ui-angular-components';
import { BrowserModule } from '@angular/platform-browser';
import { createCustomElement } from '@angular/elements';
import { HttpBackend, HttpClientModule } from '@angular/common/http';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { MultiTranslateHttpLoader } from 'ngx-translate-multi-http-loader';
import { PATH } from '../generated/contribution-constants';
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { OpscreenConfigComponent } from './components/opscreenconfig/opScreenConfig.component';

export const httpLoaderFactory = (http: HttpBackend) =>
    new MultiTranslateHttpLoader(http, [
        { prefix: PATH + '/assets/i18n/', suffix: '.json' },
        { prefix: './ui/assets/i18n/', suffix: '.json' },
    ]);

@NgModule({
    declarations: [
        SamplescreenComponent, OpscreenConfigComponent
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        UIAngularComponentsModule,
        HttpClientModule,
        TranslateModule.forRoot({
            loader: { provide: TranslateLoader, useFactory: httpLoaderFactory, deps: [HttpBackend] },
            useDefaultLang: false,
        })
    ],
    providers: [],
})

export class AppModule implements DoBootstrap {
    constructor(private injector: Injector) {
    }

    ngDoBootstrap() {
        const samplescreenComponent = createCustomElement(SamplescreenComponent, { injector: this.injector });
        customElements.define('ur-samplescreen-samplescreen', samplescreenComponent);

        const opscreenconfigComponent = createCustomElement(OpscreenConfigComponent, { injector: this.injector });
        customElements.define('ur-sampleopscreen-opscreenconfig', opscreenconfigComponent)
    }

    // This function is never called, because we don't want to actually use the workers, just tell webpack about them
    registerWorkersWithWebPack() {
        new Worker(new URL('./components/samplescreen/samplescreen.behavior.worker.ts'
            /* webpackChunkName: "samplescreen.worker" */, import.meta.url), {
            name: 'samplescreen',
            type: 'module'
        });
    }
}

