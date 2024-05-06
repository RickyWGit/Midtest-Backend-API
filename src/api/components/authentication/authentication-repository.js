const { User, LoginAttempt } = require('../../../models');

/**
 * Get user by email for login information
 * @param {string} email - Email
 * @returns {Promise}
 */
async function getUserByEmail(email) {
  return User.findOne({ email });
}

async function tryLoginAttempt(email) {
  try {
    console.log('Login...');

    return true;
  } catch (err) {
    console.error('Login error');
    return false;
  }
}

async function resetLoginAttempts(email) {
  try {
    console.log('Resetting login attempts...');
    return true;
  } catch (err) {
    console.error('Failed to reset login', error.message);
    throw error;
  }
}

async function loginAttemptsExceeded(email) {
  console.log('Attempting to login');
}
module.exports = {
  getUserByEmail,
  tryLoginAttempt,
  resetLoginAttempts,
  loginAttemptsExceeded,
};
