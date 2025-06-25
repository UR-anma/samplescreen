import { OperatorScreen, URVariable, Waypoint } from '@universal-robots/contribution-api';

export interface SamplescreenNode extends OperatorScreen {
  type: string;
  version: string;
  parameters: {
    password: string;
    tentativePassword: string;
    startDi: string;
    endDi: string;
    powerDo: string;
    speedAo: string;
    startPstruct: Waypoint | undefined;
    startPvar: URVariable | undefined;
    endPstruct: Waypoint | undefined;
    endPvar: URVariable | undefined;
  }
}
