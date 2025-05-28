const bcrypt = require('bcryptjs');

const plainPassword = 'admin123'; // 🔑 Replace with your desired password
const saltRounds = 10;

bcrypt.hash(plainPassword, saltRounds, (err, hashedPassword) => {
  if (err) {
    console.error('Error hashing password:', err);
  } else {
    console.log('Hashed password:', hashedPassword);
  }
});
