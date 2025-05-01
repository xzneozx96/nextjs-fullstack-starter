import buffer from 'node:buffer';
import crypto from 'node:crypto';

export function hashPassword(password: string, salt: string): Promise<string> {
  return new Promise((resolve, reject) => {
    crypto.scrypt(password.normalize(), salt, 64, (err, hash) => {
      if (err) {
        reject(err);
      } else {
        resolve(hash.toString('hex').normalize());
      }
    });
  });
}

export async function comparePasswords({
  password,
  salt,
  hashedPassword,
}: {
  password: string;
  salt: string;
  hashedPassword: string;
}) {
  const inputHashedPassword = await hashPassword(password, salt);

  return crypto.timingSafeEqual(
    buffer.Buffer.from(inputHashedPassword, 'hex'),
    buffer.Buffer.from(hashedPassword, 'hex'),
  );
}

export function generateSalt(): string {
  return crypto.randomBytes(16).toString('hex').normalize();
}
