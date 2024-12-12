import { Injectable } from '@angular/core';
import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserSession,
} from 'amazon-cognito-identity-js';
import AWS from 'aws-sdk';

@Injectable({
  providedIn: 'root'
})
export class CognitoService {

  private userPool: CognitoUserPool;
  private idToken: string | null = null;
  private mfaRequired: boolean = false;
  private cognitoUser: CognitoUser | null = null;

  constructor() {
    this.userPool = new CognitoUserPool({
      UserPoolId: 'your-user-pool-id',
      ClientId: 'your-app-client-id',
    });
  }

  // Sign In Method
  signIn(username: string, password: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const user = new CognitoUser({ Username: username, Pool: this.userPool });
      const authDetails = new AuthenticationDetails({ Username: username, Password: password });

      user.authenticateUser(authDetails, {
        onSuccess: (session: CognitoUserSession) => {
          this.cognitoUser = user;
          this.idToken = session.getIdToken().getJwtToken();
          // You can now store the token in localStorage or any other secure method
          AWS.config.update({
            region: 'your-region',
            credentials: new AWS.CognitoIdentityCredentials({
              IdentityPoolId: 'your-identity-pool-id',
              Logins: {
                [`cognito-idp.your-region.amazonaws.com/your-user-pool-id`]: this.idToken,
              },
            }),
          });
          resolve();
        },
        onFailure: (err) => {
          reject(err);
        },
        mfaRequired: (challengeName, challengeParameters) => {
          this.mfaRequired = true;
          reject('MFA required');
        },
      });
    });
  }

  // Handle MFA
  handleMFA(verificationCode: string): Promise<void> {
    if (this.mfaRequired && this.cognitoUser) {
      return new Promise((resolve, reject) => {
        this.cognitoUser.sendMFACode(verificationCode, {
          onSuccess: (session: CognitoUserSession) => {
            this.idToken = session.getIdToken().getJwtToken();
            AWS.config.update({
              region: 'your-region',
              credentials: new AWS.CognitoIdentityCredentials({
                IdentityPoolId: 'your-identity-pool-id',
                Logins: {
                  [`cognito-idp.your-region.amazonaws.com/your-user-pool-id`]: this.idToken,
                },
              }),
            });
            this.mfaRequired = false;
            resolve();
          },
          onFailure: (err) => {
            reject(err);
          },
        });
      });
    } else {
      return Promise.reject('MFA not required or user is not authenticated');
    }
  }
  

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.idToken;
  }

  // Log out
  logOut(): void {
    if (this.cognitoUser) {
      this.cognitoUser.signOut();
      this.idToken = null;
    }
  }

  // Get the authentication token
  getToken(): string | null {
    return this.idToken;
  }
}
