/// <reference lib="webworker" />
import {
    OperatorScreenBehaviors, OptionalPromise,
    registerOperatorScreenBehavior,
    ScriptBuilder,
    URVariable,
    VariableValueType
} from '@universal-robots/contribution-api';
import { SamplescreenNode } from './samplescreen.node';

// factory is required
const createOperatorScreen = (): OptionalPromise<SamplescreenNode> => ({
    type: 'ur-samplescreen-samplescreen',    // type is required
    version: '1.4.0',     // version is required
    parameters: {
        password: "password",
        tentativePassword: "",
        startDi: "DI0",
        endDi: "DI1",
        powerDo: "DO0",
        speedAo: "AO0",
        startPstruct: undefined,
        startPvar: new URVariable("operatorScreenStartPoint", VariableValueType.WAYPOINT),
        endPstruct: undefined,
        endPvar: new URVariable("operatorScreenEndPoint", VariableValueType.WAYPOINT)
    }
});

// generatePreamble is optional
const generatePreambleScriptCode = (operatorScreen: SamplescreenNode) => {
    const builder = new ScriptBuilder();

    console.log("Operator screen code generation started")
    builder.addStatements("########## Operator screen contribution start ##########")
    console.log(operatorScreen)
    console.log(operatorScreen.parameters.startPstruct)
    if (operatorScreen.parameters.startPstruct != undefined) {
        console.log("P1")
        builder.addStatements("########## Operator screen contribution operatorScreenStartPoint ##########")
        builder.globalVariable("operatorScreenStartPoint", `{ p=${operatorScreen.parameters.startPstruct.pose}, 
        frame=${operatorScreen.parameters.startPstruct.frame}, q=${operatorScreen.parameters.startPstruct.qNear}}`)
    }
    if (operatorScreen.parameters.endPstruct) {
        console.log("P2")
        builder.addStatements("########## Operator screen contribution operatorScreenEndPoint ##########")
        builder.globalVariable("operatorScreenEndPoint", `{ p=${operatorScreen.parameters.endPstruct.pose}, 
        frame=${operatorScreen.parameters.endPstruct.frame}, q=${operatorScreen.parameters.endPstruct.qNear}}`)
    }
    builder.addStatements("########## Operator screen contribution end ##########")
    console.log("Operator screen code generation ended")

    return builder;
};

const behaviors: OperatorScreenBehaviors = {
    factory: createOperatorScreen,
    generatePreamble: generatePreambleScriptCode,
};

registerOperatorScreenBehavior(behaviors);
