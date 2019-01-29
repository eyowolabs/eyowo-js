const Eyowo = require('../dist/');

let client;

describe('CLIENT', () => {
  beforeEach(() => {
    client = new Eyowo.Client({
      appKey: 'ru6nmdqf9cqpyvz7b4ce2kj938w5gc3r',
      appSecret: 'zvze3bfmev5pxhexuzsjcrn6pjqwbspgnh43de9nkvkjeeq45qemudmzyvpanv5k',
      environment: 'sandbox',
    });
  });

  test('should not create client without app key', async () => {
    const cl = () => {
      new Eyowo.Client({
        appSecret: 'zvze3bfmev5pxhexuzsjcrn6pjqwbspgnh43de9nkvkjeeq45qemudmzyvpanv5k',
        environment: 'sandbox',
      });
    };

    expect(cl).toThrowError('App key is required');
  });

  test('should not create client without app secret', async () => {
    const cl = () => {
      new Eyowo.Client({
        appKey: 'ru6nmdqf9cqpyvz7b4ce2kj938w5gc3r',
        environment: 'sandbox',
      });
    };

    expect(cl).toThrowError('App secret is required');
  });

  test('should not create client without invalid environment', async () => {
    const cl = () => {
      new Eyowo.Client({
        appKey: 'ru6nmdqf9cqpyvz7b4ce2kj938w5gc3r',
        appSecret: 'zvze3bfmev5pxhexuzsjcrn6pjqwbspgnh43de9nkvkjeeq45qemudmzyvpanv5k',
        environment: 'badENVIRONMENT',
      });
    };

    expect(cl).toThrowError('Invalid environment');
  });

  test('should validate a user', async () => {
    const validateRequest = await client.Auth.validateUser({
      mobile: '2349090000000',
    });
    expect(validateRequest.success).toBe(true);
    expect(validateRequest.message).toBe('Validation successful');
    expect(validateRequest.data.user).toHaveProperty('mobile', '2349090000000');
    expect(validateRequest.data.user).toHaveProperty('id');
  });

  test('should not validate a user with a wrong mobile number', async () => {
    const validateRequest = await client.Auth.validateUser({
      mobile: '2349095800000',
    });
    expect(validateRequest.success).toBe(false);
    expect(validateRequest.error).toBe('This user does not exist');
  });

  test('should send an authentication request for SMS', async () => {
    const authRequest = await client.Auth.authenticateUser({
      mobile: '2349090000000',
      factor: 'sms',
    });
    expect(authRequest.success).toBe(true);
    expect(authRequest.message).toBe(
      'Please enter the passcode sent to 2349090000000. [Passcode: 111111]',
    );
  });

  test('should not send an authentication request without an authentication factor', async () => {
    const authRequest = client.Auth.authenticateUser({
      mobile: '2349090000000',
    });

    expect(authRequest).rejects.toThrow('Invalid authentication factor');
  });

  test('should not send an authentication request to an invalid phone number', async () => {
    const authRequest = await client.Auth.authenticateUser({
      mobile: '2349090000001',
      factor: 'sms',
    });

    expect(authRequest.success).toBe(false);
    expect(authRequest.error).toBe('This user does not exist');
  });

  test('should confirm an authentication request for SMS with valid passcode', async () => {
    const authRequest = await client.Auth.authenticateUser({
      mobile: '2349090000000',
      factor: 'sms',
      passcode: '111111',
    });

    expect(authRequest.success).toBe(true);
    expect(authRequest.message).toBe('Wallet added successfully');
    expect(authRequest.data).toHaveProperty('refreshToken');
    expect(authRequest.data).toHaveProperty('accessToken');
    expect(authRequest.data).toHaveProperty('expiresIn');
  });

  test('should not confirm an authentication request for SMS with invalid passcode', async () => {
    const authRequest = await client.Auth.authenticateUser({
      mobile: '2349090000000',
      factor: 'sms',
      passcode: '000000',
    });
    expect(authRequest.success).toBe(false);
    expect(authRequest.error).toBe('The passcode you entered is invalid');
  });

  test("should get a user's balance", async () => {
    await client.Auth.authenticateUser({
      mobile: '2349090000000',
      factor: 'sms',
    });

    const validateReq = await client.Auth.authenticateUser({
      mobile: '2349090000000',
      factor: 'sms',
      passcode: '111111',
    });

    const { accessToken } = validateReq.data;

    const balanceReq = await client.Users.getBalance({
      mobile: '2349090000000',
      accessToken,
    });

    expect(balanceReq.success).toBe(true);
    expect(balanceReq.data.user).toHaveProperty('id');
    expect(balanceReq.data.user).toHaveProperty('mobile', '2349090000000');
    expect(balanceReq.data.user).toHaveProperty('balance');
    expect(typeof balanceReq.data.user.balance).toBe('number');
  });

  test('should transfer from a wallet to an Eyowo account', async () => {
    await client.Auth.authenticateUser({
      mobile: '2349090000000',
      factor: 'sms',
    });

    const validateReq = await client.Auth.authenticateUser({
      mobile: '2349090000000',
      factor: 'sms',
      passcode: '111111',
    });

    const { accessToken } = validateReq.data;

    const transfersReq = await client.Users.transferToPhone({
      mobile: '2349090000000',
      amount: 1000000,
      accessToken,
    });

    expect(transfersReq.success).toBe(true);
    expect(transfersReq.message).toBe('Transaction successful');
    expect(transfersReq.data.transaction).toHaveProperty('reference');
    expect(transfersReq.data.transaction).toHaveProperty('amount', 1000000);
  });
});
