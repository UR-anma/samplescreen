import { TranslateService } from '@ngx-translate/core';
import { first } from 'rxjs/operators';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, numberAttribute, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { OperatorScreenPresenterAPI, OperatorScreenPresenter, RobotSettings, Waypoint, WaypointType, VariableValueType, URVariable, ProgramCodeService } from '@universal-robots/contribution-api';
import { SamplescreenNode } from './samplescreen.node';
import { PATH } from 'src/generated/contribution-constants';

@Component({
    templateUrl: './samplescreen.component.html',
    styleUrls: ['./samplescreen.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class SamplescreenComponent implements OperatorScreenPresenter, OnChanges, OnDestroy, OnInit {

    @Input() presenterAPI: OperatorScreenPresenterAPI;;
    @Input() robotSettings: RobotSettings;
    @Input() operatorScreen: SamplescreenNode;

    passwordOk = false;
    tentativePassword = "";

    startDi: string;
    startDiStatus = false;
    endDi: string;
    endDiStatus = false;

    powerDo = "DO0";
    powerDoStatus = false;
    powerDoStatusDisabled = false;

    speedAo = "AO0"
    speedAoStatus = 50;
    speedAoStatusDisabled = false;

    imgPath = PATH + "/assets/ConveyorImg.jpg";
    programCodeService: any;

    private ws: WebSocket;
    private dataListener: any;

    constructor(
        protected readonly translateService: TranslateService,
        protected readonly cd: ChangeDetectorRef
    ) {
    }

    ngOnInit(): void {

        const backendURL = `ws://localhost:45000/ur/samplescreen/samplescreen-backend/secondary-interface-api/`
        this.ws = new WebSocket(backendURL);

        this.dataListener = (msg) => {
            const startDiIndex = Number(this.startDi[2])
            const endDiIndex = Number(this.endDi[2])
            const powerDoIndex = Number(this.powerDo[2])

            console.log(msg)

            if (msg[startDiIndex] == '1') {
                this.startDiStatus = true;

            } else {
                this.startDiStatus = false;
            }
            if (msg[8 + endDiIndex] == '1') {
                this.endDiStatus = true;
            } else {
                this.endDiStatus = false;
            }

            if (Number(msg.data[16 + powerDoIndex]) == 1 && this.powerDoStatusDisabled != true) {
                this.powerDoStatus = true;
            } else if (Number(msg.data[16 + powerDoIndex]) == 0 && this.powerDoStatusDisabled != true) {
                this.powerDoStatus = false;
            }

            if (Number(this.operatorScreen.parameters.speedAo[2]) == 0) {
                this.speedAoStatus = Number(msg.data.slice(32, 35))
            } else {
                this.speedAoStatus = Number(msg.data.slice(35))
            }

            this.cd.detectChanges();

        }

        this.ws.addEventListener("message", this.dataListener);

    }

    ngOnChanges(changes: SimpleChanges): void {

        console.log(changes)
        console.log(this.operatorScreen)

        if (changes?.operatorScreen && this.operatorScreen && this.operatorScreen.parameters) {

            console.log(this.operatorScreen)
            console.log("Components params init")

            this.programCodeService = new ProgramCodeService(this.presenterAPI.applicationService.eventTarget);

            this.startDi = this.operatorScreen.parameters.startDi;
            this.endDi = this.operatorScreen.parameters.endDi;
            this.tentativePassword = this.operatorScreen.parameters.tentativePassword;
            this.powerDo = this.operatorScreen.parameters.powerDo;
            this.speedAo = this.operatorScreen.parameters.speedAo;

            if (this.operatorScreen.parameters.password === this.operatorScreen.parameters.tentativePassword) {
                this.passwordOk = true;
            } else {
                this.passwordOk = false;
            }

        }

    }

    ngOnDestroy(): void {

        try {
            this.ws.removeEventListener('message', this.dataListener);
            this.ws.close();
        } catch (error) {
            console.log("No connection cleanup necessary")
        }

    }

    // call saveNode to save node parameters
    saveChanges() {
        this.cd.detectChanges();
        this.presenterAPI.operatorScreenService.updateOperatorScreen(this.operatorScreen);
    }

    checkPassword($event: any) {
        if (this.operatorScreen && this.operatorScreen.parameters) {
            this.operatorScreen.parameters.tentativePassword = $event.srcElement.value;
            this.saveChanges();
        }
    }

    setStartSensor($event: any) {
        if (this.operatorScreen && this.operatorScreen.parameters) {
            this.operatorScreen.parameters.startDi = $event;
            this.saveChanges();
        }
    }

    setEndSensor($event: any) {
        if (this.operatorScreen && this.operatorScreen.parameters) {
            this.operatorScreen.parameters.endDi = $event;
            this.saveChanges();
        }
    }

    setPowerDo($event: any) {
        if (this.operatorScreen && this.operatorScreen.parameters) {
            this.operatorScreen.parameters.powerDo = $event;
            this.saveChanges();
        }
    }

    setSpeedAo($event: any) {
        if (this.operatorScreen && this.operatorScreen.parameters) {
            this.operatorScreen.parameters.speedAo = $event;
            this.saveChanges();
        }
    }

    setPowerService($event: any) {

        this.powerDoStatus = this.powerDoStatus == false ? true : false;
        this.powerDoStatusDisabled = true;

        this.ws.send(`set_standard_digital_out(${this.powerDo[2]}, ${this.powerDoStatus == false ? "False" : "True"})\n`)

        setTimeout(() => { this.powerDoStatusDisabled = false; }, 300)
        this.cd.detectChanges();

    }

    setSpeedService($event: any) {

        this.speedAoStatusDisabled = true;
        this.speedAoStatus = Number($event.srcElement.value);

        this.ws.send(`set_standard_analog_out(${this.speedAo[2]}, ${this.speedAoStatus / 100.0})\n`)

        setTimeout(() => { this.speedAoStatusDisabled = false; }, 300)
        this.cd.detectChanges();

    }

    async setStartPoint() {
        const waypoint = await this.presenterAPI.robotMoveService.openMoveScreen({
            moveScreenTarget: 'waypoint',
            moveScreenTargetLabel: ''
        })

        this.operatorScreen.parameters.startPstruct = waypoint;

        this.saveChanges();

    }

    async setEndPoint() {
        const waypoint = await this.presenterAPI.robotMoveService.openMoveScreen({
            moveScreenTarget: 'waypoint',
            moveScreenTargetLabel: ''
        })

        this.operatorScreen.parameters.endPstruct = waypoint;

        this.saveChanges();

    }

}
