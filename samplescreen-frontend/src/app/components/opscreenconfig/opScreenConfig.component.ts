import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, SimpleChanges } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { OperatorScreen, OperatorScreenConfigurationPresenter, OperatorScreenPresenterAPI, RobotSettings } from "@universal-robots/contribution-api";
import { SamplescreenNode } from "../samplescreen/samplescreen.node";

@Component({
    templateUrl: './opScreenConfig.component.html',
    styleUrls: ['./opScreenConfig.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class OpscreenConfigComponent implements OperatorScreenConfigurationPresenter, OnChanges {

    constructor(
        protected readonly translateService: TranslateService,
        protected readonly cd: ChangeDetectorRef
    ) {
    }

    @Input() presenterAPI?: OperatorScreenPresenterAPI;
    @Input() robotSettings?: RobotSettings;
    @Input() operatorScreen?: SamplescreenNode;

    password = "";

    ngOnChanges(changes: SimpleChanges): void {

        if (changes?.operatorScreen && this.operatorScreen && this.operatorScreen.parameters) {

            this.password = this.operatorScreen.parameters.password;

        }
    }

    saveChanges(): void {

        this.cd.detectChanges();
        if (this.presenterAPI && this.operatorScreen) {
            this.presenterAPI.operatorScreenService.updateOperatorScreen(this.operatorScreen);
        }

    }

    setPassword($event): void {

        if (this.operatorScreen && this.operatorScreen.parameters) {
            this.operatorScreen.parameters.password = $event.srcElement.value;
            this.saveChanges();
        }
    }

}