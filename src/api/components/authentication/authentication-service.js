const authenticationRepository = require('./authentication-repository');
const { generateToken } = require('../../../utils/session-token');
const { passwordMatched } = require('../../../utils/password');

const maxLoginAttempts = 5;
const loginTimeout = 1800000;
const loginAttemptsExceeded = {};

/**
 * Check username and password for login.
 * @param {string} email - Email
 * @param {string} password - Password
 * @returns {object} An object containing, among others, the JWT token if the email and password are matched. Otherwise returns null.
 */
async function checkLoginCredentials(email, password) {
  if (!email || !password) {
    return null;
  }

  const user = await authenticationRepository.getUserByEmail(email);

  // We define default user password here as '<RANDOM_PASSWORD_FILTER>'
  // to handle the case when the user login is invalid. We still want to
  // check the password anyway, so that it prevents the attacker in
  // guessing login credentials by looking at the processing time.
  const userPassword = user ? user.password : '<RANDOM_PASSWORD_FILLER>';
  const passwordChecked = await passwordMatched(password, userPassword);

  if (user && passwordChecked) {
    await authenticationRepository.resetLoginAttempts(email);
    return {
      email: user.email,
      name: user.name,
      user_id: user.id,
      token: generateToken(user.email, user.id),
    };
  }
  return { ERROR: 'Wrong password. Try again' };
}

async function updateLoginAttempts(email, success) {
  try {
    const attemptData = await authenticationRepository.getLoginAttempts(email);

    if (attemptData) {
      if (success) {
        await authenticationRepository.deleteLoginAttempts(email);
      } else {
        attemptData.attempts += 1;
        attemptData.lastAttempt = Date.now();
        await authenticationRepository.updateLoginAttempts(attemptData);

        if (attemptData.attempts >= maxLoginAttempts) {
          throw new Error('Too many failed login attempts');
        }
      }
    } else {
      await authenticationRepository.createLoginAttempts({
        email,
        attempts: 1,
        lastAttempt: Date.now(),
      });
    }
  } catch (error) {
    console.error('Failed to update login attempt: ', error.message);
  }
}

module.exports = {
  checkLoginCredentials,
  updateLoginAttempts,
};
