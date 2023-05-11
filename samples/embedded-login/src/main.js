import * as forgerock from '@forgerock/javascript-sdk';

/*
 * @forgerock/javascript-sdk
 *
 * index.html
 *
 * Copyright (c) 2020 ForgeRock. All rights reserved.
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */


const FATAL = 'Fatal';
forgerock.Config.set({
  clientId: 'MMForgeRockSampleSDK',
  //clientId: 'MyTestOauth',
  //client: 'ForgeRockSDKClient',
 // redirectUri: 'https://myforgebucket.s3.amazonaws.com/index.html',
  //redirectUri: 'http://localhost.com:8080/AM-7.3.0',
  redirectUri: 'https://sdkapp.example.com:8443/callback',
  scope: 'openid profile me.read email address phone',
  serverConfig: {
    baseUrl: 'https://prudential-forgerock-wav.caputils.com/am', 
    //baseUrl: 'https://sdkapp.example.com:8443/AM-7.3.0',
   // baseUrl: 'https://localhost.com:8443/AM-7.3.0',
    timeout: '5000'
  },
  realmPath: '/root',
  //realmPath: '/WorkingRealm',
  //tree: 'MyAuthTree',
  tree: 'sdkAuthenticationTree',
});

// Define custom handlers to render and submit each expected step
const handlers = {
  UsernamePassword: (step) => {
    const panel = document.querySelector('#UsernamePassword');
    panel.querySelector('.btn').addEventListener('click', () => {
      const nameCallback = step.getCallbackOfType('NameCallback');
      const passwordCallback = step.getCallbackOfType('PasswordCallback');
      nameCallback.setName(panel.querySelector('input[type=text]').value);
      passwordCallback.setPassword(panel.querySelector('input[type=password]').value);
      nextStep(step);
    });
  },
  Error: (step) => {
    document.querySelector('#Error span').innerHTML = step.getCode();
  },
  [FATAL]: (step) => {},
};

// Show only the view for this handler
const showStep = (handler) => {
  document.querySelectorAll('#steps > div').forEach((x) => x.classList.remove('active'));
  const panel = document.getElementById(handler);
  if (!panel) {
    console.error(`No panel with ID "${handler}"" found`);
    return false;
  }
  document.getElementById(handler).classList.add('active');
  return true;
};

const showUser = (user) => {
  document.querySelector('#User pre').innerHTML = JSON.stringify(user, null, 2);
  const panel = document.querySelector('#User');
  panel.querySelector('.btn').addEventListener('click', () => {
    logout();
  });
  showStep('User');
};

const getStage = (step) => {
  // Check if the step contains callbacks for capturing username and password
  const usernameCallbacks = step.getCallbacksOfType('NameCallback');
  const passwordCallbacks = step.getCallbacksOfType('PasswordCallback');

  if (usernameCallbacks.length && passwordCallbacks.length) {
    return 'UsernamePassword';
  }

  return undefined;
};

// Display and bind the handler for this stage
const handleStep = async (step) => {
  console.log(`i am here `, step.type);
  switch (step.type) {
    case 'LoginSuccess': {
      // If we have a session token, get user information
      const sessionToken = step.getSessionToken();
      console.log(`i am here sessionToken`, sessionToken);
      const tokens = await forgerock.TokenManager.getTokens();
      console.log(`i am here tokens`, tokens);
      const user = await forgerock.UserManager.getCurrentUser();
      return showUser(user);
    }

    case 'LoginFailure': {
      showStep('Error');
      handlers['Error'](step);
      return;
    }

    default: {
      const stage = getStage(step) || FATAL;
      if (!showStep(stage)) {
        showStep(FATAL);
        handlers[FATAL](step);
      } else {
        handlers[stage](step);
      }
    }
  }
};

const handleFatalError = (err) => {
  console.error('Fatal error', err);
  showStep(FATAL);
};

// Get the next step using the FRAuth API
const nextStep = (step) => {
  forgerock.FRAuth.next(step).then(handleStep).catch(handleFatalError);
};

const logout = async () => {
  try {
    await forgerock.FRUser.logout();
    location.reload(true);
  } catch (error) {
    console.error(error);
  }
};

// Begin the login flow
nextStep();

document.getElementById('Error').addEventListener('click', nextStep);
document.getElementById('start-over').addEventListener('click', nextStep);
document.getElementById('Fatal').addEventListener('click', nextStep);
