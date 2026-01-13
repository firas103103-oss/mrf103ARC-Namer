/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  FunctionCallingConfigMode,
  FunctionDeclaration,
  GoogleGenAI,
  Type,
} from '@google/genai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

function debug(...args: string[]) {
  const turn = document.createElement('pre');
  turn.textContent = args.join('');
  document.body.append(turn);
}

async function generateContent() {
  const ai = new GoogleGenAI({vertexai: false, apiKey: GEMINI_API_KEY});

  const controlLightFunctionDeclaration: FunctionDeclaration = {
    name: 'controlLight',
    parameters: {
      type: Type.OBJECT,
      description: 'Set the brightness and color temperature of a room light.',
      properties: {
        brightness: {
          type: Type.NUMBER,
          description:
            'Light level from 0 to 100. Zero is off and 100 is full brightness.',
        },
        colorTemperature: {
          type: Type.STRING,
          description:
            'Color temperature of the light fixture which can be `daylight`, `cool` or `warm`.',
        },
      },
      required: ['brightness', 'colorTemperature'],
    },
  };

  debug('Dim the lights so the room feels cozy and warm');

  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: 'Dim the lights so the room feels cozy and warm.',
    config: {
      tools: [{functionDeclarations: [controlLightFunctionDeclaration]}],
      toolConfig: {
        functionCallingConfig: {
          mode: FunctionCallingConfigMode.ANY,
          allowedFunctionNames: ['controlLight'],
        },
      },
    },
  });

  debug('Response');
  debug(JSON.stringify(response.functionCalls, null, 2));
}

async function main() {
  await generateContent().catch((e) => debug('got error', e));
}

main();
