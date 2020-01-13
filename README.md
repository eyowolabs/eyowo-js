# Eyowo Node.js Client 

A JavaScript client library for Eyowo Payment Service. 


## Installation

```script
npm i eyowo-js --save
```

## Basic Usage

### Authorisations

The Eyowo developer API utilizes your application key to authenticate API requests. Your app key should be sent via an X-App-Key HTTP request header as shown below:

X-App-Key: <APP_KEY>

In addition to your app secret there is one important headers to note when making direct HTTP calls. This is the X-App-Wallet-Access-Token header.


**X-App-Wallet-Access-Token:** This is a token belonging to an Eyowo user which gives you access to the wallet of a user. It is required for transaction types such as wallet to wallet transfers and wallet to bank transfers.

```js
const eyowo = require('eyowo-js');

const appKey = process.env.APP_KEY;
const appSecret = process.env.APP_SECRET;

const client = new eyowo.Client({
  appKey,
  appSecret,
  environment: 'production'
});
```


### Validating a User

Validate a user using their `phone number` 

```js 
const response = await client.validateUser({ mobile: '234XXXXXXXXX' });
```

**responses**
```shell
{
  "success": true,
  "data": {
    "user": {
      "id": "OKHN8E4SS",
      "mobile": "234XXXXXXXXX"
    }
  },
  "message": "Validation successful"
}
```

### Authenticating a User

To initiate a user login request, call the user login endpoint with the mobile and factor request attributes. Upon successful login initiation a passcode will be sent to the user's device via SMS. This passcode will be used in the login validation step.


```js
 const response = await client.authenticateUser(
      {
        mobile: '234XXXXXXXXX'
        factor: 'sms'
      });
```

**responses**
```shell
{
  "success": true,
  "message": "Please enter the passcode sent to 234XXXXXXXXX"
}
```

#### Authenticating with OTP

To complete the authentication the user needs to supply the the authentication OTP 

```js
 const response = await client.authenticateUser(
      {
        mobile: '234XXXXXXXXX',
        factor: 'sms',
        passcode: '12345'
      });
```

```shell
{
    "success": true,
    "message": "Wallet added successfully",
    "data": {
        "refreshToken": "5d07619d019bd118ae99786f3a34840d999b1e84",
        "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.-",
        "expiresIn": 86400
    }
}
```

### Query Wallet Balance
This is used to retrieve the wallet balance of an Eyowo user. 

```js
 const response = await client.getBalance(
      {
        mobile: '2348000000000',
        accessToken: '<X-App-Wallet-Access-Token>'
      });

```

**responses**
```
{
  "success": true,
  "data": {
    "user": {
      "id": "OKHN8E4SS",
      "mobile": "2348000000000",
      "balance": 526548935
    }
  }
}
```


